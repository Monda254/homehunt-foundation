/**
 * File Upload Security & Magic Number MIME Validation.
 * Prevents file extension spoofing and malicious file uploads across HomeHunt storage endpoints.
 */

export const MAX_IMAGE_SIZE_BYTES = 10 * 1024 * 1024; // 10MB
export const MAX_DOCUMENT_SIZE_BYTES = 15 * 1024 * 1024; // 15MB

export const ALLOWED_IMAGE_MIME_TYPES = ["image/jpeg", "image/png", "image/webp"];
export const ALLOWED_DOCUMENT_MIME_TYPES = ["application/pdf", "image/jpeg", "image/png"];

const MAGIC_NUMBERS: Record<string, number[]> = {
  "image/jpeg": [0xff, 0xd8, 0xff],
  "image/png": [0x89, 0x50, 0x4e, 0x47],
  "image/webp": [0x52, 0x49, 0x46, 0x46], // RIFF header
  "application/pdf": [0x25, 0x50, 0x44, 0x46], // %PDF
};

/**
 * Validates a file's binary magic numbers against expected signatures.
 */
export async function validateFileMagicNumber(
  fileOrBuffer: File | ArrayBuffer | Uint8Array,
  allowedMimeTypes: string[] = ALLOWED_IMAGE_MIME_TYPES,
): Promise<{ valid: boolean; detectedMime?: string; error?: string }> {
  let buffer: Uint8Array;

  if (typeof File !== "undefined" && fileOrBuffer instanceof File) {
    const arrayBuffer = await fileOrBuffer.slice(0, 16).arrayBuffer();
    buffer = new Uint8Array(arrayBuffer);
  } else if (fileOrBuffer instanceof ArrayBuffer) {
    buffer = new Uint8Array(fileOrBuffer.slice(0, 16));
  } else {
    buffer = (fileOrBuffer as Uint8Array).subarray(0, 16);
  }

  for (const mimeType of allowedMimeTypes) {
    const magic = MAGIC_NUMBERS[mimeType];
    if (magic && matchBytes(buffer, magic)) {
      return { valid: true, detectedMime: mimeType };
    }
  }

  return {
    valid: false,
    error: "File payload does not match expected binary magic numbers for allowed MIME types.",
  };
}

function matchBytes(buffer: Uint8Array, magic: number[]): boolean {
  if (buffer.length < magic.length) return false;
  for (let i = 0; i < magic.length; i++) {
    if (buffer[i] !== magic[i]) return false;
  }
  return true;
}

/**
 * Sanitizes uploaded filenames to prevent path traversal or special character execution.
 */
export function sanitizeFilename(originalName: string): string {
  const extension = originalName.split(".").pop() || "";
  const nameWithoutExt = originalName.substring(0, originalName.lastIndexOf("."));
  const safeBase = nameWithoutExt.replace(/[^a-zA-Z0-9_-]/g, "_").substring(0, 64);
  const safeExt = extension.replace(/[^a-zA-Z0-9]/g, "").toLowerCase();
  return `${safeBase}_${Date.now()}.${safeExt}`;
}

/**
 * Enforces file size limits.
 */
export function validateFileSize(
  sizeInBytes: number,
  maxSizeBytes: number = MAX_IMAGE_SIZE_BYTES,
): { valid: boolean; error?: string } {
  if (sizeInBytes > maxSizeBytes) {
    const maxMB = Math.round(maxSizeBytes / (1024 * 1024));
    return {
      valid: false,
      error: `File size exceeds maximum allowable threshold of ${maxMB}MB.`,
    };
  }
  return { valid: true };
}
