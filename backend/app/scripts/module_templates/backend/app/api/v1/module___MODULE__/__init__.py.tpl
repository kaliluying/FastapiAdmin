"""业务模块，通过应用入口显式注册。"""

from fastapi import APIRouter

from .__RESOURCE__.controller import __RESOURCE_CLASS__Router

__MODULE___router = APIRouter(prefix="/__MODULE__")
__MODULE___router.include_router(__RESOURCE_CLASS__Router)
