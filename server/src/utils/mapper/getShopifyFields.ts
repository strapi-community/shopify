import type { UID } from '@strapi/strapi';
import { Middleware } from '@strapi/types/dist/modules/documents';
import { ComponentField, DynamicZoneField, FieldType, ProductFieldsResult, RelationField } from '../../@types/document.service';
import { COMPONENT_FIELDS } from '../../const';

/**
 * Adds a shopify product to the result map
 */
const addShopifyProductToResult = (
  result: ProductFieldsResult,
  vendor: string,
  fieldPath: string,
  product: string
): void => {
  if (!result.has(vendor)) {
    result.set(vendor, new Map<string, string>([[fieldPath, product]]));
  } else {
    result.get(vendor).set(fieldPath, product);
  }
};
/**
 * Process a raw field containing shopify product data
 */
const processRawField = (fieldData: any, fieldPath: string, result: ProductFieldsResult): void => {
  if (fieldData.vendor && fieldData.product) {
    return addShopifyProductToResult(result, fieldData.vendor, fieldPath, fieldData.product);
  }
  if (fieldData.vendor && fieldData.productId) {
    return addShopifyProductToResult(result, fieldData.vendor, fieldPath, fieldData.productId);
  }
  // TODO: remove this case
  if (fieldData.shopId && fieldData.productId) {
    return addShopifyProductToResult(result, fieldData.shopId, fieldPath, fieldData.productId);
  }
};
/**
 * Process component data recursively
 */
const processComponentData = (
  componentFields: Array<FieldType>,
  data: any,
  basePath: string,
  result: ProductFieldsResult,
  contentTypes: Map<UID.ContentType, Array<FieldType>>,
  components: Map<UID.ContentType, Array<FieldType>>
): void => {
  if (!data || typeof data !== 'object') return;

  componentFields.forEach((field) => {
    const fieldPath = `${basePath}.${field.field}`;
    const fieldData = data[field.field];

    if (!fieldData) return;

    switch (field.type) {
      case COMPONENT_FIELDS.RAW:
        processRawField(fieldData, fieldPath, result);
        break;
      case COMPONENT_FIELDS.COMPONENT:
        processComponentField(field, fieldData, fieldPath, result, contentTypes, components);
        break;
      case COMPONENT_FIELDS.RELATION:
        processRelationField(field, fieldData, fieldPath, result, contentTypes, components);
        break;
      case COMPONENT_FIELDS.DYNAMICZONE:
        if (Array.isArray(fieldData)) {
          processDynamicZoneField(fieldData, fieldPath, result, contentTypes, components);
        }
        break;
    }
  });
};
/**
 * Process a component field
 */
const processComponentField = (
  field: ComponentField,
  data: any,
  basePath: string,
  result: ProductFieldsResult,
  contentTypes: Map<UID.ContentType, Array<FieldType>>,
  components: Map<UID.ContentType, Array<FieldType>>
): void => {
  if (!data) return;

  // Get component fields - use type assertion to avoid type error
  const componentFields = components.get(field.component as unknown as UID.ContentType);
  if (!componentFields) return;

  // Handle repeatable components (array of components)
  if (field.repeatable && Array.isArray(data)) {
    data.forEach((item, index) => {
      const itemPath = `${basePath}.${index}`;
      processComponentData(componentFields, item, itemPath, result, contentTypes, components);
    });
  } else {
    // Handle single component
    processComponentData(componentFields, data, basePath, result, contentTypes, components);
  }
};
/**
 * Process a relation field
 */
const processRelationField = (
  field: RelationField,
  data: any,
  basePath: string,
  result: ProductFieldsResult,
  contentTypes: Map<UID.ContentType, Array<FieldType>>,
  components: Map<UID.ContentType, Array<FieldType>>
): void => {
  if (!data) return;

  // Get relation fields
  const relationFields = contentTypes.get(field.target);
  if (!relationFields) return;

  // Handle relation collection (array of relations)
  if (Array.isArray(data)) {
    data.forEach((item, index) => {
      const itemPath = `${basePath}.${index}`;
      processComponentData(relationFields, item, itemPath, result, contentTypes, components);
    });
  } else {
    // Handle single relation
    processComponentData(relationFields, data, basePath, result, contentTypes, components);
  }
};
/**
 * Process a dynamic zone field
 */
const processDynamicZoneField = (
  fieldData: any[],
  fieldPath: string,
  result: ProductFieldsResult,
  contentTypes: Map<UID.ContentType, Array<FieldType>>,
  components: Map<UID.ContentType, Array<FieldType>>
): void => {
  if (!Array.isArray(fieldData)) return;

  fieldData.forEach((dzItem, dzIndex) => {
    if (dzItem && dzItem.__component) {
      // Use type assertion to avoid type error
      const dzComponent = components.get(dzItem.__component as unknown as UID.ContentType);
      if (dzComponent) {
        processComponentData(
          dzComponent,
          dzItem,
          `${fieldPath}.${dzIndex}`,
          result,
          contentTypes,
          components
        );
      }
    }
  });
};
/**
 * Process an array of results
 */
const processArrayResults = (
  contentType: Array<FieldType>,
  fetchedResult: any[],
  contentTypes: Map<UID.ContentType, Array<FieldType>>,
  components: Map<UID.ContentType, Array<FieldType>>
): ProductFieldsResult => {
  const result = new Map<string, Map<string, string>>();
  fetchedResult.forEach((element, index) => {
    contentType.forEach((field) => {
      const fieldData = element[field.field];
      if (!fieldData) return;

      const path = `${index}.${field.field}`;

      switch (field.type) {
        case COMPONENT_FIELDS.RAW:
          processRawField(fieldData, path, result);
          break;
        case COMPONENT_FIELDS.COMPONENT:
          processComponentField(field, fieldData, path, result, contentTypes, components);
          break;
        case COMPONENT_FIELDS.RELATION:
          processRelationField(field, fieldData, path, result, contentTypes, components);
          break;
        case COMPONENT_FIELDS.DYNAMICZONE:
          if (Array.isArray(fieldData)) {
            processDynamicZoneField(fieldData, path, result, contentTypes, components);
          }
          break;
      }
    });
  });
  return result;
};
/**
 * Process a single result object
 */
const processSingleResult = (
  contentType: Array<FieldType>,
  nextResult: Awaited<ReturnType<Middleware.Middleware>>,
  contentTypes: Map<UID.ContentType, Array<FieldType>>,
  components: Map<UID.ContentType, Array<FieldType>>
): ProductFieldsResult => {
  const result = new Map<string, Map<string, string>>();
  contentType.forEach((field) => {
    const fieldData = nextResult[field.field];
    if (!fieldData) return;

    switch (field.type) {
      case COMPONENT_FIELDS.RAW:
        processRawField(fieldData, field.field, result);
        break;
      case COMPONENT_FIELDS.COMPONENT:
        processComponentField(field, fieldData, field.field, result, contentTypes, components);
        break;
      case COMPONENT_FIELDS.RELATION:
        processRelationField(field, fieldData, field.field, result, contentTypes, components);
        break;
      case COMPONENT_FIELDS.DYNAMICZONE:
        if (Array.isArray(fieldData)) {
          processDynamicZoneField( fieldData, field.field, result, contentTypes, components);
        }
        break;
    }
  });
  return result;
};

type ProductFieldsParams = {
  contentType: Array<FieldType>;
  fetchedData: Awaited<ReturnType<Middleware.Middleware>>;
  contentTypes: Map<UID.ContentType, Array<FieldType>>;
  components: Map<UID.ContentType, Array<FieldType>>;
};
/**
 * Get product fields from the result
 */
export const getShopifyFields = ({
  contentType,
  fetchedData,
  contentTypes,
  components,
}: ProductFieldsParams): ProductFieldsResult => {
  if (!fetchedData || typeof fetchedData !== 'object') {
    return new Map<string, Map<string, string>>();
  }
  if (Array.isArray(fetchedData)) {
    return processArrayResults(contentType, fetchedData, contentTypes, components);
  } else {
    return processSingleResult(contentType, fetchedData, contentTypes, components);
  }
};
