from fastapi import APIRouter

from .file.controller import FileRouter
from .monitoring import HealthRouter

common_router = APIRouter(prefix="/common")
health_router = APIRouter(prefix="/common")

common_router.include_router(FileRouter)
health_router.include_router(HealthRouter)
