# -*- coding: utf-8 -*-
"""
集中式路由发现与注册

约定：
- 仅扫描 `app.api.v1` 包内，顶级目录以 `module_` 开头的模块。
- 在各模块任意子目录下的 `controller.py` 中定义的 `APIRouter` 实例会自动被注册。
- 顶级目录 `module_xxx` 会映射为容器路由前缀 `/<xxx>`。

设计目标：
- 稳定、可预测：有序扫描与注册，确定性日志输出。
- 简洁、易维护：职责拆分成小函数，类型提示与清晰注释。
- 安全、可控：去重处理、异常分层记录、可配置的前缀映射与忽略规则。
- 灵活、可扩展：基于类的设计，支持配置自定义和实例化多套路由系统。
"""

# 标准库导入
from __future__ import annotations
import importlib
import traceback
from enum import Enum
from pathlib import Path
from typing import Callable, Iterable, Any, TypeVar, ParamSpec, Optional, Dict, Tuple, Set, List
from functools import wraps

# 第三方库导入
from fastapi import APIRouter

# 内部库导入
from app.core.logger import log


P = ParamSpec("P")
R = TypeVar("R")


def _log_error_handling(func: Callable[P, R]) -> Callable[P, R | None]:
    """错误处理装饰器，用于统一捕获和记录方法执行过程中的异常"""
    @wraps(func)
    def wrapper(*args: P.args, **kwargs: P.kwargs) -> R | None:
        method_name = func.__name__
        try:
            return func(*args, **kwargs)
        except ModuleDiscoveryError as e:
            # 自定义异常，已经包含详细信息
            log.error(f"❌️ {method_name}: {str(e)}")
            return None
        except ModuleNotFoundError as e:
            log.error(f"❌️ 模块未找到 [{method_name}]: {str(e)}")
            return None
        except ImportError as e:
            log.error(f"❌️ 导入错误 [{method_name}]: {str(e)}")
            return None
        except AttributeError as e:
            log.error(f"❌️ 属性错误 [{method_name}]: {str(e)}")
            return None
        except PermissionError as e:
            log.error(f"❌️ 权限错误 [{method_name}]: {str(e)}")
            return None
        except Exception as e:
            log.error(f"❌️ 未知错误 [{method_name}]: {str(e)}")
            # 在调试模式下打印完整堆栈信息
            log.error(traceback.format_exc())
            return None
    return wrapper


class ModuleDiscoveryError(Exception):
    """模块发现过程中发生的基础异常"""
    pass


class PackageLocationError(ModuleDiscoveryError):
    """无法定位包路径的异常"""
    def __init__(self, package_name: str, reason: str):
        super().__init__(f"无法定位包 '{package_name}' 的路径: {reason}")
        self.package_name = package_name
        self.reason = reason


class ControllerNotFoundError(ModuleDiscoveryError):
    """找不到控制器文件的异常"""
    def __init__(self, base_dir: Path):
        super().__init__(f"在目录 '{base_dir}' 下未找到任何 controller.py 文件")
        self.base_dir = base_dir


class ModuleImportError(ModuleDiscoveryError):
    """模块导入异常"""
    def __init__(self, module_path: str, original_error: Exception):
        super().__init__(f"导入模块 '{module_path}' 失败: {original_error}")
        self.module_path = module_path
        self.original_error = original_error


class RouterRegistrationError(ModuleDiscoveryError):
    """路由注册异常"""
    def __init__(self, router_name: str, module_name: str, reason: str):
        super().__init__(f"路由 '{router_name}' 在模块 '{module_name}' 中注册失败: {reason}")
        self.router_name = router_name
        self.module_name = module_name
        self.reason = reason


class InvalidPathError(ModuleDiscoveryError):
    """无效路径异常"""
    def __init__(self, path: str, reason: str):
        super().__init__(f"路径 '{path}' 无效: {reason}")
        self.path = path
        self.reason = reason


class DiscoverRouter:
    """
    路由自动发现与注册器
    
    提供基于约定的路由自动发现与注册功能，支持自定义配置和灵活扩展。
    """
    
    def __init__(
        self,
        module_prefix: str = "module_",
        base_package: str = "app.api.v1",
        prefix_map: Optional[Dict[str, str]] = None,
        exclude_dirs: Optional[Set[str]] = None,
        exclude_files: Optional[Set[str]] = None,
        controller_filename: str = "controller.py",
        auto_discover: bool = True,
        debug: bool = False,
        root_router_tags: Optional[List[str | Enum]] = None,
        container_router_tags: Optional[Dict[str, List[str | Enum]]] = None,
        router: Optional[APIRouter] = None,
        on_router_registered: Optional[Callable[[str, APIRouter], None]] = None
    ) -> None:
        """
        初始化路由发现注册器
        
        参数:
        - module_prefix: 模块目录前缀，默认为 "module_"
        - base_package: 基础包名，默认为 "app.api.v1"
        - prefix_map: 前缀映射字典，用于自定义路由前缀
        - exclude_dirs: 排除的目录集合
        - exclude_files: 排除的文件集合
        - controller_filename: 控制器文件名，默认为 "controller.py"
        - auto_discover: 是否在初始化时自动执行发现和注册，默认为 True
        - debug: 是否启用调试模式，在调试模式下会输出更详细的错误信息，默认为 False
        - root_router_tags: 根路由的标签列表
        - container_router_tags: 容器路由的标签映射字典
        - router: 可选的根路由实例，用于依赖注入（测试时使用）
        - on_router_registered: 可选的回调函数，在路由注册后调用
        """
        # 核心配置
        self.module_prefix = module_prefix
        self.base_package = base_package
        self.controller_filename = controller_filename
        
        # 映射和排除规则
        self.prefix_map = prefix_map or {}
        self.exclude_dirs = exclude_dirs or set()
        self.exclude_files = exclude_files or set()
        
        # 路由配置
        self.root_router_tags = root_router_tags or []
        self.container_router_tags = container_router_tags or {}
        
        # 调试和自动发现
        self.debug = debug
        self.auto_discover = auto_discover
        
        # 测试钩子
        self._on_router_registered = on_router_registered
        
        # 内部状态
        # 支持依赖注入自定义路由实例（用于测试）
        self._router = router or APIRouter(tags=self.root_router_tags)
        self._seen_router_ids: Set[int] = set()
        self._discovery_stats: Dict[str, int] = {
            "scanned_files": 0,
            "imported_modules": 0,
            "included_routers": 0,
            "container_count": 0
        }
        
        # 记录初始化配置
        log.debug(
            "🚀 初始化路由发现注册器: "
            f"基础包={self.base_package}, "
            f"模块前缀={self.module_prefix}, "
            f"控制器文件名={self.controller_filename}, "
            f"排除目录={self.exclude_dirs}, "
            f"排除文件={self.exclude_files}, "
            f"自动发现={self.auto_discover}, "
            f"调试模式={self.debug}, "
            f"使用自定义路由={router is not None}"
        )
        
        # 自动执行发现和注册
        if self.auto_discover:
            log.info("✨ 启动自动路由发现与注册")
            self.discover_and_register()
    
    @property
    def router(self) -> APIRouter:
        """获取根路由实例"""
        return self._router
    
    @property
    def discovery_stats(self) -> dict[str, int]:
        """获取路由发现统计信息"""
        return self._discovery_stats.copy()
    
    @_log_error_handling
    def _get_base_package_info(self) -> Optional[Tuple[Path, str]]:
        """定位基础包的文件系统路径与包名。

        返回:
        - Optional[Tuple[Path, str]]: (包的路径, 包名) 或 None（如果出错）
        """
        try:
            base_package = importlib.import_module(self.base_package)
            
            # 检查是否为有效的包
            if not hasattr(base_package, "__path__"):
                raise PackageLocationError(
                    package_name=self.base_package,
                    reason="不是一个有效的 Python 包"
                )
            
            # 获取包的文件系统路径
            try:
                # 使用 Walrus Operator 优化路径解析和验证
                if not (base_dir := Path(next(iter(base_package.__path__)))).exists():
                    raise PackageLocationError(
                        package_name=self.base_package,
                        reason=f"包路径不存在: {base_dir}"
                    )
                
                log.debug(f"📁 基础包名: {base_package.__name__}, 路径: {base_dir}")
                return base_dir, base_package.__name__
            except StopIteration:
                raise PackageLocationError(
                    package_name=self.base_package,
                    reason="无法获取包路径（空的 __path__）"
                )
                
        except ImportError as e:
            raise PackageLocationError(
                package_name=self.base_package,
                reason=f"导入失败: {e}"
            )
    
    def _find_controller_files(self, base_dir: Path) -> Iterable[Path]:
        """递归查找并返回所有控制器文件，按路径排序保证确定性。

        参数:
        - base_dir: 要搜索的基础目录

        返回:
        - Iterable[Path]: 找到的控制器文件路径列表
        """
        try:
            # 使用 rglob 递归查找所有控制器文件
            controller_files = sorted(
                base_dir.rglob(self.controller_filename), 
                key=lambda p: p.as_posix()  # 按路径字符串排序确保确定性
            )
            
            if not controller_files:
                log.debug(f"🔍 在 {base_dir} 下未找到任何 {self.controller_filename} 文件")
                return []
                
            log.debug(f"🔍 在 {base_dir} 下找到 {len(controller_files)} 个 {self.controller_filename} 文件")
            return controller_files
        except PermissionError as e:
            log.error(f"❌️ 权限错误: 无法访问目录 {base_dir}: {str(e)}")
            return []
        except Exception as e:
            log.error(f"❌️ 查找 {self.controller_filename} 文件失败: {str(e)}")
            if self.debug:
                log.error(traceback.format_exc())
            return []
    
    def _resolve_router_prefix(self, top_module: str) -> Optional[str]:
        """将顶级模块目录名解析为容器路由前缀。

        参数:
        - top_module: 顶级模块目录名

        返回:
        - Optional[str]: 解析后的路由前缀，或 None（如果应排除该模块）
        """
        # 检查是否在排除目录列表中
        if top_module in self.exclude_dirs:
            log.debug(f"⚠️ 目录 {top_module} 被排除")
            return None
            
        # 检查是否符合模块前缀约定
        if not top_module.startswith(self.module_prefix):
            log.debug(f"⚠️ 目录 {top_module} 不符合前缀约定（必须以 {self.module_prefix} 开头）")
            return None
        
        # 检查是否有自定义前缀映射
        if mapped_prefix := self.prefix_map.get(top_module):
            log.debug(f"🔄 模块 {top_module} 映射到自定义前缀 {mapped_prefix}")
            return mapped_prefix
        
        # 使用默认前缀规则
        default_prefix = f"/{top_module[len(self.module_prefix):]}"
        log.debug(f"📋 模块 {top_module} 使用默认前缀 {default_prefix}")
        return default_prefix
    
    @_log_error_handling
    def _register_module_routers(self, module: object, container: APIRouter) -> int:
        """将模块中的所有 `APIRouter` 实例注册到指定容器路由中。

        参数:
        - module: 要注册路由的模块对象
        - container: 目标容器路由实例

        返回:
        - int: 新增注册的路由数量
        """
        added_routers = 0
        module_name = getattr(module, "__name__", "<unknown>")
        total_routers = 0
        
        # 遍历模块的所有属性，查找 APIRouter 实例
        for attr_name in dir(module):
            try:
                # 只调用一次 getattr，提高性能
                attr_value = getattr(module, attr_name)
                
                # 检查是否为 APIRouter 实例
                if isinstance(attr_value, APIRouter):
                    total_routers += 1
                    router_id = id(attr_value)
                    
                    # 检查是否已注册，避免重复
                    if router_id in self._seen_router_ids:
                        log.debug(f"⚠️ 路由 {attr_name} 在模块 {module_name} 中已注册，跳过重复注册")
                        continue
                    
                    # 注册路由
                    self._seen_router_ids.add(router_id)
                    container.include_router(attr_value)
                    added_routers += 1
                    
                    log.debug(f"📌 注册路由 {attr_name} 到容器 {container.prefix}")
            except AttributeError:
                # 跳过无法访问的属性
                continue
        
        # 记录模块路由统计信息
        if total_routers == 0:
            log.debug(f"⚠️ 模块 {module_name} 中未发现接口路由，跳过注册")
        else:
            log.debug(f"📊 模块 {module_name} 中有 {total_routers} 个路由，注册了 {added_routers} 个新路由")
        
        return added_routers
    
    def discover_and_register(self) -> Dict[str, int]:
        """
        执行路由发现与注册
        
        返回:
        - Dict[str, int]: 包含发现统计信息的字典
            - scanned_files: 扫描的文件数量
            - imported_modules: 导入的模块数量
            - included_routers: 注册的路由数量
            - container_count: 容器数量
        """
        log.info("🚀 开始路由发现与注册服务...")
        
        # 重置统计信息
        self._discovery_stats = {
            "scanned_files": 0,
            "imported_modules": 0,
            "included_routers": 0,
            "container_count": 0
        }
        
        # 获取基础目录和包名
        base_package_info = self._get_base_package_info()
        if not base_package_info:
            log.error("❌️ 无法获取基础包信息，路由发现失败")
            return self._discovery_stats
            
        base_dir, base_pkg = base_package_info
        router_containers: Dict[str, APIRouter] = {}
        container_router_counts: Dict[str, int] = {}

        try:
            # 查找所有 controller.py 文件
            controller_files = self._find_controller_files(base_dir)
            
            for file in controller_files:
                rel_path = file.relative_to(base_dir).as_posix()
                self._discovery_stats["scanned_files"] += 1

                # 检查是否在排除文件列表中
                if rel_path in self.exclude_files:
                    log.warning(f"⚠️ 排除文件: {rel_path}")
                    continue

                # 解析文件路径
                path_parts = file.relative_to(base_dir).parts
                if len(path_parts) < 2:
                    log.warning(f"⚠️ 跳过不完整路径: {rel_path}")
                    continue

                # 获取顶级模块名和路由前缀
                top_module = path_parts[0]
                router_prefix = self._resolve_router_prefix(top_module)
                if not router_prefix:
                    continue

                # 解析模块名（去除文件扩展名）
                controller_module_name = file.stem
                # 拼接模块导入路径
                module_path = ".".join((base_pkg,) + tuple(path_parts[:-1]) + (controller_module_name,))
                
                try:
                    # 导入模块
                    module = importlib.import_module(module_path)
                    self._discovery_stats["imported_modules"] += 1
                    log.debug(f"📥 导入模块: {module_path}")
                    
                    # 获取或创建容器路由
                    if router_prefix not in router_containers:
                        # 获取当前前缀对应的标签
                        tags = self.container_router_tags.get(router_prefix, [])
                        # 创建容器路由
                        container = APIRouter(prefix=router_prefix, tags=tags)
                        router_containers[router_prefix] = container
                    else:
                        container = router_containers[router_prefix]
                    
                    # 注册模块中的路由
                    added_routers = self._register_module_routers(module, container)
                    # 确保 added_routers 是整数（处理装饰器可能返回 None 的情况）
                    added_routers = added_routers if added_routers is not None else 0
                    self._discovery_stats["included_routers"] += added_routers
                    container_router_counts[router_prefix] = container_router_counts.get(router_prefix, 0) + added_routers
                except Exception as e:
                    log.error(f"❌️ 导入或注册模块失败: {module_path} -> {str(e)}")
                    if self.debug:
                        log.error(traceback.format_exc())
                    continue

            # 将容器路由按前缀名称排序后注册到根路由，保证顺序稳定
            for prefix in sorted(router_containers.keys()):
                container = router_containers[prefix]
                container_id = id(container)
                
                # 避免重复注册容器
                if container_id not in self._seen_router_ids:
                    self._seen_router_ids.add(container_id)
                    self._router.include_router(container)
                    self._discovery_stats["container_count"] += 1
                    
                    # 记录容器注册信息
                    route_count = container_router_counts.get(prefix, 0)
                    log.info(f"✅️ 注册分系统容器: {prefix} (包含路由数: {route_count})")
                    
                    # 调用路由注册回调（测试钩子）
                    if self._on_router_registered:
                        try:
                            self._on_router_registered(prefix, container)
                        except Exception as e:
                            log.error(f"❌️ 执行路由注册回调失败: {str(e)}")
                            if self.debug:
                                log.error(traceback.format_exc())

            # 生成总结日志
            stats = self._discovery_stats
            log.info(
                f"✅️ 路由发现与注册服务完成: "
                f"扫描 {stats['scanned_files']} 个文件, "
                f"导入 {stats['imported_modules']} 个模块, "
                f"注册 {stats['included_routers']} 个路由, "
                f"创建 {stats['container_count']} 个分系统容器"
            )
            
        except Exception as e:
            log.error(f"❌️ 路由发现与注册过程失败: {str(e)}")
            if self.debug:
                log.error(traceback.format_exc())
        
        return self._discovery_stats
    
    def set_debug(self, debug: bool) -> 'DiscoverRouter':
        """设置调试模式
        
        参数:
        - debug: 是否开启调试模式
        
        返回:
        - self: 支持链式调用
        """
        self.debug = debug
        log_level = "DEBUG" if debug else "INFO"
        log.debug(f"⚙️ 调试模式已{'开启' if debug else '关闭'}，日志级别: {log_level}")
        return self
    
    def add_exclude_dir(self, dir_name: str) -> 'DiscoverRouter':
        """添加排除的目录
        
        参数:
        - dir_name: 要排除的目录名称
        
        返回:
        - self: 支持链式调用
        """
        self.exclude_dirs.add(dir_name)
        log.debug(f"📝 添加排除目录: {dir_name}")
        return self
    
    def add_prefix_map(self, module_name: str, prefix: str) -> 'DiscoverRouter':
        """添加前缀映射
        
        参数:
        - module_name: 模块名称
        - prefix: 对应的路由前缀
        
        返回:
        - self: 支持链式调用
        """
        self.prefix_map[module_name] = prefix
        log.debug(f"📝 添加前缀映射: {module_name} -> {prefix}")
        return self
    
    @_log_error_handling
    def register_router(self, router: APIRouter, tags: list[str | Enum] | None = None) -> bool:
        """手动注册一个路由实例
        
        参数:
        - router: 要注册的 APIRouter 实例
        - tags: 路由标签，用于 API 文档分组
        
        返回:
        - bool: 注册是否成功
        """
        if not isinstance(router, APIRouter):
            log.error(f"❌️ 无效的路由实例: {type(router)}")
            return False
            
        rid = id(router)
        if rid not in self._seen_router_ids:
            self._seen_router_ids.add(rid)
            self._router.include_router(router, tags=tags)
            log.debug(f"📌 手动注册路由，标签: {tags or '无'}")
            return True
        else:
            log.warning(f"⚠️ 路由已存在，跳过重复注册")
            return False


# 创建默认实例并执行自动发现注册
_discoverer = DiscoverRouter()

# 保持向后兼容，导出原始的 router 变量
router = _discoverer.router

# 导出 DiscoverRouter 类供外部使用
__all__ = ["DiscoverRouter", "router", "ModuleDiscoveryError"]