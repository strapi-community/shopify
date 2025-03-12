import { getFetchClient } from '@strapi/strapi/admin';
import { useQuery } from '@tanstack/react-query';
import { getApiClient } from '../api/client';

export const useServices = () => {
  const fetch = getFetchClient();
  const { readServices, readServicesIndex } = getApiClient(fetch);

  return useQuery({
    queryKey: readServicesIndex(),
    queryFn: readServices,
  });
};
