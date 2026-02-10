export const SUPPORTED_LOCALES = ["ru", "en"] as const;
export type Locale = (typeof SUPPORTED_LOCALES)[number];

export const DEFAULT_LOCALE: Locale = "ru";

export const MESSAGES: Record<Locale, Record<string, string>> = {
  ru: {
    title: "База данных слов",
    subtitle: "Введите слово которое хотите найти.",
    searchLabel: "Поиск",
    placeholder: "Ввод",
    loading: "Загрузка...",
    found: "Найдено:",
    empty: "Ничего не найдено.",
    tooLong: "Слишком длинный запрос (макс. 50 символов).",
  },
  en: {
    title: "Word database",
    subtitle: "Type a word you want to find.",
    searchLabel: "Search",
    placeholder: "Input",
    loading: "Loading...",
    found: "Found:",
    empty: "Nothing found.",
    tooLong: "Query is too long (max 50 characters).",
  },
};

export function detectLocaleFromAcceptLanguage(
  headerValue: string | null | undefined,
): Locale {
  if (!headerValue) return DEFAULT_LOCALE;

  const parts = headerValue
    .split(",")
    .map((p) => p.trim())
    .filter(Boolean);

  const parsed = parts.map((p) => {
    const [tagRaw, ...params] = p.split(";");
    const tag = (tagRaw || "").toLowerCase();
    const qParam = params.find((x) => x.trim().startsWith("q="));
    const q = qParam ? Number(qParam.trim().slice(2)) : 1;
    return { tag, q: Number.isFinite(q) ? q : 0 };
  });

  parsed.sort((a, b) => b.q - a.q);

  for (const { tag } of parsed) {
    const base = tag.split("-")[0];
    if (base === "ru") return "ru";
    if (base === "en") return "en";
  }

  return DEFAULT_LOCALE;
}

export function normalizeLocale(value: unknown): Locale | null {
  return value === "ru" || value === "en" ? value : null;
}
