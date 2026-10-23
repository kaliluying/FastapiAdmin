"""Keep AI dependency directions and common infrastructure boundaries explicit."""

import ast
from importlib.util import resolve_name
from pathlib import Path

import pytest

APP = Path(__file__).parents[1] / "app"
AI = "app.plugin.module_ai"
AI_DEPENDENCIES = {
    "chat": {"memory.public", "knowledge.public"},
    "memory": set(),
    "knowledge": set(),
    "quality": {"chat.public", "knowledge.public", "knowledge.service", "knowledge.schema"},
}


def imports(source: str, module: str, *, package: bool = False):
    parent = module if package else module.rpartition(".")[0]
    for node in ast.walk(ast.parse(source)):
        if isinstance(node, ast.Import):
            for alias in node.names:
                yield alias.name, node.lineno
        elif isinstance(node, ast.ImportFrom):
            base = "." * node.level + (node.module or "")
            base = resolve_name(base, parent) if node.level else base
            for alias in node.names:
                yield f"{base}.{alias.name}", node.lineno


def file_imports(path: Path):
    module = "app." + ".".join(path.relative_to(APP).with_suffix("").parts)
    package = path.name == "__init__.py"
    if package:
        module = module.removesuffix(".__init__")
    return imports(path.read_text(encoding="utf-8"), module, package=package)


@pytest.mark.parametrize("source", AI_DEPENDENCIES)
def test_ai_submodules_use_public_interfaces_in_one_direction(source):
    violations = []
    for path in (APP / "plugin/module_ai" / source).rglob("*.py"):
        for target, line in file_imports(path):
            if not target.startswith(f"{AI}."):
                continue
            sibling = target.removeprefix(f"{AI}.").split(".")[0]
            if sibling not in AI_DEPENDENCIES or sibling == source:
                continue
            if not any(target == f"{AI}.{allowed}" or target.startswith(f"{AI}.{allowed}.") for allowed in AI_DEPENDENCIES[source]):
                violations.append(f"{path.relative_to(APP)}:{line} -> {target}")
    assert not violations, "\n".join(violations)


def test_common_infrastructure_does_not_import_business_modules():
    violations = []
    for path in (APP / "api/v1/module_common").rglob("*.py"):
        for target, line in file_imports(path):
            if target.startswith("app.plugin.module_ai") or (
                target.startswith("app.api.v1.module_") and not target.startswith("app.api.v1.module_common")
            ):
                violations.append(f"{path.relative_to(APP)}:{line} -> {target}")
    assert not violations, "\n".join(violations)


@pytest.mark.parametrize("statement", [
    "from app.plugin.module_ai.chat.model import ChatSessionModel",
    "from ..chat.model import ChatSessionModel",
    "from ..chat import model",
    "from .. import chat",
    "import app.plugin.module_ai.chat.model as chat_model",
    "def load():\n    from ..chat import model",
])
def test_import_check_resolves_absolute_relative_and_local_imports(statement):
    targets = {target for target, _ in imports(statement, f"{AI}.memory.worker")}
    assert any(target == f"{AI}.chat" or target.startswith(f"{AI}.chat.") for target in targets)
