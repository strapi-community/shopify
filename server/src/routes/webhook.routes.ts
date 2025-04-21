import { HOOK_TYPE, PLUGIN_ID } from '../const';
import { StrapiRoute } from './types';

const clearPathSuffix = (pathSuffix: string) => pathSuffix.replace(`/api/${PLUGIN_ID}`, '');

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
