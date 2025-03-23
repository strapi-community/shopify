import { set } from 'lodash';
import { ProductFieldsResult } from '../../@types/document.service';
import { ShopService } from '../../services/shopify.service';

/**
 * Apply product values to the result
 */
export const applyProductValues = async <T extends object = any>(
  result: T,
  productFields: ProductFieldsResult,
  shopifyService: ShopService
): Promise<T> => {
  for (const [vendor, attrWithProd] of productFields) {
    const productsValues = await shopifyService.getProductsById(
      vendor,
      Array.from(attrWithProd.values())
    );
    for (const [attribute, product] of attrWithProd) {
      if (productsValues.get(product)) {
        set(result, attribute, productsValues.get(product));
      }
    }
  }
  return result;
};
