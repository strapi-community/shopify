import { useNotification } from '@strapi/strapi/admin';
import { useIntl } from 'react-intl';
import { getTrad } from '../translations';
import { MESSAGE_TIMEOUT } from './displaySaveError.hook';

export const useDisplaySaveSuccess = (mode: 'new' | 'update') => {
  const { formatMessage } = useIntl();

  const { toggleNotification } = useNotification();

  return () => {
    toggleNotification({
      message: formatMessage(getTrad(`form.shop.saved.${mode}.content`)),
      title: formatMessage(getTrad(`form.shop.saved.${mode}.header`)),
      type: 'success',
      timeout: MESSAGE_TIMEOUT,
    });
  };
};
