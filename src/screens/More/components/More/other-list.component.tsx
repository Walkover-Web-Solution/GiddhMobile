import React from 'react';
import {WithTranslation, withTranslation, WithTranslationProps} from 'react-i18next';
import {FlatList, SafeAreaView, Text, View} from 'react-native';
import styles from '@/screens/More/components/More/listStyle';
import {GdSVGIcons} from '@/utils/icons-pack';

import {AutocompleteItem} from '@ui-kitten/components';

type OtherListProp = WithTranslation & WithTranslationProps & {};

type OtherListState = {};

class OtherList extends React.Component<OtherListProp, OtherListState> {
  listData = [
    {
      id: 1,
      item_name: 'Share & Earn',
      icon: <GdSVGIcons.gstr color={'#F8B100'} style={styles.iconStyle} width={22} height={22} />,
    },
    {
      id: 2,
      item_name: 'Greetings',
      icon: <GdSVGIcons.inventory style={styles.iconStyle} width={22} height={22} />,
    },
    {
      id: 3,
      item_name: 'Desktop QR code Login',
      icon: <GdSVGIcons.purchase style={styles.iconStyle} width={22} height={22} />,
    },
    {
      id: 4,
      item_name: 'Rate App on App store',
      icon: <GdSVGIcons.report style={styles.iconStyle} width={22} height={22} />,
    },
    {
      id: 5,
      item_name: 'Logout',
      icon: <GdSVGIcons.currency style={styles.iconStyle} width={22} height={22} />,
    },
    {
      id: 6,
      item_name: 'About',
      icon: <GdSVGIcons.report style={styles.iconStyle} width={22} height={22} />,
    },
  ];

  constructor(props: OtherListProp) {
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

export default withTranslation()(OtherList);
