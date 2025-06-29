import { ConsoleLogger } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { CreateNotificationTemplatesService } from './create-notification-templates.service';
import { CreateRolesService } from './create-roles.service';
import { CreateClientService } from './create-client.service';
import { CreateUserService } from './create-user.service';
import { AppModule } from '../app.module';
import { CreateGlService } from './create-gl.service';
import { CreateLoanProductService } from './create-loanProduct.service';
import { CreatePartnerService } from './create-partner.service';

async function main() {
  const module = await Test.createTestingModule({
    imports: [AppModule],
  }).compile();

  const createRolesService = module.get(CreateRolesService);
  const createNotificationTemplatesService = module.get(CreateNotificationTemplatesService);
  const createClientService = module.get(CreateClientService);
  //Create Partner
  const createPartnerService = module.get(CreatePartnerService);
  const createUserService = module.get(CreateUserService);
  const createGLService = module.get(CreateGlService);
  const createLoanProductService = module.get(CreateLoanProductService);
  const logger = module.get(ConsoleLogger);

  logger.log('Seeding...');
  await createRolesService.seed();
  await createNotificationTemplatesService.seed();
  await createPartnerService.seed();
  await createUserService.seed();
  await createClientService.seed();
  await createGLService.seed();
  await createLoanProductService.seed();
}

main().catch(e => console.error(e));
