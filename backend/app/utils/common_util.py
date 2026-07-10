import importlib
import uuid
from collections.abc import Generator, Sequence
from pathlib import Path
from typing import Any

from sqlalchemy.orm import DeclarativeBase

from app.config.setting import settings
from app.core.exceptions import CustomException
from app.core.logger import logger


def import_module(module: str, desc: str) -> Any:
    """
    动态导入模块

    参数:
    - module (str): 模块名称。
    - desc (str): 模块描述。

    返回:
    - Any: 模块对象。
    """
    try:
        module_path, module_class = module.rsplit(".", 1)
        module = importlib.import_module(module_path)  # pyright: ignore[reportAssignmentType]
        return getattr(module, module_class)
    except ModuleNotFoundError:
        logger.error(f"❗️ 导入{desc}失败,未找到模块:{module}")
        raise
    except AttributeError:
        logger.error(f"❗ ️导入{desc}失败,未找到模块方法:{module}")
        raise


async def import_modules_async(modules: list, desc: str, **kwargs) -> None:
    """
    异步导入模块列表

    参数:
    - modules (list[str]): 模块列表。
    - desc (str): 模块描述。
    - kwargs: 额外参数。

    返回:
    - None
    """
    for module in modules:
        if not module:
            continue
        try:
            module_path = module[0 : module.rindex(".")]
            module_name = module[module.rindex(".") + 1 :]
            module_obj = importlib.import_module(module_path)
            await getattr(module_obj, module_name)(**kwargs)
        except ModuleNotFoundError:
            logger.error(f"❌️ 导入{desc}失败,未找到模块:{module}")
            raise
        except AttributeError:
            logger.error(f"❌️ 导入{desc}失败,未找到模块方法:{module}")
            raise


def get_random_character() -> str:
    """
    生成随机字符串

    返回:
    - str: 随机字符串。
    """
    return uuid.uuid4().hex


def uuid4_str() -> str:
    """
    数据库引擎 UUID 类型兼容：返回无连字符的 UUID 字符串。

    返回:
    - str: UUID 字符串。
    """
    return str(uuid.uuid4())


def get_parent_id_map(model_list: Sequence[DeclarativeBase]) -> dict[int, int]:
    """
    获取父级 ID 映射字典

    参数:
    - model_list (Sequence[DeclarativeBase]): 模型列表。

    返回:
    - Dict[int, int]: {id: parent_id} 映射字典。
    """
    return {item.id: item.parent_id for item in model_list}  # pyright: ignore[reportAttributeAccessIssue]


def get_parent_recursion(
    id: int, id_map: dict[int, int], ids: list[int] | None = None
) -> list[int]:
    """
    递归获取所有父级 ID

    参数:
    - id (int): 当前 ID。
    - id_map (dict[int, int]): ID 映射字典。
    - ids (list[int] | None): 已收集的 ID 列表。

    返回:
    - list[int]: 所有父级 ID 列表。
    """
    ids = ids or []
    if id in ids:
        raise CustomException(msg="递归获取父级ID失败,不可以自引用")
    ids.append(id)
    parent_id = id_map.get(id)
    if parent_id:
        get_parent_recursion(parent_id, id_map, ids)
    return ids


def get_child_id_map(
    model_list: Sequence[DeclarativeBase],
) -> dict[int, list[int]]:
    """
    获取子级 ID 映射字典

    参数:
    - model_list (Sequence[DeclarativeBase]): 模型列表。

    返回:
    - Dict[int, List[int]]: {id: [child_ids]} 映射字典。
    """
    data_map = {}
    for model in model_list:
        data_map.setdefault(model.id, [])  # pyright: ignore[reportAttributeAccessIssue]
        if model.parent_id:  # pyright: ignore[reportAttributeAccessIssue]
            data_map.setdefault(model.parent_id, []).append(model.id)  # pyright: ignore[reportAttributeAccessIssue]
    return data_map


def get_child_recursion(
    id: int, id_map: dict[int, list[int]], ids: list[int] | None = None
) -> list[int]:
    """
    递归获取所有子级 ID

    参数:
    - id (int): 当前 ID。
    - id_map (dict[int, list[int]]): ID 映射字典。
    - ids (list[int] | None): 已收集的 ID 列表。

    返回:
    - list[int]: 所有子级 ID 列表。
    """
    ids = ids or []
    ids.append(id)
    for child in id_map.get(id, []):
        get_child_recursion(child, id_map, ids)
    return ids


def traversal_to_tree(nodes: list[dict[str, Any]]) -> list[dict[str, Any]]:
    """
    通过遍历算法构造树形结构

    参数:
    - nodes (list[dict[str, Any]]): 树节点列表。

    返回:
    - list[dict[str, Any]]: 构造后的树形结构列表。
    """
    tree: list[dict[str, Any]] = []
    node_dict = {node["id"]: node for node in nodes}

    for node in nodes:
        # 确保每个节点都有children字段，即使没有子节点也设置为null
        if "children" not in node:
            node["children"] = None

        parent_id = node["parent_id"]
        if parent_id is None:
            tree.append(node)
        else:
            parent_node = node_dict.get(parent_id)
            if parent_node is not None:
                if "children" not in parent_node or parent_node["children"] is None:
                    parent_node["children"] = []
                if node not in parent_node["children"]:
                    parent_node["children"].append(node)
            else:
                if node not in tree:
                    tree.append(node)

    # 确保所有节点都有children字段
    for node in tree:
        if "children" not in node:
            node["children"] = None

    return tree



def bytes2human(n: int, format_str: str = "%(value).1f%(symbol)s") -> str:
    """
    字节数转人类可读格式
    Used by various scripts. See:
    http://goo.gl/zeJZl

    >>> bytes2human(10000)
    '9.8K'
    >>> bytes2human(100001221)
    '95.4M'

    参数:
    - n (int): 字节数。
    - format_str (str): 格式化字符串，默认 '%(value).1f%(symbol)s'。

    返回:
    - str: 可读的字节字符串，如 '1.5MB'。
    """
    symbols = ("B", "KB", "MB", "GB", "TB", "PB", "EB", "ZB", "YB")
    prefix = {s: 1 << (i + 1) * 10 for i, s in enumerate(symbols[1:])}
    for symbol in reversed(symbols[1:]):
        if n >= prefix[symbol]:
            value = float(n) / prefix[symbol]
            return format_str % locals()
    return format_str % {"symbol": symbols[0], "value": n}


def bytes2file_response(bytes_info: bytes) -> Generator[bytes, Any, None]:
    """
    将字节内容封装为单块流式生成器，供文件下载响应使用。

    参数:
    - bytes_info (bytes): 文件二进制内容。

    返回:
    - Generator[bytes, Any, None]: 仅 yield 一次的字节生成器。
    """
    yield bytes_info


def get_filepath_from_url(url: str) -> Path:
    """
    工具方法：根据请求参数获取文件路径

    参数:
    - url (str): 请求参数中的 url 参数。

    返回:
    - Path: 文件路径。
    """
    file_info = url.split("?")[1].split("&")
    task_id = file_info[0].split("=")[1]
    file_name = file_info[1].split("=")[1]
    task_path = file_info[2].split("=")[1]
    filepath = settings.STATIC_ROOT.joinpath(task_path, task_id, file_name)

    return filepath
