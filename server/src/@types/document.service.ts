// Type definitions
import type { UID } from '@strapi/strapi';
import type { COMPONENT_FIELDS } from '../const';

type CustomField = string;
type RawField = {
  type: typeof COMPONENT_FIELDS.RAW;
  field: CustomField;
};
export type ComponentField = {
  type: typeof COMPONENT_FIELDS.COMPONENT;
  field: CustomField;
  component: UID.Component;
  repeatable: boolean;
};
export type RelationField = {
  type: typeof COMPONENT_FIELDS.RELATION;
  field: CustomField;
  target: UID.ContentType;
};
export type DynamicZoneField = {
  type: typeof COMPONENT_FIELDS.DYNAMICZONE;
  field: CustomField;
  components: Array<UID.Component>;
};
export type FieldType = RawField | ComponentField | RelationField | DynamicZoneField;
export type ProductFieldsResult = Map<string, Map<string, string>>;
