import { Field } from '@sensinum/strapi-utils';
import {
  Accordion,
  Box,
  Button,
  Combobox,
  ComboboxOption,
  Dialog,
  Flex,
  Grid,
  IconButton,
  TextButton,
  TextInput,
} from '@strapi/design-system';
import { Plus, Trash } from '@strapi/icons';
import { Form, useNotification } from '@strapi/strapi/admin';
import { FC, useCallback, useEffect } from 'react';
import { MessageDescriptor, useIntl } from 'react-intl';
import styled from 'styled-components';
import { useServices } from '../hooks/services.hook';
import { getTrad, isTranslationKey } from '../translations';
import {
  NewShopSchemaWithIdSchema,
  ShopSchemaWithIdSchema,
  TopicSchema,
  validTopics,
} from '../validators/shop.validator';

export type FormField =
  | 'address'
  | 'vendor'
  | 'apiKey'
  | 'apiSecretKey'
  | 'adminApiAccessToken'
  | 'webhooks';

type Props =
  | {
      mode: 'create';
      shop: Partial<NewShopSchemaWithIdSchema>;
      onChange: (shop: Partial<Pick<NewShopSchemaWithIdSchema, FormField>>) => void;
      validator: (shop: unknown) => Promise<Pick<NewShopSchemaWithIdSchema, FormField>>;
      initialError: Partial<Record<FormField, string>>;
      isDisabled?: boolean;
    }
  | {
      mode: 'edit';
      shop: Pick<NewShopSchemaWithIdSchema, FormField>;
      onChange: (shop: Pick<NewShopSchemaWithIdSchema, FormField>) => void;
      validator: (shop: unknown) => Promise<Pick<NewShopSchemaWithIdSchema, FormField>>;
      initialError: Partial<Record<FormField, string>>;
      isDisabled?: boolean;
    };

const autocomplete = { type: 'list', filter: 'contains' } as const;

export const ShopForm: FC<Props> = (props) => {
  const { formatMessage, messages } = useIntl();

  const allKeys = Object.keys(messages);

  const { data: services } = useServices();

  const usedTopics = new Set(props.shop.webhooks?.map(({ topic }) => topic) ?? []);
  const nextAvailableTopics = validTopics.filter((topic) => !usedTopics.has(topic));
  const nextAvailableTopic = nextAvailableTopics[0];

  const { toggleNotification } = useNotification();

  const renderError = (errorMessage: string | MessageDescriptor): string => {
    return formatMessage(typeof errorMessage === 'string' ? { id: errorMessage } : errorMessage);
  };

  const onChange = useCallback(
    <TKey extends keyof ShopSchemaWithIdSchema, TValue extends ShopSchemaWithIdSchema[TKey]>(
      key: TKey,
      value: TValue
    ) => {
      props.mode === 'create'
        ? props.onChange({ ...props.shop, [key]: value })
        : props.onChange({ ...props.shop, [key]: value });
    },
    [props.shop]
  );

  const onChangeCurried =
    <TKey extends keyof ShopSchemaWithIdSchema, TValue extends ShopSchemaWithIdSchema[TKey]>(
      key: TKey
    ) =>
    (event: React.ChangeEvent<HTMLInputElement>) => {
      onChange(key, event.target.value as TValue);
    };

  const onAddWebhook = useCallback(() => {
    if (!nextAvailableTopic) {
      return;
    }

    onChange(
      'webhooks',
      props.mode === 'create'
        ? [...(props.shop.webhooks ?? []), { topic: nextAvailableTopic }]
        : [...(props.shop.webhooks ?? []), { topic: nextAvailableTopic }]
    );
  }, [onChange, props.shop.webhooks, nextAvailableTopic]);

  const onTopicChange = (updatedIndex: number) => (topic: TopicSchema) => {
    onChange(
      'webhooks',
      props.mode === 'create'
        ? (props.shop.webhooks?.map((webhook, index) =>
            index === updatedIndex ? { ...webhook, topic } : webhook
          ) ?? [])
        : (props.shop.webhooks?.map((webhook, index) =>
            index === updatedIndex ? { ...webhook, topic } : webhook
          ) ?? [])
    );
  };

  const onServiceChange = (updatedIndex: number) => (service: string) => {
    onChange(
      'webhooks',
      props.mode === 'create'
        ? (props.shop.webhooks?.map((webhook, index) =>
            index === updatedIndex ? { ...webhook, service, method: undefined } : webhook
          ) ?? [])
        : (props.shop.webhooks?.map((webhook, index) =>
            index === updatedIndex ? { ...webhook, service, method: undefined } : webhook
          ) ?? [])
    );
  };

  const onMethodChange = (updatedIndex: number) => (method: string) => {
    onChange(
      'webhooks',
      props.mode === 'create'
        ? (props.shop.webhooks?.map((webhook, index) =>
            index === updatedIndex ? { ...webhook, method } : webhook
          ) ?? [])
        : (props.shop.webhooks?.map((webhook, index) =>
            index === updatedIndex ? { ...webhook, method } : webhook
          ) ?? [])
    );
  };

  const onDeleteWebhook = (updatedIndex: number) => () => {
    onChange(
      'webhooks',
      props.mode === 'create'
        ? (props.shop.webhooks?.filter((_, index) => index !== updatedIndex) ?? [])
        : (props.shop.webhooks?.filter((_, index) => index !== updatedIndex) ?? [])
    );
  };

  useEffect(() => {
    if (Object.keys(props.initialError).length) {
      toggleNotification({
        message: formatMessage(getTrad('form.shop.error.validationMessage')),
        timeout: 5000,
        type: 'warning',
      });
    }
  }, [props.initialError]);

  return (
    <Flex background="neutral100" width="100%" direction="column" alignItems="stretch">
      <Form
        method="POST"
        initialValues={props.shop}
        initialErrors={props.initialError}
        disabled={props.isDisabled}
      >
        {({ values, errors, disabled, setErrors }) => {
          useEffect(() => {
            setErrors(props.initialError);
          }, [props.initialError]);

          return (
            <Flex gap={5} direction="column" width="100%">
              <BaseContainer>
                <Grid.Root gap={5}>
                  <Grid.Item col={6} alignItems="flex-start">
                    <Field
                      name="address"
                      label={formatMessage(getTrad('form.shop.address.label', 'Address'))}
                      error={errors.address ? renderError(errors.address) : undefined}
                      hint={formatMessage(getTrad('form.shop.address.placeholder', 'e.g. Blog'))}
                      required
                    >
                      <TextInput
                        type="string"
                        name="address"
                        onChange={onChangeCurried('address')}
                        defaultValue={values.address}
                        disabled={disabled || props.mode === 'edit'}
                      />
                    </Field>
                  </Grid.Item>

                  <Grid.Item col={6} alignItems="flex-start">
                    <Field
                      name="apiSecretKey"
                      label={formatMessage(getTrad('form.shop.apiSecretKey.label'))}
                      error={errors.apiSecretKey ? renderError(errors.apiSecretKey) : undefined}
                      required
                    >
                      <TextInput
                        type="string"
                        name="apiSecretKey"
                        onChange={onChangeCurried('apiSecretKey')}
                        defaultValue={values.apiSecretKey}
                        disabled={disabled}
                        placeholder={formatMessage(getTrad('form.shop.apiSecretKey.placeholder'))}
                      />
                    </Field>
                  </Grid.Item>

                  <Grid.Item col={6} alignItems="flex-start">
                    <Field
                      name="vendor"
                      label={formatMessage(getTrad('form.shop.vendor.label'))}
                      error={errors.vendor ? renderError(errors.vendor) : undefined}
                      hint={formatMessage(getTrad('form.shop.vendor.placeholder'))}
                      required
                    >
                      <TextInput
                        type="string"
                        name="vendor"
                        onChange={onChangeCurried('vendor')}
                        defaultValue={values.vendor}
                        disabled={disabled || props.mode === 'edit'}
                      />
                    </Field>
                  </Grid.Item>

                  <Grid.Item col={6} alignItems="flex-start">
                    <Field
                      name="apiKey"
                      label={formatMessage(getTrad('form.shop.apiKey.label'))}
                      error={errors.apiKey ? renderError(errors.apiKey) : undefined}
                    >
                      <TextInput
                        type="string"
                        name="apiKey"
                        onChange={onChangeCurried('apiKey')}
                        defaultValue={values.apiKey}
                        disabled={disabled}
                        placeholder={formatMessage(getTrad('form.shop.apiKey.placeholder'))}
                      />
                    </Field>
                  </Grid.Item>

                  <Grid.Item col={6} alignItems="flex-start">
                    <Field
                      name="adminApiAccessToken"
                      label={formatMessage(getTrad('form.shop.adminApiAccessToken.label'))}
                      error={
                        errors.adminApiAccessToken
                          ? renderError(errors.adminApiAccessToken)
                          : undefined
                      }
                      required
                    >
                      <TextInput
                        type="string"
                        name="adminApiAccessToken"
                        onChange={onChangeCurried('adminApiAccessToken')}
                        defaultValue={values.adminApiAccessToken}
                        disabled={disabled}
                        placeholder={formatMessage(
                          getTrad('form.shop.adminApiAccessToken.placeholder')
                        )}
                      />
                    </Field>
                  </Grid.Item>
                </Grid.Root>
              </BaseContainer>

              <BaseContainer>
                <Field name="webhooks" label={formatMessage(getTrad('form.shop.webhooks.label'))}>
                  <Flex direction="column" width="100%" alignItems="stretch">
                    {props.shop.webhooks?.length ? (
                      <Accordion.Root>
                        {props.shop.webhooks.map((webhook, index) => {
                          const methods =
                            services?.find((service) => webhook.service === service.name)
                              ?.methods ?? [];

                          // @ts-expect-error
                          const serviceErrorMessage: string = errors[`webhooks.${index}.service`];
                          // @ts-expect-error
                          const methodErrorMessage: string = errors[`webhooks.${index}.method`];

                          return (
                            <Accordion.Item
                              key={Object.values(webhook).join('-')}
                              value={`webhook-${index}`}
                            >
                              <Accordion.Header>
                                <Accordion.Trigger>{webhook.topic}</Accordion.Trigger>

                                <Accordion.Actions>
                                  <Dialog.Root>
                                    <Dialog.Trigger>
                                      <IconButton>
                                        <Trash />
                                      </IconButton>
                                    </Dialog.Trigger>
                                    <Dialog.Content>
                                      <Dialog.Body>
                                        {formatMessage(
                                          getTrad('form.shop.webhooks.delete.dialog.body')
                                        )}
                                      </Dialog.Body>
                                      <Dialog.Footer>
                                        <Dialog.Cancel>
                                          <Button fullWidth variant="tertiary">
                                            {formatMessage(
                                              getTrad('form.shop.webhooks.delete.dialog.cancel')
                                            )}
                                          </Button>
                                        </Dialog.Cancel>
                                        <Dialog.Action>
                                          <Button
                                            fullWidth
                                            variant="secondary-light"
                                            onClick={onDeleteWebhook(index)}
                                          >
                                            {formatMessage(
                                              getTrad('form.shop.delete.dialog.confirm')
                                            )}
                                          </Button>
                                        </Dialog.Action>
                                      </Dialog.Footer>
                                    </Dialog.Content>
                                  </Dialog.Root>
                                </Accordion.Actions>
                              </Accordion.Header>
                              <Accordion.Content>
                                <Flex direction="column" gap={5} padding={5}>
                                  <Field
                                    name="service"
                                    label={formatMessage(getTrad('form.shop.webhooks.service'))}
                                    error={
                                      serviceErrorMessage
                                        ? isTranslationKey(serviceErrorMessage, allKeys)
                                          ? formatMessage(getTrad(serviceErrorMessage))
                                          : formatMessage(getTrad('form.shop.webhooks.error'))
                                        : undefined
                                    }
                                  >
                                    <Combobox
                                      name="service"
                                      autocomplete={autocomplete}
                                      onChange={onServiceChange(index)}
                                      value={webhook.service}
                                      disabled={webhook.isPersisted}
                                      width="100%"
                                    >
                                      {services?.map((service) => (
                                        <ComboboxOption key={service.name} value={service.name}>
                                          {service.name}
                                        </ComboboxOption>
                                      ))}
                                    </Combobox>
                                  </Field>

                                  <Field
                                    name="method"
                                    label={formatMessage(getTrad('form.shop.webhooks.method'))}
                                    error={
                                      methodErrorMessage
                                        ? isTranslationKey(methodErrorMessage, allKeys)
                                          ? formatMessage({
                                              id: methodErrorMessage,
                                            })
                                          : formatMessage(getTrad('form.shop.webhooks.error'))
                                        : undefined
                                    }
                                    required={!!webhook.service}
                                  >
                                    <Combobox
                                      name="method"
                                      autocomplete={autocomplete}
                                      onChange={onMethodChange(index)}
                                      value={webhook.method}
                                      disabled={webhook.isPersisted}
                                      width="100%"
                                    >
                                      {methods?.map((method) => (
                                        <ComboboxOption key={method} value={method}>
                                          {method}
                                        </ComboboxOption>
                                      ))}
                                    </Combobox>
                                  </Field>

                                  <Field
                                    name="topic"
                                    label={formatMessage(getTrad('form.shop.webhooks.topic'))}
                                  >
                                    <Combobox
                                      name="topic"
                                      autocomplete={autocomplete}
                                      onChange={onTopicChange(index)}
                                      value={webhook.topic}
                                      disabled={webhook.isPersisted}
                                      width="100%"
                                      required
                                    >
                                      {[webhook.topic, ...nextAvailableTopics].map((topic) => (
                                        <ComboboxOption key={topic} value={topic}>
                                          {topic}
                                        </ComboboxOption>
                                      ))}
                                    </Combobox>
                                  </Field>
                                </Flex>
                              </Accordion.Content>
                            </Accordion.Item>
                          );
                        })}
                        <TextButtonCustom
                          isActive
                          disabled={disabled || !nextAvailableTopic}
                          onClick={onAddWebhook}
                          startIcon={<Plus />}
                        >
                          {formatMessage(getTrad('form.shop.webhooks.add'))}
                        </TextButtonCustom>
                      </Accordion.Root>
                    ) : null}

                    {!props.shop.webhooks?.length ? (
                      <TextButtonCustom
                        isActive={false}
                        disabled={disabled || !nextAvailableTopic}
                        onClick={onAddWebhook}
                        startIcon={<Plus />}
                      >
                        {formatMessage(getTrad('form.shop.webhooks.add'))}
                      </TextButtonCustom>
                    ) : null}
                  </Flex>
                </Field>
              </BaseContainer>
            </Flex>
          );
        }}
      </Form>
    </Flex>
  );
};

const BaseContainer = styled(Box)`
  border-radius: ${({ theme }) => theme.borderRadius};
  background-color: ${({ theme }) => theme.colors.neutral0};
  border-width: 1px;
  border-color: ${({ theme }) => theme.colors.neutral150};
  padding: ${({ theme }) => theme.spaces[5]};
  width: 100%;
`;

/** from: https://github.com/strapi/strapi/blob/develop/packages/core/content-manager/admin/src/pages/EditView/components/FormInputs/Component/Repeatable.tsx */
const TextButtonCustom = styled(TextButton)<{ isActive: boolean }>`
  width: 100%;
  display: flex;
  justify-content: center;

  padding-inline: ${(props) => props.theme.spaces[6]};
  padding-block: ${(props) => props.theme.spaces[3]};

  ${({ isActive, theme }) =>
    isActive
      ? `border-top: 1px solid ${theme.colors.neutral200};`
      : `border: 1px solid ${theme.colors.neutral200};
         border-radius: ${theme.borderRadius};
  `}

  &:not([disabled]) {
    cursor: pointer;

    &:hover {
      background-color: ${(props) => props.theme.colors.primary100};
    }
  }

  span {
    font-weight: 600;
    font-size: 1.4rem;
    line-height: 2.4rem;
  }

  @media (prefers-reduced-motion: no-preference) {
    transition: background-color 120ms ${(props) => props.theme.motion.easings.easeOutQuad};
  }
`;
