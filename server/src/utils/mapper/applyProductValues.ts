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
    for (const [attribute, productId] of attrWithProd) {
      const shopifyProduct = productsValues.get(productId);
      if (shopifyProduct) {
        set(result, attribute, {
          ...shopifyProduct,
          vendor,
          productId,
        });
      }
    }
  }
  return result;
};
