"""复制项目后，在这里显式增删业务模块；保留对应的历史迁移。"""

INSTALLED_MODULES = (
    "app.api.v1.module_demo.module:get_module",
    "app.api.v1.module_dashboard.dashboard:get_module",
    "app.plugin.module_ai.module:get_module",
)
