"""jieba中文分词器包装

支持词组级分词，提升中文检索准确率。
"""

from __future__ import annotations

from whoosh.analysis import Analyzer, Token


class JiebaAnalyzer(Analyzer):
    """基于jieba的中文分词器

    相比单字分词，词组级分词能更好地保留语义：
    - 单字："劳动法" → ["劳", "动", "法"]
    - 词组："劳动法" → ["劳动法", "劳动", "法"]

    优势：
    - 保留完整词组语义
    - 提升精确匹配准确率
    - 支持自定义词典

    注意：继承Analyzer并实现pickle支持方法
    """

    def __init__(self, use_paddle: bool = False):
        """初始化jieba分词器

        Args:
            use_paddle: 是否使用paddle模式（更准确但需要额外依赖）
        """
        self.use_paddle = use_paddle

    def __eq__(self, other):
        """支持相等性比较"""
        return isinstance(other, JiebaAnalyzer) and self.use_paddle == other.use_paddle

    def __repr__(self):
        """支持repr"""
        return f"JiebaAnalyzer(use_paddle={self.use_paddle})"

    def __getstate__(self):
        """支持pickle序列化"""
        return {"use_paddle": self.use_paddle}

    def __setstate__(self, state):
        """支持pickle反序列化"""
        self.use_paddle = state.get("use_paddle", False)

    def __call__(self, text: str, **kwargs):
        """分词主入口

        Args:
            text: 待分词文本

        Yields:
            Token对象
        """
        # 延迟导入jieba
        try:
            import jieba
        except ImportError as exc:
            raise RuntimeError("jieba is required for JiebaAnalyzer") from exc

        if self.use_paddle:
            words = jieba.cut(text, use_paddle=True)
        else:
            words = jieba.cut(text, cut_all=False)  # 精确模式

        # 生成Whoosh Token对象
        pos = 0
        for word in words:
            word = word.strip()
            if not word:
                continue

            # 查找词在原文中的位置
            start_pos = text.find(word, pos)
            if start_pos >= 0:
                end_pos = start_pos + len(word)
                pos = end_pos
            else:
                # 找不到位置，使用估计值
                start_pos = pos
                end_pos = pos + len(word)
                pos = end_pos

            # 创建Token
            token = Token()
            token.text = word.lower()  # 小写化
            token.pos = start_pos
            token.endpos = end_pos
            token.startchar = start_pos
            token.endchar = end_pos

            yield token

    def add_word(self, word: str, freq: int | None = None, tag: str | None = None):
        """添加自定义词

        Args:
            word: 词语
            freq: 词频（可选）
            tag: 词性（可选）
        """
        try:
            import jieba
        except ImportError as exc:
            raise RuntimeError("jieba is required for JiebaAnalyzer") from exc

        if freq is not None and tag is not None:
            jieba.add_word(word, freq, tag)
        elif freq is not None:
            jieba.add_word(word, freq)
        else:
            jieba.add_word(word)

    def load_userdict(self, dict_path: str):
        """加载自定义词典

        Args:
            dict_path: 词典文件路径
        """
        try:
            import jieba
        except ImportError as exc:
            raise RuntimeError("jieba is required for JiebaAnalyzer") from exc

        jieba.load_userdict(dict_path)


def create_jieba_analyzer(use_paddle: bool = False) -> JiebaAnalyzer:
    """创建jieba分词器工厂函数

    Args:
        use_paddle: 是否使用paddle模式

    Returns:
        JiebaAnalyzer实例
    """
    return JiebaAnalyzer(use_paddle=use_paddle)
