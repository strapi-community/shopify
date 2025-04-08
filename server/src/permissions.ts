'use strict';

import { Core } from '@strapi/strapi';
import { PLUGIN_ID } from './const';

const permissions = {
  render: function (uid: string) {
    return `plugin::${PLUGIN_ID}.${uid}`;
  },
  [PLUGIN_ID]: {
    settings: 'settings',
  },
};

export const setupPermissions = async ({ strapi }: { strapi: Core.Strapi }) => {
  // Add permissions
  const actions = [
    {
      section: 'plugins',
      displayName: 'Settings',
      uid: permissions[PLUGIN_ID].settings,
      pluginName: PLUGIN_ID,
    },
  ];

  await strapi.admin.services.permission.actionProvider.registerMany(actions);
};
