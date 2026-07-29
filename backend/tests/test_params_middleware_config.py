from app.api.v1.module_system.params.service import _parse_ip_list_config


def test_parse_ip_list_config_keeps_only_nonempty_strings() -> None:
    assert _parse_ip_list_config('["127.0.0.1", "", 12, " 10.0.0.1 "]') == ["127.0.0.1", "10.0.0.1"]


def test_parse_ip_list_config_rejects_malformed_values() -> None:
    assert _parse_ip_list_config("not-json") == []
    assert _parse_ip_list_config('{"ip": "127.0.0.1"}') == []
