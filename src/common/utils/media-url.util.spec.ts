import { normalizeMediaUrl } from './media-url.util';

const config = {
  endpoint: 'https://sin1.contabostorage.com',
  accessKey: 'f9dd142b1a418b63fc4531366e0c7bc4',
  bucket: 'somba',
};

describe('normalizeMediaUrl', () => {
  it('rewrites old access-key-prefixed URLs to plain path format', () => {
    const old =
      'https://sin1.contabostorage.com/f9dd142b1a418b63fc4531366e0c7bc4:somba/recordings/KANTOR/file.mp4';
    const expected =
      'https://sin1.contabostorage.com/somba/recordings/KANTOR/file.mp4';

    expect(normalizeMediaUrl(old, config)).toBe(expected);
  });

  it('leaves already-correct plain path URLs unchanged', () => {
    const url =
      'https://sin1.contabostorage.com/somba/images/KANTOR/file.jpg';

    expect(normalizeMediaUrl(url, config)).toBe(url);
  });

  it('builds absolute URLs from relative object keys', () => {
    expect(normalizeMediaUrl('images/KANTOR/alert.jpg', config)).toBe(
      'https://sin1.contabostorage.com/somba/images/KANTOR/alert.jpg',
    );
    expect(normalizeMediaUrl('recordings/KANTOR/file.mp4', config)).toBe(
      'https://sin1.contabostorage.com/somba/recordings/KANTOR/file.mp4',
    );
  });

  it('returns empty values unchanged', () => {
    expect(normalizeMediaUrl('', config)).toBe('');
    expect(normalizeMediaUrl(undefined, config)).toBeUndefined();
    expect(normalizeMediaUrl(null, config)).toBeNull();
  });

  it('returns original URL when S3 config is incomplete', () => {
    const url =
      'https://sin1.contabostorage.com/somba/recordings/KANTOR/file.mp4';

    expect(normalizeMediaUrl(url, { endpoint: 'https://sin1.contabostorage.com' })).toBe(
      url,
    );
  });
});
