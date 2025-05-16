import React from 'react';
import { WithTranslation, withTranslation, WithTranslationProps } from 'react-i18next';
import { FlatList, Text, TouchableOpacity, View } from 'react-native';
import styles from '@/screens/More/components/More/listStyle';
import Icon from '@/core/components/custom-icon/custom-icon';

type HelpListProp = WithTranslation & WithTranslationProps & {navigation: any};

type HelpListState = {};

class HelpList extends React.Component<HelpListProp, HelpListState> {
  listData = [
    {
      id: 1,
      item_name: 'Blogs & Tutorials',
      icon: <Icon name={'gstr'} size={20} color={'#5773FF'} />
    },
    {
      id: 2,
      item_name: 'Help & Support',
      icon: <Icon name={'report'} size={20} color={'#5773FF'} />,
      Screen: 'HelpScreen'
    }
  ];

  constructor (props: HelpListProp) {
    super(props);
  }

  render () {
    const { navigation } = this.props;
    return (
      <View>
        <FlatList
          data={this.listData}
          showsVerticalScrollIndicator={false}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={styles.listItem}
              onPress={() => (item.Screen ? navigation.navigate(item.Screen) : null)}>
              {item.icon}
              <Text style={styles.listItemName}>{item.item_name}</Text>
            </TouchableOpacity>
          )}
          keyExtractor={(item) => item.id.toString()}
        />
      </View>
    );
  }
}

export default withTranslation()(HelpList);
