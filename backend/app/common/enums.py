from enum import Enum, unique


@unique
class EnvironmentEnum(str, Enum):
    """应用运行环境（开发 / 生产）。"""

    DEV = "dev"
    PROD = "prod"


@unique
class RedisInitKeyConfig(Enum):
    """系统内置Redis键名枚举"""

    ACCESS_TOKEN = {"key": "access_token", "remark": "登录令牌信息"}
    REFRESH_TOKEN = {"key": "refresh_token", "remark": "刷新令牌信息"}
    USER_SESSION = {"key": "user_session", "remark": "用户会话信息"}
    CAPTCHA_CODES = {"key": "captcha_codes", "remark": "图片验证码"}
    SYSTEM_CONFIG = {"key": "system_config", "remark": "系统配置"}
    SYSTEM_DICT = {"key": "system_dict", "remark": "数据字典"}
    @property
    def key(self) -> str:
        """
        获取 Redis 键名。

        返回:
        - str: 键名字符串。
        """
        return self.value.get("key", "")

    @property
    def remark(self) -> str:
        """
        获取 Redis 键说明。

        返回:
        - str: 说明文案。
        """
        return self.value.get("remark", "")


@unique
class QueueEnum(str, Enum):
    """队列枚举"""

    none = "None"
    not_none = "not None"
    date = "date"
    month = "month"
    like = "like"
    eq = "eq" or "=="
    in_ = "in"
    between = "between"
    ne = "!=" or "ne"
    gt = ">" or "gt"
    ge = ">=" or "ge"
    lt = "<" or "lt"
    le = "<=" or "le"


class PermissionFilterStrategy(str, Enum):
    """
    权限过滤策略枚举

    每个策略对应一种过滤实现，模型通过 ``__permission_strategy__`` 选择。
    注意：``DATA_SCOPE`` 基于角色的 ``data_scope`` 字段决定仅本人或全部数据。
    """

    DATA_SCOPE = "data_scope"  # 数据范围权限分发器（默认）
    MENU_AUTH = "menu_auth"  # 菜单授权（用于 MenuModel，按角色-菜单绑定过滤）
    OWN = "own"  # 仅本人数据
    USER_BINDING = "user_binding"  # 用户绑定角色（用于 RoleModel，仅显示当前用户绑定的角色）
