import { getFetchClient } from '@strapi/strapi/admin';
import { useQuery } from '@tanstack/react-query';

import { getApiClient } from '../api/client';

export const useReadShopProducts = (input: { vendor: string; query: string }) => {
  const fetch = getFetchClient();
  const { readShopProducts, getReadShopProductsIndex } = getApiClient(fetch);

  return useQuery({
    queryKey: getReadShopProductsIndex(input),
    queryFn: () => readShopProducts(input),
    enabled: input.query.length > 2,
  });
};
