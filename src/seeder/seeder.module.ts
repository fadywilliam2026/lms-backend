import { Module, ConsoleLogger } from '@nestjs/common';
import { CreateNotificationTemplatesService } from './create-notification-templates.service';
import { CreateRolesService } from './create-roles.service';
import { CreateClientService } from './create-client.service';
import { CreateUserService } from './create-user.service';
import { AuthModule } from '../auth/auth.module';
import { CreateGlService } from './create-gl.service';
import { CreateLoanProductService } from './create-loanProduct.service';
import { GlModule } from '../gl/gl.module';
import { CreatePartnerService } from './create-partner.service';

@Module({
  imports: [AuthModule, GlModule],
  providers: [
    CreateNotificationTemplatesService,
    CreateRolesService,
    CreateClientService,
    CreateUserService,
    CreateGlService,
    ConsoleLogger,
    CreateLoanProductService,
    CreatePartnerService,
  ],
  exports: [CreateNotificationTemplatesService, CreateRolesService, CreateClientService, CreateUserService],
})
export class SeederModule {}
