import type { StrapiContext } from '../@types';
import { ShopWithWebhooks } from '../repositories/validators';
import { getWebhookRepository } from '../repositories/webhook';
import { getService } from '../utils/getService';

export default ({ strapi }: StrapiContext) => {
  const webhookService = getService(strapi, 'webhook');
  const webhookRepository = getWebhookRepository(strapi);

  return {
    async init(shopsConfig: Array<ShopWithWebhooks>) {
      return Promise.all(
        shopsConfig.map(async (config) => {
          const hooks = await webhookService.create(config.address, config.webhooks);
          if (hooks.length) {
            await Promise.all(hooks.map((data) => webhookRepository.update({ id: data.id }, data)));
          }
        })
      );
    },
  };
};
