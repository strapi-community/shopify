import { errors } from '@strapi/utils';

export class BadRequestException extends errors.ApplicationError<'BadRequestException'> {
  name = 'BadRequestException' as const;
  status = 400;

  constructor(
    message: string,
    public readonly details: string = '',
  ) {
    super(message);
  }
}
