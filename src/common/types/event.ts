export enum Events {
  ClientApproved = 'client.approved',
  ClientRejected = 'client.rejected',
  ClientCreated = 'client.created',
  LoanAccountApproved = 'loanaccount.approved',
  LoanAccountCreated = 'loanaccount.created',
  LoanAccountRejected = 'loanaccount.rejected',
  LoanAccountDisbursement = 'loanaccount.disbursement',
  LoanAccountWriteOff = 'loanaccount.writeoff',
  LoanAccountClosed = 'loanaccount.closed',
  LoanAccountRescheduled = 'loanaccount.rescheduled',
  LoanAccountRefinanced = 'loanaccount.refinanced',
  LoanAccountInArrears = 'loanaccount.inarrears',
  LoanAccountUpdated = 'loanaccount.updated',
  LoanAccountInstallmentDue = 'loanaccount.installmentdue',
  LoanAccountInstallmentPaid = 'loanaccount.installmentpaid',
}
