import { StrapiRoute } from './types';

const routes: StrapiRoute<'admin'>[] = [
  // Whole settings
  {
    method: 'GET',
    path: '/settings',
    handler: 'admin.getSettings',
  },
  {
    method: 'DELETE',
    path: '/settings',
    handler: 'admin.restore',
  },
  // Services
  {
    method: 'GET',
    path: '/settings/services',
    handler: 'admin.getServices',
  },
  // Shops
  {
    method: 'GET',
    path: '/settings/shops',
    handler: 'admin.getShops',
  },
  { method: 'GET',
    path: '/settings/shops/:shopId',
    handler: 'admin.getShop'
  },
  {
    method: 'POST',
    path: '/settings/shops',
    handler: 'admin.addShop',
  },
  {
    method: 'DELETE',
    path: '/settings/shops/:shopId',
    handler: 'admin.removeShop',
  },
  {
    method: 'PUT',
    path: '/settings/shops/:shopId',
    handler: 'admin.updateShop',
  },
];

export default routes;

