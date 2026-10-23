"""验证验收超时会回收自行创建会话的后代服务。"""

import json
import socket
import subprocess
import sys
import tempfile
import time
import unittest
from pathlib import Path

from processes import run_isolated


class ProcessCleanupTests(unittest.TestCase):
    def test_timeout_stops_detached_descendant_listener(self) -> None:
        with tempfile.TemporaryDirectory(prefix="fastcore-process-test-") as temporary:
            ready = Path(temporary) / "listener.json"
            child = (
                "import json,signal,socket,sys,time;"
                "from pathlib import Path;"
                "signal.signal(signal.SIGTERM,signal.SIG_IGN);"
                "s=socket.socket();s.bind(('127.0.0.1',0));s.listen();"
                "Path(sys.argv[1]).write_text(json.dumps({'port':s.getsockname()[1]}));"
                "time.sleep(60)"
            )
            parent = (
                "import subprocess,sys,time;"
                "subprocess.Popen([sys.executable,'-c',sys.argv[1],sys.argv[2]],start_new_session=True);"
                "time.sleep(60)"
            )
            with self.assertRaises(subprocess.TimeoutExpired):
                run_isolated([sys.executable, "-c", parent, child, str(ready)], timeout=2)
            port = json.loads(ready.read_text())["port"]
            deadline = time.monotonic() + 2
            while True:
                with socket.socket() as probe:
                    probe.settimeout(1)
                    if probe.connect_ex(("127.0.0.1", port)) != 0:
                        break
                self.assertLess(time.monotonic(), deadline, "超时后后代服务仍在监听")
                time.sleep(0.01)

    def test_exit_code_is_preserved(self) -> None:
        result = run_isolated([sys.executable, "-c", "raise SystemExit(7)"], timeout=2)
        self.assertEqual(result.returncode, 7)
