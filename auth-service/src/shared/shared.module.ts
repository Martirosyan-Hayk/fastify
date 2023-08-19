import { SentryModule } from '@hr-drone/common-module';
import { Global, Module } from '@nestjs/common';

import { ApiConfigService } from './services/api-config.service';

const providers = [ApiConfigService];

@Global()
@Module({
  providers,
  imports: [
    SentryModule.forRootAsync({
      imports: [SharedModule],
      inject: [ApiConfigService],
      useFactory: (configService: ApiConfigService) =>
        configService.sentryConfig,
    }),
  ],
  exports: [...providers, SentryModule],
})
export class SharedModule {}
