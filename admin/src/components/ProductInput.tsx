import { CustomFieldInputProps, Field } from '@sensinum/strapi-utils';
import { Box, Flex } from '@strapi/design-system';
import { useNotification } from '@strapi/strapi/admin';
import { FC, useEffect, useState } from 'react';
import { useIntl } from 'react-intl';
import { z } from 'zod';

import { Combobox, ComboboxOption } from '@strapi/design-system';
import { useReadShopProducts } from 'src/hooks/readProducts.hook';
import { useShops } from '../hooks/listShops.hook';
import { getTrad } from '../translations';

interface Props extends CustomFieldInputProps {}

const validState = z.object({
  shopId: z.string().optional(),
  productId: z.string().optional(),
  state: z.literal('valid'),
});

type ActiveValueSchema = z.infer<typeof activeValueSchema>;
const activeValueSchema = z
  .discriminatedUnion('state', [
    validState,
    z.object({
      state: z.literal('invalid'),
    }),
  ])
  .transform((value) =>
    value.state === 'invalid'
      ? value
      : {
          ...value,
          shopId: value.shopId ? parseInt(value.shopId, 10) : undefined,
          productId: value.productId ? parseInt(value.productId, 10) : undefined,
        }
  );

const valueSchema = z
  .string()
  .nullish()
  .transform((value): ActiveValueSchema | undefined => {
    if (!value) {
      return undefined;
    }

    let activeValue: ActiveValueSchema = { state: 'invalid' };

    try {
      activeValue = activeValueSchema.parse({
        ...validState.omit({ state: true }).parse(JSON.parse(value)),
        state: 'valid',
      });
    } catch (error) {}

    return activeValue;
  });

export const ProductInput: FC<Props> = ({
  disabled,
  intlLabel,
  name,
  description,
  error,
  onChange,
  value,
  required,
  placeholder,
}) => {
  const { toggleNotification } = useNotification();

  const { formatMessage } = useIntl();

  const parsedValue = valueSchema.safeParse(value);

  const [currentValue, setCurrentValue] = useState(
    parsedValue.success ? parsedValue.data : undefined
  );

  const shopId = currentValue?.state === 'valid' ? currentValue.shopId : undefined;
  const productId = currentValue?.state === 'valid' ? currentValue.productId : undefined;

  const { data: shops } = useShops();
  const { data: products } = useReadShopProducts(shopId);

  const onChangeBuilder = (field: 'shopId' | 'productId') => (nextId: string) => {
    setCurrentValue((current) =>
      current
        ? current.state === 'invalid'
          ? current
          : { ...current, [field]: parseInt(nextId, 10) }
        : undefined
    );
  };
  const onShopChange = onChangeBuilder('shopId');
  const onProductChange = onChangeBuilder('productId');

  useEffect(() => {
    if (currentValue && currentValue.state === 'valid') {
      return onChange?.(
        JSON.stringify({
          shopId: currentValue.shopId,
          productId: currentValue.productId,
        })
      );
    }
  }, [onChange]);

  useEffect(() => {
    if (currentValue?.state === 'invalid') {
      toggleNotification({
        type: 'warning',
        message: formatMessage(getTrad('customField.notification.invalidValue'), {
          name,
          value: JSON.stringify(value),
        }),
      });
    }
  }, [name, value, currentValue?.state]);

  useEffect(() => {
    if (!shopId && shops?.length === 1) {
      onShopChange(shops[0].id.toString());
    }
  }, [shopId, shops, onShopChange]);

  return (
    <Box width="100%">
      <Field name={name} hint={description} label={formatMessage(intlLabel)} error={error}>
        <Flex direction="column" width="100%" gap={5}>
          {(shops?.length ?? 0) > 1 ? (
            <Combobox
              name={`${name}.shop`}
              autocomplete="both"
              onChange={onShopChange}
              value={shopId}
              disabled={disabled}
              width="100%"
            >
              {shops?.map(({ id, vendor }) => (
                <ComboboxOption key={id} value={id}>
                  {vendor}
                </ComboboxOption>
              ))}
            </Combobox>
          ) : null}

          <Combobox
            name={`${name}.product`}
            autocomplete="both"
            onChange={onProductChange}
            value={productId}
            disabled={disabled}
            width="100%"
          >
            {products?.map(({ id, name }) => (
              <ComboboxOption key={id} value={id}>
                {name}
              </ComboboxOption>
            ))}
          </Combobox>
        </Flex>
      </Field>
    </Box>
  );
};
