import webhook from './webhook.controller';

const controllers = {
  webhook,
};
export type Controllers = {
  [key in keyof typeof controllers]: ReturnType<typeof controllers[key]>
}
export default controllers;
