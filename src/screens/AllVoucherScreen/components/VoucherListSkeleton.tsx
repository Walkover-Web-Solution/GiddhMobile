import React from 'react';
import { StyleSheet, View } from 'react-native';
import SkeletonBone from '@/components/Skeleton/SkeletonBone';

type Props = {
  /** Number of fake voucher rows to show */
  rowCount?: number;
};

const VoucherRowSkeleton = () => (
  <View style={styles.rowCard}>
    <View style={styles.row}>
      <SkeletonBone width="55%" height={18} borderRadius={4} />
      <SkeletonBone width="28%" height={18} borderRadius={4} />
    </View>
    <View style={[styles.row, styles.midRow]}>
      <SkeletonBone width="32%" height={13} borderRadius={4} />
      <SkeletonBone width="40%" height={13} borderRadius={4} />
    </View>
    <SkeletonBone width={64} height={20} borderRadius={5} />
  </View>
);

const DateChipSkeleton = () => (
  <View style={styles.dateChipRow}>
    <View style={styles.dateLine} />
    <SkeletonBone width="28%" height={24} borderRadius={15} />
    <View style={styles.dateLine} />
  </View>
);

/**
 * Skeleton matching AllVoucherScreen list:
 * date chip separator + voucher rows (name/amount, number/due, status chip).
 */
const VoucherListSkeleton: React.FC<Props> = ({ rowCount = 6 }) => {
  // Group rows like the real list: date chip, then a few vouchers, repeat.
  const groups = [
    { rows: Math.min(3, rowCount) },
    { rows: Math.max(0, Math.min(3, rowCount - 3)) },
  ].filter((g) => g.rows > 0);

  return (
    <View style={styles.container} pointerEvents="none">
      {groups.map((group, groupIndex) => (
        <View key={`group-${groupIndex}`}>
          <DateChipSkeleton />
          {Array.from({ length: group.rows }).map((_, rowIndex) => (
            <View key={`row-${groupIndex}-${rowIndex}`}>
              {rowIndex > 0 ? <View style={styles.divider} /> : null}
              <VoucherRowSkeleton />
            </View>
          ))}
        </View>
      ))}
    </View>
  );
};

export default VoucherListSkeleton;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 30,
    paddingBottom: 60,
  },
  dateChipRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 4,
  },
  dateLine: {
    flex: 1,
    borderBottomWidth: 1,
    borderBottomColor: '#EDEDED',
  },
  rowCard: {
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  midRow: {
    paddingVertical: 8,
  },
  divider: {
    borderTopWidth: 1,
    borderTopColor: '#EDEDED',
  },
});
