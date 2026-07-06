import { useCallback } from "react";

import { usePreferencesStore, type LanguageCode } from "../features/preferences";
import { translations, type TranslationKey } from "./translations";

type TranslationParams = Record<string, number | string>;

export type Translate = (
  key: TranslationKey,
  params?: TranslationParams,
) => string;

export const translate = (
  language: LanguageCode,
  key: TranslationKey,
  params?: TranslationParams,
): string => {
  const template: string = translations[language][key] ?? translations.en[key];

  if (!params) {
    return template;
  }

  return Object.entries(params).reduce<string>(
    (result, [paramKey, paramValue]) =>
      result.replaceAll(`{${paramKey}}`, String(paramValue)),
    template,
  );
};

export const useTranslation = () => {
  const language = usePreferencesStore((state) => state.language);

  const t = useCallback<Translate>(
    (key, params) => translate(language, key, params),
    [language],
  );

  return {
    language,
    t,
  };
};
