"use client";

import { useEffect, useMemo, useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import type { Locale } from "@/lib/i18n";
import Image from "next/image";

type Props = {
  locale: Locale;
  onLocaleChange: (next: Locale) => void;
};

type LocaleOption = {
  code: Locale;
  label: string;
  flagSrc: string;
};

export default function LanguageSwitcher({ locale, onLocaleChange }: Props) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const [open, setOpen] = useState(false);

  const rootRef = useRef<HTMLDivElement | null>(null);
  const buttonRef = useRef<HTMLButtonElement | null>(null);

  const options: LocaleOption[] = useMemo(
    () => [
      { code: "ru", label: "Русский", flagSrc: "/flags/ru.svg" },
      { code: "en", label: "English", flagSrc: "/flags/en.svg" },
    ],
    [],
  );

  const current = options.find((o) => o.code === locale) ?? options[0];

  useEffect(() => {
    function onDocMouseDown(e: MouseEvent) {
      if (!open) return;
      const target = e.target as Node | null;
      if (!target) return;
      if (rootRef.current && !rootRef.current.contains(target)) {
        setOpen(false);
      }
    }

    document.addEventListener("mousedown", onDocMouseDown);
    return () => document.removeEventListener("mousedown", onDocMouseDown);
  }, [open]);

  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      if (!open) return;
      if (e.key === "Escape") {
        setOpen(false);

        buttonRef.current?.focus();
      }
    }

    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [open]);

  async function selectLocale(next: Locale) {
    if (next === locale) {
      setOpen(false);
      return;
    }

    onLocaleChange(next);

    await fetch("/api/locale", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ locale: next }),
    });

    setOpen(false);

    startTransition(() => {
      router.refresh();
    });
  }

  return (
    <div ref={rootRef} className="relative inline-block">
      <button
        ref={buttonRef}
        type="button"
        onClick={() => setOpen((v) => !v)}
        disabled={isPending}
        aria-haspopup="listbox"
        aria-expanded={open}
        className="
          inline-flex items-center gap-2
          rounded-lg border border-amber-200 bg-amber-100/60
          px-3 py-2 text-sm font-medium text-slate-900
          hover:bg-amber-100
          disabled:opacity-60
        "
      >
        <Image
          src={current.flagSrc}
          alt=""
          className="h-5 w-5"
          draggable={false}
          width={20}
          height={20}
        />

        <span className="uppercase">{current.code}</span>

        <span aria-hidden className="text-slate-700">
          ▾
        </span>
      </button>

      {open && (
        <div
          role="listbox"
          aria-label="Select language"
          className="
            absolute right-0 z-50 mt-2 w-44
            rounded-xl border border-amber-200 bg-amber-50
            shadow-lg
            overflow-hidden
          "
        >
          {options.map((opt) => {
            const active = opt.code === locale;

            return (
              <button
                key={opt.code}
                type="button"
                role="option"
                aria-selected={active}
                onClick={() => selectLocale(opt.code)}
                className={[
                  "w-full px-3 py-2 text-left text-sm",
                  "inline-flex items-center gap-2",
                  "hover:bg-amber-100",
                  active ? "font-semibold text-slate-950" : "text-slate-900",
                ].join(" ")}
              >
                <Image
                  src={opt.flagSrc}
                  alt=""
                  className="h-5 w-5"
                  draggable={false}
                  width={20}
                  height={20}
                />
                <span>{opt.label}</span>
                <span className="ml-auto uppercase text-xs text-slate-600">
                  {opt.code}
                </span>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
