"""
module_platform API route tests.

Only menu remains registered after removing tenant/package/order/payment/refund/invoice/plugin platform business modules.
"""

from conftest import assert_route
from fastapi.testclient import TestClient


class TestRemovedTenantRoutes:
    """Tenant management routes should stay unregistered."""

    def test_tenant_routes_are_removed(self, test_client: TestClient, auth_headers: dict) -> None:
        assert_route(test_client, "GET", "/platform/tenant/list", expected_status=404, auth=auth_headers)
        assert_route(test_client, "GET", "/platform/tenant/detail/1", expected_status=404, auth=auth_headers)
        assert_route(test_client, "POST", "/platform/tenant/create", expected_status=404, auth=auth_headers, json={})
        assert_route(test_client, "PUT", "/platform/tenant/update/1", expected_status=404, auth=auth_headers, json={})
        assert_route(test_client, "DELETE", "/platform/tenant/delete", expected_status=404, auth=auth_headers, json=[9999])
        assert_route(test_client, "GET", "/platform/tenant/1/config/info", expected_status=404, auth=auth_headers)
        assert_route(test_client, "PUT", "/platform/tenant/1/config", expected_status=404, auth=auth_headers, json=[])
        assert_route(test_client, "PUT", "/platform/tenant/renew/1", expected_status=404, auth=auth_headers, json={})
        assert_route(test_client, "PUT", "/platform/tenant/status/1", expected_status=404, auth=auth_headers)
        assert_route(test_client, "PATCH", "/platform/tenant/status/batch", expected_status=404, auth=auth_headers, json={})
        assert_route(test_client, "GET", "/platform/tenant/1/users", expected_status=404, auth=auth_headers)


class TestMenu:
    """Menu management routes."""

    def test_menu_tree(self, test_client: TestClient, auth_headers: dict) -> None:
        assert_route(test_client, "GET", "/platform/menu/tree", auth=auth_headers)

    def test_menu_create(self, test_client: TestClient, auth_headers: dict) -> None:
        assert_route(
            test_client,
            "POST",
            "/platform/menu/create",
            auth=auth_headers,
            json={"name": "test menu", "type": 0, "parent_id": 0, "order": 1},
        )

    def test_menu_update(self, test_client: TestClient, auth_headers: dict) -> None:
        assert_route(test_client, "PUT", "/platform/menu/update/1", auth=auth_headers, json={"name": "updated menu"})

    def test_menu_delete(self, test_client: TestClient, auth_headers: dict) -> None:
        assert_route(test_client, "DELETE", "/platform/menu/delete", auth=auth_headers, json=[9999])

    def test_menu_detail(self, test_client: TestClient, auth_headers: dict) -> None:
        assert_route(test_client, "GET", "/platform/menu/detail/1", auth=auth_headers)

    def test_menu_status_batch(self, test_client: TestClient, auth_headers: dict) -> None:
        assert_route(
            test_client,
            "PATCH",
            "/platform/menu/status/batch",
            auth=auth_headers,
            json={"ids": [1], "status": 1},
        )


class TestRemovedPlatformBusinessRoutes:
    """Removed platform business routes should stay unregistered."""

    def test_package_routes_are_removed(self, test_client: TestClient, auth_headers: dict) -> None:
        assert_route(test_client, "GET", "/platform/package/list", expected_status=404, auth=auth_headers)
        assert_route(test_client, "GET", "/platform/tenant/1/package-change-preview", expected_status=404, auth=auth_headers)
        assert_route(test_client, "GET", "/platform/tenant/package/preview", expected_status=404, auth=auth_headers)

    def test_order_payment_refund_invoice_routes_are_removed(self, test_client: TestClient, auth_headers: dict) -> None:
        assert_route(test_client, "GET", "/platform/order/list", expected_status=404, auth=auth_headers)
        assert_route(test_client, "GET", "/platform/payment/record/list", expected_status=404, auth=auth_headers)
        assert_route(test_client, "GET", "/platform/refund/list", expected_status=404, auth=auth_headers)
        assert_route(test_client, "GET", "/platform/invoice/list", expected_status=404, auth=auth_headers)
        assert_route(test_client, "GET", "/platform/tenant/order/list", expected_status=404, auth=auth_headers)

    def test_plugin_platform_routes_are_removed(self, test_client: TestClient, auth_headers: dict) -> None:
        assert_route(test_client, "GET", "/platform/plugin/list", expected_status=404, auth=auth_headers)
        assert_route(test_client, "POST", "/platform/tenant/plugin/purchase", expected_status=404, auth=auth_headers)
