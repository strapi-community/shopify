import { getFetchClient } from '@strapi/strapi/admin';
import { useQuery } from '@tanstack/react-query';

import { getApiClient } from '../api/client';

export const useReadShop = (id?: number) => {
  const fetch = getFetchClient();
  const apiClient = getApiClient(fetch);

  return useQuery({
    queryKey: apiClient.getReadShopIndex(id ?? 0),
    queryFn() {
      return apiClient.readShop(id ?? 0);
    },
    enabled: !!id,
  });
};
