import "server-only";
import sanitize from "sanitize-html";

const COLOR = /^(#[0-9a-f]{3,8}|rgba?\([\d\s.,%]+\))$/i;

const TEXT_STYLES = {
  color: [COLOR],
  "background-color": [COLOR],
  "text-align": [/^(left|right|center|justify)$/],
  "font-size": [/^\d{1,2}(\.\d+)?(px|rem|em)$/],
};

/** Whitelist of exactly what the editor can produce. Runs on every save. */
export function cleanHtml(html: string) {
  return sanitize(html, {
    allowedTags: [
      "p", "br", "h2", "h3", "h4", "strong", "b", "em", "i", "u", "s", "span",
      "a", "img", "ul", "ol", "li", "blockquote", "hr", "code", "pre",
    ],
    allowedAttributes: {
      a: ["href", "target", "rel"],
      img: ["src", "alt", "style", "data-align", "loading", "decoding"],
      "*": ["style"],
    },
    allowedStyles: {
      "*": TEXT_STYLES,
      img: { width: [/^\d{1,3}%$/] },
    },
    allowedSchemes: ["http", "https", "mailto", "tel"],
    allowedSchemesByTag: { img: ["http", "https"] },
    transformTags: {
      a: sanitize.simpleTransform("a", { target: "_blank", rel: "noopener noreferrer" }),
      img: sanitize.simpleTransform("img", { loading: "lazy", decoding: "async" }),
    },
  });
}

export function plainText(html: string) {
  return sanitize(html.replace(/<\/(p|h\d|li|blockquote)>/g, " "), {
    allowedTags: [],
    allowedAttributes: {},
  })
    .replace(/&nbsp;/g, " ")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&amp;/g, "&")
    .replace(/\s+/g, " ")
    .trim();
}

export function readingMinutes(text: string) {
  return Math.max(1, Math.ceil(text.split(" ").filter(Boolean).length / 220));
}

export function makeExcerpt(text: string, length = 200) {
  if (text.length <= length) return text;
  const cut = text.slice(0, length);
  return `${cut.slice(0, cut.lastIndexOf(" "))}…`;
}

export function slugify(input: string) {
  return input
    .toLowerCase()
    .replace(/đ/g, "d")
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80)
    .replace(/-+$/, "");
}
