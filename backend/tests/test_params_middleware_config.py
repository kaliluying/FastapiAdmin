from app.api.v1.module_system.params.service import _parse_bool_config


def test_parse_bool_config_handles_string_false() -> None:
    assert _parse_bool_config("false") is False
    assert _parse_bool_config("False") is False
    assert _parse_bool_config("0") is False
    assert _parse_bool_config("") is False


def test_parse_bool_config_handles_truthy_values() -> None:
    assert _parse_bool_config(True) is True
    assert _parse_bool_config("true") is True
    assert _parse_bool_config("1") is True
