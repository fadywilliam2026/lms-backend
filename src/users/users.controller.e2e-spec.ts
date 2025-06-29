import { NestFastifyApplication } from '@nestjs/platform-fastify';
import { User } from '@prisma/client';
import { initTest } from '../common/helpers/spec.helper';
import { Roles } from '../common/types/role';
import { PrismaService } from 'nestjs-prisma';
import { AuthService } from '../auth/auth.service';
import { CreateUserDto } from '../auth/dto/auth.dto';

describe('AppController (e2e)', () => {
  let app: NestFastifyApplication;
  let agent: User & { accessToken: string; refreshToken: string };
  let admin: User & { accessToken: string; refreshToken: string };
  let supportUser: User & { accessToken: string; refreshToken: string };

  beforeAll(async () => {
    const data = await initTest();
    app = data.app;
    admin = data.admin;
    agent = data.agent;
    const dto: CreateUserDto = {
      phone: '01010101555',
      email: 'support@mail.com',
      password: '123456',
      firstName: 'John',
      role: Roles.support,
    };
    const authService = app.get<AuthService>(AuthService);
    supportUser = await authService.createUser(null, dto);
  });

  afterAll(async () => {
    await app.close();
  });

  it('user can get his data', async () => {
    const result = await app.inject({
      url: `/users/${agent.id}`,
      headers: { authorization: `Bearer ${agent.accessToken}` },
    });
    expect(result.statusCode).toEqual(200);
  });

  it('user cannot get other users data', async () => {
    const result = await app.inject({
      url: `/users/${admin.id}`,
      headers: { authorization: `Bearer ${agent.accessToken}` },
    });
    expect(result.statusCode).toEqual(403);
  });

  it('admin can list all users', async () => {
    const prisma = app.get(PrismaService);

    const result = await app.inject({
      url: `/users`,
      headers: { authorization: `Bearer ${admin.accessToken}` },
    });
    expect(result.statusCode).toEqual(200);
    const payload = JSON.parse(result.payload);
    const users = await prisma.user.findMany();
    expect(payload.length).toEqual(users.length);
  });

  it('user can list only himself', async () => {
    const result = await app.inject({
      url: `/users`,
      headers: { authorization: `Bearer ${agent.accessToken}` },
    });
    expect(result.statusCode).toEqual(200);
    const payload = JSON.parse(result.payload);
    expect(payload.length).toEqual(1);
  });

  it('create a user', async () => {
    const prisma = app.get(PrismaService);
    let result = await app.inject({
      method: 'POST',
      url: '/users',
      payload: {
        email: 'admin2@test.com',
        firstName: 'New admin',
        lastName: 'aaaa',
        password: '12345678',
        role: Roles.admin,
      },
      headers: { authorization: `Bearer ${admin.accessToken}` },
    });
    const adminRole = await prisma.role.findFirst({ where: { name: Roles.admin } });
    let payload = JSON.parse(result.payload);
    expect(payload.roleId).toEqual(adminRole.id);
    expect(result.statusCode).toEqual(201);

    result = await app.inject({
      method: 'POST',
      url: '/users',
      payload: {
        email: 'agent2@test.com',
        firstName: 'New agent',
        lastName: 'aaaa',
        password: '12345678',
        role: Roles.agent,
      },
      headers: { authorization: `Bearer ${admin.accessToken}` },
    });
    const agentRole = await prisma.role.findFirst({ where: { name: Roles.agent } });
    payload = JSON.parse(result.payload);
    expect(payload.roleId).toEqual(agentRole.id);
    expect(result.statusCode).toEqual(201);
  });

  it('Non-agent cannot create a user', async () => {
    const result = await app.inject({
      method: 'POST',
      url: '/users',
      payload: {
        email: 'agent3@test.com',
        firstName: 'New agent',
        lastName: 'aaaa',
        password: '12345678',
      },
      headers: { authorization: `Bearer ${supportUser.accessToken}` },
    });
    expect(result.statusCode).toEqual(403);
  });
});
