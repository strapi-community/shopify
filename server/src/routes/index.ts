import webhook from './webhook.routes';
import admin from './admin.routes';
import contentManager from './content.manager.routes';

export default {
  'content-api': {
    type: 'content-api',
    routes: webhook,
  },
  admin: {
    type: 'admin',
    routes: [...admin,...contentManager],
  },
};
