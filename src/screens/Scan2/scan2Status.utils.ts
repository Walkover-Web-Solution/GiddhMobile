import { capitalizeName } from '@/utils/helper';

const normalizeStatusKey = (status: string) =>
  status.trim().toUpperCase().replace(/[\s-]+/g, '_');

type TranslateFn = (key: string, options?: Record<string, unknown>) => string;

export const DOCUMENT_STATUS_KEYS = ['COMPLETED', 'FAILED', 'IN_PROGRESS', 'PENDING'] as const;

const compactStatusText = (value: string) =>
  value.trim().toLowerCase().replace(/[\s_-]+/g, '');

export const isDocumentStatusKey = (value: string) =>
  (DOCUMENT_STATUS_KEYS as readonly string[]).includes(value);

/** File upload status shown on document cards and file-status filters. */
export const translateFileStatus = (t: TranslateFn, status: string) => {
  const key = normalizeStatusKey(status);
  if (key === 'COMPLETED') {
    return t('scan2.fileStatus.COMPLETED', { defaultValue: 'Uploaded' });
  }
  return t(`scan2.status.${key}`, { defaultValue: capitalizeName(status) ?? status });
};

/** OCR conversion status — keeps COMPLETED as "Completed". */
export const translateConvertedStatus = (t: TranslateFn, status: string) => {
  const key = normalizeStatusKey(status);
  return t(`scan2.status.${key}`, { defaultValue: capitalizeName(status) ?? status });
};

export const isFailedDocumentStatus = (status: string) => {
  const key = normalizeStatusKey(status);
  return key === 'FAILED' || key === 'FAIL' || key === 'ERROR';
};

const flattenFailureValue = (value: unknown): string | null => {
  if (value == null) {
    return null;
  }
  if (typeof value === 'string') {
    const trimmed = value.trim();
    return trimmed.length ? trimmed : null;
  }
  if (typeof value === 'number' && Number.isFinite(value)) {
    return String(value);
  }
  if (Array.isArray(value)) {
    const parts = value.map(flattenFailureValue).filter((part): part is string => !!part);
    return parts.length ? parts.join('\n') : null;
  }
  if (typeof value === 'object') {
    const record = value as Record<string, unknown>;
    return (
      flattenFailureValue(record.message) ||
      flattenFailureValue(record.errorMessage) ||
      flattenFailureValue(record.reason) ||
      flattenFailureValue(record.error) ||
      flattenFailureValue(record.description)
    );
  }
  return null;
};

/** Failure reason from an all-document list item. API sends it on files[0].error. */
export const extractDocumentFailureReason = (item: any): string | null => {
  const files = Array.isArray(item?.files) ? item.files : [];
  const failedFile =
    files.find((file: any) => flattenFailureValue(file?.error)) ?? files[0];

  const candidates = [
    failedFile?.error,
    item?.error,
    item?.errorMessage,
    item?.errors,
    item?.message,
  ];

  for (const candidate of candidates) {
    const text = flattenFailureValue(candidate);
    if (text) {
      return text;
    }
  }
  return null;
};

/**
 * Prefix-match the typed query against the visible status label only.
 * "u" / "up" / "uploaded" → COMPLETED (shown as Uploaded).
 * "uploadeds" does not match, so the API receives the unmatched text and returns no rows.
 */
export const resolveStatusSearchValue = (
  t: TranslateFn,
  query: string,
  kind: 'file' | 'converted'
): string => {
  const trimmed = query.trim();
  if (!trimmed) {
    return trimmed;
  }

  if (isDocumentStatusKey(trimmed)) {
    return trimmed;
  }

  const queryPrefix = compactStatusText(trimmed);
  const matches = DOCUMENT_STATUS_KEYS.filter((option) => {
    const label = kind === 'file' ? translateFileStatus(t, option) : translateConvertedStatus(t, option);
    return compactStatusText(label).startsWith(queryPrefix);
  });

  if (matches.length === 1) {
    return matches[0];
  }

  return trimmed;
};
