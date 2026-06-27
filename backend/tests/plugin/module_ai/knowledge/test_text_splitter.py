import pytest

from app.plugin.module_ai.knowledge.text_splitter import split_text


def test_split_text_uses_overlap():
    chunks = split_text("abcdefghijklmnopqrstuvwxyz", chunk_size=10, overlap=2)
    assert chunks == ["abcdefghij", "ijklmnopqr", "qrstuvwxyz"]


def test_split_text_ignores_empty_input():
    assert split_text("   ", chunk_size=10, overlap=2) == []


def test_split_text_rejects_overlap_greater_than_chunk_size():
    with pytest.raises(ValueError, match="overlap"):
        split_text("hello", chunk_size=10, overlap=10)
