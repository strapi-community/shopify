import { getFetchClient } from '@strapi/strapi/admin';
import { useQuery } from '@tanstack/react-query';

import { getApiClient } from '../api/client';

export const useReadShopProducts = (id = 0) => {
  const fetch = getFetchClient();
  const { readShopProducts, getReadShopProductsIndex } = getApiClient(fetch);

  return useQuery({
    queryKey: getReadShopProductsIndex(id),
    queryFn: () => readShopProducts(id),
    enabled: !!id,
  });
};
