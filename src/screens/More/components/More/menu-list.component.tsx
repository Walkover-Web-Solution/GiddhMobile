import React from 'react';
import { WithTranslation, withTranslation, WithTranslationProps } from 'react-i18next';
import { FlatList, Text, TouchableOpacity, View } from 'react-native';
import styles from '@/screens/More/components/More/listStyle';
import Icon from '@/core/components/custom-icon/custom-icon';

type MenuListProp = WithTranslation & WithTranslationProps & {navigation: any};

type MenuListState = {};

class MenuList extends React.Component<MenuListProp, MenuListState> {
  listData = [
    {
      id: 1,
      item_name: 'GSTR',
      icon: <Icon name={'gstr'} size={20} color={'#5773FF'} />
    },
    {
      id: 2,
      item_name: 'Reports',
      icon: <Icon name={'report'} size={20} color={'#5773FF'} />
    },
    {
      id: 3,
      item_name: 'Invoice Management',
      icon: <Icon name={'gstin'} size={20} color={'#5773FF'} />
    },
    {
      id: 4,
      item_name: 'Purchase Management',
      icon: <Icon name={'purchase'} size={20} color={'#5773FF'} />
    },
    {
      id: 5,
      item_name: 'Settings',
      icon: <Icon name={'settings'} size={20} color={'#5773FF'} />,
      Screen: 'Settings'
    },
    {
      id: 6,
      item_name: 'Inventory',
      icon: <Icon name={'inventory'} size={20} color={'#5773FF'} />
    }
  ];

  constructor (props: MenuListProp) {
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
              delayPressIn={0}
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

export default withTranslation()(MenuList);
