import { getFetchClient } from '@strapi/strapi/admin';
import { useQuery } from '@tanstack/react-query';
import { getApiClient } from '../api/client';

export const useServices = () => {
  const fetch = getFetchClient();
  const apiClient = getApiClient(fetch);

  return useQuery({
    queryKey: apiClient.readServicesIndex(),
    queryFn() {
      return apiClient.readServices();
    },
  });
};
