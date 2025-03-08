import { Path } from '@sensinum/strapi-utils';
import type { EN } from './en';

export * from './utils';

export type TranslationPath = Path<EN>;

export const en = () => import('./en');
