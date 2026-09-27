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


def test_split_text_preserves_generic_documents_with_a_size_limit():
    documents = [
        "文档标题\n说明文字\n第一章 总则\n第一条 " + "甲" * 100,
        "# Markdown 标题\n\n第一段。第二段！\n\n" + "longword" * 20,
    ]
    for document in documents:
        chunks = split_text(document, chunk_size=40, overlap=8)
        assert all(0 < len(chunk) <= 40 for chunk in chunks)
        assert chunks[0] + "".join(chunk[8:] for chunk in chunks[1:]) == document


def test_split_text_prefers_paragraph_boundaries():
    text = "标题与说明文字" * 2 + "\n\n" + "正文" * 20
    assert split_text(text, chunk_size=25, overlap=0)[0].endswith("\n\n")
