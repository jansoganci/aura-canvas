// Image compression utility

import imageCompression from 'browser-image-compression';

export interface CompressOptions {
  maxSizeMB?: number;
  maxWidthOrHeight?: number;
}

const defaultOptions: CompressOptions = {
  maxSizeMB: 0.5, // 500KB
  maxWidthOrHeight: 1200, // Max dimension
};

export async function compressImage(
  file: File,
  options: CompressOptions = {}
): Promise<File> {
  const mergedOptions = { ...defaultOptions, ...options };

  try {
    const compressedFile = await imageCompression(file, {
      maxSizeMB: mergedOptions.maxSizeMB,
      maxWidthOrHeight: mergedOptions.maxWidthOrHeight,
      useWebWorker: true,
      fileType: 'image/jpeg', // Convert to JPEG for smaller size
    });

    return compressedFile;
  } catch (error) {
    console.error('Image compression failed:', error);
    // Return original file if compression fails
    return file;
  }
}

export async function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

export async function compressAndConvert(
  file: File,
  options: CompressOptions = {}
): Promise<string> {
  const compressed = await compressImage(file, options);
  return fileToBase64(compressed);
}

// Validate image file
export function validateImage(file: File): string | null {
  const maxSize = 5 * 1024 * 1024; // 5MB
  const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];

  if (!allowedTypes.includes(file.type)) {
    return 'Please upload a valid image (JPEG, PNG, WebP, or GIF)';
  }

  if (file.size > maxSize) {
    return 'Image must be less than 5MB';
  }

  return null;
}
