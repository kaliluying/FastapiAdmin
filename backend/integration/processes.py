"""管理验收进程树，避免超时后遗留本机服务或浏览器。"""

import os
import signal
import subprocess
from contextlib import suppress


def run_isolated(command: list[str], *, timeout: float, **kwargs) -> subprocess.CompletedProcess:
    """在独立会话运行命令，超时时回收会话及当时仍可追踪的后代进程组。"""
    process = subprocess.Popen(command, start_new_session=True, **kwargs)
    try:
        return subprocess.CompletedProcess(command, process.wait(timeout=timeout))
    finally:
        # shortcut: 不追踪已主动守护化并脱离父链的新会话，需要覆盖该场景时改用外部进程监督器。
        rows = [tuple(map(int, line.split())) for line in subprocess.check_output(
            ["ps", "-axo", "pid=,ppid=,pgid="], text=True,
        ).splitlines()]
        descendants = {process.pid}
        while True:
            children = {pid for pid, parent, _ in rows if parent in descendants}
            if children <= descendants:
                break
            descendants |= children
        # Chrome 等后代可能自行创建会话，需要连同这些进程组一起回收。
        groups = {group for pid, _, group in rows if pid in descendants} | {process.pid}
        assert os.getpgrp() not in groups, "拒绝向验收器自身的进程组发送信号"
        signalled = False
        for group in groups:
            with suppress(ProcessLookupError):
                os.killpg(group, signal.SIGTERM)
                signalled = True
        if signalled:
            # macOS 对只含未回收僵尸的进程组可能返回 EPERM，先回收直接子进程。
            with suppress(subprocess.TimeoutExpired):
                process.wait(timeout=0.3)
        for group in groups:
            with suppress(ProcessLookupError):
                os.killpg(group, signal.SIGKILL)
        process.wait(timeout=5)
