import { FlattenObjectKeys } from '../types';

type ErrorsRecord<T extends Record<string, unknown>> = Partial<
  Record<FlattenObjectKeys<T>, string>
>;

export interface State<T extends Record<string, unknown>> {
  current: T;
  isSubmitting: boolean;
  errors: ErrorsRecord<T>;
  isDirty: boolean;
}

export type Action<T extends Record<string, unknown>> =
  | {
      type: 'MARK_CLEAN';
    }
  | {
      type: 'LOADING_START';
    }
  | {
      type: 'LOADING_STOP';
    }
  | {
      type: 'ERRORS';
      errors: ErrorsRecord<T>;
    }
  | {
      type: 'ON_NEXT';
      next: T;
    };

export const reducer = <T extends Record<string, unknown>>(
  current: State<T>,
  action: Action<T>
): State<T> => {
  const withMarkedDirty = (state: State<T>): State<T> => ({
    ...state,
    isDirty: true,
  });

  switch (action.type) {
    case 'ERRORS': {
      return { ...current, errors: action.errors };
    }
    case 'LOADING_START': {
      return { ...current, isSubmitting: true };
    }
    case 'LOADING_STOP': {
      return { ...current, isSubmitting: false };
    }
    case 'ON_NEXT':
      return withMarkedDirty({
        ...current,
        current: action.next,
      });

    case 'MARK_CLEAN':
      return {
        ...current,
        isDirty: false,
      };
  }
};
