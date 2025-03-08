import { PLUGIN_ID } from '../pluginId';
import { TranslationKey } from './types';

export const getTradId = (key: TranslationKey) => `${PLUGIN_ID}.${key}`;

export const getTrad = (key: TranslationKey, defaultMessage?: string) => {
  const id = getTradId(key);

  return {
    id,
    defaultMessage: defaultMessage ?? id,
  };
};

export function isTranslationKey(key: string, allKeys: Array<string>): key is TranslationKey {
  return allKeys.includes(key);
}
