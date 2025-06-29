import { HttpStatus } from '@nestjs/common';
import { ApiResponseOptions } from '@nestjs/swagger';

const loanAccount = {
  simpleLoan: {
    simpleLoanSchema: {
      type: 'object',
      properties: {
        status: { type: 'string', example: 'created' },
        data: {
          type: 'object',
          properties: {
            id: { type: 'integer', example: 18 },
            createdAt: { type: 'date', example: '2024-11-12T12:33:17.955Z' },
            updatedAt: { type: 'date', example: '2024-11-12T12:33:18.863Z' },
            customFields: {
              type: 'object',
              properties: {
                industry: { type: 'string', example: 'PHARMACY' },
                commercialRecord: { type: 'string', example: '1234' },
                establishmentDate: { type: 'date', example: '2024-11-10T13:56:42.546Z' },
              },
            },
            clientId: { type: 'integer', example: 6 },
            guarantorId: { type: 'integer', example: 0 },
            userId: { type: 'integer', example: 3 },
            accountArrearsSettingsId: { type: 'integer', example: 1 },
            accountState: {
              type: 'enum',
              example: 'PARTIAL_APPLICATION',
              enum: ['PARTIAL_APPLICATION', 'PENDING_APPROVAL', 'APPROVED', 'ACTIVE', 'ACTIVE_IN_ARREARS', 'CLOSED'],
            },
            accountSubState: {
              type: 'enum',
              example: 'PARTIALLY_DISBURSED',
              enum: [
                'PARTIALLY_DISBURSED',
                'LOCKED',
                'LOCKED_CAPPING',
                'REFINANCED',
                'RESCHEDULED',
                'WITHDRAWN',
                'PAID',
                'PAID_OFF',
                'REJECTED',
                'WRITTEN_OFF',
                'TERMINATED',
                'EARLY_PAYMENT',
              ],
            },
            accruedInterest: { type: 'float', example: 0 },
            accruedPenalty: { type: 'float', example: 0 },
            accrueInterestAfterMaturity: { type: 'boolean', example: false },
            accrueLateInterest: { type: 'boolean', example: false },
            applyAutomaticInterestOnPrepayment: { type: 'boolean', example: false },
            approvedAt: { type: 'date', example: '2024-11-12T12:33:18.863Z' },
            arrearsTolerancePeriod: { type: 'integer', example: 0 },
            closedAt: { type: 'date', example: '2024-11-12T12:33:18.863Z' },
            defaultFirstInstallmentDueDateOffset: { type: 'float', example: 0 },
            disbursementDetailsId: { type: 'integer', example: 0 },
            elementsRecalculationMethod: {
              type: 'enum',
              example: 'FIXED_PRINCIPAL_EXPECTED',
              enum: ['FIXED_PRINCIPAL_EXPECTED', 'FIXED_TOTAL_EXPECTED'],
            },
            feesBalance: { type: 'decimal', example: '0' },
            feesDue: { type: 'decimal', example: '0' },
            feesPaid: { type: 'decimal', example: '0' },
            fixedDaysOfMonth: { type: 'array', example: [] },
            futurePaymentsAcceptance: { type: 'boolean', example: false },
            gracePeriod: { type: 'integer', example: 0 },
            gracePeriodType: {
              type: 'enum',
              example: 'NONE',
              enum: ['NONE', 'PAY_INTEREST_ONLY', 'INTEREST_FORGIVENESS'],
            },
            hasCustomSchedule: { type: 'boolean', example: false },
            holdBalance: { type: 'float', example: 0 },
            interestApplicationMethod: {
              type: 'enum',
              example: 'ON_DISBURSEMENT',
              enum: ['ON_DISBURSEMENT', 'ON_INSTALLMENT'],
            },
            interestBalance: { type: 'decimal', example: '0' },
            interestBalanceCalculationMethod: {
              type: 'enum',
              example: 'ONLY_PRINCIPAL',
              enum: ['ONLY_PRINCIPAL', 'PRINCIPAL_AND_INTEREST'],
            },
            interestCalculationMethod: {
              type: 'enum',
              example: 'FLAT',
              enum: ['FLAT', 'DECLINING_BALANCE', 'DECLINING_BALANCE_DISCOUNTED'],
            },
            interestChargeFrequency: {
              type: 'enum',
              example: 'ANNUALIZED',
              enum: ['ANNUALIZED', 'EVERY_QUARTER', 'EVERY_MONTH', 'EVERY_WEEK', 'EVERY_DAY'],
            },
            interestComission: { type: 'float', example: 0 },
            interestDue: { type: 'decimal', example: '0' },
            interestFromArrearsAccrued: { type: 'float', example: 0 },
            interestFromArrearsBalance: { type: 'float', example: 0 },
            interestFromArrearsDue: { type: 'float', example: 0 },
            interestFromArrearsPaid: { type: 'float', example: 0 },
            interestPaid: { type: 'decimal', example: '0' },
            interestRate: { type: 'float', example: 2.5 },
            interestRateReviewCount: { type: 'integer', example: 0 },
            interestRateReviewUnit: {
              type: 'enum',
              example: 'DAYS',
              enum: ['DAYS', 'WEEKS', 'MONTHS'],
            },
            interestRateSource: {
              type: 'enum',
              example: 'FIXED_INTEREST_RATE',
              enum: ['FIXED_INTEREST_RATE', 'INDEX_INTEREST_RATE'],
            },
            interestType: {
              type: 'enum',
              example: 'SIMPLE_INTEREST',
              enum: ['SIMPLE_INTEREST', 'CAPITALIZED_INTEREST', 'COMPOUNDING_INTEREST'],
            },
            accountAppraisalAt: { type: 'date', example: '2024-11-12T12:33:18.863Z' },
            interestAppliedAt: { type: 'date', example: '2024-11-12T12:33:18.863Z' },
            interestReviewAt: { type: 'date', example: '2024-11-12T12:33:18.863Z' },
            lockedAt: { type: 'date', example: '2024-11-12T12:33:18.863Z' },
            setToArrearsAt: { type: 'date', example: '2024-11-12T12:33:18.863Z' },
            taxRateReviewAt: { type: 'date', example: '2024-11-12T12:33:18.863Z' },
            latePaymentsRecalculationMethod: {
              type: 'enum',
              example: 'INCREASE_OVERDUE_INSTALLMENTS',
              enum: ['INCREASE_OVERDUE_INSTALLMENTS', 'INCREASE_LAST_INSTALLMENT'],
            },
            loanAmount: { type: 'decimal', example: '100000' },
            loanName: { type: 'string', example: 'Weekly loan Zero interest Fees 1.5%' },
            loanPenaltyCalculationMethod: {
              type: 'enum',
              example: 'NONE',
              enum: ['NONE', 'OVERDUE_PRINCIPAL', 'OVERDUE_PRINCIPAL_AND_INTEREST'],
            },
            lockedOperations: { type: 'array', example: [] },
            notes: { type: 'string', example: 'Notes' },
            paymentMethod: {
              type: 'enum',
              example: 'HORIZONTAL',
              enum: ['HORIZONTAL', 'VERTICAL'],
            },
            penaltyBalance: { type: 'decimal', example: '0' },
            penaltyDue: { type: 'decimal', example: '0' },
            penaltyPaid: { type: 'decimal', example: '0' },
            penaltyRate: { type: 'float', example: 0 },
            balloonPeriodicPayment: { type: 'float', example: 0 },
            prepaymentAcceptance: { type: 'boolean', example: true },
            prepaymentRecalculationMethod: {
              type: 'enum',
              example: 'NO_RECALCULATION',
              enum: [
                'NO_RECALCULATION',
                'RESCHEDULE_REMAINING_INSTALLMENTS',
                'RECALCULATE_SCHEDULE_KEEP_SAME_NUMBER_OF_TERMS',
                'RECALCULATE_SCHEDULE_KEEP_SAME_PRINCIPAL_AMOUNT',
                'RECALCULATE_SCHEDULE_KEEP_SAME_TOTAL_INSTALLMENT_AMOUNT',
                'REDUCE_AMOUNT_PER_INSTALLMENT',
                'REDUCE_NUMBER_OF_INSTALLMENTS',
              ],
            },
            principalBalance: { type: 'decimal', example: '0' },
            principalDue: { type: 'decimal', example: '0' },
            principalPaid: { type: 'decimal', example: '0' },
            principalPaidInstallmentStatus: {
              type: 'enum',
              example: 'PAID',
              enum: ['PAID', 'ORIGINAL_TOTAL_EXPECTED_PAID', 'PARTIALLY_PAID'],
            },
            principalInstallmentInterval: { type: 'integer', example: 1 },
            productId: { type: 'integer', example: 1 },
            redrawBalance: { type: 'float', example: 1 },
            numInstallments: { type: 'integer', example: 10 },
            installmentPeriodCount: { type: 'integer', example: 1 },
            installmentPeriodUnit: {
              type: 'enum',
              example: 'DAYS',
              enum: ['DAYS', 'WEEKS', 'MONTHS', 'QUARTERS', 'YEARS'],
            },
            installmentScheduleMethod: {
              type: 'enum',
              example: 'NONE',
              enum: ['NONE', 'FIXED', 'DYNAMIC'],
            },
            scheduleDueDatesMethod: {
              type: 'enum',
              example: 'INTERVAL',
              enum: ['INTERVAL', 'FIXED_DAYS_OF_MONTH'],
            },
            shortMonthHandlingMethod: {
              type: 'enum',
              example: 'LAST_DAY_IN_MONTH',
              enum: ['LAST_DAY_IN_MONTH', 'FIRST_DAY_OF_NEXT_MONTH'],
            },
            startingInterestOnlyPeriodCount: { type: 'integer', example: 0 },
            contractId: { type: 'integer', example: 1 },
            organizationCommissionPercent: { type: 'float', example: 0 },
          },
        },
      },
    },
    errorSchema: {
      400: {
        type: 'object',
        properties: {
          error: { type: 'string', example: 'error' },
          statusCode: { type: 'string', example: HttpStatus.BAD_REQUEST },
          message: { type: 'string', example: 'Bad Request' },
        },
      },
      404: {
        type: 'object',
        properties: {
          error: { type: 'string', example: 'error' },
          statusCode: { type: 'string', example: HttpStatus.NOT_FOUND },
          message: { type: 'string', example: 'No company user Found' },
        },
      },
    },
  },
};

type LoanAccountResponse = {
  created: {
    simpleLoan: ApiResponseOptions;
  };
  error: {
    simpleLoan: {
      400: ApiResponseOptions;
      404: ApiResponseOptions;
    };
  };
};

export const loanAccountResponse: LoanAccountResponse = {
  created: {
    simpleLoan: {
      status: 201,
      description: 'loan account created successfully',
      schema: loanAccount.simpleLoan.simpleLoanSchema,
    },
  },
  error: {
    simpleLoan: {
      400: {
        status: 400,
        description: 'Bad Request',
        schema: loanAccount.simpleLoan.errorSchema[400],
      },
      404: {
        status: 404,
        description: 'No Company user Found',
        schema: loanAccount.simpleLoan.errorSchema[404],
      },
    },
  },
};
