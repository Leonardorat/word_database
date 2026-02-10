"use client";

import { createContext, useContext, useEffect, useMemo, useState } from "react";
import type { Locale } from "@/lib/i18n";
import LanguageSwitcherUI from "@/components/LanguageSwitcher";

type LocaleContextValue = {
  locale: Locale;
  setLocale: (v: Locale) => void;
};

const LocaleContext = createContext<LocaleContextValue | null>(null);

export function useLocale() {
  const ctx = useContext(LocaleContext);
  if (!ctx) throw new Error("useLocale must be used inside RootClientShell");
  return ctx;
}

export default function RootClientShell({
  initialLocale,
  children,
}: {
  initialLocale: Locale;
  children: React.ReactNode;
}) {
  const [locale, setLocale] = useState<Locale>(initialLocale);

  useEffect(() => {
    setLocale(initialLocale);
  }, [initialLocale]);

  const value = useMemo(() => ({ locale, setLocale }), [locale]);

  return (
    <LocaleContext.Provider value={value}>{children}</LocaleContext.Provider>
  );
}

export function LanguageSwitcher() {
  const { locale, setLocale } = useLocale();
  return <LanguageSwitcherUI locale={locale} onLocaleChange={setLocale} />;
}
