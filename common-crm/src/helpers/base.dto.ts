import { plainToInstance } from 'class-transformer';
import { validateSync } from 'class-validator';


export abstract class BaseDto {
  static create<T extends BaseDto>(
    this: new (...args: any[]) => T,
    data: T,
  ): T {
    const convertedObject = plainToInstance<T, any>(this, data, {
      // groups: [RoleGroupEnum.ALL],
    });

    // FIXME: add check for local and dev env and disable this for production
    const errors = validateSync(convertedObject);

    if (errors.length > 0) {
      console.error(errors);

      throw new Error('Unprocessable entity');
    }

    return convertedObject;
  }
}
