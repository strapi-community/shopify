import { getFetchClient } from '@strapi/strapi/admin';
import { useMutation } from '@tanstack/react-query';

import { getApiClient } from '../api/client';
import { ShopSchemaWithIdSchema } from '../validators/shop.validator';

export const useUpdateShop = () => {
  const fetch = getFetchClient();
  const apiClient = getApiClient(fetch);

  return useMutation({
    mutationFn(body: ShopSchemaWithIdSchema) {
      return apiClient.updateShop(body);
    },
  });
};
