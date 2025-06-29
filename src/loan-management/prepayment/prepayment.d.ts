export interface IPrepayment {
  makePrepayment(loanAccount, paymentAmount, valueDate);
  getPrepaymentAllocation?(installment, paymentAmount);
}
