import { getFetchClient } from '@strapi/strapi/admin';
import { useQuery } from '@tanstack/react-query';
import { getApiClient } from '../api/client';

export const useShops = () => {
  const fetch = getFetchClient();
  const apiClient = getApiClient(fetch);

  return useQuery({
    queryKey: apiClient.readAllIndex(),
    queryFn() {
      return apiClient.readAll();
    }
  });
};
