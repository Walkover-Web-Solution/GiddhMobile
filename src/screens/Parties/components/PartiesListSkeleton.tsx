import React from 'react';
import { StyleSheet, View } from 'react-native';
import SkeletonBone from '@/components/Skeleton/SkeletonBone';

type Props = {
  /** Number of placeholder party rows to render */
  rowCount?: number;
};

/** Widths cycle so the list does not look like identical stacked bars */
const NAME_WIDTHS: Array<`${number}%`> = ['30%', '55%', '22%', '48%', '38%', '28%', '44%'];
const AMOUNT_WIDTHS: Array<`${number}%`> = ['80%', '95%', '85%', '65%', '75%', '70%', '90%'];

const PartyRowSkeleton: React.FC<{ nameWidth: `${number}%`; amountWidth: `${number}%` }> = ({
  nameWidth,
  amountWidth,
}) => (
  <View style={styles.rowFront}>
    <View style={styles.viewWrap}>
      <View style={styles.nameWrap}>
        <SkeletonBone width={nameWidth} height={16} />
      </View>
      <View style={styles.amountWrap}>
        <SkeletonBone width={amountWidth} height={16} />
      </View>
    </View>
  </View>
);

/**
 * Skeleton matching the Parties customer/vendor row:
 * party name on the left, right-aligned closing balance on the same line.
 */
const PartiesListSkeleton: React.FC<Props> = ({ rowCount = 9 }) => (
  <View style={styles.container} pointerEvents="none">
    {Array.from({ length: rowCount }).map((_, index) => (
      <PartyRowSkeleton
        key={`party-skeleton-${index}`}
        nameWidth={NAME_WIDTHS[index % NAME_WIDTHS.length]}
        amountWidth={AMOUNT_WIDTHS[index % AMOUNT_WIDTHS.length]}
      />
    ))}
  </View>
);

export default PartiesListSkeleton;

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  rowFront: {
    backgroundColor: '#F5F5F5',
    marginTop: 2,
    width: '100%',
    paddingTop: 15,
    paddingBottom: 15,
    paddingHorizontal: 10,
  },
  viewWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  nameWrap: {
    flex: 1,
  },
  amountWrap: {
    width: '35%',
    alignItems: 'flex-end',
  },
});
