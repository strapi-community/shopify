import { CustomFieldInputProps, Field } from '@sensinum/strapi-utils';
import { Flex } from '@strapi/design-system';
import { FC, useEffect, useState } from 'react';
import { useIntl } from 'react-intl';
import { z } from 'zod';

import { Combobox, ComboboxOption } from '@strapi/design-system';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { debounce } from 'lodash';
import { useReadShopProducts } from '../hooks/readProducts.hook';
import { useReadVendors } from '../hooks/readVendors.hook';
import { getTrad } from '../translations';

interface Props extends CustomFieldInputProps {}

const validState = z.object({
  vendor: z.string().optional(),
  productId: z.string().optional(),
  productTitle: z.string().optional(),
});

const queryClient = new QueryClient();

export const ProductInput: FC<Props> = ({
  attribute,
  disabled,
  name,
  description,
  error,
  onChange,
  value,
  required,
}) => {
  const { formatMessage } = useIntl();

  const parsedValue = validState.safeParse(value);

  const [currentValue, setCurrentValue] = useState(
    parsedValue.success ? parsedValue.data : undefined
  );

  const [query, setQuery] = useState(
    parsedValue.success ? (parsedValue.data.productTitle ?? '') : ''
  );

  const { data: vendors } = useReadVendors();
  const { data: products, isLoading: productLoading } = useReadShopProducts({
    vendor: currentValue?.vendor ?? '',
    query,
  });

  const onChangeBuilder = (field: 'vendor' | 'productId') => (nextId: string | undefined) => {
    setCurrentValue((current) =>
      current
        ? { ...current, [field]: nextId }
        : {
            [field]: nextId,
          }
    );
  };
  const onShopChange = onChangeBuilder('vendor');
  const onProductChange = onChangeBuilder('productId');
  const onProductClear = () => onProductChange(undefined);

  const doAddIntroItem =
    currentValue &&
    currentValue.productId &&
    currentValue.productTitle &&
    !products?.find(({ id }) => currentValue.productId === id);

  useEffect(() => {
    onChange?.({
      target: {
        name,
        value: currentValue
          ? {
              shopId: currentValue.vendor,
              productId: currentValue.productId,
              productTitle: products?.find((product) => product.id)?.title,
            }
          : undefined,
        type: attribute.type,
      },
    });
  }, [onChange, currentValue, products]);

  useEffect(() => {
    if (!currentValue?.vendor && vendors?.length === 1) {
      onShopChange(vendors[0]);
    }
  }, [currentValue, vendors, onShopChange]);

  return (
    <Field name={name} hint={description} label={name} error={error}>
      <Flex direction="column" gap={5} width="100%" alignItems="stretch">
        {(vendors?.length ?? 0) > 1 ? (
          <Combobox
            name={`${name}.shop`}
            autocomplete="list"
            onChange={onShopChange}
            value={currentValue?.vendor}
            disabled={disabled}
            width="100%"
            required={required}
            placeholder={formatMessage(getTrad('customField.vendor.placeholder'))}
          >
            {vendors?.map((vendor) => (
              <ComboboxOption key={vendor} value={vendor}>
                {vendor}
              </ComboboxOption>
            ))}
          </Combobox>
        ) : null}

        <Combobox
          name={`${name}.product`}
          autocomplete="list"
          onChange={onProductChange}
          value={currentValue?.productId}
          disabled={disabled}
          width="100%"
          onTextValueChange={debounce(setQuery, 300)}
          required={required}
          placeholder={formatMessage(getTrad('customField.product.placeholder'))}
          loading={productLoading}
          onClear={onProductClear}
        >
          {products?.map(({ id, title }) => (
            <ComboboxOption key={id} value={id}>
              {title}
            </ComboboxOption>
          ))}
          {doAddIntroItem ? (
            <ComboboxOption key={currentValue.productId} value={currentValue.productId}>
              {currentValue.productTitle}
            </ComboboxOption>
          ) : null}
        </Combobox>
      </Flex>
    </Field>
  );
};

export default function ProductInputWrapper(props: Props) {
  return (
    <QueryClientProvider client={queryClient}>
      <ProductInput {...props} />
    </QueryClientProvider>
  );
}
