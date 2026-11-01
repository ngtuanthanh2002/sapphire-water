"use client";

import { useState, type FormEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Eye, EyeOff, LoaderCircle, LockKeyhole, Mail } from "lucide-react";
import { useAuth } from "@/components/auth/AuthProvider";
import { supabaseReady } from "@/lib/supabase/config";
import { createBrowserSupabase } from "@/lib/supabase/client";

const FIELD_ICON = "absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none";

function signInMessage(code: string | undefined) {
  switch (code) {
    case "invalid_credentials":
      return "Email hoặc mật khẩu không đúng.";
    case "email_not_confirmed":
      return "Tài khoản chưa được xác nhận email.";
    case "user_banned":
      return "Tài khoản này đang bị khóa.";
    case "over_request_rate_limit":
    case "over_email_send_rate_limit":
      return "Thử đăng nhập quá nhiều lần. Vui lòng đợi vài phút rồi thử lại.";
    default:
      return `Không đăng nhập được${code ? ` (${code})` : ""}. Vui lòng thử lại sau.`;
  }
}

function Alert({ children }: { children: string }) {
  return (
    <p
      role="alert"
      className="px-3.5 py-2.5"
      style={{ fontSize: "var(--text-sm)", color: "#B3362B", background: "#FDF0EE", borderRadius: "0.375rem" }}
    >
      {children}
    </p>
  );
}

export default function LoginForm() {
  const { isAdmin, markSignedIn } = useAuth();
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState("");

  async function submit(e: FormEvent) {
    e.preventDefault();
    setPending(true);
    setError("");

    const supabase = createBrowserSupabase();
    const { error: signInError } = await supabase.auth.signInWithPassword({ email, password });

    if (signInError) {
      setError(signInMessage(signInError.code));
      setPending(false);
      return;
    }

    const { data: allowed, error: roleError } = await supabase.rpc("is_admin");
    if (!allowed) {
      await supabase.auth.signOut();
      setError(
        roleError ? "Không kiểm tra được quyền quản trị. Vui lòng thử lại." : "Tài khoản này không có quyền quản trị.",
      );
      setPending(false);
      return;
    }

    markSignedIn();
    const next = new URLSearchParams(window.location.search).get("next");
    // Admin paths only, so a crafted link can't send anyone off-site after login.
    router.push(next?.startsWith("/admin") ? next : "/blog");
  }

  if (isAdmin) {
    return (
      <div className="flex flex-col gap-4">
        <p style={{ fontSize: "var(--text-sm)", color: "var(--ink-70)" }}>Bạn đã đăng nhập.</p>
        <Link href="/blog" className="btn btn--primary">
          Đến trang Blog
        </Link>
      </div>
    );
  }

  return (
    <form onSubmit={submit} className="flex flex-col gap-5">
      <div>
        <label htmlFor="email" className="field-label">
          Email
        </label>
        <div className="relative">
          <Mail size={17} strokeWidth={1.5} className={FIELD_ICON} style={{ color: "var(--ink-50)" }} />
          <input
            id="email"
            type="email"
            required
            autoComplete="email"
            placeholder="ten@sapphirewater.vn"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="field py-3 pl-10"
          />
        </div>
      </div>

      <div>
        <label htmlFor="password" className="field-label">
          Mật khẩu
        </label>
        <div className="relative">
          <LockKeyhole size={17} strokeWidth={1.5} className={FIELD_ICON} style={{ color: "var(--ink-50)" }} />
          <input
            id="password"
            type={showPassword ? "text" : "password"}
            required
            autoComplete="current-password"
            placeholder="Nhập mật khẩu"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="field py-3 pl-10 pr-11"
          />
          <button
            type="button"
            aria-label={showPassword ? "Ẩn mật khẩu" : "Hiện mật khẩu"}
            onClick={() => setShowPassword((v) => !v)}
            className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center justify-center w-8 h-8 bg-transparent border-none cursor-pointer"
            style={{ color: "var(--ink-50)" }}
          >
            {showPassword ? <EyeOff size={17} strokeWidth={1.5} /> : <Eye size={17} strokeWidth={1.5} />}
          </button>
        </div>
      </div>

      {error && <Alert>{error}</Alert>}

      <button
        type="submit"
        disabled={pending || !supabaseReady}
        className="btn btn--primary mt-1 py-3.5"
        style={{ borderRadius: "0.375rem" }}
      >
        {pending && <LoaderCircle size={17} className="animate-spin" />}
        {pending ? "Đang đăng nhập…" : "Đăng nhập"}
      </button>
    </form>
  );
}
