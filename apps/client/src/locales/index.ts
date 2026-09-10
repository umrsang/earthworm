import { createI18n } from "vue-i18n";
import { LOCALES, STORAGE_KEYS } from "../constants";
import en from "./en";
import zh from "./zh";

/** 获取当前系统默认语言 */
function getDefaultLocale(): string {
  const saved = localStorage.getItem(STORAGE_KEYS.LOCALE);
  if (saved && (saved === LOCALES.ZH_CN || saved === LOCALES.EN_US)) {
    return saved;
  }
  return LOCALES.ZH_CN;
}

export const i18n = createI18n({
  legacy: false,
  locale: getDefaultLocale(),
  fallbackLocale: LOCALES.ZH_CN,
  messages: {
    [LOCALES.ZH_CN]: zh,
    [LOCALES.EN_US]: en,
  },
});

/**
 * 切换系统界面语言
 * @param locale 目标语言代码
 */
export function setLanguage(locale: string): void {
  i18n.global.locale.value = locale as any;
  localStorage.setItem(STORAGE_KEYS.LOCALE, locale);
}
