import { EventEmitter2 } from '@nestjs/event-emitter';
import { NestFastifyApplication } from '@nestjs/platform-fastify';
import { Client, User } from '@prisma/client';
import { initTest } from '../../common/helpers/spec.helper';
import { Events } from '../../common/types/event';
import { MailService } from '../../mail/mail.service';
import { PrismaService } from 'nestjs-prisma';
import { SmsService } from '../sms.service';

describe('Listeners', () => {
  let app: NestFastifyApplication;
  let agent: User & { accessToken: string; refreshToken: string };
  let smsService: SmsService;
  let mailService: MailService;
  let eventEmitter2: EventEmitter2;
  let prisma: PrismaService;
  let client: Client;

  beforeAll(async () => {
    const data = await initTest();
    app = data.app;
    agent = data.agent;

    prisma = app.get(PrismaService);
    smsService = app.get(SmsService);
    mailService = app.get(MailService);
    eventEmitter2 = app.get(EventEmitter2);

    client = await prisma.client.create({
      data: {
        firstName: 'test',
        lastName: 'test',
        phone: '201005258982',
        email: 'noran.raafat@gmail.com',
        address: 'test',
        nationalId: 'test',
        preferredLanguage: 'ENGLISH',
        taxRecordId: 'test',
        commercialName: 'Commercial Name',
        user: {
          connect: {
            id: agent.id,
          },
        },
      },
    });
  });

  afterAll(async () => {
    await prisma.client.delete({
      where: {
        email: 'noran.raafat@gmail.com',
      },
    });
    await app.close();
  });

  it('should listen to client created event', async () => {
    const spySms = await jest.spyOn(smsService, 'sendSMS').mockImplementation(() => 'ok' as any);
    const spyMail = await jest.spyOn(mailService, 'sendMail').mockImplementation(() => 'ok' as any);
    await eventEmitter2.emitAsync(Events.ClientCreated, { clientId: client.id });
    expect(spySms).toHaveBeenCalled();
    expect(spyMail).toHaveBeenCalled();
  });

  it('should listen to client approved event', async () => {
    const spySms = await jest.spyOn(smsService, 'sendSMS').mockImplementation(() => 'ok' as any);
    const spyMail = await jest.spyOn(mailService, 'sendMail').mockImplementation(() => 'ok' as any);
    await eventEmitter2.emitAsync(Events.ClientApproved, { clientId: client.id });
    expect(spySms).toHaveBeenCalled();
    expect(spyMail).toHaveBeenCalled();
  });

  it('should listen to client rejected event', async () => {
    const spySms = await jest.spyOn(smsService, 'sendSMS').mockImplementation(() => 'ok' as any);
    const spyMail = await jest.spyOn(mailService, 'sendMail').mockImplementation(() => 'ok' as any);
    await eventEmitter2.emitAsync(Events.ClientRejected, { clientId: client.id });
    expect(spySms).toHaveBeenCalled();
    expect(spyMail).toHaveBeenCalled();
  });

  // it('should listen to loan account created event', async () => {
  //   const spySms = await jest.spyOn(smsService, 'sendSMS').mockImplementation(() => 'ok' as any);
  //   const spyMail = await jest.spyOn(mailService, 'sendMail').mockImplementation(() => 'ok' as any);
  //   await eventEmitter2.emitAsync(Events.LoanAccountCreated, loanAccount.id);
  //   expect(spySms).toHaveBeenCalled();
  //   expect(spyMail).toHaveBeenCalled();
  // });

  // it('should listen to loan account approved event', async () => {
  //   const spySms = await jest.spyOn(smsService, 'sendSMS').mockImplementation(() => 'ok' as any);
  //   const spyMail = await jest.spyOn(mailService, 'sendMail').mockImplementation(() => 'ok' as any);
  //   await eventEmitter2.emitAsync(Events.LoanAccountApproved, loanAccount.id);
  //   expect(spySms).toHaveBeenCalled();
  //   expect(spyMail).toHaveBeenCalled();
  // });

  // it('should listen to loan account rejected event', async () => {
  //   const spySms = await jest.spyOn(smsService, 'sendSMS').mockImplementation(() => 'ok' as any);
  //   const spyMail = await jest.spyOn(mailService, 'sendMail').mockImplementation(() => 'ok' as any);
  //   await eventEmitter2.emitAsync(Events.LoanAccountRejected, loanAccount.id);
  //   expect(spySms).toHaveBeenCalled();
  //   expect(spyMail).toHaveBeenCalled();
  // });
});
