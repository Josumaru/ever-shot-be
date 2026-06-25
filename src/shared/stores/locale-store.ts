import { create } from "zustand";

export type Locale = "id" | "en" | "ja";
export const DEFAULT_LOCALE: Locale = "id";
export const LOCALE_COOKIE_NAME = "ever-shot-locale";

interface LocaleState {
  locale: Locale;
  setLocale: (locale: Locale) => void;
}

function setCookie(name: string, value: string): void {
  if (typeof document === "undefined") return;
  document.cookie = `${name}=${value};path=/;max-age=${60 * 60 * 24 * 365};SameSite=Lax`;
}

export const useLocaleStore = create<LocaleState>((set) => ({
  locale: DEFAULT_LOCALE,
  setLocale: (locale: Locale) => {
    setCookie(LOCALE_COOKIE_NAME, locale);
    set({ locale });
  },
}));
