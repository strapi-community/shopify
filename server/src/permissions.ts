'use strict';

import { Core } from '@strapi/strapi';
import { PLUGIN_ID } from './const';

const permissions = {
  settings: 'settings',
};
export const pluginPermissions = {
  render: function (uid: keyof typeof permissions) {
    return `plugin::${PLUGIN_ID}.${uid}`;
  },
  [PLUGIN_ID]: permissions,
};

export const setupPermissions = async ({ strapi }: { strapi: Core.Strapi }) => {
  // Add permissions
  const actions = [
    {
      section: 'plugins',
      displayName: 'Settings',
      uid: pluginPermissions[PLUGIN_ID].settings,
      pluginName: PLUGIN_ID,
    },
  ];

  await strapi.admin.services.permission.actionProvider.registerMany(actions);
};
