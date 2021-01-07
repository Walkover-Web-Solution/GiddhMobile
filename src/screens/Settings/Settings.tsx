import React from 'react';
import {GDContainer} from '@/core/components/container/container.component';
import {View, Text, TouchableOpacity, FlatList} from 'react-native';
import style from '@/screens/Settings/style';
import {GdSVGIcons, GdIconsPack} from '@/utils/icons-pack';

interface Props {
  navigation: any;
}

export class SettingsScreen extends React.Component<Props> {
  listData = [
    {
      id: 1,
      item_name: 'Company Profile',
      icon: <GdSVGIcons.company style={style.iconStyle} width={22} height={22} />,
    },
    {
      id: 2,
      item_name: 'User Profile',
      icon: <GdSVGIcons.profile style={style.iconStyle} width={22} height={22} />,
    },
    {
      id: 3,
      item_name: 'Manage Users (Permission)',
      icon: <GdSVGIcons.lock style={style.iconStyle} width={22} height={22} />,
    },
    {
      id: 4,
      item_name: 'Taxes',
      icon: <GdSVGIcons.gstr style={style.iconStyle} width={22} height={22} />,
    },
    {
      id: 5,
      item_name: 'Integration',
      icon: <GdSVGIcons.notifications style={style.iconStyle} width={22} height={22} />,
    },
    {
      id: 6,
      item_name: 'Trigger',
      icon: <GdSVGIcons.trigger style={style.iconStyle} width={22} height={22} />,
    },
    {
      id: 7,
      item_name: 'Discount',
      icon: <GdSVGIcons.discount style={style.iconStyle} width={22} height={22} />,
    },
    {
      id: 8,
      item_name: 'Invoice $ Templates',
      icon: <GdSVGIcons.download style={style.iconStyle} width={22} height={22} />,
    },
    {
      id: 9,
      item_name: 'Subscription',
      icon: <GdSVGIcons.currency style={style.iconStyle} width={22} height={22} />,
    },
    {
      id: 10,
      item_name: 'Notification Settings',
      icon: <GdSVGIcons.notifications style={style.iconStyle} width={22} height={22} />,
    },
  ];
  render() {
    return (
      <GDContainer>
        <View style={style.container}>
          <Text style={{fontSize: 20, fontFamily: 'OpenSans-Bold', margin: 20}}>Settings</Text>
          <FlatList
            data={this.listData}
            showsVerticalScrollIndicator={false}
            renderItem={({item}) => (
              <TouchableOpacity
                style={style.listItem}
                delayPressIn={0}
                //   onPress={() => (item.Screen ? navigation.navigate(item.Screen) : null)}
              >
                {item.icon}
                <Text style={style.listItemName}>{item.item_name}</Text>
              </TouchableOpacity>
            )}
            keyExtractor={(item) => item.id.toString()}
          />
        </View>
      </GDContainer>
    );
  }
}

export default SettingsScreen;
