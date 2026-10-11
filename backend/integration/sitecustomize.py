"""Keep nested bootstrap subprocesses away from repository environment files and storage."""

import os
import tempfile
from pathlib import Path

if os.environ.get("FASTCORE_INTEGRATION_ROOT"):
    root = Path(os.environ["FASTCORE_INTEGRATION_ROOT"]).resolve()
    if not root.is_relative_to(Path(tempfile.gettempdir()).resolve()) or not root.name.startswith("fastcore-integration-"):
        raise RuntimeError("Invalid disposable integration root")
    from app.config import path_conf

    path_conf.ENV_DIR = root / "environment"
    path_conf.LOG_DIR = root / "logs"
    path_conf.UPLOAD_DIR = root / "uploads"
    path_conf.DOWNLOAD_DIR = root / "downloads"
