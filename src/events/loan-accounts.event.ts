export class LoanAccountEvent {
  loanAccountId: number;
}

export class LoanAccountApprovedEvent extends LoanAccountEvent {}
export class LoanAccountCreatedEvent extends LoanAccountEvent {}
export class LoanAccountRejectedEvent extends LoanAccountEvent {}
export class LoanAccountDisbursementEvent extends LoanAccountEvent {}
export class LoanAccountInstallmentPaidEvent extends LoanAccountEvent {}
export class LoanAccountInstallmentDueEvent extends LoanAccountEvent {}
export class LoanAccountWriteOff extends LoanAccountEvent {}
export class LoanAccountClosedEvent extends LoanAccountEvent {}
export class LoanAccountRescheduledEvent extends LoanAccountEvent {}
export class LoanAccountRefinancedEvent extends LoanAccountEvent {}
export class LoanAccountInArrearsEvent extends LoanAccountEvent {}
export class LoanAccountUpdatedEvent extends LoanAccountEvent {}
