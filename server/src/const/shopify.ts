export const HOOK_TYPE = {
  COMMON: {
    name: 'COMMON',
    pathSuffix: '/api/shopify/webhooks',
  },
} as const;

export const HOOK_OPERATION_TYPE = {
  CREATE: 'CREATE',
  UPDATE: 'UPDATE',
  REMOVE: 'REMOVE',
} as const;
