from fastapi import APIRouter

from .file.controller import FileRouter
from .monitoring import DashboardRouter, HealthRouter

common_router = APIRouter(prefix="/common")

common_router.include_router(FileRouter)
common_router.include_router(HealthRouter)
common_router.include_router(DashboardRouter)
