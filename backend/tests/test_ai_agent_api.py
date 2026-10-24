from uuid import uuid4

import pytest


def payload(**values):
    return {"request_id": uuid4().hex, "goal": "检查日志 token=fixture-secret", "use_runtime_logs": True, **values}


def test_submission_is_idempotent_and_rejects_reused_payload(test_client, auth_headers):
    data = payload()
    first = test_client.post("/ai/agent/runs", headers=auth_headers, json=data)
    assert first.status_code == 200, first.text
    run = first.json()["data"]
    assert "fixture-secret" not in run["goal"]
    second = test_client.post("/ai/agent/runs", headers=auth_headers, json=data)
    assert second.status_code == 200
    assert second.json()["data"]["run_id"] == run["run_id"]
    conflict = test_client.post("/ai/agent/runs", headers=auth_headers, json={**data, "goal": "different"})
    assert conflict.status_code == 409
    test_client.post(f"/ai/agent/runs/{run['run_id']}/cancel", headers=auth_headers)


def test_cancel_is_durable_idempotent_and_private_fields_are_not_exposed(test_client, auth_headers):
    response = test_client.post("/ai/agent/runs", headers=auth_headers, json=payload())
    assert response.status_code == 200, response.text
    identifier = response.json()["data"]["run_id"]
    path = f"/ai/agent/runs/{identifier}"
    for _ in range(2):
        cancelled = test_client.post(path + "/cancel", headers=auth_headers)
        assert cancelled.status_code == 200
        assert cancelled.json()["data"]["status"] == "cancelled"
    detail = test_client.get(path, headers=auth_headers).json()["data"]
    assert detail["last_seq"] == 1 and len(detail["events"]) == 1
    assert detail["events"][0]["type"] == "cancelled"
    assert not {"session_id", "token", "messages", "user_id", "request_id"} & detail.keys()
    delta = test_client.get(path + "?after_seq=1", headers=auth_headers).json()["data"]
    assert delta["events"] == [] and delta["last_seq"] == 1
    listed = test_client.get("/ai/agent/runs", headers=auth_headers).json()["data"]
    assert any(item["run_id"] == identifier for item in listed)


@pytest.mark.parametrize("changes", [
    {"goal": " "}, {"goal": "a" * 4001}, {"use_runtime_logs": False},
    {"knowledge_base_ids": [True]}, {"knowledge_base_ids": [-1]},
    {"knowledge_base_ids": list(range(1, 12))}, {"extra": "forbidden"},
    {"request_id": "../invalid"}, {"use_runtime_logs": "true"},
])
def test_input_boundary(test_client, auth_headers, changes):
    response = test_client.post("/ai/agent/runs", headers=auth_headers, json=payload(**changes))
    assert response.status_code == 422, response.text


def test_unavailable_sources_and_authentication(test_client, auth_headers):
    assert test_client.post("/ai/agent/runs", json=payload()).status_code == 401
    response = test_client.post("/ai/agent/runs", headers=auth_headers, json=payload(use_runtime_logs=False, knowledge_base_ids=[2147483647]))
    assert response.status_code == 403
    assert test_client.get("/ai/agent/runs/missing", headers=auth_headers).status_code == 404
    assert test_client.post("/ai/agent/runs/missing/cancel", headers=auth_headers).status_code == 404
