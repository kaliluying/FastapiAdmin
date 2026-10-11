import shutil
import subprocess
import tempfile
from pathlib import Path

import anyio
from docx import Document
from docx.table import Table
from pypdf import PdfReader


class DocumentExtractionError(ValueError):
    """A safe, actionable document parsing failure for users."""


def _ocr_pdf_page(path: Path, page_number: int) -> str:
    renderer, recognizer = shutil.which("pdftoppm"), shutil.which("tesseract")
    if not renderer or not recognizer:
        raise DocumentExtractionError("扫描 PDF 需要 OCR：请管理员安装 Poppler（pdftoppm）和 Tesseract 及中文/英文语言包后重新索引。")
    try:
        languages = subprocess.run([recognizer, "--list-langs"], check=True, capture_output=True, text=True, timeout=10).stdout.splitlines()
        selected = [language for language in ("chi_sim", "eng") if language in languages]
        if not selected:
            raise DocumentExtractionError("OCR 缺少中文或英文语言包，请管理员安装 chi_sim 或 eng 后重新索引。")
        with tempfile.TemporaryDirectory(prefix="knowledge-ocr-") as directory:
            image = Path(directory) / "page"
            subprocess.run([renderer, "-f", str(page_number), "-l", str(page_number), "-singlefile", "-scale-to", "2400", "-png", str(path), str(image)], check=True, capture_output=True, timeout=60)
            result = subprocess.run([recognizer, str(image.with_suffix(".png")), "stdout", "-l", "+".join(selected)], check=True, capture_output=True, text=True, timeout=60)
            return result.stdout.strip()
    except (subprocess.SubprocessError, OSError):
        raise DocumentExtractionError("扫描 PDF 文字识别失败或超时，请检查 OCR 工具与文件，或拆分文档后重新上传。") from None


def _extract_text_sync(path: str | Path) -> str:
    file_path = Path(path)
    suffix = file_path.suffix.lower()
    if suffix in {".txt", ".md"}:
        return file_path.read_text(encoding="utf-8", errors="ignore")
    if suffix == ".pdf":
        reader = PdfReader(str(file_path))
        if len(reader.pages) > 500:
            raise DocumentExtractionError("PDF 超过 500 页，请拆分文档后重新上传。")
        texts = []
        ocr_pages = 0
        for number, page in enumerate(reader.pages, 1):
            text = page.extract_text() or ""
            # Empty pages without images stay empty; scanned pages require actual OCR.
            if not text.strip() and len(page.images):
                ocr_pages += 1
                if ocr_pages > 50:
                    raise DocumentExtractionError("扫描 PDF 超过 50 页，请拆分文档后重新上传。")
                text = _ocr_pdf_page(file_path, number)
                if not text:
                    raise DocumentExtractionError(f"扫描 PDF 第 {number} 页未识别到文字，请检查扫描清晰度后重新上传。")
            texts.append(text)
        return "\n".join(texts)
    if suffix == ".docx":
        document = Document(str(file_path))
        texts = []
        for block in document.iter_inner_content():
            if isinstance(block, Table):
                for row in block.rows:
                    # Merged cells may appear repeatedly in the row's cell sequence.
                    seen = set()
                    cells = []
                    for cell in row.cells:
                        if cell._tc not in seen:
                            seen.add(cell._tc)
                            cells.append(cell.text)
                    texts.append("\t".join(cells))
            else:
                texts.append(block.text)
        return "\n".join(texts)
    raise ValueError(f"unsupported knowledge document type: {suffix}")


async def extract_text(path: str | Path) -> str:
    return await anyio.to_thread.run_sync(_extract_text_sync, path)
