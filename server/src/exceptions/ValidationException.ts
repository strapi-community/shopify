import { ZodError } from 'zod';

export class ValidationException extends Error {
  constructor(
    message: string,
    public readonly issues: ZodError<any>['issues']
  ) {
    super(message);
  }
}
