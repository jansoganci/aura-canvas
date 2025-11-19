// R2 Storage helpers

export async function uploadImage(
  r2: R2Bucket,
  key: string,
  data: ArrayBuffer,
  contentType: string
): Promise<void> {
  await r2.put(key, data, {
    httpMetadata: {
      contentType,
      cacheControl: 'public, max-age=31536000', // 1 year cache
    },
  });
}

export async function getImage(r2: R2Bucket, key: string): Promise<R2ObjectBody | null> {
  return r2.get(key);
}

export async function deleteImage(r2: R2Bucket, key: string): Promise<void> {
  await r2.delete(key);
}

export function getPublicUrl(bucketUrl: string, key: string): string {
  return `${bucketUrl}/${key}`;
}

// Parse base64 data URL to buffer
export function parseBase64Image(dataUrl: string): { buffer: ArrayBuffer; contentType: string } {
  const matches = dataUrl.match(/^data:(.+);base64,(.+)$/);

  if (!matches) {
    throw new Error('Invalid base64 image format');
  }

  const contentType = matches[1];
  const base64Data = matches[2];

  // Convert base64 to ArrayBuffer
  const binaryString = atob(base64Data);
  const bytes = new Uint8Array(binaryString.length);

  for (let i = 0; i < binaryString.length; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }

  return {
    buffer: bytes.buffer,
    contentType,
  };
}
