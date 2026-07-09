from enum import Enum
from typing import Protocol


class RET(Enum):
    """
    系统返回码枚举

    0~200: 成功状态码
    400~600: HTTP标准错误码
    4000+: 自定义业务错误码
    """

    # 成功状态码
    OK = (0, "成功")
    SUCCESS = (200, "操作成功")
    CREATED = (201, "创建成功")
    ACCEPTED = (202, "请求已接受")
    NO_CONTENT = (204, "操作成功,无返回数据")

    # HTTP标准错误码
    ERROR = (1, "请求错误")
    BAD_REQUEST = (400, "参数错误")
    UNAUTHORIZED = (401, "未授权")
    FORBIDDEN = (403, "访问受限")
    NOT_FOUND = (404, "资源不存在")
    BAD_METHOD = (405, "不支持的请求方法")
    NOT_ACCEPTABLE = (406, "不接受的请求")
    CONFLICT = (409, "资源冲突")
    GONE = (410, "资源已删除")
    PRECONDITION_FAILED = (412, "前提条件失败")
    UNSUPPORTED_MEDIA_TYPE = (415, "不支持的媒体类型")
    UNPROCESSABLE_ENTITY = (422, "无法处理的实体")
    TOO_MANY_REQUESTS = (429, "请求过于频繁")

    # 服务器错误码
    INTERNAL_SERVER_ERROR = (500, "服务器内部错误")
    NOT_IMPLEMENTED = (501, "功能未实现")
    BAD_GATEWAY = (502, "网关错误")
    SERVICE_UNAVAILABLE = (503, "服务不可用")
    GATEWAY_TIMEOUT = (504, "网关超时")
    HTTP_VERSION_NOT_SUPPORTED = (505, "HTTP版本不支持")

    # 自定义业务错误码
    EXCEPTION = (-1, "系统异常")
    DATAEXIST = (4003, "数据已存在")
    DATAERR = (4004, "数据错误")
    PARAMERR = (4103, "参数错误")
    IOERR = (4302, "IO错误")
    SERVERERR = (4500, "服务错误")
    UNKOWNERR = (4501, "未知错误")
    TIMEOUT = (4502, "请求超时")
    RATE_LIMIT_EXCEEDED = (4503, "访问频率超限")

    # Token相关错误码
    INVALID_TOKEN = (4504, "无效令牌")
    EXPIRED_TOKEN = (4505, "令牌过期")

    def __init__(self, code: int, msg: str) -> None:
        """
        初始化返回码。

        参数:
        - code (int): 错误码。
        - msg (str): 错误信息。

        返回:
        - None
        """
        self._code = code
        self._msg = msg

    @property
    def code(self) -> int:
        """
        获取错误码。

        返回:
        - int: 错误码数值。
        """
        return self._code

    @property
    def msg(self) -> str:
        """
        获取错误信息。

        返回:
        - str: 错误信息文本。
        """
        return self._msg


class CommonConstant:
    """
    常用常量

    WWW: www主域名
    HTTP: http请求
    HTTPS: https请求
    LOOKUP_RMI: RMI远程方法调用
    LOOKUP_LDAP: LDAP远程方法调用
    LOOKUP_LDAPS: LDAPS远程方法调用
    YES: 是否为系统默认（是）
    NO: 是否为系统默认（否）
    DEPT_NORMAL: 部门正常状态
    DEPT_DISABLE: 部门停用状态
    UNIQUE: 校验是否唯一的返回标识（是）
    NOT_UNIQUE: 校验是否唯一的返回标识（否）
    """

    # 域名相关
    WWW = "www."
    HTTP = "http://"
    HTTPS = "https://"

    # 系统标识
    YES = "Y"
    NO = "N"

    # 部门状态
    DEPT_NORMAL = "0"  # 正常
    DEPT_DISABLE = "1"  # 停用

    # 唯一性校验
    UNIQUE = True
    NOT_UNIQUE = False


class MenuConstant:
    """
    菜单常量

    TYPE_DIR: 菜单类型（目录）
    TYPE_MENU: 菜单类型（菜单）
    TYPE_BUTTON: 菜单类型（按钮）
    YES_FRAME: 是否菜单外链（是）
    NO_FRAME: 是否菜单外链（否）
    LAYOUT: Layout组件标识
    PARENT_VIEW: ParentView组件标识
    INNER_LINK: InnerLink组件标识
    """

    TYPE_DIR = "M"
    TYPE_MENU = "C"
    TYPE_BUTTON = "F"
    YES_FRAME = 0
    NO_FRAME = 1
    LAYOUT = "Layout"
    PARENT_VIEW = "ParentView"
    INNER_LINK = "InnerLink"


class TypedContextProtocol(Protocol):
    """
    请求上下文中与日志/鉴权相关的结构化字段协议（供类型检查使用）。
    """

    perf_time: float

    ip: str
    country: str | None
    region: str | None
    city: str | None

    user_agent: str
    os: str | None
    browser: str | None
    device: str | None

    permission: str | None


# API 日期 / 时间 / 日期时间统一展示（validator、jsonable_response_content、文档约定一致）
DATE_DISPLAY_FMT = "%Y-%m-%d"
TIME_DISPLAY_FMT = "%H:%M:%S"
DATETIME_DISPLAY_FMT = "%Y-%m-%d %H:%M:%S"


# if __name__ == "__main__":
#     print(RET.OK.msg)  # 输出: 成功
