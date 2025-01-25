export const HOOK_TYPE = {
  ORDER: {
    name: 'ORDER',
    pathSuffix: '/api/shopify/webhooks/orders',
  },
  PRODUCT: {
    name: 'PRODUCT',
    pathSuffix: '/api/shopify/webhooks/products',
  }
} as const;

export const HOOK_OPERATION_TYPE = {
  CREATE: 'CREATE',
  UPDATE: 'UPDATE',
  REMOVE: 'REMOVE',
} as const;
