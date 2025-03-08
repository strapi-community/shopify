import { getFetchClient } from '@strapi/strapi/admin';
import { useMutation, useQueryClient } from '@tanstack/react-query';

import { getApiClient } from '../api/client';
import { ShopSchemaWithIdSchema } from '../validators/shop.validator';

export const useDeleteShop = () => {
  const fetch = getFetchClient();
  const apiClient = getApiClient(fetch);
  const client = useQueryClient();

  return useMutation({
    mutationFn(body: ShopSchemaWithIdSchema) {
      return apiClient.deleteShop(body);
    },
    onSuccess() {
      client.clear();
    },
  });
};
