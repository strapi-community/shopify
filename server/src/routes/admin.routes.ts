import { StrapiRoute } from './types';
import { pluginPermissions } from '../permissions';

const routes: StrapiRoute<'admin'>[] = [
  // Whole settings
  {
    method: 'GET',
    path: '/settings',
    handler: 'admin.getSettings',
    config: {
      policies: [
        {
          name: 'admin::hasPermissions',
          config: {
            actions: [pluginPermissions.render('settings')],
          },
        },
      ],
    },
  },
  {
    method: 'DELETE',
    path: '/settings',
    handler: 'admin.restore',
    config: {
      policies: [
        {
          name: 'admin::hasPermissions',
          config: {
            actions: [pluginPermissions.render('settings')],
          },
        },
      ],
    },
  },
  // Services
  {
    method: 'GET',
    path: '/settings/services',
    handler: 'admin.getServices',
    config: {
      policies: [
        {
          name: 'admin::hasPermissions',
          config: {
            actions: [pluginPermissions.render('settings')],
          },
        },
      ],
    },
  },
  // Shops
  {
    method: 'GET',
    path: '/settings/shops',
    handler: 'admin.getShops',
    config: {
      policies: [
        {
          name: 'admin::hasPermissions',
          config: {
            actions: [pluginPermissions.render('settings')],
          },
        },
      ],
    },
  },
  {
    method: 'GET',
    path: '/settings/shops/:shopId',
    handler: 'admin.getShop',
    config: {
      policies: [
        {
          name: 'admin::hasPermissions',
          config: {
            actions: [pluginPermissions.render('settings')],
          },
        },
      ],
    },
  },
  {
    method: 'POST',
    path: '/settings/shops',
    handler: 'admin.addShop',
    config: {
      policies: [
        {
          name: 'admin::hasPermissions',
          config: {
            actions: [pluginPermissions.render('settings')],
          },
        },
      ],
    },
  },
  {
    method: 'DELETE',
    path: '/settings/shops/:shopId',
    handler: 'admin.removeShop',
    config: {
      policies: [
        {
          name: 'admin::hasPermissions',
          config: {
            actions: [pluginPermissions.render('settings')],
          },
        },
      ],
    },
  },
  {
    method: 'PUT',
    path: '/settings/shops/:shopId',
    handler: 'admin.updateShop',
    config: {
      policies: [
        {
          name: 'admin::hasPermissions',
          config: {
            actions: [pluginPermissions.render('settings')],
          },
        },
      ],
    },
  },
];

export default routes;

