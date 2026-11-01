"use client";

import { useEffect, useId, useRef, useState, useTransition } from "react";
import { Trash2 } from "lucide-react";

/** Confirms a destructive action, runs it, and keeps any failure on screen. */
export default function ConfirmDialog({
  open,
  title,
  message,
  confirmLabel,
  action,
  onClose,
  onDone,
}: {
  open: boolean;
  title: string;
  message: string;
  confirmLabel: string;
  action: () => Promise<{ error: string } | { ok: true }>;
  onClose: () => void;
  onDone?: () => void;
}) {
  // Native <dialog> brings the focus trap, Esc and the top layer, so it can't be
  // clipped or stacked under the card it was opened from.
  const dialogRef = useRef<HTMLDialogElement>(null);
  const id = useId();
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState("");

  useEffect(() => {
    const dialog = dialogRef.current;
    if (open && !dialog?.open) dialog?.showModal();
    if (!open && dialog?.open) dialog.close();
  }, [open]);

  function dismiss() {
    if (pending) return;
    setError("");
    onClose();
  }

  function confirm() {
    setError("");
    startTransition(async () => {
      try {
        const result = await action();
        if ("error" in result) {
          setError(result.error);
          return;
        }
        onClose();
        onDone?.();
      } catch {
        // A server action rejects when the request itself fails, e.g. offline.
        setError("Không kết nối được. Vui lòng thử lại.");
      }
    });
  }

  return (
    <dialog
      ref={dialogRef}
      aria-labelledby={`${id}-title`}
      aria-describedby={`${id}-message`}
      className="confirm-dialog"
      onCancel={(e) => {
        e.preventDefault();
        dismiss();
      }}
      onClick={(e) => {
        if (e.target === e.currentTarget) dismiss();
      }}
    >
      <div className="p-6 sm:p-7">
        <div className="flex gap-4">
          <span
            aria-hidden
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full"
            style={{ color: "#C0392B", backgroundColor: "#FDF0EE" }}
          >
            <Trash2 size={18} strokeWidth={1.5} />
          </span>
          <div className="min-w-0">
            <h2
              id={`${id}-title`}
              style={{ fontSize: "var(--text-lg)", fontWeight: 600, letterSpacing: "-0.01em", lineHeight: 1.3 }}
            >
              {title}
            </h2>
            <p
              id={`${id}-message`}
              className="mt-2"
              style={{ fontSize: "var(--text-sm)", color: "var(--ink-70)", overflowWrap: "anywhere" }}
            >
              {message}
            </p>
          </div>
        </div>

        {error && (
          <p
            role="alert"
            className="mt-4 px-3.5 py-2.5"
            style={{ fontSize: "var(--text-sm)", color: "#B3362B", background: "#FDF0EE", borderRadius: "0.375rem" }}
          >
            {error}
          </p>
        )}

        <div className="mt-6 flex justify-end gap-3">
          <button type="button" onClick={dismiss} disabled={pending} className="btn btn--ghost">
            Hủy
          </button>
          <button type="button" onClick={confirm} disabled={pending} className="btn btn--danger">
            {pending ? "Đang xóa…" : confirmLabel}
          </button>
        </div>
      </div>
    </dialog>
  );
}
