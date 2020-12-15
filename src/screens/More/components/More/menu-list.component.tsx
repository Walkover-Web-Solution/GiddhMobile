import React from 'react';
import {WithTranslation, withTranslation, WithTranslationProps} from 'react-i18next';
import {FlatList, SafeAreaView, Text, TouchableOpacity, View} from 'react-native';
import styles from '@/screens/More/components/More/listStyle';
import {GdSVGIcons} from '@/utils/icons-pack';

type MenuListProp = WithTranslation & WithTranslationProps & {navigation: any};

type MenuListState = {};

class MenuList extends React.Component<MenuListProp, MenuListState> {
  listData = [
    {
      id: 1,
      item_name: 'GSTR',
      icon: <GdSVGIcons.gstr color={'#F8B100'} style={styles.iconStyle} width={22} height={22} />,
    },
    {
      id: 2,
      item_name: 'Reports',
      icon: <GdSVGIcons.report style={styles.iconStyle} width={22} height={22} />,
    },
    {
      id: 3,
      item_name: 'Invoice Management',
      icon: <GdSVGIcons.back style={styles.iconStyle} width={22} height={22} />,
    },
    {
      id: 4,
      item_name: 'Purchase Management',
      icon: <GdSVGIcons.purchase style={styles.iconStyle} width={22} height={22} />,
    },
    {
      id: 5,
      item_name: 'Settings',
      icon: <GdSVGIcons.currency color={'#F8B100'} style={styles.iconStyle} width={22} height={22} />,
      Screen: 'Settings',
    },
    {
      id: 6,
      item_name: 'Inventory',
      icon: <GdSVGIcons.inventory style={styles.iconStyle} width={22} height={22} />,
    },
  ];

  constructor(props: MenuListProp) {
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
              delayPressIn={0}
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

export default withTranslation()(MenuList);
