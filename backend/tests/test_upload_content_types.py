import io
import zipfile

import pytest
from docx import Document
from openpyxl import Workbook

from app.config.setting import settings
from app.core.exceptions import CustomException
from app.utils.upload_util import UploadUtil


@pytest.mark.parametrize("extension", [".xls", ".xlsx", ".docx", ".zip"])
def test_container_upload_and_download_preserve_content(test_client, auth_headers, tmp_path, monkeypatch, extension):
    monkeypatch.setattr(settings, "UPLOAD_FILE_PATH", tmp_path)
    monkeypatch.setattr(settings, "ALLOWED_EXTENSIONS", [".xls", ".xlsx", ".docx", ".zip"])
    buffer = io.BytesIO()
    if extension == ".xlsx":
        Workbook().save(buffer)
    elif extension == ".docx":
        Document().save(buffer)
    elif extension == ".zip":
        with zipfile.ZipFile(buffer, "w"):
            pass
    else:
        # XLS and DOC share this OLE signature; the upload endpoint does not parse documents.
        buffer.write(bytes.fromhex("d0cf11e0a1b11ae1") + bytes(504))
    content = buffer.getvalue()

    response = test_client.post(
        "/common/file/upload",
        headers=auth_headers,
        files={"file": (f"document{extension}", content)},
    )

    assert response.status_code == 200, response.text
    relative_path = response.json()["data"]["file_path"]
    assert (tmp_path / relative_path).read_bytes() == content
    download = test_client.post(
        "/common/file/download",
        headers=auth_headers,
        json={"file_path": relative_path},
    )
    assert download.status_code == 200
    assert download.content == content


def test_empty_zip_header_is_recognized():
    buffer = io.BytesIO()
    with zipfile.ZipFile(buffer, "w"):
        pass

    assert UploadUtil.detect_file_type(buffer.getvalue()) == "application/zip"


@pytest.mark.parametrize("empty_archive", [False, True])
@pytest.mark.parametrize("extension", [".png", ".pdf", ".doc", ".xls"])
def test_zip_header_cannot_masquerade_as_an_unrelated_format(extension, empty_archive):
    buffer = io.BytesIO()
    with zipfile.ZipFile(buffer, "w") as archive:
        if not empty_archive:
            archive.writestr("example.txt", "example")

    with pytest.raises(CustomException, match="文件内容与扩展名不匹配"):
        UploadUtil.validate_file_content_type(buffer.getvalue()[:8192], extension)


@pytest.mark.parametrize(
    ("extension", "upload_type"),
    [(".png", "file"), (".pdf", "file"), (".doc", "file"), (".xls", "file"), (".png", "avatar"), (".pdf", "resource")],
)
def test_empty_zip_disguised_upload_is_rejected_before_writing(test_client, auth_headers, tmp_path, monkeypatch, extension, upload_type):
    monkeypatch.setattr(settings, "UPLOAD_FILE_PATH", tmp_path)
    monkeypatch.setattr(settings, "ALLOWED_EXTENSIONS", [extension])
    buffer = io.BytesIO()
    with zipfile.ZipFile(buffer, "w"):
        pass

    response = test_client.post(
        "/common/file/upload",
        params={"upload_type": upload_type},
        headers=auth_headers,
        files={"file": (f"disguised{extension}", buffer.getvalue())},
    )

    assert response.status_code == 500, response.text
    assert "文件内容与扩展名不匹配" in response.json()["msg"]
    assert list(tmp_path.iterdir()) == []


@pytest.mark.parametrize("extension", [".doc", ".xls"])
def test_ole_header_accepts_both_supported_office_formats(extension):
    assert UploadUtil.validate_file_content_type(bytes.fromhex("d0cf11e0a1b11ae1"), extension)
