import type { SentryModuleOptions } from '@hr-drone/common-module';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { isNil } from 'lodash';

@Injectable()
export class ApiConfigService {
  constructor(private configService: ConfigService) {}

  get isDevelopment(): boolean {
    return this.nodeEnv === 'development';
  }

  get isProduction(): boolean {
    return this.nodeEnv === 'production';
  }

  // private getNumber(key: string): number {
  //   return Number(this.configService.get(key));
  // }

  private getString(key: string, defaultValue?: string): string {
    const value = this.configService.get(key, defaultValue);

    if (isNil(value)) {
      if (defaultValue !== undefined) {
        return defaultValue;
      }

      throw new Error(`${key} environment variable doesn't exist`);
    }

    return value.toString().replaceAll('\\n', '\n');
  }

  get nodeEnv(): string {
    return this.getString('NODE_ENV', 'development');
  }

  get jwtConfig() {
    return {
      privateKey: this.getString('JWT_PRIVATE_KEY'),
      publicKey: this.getString('JWT_PUBLIC_KEY'),
      resetPasswordTokenExpirationTime: this.getString(
        'JWT_RESET_PASSWORD_EXPIRATION_TIME',
      ),
      jwtCheckHostExpirationTokenTime: this.getString(
        'JWT_CHECK_HOST_EXPIRATION_TIME',
      ),
      jwtSmsExpirationTime: this.getString('JWT_SMS_EXPIRATION_TIME'),
    };
  }

  get sentryConfig(): SentryModuleOptions {
    return {
      dsn: this.getString('SENTRY_DSN'),
      environment: this.getString('SENTRY_ENV'),
      close: {
        timeout: 5000,
        enabled: true,
      },
      // release: this.getString('SENTRY_RELEASE'),
      debug: this.isDevelopment,
    };
  }
}
