import { CommonService } from '@/core/services/common/common.service';
import Routes from '@/navigation/routes';

export const SCAN2_INVOICE_SOURCE = 'Scan2 Invoice';
export const SCAN2_BILL_SOURCE = 'Scan2Bill';

export type Scan2RouteParams = {
  isFromScan2?: boolean;
  requestId?: string;
  ocrType?: 'income' | 'expense';
  voucherType?: string;
  scan2Source?: typeof SCAN2_INVOICE_SOURCE | typeof SCAN2_BILL_SOURCE;
};

export type OcrMatchedAccount = {
  uniqueName: string;
  name: string;
};

export function getOcrMatchedAccount(body: any): OcrMatchedAccount | null {
  const uniqueName = (body?.account?.uniqueName ?? '').toString().trim();
  if (!uniqueName) {
    return null;
  }
  const name = (body?.account?.name ?? uniqueName).toString();
  return { uniqueName, name };
}

/** Use OCR party billing/shipping only when the selected account is the OCR-matched account. */
export function shouldUseOcrPartyAddresses(
  body: any,
  selectedPartyUniqueName?: string | null
): boolean {
  const ocrAccount = getOcrMatchedAccount(body);
  if (!ocrAccount || !selectedPartyUniqueName) {
    return false;
  }
  return ocrAccount.uniqueName === selectedPartyUniqueName;
}

function parseStoredCompanyVersion(stored: string): string | number {
  try {
    return JSON.parse(stored);
  } catch {
    const parsed = Number(stored);
    return Number.isNaN(parsed) ? stored : parsed;
  }
}

/** Prefer AsyncStorage over in-memory default (often 1 before mount finishes). */
export async function resolveScan2VoucherVersion(
  stateVersion: string | number | null | undefined,
  getStoredVersion?: () => Promise<string | null>
): Promise<string | number> {
  if (getStoredVersion) {
    const stored = await getStoredVersion();
    if (stored != null && stored !== '') {
      return parseStoredCompanyVersion(stored);
    }
  }
  if (stateVersion != null && stateVersion !== undefined) {
    return stateVersion;
  }
  return 2;
}

export async function fetchScan2OcrData(
  scanParams: Scan2RouteParams,
  voucherVersion: string | number,
  defaults?: { ocrType?: 'income' | 'expense'; voucherType?: string }
) {
  return CommonService.getOcrData({
    requestId: scanParams.requestId!,
    ocrType: scanParams.ocrType ?? defaults?.ocrType ?? 'income',
    voucherType: scanParams.voucherType ?? defaults?.voucherType ?? 'sales',
    voucherVersion,
  });
}

export async function markScan2DocumentComplete(
  scanParams: Scan2RouteParams | undefined,
  voucherVersion: string | number,
  defaults?: { ocrType?: 'income' | 'expense'; voucherType?: string }
) {
  if (!scanParams?.isFromScan2 || !scanParams?.requestId) {
    return;
  }

  try {
    await CommonService.markOcrDocumentComplete({
      nextToken: scanParams.requestId,
      ocrType: scanParams.ocrType ?? defaults?.ocrType ?? 'income',
      voucherType: scanParams.voucherType ?? defaults?.voucherType ?? 'sales',
      voucherVersion,
    });
  } catch (e) {
    console.warn('Failed to mark Scan2 OCR document complete', e);
  }
}

export function navigateBackToScan2(
  navigation: {
    navigate: (name: string, params?: object) => void;
    popTo?: (name: string, params?: object) => void;
    getParent?: () => any;
    canGoBack?: () => boolean;
    goBack?: () => void;
  },
  scanParams: Scan2RouteParams | undefined
): boolean {
  if (!scanParams?.isFromScan2) {
    return false;
  }

  const scan2Source =
    scanParams.scan2Source ??
    (scanParams.ocrType === 'expense' ? SCAN2_BILL_SOURCE : SCAN2_INVOICE_SOURCE);
  const params = { name: scan2Source };

  const tryPopTo = (nav?: any) => {
    if (nav && typeof nav.popTo === 'function') {
      try {
        nav.popTo(Routes.Scan2Screen, params);
        return true;
      } catch {
        return false;
      }
    }
    return false;
  };

  if (tryPopTo(navigation.getParent?.()?.getParent?.()) || tryPopTo(navigation.getParent?.()) || tryPopTo(navigation)) {
    return true;
  }

  navigation.navigate(Routes.Scan2Screen, {
    screen: Routes.Scan2Screen,
    params,
  });
  return true;
}

/** Header / system back: return to Scan2 when this voucher was opened from Scan2. */
export function handleScan2AwareBack(
  navigation: {
    navigate: (name: string, params?: object) => void;
    popTo?: (name: string, params?: object) => void;
    getParent?: () => any;
    canGoBack?: () => boolean;
    goBack?: () => void;
  },
  scanParams: Scan2RouteParams | undefined
) {
  if (navigateBackToScan2(navigation, scanParams)) {
    return;
  }
  navigation.goBack?.();
}
