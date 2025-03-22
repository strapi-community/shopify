// TODO: Propagate to other places
export const PLUGIN_ID = 'shopify' as const;

export const HOOK_TYPE = {
  COMMON: {
    name: 'COMMON',
    pathSuffix: `/api/${PLUGIN_ID}/webhooks`,
  },
} as const;

export const HOOK_OPERATION_TYPE = {
  CREATE: 'CREATE',
  UPDATE: 'UPDATE',
  REMOVE: 'REMOVE',
} as const;
