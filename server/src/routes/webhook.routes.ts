import { HOOK_TYPE } from '../const/shopify';
import { StrapiRoute } from './types';

const clearPathSuffix = (pathSuffix: string) => pathSuffix.replace('/api/shopify', '');

const routes: StrapiRoute<'webhook'>[] = [
  {
    method: 'POST',
    path: clearPathSuffix(HOOK_TYPE.COMMON.pathSuffix),
    handler: 'webhook.handleWebhook',
    config: {
      auth: false,
      policies: [],
    },
  },
];

export default routes;
