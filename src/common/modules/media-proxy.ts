import { INestApplication } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { GetObjectCommand, S3Client } from '@aws-sdk/client-s3';
import { Request, Response } from 'express';
import { Readable } from 'stream';
import { S3_CLIENT } from './media.module';

/**
 * Registers the S3 media proxy on the raw Express instance.
 *
 * Deliberately wired with `app.use` (rather than a Nest controller/middleware)
 * so that:
 *   1. arbitrary multi-segment paths (e.g. /media/alerts/cam/file.jpg) match via
 *      Express prefix mounting, sidestepping path-to-regexp wildcard limitations;
 *   2. the binary stream bypasses the global response interceptor and exception
 *      filter that wrap normal JSON responses.
 *
 * Streams objects from the private bucket using the server-side credentialed
 * client, forwarding Range requests so the browser can seek video.
 */
export function registerMediaProxy(app: INestApplication): void {
  const s3 = app.get<S3Client>(S3_CLIENT);
  const configService = app.get(ConfigService);
  const bucket = configService.get<string>('S3_BUCKET', 'somba');

  app.use('/media', async (req: Request, res: Response) => {
    const key = req.path.replace(/^\//, '');
    if (!key) {
      res.status(400).json({ message: 'Missing media key' });
      return;
    }

    const rangeHeader = req.headers['range'];
    try {
      const result = await s3.send(
        new GetObjectCommand({
          Bucket: bucket,
          Key: key,
          ...(rangeHeader ? { Range: rangeHeader } : {}),
        }),
      );
      const body = result.Body as Readable;
      res.status(rangeHeader ? 206 : 200);
      if (result.ContentType) res.setHeader('Content-Type', result.ContentType);
      if (result.ContentLength != null)
        res.setHeader('Content-Length', String(result.ContentLength));
      if (result.ContentRange)
        res.setHeader('Content-Range', result.ContentRange);
      res.setHeader('Accept-Ranges', 'bytes');
      res.setHeader('Cache-Control', 'private, max-age=3600');
      body.pipe(res);
    } catch {
      if (!res.headersSent) {
        res.status(404).json({ message: 'Media not found' });
      }
    }
  });
}
