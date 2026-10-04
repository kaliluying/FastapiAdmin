"""可复制的业务模块范例，通过应用入口显式注册。"""

from fastapi import APIRouter

from .category.controller import CategoryRouter

demo_router = APIRouter(prefix="/demo")
demo_router.include_router(CategoryRouter)
