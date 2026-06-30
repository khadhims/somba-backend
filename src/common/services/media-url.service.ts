import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  MediaUrlConfig,
  extractObjectKey,
  normalizeMediaUrl,
} from '../utils/media-url.util';

@Injectable()
export class MediaUrlService {
  constructor(private readonly configService: ConfigService) {}

  private getConfig(): MediaUrlConfig {
    return {
      endpoint: this.configService.get<string>('S3_ENDPOINT'),
      accessKey: this.configService.get<string>('S3_ACCESS_KEY'),
      bucket: this.configService.get<string>('S3_BUCKET'),
    };
  }

  /** Canonicalises a stored media URL (write path). */
  normalize(url: string | null | undefined): string | null | undefined {
    return normalizeMediaUrl(url, this.getConfig());
  }

  /**
   * Rewrites a stored S3 URL into a backend proxy URL (`<APP_URL>/s3-media/<key>`)
   * so the browser can fetch private objects without S3 credentials. Returns
   * the input unchanged if it isn't a recognised S3 URL for this bucket.
   */
  toProxyUrl(url: string | null | undefined): string | null | undefined {
    const raw = url?.trim();
    if (!raw) return url;

    const key = extractObjectKey(raw, this.getConfig());
    if (key === null) return url;

    const appUrl = this.configService
      .get<string>(
        'APP_URL',
        `http://localhost:${this.configService.get<number>('PORT', 3000)}`,
      )
      .replace(/\/$/, '');

    return `${appUrl}/s3-media/${key}`;
  }
}
