import { type SentryModuleOptions } from '@hr-drone/common-module';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { type ThrottlerModuleOptions } from '@nestjs/throttler';
import { type GoogleRecaptchaModuleOptions } from '@nestlab/google-recaptcha';
import { isNil } from 'lodash';
import { default as parse, type Units } from 'parse-duration';

@Injectable()
export class ApiConfigService {
  constructor(private configService: ConfigService) {}

  get isDevelopment(): boolean {
    return this.nodeEnv === 'development';
  }

  get isProduction(): boolean {
    return this.nodeEnv === 'production';
  }

  get isTest(): boolean {
    return this.nodeEnv === 'test';
  }

  private getNumber(key: string): number {
    const value = this.get(key);

    try {
      return Number(value);
    } catch {
      throw new Error(key + ' environment variable is not a number');
    }
  }

  private getBoolean(key: string): boolean {
    const value = this.get(key);

    try {
      return Boolean(JSON.parse(value));
    } catch {
      throw new Error(key + ' env var is not a boolean');
    }
  }

  private getString(key: string, defaultValue?: string): string {
    const value = this.configService.get(key, defaultValue);

    if (isNil(value)) {
      if (defaultValue !== undefined) {
        return defaultValue;
      }

      throw new Error(`${key} environment variable doesn't exist`);
    }

    return value.replaceAll('\\n', '\n');
  }

  private getDuration(key: string, format?: Units): number {
    const value = this.getString(key);

    const duration = parse(value, format);

    if (duration === undefined) {
      throw new Error(`${key} environment variable is not a valid duration`);
    }

    return duration;
  }

  get nodeEnv(): string {
    return this.getString('NODE_ENV');
  }

  get fallbackLanguage(): string {
    return this.getString('FALLBACK_LANGUAGE').toLowerCase();
  }

  get jwtConfig(): { privateKey: string; publicKey: string } {
    return {
      privateKey: this.getString('JWT_PRIVATE_KEY'),
      publicKey: this.getString('JWT_PUBLIC_KEY'),
    };
  }

  get documentationEnabled(): boolean {
    return this.getBoolean('ENABLE_DOCUMENTATION');
  }

  get authConfig() {
    return {
      privateKey: this.getString('JWT_PRIVATE_KEY'),
      publicKey: this.getString('JWT_PUBLIC_KEY'),
      jwtSmsExpirationTime: this.getNumber('JWT_SMS_EXPIRATION_TIME'),
    };
  }

  get appConfig() {
    return {
      port: this.getString('PORT'),
      cdnUrl: this.getString('CDN_URL'),
    };
  }

  get awsS3Config(): { bucketName: string; region: string } {
    return {
      bucketName: this.getString('AWS_S3_BUCKET_NAME'),
      region: this.getString('AWS_S3_BUCKET_REGION'),
    };
  }

  get openAiConfig(): { apiKey: string; organization: string } {
    return {
      organization: this.getString('OPENAI_ORG_ID'),
      apiKey: this.getString('OPENAI_API_KEY'),
    };
  }

  get interviewConfig(): { questionsCount: number } {
    return {
      questionsCount: this.getNumber('INTERVIEW_QUESTIONS_COUNT'),
    };
  }

  get throttlerConfigs(): ThrottlerModuleOptions {
    return {
      ttl: this.getDuration('THROTTLER_TTL', 'second'),
      limit: this.getNumber('THROTTLER_LIMIT'),
    };
  }

  get nats() {
    return {
      host: this.getString('NATS_HOST'),
      port: this.getNumber('NATS_PORT'),
    };
  }

  get redis() {
    return {
      host: this.getString('REDIS_HOST'),
      port: this.getNumber('REDIS_PORT'),
      password: this.getString('REDIS_PASSWORD', ''),
    };
  }

  get resumeGenerateConfig(): { lambdaFunctionName: string } {
    return {
      lambdaFunctionName: this.getString('AWS_LAMBDA_FUNCTION_NAME'),
    };
  }

  get googleRecaptchaConfig(): GoogleRecaptchaModuleOptions {
    return {
      enterprise: {
        siteKey: this.getString('RECAPTCHA_ENTERPRISE_SITE_KEY'),
        apiKey: this.getString('RECAPTCHA_ENTERPRISE_API_KEY'),
        projectId: this.getString('RECAPTCHA_ENTERPRISE_PROJECT_ID'),
      },
      response: (req) => (req.headers.recaptcha || '').toString(),
      skipIf: this.isDevelopment, //!this.isProduction,
      // network: GoogleRecaptchaNetwork.Recaptcha,
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

  get jobsPlatformUrl(): string {
    return this.getString('JOBS_PLATFORM_URL');
  }

  private get(key: string): string {
    const value = this.configService.get<string>(key);

    if (!value) {
      throw new Error(key + ' environment variable does not set'); // probably we should call process.exit() too to avoid locking the service
    }

    return value;
  }
}
