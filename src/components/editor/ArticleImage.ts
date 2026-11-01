import Image from "@tiptap/extension-image";

export type ImageAlign = "left" | "center" | "right";

/** Block image with a width (%) and alignment that survive the round trip as HTML. */
export const ArticleImage = Image.extend({
  draggable: true,

  addAttributes() {
    return {
      ...this.parent?.(),
      width: {
        default: "100%",
        parseHTML: (el) => el.style.width || "100%",
        renderHTML: (attrs) => ({ style: `width: ${attrs.width}` }),
      },
      align: {
        default: "center",
        parseHTML: (el) => el.getAttribute("data-align") || "center",
        renderHTML: (attrs) => ({ "data-align": attrs.align }),
      },
    };
  },
});
