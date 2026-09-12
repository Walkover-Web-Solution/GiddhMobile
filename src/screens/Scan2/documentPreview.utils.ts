const PDF_BASE64_MAGIC = 'JVBERi0';

export const getMimeTypeFromFileName = (fileName: string, type?: string | null) => {
  if (type && type !== 'application/octet-stream') {
    return type;
  }
  const ext = fileName.split('.').pop()?.toLowerCase();
  switch (ext) {
    case 'png':
      return 'image/png';
    case 'jpg':
    case 'jpeg':
      return 'image/jpeg';
    case 'webp':
      return 'image/webp';
    case 'pdf':
      return 'application/pdf';
    case 'zip':
      return 'application/zip';
    default:
      return type || 'application/octet-stream';
  }
};

export const isZipSource = (
  mimeType?: string | null,
  fileName?: string | null
) => {
  const normalizedMime = (mimeType ?? '').toLowerCase();
  if (normalizedMime.includes('zip')) {
    return true;
  }
  return (fileName ?? '').toLowerCase().endsWith('.zip');
};

export const isPdfSource = (
  uri?: string | null,
  mimeType?: string | null,
  fileName?: string | null
) => {
  if (!uri) {
    return false;
  }
  const normalizedMime = (mimeType ?? '').toLowerCase();
  if (normalizedMime.includes('pdf')) {
    return true;
  }
  if ((fileName ?? '').toLowerCase().endsWith('.pdf')) {
    return true;
  }

  const trimmed = uri.trim();
  if (trimmed.startsWith('data:application/pdf')) {
    return true;
  }
  if (trimmed.toLowerCase().endsWith('.pdf')) {
    return true;
  }
  if (!trimmed.startsWith('data:') && trimmed.startsWith(PDF_BASE64_MAGIC)) {
    return true;
  }
  return false;
};

const getImageMimeFromDataUri = (dataUri: string) => {
  const match = /^data:([^;]+);base64,/i.exec(dataUri);
  return match?.[1] ?? 'image/jpeg';
};

export const normalizePreviewUri = (
  raw?: string | null,
  mimeType?: string | null,
  fileName?: string | null
): string | null => {
  if (!raw) {
    return null;
  }

  const trimmed = raw.trim();
  if (!trimmed) {
    return null;
  }

  if (trimmed.startsWith('file://') || trimmed.startsWith('content://') || trimmed.startsWith('ph://')) {
    return trimmed;
  }

  if (trimmed.startsWith('data:')) {
    return trimmed;
  }

  const resolvedMime = mimeType ?? getMimeTypeFromFileName(fileName ?? '', mimeType);
  if (isPdfSource(trimmed, resolvedMime, fileName)) {
    return `data:application/pdf;base64,${trimmed}`;
  }

  const imageMime = resolvedMime.startsWith('image/') ? resolvedMime : 'image/jpeg';
  return `data:${imageMime};base64,${trimmed}`;
};

export const getPreviewMimeType = (
  uri?: string | null,
  mimeType?: string | null,
  fileName?: string | null
) => {
  if (uri?.startsWith('data:')) {
    return getImageMimeFromDataUri(uri);
  }
  return mimeType ?? getMimeTypeFromFileName(fileName ?? '', mimeType);
};
