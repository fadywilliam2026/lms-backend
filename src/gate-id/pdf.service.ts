import { Injectable } from '@nestjs/common';
import fs from 'fs';
import * as path from 'path';
import { PDFDocument, PDFFont, TextAlignment, rgb } from 'pdf-lib';
import { cwd } from 'process';
import fontkit from '@pdf-lib/fontkit';
import { Client, Installment, Prisma } from '@prisma/client';
import moment from 'moment';
import { readFile } from 'fs/promises';
import { Decimal } from '@prisma/client/runtime/library';
import { ValidateAnswersDto } from '../clients/dto/validate-answers.dto';

@Injectable()
export class PdfService {
  constructor() {}

  private readonly CLIENT_CONTRACT_NAME = 'Service Agreement Contract.pdf';
  private readonly LOAN_CONTRACT_NAME = 'Loan Contract.pdf';

  async init(filePath: string) {
    const file = await readFile(path.join(cwd(), filePath));
    const pdfDoc = await PDFDocument.load(file);
    //Font Styles
    pdfDoc.registerFontkit(fontkit);
    const customFont = await pdfDoc.embedFont(await readFile(path.join(cwd(), 'fonts', 'NotoSans-mix.ttf')));
    return { pdfDoc, customFont };
  }

  async prepareLoanContract(
    loanAccount: Prisma.LoanAccountGetPayload<{ include: { client: true; installments: true } }>,
  ) {
    const { client, installments } = loanAccount;

    const { pdfDoc, customFont } = await this.init(this.LOAN_CONTRACT_NAME);

    this.drawInstallmentsTable(installments, pdfDoc, customFont);

    const fields = this.getLoanContractFields(loanAccount);
    this.fillDocFields(pdfDoc, fields, customFont);

    const pdfBytes = await pdfDoc.save();
    fs.writeFileSync(`${client.id}_${this.LOAN_CONTRACT_NAME}`, pdfBytes);

    return {
      file: new Blob([Buffer.from(pdfBytes)], { type: 'application/pdf' }),
      terms: this.getLoanContractConditionsAcceptance(),
    };
  }

  async prepareClientContract(client: Client, answers: ValidateAnswersDto) {
    const { pdfDoc, customFont } = await this.init(this.CLIENT_CONTRACT_NAME);

    const fields = this.getClientContractFields(client, answers);
    this.fillDocFields(pdfDoc, fields, customFont);

    const pdfBytes = await pdfDoc.save();
    fs.writeFileSync(`${client.id}_${this.CLIENT_CONTRACT_NAME}`, pdfBytes);

    return {
      file: new Blob([Buffer.from(pdfBytes)], { type: 'application/pdf' }),
      terms: this.getClientContractConditionsAcceptance(),
    };
  }

  private getClientContractFields(client: Client, answers: ValidateAnswersDto) {
    return [
      { name: 'agreementDate', value: moment().format('YYYY-MM-DD') },
      { name: 'agreementDay', value: moment().locale('ar').format('dddd') },
      // Flend
      { name: 'flendTaxNumber', value: '1234567890' }, //
      { name: 'flendAddress', value: '٣٢ شارع شجرة الدر' }, //
      { name: 'flendName', value: 'سيف الدين' }, //
      { name: 'flendRole', value: 'Operations Chief Manager' }, //
      { name: 'flendActivity', value: 'نمويل المشروعات الصغيرة والمتوسطة ش.م.م' }, //
      { name: 'flendPhoneNumber', value: '01012345678' }, //
      { name: 'flendEmail', value: 'flend@flend.io' }, //
      { name: 'flendOs', value: 'Web' }, //
      { name: 'flendWebsite', value: 'www.flend.io' }, //
      // { name: 'flendSignDate', value: moment().format('YYYY-MM-DD') },

      // Audit
      { name: 'auditNumber', value: '1234567890' }, //
      { name: 'auditYear', value: '2022' }, //
      { name: 'auditLicense', value: '1234567890' }, //
      { name: 'auditLicenseYear', value: '2022' }, //

      // Client
      { name: 'clientCommercialName', value: client.commercialName || '' }, //
      { name: 'clientAddress', value: client.address || '' }, //
      { name: 'clientTaxRecordId', value: client.taxRecordId || '' }, //
      { name: 'clientCommercialRecord', value: answers.customFields.commercialRecord },
      { name: 'clientName', value: `${client.firstName}\t${client.lastName}` }, //
      { name: 'clientIndustry', value: client.customFields['industry'] || '' }, //
      { name: 'clientPhoneNumber', value: client.phone || '' }, //
      { name: 'clientEmail', value: client.email || '' }, //
      { name: 'clientLicense', value: '20314' }, //
      { name: 'clientLicenseYear', value: '2024' }, //
      { name: 'clientLicenseDate', value: moment('2024-11-01').format('YYYY-MM-DD') }, //

      { name: 'approvedLimitText', value: client.approvedLimit.toString() }, //
      { name: 'loanPurpose', value: 'قرض لتوسيع النشاط التجاري' }, //
      { name: 'approvedLimit', value: client.approvedLimit.toString() }, //
      { name: 'withdrawalPeriod', value: 'يومان من' }, //
      { name: 'withdrawalPeriodReply', value: 'خمسة أيام' }, //
      // { name: 'availabilityPeriod', value: 'ثلاثة أشهر' },
      { name: 'earlyPay', value: '1' }, //
      {
        name: 'noOfFullTimeEmployees',
        value: answers.extraFields.noOfFullTimeEmployees || '',
      },
      { name: 'establishmentDate', value: moment(answers.customFields.establishmentDate).format('YYYY-MM-DD') || '' },
      { name: 'legalStructure', value: answers.extraFields.legalStructure || '' },
      {
        name: 'annualRevenueInLastYear',
        value: answers.extraFields.annualRevenueInLastYear || '',
      },
      {
        name: 'monthlyTransationVolume', // NOTE: Typo in the field name
        value: answers.extraFields.monthlyTransactionVolume || '',
      },
      { name: 'arabicName', value: `${client.firstName}\t${client.lastName}` },
      { name: 'nationalId', value: answers.nationalId || '' },
      { name: 'address', value: answers.address || '' },
    ];
  }

  private getLoanContractFields(
    loanAccount: Prisma.LoanAccountGetPayload<{ include: { client: true; installments: true } }>,
  ) {
    const { client, installments } = loanAccount;
    const installmentDues = Decimal.sum(
      installments[0].feesDue,
      installments[0].interestDue,
      installments[0].principalDue,
      installments[0].organizationCommissionDue,
    ).toString();
    const penaltyDue = Decimal.mul(0.05, installments[0].principalDue).toString();
    return [
      { name: 'disburseDay', value: moment().locale('ar').format('dddd') },
      { name: 'disburseDate', value: moment().format('YYYY-MM-DD') },
      // Flend
      { name: 'flendTaxNumber', value: '1234567890' },
      { name: 'flendName', value: 'سيف الدين' },
      { name: 'flendRole', value: 'Operations Chief Manager' },
      { name: 'flendOrganizationName', value: 'نمويل المشروعات الصغيرة والمتوسطة ش.م.م' },
      { name: 'flendLicenseDate', value: '2022' },

      { name: 'flendBranch', value: 'الفرع الرئيسي' },
      // Client
      { name: 'clientCommercialName', value: client.commercialName || '' },
      { name: 'clientAddress', value: client.address || '' },
      { name: 'clientTaxRecordId', value: client.taxRecordId || '' },
      { name: 'clientName', value: client.firstName + ' ' + client.lastName || '' },
      { name: 'clientIndustry', value: client.customFields['industry'] || '' },
      { name: 'approvedLimit', value: client.approvedLimit.toString() },
      { name: 'withdrawalPeriod', value: '1' },

      //loan
      { name: 'loanAmount', value: loanAccount.loanAmount.toString() },
      { name: 'interestRate', value: `${loanAccount.interestRate.toString()}%` },
      { name: 'penaltyRate', value: '5%' },

      // ملحق 1
      { name: 'loanTotalCost', value: '48%' },
      { name: 'loanAnnualCost', value: '48%' },
      { name: 'administrativeExpenses', value: '0%' },
      { name: 'requestLoanCost', value: '0' },
      { name: 'renewLoanCost', value: '0' },
      { name: 'idRegisteryCost', value: '0' },
      { name: 'settelementCost', value: '0' },
      { name: 'disburseCost', value: '0' },
      { name: 'serviceCost', value: '0' },
      { name: 'repaymentCost', value: '0' },
      { name: 'requiredInsuranceCost', value: '0' },
      { name: 'optionalInsuranceCost', value: '0' },
      { name: 'extraExpenses', value: '0' },
      { name: 'penaltyDue', value: penaltyDue },
      { name: 'installmentDues', value: installmentDues },
      { name: 'loanExpense', value: '0' },
      { name: 'totalExpenses', value: '0' },
      { name: 'total', value: installmentDues },
      { name: 'administrativeExpenses', value: '0' },
    ];
  }

  private fillDocFields(pdfDoc: PDFDocument, fields: { name: string; value: string }[], customFont: PDFFont) {
    const form = pdfDoc.getForm();
    for (const field of fields) {
      const formAttribute = form.getTextField(field.name);
      formAttribute.setAlignment(TextAlignment.Center);
      formAttribute.setText(field.value || '');
      formAttribute.setFontSize(10);
      formAttribute.defaultUpdateAppearances(customFont);
      formAttribute.enableReadOnly();
    }
  }

  private drawInstallmentsTable(installments: Installment[], pdfDoc: PDFDocument, customFont: PDFFont) {
    const page = pdfDoc.getPage(3);
    const headers = ['إجمالي مبلغ القسط', 'تاريخ السداد'];

    const tableData = [
      headers,
      ...installments.map(i => [
        Decimal.sum(i.feesDue, i.interestDue, i.principalDue, i.organizationCommissionDue).toString(),
        moment(i.dueDate).format('YYYY-MM-DD'),
      ]),
    ];

    // Define table styles
    const fontSize = 10;
    const rowHeight = 30;
    const colWidth = 200;
    const tableWidth = colWidth * headers.length;
    const margin = (page.getWidth() - tableWidth) / 2; // Center the table;

    // Draw the table
    tableData.forEach((row, rowIndex) => {
      row.forEach((cell, colIndex) => {
        const x = margin + colIndex * colWidth;
        const y = page.getHeight() - margin - rowIndex * rowHeight;
        page.drawText(cell, {
          x: x + 5,
          y: y + 20,
          color: rgb(0, 0, 0),
          size: fontSize,
          font: customFont,
        });
        // Draw cell borders
        const borderY = y + 40; // Adjust for font size and padding

        page.drawLine({
          start: { x, y: borderY },
          end: { x: x + colWidth, y: borderY },
          thickness: 1,
          color: rgb(0, 0, 0),
        });
        page.drawLine({
          start: { x, y: borderY },
          end: { x, y: borderY - rowHeight },
          thickness: 1,
          color: rgb(0, 0, 0),
        });
        page.drawLine({
          start: { x: x + colWidth, y: borderY },
          end: { x: x + colWidth, y: borderY - rowHeight },
          thickness: 1,
          color: rgb(0, 0, 0),
        });
        page.drawLine({
          start: { x, y: borderY - rowHeight },
          end: { x: x + colWidth, y: borderY - rowHeight },
          thickness: 1,
          color: rgb(0, 0, 0),
        });
      });
    });
  }

  private getClientContractConditionsAcceptance() {
    return [
      {
        page: 4,
        msg: {
          en: 'I agree to the general terms and conditions',
          ar: 'أوافق على الشروط والأحكام العامة',
        },
      },
      {
        page: 8,
        msg: {
          en: 'I agree to the financial terms',
          ar: 'أوافق على الشروط المالية',
        },
      },
      {
        page: 16,
        msg: {
          en: 'I agree to the legal terms',
          ar: 'أوافق على الشروط القانونية',
        },
      },
      {
        page: 17,
        msg: {
          en: 'I agree to the due diligence questions.',
          ar: 'أوافق على أسئلة العناية الواجبة.',
        },
      },
    ];
  }

  private getLoanContractConditionsAcceptance() {
    return [
      {
        page: 2,
        msg: {
          en: 'I agree to the general terms and conditions',
          ar: 'أوافق على الشروط والأحكام العامة',
        },
      },
      {
        page: 5,
        msg: {
          en: 'I agree to the financial terms',
          ar: 'أوافق على الشروط المالية',
        },
      },
      {
        page: 8,
        msg: {
          en: 'I agree to the legal terms',
          ar: 'أوافق على الشروط القانونية',
        },
      },
    ];
  }
}
