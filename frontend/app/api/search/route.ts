import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const q = (searchParams.get("q") ?? "").trim();

  if (q.length < 1) return NextResponse.json([]);
  if (q.length > 50)
    return NextResponse.json({ error: "Query too long" }, { status: 400 });

  const baseUrl = process.env.API_BASE_URL;
  if (!baseUrl) {
    return NextResponse.json(
      { error: "API_BASE_URL is not set" },
      { status: 500 },
    );
  }

  const url = `${baseUrl}/terms/search?q=${encodeURIComponent(q)}`;

  const res = await fetch(url, {
    method: "GET",
    headers: { Accept: "application/json" },

    cache: "no-store",
  });

  if (!res.ok) {
    return NextResponse.json({ error: "Backend error" }, { status: 502 });
  }

  const data = await res.json();
  return NextResponse.json(data);
}
