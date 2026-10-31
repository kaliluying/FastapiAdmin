import mimetypes
from pathlib import Path

from fastapi import UploadFile

from app.config.setting import settings
from app.core.base_schema import DownloadFileSchema, UploadResponseSchema
from app.core.exceptions import CustomException
from app.core.logger import logger
from app.utils.upload_util import UploadUtil


class FileService:
    """文件管理服务层。"""

    @staticmethod
    def _resolve_upload_path(file_path: str, *, public_images_only: bool = False) -> tuple[Path, str]:
        """将用户提供的上传文件引用解析到存储根目录内。

        Args:
            file_path: 相对上传路径或旧版绝对路径。
            public_images_only: 是否仅允许 avatar 图片目录及栅格图片扩展名。

        Returns:
            解析后的文件路径及相对于私有根目录的 POSIX 路径。

        Raises:
            CustomException: 路径越出存储目录或文件不存在。
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
            if not parts or parts[0] != "avatar":
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
        """上传文件。"""
        
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
        """下载文件。"""

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
        """解析内联预览文件，避免暴露服务器路径。

        Args:
            file_path: 上传接口返回的私有根目录相对路径。
            public_images_only: 是否采用匿名访问仅允许图片的策略。

        Returns:
            解析后的文件路径及可安全用于 ``FileResponse`` 的媒体类型。
        """
        candidate, relative_path = cls._resolve_upload_path(
            file_path,
            public_images_only=public_images_only,
        )
        media_type = mimetypes.guess_type(relative_path)[0] or "application/octet-stream"
        if public_images_only and not media_type.startswith("image/"):
            raise CustomException(msg="该文件不允许公开预览", status_code=400)
        return candidate, media_type
