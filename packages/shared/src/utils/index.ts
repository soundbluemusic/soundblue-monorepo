export { cn } from './cn';
export {
  getValidatedStorageItem,
  getStorageItem,
  setStorageItem,
  removeStorageItem,
  getRawStorageItem,
  setRawStorageItem,
} from './storage';

// i18n utilities
export {
  type BaseLocale,
  type I18nPathConfig,
  DEFAULT_I18N_CONFIG,
  getLocaleFromPath,
  getPathWithoutLocale,
  getLocalizedPath,
  createLocalizedPathBuilder,
  hasLocalePrefix,
  getOppositeLocale,
} from './i18n';
