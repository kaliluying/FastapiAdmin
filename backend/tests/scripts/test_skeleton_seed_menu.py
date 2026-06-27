import json
from pathlib import Path

REMOVED_KEYWORDS = {
    "tenant",
    "ticket",
    "notice",
    "position",
    "monitor",
    "analysis",
    "screen",
    "workplace",
}


def flatten(items):
    for item in items:
        yield item
        yield from flatten(item.get("children", []))


def test_seed_menu_contains_only_skeleton_and_ai_knowledge_routes():
    path = Path("app/scripts/data/platform_menu.json")
    data = json.loads(path.read_text(encoding="utf-8"))
    serialized_routes = "\n".join(
        str(item.get("route_path", ""))
        + "\n"
        + str(item.get("component_path", ""))
        + "\n"
        + str(item.get("permission", ""))
        for item in flatten(data)
    ).lower()
    for keyword in REMOVED_KEYWORDS:
        assert keyword not in serialized_routes

    assert "module_ai" in serialized_routes
    assert "knowledge" in serialized_routes
    assert "retrieval" in serialized_routes
    assert "????" not in path.read_text(encoding="utf-8")
