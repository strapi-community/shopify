import type { StrapiContext } from '../@types';

const WebhookService = ({ strapi }: StrapiContext) => ({
  getWelcomeMessage() {
    return 'Welcome to Strapi 🚀';
  },
});

export default WebhookService;
