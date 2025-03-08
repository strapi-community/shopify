import { getFetchClient } from '@strapi/strapi/admin';
import { useMutation } from '@tanstack/react-query';

import { getApiClient } from '../api/client';
import { NewShopSchemaWithIdSchema } from '../validators/shop.validator';

export const useCreateShop = () => {
  const fetch = getFetchClient();
  const apiClient = getApiClient(fetch);

  return useMutation({
    mutationFn(body: NewShopSchemaWithIdSchema) {
      return apiClient.createShop(body);
    },
  });
};
