"""沿文本边界拆分提取后的文档，不预设文档类型。"""

_BOUNDARIES = ("\n\n", "\n", "。", "！", "？", ". ", "! ", "? ", "；", "; ", " ")


def split_text(text: str, *, chunk_size: int = 1000, overlap: int = 150) -> list[str]:
    """优先在段落和句子结尾拆分，保留去除首尾空白后的全部字符。"""
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
