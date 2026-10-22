from math import ceil
from typing import NoReturn

from fastapi import Request, Response
from starlette.websockets import WebSocket

from app.core.exceptions import CustomException


def http_limit_callback(request: Request, response: Response, expire: int) -> NoReturn:
    """HTTP 触发限流时的默认回调：抛出 429。

    Args:
        request (Request): 当前请求。
        response (Response): 当前响应（未直接使用，保留与限流器签名一致）。
        expire (int): 剩余冷却毫秒数。

    Raises:
        CustomException: 请求触发限流，返回 429 状态和剩余冷却时间。
    """
    expires = ceil(expire / 1000)
    raise CustomException(
        status_code=429,
        msg="请求过于频繁，请稍后重试！",
        data={"Retry-After": str(expires)},
    )


async def ws_limit_callback(ws: WebSocket, expire: int) -> None:
    """WebSocket 触发限流时的默认回调：关闭连接。

    Args:
        ws (WebSocket): 当前 WebSocket。
        expire (int): 剩余冷却毫秒数。
    """
    expires = ceil(expire / 1000)
    await ws.close(code=1008, reason=f"请求过于频繁，请稍后重试！{expires} 秒后重试")
