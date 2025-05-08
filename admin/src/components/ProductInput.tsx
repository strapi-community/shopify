import { CustomFieldInputProps, Field } from '@sensinum/strapi-utils';
import { Combobox, ComboboxOption, Flex } from '@strapi/design-system';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { debounce } from 'lodash';
import { FC, useState } from 'react';
import { useIntl } from 'react-intl';
import { z } from 'zod';
import { useReadShopProducts } from '../hooks/readProducts.hook';
import { useReadVendors } from '../hooks/readVendors.hook';
import { getTrad } from '../translations';

interface Props extends CustomFieldInputProps {}

const validState = z.object({
  vendor: z.string().optional(),
  productId: z.string().optional(),
  title: z.string().optional(),
  id: z.string().optional(),
});

const queryClient = new QueryClient();

const autocomplete = { type: 'list', filter: 'contains' } as const;

const getParsedValue = (value: any): Required<z.infer<typeof validState>> => {
  const parsedValue = validState.safeParse(value);
  if (parsedValue.success) {
    return {
      vendor: parsedValue.data.vendor ?? '',
      productId: parsedValue.data.productId ?? '',
      title: parsedValue.data.title ?? '',
      id: parsedValue.data.productId ?? '',
    };
  }
  return {
    vendor: '',
    productId: '',
    title: '',
    id: '',
  };
};

export const ProductInput: FC<Props> = ({
  disabled,
  name,
  description,
  error,
  onChange,
  value,
  required,
}) => {
  const { formatMessage } = useIntl();
  const parsedValue = getParsedValue(value);

  const [query, setQuery] = useState('');

  const { data: vendors } = useReadVendors();
  const vendor = parsedValue.vendor || (vendors?.length === 1 ? vendors?.at(0) || '' : '');
  const { data: products, isLoading: productLoading } = useReadShopProducts({
    vendor: vendor,
    query,
  });
  const onChangeBuilder = (field: 'vendor' | 'productId') => (nextId: string | undefined) => {
    onChange?.({
      target: {
        name,
        value: {
          ...parsedValue,
          vendor: parsedValue.vendor || vendor,
          [field]: nextId,
          title: products?.find(({ id }) => id === nextId)?.title ?? parsedValue.title,
        },
      },
    });
  };
  const onShopChange = onChangeBuilder('vendor');
  const onProductChange = onChangeBuilder('productId');
  const onProductClear = () => onProductChange(undefined);

  const data = [
    parsedValue,
    ...(products ?? []).filter(({ id }) => id !== parsedValue.productId),
  ].filter((_) => _.title && _.id);

  return (
    <Field name={name} hint={description} label={name} error={error}>
      <Flex direction="column" gap={5} width="100%" alignItems="stretch">
        {(vendors?.length ?? 0) > 1 ? (
          <Combobox
            name={`${name}.shop`}
            autocomplete={autocomplete}
            onChange={onShopChange}
            value={parsedValue?.vendor}
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
          autocomplete={autocomplete}
          onChange={onProductChange}
          value={parsedValue.productId}
          disabled={disabled}
          width="100%"
          onTextValueChange={debounce(setQuery, 300)}
          required={required}
          placeholder={formatMessage(getTrad('customField.product.placeholder'))}
          loading={productLoading}
          onClear={onProductClear}
        >
          {data.map(({ id, title }) => (
            <ComboboxOption key={id} value={id}>
              {title}
            </ComboboxOption>
          ))}
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
