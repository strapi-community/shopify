import webhook from './webhook.service';
import shopify from './shopify.service';
import admin from './admin.service';
import shop from './shop.service';
import cache from './cache.service';

const services = {
  webhook,
  shopify,
  admin,
  shop,
  cache,
};
export type Services = {
  [key in keyof typeof services]: ReturnType<typeof services[key]>
}
export default services;
