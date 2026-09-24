from fastapi import APIRouter

from app.api.v1.module_system.auth.controller import AuthRouter
from app.api.v1.module_system.log import LogRouter
from app.api.v1.module_system.role.controller import RoleRouter
from app.api.v1.module_system.user.controller import UserRouter

system_router = APIRouter(prefix="/system")

system_router.include_router(AuthRouter)
system_router.include_router(LogRouter)
system_router.include_router(RoleRouter)
system_router.include_router(UserRouter)
