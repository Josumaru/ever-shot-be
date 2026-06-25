import id from "@/../public/locales/id.json";
import en from "@/../public/locales/en.json";
import ja from "@/../public/locales/ja.json";
import { useLocaleStore, type Locale } from "@/shared/stores/locale-store";

type NestedTranslations = Record<string, string | Record<string, unknown>>;

function flatten(obj: NestedTranslations, prefix = ""): Record<string, string> {
  const result: Record<string, string> = {};

  for (const [key, value] of Object.entries(obj)) {
    if (key === "$" && typeof value === "string") {
      result[prefix] = value;
      result[`${prefix}.$`] = value;
    } else if (typeof value === "string") {
      result[prefix ? `${prefix}.${key}` : key] = value;
    } else if (typeof value === "object" && value !== null) {
      Object.assign(
        result,
        flatten(value as NestedTranslations, prefix ? `${prefix}.${key}` : key),
      );
    }
  }

  return result;
}

const idFlat = flatten(id as NestedTranslations);
const enFlat = flatten(en as NestedTranslations);
const jaFlat = flatten(ja as NestedTranslations);

function interpolate(text: string, params?: Record<string, string>): string {
  if (!params) return text;
  return text.replace(/\{(\w+)\}/g, (_, key) => params[key] ?? `{${key}}`);
}

const tables: Record<Locale, Record<string, string>> = {
  id: idFlat,
  en: enFlat,
  ja: jaFlat,
};

export function t(
  key: string,
  params?: Record<string, string>,
  locale?: Locale,
): string {
  const currentLocale = locale ?? useLocaleStore.getState().locale;
  const table = tables[currentLocale] ?? idFlat;
  return interpolate(table[key] ?? key, params);
}

export function useTranslation() {
  const locale = useLocaleStore((s) => s.locale);
  const setLocale = useLocaleStore((s) => s.setLocale);
  const table = tables[locale] ?? idFlat;

  return {
    t: (key: string, params?: Record<string, string>) =>
      interpolate(table[key] ?? key, params),
    locale,
    setLocale,
  };
}

export function tServer(
  locale: string,
  key: string,
  params?: Record<string, string>,
): string {
  const table = tables[locale as Locale] ?? idFlat;
  return interpolate(table[key] ?? key, params);
}

export { idFlat, enFlat, jaFlat };
