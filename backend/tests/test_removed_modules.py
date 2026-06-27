import json
from pathlib import Path

from fastapi.testclient import TestClient

REMOVED_MENU_MARKERS = {
    "/generator",
    "/generator/gencode",
    "module_generator:gencode:query",
    "module_generator/gencode/index",
    "/monitor",
    "/monitor/online",
    "module_monitor:online:query",
    "module_monitor/cache/index",
    "module_monitor/online/index",
    "module_monitor/resource/index",
    "module_monitor/server/index",
    "/swagger",
    "/swagger/docs",
    "/example",
    "/example/demo-center/demo",
    "/task",
    "/task/cronjob",
    "/task/workflow",
    "module_task:cronjob:job:query",
    "module_task:cronjob:node:query",
    "module_task:workflow:definition:query",
    "module_task:workflow:node-type:query",
    "module_task/cronjob/job/index",
    "module_task/cronjob/node/index",
    "module_task/workflow/definition/index",
    "module_task/workflow/node-type/index",
    "module_swagger:docs:query",
    "module_swagger:redoc:query",
    "module_swagger/docs/index",
    "module_swagger/redoc/index",
    "module_example:demo:query",
    "module_example/demo/index",
}


def _flatten_menu_values(node: object) -> list[str]:
    values: list[str] = []
    if isinstance(node, dict):
        for value in node.values():
            values.extend(_flatten_menu_values(value))
    elif isinstance(node, list):
        for item in node:
            values.extend(_flatten_menu_values(item))
    elif isinstance(node, str):
        values.append(node)
    return values


def test_removed_modules_are_absent_from_menu_seed() -> None:
    menu_path = Path(__file__).parents[1] / "app" / "scripts" / "data" / "platform_menu.json"
    menu_data = json.loads(menu_path.read_text(encoding="utf-8"))
    values = set(_flatten_menu_values(menu_data))

    assert values.isdisjoint(REMOVED_MENU_MARKERS)


def test_example_api_routes_are_not_registered(
    test_client: TestClient,
    auth_headers: dict[str, str],
) -> None:
    response = test_client.get("/example/demo/list", headers=auth_headers)

    assert response.status_code == 404


def test_monitor_api_routes_are_not_registered(
    test_client: TestClient,
    auth_headers: dict[str, str],
) -> None:
    response = test_client.get("/monitor/cache/info", headers=auth_headers)

    assert response.status_code == 404




def test_generator_api_routes_are_not_registered(
    test_client: TestClient,
    auth_headers: dict[str, str],
) -> None:
    response = test_client.get("/generator/gencode/list", headers=auth_headers)

    assert response.status_code == 404


def test_task_api_routes_are_not_registered(
    test_client: TestClient,
    auth_headers: dict[str, str],
) -> None:
    response = test_client.get("/task/cronjob/job/scheduler/status", headers=auth_headers)

    assert response.status_code == 404
