"use client";

import { useEffect, useRef, useState, type ChangeEvent } from "react";
import { EditorContent, useEditor, type Editor } from "@tiptap/react";
import { BubbleMenu } from "@tiptap/react/menus";
import StarterKit from "@tiptap/starter-kit";
import { TextAlign } from "@tiptap/extension-text-align";
import { BackgroundColor, Color, FontSize, TextStyle } from "@tiptap/extension-text-style";
import { CharacterCount, Placeholder } from "@tiptap/extensions";
import { AlignCenter, AlignLeft, AlignRight, Trash2 } from "lucide-react";
import { ArticleImage, type ImageAlign } from "./ArticleImage";
import EditorToolbar from "./EditorToolbar";
import { IMAGE_ACCEPT, uploadBlogImage } from "./uploadImage";

const IMAGE_WIDTHS = ["33%", "50%", "75%", "100%"];

const ALIGNMENTS: [ImageAlign, string, typeof AlignLeft][] = [
  ["left", "Ảnh bên trái", AlignLeft],
  ["center", "Ảnh ở giữa", AlignCenter],
  ["right", "Ảnh bên phải", AlignRight],
];

const imageFiles = (files: FileList | null | undefined) =>
  Array.from(files ?? []).filter((file) => file.type.startsWith("image/"));

// Module-level: BubbleMenu dispatches a transaction whenever this identity changes,
// and every transaction re-renders here.
const isImageSelected = ({ editor }: { editor: Editor }) => editor.isActive("image");

function ImageMenu({ editor }: { editor: Editor }) {
  const { width, align, alt } = editor.getAttributes("image");
  const set = (attrs: Record<string, string>) => editor.chain().updateAttributes("image", attrs).run();

  return (
    <BubbleMenu
      editor={editor}
      shouldShow={isImageSelected}
      className="flex flex-wrap items-center gap-0.5 p-1.5 bg-white"
      style={{
        maxWidth: "min(30rem, 90vw)",
        border: "1px solid var(--ink-15)",
        borderRadius: "0.5rem",
        boxShadow: "0 12px 32px rgba(6, 43, 82, 0.14)",
      }}
    >
      {IMAGE_WIDTHS.map((value) => (
        <button
          key={value}
          type="button"
          onClick={() => set({ width: value })}
          aria-label={`Chiều rộng ${value}`}
          className={`tool ${width === value ? "is-active" : ""}`}
          style={{ width: "2.6rem", fontSize: "0.75rem" }}
        >
          {value}
        </button>
      ))}
      <span aria-hidden className="mx-1 h-5 w-px" style={{ backgroundColor: "var(--ink-15)" }} />
      {ALIGNMENTS.map(([value, label, Icon]) => (
        <button
          key={value}
          type="button"
          title={label}
          aria-label={label}
          onClick={() => set({ align: value })}
          className={`tool ${align === value ? "is-active" : ""}`}
        >
          <Icon size={16} />
        </button>
      ))}
      <span aria-hidden className="mx-1 h-5 w-px" style={{ backgroundColor: "var(--ink-15)" }} />
      <button
        type="button"
        title="Xóa ảnh"
        aria-label="Xóa ảnh"
        onClick={() => editor.chain().focus().deleteSelection().run()}
        className="tool"
      >
        <Trash2 size={16} />
      </button>
      <input
        value={alt ?? ""}
        onChange={(e) => set({ alt: e.target.value })}
        placeholder="Mô tả ảnh (cho SEO)"
        aria-label="Mô tả ảnh"
        className="field mt-1 basis-full"
        style={{ padding: "0.35rem 0.6rem" }}
      />
    </BubbleMenu>
  );
}

export default function RichTextEditor({
  initialHtml,
  onChange,
}: {
  initialHtml: string;
  onChange: (html: string) => void;
}) {
  const [uploads, setUploads] = useState(0);
  const [error, setError] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);
  const editorRef = useRef<Editor | null>(null);

  async function insertImages(files: File[], position?: number) {
    setError("");
    setUploads((n) => n + files.length);

    let at = position;
    for (const file of files) {
      try {
        const src = await uploadBlogImage(file);
        const editor = editorRef.current;
        if (at === undefined) editor?.chain().focus().setImage({ src }).run();
        else {
          editor?.chain().focus().insertContentAt(at, { type: "image", attrs: { src } }).run();
          at += 1;
        }
      } catch (e) {
        setError(e instanceof Error ? e.message : "Không tải được ảnh lên.");
      } finally {
        setUploads((n) => n - 1);
      }
    }
  }

  // Non-empty deps on purpose: with [] Tiptap calls setOptions after every render,
  // which dispatches a transaction, which re-renders here, and React bails out.
  const editor = useEditor(
    {
      immediatelyRender: false,
      shouldRerenderOnTransaction: true,
      content: initialHtml,
      extensions: [
        StarterKit.configure({
          heading: { levels: [2, 3, 4] },
          link: { openOnClick: false, defaultProtocol: "https" },
        }),
        TextStyle,
        Color,
        BackgroundColor,
        FontSize,
        TextAlign.configure({ types: ["heading", "paragraph"] }),
        ArticleImage,
        CharacterCount,
        Placeholder.configure({ placeholder: "Bắt đầu viết nội dung bài viết…" }),
      ],
      editorProps: {
        handlePaste(_view, event) {
          const files = imageFiles(event.clipboardData?.files);
          if (files.length === 0) return false;
          void insertImages(files);
          return true;
        },
        handleDrop(view, event, _slice, moved) {
          const files = imageFiles(event.dataTransfer?.files);
          if (moved || files.length === 0) return false;
          event.preventDefault();
          const position = view.posAtCoords({ left: event.clientX, top: event.clientY })?.pos;
          void insertImages(files, position);
          return true;
        },
      },
      onUpdate: ({ editor: e }) => onChange(e.getHTML()),
    },
    [initialHtml],
  );

  useEffect(() => {
    editorRef.current = editor;
  }, [editor]);

  function onFilePicked(e: ChangeEvent<HTMLInputElement>) {
    void insertImages(imageFiles(e.target.files));
    e.target.value = "";
  }

  return (
    <div className="bg-white" style={{ border: "1px solid var(--ink-15)", borderRadius: "0.5rem" }}>
      {editor ? (
        <>
          <EditorToolbar editor={editor} onPickImage={() => fileInputRef.current?.click()} />
          <ImageMenu editor={editor} />
          <EditorContent editor={editor} className="article-body" />
          <div
            className="flex items-center justify-between gap-4 px-4 py-2"
            style={{ borderTop: "1px solid var(--ink-08)", fontSize: "var(--text-xs)", color: "var(--ink-50)" }}
          >
            <span>
              {error ? (
                <span role="alert" style={{ color: "#C0392B" }}>
                  {error}
                </span>
              ) : uploads > 0 ? (
                "Đang tải ảnh lên…"
              ) : (
                "Mẹo: kéo thả hoặc dán ảnh trực tiếp vào nội dung. Shift+Enter để xuống dòng trong cùng đoạn."
              )}
            </span>
            <span className="shrink-0">{editor.storage.characterCount.words()} từ</span>
          </div>
        </>
      ) : (
        <div className="min-h-[26rem]" />
      )}
      <input ref={fileInputRef} type="file" accept={IMAGE_ACCEPT} multiple hidden onChange={onFilePicked} />
    </div>
  );
}
