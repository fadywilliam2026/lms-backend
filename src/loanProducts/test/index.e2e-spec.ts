import { NestFastifyApplication } from '@nestjs/platform-fastify';
import { User } from '@prisma/client';
import { initTest } from '../../common/helpers/spec.helper';
import * as createLoanProduct from './createLoanProduct.json';

describe('loanProductsController', () => {
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

  it('admin can create a loan product', async () => {
    const result = await app.inject({
      method: 'POST',
      url: `/loanproducts`,
      payload: createLoanProduct,
      headers: { authorization: `Bearer ${admin.accessToken}` },
    });
    expect(result.statusCode).toEqual(201);
  });

  it('user cannot create a loan product', async () => {
    const result = await app.inject({
      method: 'POST',
      url: `/loanproducts`,
      payload: createLoanProduct,
      headers: { authorization: `Bearer ${agent.accessToken}` },
    });
    expect(result.statusCode).toEqual(403);
  });

  it('admin can get all loan products', async () => {
    const result = await app.inject({
      method: 'GET',
      url: `/loanproducts`,
      headers: { authorization: `Bearer ${admin.accessToken}` },
    });
    expect(result.statusCode).toEqual(200);
  });

  it('user can get all loan products', async () => {
    const result = await app.inject({
      method: 'GET',
      url: `/loanproducts`,
      headers: { authorization: `Bearer ${agent.accessToken}` },
    });

    expect(result.statusCode).toEqual(200);
  });

  it('admin can update a loan product', async () => {
    const res = await app.inject({
      method: 'GET',
      url: `/loanproducts`,
      headers: { authorization: `Bearer ${admin.accessToken}` },
    });
    const loanProducts = JSON.parse(res.payload);
    const id = loanProducts[0].id;

    const result = await app.inject({
      method: 'PATCH',
      url: `/loanproducts/${id}`,
      payload: { active: false },
      headers: { authorization: `Bearer ${admin.accessToken}` },
    });
    expect(result.statusCode).toEqual(200);
  });

  it('user cannot update a loan product', async () => {
    const res = await app.inject({
      method: 'GET',
      url: `/loanproducts`,
      headers: { authorization: `Bearer ${agent.accessToken}` },
    });
    const loanProducts = JSON.parse(res.payload);
    const id = loanProducts[0].id;

    const result = await app.inject({
      method: 'PATCH',
      url: `/loanproducts/${id}`,
      payload: { active: false },
      headers: { authorization: `Bearer ${agent.accessToken}` },
    });
    expect(result.statusCode).toEqual(403);
  });

  it('admin can get a loan product by Id', async () => {
    const res = await app.inject({
      method: 'GET',
      url: `/loanproducts`,
      headers: { authorization: `Bearer ${admin.accessToken}` },
    });
    const loanProducts = JSON.parse(res.payload);
    const id = loanProducts[0].id;

    const result = await app.inject({
      method: 'GET',
      url: `/loanproducts/${id}`,
      headers: { authorization: `Bearer ${admin.accessToken}` },
    });
    expect(result.statusCode).toEqual(200);
  });

  it('user can get a loan product by Id', async () => {
    const res = await app.inject({
      method: 'GET',
      url: `/loanproducts`,
      headers: { authorization: `Bearer ${agent.accessToken}` },
    });
    const loanProducts = JSON.parse(res.payload);
    const id = loanProducts[0].id;

    const result = await app.inject({
      method: 'GET',
      url: `/loanproducts/${id}`,
      headers: { authorization: `Bearer ${agent.accessToken}` },
    });
    expect(result.statusCode).toEqual(200);
  });
});
