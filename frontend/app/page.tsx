"use client";

import { useEffect, useRef, useState } from "react";
import { MESSAGES } from "@/lib/i18n";
import { useLocale } from "./root-client-shell";

type Term = {
  id: number;
  term: string;
  definition: string;
};

export default function HomePage() {
  const { locale } = useLocale();
  const t = MESSAGES[locale];

  const [q, setQ] = useState("");
  const [items, setItems] = useState<Term[]>([]);
  const [selected, setSelected] = useState<Term | null>(null);

  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  const abortRef = useRef<AbortController | null>(null);
  const debounceRef = useRef<number | null>(null);

  useEffect(() => {
    const query = q.trim();

    if (query.length === 0) {
      setItems([]);
      setSelected(null);
      setErr(null);
      return;
    }

    if (query.length > 50) {
      setItems([]);
      setSelected(null);
      setErr(t.tooLong);
      return;
    }

    if (debounceRef.current) window.clearTimeout(debounceRef.current);

    debounceRef.current = window.setTimeout(async () => {
      try {
        setLoading(true);
        setErr(null);

        abortRef.current?.abort();
        const controller = new AbortController();
        abortRef.current = controller;

        const res = await fetch(
          `/api/search?q=${encodeURIComponent(query)}&lang=${encodeURIComponent(locale)}`,
          {
            method: "GET",
            headers: { Accept: "application/json" },
            signal: controller.signal,
          },
        );

        if (!res.ok) {
          const body = await res.json().catch(() => null);
          throw new Error(body?.error ?? "Ошибка запроса");
        }

        const data: Term[] = await res.json();
        setItems(data);
        setSelected(data.length > 0 ? data[0] : null);
      } catch (e: unknown) {
        if (
          typeof DOMException !== "undefined" &&
          e instanceof DOMException &&
          e.name === "AbortError"
        ) {
          return;
        }

        const message =
          e instanceof Error ? e.message : String(e ?? "Неизвестная ошибка");
        setErr(message);
        setItems([]);
        setSelected(null);
      } finally {
        setLoading(false);
      }
    }, 250);

    return () => {
      if (debounceRef.current) window.clearTimeout(debounceRef.current);
    };
  }, [q, locale, t.tooLong]);

  return (
    <main className="min-h-screen bg-amber-50 text-slate-900">
      <div className="mx-auto max-w-2xl px-4 py-10">
        <h1 className="text-2xl font-semibold tracking-tight">{t.title}</h1>
        <p className="mt-2 text-sm text-slate-700">{t.subtitle}</p>

        <label className="mt-6 block">
          <span className="text-sm font-medium text-slate-800">
            {t.searchLabel}
          </span>

          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder={t.placeholder}
            autoComplete="off"
            className="
              mt-2 block w-full rounded-lg border border-amber-200
              bg-amber-100/60 px-3 py-2
              text-slate-900 placeholder:text-slate-500
              outline-none
              focus:border-amber-400 focus:ring-2 focus:ring-amber-300
            "
          />
        </label>

        <div className="mt-3 min-h-6">
          {loading && <div className="text-sm text-slate-700">{t.loading}</div>}
          {err && <div className="text-sm font-medium text-red-700">{err}</div>}
        </div>

        {items.length > 0 && (
          <section className="mt-6">
            <div className="text-sm font-semibold text-slate-800">
              {t.found}
            </div>

            <ul className="mt-2 space-y-2">
              {items.map((item) => {
                const isActive = selected?.id === item.id;

                return (
                  <li key={item.id}>
                    <button
                      type="button"
                      onClick={() => setSelected(item)}
                      className={[
                        "text-left text-sm underline underline-offset-4",
                        "hover:text-slate-950",
                        isActive
                          ? "font-semibold text-slate-950"
                          : "text-slate-800",
                      ].join(" ")}
                    >
                      {item.term}
                    </button>
                  </li>
                );
              })}
            </ul>
          </section>
        )}

        {selected && (
          <section
            className="
              mt-6 rounded-xl border border-amber-200
              bg-amber-100/40 p-4
              shadow-sm
            "
          >
            <div className="text-lg font-semibold">{selected.term}</div>
            <div className="mt-2 text-sm leading-relaxed text-slate-800">
              {selected.definition}
            </div>
          </section>
        )}

        {q.trim().length > 0 && !loading && !err && items.length === 0 && (
          <div className="mt-6 text-sm text-slate-700">{t.empty}</div>
        )}
      </div>
    </main>
  );
}
