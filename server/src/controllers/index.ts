import contentManagerController from './content.manager.controller';
import webhook from './webhook.controller';
import admin from './admin.controller';

const controllers = {
  webhook,
  admin,
  contentManager: contentManagerController
};
export type Controllers = {
  [key in keyof typeof controllers]: ReturnType<typeof controllers[key]>
}
export default controllers;
