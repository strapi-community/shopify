import webhook from './webhook.routes';
import admin from './admin.routes';

export default {
  'content-api': {
    type: 'content-api',
    routes: webhook,
  },
  admin: {
    type: 'admin',
    routes: admin,
  },
};
