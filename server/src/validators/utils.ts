import { z } from 'zod';
import { left, right } from 'fp-ts/Either';
import { ValidationException } from '../exceptions/ValidationException';

export const validate = <I, O>(result: z.SafeParseReturnType<I, O>) => {
  if (!result.success) {
    const message = result.error.issues
      .map((i) => `Path: ${i.path.join('.')} Code: ${i.code} Message: ${i.message}`)
      .join('\n');
    return left(new ValidationException(message, result.error.issues));
  }
  return right(result.data);
};
