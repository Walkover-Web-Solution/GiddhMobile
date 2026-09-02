import React, { memo, useEffect, useMemo, useState } from 'react';
import {
  Image,
  StyleProp,
  StyleSheet,
  Text,
  View,
  ViewStyle,
} from 'react-native';
import Pdf from 'react-native-pdf';
import LoaderKit from 'react-native-loader-kit';
import { useTranslation } from 'react-i18next';
import colors from '@/utils/colors';
import {
  isPdfSource,
  isZipSource,
  normalizePreviewUri,
} from '@/screens/Scan2/documentPreview.utils';

type Props = {
  uri?: string | null;
  mimeType?: string | null;
  fileName?: string | null;
  style?: StyleProp<ViewStyle>;
  resolveUri?: (uri: string) => Promise<string>;
};

const DocumentPreviewViewer: React.FC<Props> = ({
  uri,
  mimeType,
  fileName,
  style,
  resolveUri,
}) => {
  const { t } = useTranslation();
  const [resolvedUri, setResolvedUri] = useState<string | null>(null);
  const [isResolving, setIsResolving] = useState(false);
  const [hasError, setHasError] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);

  const normalizedUri = useMemo(
    () => normalizePreviewUri(uri, mimeType, fileName),
    [uri, mimeType, fileName]
  );

  const isPdf = useMemo(
    () => isPdfSource(normalizedUri ?? uri, mimeType, fileName),
    [normalizedUri, uri, mimeType, fileName]
  );

  const isZip = useMemo(
    () => isZipSource(mimeType, fileName),
    [mimeType, fileName]
  );

  useEffect(() => {
    let cancelled = false;

    const prepareUri = async () => {
      setHasError(false);
      setCurrentPage(1);
      setTotalPages(0);

      if (!normalizedUri) {
        setResolvedUri(null);
        setIsResolving(false);
        return;
      }

      if (!isPdf || !resolveUri) {
        setResolvedUri(normalizedUri);
        setIsResolving(false);
        return;
      }

      setIsResolving(true);
      try {
        const nextUri = await resolveUri(normalizedUri);
        if (!cancelled) {
          setResolvedUri(nextUri);
        }
      } catch {
        if (!cancelled) {
          setResolvedUri(normalizedUri);
        }
      } finally {
        if (!cancelled) {
          setIsResolving(false);
        }
      }
    };

    prepareUri();

    return () => {
      cancelled = true;
    };
  }, [normalizedUri, isPdf, resolveUri]);

  const displayUri = resolvedUri ?? normalizedUri;

  if (isZip) {
    return (
      <View style={[styles.container, style]}>
        <Text style={styles.emptyText}>
          {t('scan2.zipPreview', { defaultValue: 'ZIP file selected. Preview is not available.' })}
        </Text>
      </View>
    );
  }

  if (!displayUri) {
    return (
      <View style={[styles.container, style]}>
        <Text style={styles.emptyText}>
          {t('scan2.previewUnavailable', { defaultValue: 'Preview not available' })}
        </Text>
      </View>
    );
  }

  if (hasError) {
    return (
      <View style={[styles.container, style]}>
        <Text style={styles.emptyText}>
          {t('scan2.pdfLoadError', { defaultValue: 'Unable to load PDF preview' })}
        </Text>
      </View>
    );
  }

  if (isResolving) {
    return (
      <View style={[styles.container, style]}>
        <LoaderKit
          style={styles.loader}
          name="LineScale"
          color={colors.PRIMARY_NORMAL}
        />
      </View>
    );
  }

  if (isPdf) {
    return (
      <View style={[styles.container, style]}>
        <Pdf
          source={{ uri: displayUri, cache: true }}
          style={styles.media}
          fitPolicy={0}
          horizontal={false}
          spacing={8}
          enableDoubleTapZoom
          trustAllCerts={false}
          onLoadComplete={(numberOfPages) => {
            setTotalPages(numberOfPages);
            setCurrentPage(1);
            setHasError(false);
          }}
          onPageChanged={(page, numberOfPages) => {
            setCurrentPage(page);
            setTotalPages(numberOfPages);
          }}
          onError={() => setHasError(true)}
          renderActivityIndicator={() => (
            <LoaderKit
              style={styles.loader}
              name="LineScale"
              color={colors.PRIMARY_NORMAL}
            />
          )}
        />
        {totalPages > 1 && (
          <View style={styles.pageBadge}>
            <Text style={styles.pageBadgeText}>
              {t('scan2.pageIndicator', {
                defaultValue: 'Page {{current}} of {{total}}',
                current: currentPage,
                total: totalPages,
              })}
            </Text>
          </View>
        )}
      </View>
    );
  }

  return (
    <View style={[styles.container, style]}>
      <Image source={{ uri: displayUri }} style={styles.media} resizeMode="contain" />
    </View>
  );
};

export default memo(DocumentPreviewViewer);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    width: '100%',
    backgroundColor: '#F3F4F6',
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'center',
  },
  media: {
    flex: 1,
    width: '100%',
  },
  loader: {
    width: 45,
    height: 45,
  },
  emptyText: {
    color: '#6B7280',
    fontSize: 14,
    textAlign: 'center',
    paddingHorizontal: 16,
  },
  pageBadge: {
    position: 'absolute',
    bottom: 12,
    alignSelf: 'center',
    backgroundColor: 'rgba(28, 28, 28, 0.72)',
    borderRadius: 14,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  pageBadgeText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
  },
});
