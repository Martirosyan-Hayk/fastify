import { RpcBadRequestException } from '@hr-drone/common-module';

export class PasswordNotValidException extends RpcBadRequestException {
  constructor() {
    super('error.passwordNotValid');
  }
}
