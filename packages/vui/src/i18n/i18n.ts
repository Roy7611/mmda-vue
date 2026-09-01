/*
 * @Author: kuayue 1594492894@qq.com
 * @Date: 2024-09-18 19:15:16
 * @LastEditors: kuayue 1594492894@qq.com
 * @LastEditTime: 2025-05-28 10:03:48
 * @FilePath: /mmda-vue/packages/vui/src/i18n/i18n.ts
 * @Description: 这是默认设置,请设置`customMade`, 打开koroFileHeader查看配置 进行设置: https://github.com/OBKoro1/koro1FileHeader/wiki/%E9%85%8D%E7%BD%AE
 */
import { isRef, nextTick } from "vue";
import { createI18n, type I18n } from "vue-i18n";

import en from "./locales/en";
import zh from "./locales/zh";
import zhHant from "./locales/zh-Hant";
import { numberFormats, datetimeFormats } from "./formats";

// export type TranslateFn = (path: string, ...params: any[]) => string

export const supportLocales: Record<string, string> = {
  en: "locale.en",
  zh: "locale.zh",
  "zh-Hant": "locale.zhHant",
};

function interpolate(
  template: string,
  params?: Record<string, unknown>,
): string {
  if (!params) return template;
  return template.replace(/\{(\w+)\}/g, (_, name: string) =>
    params[name] == null ? `{${name}}` : String(params[name]),
  );
}

function lookupMessage(
  messages: Record<string, any>,
  key: string,
): string | undefined {
  const value = key.split(".").reduce<unknown>((current, part) => {
    if (current && typeof current === "object") {
      return (current as Record<string, unknown>)[part];
    }
    return undefined;
  }, messages);
  return typeof value === "string" ? value : undefined;
}

let currentI18n: I18n | undefined;

export function translateMessage(
  key: string,
  params?: Record<string, unknown>,
): string {
  if (currentI18n) return String((currentI18n.global.t as any)(key, params));
  const fallback = lookupMessage(zh, key);
  return fallback ? interpolate(fallback, params) : key;
}

export type SupportLocales = "en" | "zh" | "zh-Hant";

export function setupI18n(
  messages: Record<string, any>,
  locale: SupportLocales = "zh",
  fallbackLocale: SupportLocales = "en",
): I18n {
  const i18n = createI18n<false>({
    legacy: false,
    locale,
    fallbackLocale,
    messages,
    numberFormats,
    datetimeFormats,
    globalInjection: true,
    // sharedMessages:{
    //   en,
    //   zh,
    //   'zh-Hant':zhHant
    // },
  });

  i18n.global.mergeLocaleMessage("en", en);
  i18n.global.mergeLocaleMessage("zh", zh);
  i18n.global.mergeLocaleMessage("zh-Hant", zhHant);
  currentI18n = i18n;

  // if(otherMessages){
  //   Object.keys(supportLocales).forEach((locale)=>{
  //     if(otherMessages[locale]) i18n.global.mergeLocaleMessage(locale,otherMessages[locale])
  //   })
  // }

  setI18nLocale(i18n, locale);
  return i18n;
}

export function setupUniAppI18n(
  messages: Record<string, any>,
  locale: SupportLocales = "zh",
  fallbackLocale: SupportLocales = "en",
): I18n {
  const i18n = createI18n<false>({
    legacy: false,
    locale,
    fallbackLocale,
    messages,
    numberFormats,
    datetimeFormats,
    globalInjection: true,
  });

  // i18n.global.mergeLocaleMessage('en', en)
  // i18n.global.mergeLocaleMessage('zh', zh)
  // i18n.global.mergeLocaleMessage('zh-Hant', zhHant)

  return i18n;
}

export function setI18nLocale(i18n: I18n, locale: string) {
  if (isRef(i18n.global.locale)) i18n.global.locale.value = locale;
  else i18n.global.locale = locale;
  /**
   * NOTE:
   * If you need to specify the language setting for headers, such as the `fetch` API, set it here.
   * The following is an example for axios.
   *
   * axios.defaults.headers.common['Accept-Language'] = locale
   */
  document.querySelector("html").setAttribute("lang", locale);
}

export async function loadLocaleMessage(i18n: I18n, locale: string) {
  // load locale messages with dynamic import
  const messages = await import(
    /* webpackChunkName: "locale-[request]" */ `./locales/${locale}.json`
  );

  // set locale and locale message
  i18n.global.setLocaleMessage(locale, messages.default);

  return nextTick();
}
