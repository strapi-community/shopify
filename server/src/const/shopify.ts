export const HOST = 'https://abf8-95-48-69-69.ngrok-free.app';

export enum ShopifyWebhookTopic {
  PRODUCTS_CREATE = 'products/create',
  PRODUCTS_UPDATE = 'products/update',
  PRODUCTS_DELETE = 'products/delete',
  ORDERS_CREATE = 'orders/create',
  ORDERS_UPDATE = 'orders/update',
  ORDERS_DELETE = 'orders/delete',
}
