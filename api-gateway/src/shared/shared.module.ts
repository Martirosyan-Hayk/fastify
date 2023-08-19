import {
  ActivityClientService,
  AdminClientService,
  ApplicantClientService,
  ApplicantNoteClientService,
  ApplicantReportClientService,
  AtsClientService,
  AtsCompanyClientService,
  AuthClientService,
  CareerSettingsClientService,
  CompanyClientService,
  CompanyDetailsClientService,
  CompanyEmployeeClientService,
  CompanyReportClientService,
  CompanyReviewClientService,
  DomainSettingsClientService,
  EmailNotificationClientService,
  EmployeeTodoClientService,
  IndustryClientService,
  MessageClientService,
  MessageTemplateClientService,
  MessageWsClientService,
  N8nClientService,
  NotificationClientService,
  NotificationTelegramClientService,
  NovuClientService,
  PaymentCustomerClientService,
  PaymentProductClientService,
  PaymentSubscriptionClientService,
  PostClientService,
  ProfessionClientService,
  RedisClientService,
  RenderClientService,
  SearchCityClientService,
  SearchClientService,
  SentryModule,
  SkillClientService,
  SkillInterviewClientService,
  SpecialtyClientService,
  ThreadClientService,
} from '@hr-drone/common-module';
import {
  Global,
  Inject,
  Module,
  type OnApplicationShutdown,
  type OnModuleInit,
} from '@nestjs/common';
import { ClientProxy, ClientsModule, Transport } from '@nestjs/microservices';

import { ApiConfigService } from './services/api-config.service';
import { AwsS3Service } from './services/aws-s3.service';

const providers = [
  AwsS3Service,
  ApiConfigService,
  AtsClientService,
  N8nClientService,
  AuthClientService,
  NovuClientService,
  PostClientService,
  AdminClientService,
  RedisClientService,
  SkillClientService,
  ThreadClientService,
  SearchClientService,
  RenderClientService,
  MessageClientService,
  CompanyClientService,
  ActivityClientService,
  IndustryClientService,
  MessageWsClientService,
  ApplicantClientService,
  SpecialtyClientService,
  AtsCompanyClientService,
  SearchCityClientService,
  ProfessionClientService,
  EmployeeTodoClientService,
  NotificationClientService,
  CompanyReviewClientService,
  ApplicantNoteClientService,
  CompanyReportClientService,
  PaymentProductClientService,
  CompanyDetailsClientService,
  DomainSettingsClientService,
  CareerSettingsClientService,
  SkillInterviewClientService,
  MessageTemplateClientService,
  ApplicantReportClientService,
  CompanyEmployeeClientService,
  PaymentCustomerClientService,
  EmailNotificationClientService,
  PaymentSubscriptionClientService,
  NotificationTelegramClientService,
];

@Global()
@Module({
  providers,
  imports: [
    ClientsModule.registerAsync([
      {
        name: 'NATS_SERVICE',
        inject: [ApiConfigService],
        useFactory: (configService: ApiConfigService) => ({
          transport: Transport.NATS,
          options: {
            servers: [
              `nats://${configService.nats.host}:${configService.nats.port}`,
            ],
          },
        }),
      },
    ]),
    SentryModule.forRootAsync({
      imports: [SharedModule],
      inject: [ApiConfigService],
      useFactory: (configService: ApiConfigService) =>
        configService.sentryConfig,
    }),
  ],
  exports: [...providers, SentryModule],
})
export class SharedModule implements OnModuleInit, OnApplicationShutdown {
  constructor(
    @Inject('NATS_SERVICE')
    private client: ClientProxy,
  ) {}

  async onModuleInit() {
    await this.client.connect();
  }

  async onApplicationShutdown() {
    await this.client.close();
  }
}
