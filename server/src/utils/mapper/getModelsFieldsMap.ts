import type { Schema, UID } from '@strapi/strapi';
import { Attribute } from '@strapi/types/dist/schema';
import { FieldType } from '../../@types/document.service';
import {
  BLACKLISTED_FIELDS,
  BLACKLISTED_RELATIONS,
  COMPONENT_FIELDS,
  SHOPIFY_CUSTOM_FIELDS,
} from '../../const';

/**
 * Gets models with custom fields from content types or components
 */
export const getModelsFieldsMap = (
  data: Schema.ContentTypes | Schema.Components
): Map<UID.ContentType, Array<FieldType>> => {
  return new Map(
    Object.entries(data).reduce<[UID.ContentType, Array<FieldType>][]>(
      (acc, [contentTypeName, { attributes }]) => {
        if (!attributes || typeof attributes !== 'object') {
          return acc;
        }

        const attributesWithCustomField = Object.entries(attributes)
          .map(([attributeName, attribute]: [string, Attribute.AnyAttribute]) =>
            mapAttributeToField(attributeName, attribute)
          )
          .filter(Boolean);

        if (attributesWithCustomField.length === 0) {
          return acc;
        }

        return [...acc, [contentTypeName as UID.ContentType, attributesWithCustomField]];
      },
      []
    )
  );
};
/**
 * Maps attribute to its corresponding field type
 */
const mapAttributeToField = (
  attributeName: string,
  attribute: Attribute.AnyAttribute
): FieldType | undefined => {
  if (attribute) {
    switch (attribute.type) {
      case COMPONENT_FIELDS.COMPONENT:
        return {
          type: COMPONENT_FIELDS.COMPONENT,
          field: attributeName,
          component: attribute.component,
          repeatable: attribute.repeatable,
        };
      case COMPONENT_FIELDS.DYNAMICZONE:
        return {
          type: COMPONENT_FIELDS.DYNAMICZONE,
          field: attributeName,
          components: attribute.components,
        };
      case COMPONENT_FIELDS.RELATION:
        if (
          'target' in attribute &&
          !BLACKLISTED_RELATIONS.some((_) => attribute.target.startsWith(_)) &&
          !BLACKLISTED_FIELDS.includes(attributeName)
        ) {
          return { type: 'relation', field: attributeName, target: attribute.target };
        }
        return undefined;
      default:
        if (
          typeof attribute === 'object' &&
          'customField' in attribute &&
          attribute.customField === SHOPIFY_CUSTOM_FIELDS
        ) {
          return { field: attributeName, type: 'raw' };
        }
        return undefined;
    }
  }
  return undefined;
};
