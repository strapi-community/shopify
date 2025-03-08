import { useNotification } from '@strapi/strapi/admin';
import { useIntl } from 'react-intl';
import { getTrad } from '../translations';
import { MESSAGE_TIMEOUT } from './displaySaveError.hook';

export const useDisplayDeleteSuccess = () => {
  const { formatMessage } = useIntl();

  const { toggleNotification } = useNotification();

  return () => {
    toggleNotification({
      message: formatMessage(getTrad('form.shop.deleted.content')),
      title: formatMessage(getTrad('form.shop.deleted.header')),
      type: 'success',
      timeout: MESSAGE_TIMEOUT,
    });
  };
};
