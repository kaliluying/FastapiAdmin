import pytest
from pydantic import ValidationError

from app.common.enums import EnvironmentEnum
from app.config.setting import Settings


def test_non_production_requires_a_jwt_secret_key() -> None:
    """Reject an empty JWT secret in development too."""
    with pytest.raises(ValidationError, match="SECRET_KEY"):
        Settings(ENVIRONMENT=EnvironmentEnum.DEV, SECRET_KEY="")


def test_production_requires_a_strong_secret_key() -> None:
    """Reject production settings that use a short JWT secret."""
    with pytest.raises(ValidationError, match="SECRET_KEY"):
        Settings(ENVIRONMENT=EnvironmentEnum.PROD, SECRET_KEY="too-short")


def test_production_accepts_a_configured_secret_key() -> None:
    """Accept a production setting with a sufficiently long JWT secret."""
    settings = Settings(ENVIRONMENT=EnvironmentEnum.PROD, SECRET_KEY="x" * 32)

    assert settings.SECRET_KEY == "x" * 32
