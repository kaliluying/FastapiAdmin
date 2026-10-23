import pytest
from pydantic import ValidationError
from sqlalchemy.engine import make_url

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
    settings = Settings(ENVIRONMENT=EnvironmentEnum.PROD, SECRET_KEY="x" * 32, DATABASE_TYPE="mysql")

    assert settings.SECRET_KEY == "x" * 32


@pytest.mark.parametrize("database_type,port", [("mysql", 3306), ("postgresql", 5432)])
def test_production_accepts_supported_database_and_builds_uris(database_type: str, port: int) -> None:
    settings = Settings(
        ENVIRONMENT=EnvironmentEnum.PROD,
        SECRET_KEY="x" * 32,
        DATABASE_TYPE=database_type,
        DATABASE_USER="user",
        DATABASE_PASSWORD="a:b/c",
        DATABASE_NAME="app",
    )

    assert f":{port}/app" in settings.ASYNC_DB_URI
    assert f":{port}/app" in settings.DB_URI
    assert "a%3Ab%2Fc" in settings.ASYNC_DB_URI


@pytest.mark.parametrize("database_type,driver", [("mysql", "asyncmy"), ("postgresql", "asyncpg")])
def test_database_uri_escapes_reserved_username_and_database_characters(database_type: str, driver: str) -> None:
    settings = Settings(
        ENVIRONMENT=EnvironmentEnum.PROD,
        SECRET_KEY="x" * 32,
        DATABASE_TYPE=database_type,
        DATABASE_USER="user:name",
        DATABASE_PASSWORD="a:b/c",
        DATABASE_NAME="db/name?part",
    )

    uri = make_url(settings.ASYNC_DB_URI)
    assert uri.drivername == f"{database_type}+{driver}"
    assert uri.username == "user:name"
    assert uri.password == "a:b/c"
    assert uri.database == "db/name?part"


def test_production_rejects_sqlite() -> None:
    """Reject SQLite in production even when the JWT secret is valid."""
    with pytest.raises(ValidationError, match="MySQL"):
        Settings(ENVIRONMENT=EnvironmentEnum.PROD, SECRET_KEY="x" * 32, DATABASE_TYPE="sqlite")
