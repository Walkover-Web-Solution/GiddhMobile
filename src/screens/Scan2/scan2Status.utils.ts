import { capitalizeName } from '@/utils/helper';

const normalizeStatusKey = (status: string) =>
  status.trim().toUpperCase().replace(/[\s-]+/g, '_');

type TranslateFn = (key: string, options?: Record<string, unknown>) => string;

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
