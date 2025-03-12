import { getFetchClient } from '@strapi/strapi/admin';
import { useMutation } from '@tanstack/react-query';

import { getApiClient } from '../api/client';

export const useUpdateShop = () => {
  const fetch = getFetchClient();
  const { updateShop } = getApiClient(fetch);

  return useMutation({
    mutationFn: updateShop,
  });
};
