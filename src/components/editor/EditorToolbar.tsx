"use client";

import { useCallback, useRef, useState, type ReactNode } from "react";
import type { Editor } from "@tiptap/react";
import {
  AlignCenter,
  AlignJustify,
  AlignLeft,
  AlignRight,
  Baseline,
  Bold,
  Highlighter,
  ImagePlus,
  Italic,
  Link2,
  List,
  ListOrdered,
  Minus,
  Quote,
  Redo2,
  RemoveFormatting,
  Strikethrough,
  Underline,
  Undo2,
} from "lucide-react";
import { useClickOutside } from "@/lib/useClickOutside";

const TEXT_COLORS = ["#062B52", "#0756A8", "#6FB4EC", "#1F9D6B", "#E08A1E", "#D9483B", "#8E44AD", "#6B7785"];
const HIGHLIGHT_COLORS = ["#EAF6FC", "#D3EAF6", "#FFF3B0", "#FFD8A8", "#FFC9C9", "#C3F0CA", "#E5D4F5", "#E9ECEF"];
const FONT_SIZES = ["13px", "14px", "18px", "20px", "24px", "30px"];

const ICON = 17;

function Tool({
  label,
  active,
  disabled,
  onClick,
  children,
}: {
  label: string;
  active?: boolean;
  disabled?: boolean;
  onClick: () => void;
  children: ReactNode;
}) {
  return (
    <button
      type="button"
      title={label}
      aria-label={label}
      aria-pressed={active}
      disabled={disabled}
      // Keeps the text selection alive while the button takes the click.
      onMouseDown={(e) => e.preventDefault()}
      onClick={onClick}
      className={`tool ${active ? "is-active" : ""}`}
    >
      {children}
    </button>
  );
}

function Divider() {
  return <span aria-hidden className="mx-1 h-5 w-px" style={{ backgroundColor: "var(--ink-15)" }} />;
}

/** A toolbar button with a small panel that closes on outside click. */
function Popover({
  label,
  icon,
  active,
  children,
}: {
  label: string;
  icon: ReactNode;
  active?: boolean;
  children: (close: () => void) => ReactNode;
}) {
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);

  const close = useCallback(() => setOpen(false), []);
  useClickOutside(rootRef, open, close);

  return (
    <div ref={rootRef} className="relative">
      <Tool label={label} active={active || open} onClick={() => setOpen((v) => !v)}>
        {icon}
      </Tool>
      {open && <div className="tool-popover">{children(close)}</div>}
    </div>
  );
}

function ColorPanel({
  colors,
  current,
  clearLabel,
  onPick,
  onClear,
}: {
  colors: string[];
  current: string | undefined;
  clearLabel: string;
  onPick: (color: string) => void;
  onClear: () => void;
}) {
  return (
    <div className="w-44">
      <div className="grid grid-cols-4 gap-1.5">
        {colors.map((color) => (
          <button
            key={color}
            type="button"
            aria-label={`Chọn màu ${color}`}
            onMouseDown={(e) => e.preventDefault()}
            onClick={() => onPick(color)}
            className="h-8 cursor-pointer"
            style={{
              backgroundColor: color,
              border: "1px solid var(--ink-15)",
              borderRadius: "0.25rem",
              outline: current?.toLowerCase() === color.toLowerCase() ? "2px solid var(--sapphire-blue)" : undefined,
              outlineOffset: 1,
            }}
          />
        ))}
      </div>
      <label className="mt-3 flex items-center justify-between gap-2" style={{ fontSize: "0.8125rem" }}>
        Màu khác
        <input
          type="color"
          defaultValue={current?.startsWith("#") ? current : "#0756A8"}
          onChange={(e) => onPick(e.target.value)}
          className="h-7 w-10 cursor-pointer bg-transparent border-0 p-0"
        />
      </label>
      <button
        type="button"
        onMouseDown={(e) => e.preventDefault()}
        onClick={onClear}
        className="btn btn--ghost mt-3 w-full"
        style={{ padding: "0.35rem 0.75rem", fontSize: "0.8125rem" }}
      >
        {clearLabel}
      </button>
    </div>
  );
}

function LinkPanel({ editor, close }: { editor: Editor; close: () => void }) {
  const [url, setUrl] = useState<string>(editor.getAttributes("link").href ?? "");

  function apply() {
    const href = url.trim();
    if (!href) return;
    const full = /^(https?:|mailto:|tel:)/i.test(href) ? href : `https://${href}`;
    editor.chain().focus().extendMarkRange("link").setLink({ href: full }).run();
    close();
  }

  return (
    <div className="w-72">
      <input
        autoFocus
        value={url}
        onChange={(e) => setUrl(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter") {
            e.preventDefault();
            apply();
          }
        }}
        placeholder="https://…"
        aria-label="Địa chỉ liên kết"
        className="field"
      />
      <div className="mt-2 flex justify-end gap-2">
        {editor.isActive("link") && (
          <button
            type="button"
            onClick={() => {
              editor.chain().focus().extendMarkRange("link").unsetLink().run();
              close();
            }}
            className="btn btn--ghost"
            style={{ padding: "0.35rem 0.85rem", fontSize: "0.8125rem" }}
          >
            Bỏ liên kết
          </button>
        )}
        <button
          type="button"
          onClick={apply}
          className="btn btn--primary"
          style={{ padding: "0.35rem 0.85rem", fontSize: "0.8125rem" }}
        >
          Áp dụng
        </button>
      </div>
    </div>
  );
}

export default function EditorToolbar({ editor, onPickImage }: { editor: Editor; onPickImage: () => void }) {
  const textStyle = editor.getAttributes("textStyle");

  const block = editor.isActive("heading", { level: 2 })
    ? "h2"
    : editor.isActive("heading", { level: 3 })
      ? "h3"
      : editor.isActive("heading", { level: 4 })
        ? "h4"
        : "p";

  function setBlock(value: string) {
    const chain = editor.chain().focus();
    if (value === "p") chain.setParagraph().run();
    else chain.setHeading({ level: Number(value[1]) as 2 | 3 | 4 }).run();
  }

  function setSize(value: string) {
    const chain = editor.chain().focus();
    if (value) chain.setFontSize(value).run();
    else chain.unsetFontSize().run();
  }

  return (
    <div
      role="toolbar"
      aria-label="Định dạng nội dung"
      className="sticky top-[4.5rem] z-20 flex flex-wrap items-center gap-0.5 px-2 py-1.5 bg-white"
      style={{ borderBottom: "1px solid var(--ink-15)" }}
    >
      <Tool label="Hoàn tác (Ctrl+Z)" disabled={!editor.can().undo()} onClick={() => editor.chain().focus().undo().run()}>
        <Undo2 size={ICON} />
      </Tool>
      <Tool label="Làm lại (Ctrl+Y)" disabled={!editor.can().redo()} onClick={() => editor.chain().focus().redo().run()}>
        <Redo2 size={ICON} />
      </Tool>
      <Divider />

      <select aria-label="Kiểu đoạn" value={block} onChange={(e) => setBlock(e.target.value)} className="tool-select">
        <option value="p">Đoạn văn</option>
        <option value="h2">Tiêu đề lớn</option>
        <option value="h3">Tiêu đề vừa</option>
        <option value="h4">Tiêu đề nhỏ</option>
      </select>
      <select
        aria-label="Cỡ chữ"
        value={textStyle.fontSize ?? ""}
        onChange={(e) => setSize(e.target.value)}
        className="tool-select ml-1"
      >
        <option value="">Cỡ chữ</option>
        {FONT_SIZES.map((size) => (
          <option key={size} value={size}>
            {parseInt(size)}
          </option>
        ))}
      </select>
      <Divider />

      <Tool label="In đậm (Ctrl+B)" active={editor.isActive("bold")} onClick={() => editor.chain().focus().toggleBold().run()}>
        <Bold size={ICON} />
      </Tool>
      <Tool label="In nghiêng (Ctrl+I)" active={editor.isActive("italic")} onClick={() => editor.chain().focus().toggleItalic().run()}>
        <Italic size={ICON} />
      </Tool>
      <Tool label="Gạch chân (Ctrl+U)" active={editor.isActive("underline")} onClick={() => editor.chain().focus().toggleUnderline().run()}>
        <Underline size={ICON} />
      </Tool>
      <Tool label="Gạch ngang" active={editor.isActive("strike")} onClick={() => editor.chain().focus().toggleStrike().run()}>
        <Strikethrough size={ICON} />
      </Tool>

      <Popover label="Màu chữ" icon={<Baseline size={ICON} style={{ color: textStyle.color }} />}>
        {(close) => (
          <ColorPanel
            colors={TEXT_COLORS}
            current={textStyle.color}
            clearLabel="Bỏ màu chữ"
            onPick={(color) => editor.chain().focus().setColor(color).run()}
            onClear={() => {
              editor.chain().focus().unsetColor().run();
              close();
            }}
          />
        )}
      </Popover>
      <Popover label="Màu nền chữ" icon={<Highlighter size={ICON} />}>
        {(close) => (
          <ColorPanel
            colors={HIGHLIGHT_COLORS}
            current={textStyle.backgroundColor}
            clearLabel="Bỏ màu nền"
            onPick={(color) => editor.chain().focus().setBackgroundColor(color).run()}
            onClear={() => {
              editor.chain().focus().unsetBackgroundColor().run();
              close();
            }}
          />
        )}
      </Popover>
      <Divider />

      {(
        [
          ["left", "Căn trái", AlignLeft],
          ["center", "Căn giữa", AlignCenter],
          ["right", "Căn phải", AlignRight],
          ["justify", "Căn đều hai bên", AlignJustify],
        ] as const
      ).map(([value, label, Icon]) => (
        <Tool
          key={value}
          label={label}
          active={editor.isActive({ textAlign: value })}
          onClick={() => editor.chain().focus().setTextAlign(value).run()}
        >
          <Icon size={ICON} />
        </Tool>
      ))}
      <Divider />

      <Tool label="Danh sách dấu chấm" active={editor.isActive("bulletList")} onClick={() => editor.chain().focus().toggleBulletList().run()}>
        <List size={ICON} />
      </Tool>
      <Tool label="Danh sách đánh số" active={editor.isActive("orderedList")} onClick={() => editor.chain().focus().toggleOrderedList().run()}>
        <ListOrdered size={ICON} />
      </Tool>
      <Tool label="Trích dẫn" active={editor.isActive("blockquote")} onClick={() => editor.chain().focus().toggleBlockquote().run()}>
        <Quote size={ICON} />
      </Tool>
      <Tool label="Đường kẻ ngang" onClick={() => editor.chain().focus().setHorizontalRule().run()}>
        <Minus size={ICON} />
      </Tool>
      <Divider />

      <Popover label="Chèn liên kết" icon={<Link2 size={ICON} />} active={editor.isActive("link")}>
        {(close) => <LinkPanel editor={editor} close={close} />}
      </Popover>
      <Tool label="Chèn ảnh tại vị trí con trỏ" onClick={onPickImage}>
        <ImagePlus size={ICON} />
      </Tool>
      <Divider />

      <Tool label="Xóa định dạng" onClick={() => editor.chain().focus().unsetAllMarks().clearNodes().run()}>
        <RemoveFormatting size={ICON} />
      </Tool>
    </div>
  );
}
