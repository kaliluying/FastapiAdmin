"""Split extracted documents at text boundaries without assuming a document type."""

_BOUNDARIES = ("\n\n", "\n", "。", "！", "？", ". ", "! ", "? ", "；", "; ", " ")


def split_text(text: str, *, chunk_size: int = 1000, overlap: int = 150) -> list[str]:
    """Keep every non-edge character while preferring paragraph and sentence ends."""
    if chunk_size <= 0 or not 0 <= overlap < chunk_size:
        raise ValueError("chunk_size must be positive and overlap must be between 0 and chunk_size")

    text = text.strip()
    if not text:
        return []

    chunks: list[str] = []
    start = 0
    while start < len(text):
        end = min(start + chunk_size, len(text))
        if end < len(text):
            minimum = start + max(chunk_size // 2, overlap + 1)
            for boundary in _BOUNDARIES:
                position = text.rfind(boundary, minimum, end)
                if position >= 0:
                    end = position + len(boundary)
                    break
        chunks.append(text[start:end])
        if end == len(text):
            break
        start = end - overlap
    return chunks
