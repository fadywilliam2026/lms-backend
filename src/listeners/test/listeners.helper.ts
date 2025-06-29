import merge from 'lodash/merge';
import { CreateLoanAccountDto } from '../../loan-accounts/dto/create-loan-account.dto';
import { client, loanAccount, loanProduct, user } from './test-data';

export default async ({ prisma, authService, clientService, loanProductsService, loanAccountsService }) => {
  await prisma.loanAccount.deleteMany({ where: { loanName: loanAccount.loanName } });
  await prisma.loanProduct.deleteMany({ where: { name: loanProduct.name } });
  await prisma.client.deleteMany({ where: { email: client.email } });
  await prisma.user.deleteMany({ where: { email: user.email } });
  const data: any = {};
  data.user = await authService.createUser(null, user);
  data.client = await clientService.create(data.user.id, client);
  data.loanProduct = await loanProductsService.create(loanProduct);
  data.loanAccount = await loanAccountsService.create(
    data.user.id,
    merge(new CreateLoanAccountDto(), {
      ...loanAccount,
      productId: data.loanProduct.id,
      clientId: data.client.id,
    }),
  );
  return data;
};
