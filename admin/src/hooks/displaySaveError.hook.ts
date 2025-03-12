import { useNotification } from '@strapi/strapi/admin';
import { APIErrorSchema } from '../validators/error.validator';

export const MESSAGE_TIMEOUT = 30 * 60 * 1000;

export const useDisplayError = () => {
  const { toggleNotification } = useNotification();

  return (error: Error) => {
    const parsedError = APIErrorSchema.safeParse(error);

    if (parsedError.success) {
      if (parsedError.data?.response?.data?.error?.details?.issues?.length) {
        return parsedError.data.response.data.error.details.issues.forEach((issue) => {
          toggleNotification({
            type: 'danger',
            message: `${issue.path.join('.')}: ${issue.message}`,
            timeout: MESSAGE_TIMEOUT,
          });
        });
      }

      return toggleNotification({
        type: 'danger',
        message: parsedError.data.message,
        timeout: MESSAGE_TIMEOUT,
      });
    }

    toggleNotification({
      type: 'danger',
      message: error.message,
      timeout: MESSAGE_TIMEOUT,
    });
  };
};
