from fastapi import APIRouter

from .file.controller import FileRouter
from .monitoring import health_router

common_router = APIRouter(prefix="/common")

common_router.include_router(FileRouter)
common_router.include_router(health_router)
