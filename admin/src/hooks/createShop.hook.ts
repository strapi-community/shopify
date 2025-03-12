import { getFetchClient } from '@strapi/strapi/admin';
import { useMutation } from '@tanstack/react-query';

import { getApiClient } from '../api/client';

export const useCreateShop = () => {
  const fetch = getFetchClient();
  const { createShop } = getApiClient(fetch);

  return useMutation({
    mutationFn: createShop,
  });
};
