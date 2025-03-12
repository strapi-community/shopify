import { getFetchClient } from '@strapi/strapi/admin';
import { useMutation, useQueryClient } from '@tanstack/react-query';

import { getApiClient } from '../api/client';

export const useDeleteShop = () => {
  const fetch = getFetchClient();
  const { deleteShop } = getApiClient(fetch);
  const client = useQueryClient();

  return useMutation({
    mutationFn: deleteShop,
    onSuccess: client.clear,
  });
};
