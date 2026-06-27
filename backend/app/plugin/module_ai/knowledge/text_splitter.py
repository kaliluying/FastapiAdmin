def split_text(text: str, *, chunk_size: int = 1000, overlap: int = 150) -> list[str]:
    """Split normalized text into overlapping chunks."""

    if overlap >= chunk_size:
        raise ValueError("overlap must be smaller than chunk_size")

    normalized = "\n".join(line.strip() for line in text.splitlines() if line.strip())
    if not normalized:
        return []

    chunks: list[str] = []
    start = 0
    while start < len(normalized):
        end = min(start + chunk_size, len(normalized))
        chunks.append(normalized[start:end])
        if end == len(normalized):
            break
        start = end - overlap
    return chunks
