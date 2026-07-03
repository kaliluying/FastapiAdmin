import createDOMPurify from "dompurify";
import { marked } from "marked";

const fallbackSanitize = (html: string) => {
  return html
    .replace(/<script[\s\S]*?>[\s\S]*?<\/script>/gi, "")
    .replace(/\son\w+=(["']).*?\1/gi, "")
    .replace(/\s(href|src)=(["'])javascript:[\s\S]*?\2/gi, "");
};

const sanitizeHtml = (html: string) => {
  if (typeof window === "undefined") {
    return fallbackSanitize(html);
  }

  return createDOMPurify(window).sanitize(html, {
    USE_PROFILES: { html: true },
  });
};

export const renderMarkdown = (source: string) => {
  const html = marked.parse(source || "", {
    async: false,
    breaks: true,
    gfm: true,
  }) as string;

  return sanitizeHtml(html);
};
