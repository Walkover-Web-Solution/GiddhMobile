import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Image,
  InteractionManager,
  Keyboard,
  Modal,
  Platform,
  Alert,
  RefreshControl,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import AntDesign from 'react-native-vector-icons/AntDesign';
import MaterialDesignIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { StackActions, useFocusEffect, useNavigation, useRoute } from '@react-navigation/native';
import { useTranslation } from 'react-i18next';
import moment from 'moment';
import _ from 'lodash';
import { launchCamera, launchImageLibrary } from 'react-native-image-picker';
import Header from '@/components/Header';
import Loader from '@/components/Loader';
import Toast from '@/components/Toast';
import { setBottomSheetVisible } from '@/components/BottomSheet';
import Icon from '@/core/components/custom-icon/custom-icon';
import { CommonService } from '@/core/services/common/common.service';
import useCustomTheme, { ThemeProps } from '@/utils/theme';
import colors from '@/utils/colors';
import { FONT_FAMILY } from '@/utils/constants';
import DateFilter from '@/screens/AllVoucherScreen/components/DateFilter';
import StickyDay from '@/screens/Transaction/components/StickyDay';
import DocumentCard from './components/DocumentCard';
import UploadSourceSheet, { UploadSource } from './components/UploadSourceSheet';
import DocumentFilterSheet, { DocumentFilterPayload } from './components/DocumentFilterSheet';
import SearchFilterSheet, { SearchFilterKey } from './components/SearchFilterSheet';
import DocumentActionSheet, { DocumentActionOption } from './components/DocumentActionSheet';
import DocumentPreviewViewer from './components/DocumentPreviewViewer';
import { isPdfSource } from './documentPreview.utils';
import {
  extractDocumentFailureReason,
  isFailedDocumentStatus,
  resolveStatusSearchValue,
} from './scan2Status.utils';
import { errorCodes, isErrorWithCode, keepLocalCopy, pick, types } from '@react-native-documents/picker';
import { check, request, PERMISSIONS, RESULTS, Permission, openSettings, PermissionStatus, openPhotoPicker } from 'react-native-permissions';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { black } from 'react-native-paper/lib/typescript/styles/themes/v2/colors';

const CAMERA_DENIAL_KEY = 'camera_permission_denied_once';
const GALLERY_DENIAL_KEY = 'gallery_permission_denied_once';
const FILES_DENIAL_KEY = 'files_permission_denied_once';

type PermissionKind = 'camera' | 'gallery' | 'files';

const PAGE_COUNT = 50;
const STATUS_OPTIONS = [
  'COMPLETED',
  'FAILED',
  'IN_PROGRESS',
  'PENDING',
];
const DEFAULT_DOCUMENT_FILTERS: DocumentFilterPayload = {
  status: null,
  convertedStatus: null,
  fileName: null,
  uploadedBy: null,
};
const QUICK_SEARCH_OPTIONS: {
  key: SearchFilterKey;
  labelKey: string;
  defaultValue: string;
  chipLabelKey: string;
  chipDefaultValue: string;
}[] = [
  {
    key: 'status',
    labelKey: 'scan2.statusLabel',
    defaultValue: 'Status',
    chipLabelKey: 'scan2.statusLabel',
    chipDefaultValue: 'Status',
  },
  {
    key: 'convertedStatus',
    labelKey: 'scan2.convertedStatusLabel',
    defaultValue: 'Converted status',
    chipLabelKey: 'scan2.convertedChip',
    chipDefaultValue: 'Converted',
  },
  {
    key: 'fileName',
    labelKey: 'scan2.fileName',
    defaultValue: 'File name',
    chipLabelKey: 'scan2.fileNameChip',
    chipDefaultValue: 'File',
  },
  {
    key: 'uploadedBy',
    labelKey: 'scan2.uploadedBy',
    defaultValue: 'Uploaded by',
    chipLabelKey: 'scan2.uploadedByChip',
    chipDefaultValue: 'Uploader',
  },
];
const SEARCH_PLACEHOLDERS: Record<SearchFilterKey, { key: string; defaultValue: string }> = {
  status: { key: 'scan2.searchStatusPlaceholder', defaultValue: 'Search by status' },
  convertedStatus: { key: 'scan2.searchConvertedStatusPlaceholder', defaultValue: 'Search by converted status' },
  fileName: { key: 'scan2.fileNamePlaceholder', defaultValue: 'Search by file name' },
  uploadedBy: { key: 'scan2.uploadedByPlaceholder', defaultValue: 'Search by uploader' },
};

const INVOICE_DOCUMENT_ACTIONS: DocumentActionOption[] = [
  {
    key: 'invoice',
    labelKey: 'scan2.createInvoice',
    defaultValue: 'Create Invoice',
    color: '#229F5F',
    navigateTo: 'SalesVoucherUpdateStack',
    screen: 'VoucherUpdateScreen',
    voucherType: 'sales',
  },
  {
    key: 'creditNote',
    labelKey: 'scan2.createCreditNote',
    defaultValue: 'Create Credit Note',
    color: '#3497FD',
    navigateTo: 'CreditNoteUpdateStack',
    screen: 'VoucherUpdateScreen',
    voucherType: 'credit note',
  },
  {
    key: 'receipt',
    labelKey: 'scan2.createReceipt',
    defaultValue: 'Create Receipt',
    color: '#00B795',
    navigateTo: 'ReceiptScreens',
    screen: 'ReceiptScreen',
    voucherType: 'receipt',
  },
];

const BILL_DOCUMENT_ACTIONS: DocumentActionOption[] = [
  {
    key: 'bill',
    labelKey: 'scan2.createBill',
    defaultValue: 'Create Bill',
    color: '#FC8345',
    navigateTo: 'PurchaseVoucherUpdateStack',
    screen: 'VoucherUpdateScreen',
    voucherType: 'purchase',
  },
  {
    key: 'debitNote',
    labelKey: 'scan2.createDebitNote',
    defaultValue: 'Create Debit Note',
    color: '#ff6961',
    navigateTo: 'DebitNoteUpdateStack',
    screen: 'VoucherUpdateScreen',
    voucherType: 'debit note',
  },
  {
    key: 'payment',
    labelKey: 'scan2.createPayment',
    defaultValue: 'Create Payment',
    color: '#084EAD',
    navigateTo: 'PaymentScreens',
    screen: 'PaymentScreen',
    voucherType: 'payment',
  },
];

type SelectedFile = {
  uri: string;
  name: string;
  type: string;
};

const getDocumentDate = (item: any) =>
  item?.date ?? item?.uploadedAt ?? item?.requestDate ?? item?.createdAt ?? '';

const getMimeType = (fileName: string, type?: string | null) => {
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

const resolveLocalFileUri = async (file: SelectedFile) => {
  try {
    const [copyResult] = await keepLocalCopy({
      files: [
        {
          uri: file.uri,
          fileName: file.name,
        },
      ],
      destination: 'cachesDirectory',
    });
    if (copyResult?.status === 'success' && copyResult.localUri) {
      return copyResult.localUri;
    }
  } catch (error) {
    console.log('keepLocalCopy failed, using original uri', error);
  }
  return file.uri;
};

const normalizeFilterValue = (value: string | null) => {
  const trimmed = (value ?? '').trim();
  return trimmed.length ? trimmed : null;
};

const normalizeFilterPayload = (payload: DocumentFilterPayload): DocumentFilterPayload => ({
  status: normalizeFilterValue(payload.status),
  convertedStatus: normalizeFilterValue(payload.convertedStatus),
  fileName: normalizeFilterValue(payload.fileName),
  uploadedBy: normalizeFilterValue(payload.uploadedBy),
});

const hasActiveFilters = (payload: DocumentFilterPayload) => {
  const normalized = normalizeFilterPayload(payload);
  return !!(
    normalized.status ||
    normalized.convertedStatus ||
    normalized.fileName ||
    normalized.uploadedBy
  );
};

const resolveSearchFilterValue = (
  field: SearchFilterKey,
  value: string,
  t: (key: string, options?: Record<string, unknown>) => string
) => {
  if (field === 'status') {
    return resolveStatusSearchValue(t, value, 'file');
  }
  if (field === 'convertedStatus') {
    return resolveStatusSearchValue(t, value, 'converted');
  }
  return value;
};

const buildSingleQueryFilter = (
  field: SearchFilterKey,
  value: string | null,
  t: (key: string, options?: Record<string, unknown>) => string
): DocumentFilterPayload => {
  const normalized = normalizeFilterValue(value);
  if (!normalized) {
    return { ...DEFAULT_DOCUMENT_FILTERS };
  }

  return {
    ...DEFAULT_DOCUMENT_FILTERS,
    [field]: resolveSearchFilterValue(field, normalized, t),
  };
};

const toApiFilterPayload = (
  payload: DocumentFilterPayload,
  t: (key: string, options?: Record<string, unknown>) => string
): DocumentFilterPayload => {
  const normalized = normalizeFilterPayload(payload);
  return {
    ...normalized,
    status: normalized.status ? resolveStatusSearchValue(t, normalized.status, 'file') : null,
    convertedStatus: normalized.convertedStatus
      ? resolveStatusSearchValue(t, normalized.convertedStatus, 'converted')
      : null,
  };
};

const uploadFileToSignedUrl = async (signedUrl: string, fileUri: string, contentType: string) => {
  const fileResponse = await fetch(fileUri);
  if (!fileResponse.ok) {
    throw new Error('Unable to read selected file');
  }
  const fileBlob = await fileResponse.blob();

  // Use fetch (not axios/blob-util) so the presigned query string is not re-encoded
  const s3Response = await fetch(signedUrl, {
    method: 'PUT',
    headers: {
      'Content-Type': contentType,
    },
    body: fileBlob,
  });

  if (!s3Response.ok) {
    const errorText = await s3Response.text().catch(() => '');
    throw new Error(errorText || `S3 upload failed (${s3Response.status})`);
  }
};

const Scan2Screen = () => {
  const { t } = useTranslation();
  const route = useRoute<any>();
  const navigation = useNavigation<any>();
  const { styles, voucherBackground, statusBar } = useCustomTheme(getStyles, 'PdfPreview');

  const scanType = route?.params?.name ?? route?.params?.params?.name ?? 'Scan2 Invoice';
  const title = t(`AddButton.${scanType}`, { defaultValue: scanType });
  const ocrType: 'income' | 'expense' = scanType === 'Scan2Bill' ? 'expense' : 'income';
  const documentActions = ocrType === 'expense' ? BILL_DOCUMENT_ACTIONS : INVOICE_DOCUMENT_ACTIONS;

  const [previewUri, setPreviewUri] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<SelectedFile | null>(null);
  const [isPreviewVisible, setIsPreviewVisible] = useState(false);
  const [failurePopup, setFailurePopup] = useState<{ title: string; message: string } | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [documents, setDocuments] = useState<any[]>([]);
  const [pageCount, setPageCount] = useState({ page: 1, count: PAGE_COUNT, totalItem: 0 });
  const [date, setDate] = useState<{ startDate: string; endDate: string }>({
    startDate: moment().subtract(30, 'd').format('DD-MM-YYYY'),
    endDate: moment().format('DD-MM-YYYY'),
  });
  const [activeDateFilter, setActiveDateFilter] = useState('');
  const [dateMode, setDateMode] = useState('defaultDates');
  const [appliedFilters, setAppliedFilters] = useState<DocumentFilterPayload>({ ...DEFAULT_DOCUMENT_FILTERS });
  const [draftFilters, setDraftFilters] = useState<DocumentFilterPayload>({ ...DEFAULT_DOCUMENT_FILTERS });
  const [selectedSearchKey, setSelectedSearchKey] = useState<SearchFilterKey>('status');
  const [searchText, setSearchText] = useState('');
  const [isSearchMode, setIsSearchMode] = useState(false);
  const stickyDayRef = useRef<any>(null);
  const uploadSourceSheetRef = useRef<any>(null);
  const searchInputRef = useRef<TextInput>(null);
  const skipNextFilterRefreshRef = useRef(false);
  /** Keep date/filters in refs so focus/refresh always use the latest values. */
  const dateRef = useRef(date);
  const appliedFiltersRef = useRef(appliedFilters);
  /** Skip clearing filters when returning from AppDatePicker. */
  const preserveStateOnNextFocusRef = useRef(false);

  dateRef.current = date;
  appliedFiltersRef.current = appliedFilters;
  const searchSheetRef = useRef<any>(null);
  const filterSheetRef = useRef<any>(null);
  const documentActionSheetRef = useRef<any>(null);
  const selectedDocumentRef = useRef<any>(null);
  const pendingUploadSourceRef = useRef<UploadSource | null>(null);
  const uploadActionTokenRef = useRef(0);
  const pendingUploadTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const tRef = useRef(t);
  tRef.current = t;
  const quickSearchDebounceRef = useRef(
    _.debounce((field: SearchFilterKey, value: string) => {
      const nextFilters = buildSingleQueryFilter(field, value, tRef.current);
      setDraftFilters(nextFilters);
      setAppliedFilters(nextFilters);
    }, 450)
  );
  const CurrentChipDate = useRef<string | null>(null);
  const isFilterActive = hasActiveFilters(appliedFilters);
  const showAdvancedFilterIndicator = !isSearchMode && isFilterActive;

  const _setActiveDateFilter = (nextActiveDateFilter: string, nextDateMode: string) => {
    setActiveDateFilter(nextActiveDateFilter);
    setDateMode(nextDateMode);
  };

  const getAllDocuments = async (
    page: number,
    filters: DocumentFilterPayload = appliedFiltersRef.current,
    dateRange: { startDate: string; endDate: string } = dateRef.current
  ) => {
    try {
      const response = await CommonService.getAllDocuments(
        page,
        pageCount.count,
        dateRange.startDate,
        dateRange.endDate,
        ocrType,
        toApiFilterPayload(filters, t)
      );

      if (response?.status === 'success') {
        const items = response?.body?.items ?? response?.body?.results ?? [];
        const totalPages = response?.body?.totalPages;
        const totalItems =
          response?.body?.totalItems ??
          (typeof totalPages === 'number' ? totalPages * pageCount.count : items.length);

        setDocuments((prev) => (page === 1 ? items : [...prev, ...items]));
        setPageCount((prev) => ({
          page: items?.length < pageCount.count ? -1 : page + 1,
          count: prev.count,
          totalItem: totalItems,
        }));
        if (totalItems > pageCount.count) {
          setIsLoadingMore(true);
        }
      } else {
        Toast({
          message: response?.message ?? t('common.somethingWentWrong'),
          duration: 'SHORT',
          position: 'BOTTOM',
        });
      }
    } catch (error: any) {
      console.log('Error while fetching Scan2 documents', error);
      Toast({
        message: error?.response?.data?.message ?? error?.message ?? t('common.somethingWentWrong'),
        duration: 'SHORT',
        position: 'BOTTOM',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const loadMoreDocuments = (page: number) => getAllDocuments(page, appliedFilters);

  const throttleLoadMore = useCallback(
    _.debounce(
      () => {
        if (documents?.length >= pageCount.totalItem) {
          setIsLoadingMore(false);
        }
        if (pageCount.page === -1) return;
        if (isLoadingMore) {
          loadMoreDocuments(pageCount.page);
        }
      },
      2000,
      { leading: true, trailing: false }
    ),
    [pageCount.page, ocrType, date, isLoadingMore, documents?.length, pageCount.totalItem, appliedFilters]
  );

  const onEndReached = () => {
    throttleLoadMore();
  };

  const refreshData = async (
    filters: DocumentFilterPayload = appliedFiltersRef.current,
    dateRange: { startDate: string; endDate: string } = dateRef.current
  ) => {
    setPageCount({ page: 1, count: PAGE_COUNT, totalItem: 0 });
    setIsLoading(true);
    setIsLoadingMore(false);
    setDocuments([]);
    CurrentChipDate.current = null;
    await getAllDocuments(1, filters, dateRange);
  };

  const changeDate = (startDate: string, endDate: string) => {
    const nextDate = { startDate, endDate };
    dateRef.current = nextDate;
    setDate(nextDate);
    // Reload immediately — don't wait for focus/effect (date picker calls this then goBack).
    refreshData(appliedFiltersRef.current, nextDate);
  };

  const onRefresh = () => {
    setIsRefreshing(true);
    refreshData();
    _.delay(() => {
      setIsRefreshing(false);
    }, 500);
  };

  useEffect(() => {
    return () => {
      quickSearchDebounceRef.current.cancel();
    };
  }, []);

  const onOpenSearchSheet = () => {
    // First tap while keyboard is open only dismisses it; second tap opens the sheet.
    if (Keyboard.isVisible()) {
      searchInputRef.current?.blur();
      Keyboard.dismiss();
      return;
    }
    setBottomSheetVisible(searchSheetRef, true);
  };

  const onEnterSearchMode = () => {
    setIsSearchMode(true);
  };

  const onOpenAdvancedFilterSheet = () => {
    setDraftFilters(appliedFilters);
    setBottomSheetVisible(filterSheetRef, true);
  };

  const onSelectSearchKey = (nextKey: SearchFilterKey) => {
    quickSearchDebounceRef.current.cancel();
    setBottomSheetVisible(searchSheetRef, false);
    setIsSearchMode(true);
    setSelectedSearchKey(nextKey);
    setSearchText('');
    const clearedFilters = { ...DEFAULT_DOCUMENT_FILTERS };
    setDraftFilters(clearedFilters);
    setAppliedFilters(clearedFilters);
  };

  const onSearchTextChange = (text: string) => {
    setSearchText(text);
    quickSearchDebounceRef.current.cancel();

    const normalized = normalizeFilterValue(text);
    if (!normalized) {
      const clearedFilters = { ...DEFAULT_DOCUMENT_FILTERS };
      setDraftFilters(clearedFilters);
      setAppliedFilters(clearedFilters);
      return;
    }

    quickSearchDebounceRef.current(selectedSearchKey, text);
  };

  const onExitSearchMode = () => {
    quickSearchDebounceRef.current.cancel();
    Keyboard.dismiss();
    setIsSearchMode(false);
    setSearchText('');
    const clearedFilters = { ...DEFAULT_DOCUMENT_FILTERS };
    setDraftFilters(clearedFilters);
    setAppliedFilters(clearedFilters);
  };

  const onClearSearchText = () => {
    if (searchText) {
      onSearchTextChange('');
      return;
    }
    onExitSearchMode();
  };

  const selectedSearchOption =
    QUICK_SEARCH_OPTIONS.find((option) => option.key === selectedSearchKey) ?? QUICK_SEARCH_OPTIONS[0];

  const onApplyFilters = () => {
    quickSearchDebounceRef.current.cancel();
    setSearchText('');
    setAppliedFilters(normalizeFilterPayload(draftFilters));
    setBottomSheetVisible(filterSheetRef, false);
  };

  const onClearFilters = () => {
    quickSearchDebounceRef.current.cancel();
    setSearchText('');
    const clearedFilters = { ...DEFAULT_DOCUMENT_FILTERS };
    setDraftFilters(clearedFilters);
    setAppliedFilters(clearedFilters);
    setBottomSheetVisible(filterSheetRef, false);
  };

  // On each visit from outside: clear search/filters and load a fresh list.
  // Returning from AppDatePicker preserves state; date change already refreshed via changeDate.
  useFocusEffect(
    useCallback(() => {
      quickSearchDebounceRef.current.cancel();

      if (preserveStateOnNextFocusRef.current) {
        preserveStateOnNextFocusRef.current = false;
        // changeDate already refreshed with the new range; avoid a stale second fetch.
        skipNextFilterRefreshRef.current = true;
        return () => {
          quickSearchDebounceRef.current.cancel();
        };
      }

      const clearedFilters = { ...DEFAULT_DOCUMENT_FILTERS };
      skipNextFilterRefreshRef.current = true;
      setIsSearchMode(false);
      setSearchText('');
      setSelectedSearchKey('status');
      setDraftFilters(clearedFilters);
      setAppliedFilters(clearedFilters);
      refreshData(clearedFilters, dateRef.current);

      return () => {
        quickSearchDebounceRef.current.cancel();
      };
    }, [ocrType])
  );

  // Refresh when filters change while staying on this screen.
  // Date changes refresh via changeDate (so date-picker → goBack stays correct).
  useEffect(() => {
    if (skipNextFilterRefreshRef.current) {
      skipNextFilterRefreshRef.current = false;
      return;
    }
    refreshData(appliedFilters, dateRef.current);
  }, [appliedFilters, ocrType]);

  const ListFooterComponent = () => (
    <View style={styles.loader}>
      <ActivityIndicator color={colors.PRIMARY_NORMAL} size="small" animating={isLoadingMore} />
    </View>
  );

  const ListEmptyComponent = useCallback(() => {
    if (isLoading) return null;
    return (
      <View style={styles.emptyContainer}>
        <Image
          source={require('@/assets/images/noTransactions.png')}
          style={styles.emptyImage}
        />
        <Text style={styles.emptyText}>{t('common.noTransactions')}</Text>
      </View>
    );
  }, [isLoading, t]);

  const onViewableItemsChanged = useCallback(({ viewableItems }: any) => {
    const documentDate = getDocumentDate(viewableItems[0]?.item);
    if (!documentDate) {
      return;
    }
    stickyDayRef?.current?.publicHandler(moment(documentDate, 'DD-MM-YYYY').format('DD MMM YYYY'));
  }, []);

  const showDate = (item: any, index: number) => {
    let showDate = false;

    const fullDateString = getDocumentDate(item);

    if (!fullDateString || typeof fullDateString !== 'string') {
      return false;
    }

    const dateOnly = fullDateString.split(' ')[0];

    console.log('dateOnly', dateOnly);
    console.log('CurrentChipDate.current', CurrentChipDate.current);

    if (CurrentChipDate.current !== dateOnly) {
      showDate = true;
      CurrentChipDate.current = dateOnly;
    }

    return index === 0 ? false : showDate;
  };


  const onPressDocument = useCallback(
    (item: any) => {
      const normalizeStatus = (value: any) =>
        String(value ?? '')
          .trim()
          .toUpperCase()
          .replace(/[\s-]+/g, '_');

      const status = normalizeStatus(item?.status);
      const convertedStatus = normalizeStatus(item?.convertedStatus);
      const canCreateVoucher = status === 'COMPLETED' && convertedStatus === 'IN_PROGRESS';

      if (!canCreateVoucher) {
        let message = t('scan2.actionNotReady', {
          defaultValue: 'This document is not ready to create a voucher yet.',
        });

        if (status === 'PENDING' || status === 'IN_PROGRESS') {
          message = t('scan2.actionStatusProcessing', {
            defaultValue: 'Document is still processing. Please wait until status is Completed.',
          });
        } else if (isFailedDocumentStatus(status)) {
          const reason = extractDocumentFailureReason(item);
          setFailurePopup({
            title: t('scan2.uploadFailedTitle', { defaultValue: 'Upload failed' }),
            message:
              reason ||
              t('scan2.uploadFailedReasonFallback', {
                defaultValue: 'Document processing failed. Please upload again or try another file.',
              }),
          });
          return;
        } else if (status === 'CANCELLED' || status === 'CANCEL') {
          message = t('scan2.actionStatusCancelled', {
            defaultValue: 'This document was cancelled and cannot be used.',
          });
        } else if (status !== 'COMPLETED') {
          message = t('scan2.actionStatusNotCompleted', {
            defaultValue: 'Document status must be Completed before creating a voucher.',
          });
        } else if (!convertedStatus) {
          message = t('scan2.actionConvertedMissing', {
            defaultValue: 'Document is completed. Waiting for conversion to start.',
          });
        } else if (convertedStatus === 'PENDING') {
          message = t('scan2.actionConvertedPending', {
            defaultValue: 'Conversion is pending. Please wait until converted status is In Progress.',
          });
        } else if (
          convertedStatus === 'CONVERTED' ||
          convertedStatus === 'COMPLETED' ||
          convertedStatus === 'SUCCESS'
        ) {
          message = t('scan2.actionAlreadyConverted', {
            defaultValue: 'This document is already converted into a voucher.',
          });
        } else if (isFailedDocumentStatus(convertedStatus)) {
          const reason = extractDocumentFailureReason(item);
          setFailurePopup({
            title: t('scan2.conversionFailedTitle', { defaultValue: 'Conversion failed' }),
            message:
              reason ||
              t('scan2.actionConvertedFailed', {
                defaultValue: 'Document conversion failed. Please try again with another file.',
              }),
          });
          return;
        } else if (convertedStatus !== 'IN_PROGRESS') {
          message = t('scan2.actionConvertedNotInProgress', {
            defaultValue: 'Converted status must be In Progress to create a voucher.',
          });
        }

        Toast({
          message,
          duration: 'LONG',
          position: 'BOTTOM',
        });
        return;
      }
      selectedDocumentRef.current = item;
      setBottomSheetVisible(documentActionSheetRef, true);
    },
    [t]
  );

  const onSelectDocumentAction = useCallback(
    (option: DocumentActionOption) => {
      const document = selectedDocumentRef.current;
      const requestId = document?.requestId ?? document?.requestID;
      if (!requestId) {
        Toast({
          message: t('scan2.requestIdMissing', {
            defaultValue: 'Unable to open this document. Request ID is missing. Please refresh and try again.',
          }),
          duration: 'LONG',
          position: 'BOTTOM',
        });
        setBottomSheetVisible(documentActionSheetRef, false);
        return;
      }

      setBottomSheetVisible(documentActionSheetRef, false);
      InteractionManager.runAfterInteractions(() => {
        const params = {
          isFromScan2: true,
          requestId,
          ocrType,
          scan2Source: scanType,
          voucherType: option.voucherType,
          // Forces voucher screens to reset when opened again from Scan2
          refetchDataOnNavigation: Math.floor(Math.random() * 1000).toString().padStart(3, '0'),
        };
        // Keep Scan2 list state; push onto this stack so back returns here (not Home).
        preserveStateOnNextFocusRef.current = true;
        const routeParams = option.screen ? { screen: option.screen, params } : params;
        navigation.dispatch(StackActions.push(option.navigateTo, routeParams));
      });
    },
    [navigation, ocrType, scanType, t]
  );

  const renderItem = ({ item, index }: { item: any; index: number }) => (
    <DocumentCard
      showDate={showDate(item, index)}
      fileName={item?.fileName ?? item?.name ?? item?.documentName ?? '-'}
      date={(moment(getDocumentDate(item), 'DD-MM-YYYY').format('DD MMM YYYY')) || '-'}
      status={item?.status ?? ''}
      uploadedBy={item?.user?.name ?? '-'}
      convertedStatus={item?.convertedStatus}
      onPress={() => onPressDocument(item)}
    />
  );

  const closePreview = () => {
    setIsPreviewVisible(false);
    setPreviewUri(null);
    setSelectedFile(null);
  };

  const onSelectPreview = async () => {
    if (!selectedFile?.uri || !selectedFile?.name) {
      Toast({
        message: t('common.somethingWentWrong'),
        duration: 'SHORT',
        position: 'BOTTOM',
      });
      return;
    }

    setIsPreviewVisible(false);
    setIsUploading(true);

    try {

      const signedUrlResponse = await CommonService.getDocumentSignedUrl(selectedFile.name);
      if (signedUrlResponse?.status && signedUrlResponse.status !== 'success') {
        throw new Error(signedUrlResponse?.message ?? t('scan2.uploadFailed'));
      }

      const signedBody = signedUrlResponse?.body ?? signedUrlResponse?.data ?? signedUrlResponse;
      const requestId = signedBody?.requestId ?? signedBody?.requestID;
      const signedUrl = signedBody?.signedUrl ?? signedBody?.url;
      const filePath = signedBody?.filePath ?? signedBody?.path;

      if (!requestId || !signedUrl || !filePath) {
        throw new Error(t('scan2.uploadFailed'));
      }

      const contentType = getMimeType(selectedFile.name, selectedFile.type);
      const localUri = await resolveLocalFileUri(selectedFile);
      await uploadFileToSignedUrl(signedUrl, localUri, contentType);

      const uploadResponse = await CommonService.uploadDocument(ocrType, {
        requestId,
        signedUrl,
        filePath,
      });

      if (uploadResponse?.status === 'success') {
        Toast({
          message: uploadResponse?.message ?? t('scan2.uploadSuccess'),
          duration: 'SHORT',
          position: 'BOTTOM',
        });
        setPreviewUri(null);
        setSelectedFile(null);
        await refreshData();
      } else {
        Toast({
          message: uploadResponse?.message ?? t('scan2.uploadFailed'),
          duration: 'SHORT',
          position: 'BOTTOM',
        });
      }
    } catch (error: any) {
      console.log('Error while uploading Scan2 document', error);
      Toast({
        message:
          error?.response?.data?.message ??
          error?.message ??
          t('scan2.uploadFailed'),
        duration: 'SHORT',
        position: 'BOTTOM',
      });
    } finally {
      setIsUploading(false);
    }
  };

  const cancelPendingUploadAction = () => {
    uploadActionTokenRef.current += 1;
    pendingUploadSourceRef.current = null;
    if (pendingUploadTimeoutRef.current) {
      clearTimeout(pendingUploadTimeoutRef.current);
      pendingUploadTimeoutRef.current = null;
    }
  };

  const openPreviewWithFile = async (file: SelectedFile) => {
    let uri = file.uri;
    if (isPdfSource(file.uri, file.type, file.name)) {
      uri = await resolveLocalFileUri(file);
    }
    setPreviewUri(uri);
    setSelectedFile(file);
    setIsPreviewVisible(true);
  };

  const handleImagePickerAsset = (asset?: {
    uri?: string;
    fileName?: string;
    type?: string;
  }) => {
    if (!asset?.uri) {
      return;
    }
    const name = asset.fileName ?? `document_${Date.now()}.jpg`;
    openPreviewWithFile({
      uri: asset.uri,
      name,
      type: getMimeType(name, asset.type),
    });
  };



  const isAndroid13OrHigher =
    Platform.OS === 'android' && typeof Platform.Version === 'number' && Platform.Version >= 33;

  const getCameraPermission = (): Permission | undefined =>
    Platform.select({
      ios: PERMISSIONS.IOS.CAMERA,
      android: PERMISSIONS.ANDROID.CAMERA,
    });

  const getGalleryPermission = (): Permission | undefined => {
    if (Platform.OS === 'ios') {
      return PERMISSIONS.IOS.PHOTO_LIBRARY;
    }
    // Android 13+ uses Photo Picker — no READ_MEDIA_IMAGES runtime permission
    if (isAndroid13OrHigher) {
      return undefined;
    }
    return PERMISSIONS.ANDROID.READ_EXTERNAL_STORAGE;
  };

  const getFilesPermission = (): Permission | undefined => {
    // iOS document picker and Android 13+ SAF need no runtime storage permission
    if (Platform.OS === 'ios' || isAndroid13OrHigher) {
      return undefined;
    }
    return PERMISSIONS.ANDROID.READ_EXTERNAL_STORAGE;
  };

  const showSettingsAlert = (kind: PermissionKind) => {
    const titleKey = {
      camera: 'scan2.cameraPermissionTitle',
      gallery: 'scan2.galleryPermissionTitle',
      files: 'scan2.filesPermissionTitle',
    }[kind];
    const messageKey = {
      camera: 'scan2.cameraPermissionBlocked',
      gallery: 'scan2.galleryPermissionBlocked',
      files: 'scan2.filesPermissionBlocked',
    }[kind];

    Alert.alert(t(titleKey), t(messageKey), [
      { text: t('common.cancel'), style: 'cancel' },
      {
        text: t('common.openSettings'),
        onPress: () => openSettings().catch(() => console.warn('Cannot open settings')),
      },
    ]);
  };

  const requestAppPermission = async (
    permission: Permission | undefined,
    denialKey: string,
    kind: PermissionKind,
    required: boolean
  ): Promise<boolean> => {
    if (!permission) {
      return !required;
    }

    try {
      let status: PermissionStatus = await check(permission);

      if (status === RESULTS.GRANTED || status === RESULTS.LIMITED) {
        await AsyncStorage.removeItem(denialKey);
        return true;
      }

      if (status === RESULTS.BLOCKED) {
        showSettingsAlert(kind);
        return false;
      }

      if (status === RESULTS.DENIED) {
        const alreadyDeniedOnce = await AsyncStorage.getItem(denialKey);

        if (Platform.OS === 'android' && alreadyDeniedOnce) {
          showSettingsAlert(kind);
          return false;
        }

        status = await request(permission);

        if (status === RESULTS.GRANTED || status === RESULTS.LIMITED) {
          await AsyncStorage.removeItem(denialKey);
          return true;
        }

        if (status === RESULTS.BLOCKED) {
          showSettingsAlert(kind);
          return false;
        }

        if (status === RESULTS.DENIED) {
          await AsyncStorage.setItem(denialKey, '1');
        }
      }

      return false;
    } catch (error) {
      console.error(`Error requesting ${kind} permission:`, error);
      return false;
    }
  };

  const requestCameraPermission = () =>
    requestAppPermission(getCameraPermission(), CAMERA_DENIAL_KEY, 'camera', true);

  const requestGalleryPermission = () =>
    requestAppPermission(getGalleryPermission(), GALLERY_DENIAL_KEY, 'gallery', false);

  const requestFilesPermission = () =>
    requestAppPermission(getFilesPermission(), FILES_DENIAL_KEY, 'files', false);

  const showLimitedGalleryAlert = () => {
    Alert.alert(t('scan2.galleryLimitedTitle'), t('scan2.galleryLimitedMessage'), [
      { text: t('common.cancel'), style: 'cancel' },
      {
        text: t('scan2.galleryChoosePhotos'),
        onPress: () => {
          openPhotoPicker().catch(() => console.warn('Cannot open photo library picker'));
        },
      },
    ]);
  };

  const handleIOSGalleryAccessIssue = async () => {
    try {
      const status = await check(PERMISSIONS.IOS.PHOTO_LIBRARY);
      if (status === RESULTS.LIMITED) {
        showLimitedGalleryAlert();
        return;
      }
      if (status === RESULTS.BLOCKED) {
        showSettingsAlert('gallery');
      }
    } catch (error) {
      console.warn('Error checking iOS photo library status', error);
    }
  };

  const pickFromGalleryIOS = async () => {
    try {
      const result = await launchImageLibrary({
        mediaType: 'photo',
        quality: 0.8,
        selectionLimit: 1,
        presentationStyle: 'fullScreen',
      });

      if (result.didCancel) {
        return;
      }

      if (result.assets?.[0]?.uri) {
        handleImagePickerAsset(result.assets[0]);
        return;
      }

      if (result.errorCode) {
        if (result.errorCode === 'others' && result.errorMessage?.includes('permission')) {
          await handleIOSGalleryAccessIssue();
          return;
        }

        Toast({
          message: result.errorMessage ?? t('common.somethingWentWrong'),
          duration: 'SHORT',
          position: 'BOTTOM',
        });
        return;
      }
    } catch (err) {
      console.error('Error opening gallery:', err);
    }
  };

  const pickFromGalleryAndroid = async () => {
    const hasPermission = await requestGalleryPermission();
    if (!hasPermission) {
      return;
    }

    await new Promise((resolve) => setTimeout(() => resolve(true), 300));

    try {
      const result = await launchImageLibrary({
        mediaType: 'photo',
        quality: 0.8,
        selectionLimit: 1,
        presentationStyle: 'fullScreen',
      });

      if (result.didCancel) {
        return;
      }

      if (result.errorCode === 'others' && result.errorMessage?.includes('permission')) {
        showSettingsAlert('gallery');
        return;
      }

      if (result.errorCode) {
        Toast({
          message: result.errorMessage ?? t('common.somethingWentWrong'),
          duration: 'SHORT',
          position: 'BOTTOM',
        });
        return;
      }

      handleImagePickerAsset(result.assets?.[0]);
    } catch (err) {
      console.error('Error opening gallery:', err);
    }
  };

  const pickFromGallery = async () => {
    if (Platform.OS === 'ios') {
      return pickFromGalleryIOS();
    }
    return pickFromGalleryAndroid();
  };

  const pickFromCamera = async () => {
    const hasPermission = await requestCameraPermission();
    if (!hasPermission) {
      return;
    }

    // Small delay so the OS permission UI can fully dismiss before launching camera
    await new Promise((resolve) => setTimeout(() => resolve(true), 300));

    try {
      const result = await launchCamera({
        mediaType: 'photo',
        quality: 0.8,
        saveToPhotos: false,
        presentationStyle: 'fullScreen',
        includeBase64: false,
      });

      if (result.didCancel) return;

      if (result.errorCode === 'camera_unavailable') {
        Toast({
          message: t('scan2.cameraUnavailable'),
          duration: 'SHORT',
          position: 'BOTTOM',
        });
        return;
      }

      if (result.errorCode === 'others' && result.errorMessage?.includes('permission')) {
        showSettingsAlert('camera');
        return;
      }

      if (result.errorCode) {
        Toast({
          message: result.errorMessage ?? t('common.somethingWentWrong'),
          duration: 'SHORT',
          position: 'BOTTOM',
        });
        return;
      }

      if (result.assets?.[0]) {
        handleImagePickerAsset(result.assets[0]);
      }
    } catch (err) {
      console.error('Error opening camera:', err);
    }
  };

  const pickFromFiles = async () => {
    const hasPermission = await requestFilesPermission();
    if (!hasPermission) {
      return;
    }

    await new Promise((resolve) => setTimeout(() => resolve(true), 300));

    try {
      const result = await pick({
        type: [types.images, types.pdf, types.zip],
        allowMultiSelection: false,
      });
      if (result.length > 0) {
        const file = result[0];
        const name = file.name ?? `document_${Date.now()}.png`;
        openPreviewWithFile({
          uri: file.uri,
          name,
          type: getMimeType(name, file.type),
        });
      }
    } catch (error) {
      if (isErrorWithCode(error) && error.code === errorCodes.OPERATION_CANCELED) {
        return;
      }
      const message =
        isErrorWithCode(error) && error.message
          ? error.message
          : t('common.somethingWentWrong');
      if (typeof message === 'string' && message.toLowerCase().includes('permission')) {
        showSettingsAlert('files');
        return;
      }
      console.log('Error while picking document', error);
      Toast({
        message,
        duration: 'SHORT',
        position: 'BOTTOM',
      });
    }
  };

  const runUploadSourceAction = async (source: UploadSource, token: number) => {
    if (token !== uploadActionTokenRef.current) {
      return;
    }
    try {
      if (source === 'camera') {
        await pickFromCamera();
      } else if (source === 'gallery') {
        await pickFromGallery();
      } else {
        await pickFromFiles();
      }
    } catch (error: any) {
      if (token !== uploadActionTokenRef.current) {
        return;
      }
      console.log('Error while selecting upload source', error);
      Toast({
        message: error?.message ?? t('common.somethingWentWrong'),
        duration: 'SHORT',
        position: 'BOTTOM',
      });
    }
  };

  const onSelectUploadSource = (source: UploadSource) => {
    if (pendingUploadTimeoutRef.current) {
      clearTimeout(pendingUploadTimeoutRef.current);
      pendingUploadTimeoutRef.current = null;
    }
    uploadActionTokenRef.current += 1;
    const token = uploadActionTokenRef.current;
    pendingUploadSourceRef.current = source;
    setBottomSheetVisible(uploadSourceSheetRef, false);

    // Schedule from select — Modalize onClosed can miss the first close cycle
    InteractionManager.runAfterInteractions(() => {
      pendingUploadTimeoutRef.current = setTimeout(() => {
        pendingUploadTimeoutRef.current = null;
        if (pendingUploadSourceRef.current !== source) {
          return;
        }
        pendingUploadSourceRef.current = null;
        runUploadSourceAction(source, token);
      }, Platform.OS === 'ios' ? 400 : 150);
    });
  };

  const openUploadSheet = () => {
    cancelPendingUploadAction();
    setBottomSheetVisible(uploadSourceSheetRef, true);
  };

  return (
    <View style={styles.container}>
      <Modal
        visible={isPreviewVisible}
        transparent
        animationType="fade"
        onRequestClose={closePreview}
      >
        <View style={styles.previewBackdrop}>
          <View style={styles.previewCard}>
            <Text style={styles.previewTitle}>{t('scan2.previewTitle')}</Text>
            <View style={styles.previewImageWrapper}>
              <DocumentPreviewViewer
                uri={previewUri}
                mimeType={selectedFile?.type}
                fileName={selectedFile?.name}
                style={styles.previewViewer}
              />
            </View>
            <Text style={styles.previewMessage}>{t('scan2.confirmUpload')}</Text>
            <View style={styles.previewActions}>
              <TouchableOpacity
                activeOpacity={0.8}
                style={[styles.previewButton, styles.cancelButton]}
                onPress={closePreview}
              >
                <Text style={styles.cancelButtonText}>{t('common.cancel', { defaultValue: 'Cancel' })}</Text>
              </TouchableOpacity>
              <TouchableOpacity
                activeOpacity={0.8}
                style={[styles.previewButton, styles.uploadButton]}
                onPress={onSelectPreview}
              >
                <Text style={styles.uploadButtonText}>{t('scan2.upload')}</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      <Modal
        visible={!!failurePopup}
        transparent
        animationType="fade"
        onRequestClose={() => setFailurePopup(null)}
      >
        <View style={styles.previewBackdrop}>
          <View style={styles.failureCard}>
            <Text style={styles.failureTitle}>{failurePopup?.title}</Text>
            <Text style={styles.failureMessage}>{failurePopup?.message}</Text>
            <TouchableOpacity
              activeOpacity={0.8}
              style={styles.failureOkButton}
              onPress={() => setFailurePopup(null)}
            >
              <Text style={styles.failureOkButtonText}>
                {t('common.ok', { defaultValue: 'OK' })}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {isSearchMode ? (
        <Header backgroundColor={voucherBackground} statusBarColor={statusBar}>
          <View style={styles.searchHeaderRow}>
            <TouchableOpacity
              activeOpacity={0.7}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              style={styles.searchBackButton}
              onPress={onExitSearchMode}
            >
              <Icon name="Backward-arrow" color="#FFFFFF" size={18} />
            </TouchableOpacity>

            <TouchableOpacity
              activeOpacity={0.7}
              style={styles.searchFieldChip}
              onPress={onOpenSearchSheet}
            >
              <Text style={styles.searchFieldChipText} numberOfLines={1}>
                {t(selectedSearchOption.chipLabelKey, {
                  defaultValue: selectedSearchOption.chipDefaultValue,
                })}
              </Text>
              <AntDesign name="down" size={10} color="#FFFFFF" style={styles.searchFieldChipArrow} />
            </TouchableOpacity>

            <TextInput
              ref={searchInputRef}
              value={searchText}
              onChangeText={onSearchTextChange}
              placeholder={t(SEARCH_PLACEHOLDERS[selectedSearchKey].key, {
                defaultValue: SEARCH_PLACEHOLDERS[selectedSearchKey].defaultValue,
              })}
              placeholderTextColor="rgba(255,255,255,0.7)"
              style={styles.searchHeaderInput}
              autoFocus
              autoCorrect={false}
              autoCapitalize="none"
              returnKeyType="search"
              blurOnSubmit
            />

            <TouchableOpacity
              activeOpacity={0.7}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              style={styles.searchCloseButton}
              onPress={onClearSearchText}
            >
              <AntDesign name="close" size={20} color="#FFFFFF" />
            </TouchableOpacity>
          </View>
        </Header>
      ) : (
        <Header
          header={title}
          isBackButtonVisible={true}
          backgroundColor={voucherBackground}
          statusBarColor={statusBar}
          onBackButtonPress={() => navigation.navigate('Home')}
          headerRightContent={
            <TouchableOpacity
              activeOpacity={0.7}
              hitSlop={{ top: 10, bottom: 10 }}
              style={styles.searchButton}
              onPress={onEnterSearchMode}
            >
              <AntDesign name="search1" size={20} color="#FFFFFF" />
            </TouchableOpacity>
          }
        />
      )}
      <View style={styles.container}>
        {!isSearchMode && (
          <DateFilter
            startDate={date.startDate}
            endDate={date.endDate}
            dateMode={dateMode}
            activeDateFilter={activeDateFilter}
            disabled={isLoading}
            changeDate={changeDate}
            setActiveDateFilter={_setActiveDateFilter}
            onPressAdvancedFilter={onOpenAdvancedFilterSheet}
            showAdvancedFilterIndicator={showAdvancedFilterIndicator}
            onBeforeOpenDatePicker={() => {
              preserveStateOnNextFocusRef.current = true;
            }}
          />
        )}
        <View style={styles.container}>
          {documents?.length > 0 && <StickyDay stickyDayRef={stickyDayRef} />}
          <FlatList
            data={documents}
            contentContainerStyle={styles.contentContainerStyle}
            renderItem={renderItem}
            onViewableItemsChanged={onViewableItemsChanged}
            onEndReached={onEndReached}
            keyExtractor={(item, index) =>
              item?.uniqueName ?? item?.requestId ?? item?.fileName ?? String(index)
            }
            keyboardShouldPersistTaps="never"
            keyboardDismissMode="on-drag"
            refreshControl={
              <RefreshControl
                progressBackgroundColor={colors.BACKGROUND}
                colors={[colors.PRIMARY_NORMAL]}
                refreshing={isRefreshing}
                progressViewOffset={15}
                onRefresh={onRefresh}
              />
            }
            ListFooterComponent={<ListFooterComponent />}
            ListEmptyComponent={<ListEmptyComponent />}

          />

          {!isSearchMode && (
            <TouchableOpacity
              onPress={openUploadSheet}
              activeOpacity={0.7}
              style={styles.fab}
            >
              <MaterialDesignIcons name="cloud-upload-outline" size={32} color="#265BB5" />
            </TouchableOpacity>
          )}
        </View>
        <UploadSourceSheet
          bottomSheetRef={uploadSourceSheetRef}
          onSelect={onSelectUploadSource}
        />
        <DocumentActionSheet
          bottomSheetRef={documentActionSheetRef}
          options={documentActions}
          onSelect={onSelectDocumentAction}
        />
        <SearchFilterSheet
          bottomSheetRef={searchSheetRef}
          selectedKey={selectedSearchKey}
          options={QUICK_SEARCH_OPTIONS.map((option) => ({
            key: option.key,
            label: t(option.labelKey, { defaultValue: option.defaultValue }),
          }))}
          onSelectKey={onSelectSearchKey}
        />
        <DocumentFilterSheet
          ref={filterSheetRef}
          filters={draftFilters}
          onChange={setDraftFilters}
          onApply={onApplyFilters}
          onClear={onClearFilters}
          statusOptions={STATUS_OPTIONS}
        />
        <Loader isLoading={isLoading || isUploading} />
      </View>
    </View>
  );
};

export default Scan2Screen;

const getStyles = (theme: ThemeProps) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.colors.background,
    },
    contentContainerStyle: {
      flexGrow: 1,
      paddingTop: 30,
      paddingBottom: 60,
    },
    loader: {
      justifyContent: 'center',
      alignItems: 'center',
    },
    emptyContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
    },
    emptyImage: {
      resizeMode: 'contain',
      height: 250,
      width: 300,
    },
    emptyText: {
      fontFamily: 'AvenirLTStd-Black',
      fontSize: 25,
      marginTop: 10,
    },
    searchButton: {
      padding: 8,
    },
    searchHeaderRow: {
      flex: 1,
      flexDirection: 'row',
      alignItems: 'center',
    },
    searchBackButton: {
      paddingRight: 12,
    },
    searchFieldChip: {
      flexDirection: 'row',
      alignItems: 'center',
      flexShrink: 0,
      marginRight: 8,
      paddingHorizontal: 10,
      paddingVertical: 6,
      borderRadius: 16,
      backgroundColor: 'rgba(255,255,255,0.18)',
    },
    searchFieldChipText: {
      marginRight: 4,
      fontFamily: FONT_FAMILY.semibold,
      fontSize: 12,
      color: '#FFFFFF',
    },
    searchFieldChipArrow: {
      marginTop: 1,
    },
    searchHeaderInput: {
      flex: 1,
      height: 40,
      paddingHorizontal: 4,
      marginRight: 8,
      color: '#FFFFFF',
      fontFamily: FONT_FAMILY.regular,
      fontSize: 16,
      paddingVertical: 0,
    },
    searchCloseButton: {
      padding: 4,
    },
    fab: {
      position: 'absolute',
      bottom: 20,
      alignSelf: 'center',
      backgroundColor: theme.colors.solids.white,
      padding: 16,
      borderRadius: 35,
      elevation: 4,
      shadowColor: '#000000',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.2,
      shadowRadius: 4,
    },
    previewBackdrop: {
      flex: 1,
      backgroundColor: 'rgba(15, 23, 42, 0.45)',
      justifyContent: 'center',
      alignItems: 'center',
      paddingHorizontal: 20,
    },
    previewCard: {
      width: '100%',
      maxHeight: '88%',
      backgroundColor: theme.colors.solids.white,
      borderRadius: 16,
      paddingHorizontal: 20,
      paddingTop: 22,
      paddingBottom: 18,
      shadowColor: '#000000',
      shadowOffset: { width: 0, height: 8 },
      shadowOpacity: 0.16,
      shadowRadius: 16,
      elevation: 8,
    },
    previewTitle: {
      fontFamily: theme.typography.fontFamily.bold,
      fontSize: 18,
      color: theme.colors.text,
      textAlign: 'center',
      marginBottom: 16,
    },
    previewImageWrapper: {
      width: '100%',
      height: 340,
      borderWidth: 1,
      borderColor: theme.colors.solids.grey.light,
      borderRadius: 12,
      backgroundColor: '#FAFBFF',
      overflow: 'hidden',
    },
    previewViewer: {
      flex: 1,
    },
    previewMessage: {
      marginTop: 18,
      marginBottom: 20,
      textAlign: 'center',
      fontFamily: theme.typography.fontFamily.regular,
      fontSize: 15,
      lineHeight: 22,
      color: '#4B5563',
      paddingHorizontal: 8,
    },
    previewActions: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      gap: 12,
    },
    previewButton: {
      flex: 1,
      height: 48,
      borderRadius: 10,
      justifyContent: 'center',
      alignItems: 'center',
    },
    cancelButton: {
      backgroundColor: theme.colors.solids.white,
      borderWidth: 1,
      borderColor: '#D1D5DB',
    },
    uploadButton: {
      backgroundColor: colors.PRIMARY_NORMAL,
    },
    cancelButtonText: {
      fontFamily: theme.typography.fontFamily.semiBold,
      fontSize: 15,
      color: '#374151',
    },
    uploadButtonText: {
      fontFamily: theme.typography.fontFamily.semiBold,
      fontSize: 15,
      color: theme.colors.solids.white,
    },
    failureCard: {
      width: '100%',
      backgroundColor: theme.colors.solids.white,
      borderRadius: 16,
      paddingHorizontal: 20,
      paddingTop: 22,
      paddingBottom: 18,
    },
    failureTitle: {
      fontFamily: theme.typography.fontFamily.bold,
      fontSize: 18,
      color: '#C5221F',
      textAlign: 'center',
      marginBottom: 12,
    },
    failureMessage: {
      fontFamily: theme.typography.fontFamily.regular,
      fontSize: 15,
      lineHeight: 22,
      color: '#4B5563',
      textAlign: 'center',
      marginBottom: 20,
    },
    failureOkButton: {
      height: 48,
      borderRadius: 10,
      backgroundColor: colors.PRIMARY_NORMAL,
      justifyContent: 'center',
      alignItems: 'center',
    },
    failureOkButtonText: {
      fontFamily: theme.typography.fontFamily.semiBold,
      fontSize: 15,
      color: theme.colors.solids.white,
    },
  });