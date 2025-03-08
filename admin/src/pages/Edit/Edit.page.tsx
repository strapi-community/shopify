import { Layouts, Page } from '@strapi/strapi/admin';
import { FC, useCallback, useEffect, useReducer } from 'react';
import { useIntl } from 'react-intl';

import { Button, Dialog, Flex } from '@strapi/design-system';
import { Check } from '@strapi/icons';
import { FormField, ShopForm } from '../../components/Form.component';
import { useDeleteShop } from '../../hooks/deleteShop.hook';
import { useDisplayDeleteSuccess } from '../../hooks/displayDeleteSuccess.hook';
import { useDisplayError } from '../../hooks/displaySaveError.hook';
import { useDisplaySaveSuccess } from '../../hooks/displaySaveSuccess.hook';
import { reducer, State } from '../../hooks/form.hook';
import { useAdminNavigation } from '../../hooks/navigation.hook';
import { useReadShop } from '../../hooks/readShop.hook';
import { useUpdateShop } from '../../hooks/updateShop.hook';
import { getTrad } from '../../translations';
import { shopSchemaWithIdSchema, ShopSchemaWithIdSchema } from '../../validators/shop.validator';

const initial: State<ShopSchemaWithIdSchema> = {
  current: {} as ShopSchemaWithIdSchema,
  errors: {},
  isSubmitting: false,
  isDirty: false,
};

export const EditPage: FC = () => {
  const [{ current, errors, isSubmitting, isDirty }, dispatch] = useReducer(
    reducer<ShopSchemaWithIdSchema>,
    initial
  );

  const { formatMessage } = useIntl();

  const updateShopMutation = useUpdateShop();
  const deleteShopMutation = useDeleteShop();

  const { goToNew, params } = useAdminNavigation();

  const { data: shop, isLoading } = useReadShop(params?.id);

  const displayApiErrors = useDisplayError();
  const displaySaveSuccess = useDisplaySaveSuccess('update');
  const displayDeleteSuccess = useDisplayDeleteSuccess();

  const onSubmit = useCallback((shop: ShopSchemaWithIdSchema) => {
    dispatch({
      type: 'LOADING_START',
    });

    updateShopMutation.mutate(shop, {
      onSettled() {
        dispatch({ type: 'LOADING_STOP' });
      },
      onSuccess() {
        dispatch({ type: 'MARK_CLEAN' });

        displaySaveSuccess();
      },
      onError: displayApiErrors,
    });
  }, []);

  const onDelete = useCallback(
    (shop: ShopSchemaWithIdSchema) => {
      dispatch({
        type: 'LOADING_START',
      });

      deleteShopMutation.mutate(shop, {
        onSettled() {
          dispatch({ type: 'LOADING_STOP' });
        },
        onSuccess() {
          dispatch({ type: 'MARK_CLEAN' });

          displayDeleteSuccess();
          goToNew();
        },
        onError: displayApiErrors,
      });
    },
    [dispatch, goToNew, displayApiErrors, displayDeleteSuccess]
  );

  const onChange = useCallback((next: Pick<ShopSchemaWithIdSchema, FormField>) => {
    dispatch({
      type: 'ON_NEXT',
      next: {
        ...current,
        ...next,
      },
    });
  }, []);

  const validator = useCallback((shop: unknown) => {
    return new Promise<ShopSchemaWithIdSchema>((resolve, reject) => {
      const result = shopSchemaWithIdSchema.safeParse(shop);

      if (result.success) {
        resolve(result.data);
      } else {
        const errors = result.error.issues.reduce<Record<string, string>>((acc, item) => {
          acc[item.path.join('.')] = item.message;

          return acc;
        }, {});

        reject(errors);

        dispatch({ type: 'ERRORS', errors });
      }
    });
  }, []);

  useEffect(() => {
    if (!params.id) {
      goToNew();
    }
  }, []);

  useEffect(() => {
    if (!isLoading) {
      if (shop) {
        dispatch({ type: 'ON_NEXT', next: shop });
        dispatch({ type: 'MARK_CLEAN' });
      } else {
        goToNew();
      }
    }
  }, [isLoading, shop]);

  return (
    <Layouts.Root>
      <Page.Title children={formatMessage(getTrad('header.shop.edit.tabTitle'))} />
      <Page.Main>
        <Layouts.Header
          title={formatMessage(getTrad('header.shop.edit.title'), { shopName: current.vendor })}
          primaryAction={
            <Flex gap={5} direction="row">
              <Dialog.Root>
                <Dialog.Trigger>
                  <Button fullWidth variant="danger" disabled={deleteShopMutation.isPending}>
                    {formatMessage(getTrad('form.shop.delete.button'))}
                  </Button>
                </Dialog.Trigger>
                <Dialog.Content>
                  <Dialog.Body>
                    {formatMessage(getTrad('form.shop.delete.dialog.body'))}
                  </Dialog.Body>
                  <Dialog.Footer>
                    <Dialog.Cancel>
                      <Button fullWidth variant="tertiary">
                        {formatMessage(getTrad('form.shop.delete.dialog.cancel'))}
                      </Button>
                    </Dialog.Cancel>
                    <Dialog.Action>
                      <Button
                        fullWidth
                        variant="secondary-light"
                        onClick={() => {
                          validator(current)
                            .then((result) => {
                              onDelete(result);
                            })
                            .catch((errors) => {
                              dispatch({
                                type: 'ERRORS',
                                errors,
                              });
                            });
                        }}
                      >
                        {formatMessage(getTrad('form.shop.delete.dialog.confirm'))}
                      </Button>
                    </Dialog.Action>
                  </Dialog.Footer>
                </Dialog.Content>
              </Dialog.Root>

              <Button
                startIcon={<Check />}
                fullWidth
                disabled={isSubmitting || !isDirty || isLoading}
                onClick={() => {
                  validator(current)
                    .then((result) => {
                      onSubmit(result);
                    })
                    .catch((errors) => {
                      dispatch({
                        type: 'ERRORS',
                        errors,
                      });
                    });
                }}
              >
                {formatMessage(getTrad('form.shop.save'))}
              </Button>
            </Flex>
          }
        />

        <Layouts.Content>
          <ShopForm
            mode="edit"
            onChange={onChange}
            shop={current}
            validator={validator}
            initialError={errors}
            isDisabled={isSubmitting || isLoading}
          />
        </Layouts.Content>
      </Page.Main>
    </Layouts.Root>
  );
};
