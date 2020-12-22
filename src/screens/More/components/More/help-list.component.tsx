import React from 'react';
import {WithTranslation, withTranslation, WithTranslationProps} from 'react-i18next';
import {FlatList, SafeAreaView, Text, TouchableOpacity, View} from 'react-native';
import styles from '@/screens/More/components/More/listStyle';
import {GdSVGIcons} from '@/utils/icons-pack';

import {AutocompleteItem} from '@ui-kitten/components';

type HelpListProp = WithTranslation & WithTranslationProps & {navigation: any};

type HelpListState = {};

class HelpList extends React.Component<HelpListProp, HelpListState> {
  listData = [
    {
      id: 1,
      item_name: 'Blogs & Tutorials',
      icon: <GdSVGIcons.gstr color={'#F8B100'} style={styles.iconStyle} width={22} height={22} />,
    },
    {
      id: 2,
      item_name: 'Help & Support',
      icon: <GdSVGIcons.report style={styles.iconStyle} width={22} height={22} />,
      Screen: 'HelpScreen',
    },
  ];

  constructor(props: HelpListProp) {
    super(props);
  }

  render() {
    const {navigation} = this.props;
    return (
      <SafeAreaView>
        <FlatList
          data={this.listData}
          showsVerticalScrollIndicator={false}
          renderItem={({item}) => (
            <TouchableOpacity
              style={styles.listItem}
              onPress={() => (item.Screen ? navigation.navigate(item.Screen) : null)}>
              {item.icon}
              <Text style={styles.listItemName}>{item.item_name}</Text>
            </TouchableOpacity>
          )}
          keyExtractor={(item) => item.id.toString()}
        />
      </SafeAreaView>
    );
  }
}

export default withTranslation()(HelpList);
