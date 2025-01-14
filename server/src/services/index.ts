import webhook from './webhook.service';
import shopify from './shopify.service';

const services = {
  webhook,
  shopify,
};
export type Services = {
  [key in keyof typeof services]: ReturnType<typeof services[key]>
}
export default services;
