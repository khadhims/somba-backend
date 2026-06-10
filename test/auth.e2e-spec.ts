import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from '../src/modules/auth/auth.module';
import { UsersModule } from '../src/modules/users/users.module';
import { TenantsModule } from '../src/modules/tenants/tenants.module';
import { InfrastructureModule } from '../src/modules/infrastructure/infrastructure.module';
import { OperationsModule } from '../src/modules/operations/operations.module';
import { ConfigModule } from '@nestjs/config';

describe('AuthController (e2e)', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [
        ConfigModule.forRoot({ isGlobal: true }),
        TypeOrmModule.forRoot({
          type: 'better-sqlite3',
          database: ':memory:',
          autoLoadEntities: true,
          synchronize: true,
        }),
        AuthModule,
        UsersModule,
        TenantsModule,
        InfrastructureModule,
        OperationsModule,
      ],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(new ValidationPipe());
    await app.init();
  });

  afterAll(async () => {
    if (app) {
      await app.close();
    }
  });

  it('/auth/register (POST)', () => {
    return request(app.getHttpServer())
      .post('/auth/register')
      .send({
        email: 'e2e@example.com',
        password: 'password123',
        first_name: 'E2E',
        last_name: 'Test',
      })
      .expect(201)
      .expect((res) => {
        expect(res.body.email).toEqual('e2e@example.com');
      });
  });

  it('/auth/login (POST)', async () => {
    return request(app.getHttpServer())
      .post('/auth/login')
      .send({
        email: 'e2e@example.com',
        password: 'password123',
      })
      .expect(200)
      .expect((res) => {
        expect(res.body.access_token).toBeDefined();
      });
  });
});
