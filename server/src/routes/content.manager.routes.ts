import { StrapiRoute } from './types';

const routes: StrapiRoute<'contentManager'>[] = [
  {
    method: 'GET',
    path: '/content-manager/vendors',
    handler: 'contentManager.getVendors',
  },
  {
    method: 'GET',
    path: '/content-manager/products',
    handler: 'contentManager.getProducts',
  },
];

export default routes;
