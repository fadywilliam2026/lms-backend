import { ConsoleLogger, Injectable } from '@nestjs/common';
import { PrismaService } from 'nestjs-prisma';

@Injectable()
export class CreateNotificationTemplatesService {
  constructor(private readonly prisma: PrismaService, private readonly logger: ConsoleLogger) {}
  async seed() {
    this.logger.log('Creating notification templates');
    await this.prisma.notificationTemplate.createMany({
      data: [
        {
          event: 'client.created',
          bodyAr: 'تم إنشاء حساب جديد بنجاح بإسم {{firstName}} {{lastName}}',
          bodyEn: 'Hello {{firstName}} your account is created',
          type: 'SMS',
        },
        {
          event: 'client.created',
          bodyAr: '<h1>{{firstName}}تم إنشاء حساب جديد بإسم </h1>',
          bodyEn: '`<h1>Hello {{firstName}} your account is created</h1>`',
          type: 'EMAIL',
        },
        {
          event: 'client.approved',
          bodyAr: 'تم تفعيل حساب جديد بنجاح بإسم {{firstName}} {{lastName}}',
          bodyEn: 'Hello {{firstName}} your account is approved',
          type: 'SMS',
        },
        {
          event: 'client.approved',
          bodyAr: '<h1> تم تفعيل حساب جديد بنجاح بإسم {{firstName}} {{lastName}} </h1>',
          bodyEn: '`<h1>Hello {{firstName}} your account is approved</h1>`',
          type: 'EMAIL',
        },
        {
          event: 'client.rejected',
          bodyAr: 'تم رفض حساب بإسم {{firstName}} {{lastName}}',
          bodyEn: 'Hello {{firstName}} your account is rejected',
          type: 'SMS',
        },
        {
          event: 'client.rejected',
          bodyAr: '<h1> تم رفض حساب بإسم {{firstName}} {{lastName}}</h1>',
          bodyEn: '`<h1>Hello {{firstName}} your account is rejected</h1>`',
          type: 'EMAIL',
        },
        {
          event: 'loanaccount.created',
          bodyAr: ' تم التقديم على قرض بمبلغ {{loanAmount}} بفايدة {{interestRate}}%. سيتم مراجعة طلبك فى أقرب وقت',
          bodyEn:
            'Dear {{firstName}}, you have applied for a loan of {{loanAmount}} at {{interestRate}}% interest. We will process your application as soon as possible.',
          type: 'SMS',
        },
        {
          event: 'loanaccount.created',
          bodyAr:
            '<h1> تم التقديم على قرض بمبلغ {{loanAmount}} بفايدة {{interestRate}}%. سيتم مراجعة طلبك فى أقرب وقت</h1>',
          bodyEn:
            '`<h1>Dear {{firstName}}, you have applied for a loan of {{loanAmount}} at {{interestRate}}% interest. We will process your application as soon as possible.</h1>`',
          type: 'EMAIL',
        },
        {
          event: 'loanaccount.approved',
          bodyAr: 'تم الموافقة على قرض بمبلغ {{loanAmount}}. ',
          bodyEn: 'Your loan is approved with amount {{loanAmount}}',
          type: 'SMS',
        },
        {
          event: 'loanaccount.approved',
          bodyAr: '<h1> تم الموافقة على قرض بمبلغ {{loanAmount}}</h1>',
          bodyEn: '`<h1>Your loan is approved with amount {{loanAmount}}</h1>`',
          type: 'EMAIL',
        },
        {
          event: 'loanaccount.rejected',
          bodyAr: 'نأسف لإبلاغك أنه فد تم رفض طلبك لقرض بمبلغ {{loanAmount}}. من فضلك قم بالتواصل معنا لأي استفسارات',
          bodyEn:
            'Dear {{firstName}}, We regret to inform you that your loan application for amount {{loanAmount}} was unsuccessful. Please contact us if you have any questions.',
          type: 'SMS',
        },
        {
          event: 'loanaccount.rejected',
          bodyAr:
            '<h1> نأسف لإبلاغك أنه فد تم رفض طلبك لقرض بمبلغ {{loanAmount}}. من فضلك قم بالتواصل معنا لأي استفسارات</h1>',
          bodyEn:
            '`<h1>Dear {{firstName}}, We regret to inform you that your loan application for amount {{loanAmount}} was unsuccessful. Please contact us if you have any questions.</h1>`',
          type: 'EMAIL',
        },
        {
          event: 'loanaccount.disbursement',
          bodyAr: 'تم تسليم القرض بمبلغ {{loanAmount}}',
          bodyEn: 'Your loan is disbursed with amount {{loanAmount}}',
          type: 'SMS',
        },
        {
          event: 'loanaccount.disbursement',
          bodyAr: '<h1> تم تسليم القرض بمبلغ {{loanAmount}}</h1>',
          bodyEn: '`<h1>Your loan is disbursed with amount {{loanAmount}}</h1>`',
          type: 'EMAIL',
        },
        {
          event: 'loanaccount.writeoff',
          bodyAr: 'تم إلغاء القرض بمبلغ {{loanAmount}} لعدم دفع الأقساط المستحقة',
          bodyEn: 'Your loan is writeoff with amount {{loanAmount}} due to unpaid installments.',
          type: 'SMS',
        },
        {
          event: 'loanaccount.writeoff',
          bodyAr: '<h1> تم إلغاء القرض بمبلغ {{loanAmount}} لعدم دفع الأقساط المستحقة </h1>',
          bodyEn: '`<h1>Your loan is writeoff with amount {{loanAmount}}</h1>`',
          type: 'EMAIL',
        },
        {
          event: 'loanaccount.closed',
          bodyAr: 'تم إغلاق القرض بمبلغ {{loanAmount}} لدفع الأقساط المستحقة',
          bodyEn: 'Your loan account with amount {{loanAmount}} is closed with all installments paid',
          type: 'SMS',
        },
        {
          event: 'loanaccount.closed',
          bodyAr: '<h1> تم إغلاق القرض بمبلغ {{loanAmount}} لدفع الأقساط المستحقة</h1>',
          bodyEn: '`<h1>Your loan account with amount {{loanAmount}} is closed with all installments paid</h1>`',
          type: 'EMAIL',
        },
        {
          event: 'loanaccount.rescheduled',
          bodyAr: 'تم إعادة تخطيط القرض بمبلغ {{loanAmount}}',
          bodyEn: 'Your loan account with amount {{loanAmount}} is rescheduled',
          type: 'SMS',
        },
        {
          event: 'loanaccount.rescheduled',
          bodyAr: '<h1> تم إعادة تخطيط القرض بمبلغ {{loanAmount}}</h1>',
          bodyEn: '`<h1>Your loan account with amount {{loanAmount}} is rescheduled</h1>`',
          type: 'EMAIL',
        },
        {
          event: 'loanaccount.refinanced',
          bodyAr: 'تم تجديد القرض بمبلغ {{loanAmount}}',
          bodyEn: 'Your loan is refinanced with amount {{loanAmount}} into a new loan account',
          type: 'SMS',
        },
        {
          event: 'loanaccount.refinanced',
          bodyAr: '<h1> تم تجديد القرض بمبلغ {{loanAmount}}</h1>',
          bodyEn: '`<h1>Your loan is refinanced with amount {{loanAmount}} into a new loan account</h1>`',
          type: 'EMAIL',
        },
        {
          event: 'loanaccount.inarrears',
          bodyAr:
            'مرحبا {{firstName}}، حساب القرض الخاص بك فى فترة التأخير. إجمالي المبلغ المستحق {{totalLatePayments}}. يرجى الدفع فى أقرب وقت. ',
          bodyEn:
            'Hello {{firstName}}, Your loan account with amount {{loanAmount}} has been in arrears. The total due is {{totalLatePayments}}. Please pay as soon as possible.',
          type: 'SMS',
        },
        {
          event: 'loanaccount.inarrears',
          titleAr: 'القرض في حالة التأخر',
          titleEn: 'Account in Arrears', //TODO: add number of days in arrears
          bodyAr:
            '`<div><h3>مرحبا {{firstName}}</h3><p> حساب القرض الخاص بك فى فترة التأخير. إجمالي المبلغ المستحق {{totalLatePayments}}. يرجى الدفع فى أقرب وقت</p>`',
          bodyEn:
            '`<div><h3>Hello {{firstName}}</h3><p>Your loan account with amount {{loanAmount}} has been in arrears. The total due is {{totalLatePayments}}. Please pay as soon as possible.</p>`',
          type: 'EMAIL',
        },
        {
          event: 'loanaccount.updated', // ask Amgad
          bodyAr: '',
          bodyEn: '',
          type: 'SMS',
        },
        {
          event: 'loanaccount.updated', //ask Amgad
          bodyAr: '<h1> </h1>',
          bodyEn: '`<h1> </h1>`',
          type: 'EMAIL',
        },
        {
          event: 'loanaccount.installmentdue', // ask Amgad
          bodyAr: 'نذكركم بأن القسط المستحق بمبلغ {{installmentAmount}} سيتم دفعه في {{dueDate}}',
          bodyEn: 'We remind you that your installment of amount {{installmentAmount}} is due on {{dueDate}}',
          type: 'SMS',
        },
        {
          event: 'loanaccount.installmentdue', //ask Amgad
          bodyAr: '<h1>نذكركم بأن القسط المستحق بمبلغ {{installmentAmount}} سيتم دفعه في {{dueDate}} </h1>',
          bodyEn:
            '`<h1>We remind you that your installment of amount {{installmentAmount}} is due on {{dueDate}} </h1>`',
          type: 'EMAIL',
        },
        {
          event: 'loanaccount.installmentpaid', // ask Amgad
          bodyAr: 'تم دفع القسط المستحق بمبلغ {{installmentAmount}}',
          bodyEn: 'Your installment of amount {{installmentAmount}} is paid',
          type: 'SMS',
        },
        {
          event: 'loanaccount.installmentpaid', //ask Amgad
          bodyAr: '<h1>تم دفع القسط المستحق بمبلغ {{installmentAmount}} </h1>',
          bodyEn: '`<h1>Your installment of amount {{installmentAmount}} is paid</h1>`',
          type: 'EMAIL',
        },
      ],
    });
  }
}
