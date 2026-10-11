from types import SimpleNamespace
from unittest.mock import Mock

import pytest
from conftest import assert_route


def test_success_is_required_by_default() -> None:
    client = SimpleNamespace(request=Mock(return_value=SimpleNamespace(status_code=200)))
    assert_route(client, "GET", "/example")


def test_server_error_cannot_pass_as_an_existing_route() -> None:
    client = SimpleNamespace(request=Mock(return_value=SimpleNamespace(status_code=500)))
    with pytest.raises(AssertionError, match="期望 200，实际 500"):
        assert_route(client, "GET", "/example")


def test_request_exceptions_are_not_swallowed() -> None:
    client = SimpleNamespace(request=Mock(side_effect=RuntimeError("request failed")))
    with pytest.raises(RuntimeError, match="request failed"):
        assert_route(client, "GET", "/example")


def test_explicit_validation_status_and_headers_are_preserved() -> None:
    client = SimpleNamespace(request=Mock(return_value=SimpleNamespace(status_code=422)))
    assert_route(client, "POST", "/example", expected_status=422, auth={"Authorization": "fixture-only"}, headers={"X-Test": "route"}, json={})
    client.request.assert_called_once_with("POST", "/example", headers={"X-Test": "route", "Authorization": "fixture-only"}, json={})
