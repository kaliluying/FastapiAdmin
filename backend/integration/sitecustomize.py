"""在嵌套初始化进程导入配置前重定向环境文件和存储目录。"""

import json
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
    (root / f"isolation-{os.getpid()}.json").write_text(json.dumps({
        "pid": os.getpid(), "module_entry": os.sys.argv[0] == "-m",
        "environment": str(path_conf.ENV_DIR), "logs": str(path_conf.LOG_DIR),
        "uploads": str(path_conf.UPLOAD_DIR), "downloads": str(path_conf.DOWNLOAD_DIR),
    }), encoding="utf-8")
