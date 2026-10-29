/**
 * Can this browser play a <video> *inline*?
 *
 * iOS in-app browsers (Zalo, Facebook, Messenger, Instagram, TikTok…) are
 * WKWebViews, and many of them disallow inline playback: there, *any*
 * `play()` throws the clip into the native full-screen player. Background
 * footage must never do that, so in those shells we don't mount a <video>
 * at all — the still frame stands in.
 *
 * Real iOS browsers (Safari, Chrome, Firefox, Edge) carry "Safari/" in their
 * UA; WebViews don't. Known in-app shells are also matched explicitly, since
 * some append it.
 *
 * As a last resort, if a video ever does enter full screen we flip a
 * page-wide switch (`markInlineBroken`) and every ambient video falls back
 * to its poster for the rest of the visit.
 */

const IN_APP = /FBAN|FBAV|FB_IAB|FBIOS|Instagram|Zalo|Line\/|MicroMessenger|musical_ly|Bytedance|TikTok|Snapchat|Twitter|LinkedInApp|Pinterest|KAKAOTALK|WhatsApp|Telegram|Viber/i;

let uaVerdict: boolean | null = null;
let broken = false;
const listeners = new Set<() => void>();

function uaAllowsInline(): boolean {
  if (uaVerdict !== null) return uaVerdict;
  const ua = navigator.userAgent;
  const iOS =
    /iPhone|iPad|iPod/.test(ua) || (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1);
  if (IN_APP.test(ua)) uaVerdict = false;
  else if (iOS) uaVerdict = /Safari\//.test(ua);
  else uaVerdict = true;
  return uaVerdict;
}

export function canPlayInline(): boolean {
  return !broken && uaAllowsInline();
}

/** Server render: no video until the client has checked. */
export function canPlayInlineOnServer(): boolean {
  return false;
}

export function subscribeInline(cb: () => void) {
  listeners.add(cb);
  return () => {
    listeners.delete(cb);
  };
}

export function markInlineBroken() {
  if (broken) return;
  broken = true;
  listeners.forEach((cb) => cb());
}
