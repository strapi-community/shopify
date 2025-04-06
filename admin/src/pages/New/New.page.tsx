import { Layouts, Page } from '@strapi/strapi/admin';
import { FC, useCallback, useReducer } from 'react';
import { useIntl } from 'react-intl';

import { Button, Flex } from '@strapi/design-system';
import { Check } from '@strapi/icons';
import { ShopForm } from '../../components/Form.component';
import { useCreateShop } from '../../hooks/createShop.hook';
import { useDisplayError } from '../../hooks/displaySaveError.hook';
import { useDisplaySaveSuccess } from '../../hooks/displaySaveSuccess.hook';
import { reducer, State } from '../../hooks/form.hook';
import { useAdminNavigation } from '../../hooks/navigation.hook';
import { getTrad } from '../../translations';
import {
  newShopSchemaWithIdSchema,
  NewShopSchemaWithIdSchema,
} from '../../validators/shop.validator';

const initial: Partial<NewShopSchemaWithIdSchema> = {
  id: 1,
  // address: 'https://sensinum-strapi-int.myshopify.com',
  // vendor: 'sensinum-strapi-int',
  // apiKey: '0151d05077a904f4b8d3fb0f1dafbdcb',
  // apiSecretKey: 'cf63452bc92796643ce05d669551a04e',
  // adminApiAccessToken: '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',
  webhooks: [],
};

const initialState: State<Partial<NewShopSchemaWithIdSchema>> = {
  current: initial,
  isSubmitting: false,
  errors: {},
  isDirty: false,
};

export const NewPage: FC = () => {
  const [{ current, errors, isSubmitting }, dispatch] = useReducer(
    reducer<Partial<NewShopSchemaWithIdSchema>>,
    initialState
  );

  const { formatMessage } = useIntl();

  const { goToEdit } = useAdminNavigation();

  const createShopMutation = useCreateShop();

  const displayApiErrors = useDisplayError();
  const displaySaveSuccess = useDisplaySaveSuccess('new');

  const validator = useCallback(
    (shop: unknown) =>
      new Promise<NewShopSchemaWithIdSchema>((resolve, reject) => {
        const result = newShopSchemaWithIdSchema.safeParse(shop);

        if (result.success) {
          return resolve(result.data);
        }

        const errors = result.error.issues.reduce<Record<string, string>>((acc, item) => {
          acc[item.path.join('.')] = item.message;

          return acc;
        }, {});

        reject(errors);

        dispatch({ type: 'ERRORS', errors });
      }),
    [dispatch]
  );

  const onSubmit = useCallback((shop: NewShopSchemaWithIdSchema) => {
    dispatch({
      type: 'LOADING_START',
    });

    createShopMutation.mutate(shop, {
      onSuccess: ({ id }) => {
        displaySaveSuccess();
        goToEdit(id);
      },

      onSettled: () => dispatch({ type: 'LOADING_STOP' }),

      onError: displayApiErrors,
    });
  }, [dispatch, createShopMutation, displaySaveSuccess, goToEdit, displayApiErrors]);

  const onSave = useCallback(() => {
    validator(current)
      .then(onSubmit)
      .catch((errors) => {
        dispatch({
          type: 'ERRORS',
          errors,
        });
      });
  }, [current, validator, dispatch]);

  const onChange = useCallback((next: Partial<NewShopSchemaWithIdSchema>) => {
    dispatch({
      type: 'ON_NEXT',
      next: {
        ...current,
        ...next,
      },
    });
  }, [current, dispatch]);

  return (
    <Layouts.Root>
      <Page.Title children={formatMessage(getTrad('header.shop.new.tabTitle'))} />
      <Page.Main>
        <Layouts.Header
          title={formatMessage(getTrad('header.shop.new.title'))}
          primaryAction={
            <Flex>
              <Button startIcon={<Check />} fullWidth disabled={isSubmitting} onClick={onSave}>
                {formatMessage(getTrad('form.shop.save'))}
              </Button>
            </Flex>
          }
        />

        <Layouts.Content>
          <ShopForm
            mode="create"
            onChange={onChange}
            shop={current}
            validator={validator}
            initialError={errors}
            isDisabled={isSubmitting}
          />
        </Layouts.Content>
      </Page.Main>
    </Layouts.Root>
  );
};
