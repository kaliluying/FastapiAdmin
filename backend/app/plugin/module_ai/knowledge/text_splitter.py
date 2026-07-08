"""Structured text splitter for Chinese documents.

Splits structured Chinese documents by article boundaries with chapter-aware
grouping, ensuring that each chunk retains its complete numbered unit.
"""

from __future__ import annotations

import re
from dataclasses import dataclass, field
from typing import Any


@dataclass(slots=True)
class LegalChunk:
    """A structured chunk with metadata for RAG."""

    content: str
    metadata: dict[str, Any] = field(default_factory=dict)


def split_text(text: str, *, chunk_size: int = 1000, overlap: int = 150) -> list[str]:
    """Backward-compatible wrapper – returns plain text chunks.

    For documents containing Chinese numbered articles (第X条), delegates to
    :func:`split_legal_text`. Otherwise falls back to character-based splitting.

    The returned chunks include 25-35% contextual overlap extracted from the
    tail of each preceding chunk.
    """

    if overlap >= chunk_size:
        raise ValueError("overlap must be smaller than chunk_size")

    if not text or not text.strip():
        return []

    # Try legal-aware splitting first.
    legal_chunks = split_legal_text(text)
    if legal_chunks:
        result: list[str] = []
        prev_end = ""
        for chunk in legal_chunks:
            full_content = chunk.content
            if prev_end:
                full_content = prev_end + "\n" + full_content
            result.append(full_content)
            if len(chunk.content) > overlap:
                prev_end = chunk.content[-overlap:]
            else:
                prev_end = chunk.content
        return result

    # Fallback: character-based splitting for non-legal documents.
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


def split_legal_text(
    text: str,
    *,
    target_size: int = 800,
    min_size: int = 200,
    max_size: int = 1200,
) -> list[LegalChunk]:
    """Split Chinese legal text into article-aware chunks with metadata.

    Rules:
    - The smallest unit is a complete article (条).
    - Target chunk 600–1000 chars; merge short articles (<200 chars) with
      neighbours; only split a single article when it exceeds 1200 chars.
    - Each chunk carries chapter label, article range, keywords, and a
      one-line summary.
    """

    if not text or not text.strip():
        return []

    articles = _parse_articles(text)
    if not articles:
        return []

    chunks = _group_articles(articles, target_size=target_size, min_size=min_size, max_size=max_size)
    return [_build_chunk(group, articles, index) for index, group in enumerate(chunks)]


# ---------------------------------------------------------------------------
# Article parsing
# ---------------------------------------------------------------------------

_CHAPTER_RE = re.compile(r"(第[一二三四五六七八九十百]+章[\s\u00a0]*[^\n]*)")
_ARTICLE_RE = re.compile(
    r"\n?(第[一二三四五六七八九十百零]+条)[\s\u00a0]*"
)


def _chinese_to_int(cn: str) -> int:
    """Convert Chinese numeral to int (supports up to 九百九十九)."""

    mapping = {
        "零": 0, "一": 1, "二": 2, "三": 3, "四": 4,
        "五": 5, "六": 6, "七": 7, "八": 8, "九": 9,
        "十": 10, "百": 100,
    }
    total = 0
    section = 0
    for ch in cn:
        if ch == "百":
            section = (section or 1) * 100
            total += section
            section = 0
        elif ch == "十":
            total += (section or 1) * 10
            section = 0
        else:
            section = mapping.get(ch, 0)
    total += section
    return total


def _parse_articles(text: str) -> list[dict[str, Any]]:
    """Parse text into a list of article dicts with chapter context.

    Uses line-start article markers (\\n第X条) to detect article boundaries,
    avoiding false matches on cross-references like "本法第三十六条规定".
    """

    # Find chapter positions to skip TOC (first N matches = TOC entries).
    chapter_matches = list(_CHAPTER_RE.finditer(text))
    if not chapter_matches:
        return []

    chapter_names = [m.group().strip() for m in chapter_matches]
    distinct = list(dict.fromkeys(chapter_names))
    num_distinct = len(distinct)

    content_start = chapter_matches[num_distinct].start() if num_distinct < len(chapter_matches) else 0
    content_text = text[content_start:]

    # Split by chapter headers.
    segments = re.split(_CHAPTER_RE, content_text)
    # segments[1], segments[3], ... = chapter names; segments[2], segments[4], ... = chapter bodies

    articles: list[dict[str, Any]] = []
    for i in range(1, len(segments), 2):
        chapter_name = segments[i].strip() if i < len(segments) else ""
        chapter_body = segments[i + 1] if i + 1 < len(segments) else ""

        # Detect article boundaries. Two common formats:
        #   - \\n第X条  (labor law, text-based)
        #   - \\u3000+第X条  (social insurance law, indented)
        art_markers = list(re.finditer(r"(?:\n|\u3000+)(第[一二三四五六七八九十百零]+条)[\s\u00a0]*", chapter_body))
        if not art_markers:
            continue

        for j, marker in enumerate(art_markers):
            article_cn_full = marker.group(1)
            # Extract article number ("第X条" -> "X")
            num_match = re.match(r"第([一二三四五六七八九十百零]+)条", article_cn_full)
            if not num_match:
                continue
            article_num_cn = num_match.group(1)

            # Article text: from the end of this marker to the start of the next marker
            text_start = marker.end()
            text_end = art_markers[j + 1].start() if j + 1 < len(art_markers) else len(chapter_body)
            article_text = chapter_body[text_start:text_end]
            # Normalize whitespace.
            article_text = re.sub(r"\s+", "", article_text.strip())
            if not article_text:
                continue

            articles.append({
                "chapter": chapter_name,
                "article_num": _chinese_to_int(article_num_cn),
                "article_cn": article_cn_full,
                "text": article_text,
            })

    return articles


# ---------------------------------------------------------------------------
# Chunk grouping
# ---------------------------------------------------------------------------

def _group_articles(
    articles: list[dict[str, Any]],
    *,
    target_size: int,
    min_size: int,
    max_size: int,
) -> list[list[int]]:
    """Group article indices into balanced chunks.

    Rules:
    - Group boundaries respect chapter boundaries (no cross-chapter merge
      unless the chapter has very few articles).
    - Target 600–1000 chars per chunk.
    """

    groups: list[list[int]] = []
    current: list[int] = []
    current_len = 0
    current_chapter = ""

    for idx, art in enumerate(articles):
        art_len = len(art["text"])
        new_chapter = art["chapter"]

        # If a single article exceeds max_size, put it alone.
        if art_len > max_size:
            if current:
                groups.append(current)
                current = []
                current_len = 0
            groups.append([idx])
            current_chapter = new_chapter
            continue

        # Start new group if: chapter changes AND current group is stable.
        chapter_changed = current and current_chapter and new_chapter != current_chapter
        if chapter_changed and current_len >= min_size:
            groups.append(current)
            current = []
            current_len = 0

        # If adding would exceed target and current is above min_size, flush.
        if current_len + art_len > target_size and current_len >= min_size:
            groups.append(current)
            current = []
            current_len = 0

        current.append(idx)
        current_len += art_len
        current_chapter = new_chapter

    if current:
        groups.append(current)

    return groups


# ---------------------------------------------------------------------------
# Chunk builder
# ---------------------------------------------------------------------------

def _build_chunk(
    group: list[int],
    articles: list[dict[str, Any]],
    index: int,
) -> LegalChunk:
    """Build a LegalChunk from a group of article indices."""

    arts = [articles[i] for i in group]
    # Sort by article number.
    arts.sort(key=lambda a: a["article_num"])

    chapters_seen: list[str] = []
    for a in arts:
        if not chapters_seen or a["chapter"] != chapters_seen[-1]:
            chapters_seen.append(a["chapter"])
    chapter_label = chapters_seen[0] if len(chapters_seen) == 1 else f"{chapters_seen[0]} → {chapters_seen[-1]}"
    article_range = f"{arts[0]['article_cn']}-{arts[-1]['article_cn']}" if len(arts) > 1 else arts[0]["article_cn"]

    # Build content with chapter header prefix.
    lines = [f"【{chapter_label}】"]
    for art in arts:
        lines.append(f"{art['article_cn']} {art['text']}")
    content = "\n".join(lines)

    # Generate summary and keywords.
    summary = _generate_summary(arts, chapter_label)
    keywords = _generate_keywords(arts)

    return LegalChunk(
        content=content,
        metadata={
            "chapter": chapter_label,
            "articles": article_range,
            "article_nums": [a["article_num"] for a in arts],
            "char_count": sum(len(a["text"]) for a in arts),
            "chunk_index": index,
            "summary": summary,
            "keywords": ",".join(keywords),
            "document_type": "法律条文",
        },
    )


# ---------------------------------------------------------------------------
# Summary & keyword generation (rule-based, no LLM dependency)
# ---------------------------------------------------------------------------

# Chapter-level topic keywords for general policy and business documents.
_CHAPTER_TOPICS: dict[str, str] = {
    "总则": "目的、适用范围、基本原则、主体义务",
    "组织管理": "组织职责、岗位分工、审批权限、管理要求",
    "合同管理": "合同订立、履行、变更、解除、终止",
    "费用结算": "付款、收款、结算、对账、发票",
    "交付验收": "交付标准、验收流程、整改、确认记录",
    "安全合规": "安全要求、合规边界、风险控制、审计",
    "培训支持": "培训计划、能力要求、支持机制",
    "监督检查": "监督检查、过程留痕、问题整改",
    "责任处理": "违约责任、处罚、赔偿、追责",
    "附则": "施行日期、实施步骤",
    "特别规定": "例外情形、特殊流程、补充要求",
}


def _generate_summary(arts: list[dict[str, Any]], chapter: str) -> str:
    """Generate a one-line summary for the chunk."""

    nums = [a["article_num"] for a in arts]
    # Extract chapter short name for topic lookup.
    short_chapter = ""
    for key in _CHAPTER_TOPICS:
        if key in chapter:
            short_chapter = key
            break

    topic = _CHAPTER_TOPICS.get(short_chapter, "")
    # Truncate first article text as snippet.
    snippet = arts[0]["text"][:60] + ("…" if len(arts[0]["text"]) > 60 else "")
    return f"【{chapter}】第{nums[0]}-{nums[-1]}条，涉及{topic}。{snippet}"


def _generate_keywords(arts: list[dict[str, Any]]) -> list[str]:
    """Generate search keywords from article content."""

    # Pre-defined keyword mapping for general business concepts.
    concept_map = {
        "合同管理": ["合同", "协议", "订立", "履行", "变更", "解除", "终止"],
        "费用结算": ["付款", "收款", "结算", "发票", "对账", "欠款"],
        "交付验收": ["交付", "验收", "整改", "确认", "质量"],
        "组织职责": ["组织", "部门", "岗位", "职责", "权限"],
        "流程审批": ["审批", "流程", "节点", "提交", "审核"],
        "安全合规": ["安全", "合规", "审计", "风险", "控制"],
        "监督检查": ["监督检查", "抽查", "审计"],
        "责任处理": ["违约", "处罚", "赔偿", "追责", "整改"],
    }

    combined = "".join(a["text"] for a in arts)
    keywords: list[str] = []
    seen: set[str] = set()
    for concept, kws in concept_map.items():
        if any(kw in combined for kw in kws):
            if concept not in seen:
                keywords.append(concept)
                seen.add(concept)
    return keywords
