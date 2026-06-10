import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import * as Joi from 'joi';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { TenantsModule } from './modules/tenants/tenants.module';
import { UsersModule } from './modules/users/users.module';
import { AuthModule } from './modules/auth/auth.module';
import { InfrastructureModule } from './modules/infrastructure/infrastructure.module';
import { OperationsModule } from './modules/operations/operations.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      validationSchema: Joi.object({
        PORT: Joi.number().required(),
        DB_HOST: Joi.string().required(),
        DB_PORT: Joi.number().required(),
        DB_USERNAME: Joi.string().required(),
        DB_PASSWORD: Joi.string().required(),
        DB_DATABASE: Joi.string().required(),
        DB_AUTOLOAD_ENTITIES: Joi.boolean().required(),
        DB_SYNCHRONIZE: Joi.boolean().required(),
        JWT_SECRET: Joi.string().required(),
        JWT_EXPIRATION: Joi.string().required(),
      }),
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        type: 'postgres',
        host: configService.getOrThrow<string>('DB_HOST'),
        port: configService.getOrThrow<number>('DB_PORT'),
        username: configService.getOrThrow<string>('DB_USERNAME'),
        password: configService.getOrThrow<string>('DB_PASSWORD'),
        database: configService.getOrThrow<string>('DB_DATABASE'),
        autoLoadEntities: configService.getOrThrow<boolean>(
          'DB_AUTOLOAD_ENTITIES',
        ),
        synchronize: configService.getOrThrow<boolean>('DB_SYNCHRONIZE'),
      }),
      inject: [ConfigService],
    }),

    TenantsModule,
    UsersModule,
    AuthModule,
    InfrastructureModule,
    OperationsModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
