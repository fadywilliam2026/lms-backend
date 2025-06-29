import { NestFastifyApplication } from '@nestjs/platform-fastify';
import { User } from '@prisma/client';
import { initTest } from '../common/helpers/spec.helper';
import { OTPService } from './otp.service';

describe('AppController (e2e)', () => {
  let app: NestFastifyApplication;
  let agent: User & { accessToken: string; refreshToken: string };
  let admin: User & { accessToken: string; refreshToken: string };
  beforeAll(async () => {
    const data = await initTest();
    app = data.app;
    admin = data.admin;
    agent = data.agent;
  });

  afterAll(async () => {
    await app.close();
  });

  it('authenticates user with valid credentials and provides a jwt token', async () => {
    const result = await app.inject({
      method: 'POST',
      url: '/auth/login',
      payload: { email: 'admin@test.com', password: '12345678' },
    });
    const payload = JSON.parse(result.payload);
    expect(result.statusCode).toEqual(200);
    expect(payload.id).toEqual(admin.id);
    const jwtToken = payload.accessToken;
    expect(jwtToken).toMatch(/^[A-Za-z0-9-_=]+\.[A-Za-z0-9-_=]+\.?[A-Za-z0-9-_.+/=]*$/); // jwt regex
  });

  it('fails to authenticate user with an incorrect password', async () => {
    const response = await app.inject({
      method: 'POST',
      url: '/auth/login',
      payload: { email: 'agent@test.com', password: 'wrongpassword' },
    });
    expect(response.statusCode).toEqual(400);
    expect(JSON.parse(response.body).accessToken).not.toBeDefined();
  });

  it('fails to authenticate user that does not exist', async () => {
    const response = await app.inject({
      method: 'POST',
      url: '/auth/login',
      payload: { email: 'nobody@example.com', password: 'testpassword' },
    });
    expect(response.statusCode).toEqual(404);
    expect(JSON.parse(response.body).accessToken).not.toBeDefined();
  });

  it('gets current user with jwt authenticated request', async () => {
    // admin
    let result = await app.inject({
      url: '/users/current',
      headers: { authorization: `Bearer ${admin.accessToken}` },
    });
    let payload = JSON.parse(result.payload);
    expect(result.statusCode).toEqual(200);
    expect(payload.id).toEqual(admin.id);

    // agent
    result = await app.inject({
      url: '/users/current',
      headers: { authorization: `Bearer ${agent.accessToken}` },
    });
    payload = JSON.parse(result.payload);
    expect(result.statusCode).toEqual(200);
    expect(payload.id).toEqual(agent.id);
  });

  it('fails to get current user with invalid token', async () => {
    const result = await app.inject({
      url: '/users/current',
      headers: { authorization: `Bearer wrong` },
    });
    expect(result.statusCode).toEqual(401);
  });

  it('refresh token successfully', async () => {
    const result = await app.inject({
      method: 'POST',
      url: '/auth/refreshToken',
      payload: { refreshToken: admin.refreshToken },
    });
    expect(result.statusCode).toEqual(200);
    const payload = JSON.parse(result.payload);
    const accessToken = payload.accessToken;
    expect(accessToken).toMatch(/^[A-Za-z0-9-_=]+\.[A-Za-z0-9-_=]+\.?[A-Za-z0-9-_.+/=]*$/);
    const refreshToken = payload.refreshToken;
    expect(refreshToken).toMatch(/^[A-Za-z0-9-_=]+\.[A-Za-z0-9-_=]+\.?[A-Za-z0-9-_.+/=]*$/);
  });

  it('fail to refresh using hacked token', async () => {
    let result = await app.inject({
      method: 'POST',
      url: '/auth/refreshToken',
      payload: { refreshToken: agent.refreshToken },
    });
    const payload = JSON.parse(result.payload);
    const newAccessToken = payload.accessToken;
    expect(newAccessToken).toMatch(/^[A-Za-z0-9-_=]+\.[A-Za-z0-9-_=]+\.?[A-Za-z0-9-_.+/=]*$/);
    const newRefreshToken = payload.refreshToken;
    expect(newRefreshToken).toMatch(/^[A-Za-z0-9-_=]+\.[A-Za-z0-9-_=]+\.?[A-Za-z0-9-_.+/=]*$/);
    expect(result.statusCode).toEqual(200);

    // failures both old and enw refresh tokens
    result = await app.inject({
      method: 'POST',
      url: '/auth/refreshToken',
      payload: { refreshToken: agent.refreshToken },
    });
    expect(result.statusCode).toEqual(401);
    result = await app.inject({
      method: 'POST',
      url: '/auth/refreshToken',
      payload: { refreshToken: newRefreshToken },
    });
    expect(result.statusCode).toEqual(401);
  });

  it('sends otp message to existing user with valid phone number', async () => {
    const otpService = app.get(OTPService);

    jest.spyOn(otpService, 'sendSMSToUser').mockImplementation(() => ({ data: { code: '4901' } } as any));

    const result = await app.inject({
      method: 'POST',
      url: '/auth/sendOTP',
      payload: { phone: '20000000000' },
    });

    expect(result.statusCode).toEqual(200);
  });

  it('fails to send otp message to non-existing phone number', async () => {
    const otpService = app.get(OTPService);
    jest.spyOn(otpService, 'sendSMSToUser').mockImplementation(() => ({ data: { code: '4901' } } as any));
    const result = await app.inject({
      method: 'POST',
      url: '/auth/sendOTP',
      payload: { phone: '201999' },
    });

    expect(result.statusCode).toEqual(404);
  });

  it('successfully verifies sent otp', async () => {
    const otpService = app.get(OTPService);

    const mobile = '20000000000';
    const otp = '123456';

    jest.spyOn(otpService, 'generateOTP').mockImplementation(() => otp);

    jest.spyOn(otpService, 'sendSMSToUser').mockImplementation(() => ({ data: { code: '4901' } } as any));

    const res = await app.inject({
      method: 'POST',
      url: '/auth/sendOTP',
      payload: { phone: mobile },
    });
    expect(res.statusCode).toEqual(200);
    const result = await app.inject({
      method: 'POST',
      url: '/auth/verifyOTP',
      payload: { phone: mobile, otp: otp },
    });
    expect(result.statusCode).toEqual(200);
  });
});
