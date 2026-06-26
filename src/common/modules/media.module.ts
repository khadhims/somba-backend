import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { S3Client } from '@aws-sdk/client-s3';

export const S3_CLIENT = 'S3_CLIENT';

@Module({
  imports: [ConfigModule],
  providers: [
    {
      provide: S3_CLIENT,
      useFactory: (configService: ConfigService) =>
        new S3Client({
          endpoint: configService.get<string>('S3_ENDPOINT'),
          credentials: {
            accessKeyId: configService.get<string>('S3_ACCESS_KEY', ''),
            secretAccessKey: configService.get<string>('S3_SECRET_KEY', ''),
          },
          region: configService.get<string>('S3_REGION', 'us-east-1'),
          forcePathStyle: true,
        }),
      inject: [ConfigService],
    },
  ],
  exports: [S3_CLIENT],
})
export class MediaModule {}
