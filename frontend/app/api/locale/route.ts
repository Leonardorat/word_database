import { NextResponse } from "next/server";
import { normalizeLocale } from "@/lib/i18n";

export async function POST(req: Request) {
  const body = await req.json().catch(() => null);

  const locale = normalizeLocale(body?.locale);
  if (!locale) {
    return NextResponse.json({ error: "Invalid locale" }, { status: 400 });
  }

  const res = NextResponse.json({ ok: true });

  res.cookies.set("locale", locale, {
    path: "/",
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    maxAge: 60 * 60 * 24 * 365,
  });

  return res;
}
