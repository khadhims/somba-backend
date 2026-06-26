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
import { EdgeModule } from './modules/edge/edge.module';
import { MediaModule } from './common/modules/media.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      validationOptions: {
        convert: true,
      },
      validationSchema: Joi.object({
        NODE_ENV: Joi.string()
          .valid('development', 'production', 'test')
          .default('development'),
        PORT: Joi.number().required(),
        DB_HOST: Joi.string().required(),
        DB_PORT: Joi.number().required(),
        DB_USERNAME: Joi.string().required(),
        DB_PASSWORD: Joi.string().required(),
        DB_DATABASE: Joi.string().required(),
        DB_AUTOLOAD_ENTITIES: Joi.boolean().default(true),
        DB_SYNCHRONIZE: Joi.boolean().default(false),
        DB_LOGGING: Joi.boolean().default(false),
        JWT_SECRET: Joi.string().required(),
        JWT_EXPIRATION: Joi.string().required(),
        REFRESH_TOKEN_EXPIRATION: Joi.string().optional(),
        EDGE_API_KEY: Joi.string().optional(),
        CORS_ORIGINS: Joi.string().default('http://localhost:5173'),
        SWAGGER_ENABLED: Joi.boolean().optional(),
        S3_ENDPOINT: Joi.string().optional(),
        S3_ACCESS_KEY: Joi.string().optional(),
        S3_SECRET_KEY: Joi.string().optional(),
        S3_REGION: Joi.string().optional(),
        S3_BUCKET: Joi.string().optional(),
        APP_URL: Joi.string().optional(),
      }),
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => {
        const dbLogging = configService.get<boolean>('DB_LOGGING', false);

        return {
          type: 'postgres',
          host: configService.getOrThrow<string>('DB_HOST'),
          port: configService.getOrThrow<number>('DB_PORT'),
          username: configService.getOrThrow<string>('DB_USERNAME'),
          password: configService.getOrThrow<string>('DB_PASSWORD'),
          database: configService.getOrThrow<string>('DB_DATABASE'),
          autoLoadEntities: configService.get<boolean>(
            'DB_AUTOLOAD_ENTITIES',
            true,
          ),
          synchronize: configService.get<boolean>('DB_SYNCHRONIZE', false),
          logging: dbLogging,
          ...(dbLogging ? { logger: 'advanced-console' as const } : {}),
        };
      },
      inject: [ConfigService],
    }),

    TenantsModule,
    UsersModule,
    AuthModule,
    InfrastructureModule,
    OperationsModule,
    EdgeModule, // after OperationsModule to satisfy module dependency order
    MediaModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
