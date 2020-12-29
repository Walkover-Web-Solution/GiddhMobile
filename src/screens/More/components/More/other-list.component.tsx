import React from 'react';
import {WithTranslation, withTranslation, WithTranslationProps} from 'react-i18next';
import {FlatList, SafeAreaView, Text, View} from 'react-native';
import styles from '@/screens/More/components/More/listStyle';
import Icon from '@/core/components/custom-icon/custom-icon';

import {AutocompleteItem} from '@ui-kitten/components';

type OtherListProp = WithTranslation & WithTranslationProps & {};

type OtherListState = {};

class OtherList extends React.Component<OtherListProp, OtherListState> {
  listData = [
    {
      id: 1,
      item_name: 'Share & Earn',
      icon: <Icon name={'gstr'} size={20} color={'#5773FF'} />,
    },
    {
      id: 2,
      item_name: 'Greetings',
      icon: <Icon name={'inventory'} size={20} color={'#5773FF'} />,
    },
    {
      id: 3,
      item_name: 'Desktop QR code Login',
      icon: <Icon name={'purchase'} size={20} color={'#5773FF'} />,
    },
    {
      id: 4,
      item_name: 'Rate App on App store',
      icon: <Icon name={'report'} size={20} color={'#5773FF'} />,
    },
    {
      id: 5,
      item_name: 'Logout',
      icon: <Icon name={'Lock'} size={20} color={'#5773FF'} />,
    },
    {
      id: 6,
      item_name: 'About',
      icon: <Icon name={'report'} size={20} color={'#5773FF'} />,
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
