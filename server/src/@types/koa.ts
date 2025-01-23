import type { Context } from 'koa';

export interface RequestContext extends Context {
  badRequest(response?: string | object, details?: object): Context;
}
