from fastapi import APIRouter

from app.api.v1.module_platform.menu.controller import MenuRouter
from app.api.v1.module_platform.tenant.controller import TenantRouter

platform_router = APIRouter(prefix="/platform")

platform_router.include_router(TenantRouter)
platform_router.include_router(MenuRouter)
