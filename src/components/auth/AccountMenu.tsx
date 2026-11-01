"use client";

import { useCallback, useRef, useState } from "react";
import Link from "next/link";
import { LogOut, PenLine, Rows3, UserRound } from "lucide-react";
import { motion } from "motion/react";
import { useAuth } from "@/components/auth/AuthProvider";
import { EASE_OUT } from "@/lib/motion";
import { useClickOutside } from "@/lib/useClickOutside";

const ITEM =
  "flex w-full items-center gap-3 px-4 py-2.5 text-left bg-transparent border-none cursor-pointer hover:bg-[var(--ice-blue)]";

/** A visitor gets a plain link to /login; an admin gets their menu behind the same icon. */
export default function AccountMenu({ color, onNavigate }: { color: string; onNavigate: () => void }) {
  const { isAdmin, signOut } = useAuth();
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);

  const close = useCallback(() => setOpen(false), []);
  useClickOutside(rootRef, open, close);

  const leave = () => {
    close();
    onNavigate();
  };

  if (!isAdmin) {
    return (
      <Link href="/login" aria-label="Đăng nhập" title="Đăng nhập" onClick={onNavigate} className="account-btn" style={{ color }}>
        <UserRound size={21} strokeWidth={1.5} />
      </Link>
    );
  }

  return (
    <div ref={rootRef} className="relative">
      <button
        type="button"
        aria-label="Tài khoản quản trị"
        aria-haspopup="menu"
        aria-expanded={open}
        onClick={() => setOpen((v) => !v)}
        className="account-btn"
        style={{ color }}
      >
        <UserRound size={21} strokeWidth={1.5} />
        <span
          aria-hidden
          className="absolute right-[0.5rem] top-[0.5rem] h-2 w-2 rounded-full"
          style={{ backgroundColor: "var(--sapphire-light)" }}
        />
      </button>

      {open && (
        <motion.div
          role="menu"
          initial={{ opacity: 0, y: -6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.25, ease: EASE_OUT }}
          className="absolute right-0 top-full mt-2 min-w-52 overflow-hidden py-1.5 bg-white"
          style={{
            fontSize: "var(--text-sm)",
            color: "var(--ink)",
            border: "1px solid var(--ink-15)",
            borderRadius: "0.5rem",
            boxShadow: "0 12px 32px rgba(6, 43, 82, 0.14)",
          }}
        >
          <Link href="/admin/posts" prefetch={false} role="menuitem" onClick={leave} className={ITEM}>
            <Rows3 size={16} strokeWidth={1.5} />
            Quản lý bài viết
          </Link>
          <Link href="/admin/posts/new" prefetch={false} role="menuitem" onClick={leave} className={ITEM}>
            <PenLine size={16} strokeWidth={1.5} />
            Đăng bài mới
          </Link>
          <div className="my-1.5 h-px" style={{ backgroundColor: "var(--ink-08)" }} />
          <button
            type="button"
            role="menuitem"
            onClick={() => {
              leave();
              void signOut();
            }}
            className={ITEM}
          >
            <LogOut size={16} strokeWidth={1.5} />
            Đăng xuất
          </button>
        </motion.div>
      )}
    </div>
  );
}
