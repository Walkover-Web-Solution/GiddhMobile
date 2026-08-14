import React from 'react';
import { StyleSheet, View } from 'react-native';
import SkeletonBone from '@/components/Skeleton/SkeletonBone';
import { baseColor } from '@/utils/colors';

type Props = {
  /** Number of placeholder account rows to render */
  rowCount?: number;
};

/** Widths cycle so the list does not look like identical stacked bars */
const NAME_WIDTHS: Array<`${number}%`> = ['42%', '26%', '20%', '34%', '30%', '24%'];
const AMOUNT_WIDTHS: Array<`${number}%`> = ['38%', '28%', '10%', '32%', '18%', '10%'];

const AccountRowSkeleton: React.FC<{ nameWidth: `${number}%`; amountWidth: `${number}%` }> = ({
  nameWidth,
  amountWidth,
}) => (
  <View style={styles.rowFront}>
    <View style={styles.row}>
      <SkeletonBone width={nameWidth} height={16} />
      <View style={styles.amountWrap}>
        <SkeletonBone width={amountWidth} height={16} />
      </View>
      <View style={styles.separator} />
    </View>
  </View>
);

/**
 * Skeleton matching the Accounts list row: account name on top,
 * right-aligned closing balance below, divider between rows.
 */
const AccountsListSkeleton: React.FC<Props> = ({ rowCount = 8 }) => (
  <View style={styles.container} pointerEvents="none">
    {Array.from({ length: rowCount }).map((_, index) => (
      <AccountRowSkeleton
        key={`account-skeleton-${index}`}
        nameWidth={NAME_WIDTHS[index % NAME_WIDTHS.length]}
        amountWidth={AMOUNT_WIDTHS[index % AMOUNT_WIDTHS.length]}
      />
    ))}
  </View>
);

export default AccountsListSkeleton;

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  rowFront: {
    width: '100%',
    paddingHorizontal: 10,
  },
  row: {
    paddingTop: 15,
  },
  amountWrap: {
    alignItems: 'flex-end',
    marginTop: 12,
  },
  separator: {
    marginTop: 12,
    borderBottomColor: baseColor.BORDER_COLOR,
    borderBottomWidth: 1,
  },
});
