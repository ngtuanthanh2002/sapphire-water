"use client";

import { useRef, useState, type ChangeEvent } from "react";
import Image from "next/image";
import { ImagePlus, X } from "lucide-react";
import { IMAGE_ACCEPT, uploadBlogImage } from "./uploadImage";

export default function CoverPicker({
  value,
  onChange,
}: {
  value: string | null;
  onChange: (url: string | null) => void;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");

  async function onPicked(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;

    setError("");
    setUploading(true);
    try {
      onChange(await uploadBlogImage(file));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Không tải được ảnh lên.");
    } finally {
      setUploading(false);
    }
  }

  return (
    <div>
      {value ? (
        <div className="relative aspect-[9/5] overflow-hidden" style={{ borderRadius: "0.375rem" }}>
          <Image src={value} alt="" fill sizes="320px" className="object-cover" />
          <button
            type="button"
            aria-label="Bỏ ảnh đại diện"
            onClick={() => onChange(null)}
            className="absolute right-2 top-2 flex items-center justify-center w-7 h-7 bg-white border-none rounded-full cursor-pointer"
            style={{ color: "var(--ink)" }}
          >
            <X size={15} />
          </button>
        </div>
      ) : (
        <button
          type="button"
          disabled={uploading}
          onClick={() => inputRef.current?.click()}
          className="flex flex-col items-center justify-center gap-2 w-full aspect-[9/5] bg-transparent cursor-pointer"
          style={{
            fontSize: "var(--text-xs)",
            color: "var(--ink-70)",
            border: "1px dashed var(--ink-15)",
            borderRadius: "0.375rem",
          }}
        >
          <ImagePlus size={20} strokeWidth={1.5} />
          {uploading ? "Đang tải ảnh lên…" : "Chọn ảnh đại diện"}
        </button>
      )}
      {error && (
        <p role="alert" className="mt-2" style={{ fontSize: "var(--text-xs)", color: "#C0392B" }}>
          {error}
        </p>
      )}
      <input ref={inputRef} type="file" accept={IMAGE_ACCEPT} hidden onChange={onPicked} />
    </div>
  );
}
