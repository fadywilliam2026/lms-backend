import { GateIdModule } from './gate-id/gate-id.module';
import { HttpModule } from '@nestjs/axios';
import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { EventEmitter2, EventEmitterModule } from '@nestjs/event-emitter';
import { AuthModule } from './auth/auth.module';
import { CaslModule } from './casl/casl.module';
import { ClientsModule } from './clients/clients.module';
import config from './common/config/config';
import { DocumentModule } from './document/document.module';
import { GoogleCloudStorageModule } from './google-cloud-storage/google-cloud-storage.module';
import { ListenersModule } from './listeners/listeners.module';
import { SmsService } from './listeners/sms.service';
import { LoanAccountsModule } from './loan-accounts/loan-accounts.module';
import { LoanProductsModule } from './loanProducts/loanProducts.module';
import { MailModule } from './mail/mail.module';
import { PrismaModule } from 'nestjs-prisma';
import { UsersModule } from './users/users.module';
import { OrganizationModule } from './organization/organization.module';
import { AdminModule } from './admin/admin.module';
import { LoanManagementModule } from './loan-management/loan-managment.module';
import { CronModule } from './cron/cron.module';
import { ScheduleModule } from '@nestjs/schedule';
import { SeederModule } from './seeder/seeder.module';
import { DashboardModule } from './dashboard/dashboard.module';
import { GlModule } from './gl/gl.module';
import { CacheModule } from '@nestjs/cache-manager';
import { ThrottlerModule } from '@nestjs/throttler';
import { CreditEngineModule } from './credit-engine/credit-engine.module';
import { APP_GUARD } from '@nestjs/core';
import { JwtAuthGuard } from './auth/jwt-auth.guard';
import { ReportModule } from './report/report.module';

@Module({
  imports: [
    GateIdModule,
    ConfigModule.forRoot({ isGlobal: true, load: [config] }),
    PrismaModule.forRoot({
      isGlobal: true,
      prismaServiceOptions: {
        explicitConnect: true,
        prismaOptions: {
          datasources: {
            db: {
              url: process.env['DATABASE_URL']?.includes('connection_limit')
                ? process.env['DATABASE_URL']
                : process.env['DATABASE_URL'] + '?connection_limit=10',
            },
          },
        },
      },
    }),
    ThrottlerModule.forRoot([
      {
        ttl: 60000,
        limit: 10,
      },
    ]),
    ScheduleModule.forRoot(),
    UsersModule,
    AuthModule,
    CaslModule,
    ClientsModule,
    LoanProductsModule,
    GoogleCloudStorageModule,
    DocumentModule,
    LoanAccountsModule,
    EventEmitterModule.forRoot(),
    HttpModule,
    MailModule,
    ListenersModule,
    OrganizationModule,
    AdminModule,
    LoanManagementModule,
    CronModule,
    SeederModule,
    DashboardModule,
    GlModule,
    CacheModule.register({ isGlobal: true }),
    CreditEngineModule,
    ReportModule,
  ],
  providers: [
    {
      provide: APP_GUARD,
      useClass: JwtAuthGuard,
    },
    HttpModule,
    EventEmitter2,
    ConfigService,
    SmsService,
  ],
})
export class AppModule {}
