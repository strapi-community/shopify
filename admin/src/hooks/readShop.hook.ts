import { getFetchClient } from '@strapi/strapi/admin';
import { useQuery } from '@tanstack/react-query';

import { getApiClient } from '../api/client';

export const useReadShop = (id = 0) => {
  const fetch = getFetchClient();
  const { getReadShopIndex, readShop } = getApiClient(fetch);

  return useQuery({
    queryKey: getReadShopIndex(id),
    queryFn: () => readShop(id),
    enabled: !!id,
    retry: false,
  });
};
