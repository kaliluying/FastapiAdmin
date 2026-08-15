import mimetypes
from pathlib import Path

from fastapi import UploadFile

from app.config.setting import settings
from app.core.base_schema import DownloadFileSchema, UploadResponseSchema
from app.core.exceptions import CustomException
from app.core.logger import logger
from app.utils.upload_util import UploadUtil


class FileService:
    """
    文件管理服务层
    """

    @staticmethod
    def _resolve_upload_path(file_path: str, *, public_images_only: bool = False) -> tuple[Path, str]:
        """Resolve a user-supplied upload reference within the storage root.

        Args:
            file_path: Relative upload path or a legacy absolute path.
            public_images_only: Restrict public references to avatar/param
                image directories and raster image extensions.

        Returns:
            The resolved file path and its private-root-relative POSIX path.

        Raises:
            CustomException: If the path escapes storage or does not exist.
        """
        if not file_path:
            raise CustomException(msg="请选择要访问的文件", status_code=400)

        upload_root = settings.UPLOAD_FILE_PATH.resolve()
        raw_path = Path(file_path)
        candidate = raw_path if raw_path.is_absolute() else upload_root / raw_path
        resolved = candidate.resolve()
        try:
            relative_path = resolved.relative_to(upload_root).as_posix()
        except ValueError as exc:
            logger.warning("文件路径不在私有上传目录内")
            raise CustomException(msg="非法的文件路径", status_code=400) from exc

        parts = Path(relative_path).parts
        if public_images_only:
            if not parts or parts[0] not in {"avatar", "param"}:
                raise CustomException(msg="该文件不允许公开预览", status_code=400)
            if Path(relative_path).suffix.lower() not in {".gif", ".jpg", ".jpeg", ".png", ".ico"}:
                raise CustomException(msg="该文件不允许公开预览", status_code=400)

        if not resolved.is_file():
            raise CustomException(msg="文件不存在", status_code=404)
        return resolved, relative_path

    @classmethod
    async def upload_service(
        cls,
        base_url: str,
        file: UploadFile,
        upload_type: str = "file",
        target_path: str | None = None,
    ) -> UploadResponseSchema:
        """上传文件"""
        
        filename, filepath, file_url = await UploadUtil.upload_file(
            file=file,
            base_url=base_url,
            upload_type=upload_type,
            target_path=target_path,
        )

        return UploadResponseSchema(
            file_path=filepath.resolve().relative_to(settings.UPLOAD_FILE_PATH.resolve()).as_posix(),
            file_name=filename,
            origin_name=file.filename,
            file_url=f"{file_url}",
        )

    @classmethod
    async def download_service(cls, file_path: str) -> DownloadFileSchema:
        """下载文件"""

        if not file_path:
            raise CustomException(msg="请选择要下载的文件", status_code=400)

        candidate, _ = cls._resolve_upload_path(file_path)

        file_name = UploadUtil.download_file(str(candidate))

        return DownloadFileSchema(
            file_path=str(candidate),
            file_name=str(file_name),
        )

    @classmethod
    async def preview_service(cls, file_path: str, *, public_images_only: bool = False) -> tuple[Path, str]:
        """Resolve an inline-preview file without exposing server paths.

        Args:
            file_path: Private-root-relative path returned by upload.
            public_images_only: Apply the anonymous image-only policy.

        Returns:
            A resolved file path and safe media type for ``FileResponse``.
        """
        candidate, relative_path = cls._resolve_upload_path(
            file_path,
            public_images_only=public_images_only,
        )
        media_type = mimetypes.guess_type(relative_path)[0] or "application/octet-stream"
        if public_images_only and not media_type.startswith("image/"):
            raise CustomException(msg="该文件不允许公开预览", status_code=400)
        return candidate, media_type
