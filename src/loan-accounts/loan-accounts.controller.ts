import {
  Body,
  Controller,
  ForbiddenException,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Req,
} from '@nestjs/common';
import { Permission } from '../auth/jwt-auth.guard';
import { Action } from '../common/types/action';
import { Roles } from '../common/types/role';
import { ChangeStateDto } from './dto/change-state.dto';
import { CreateLoanAccountDto } from './dto/create-loan-account.dto';
import { MakeRepaymentDto } from './dto/make-repayment.dto';
import { UpdateLoanAccountDto } from './dto/update-loan-account.dto';
import { LoanAccountsService } from './loan-accounts.service';
import { AccountStateActions } from './types/account-state-actions';
import { DisburseDto } from './dto/disburse-dto';
import { Prisma } from '@prisma/client';
import { RescheduleWriteOffAmount } from './dto/reschedule-write-off-amounts.dto';
import { CreateSimpleLoanDto } from './dto/create-simple-loan.dto';
import {
  ApiBadRequestResponse,
  ApiBearerAuth,
  ApiCreatedResponse,
  ApiNotFoundResponse,
  ApiTags,
} from '@nestjs/swagger';
import { loanAccountResponse } from './response.body';

// TODO: We will need to review permissions for every action as it's currently
// open season for every role.
type User = Prisma.UserGetPayload<{
  include: {
    role: true;
  };
}>;
@ApiTags('loans')
@ApiBearerAuth()
@Controller('loans')
export class LoanAccountsController {
  constructor(private readonly loanAccountsService: LoanAccountsService) {}

  canDisburse(user: User) {
    if (user.role?.name?.toLowerCase() !== Roles.admin && !user.role?.permissions?.includes('disburse:LoanAccount')) {
      throw new ForbiddenException('Only admin and financial can disburse loan accounts');
    }
  }

  canCreate(user: User) {
    if (user.role?.name?.toLowerCase() !== Roles.admin && !user.role?.permissions?.includes('create:LoanAccounts')) {
      throw new ForbiddenException('Only admin and agent can create loan accounts');
    }
  }
  canApprove(user: User) {
    if (user.role?.name?.toLowerCase() !== Roles.admin && !user.role?.permissions?.includes('approve:LoanAccount')) {
      throw new ForbiddenException('Only admin and checker can disburse loan accounts');
    }
  }

  @Post()
  create(@Req() { user }, @Body() createLoanAccountDto: CreateLoanAccountDto) {
    this.canCreate(user);
    const userId =
      createLoanAccountDto?.userId && user.role?.name?.toLowerCase() === Roles.admin
        ? createLoanAccountDto?.userId
        : user.id;
    return this.loanAccountsService.create(userId, createLoanAccountDto);
  }

  @Get()
  findMany(@Req() { user }) {
    return this.loanAccountsService.findMany(user);
  }

  @Permission([Action.Read, 'LoanAccount'])
  @Get('/:id')
  findUnique(@Param('id') id: string) {
    return this.loanAccountsService.findUnique(+id);
  }

  @Permission([Action.Update, 'LoanAccount'])
  @Patch('/:id')
  update(@Param('id') id: string, @Body() updateLoanAccountDto: UpdateLoanAccountDto) {
    return this.loanAccountsService.update(+id, updateLoanAccountDto);
  }

  // TODO: Restrict the actions to the one specified.
  // Allows posting an action such as approve/reject/withdraw/close loan account

  // TODO: This should be a POST request
  @Patch('/:id/changeState')
  changeState(@Req() { user }, @Param('id') id: string, @Body() changeStateDto: ChangeStateDto) {
    if (changeStateDto.action === AccountStateActions.APPROVE) {
      this.canApprove(user);
    }
    return this.loanAccountsService.changeState(+id, changeStateDto.action, {
      userId: user.id,
      valueDate: changeStateDto?.valueDate,
    });
  }

  @Post('/:id/disburse')
  disburse(@Req() { user }, @Param('id') id: string, @Body() disburseDto: DisburseDto) {
    this.canDisburse(user);
    return this.loanAccountsService.changeState(+id, AccountStateActions.DISBURSE, { ...disburseDto, userId: user.id });
  }

  // COMMENT: THIS CODE IS DEAD, WAITING FOR RESURRECTION
  @Post('/:id/makeRepayment')
  makeRepayment(@Param('id') id: string, @Body() makeRepaymentDto: MakeRepaymentDto) {
    return this.loanAccountsService.changeState(+id, AccountStateActions.MAKE_REPAYMENT, { makeRepaymentDto });
  }

  @Post('/:id/early-payment')
  async earlyPayment(@Req() { user }, @Param('id') id: string, @Body() makeRepaymentDto: MakeRepaymentDto) {
    return await this.loanAccountsService.changeState(+id, AccountStateActions.EARLY_PAYMENT, {
      makeRepaymentDto,
      userId: user.id,
    });
  }

  @Post('/:loanId/installment/:installmentId')
  makeInstallmentRepayment(
    @Param('loanId') loanId: string,
    @Param('installmentId') installmentId: string,
    @Body() makeRepaymentDto: MakeRepaymentDto,
  ) {
    return this.loanAccountsService.changeState(+loanId, AccountStateActions.MAKE_INSTALLMENT_REPAYMENT, {
      installmentId: +installmentId,
      makeRepaymentDto,
    });
  }

  @Post('/:id/writeOff')
  writeOff(@Param('id') id: string) {
    return this.loanAccountsService.changeState(+id, AccountStateActions.WRITE_OFF);
  }

  @Patch('/:id/terminate')
  terminate(@Param('id') id: string) {
    return this.loanAccountsService.changeState(+id, AccountStateActions.TERMINATE);
  }

  @Post('/:id/reschedule')
  reschedule(@Param('id') id: string, @Req() { user }: { user: User }, @Body() data: RescheduleWriteOffAmount) {
    return this.loanAccountsService.reschedule(user.id, +id, data);
  }

  // @Post('/:id/contract')
  // createContract(@Param('id', ParseIntPipe) id: number) {
  //   return this.loanAccountsService.createContract(id);
  // }

  @Get('/:id/contract-status')
  getContract(@Param('id', ParseIntPipe) id: number) {
    return this.loanAccountsService.getContract(id);
  }

  @Post('/simple-loan')
  @HttpCode(HttpStatus.CREATED)
  @ApiCreatedResponse(loanAccountResponse.created.simpleLoan)
  @ApiBadRequestResponse(loanAccountResponse.error.simpleLoan[400])
  @ApiNotFoundResponse(loanAccountResponse.error.simpleLoan[404])
  createSimpleLoan(@Req() { user }, @Body() createLoanAccountDto: CreateSimpleLoanDto) {
    return this.loanAccountsService.createSimpleLoan(user.id, createLoanAccountDto);
  }
}
