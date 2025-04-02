import { getFetchClient } from '@strapi/strapi/admin';
import { useQuery } from '@tanstack/react-query';

import { getApiClient } from '../api/client';

export const useReadVendors = () => {
  const fetch = getFetchClient();
  const { readVendors, getReadVendorsIndex } = getApiClient(fetch);

  return useQuery({
    queryKey: getReadVendorsIndex(),
    queryFn: () => readVendors(),
  });
};
