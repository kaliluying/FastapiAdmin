def test_ticket_schema_imports_cleanly() -> None:
    import app.api.v1.module_system.ticket.schema  # noqa: F401
