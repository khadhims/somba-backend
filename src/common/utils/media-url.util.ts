export interface MediaUrlConfig {
  endpoint?: string;
  accessKey?: string;
  bucket?: string;
}

/** Bucket name as the S3 API expects it (strips any `accessKey:` prefix). */
export function resolveApiBucketName(bucket: string): string {
  const trimmed = bucket.trim();
  if (trimmed.includes(':')) {
    return trimmed.split(':', 2)[1]?.trim() || trimmed;
  }
  return trimmed;
}

/** Public base URL for stored objects: `<endpoint>/<bucket>` (no trailing slash). */
export function resolvePublicBaseUrl(config: MediaUrlConfig): string | null {
  const endpoint = (config.endpoint || '').replace(/\/$/, '').trim();
  const bucket = (config.bucket || '').trim();
  if (!endpoint || !bucket) {
    return null;
  }
  return `${endpoint}/${resolveApiBucketName(bucket)}`;
}

/**
 * Strips the S3 location prefix from a stored media URL and returns the bare
 * object key, or null if `raw` is not a recognised URL for this bucket.
 * Recognises both the current `<endpoint>/<bucket>/` form and the legacy
 * access-key-prefixed `<endpoint>/<accessKey>:<bucket>/` form.
 */
export function extractObjectKey(
  raw: string,
  config: MediaUrlConfig,
): string | null {
  const publicBase = resolvePublicBaseUrl(config);
  if (!publicBase) {
    return null;
  }

  const correctPrefix = `${publicBase}/`;
  if (raw.startsWith(correctPrefix)) {
    return raw.slice(correctPrefix.length);
  }

  // Legacy format stored before the path was corrected.
  if (config.accessKey) {
    const endpoint = (config.endpoint || '').replace(/\/$/, '').trim();
    const apiBucket = resolveApiBucketName(config.bucket || '');
    const oldPrefix = `${endpoint}/${config.accessKey.trim()}:${apiBucket}/`;
    if (raw.startsWith(oldPrefix)) {
      return raw.slice(oldPrefix.length);
    }
  }

  return null;
}

/**
 * Canonicalises a stored media URL to the current `<endpoint>/<bucket>/<key>`
 * form: rewrites legacy access-key-prefixed URLs and turns relative object
 * keys (`recordings/…`, `images/…`) into absolute URLs. Empty values and
 * unrecognised URLs are returned unchanged.
 */
export function normalizeMediaUrl(
  url: string | null | undefined,
  config: MediaUrlConfig,
): string | null | undefined {
  const raw = url?.trim();
  if (!raw) {
    return url;
  }

  const publicBase = resolvePublicBaseUrl(config);
  if (!publicBase) {
    return url;
  }

  const key = extractObjectKey(raw, config);
  if (key !== null) {
    return `${publicBase}/${key}`;
  }

  if (
    !raw.includes('://') &&
    (raw.startsWith('recordings/') || raw.startsWith('images/'))
  ) {
    return `${publicBase}/${raw}`;
  }

  return raw;
}
