import { getFetchClient } from '@strapi/strapi/admin';
import { useQuery } from '@tanstack/react-query';
import { getApiClient } from '../api/client';

export const useShops = () => {
  const fetch = getFetchClient();
  const { readAllIndex, readAll } = getApiClient(fetch);
  console.log('useShops::',);

  return useQuery({
    queryKey: readAllIndex(),
    queryFn: readAll,
  });
};
