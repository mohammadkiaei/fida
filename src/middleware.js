import { NextResponse } from "next/server";
import { defaultLocale, isLocale } from "@/i18n/config";

/**
 * 1) Adds the language prefix: /learn -> /fa/learn or /en/learn (cookie, then browser language, then Persian).
 * 2) UX-level protection of /panel and /admin. The role cookie is a hint written by the client
 *    (see lib/auth.jsx); real authorization must always be enforced by the backend.
 */
export function middleware(req) {
  const { pathname } = req.nextUrl;
  const seg = pathname.split("/")[1];

  if (!isLocale(seg)) {
    const cookie = req.cookies.get("NEXT_LOCALE")?.value;
    const accept = (req.headers.get("accept-language") || "").toLowerCase();
    const locale = isLocale(cookie) ? cookie : accept.startsWith("fa") ? "fa" : accept.startsWith("en") ? "en" : defaultLocale;
    const url = req.nextUrl.clone();
    url.pathname = `/${locale}${pathname === "/" ? "" : pathname}`;
    return NextResponse.redirect(url);
  }

  const rest = pathname.slice(seg.length + 1) || "/";
  const guarded = rest.startsWith("/panel") || rest.startsWith("/admin");
  if (!guarded) return NextResponse.next();

  const role = req.cookies.get("fida_role")?.value;
  if (!role) {
    const url = req.nextUrl.clone();
    url.pathname = `/${seg}/login`;
    url.search = `?next=${encodeURIComponent(pathname)}`;
    return NextResponse.redirect(url);
  }
  if (rest.startsWith("/admin") && role !== "admin") return NextResponse.redirect(new URL(`/${seg}/panel`, req.url));
  if (rest.startsWith("/panel") && role === "admin") return NextResponse.redirect(new URL(`/${seg}/admin`, req.url));
  return NextResponse.next();
}

export const config = { matcher: ["/((?!_next|api|.*\\..*).*)"] };
