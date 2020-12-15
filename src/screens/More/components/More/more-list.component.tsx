import React from 'react';
import {WithTranslation, withTranslation, WithTranslationProps} from 'react-i18next';
import {FlatList, SafeAreaView, Text, View} from 'react-native';
import styles from '@/screens/More/components/More/listStyle';
import {GdSVGIcons} from '@/utils/icons-pack';
import {AutocompleteItem} from '@ui-kitten/components';

type MoreListProp = WithTranslation & WithTranslationProps & {};

type MoreListState = {};

class MoreList extends React.Component<MoreListProp, MoreListState> {
  listData = [
    {
      id: 1,
      item_name: 'Giddh Books Premium',
      icon: <GdSVGIcons.premium color={'#F8B100'} style={styles.iconStyle} width={22} height={22} />,
    },
    {
      id: 2,
      item_name: 'Import/Export Data(Backup)',
      icon: <GdSVGIcons.download style={styles.iconStyle} width={22} height={22} />,
    },
    {
      id: 3,
      item_name: 'Link Bank Account',
      icon: <GdSVGIcons.back style={styles.iconStyle} width={22} height={22} />,
    },
    {
      id: 4,
      item_name: 'ChangeLog(Recent Updates)',
      icon: <GdSVGIcons.currency style={styles.iconStyle} width={22} height={22} />,
    },
  ];

  constructor(props: MoreListProp) {
    super(props);
  }

  render() {
    return (
      <SafeAreaView>
        <FlatList
          data={this.listData}
          showsVerticalScrollIndicator={false}
          renderItem={({item}) => (
            <View style={styles.listItem}>
              {item.icon}
              <Text style={styles.listItemName}>{item.item_name}</Text>
            </View>
          )}
          keyExtractor={(item) => item.id.toString()}
        />
      </SafeAreaView>
    );
  }
}

export default withTranslation()(MoreList);
