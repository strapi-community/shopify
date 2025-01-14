import { HOST } from '../const/shopify';

export const getAddress = (address: string) => `${HOST}/api/shopify${address}`;
