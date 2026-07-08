from pathlib import Path


def test_chat_delete_requires_session_delete_permission() -> None:
    controller = Path("app/plugin/module_ai/chat/controller.py").read_text(encoding="utf-8")
    delete_section = controller.split("async def delete_session_controller", 1)[1].split(
        "@ChatRouter.post",
        1,
    )[0]

    assert 'Depends(AuthPermission(["module_ai:session:delete"]))' in delete_section
    assert "Depends(get_current_user)" not in delete_section
    assert "module_ai:chat:delete" not in delete_section
