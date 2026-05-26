"""依赖注入容器

使用 dependency-injector 管理应用依赖，为后续 Repository 模式迁移提供基础。

当前状态：容器框架已搭建，但现有代码仍可直接使用 CRUDBase。
Phase 2 将逐步迁移 Service 层使用容器注入的 Repository。

用法:
    from app.core.di import container

    # 通过容器获取依赖
    event_bus = container.event_bus()
"""

from dependency_injector import containers, providers

from app.config.setting import get_settings


class ApplicationContainer(containers.DeclarativeContainer):
    """全局依赖注入容器

    管理应用的各层依赖：
    - 配置
    - 基础设施（Redis、数据库会话由 FastAPI Depends 管理）
    - Repository（Phase 2 实现）
    - Domain Services（Phase 3 实现）
    """

    # ==================== 配置 ====================
    config = providers.Singleton(get_settings)

    # ==================== 基础设施（待后续 Phase 启用） ====================
    # redis_client = providers.Singleton(RedisClient)
    # cache_manager = providers.Singleton(CacheManager, redis=redis_client)
    # event_bus = providers.Singleton(EventBus)
    # task_queue = providers.Singleton(TaskQueue)

    # ==================== Repository（Phase 2 实现） ====================
    # user_repository = providers.Factory(UserRepositoryImpl)
    # role_repository = providers.Factory(RoleRepositoryImpl)


# 全局容器单例
container = ApplicationContainer()
