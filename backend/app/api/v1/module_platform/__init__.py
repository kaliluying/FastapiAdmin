from fastapi import APIRouter

from app.api.v1.module_platform.menu.controller import MenuRouter

platform_router = APIRouter(prefix="/platform")

platform_router.include_router(MenuRouter)
