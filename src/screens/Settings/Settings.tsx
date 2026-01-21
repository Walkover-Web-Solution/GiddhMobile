import React from 'react';
import { GDContainer } from '@/core/components/container/container.component';
import { View, Text, TouchableOpacity, FlatList } from 'react-native';
import style from '@/screens/Settings/style';
import { GdSVGIcons } from '@/utils/icons-pack';
import { withTranslation, WithTranslation } from 'react-i18next';

interface Props extends WithTranslation {
  navigation: any;
}

export class SettingsScreen extends React.Component<Props> {
  getListData = () => [
    {
      id: 1,
      item_name: this.props.t('settings.companyProfile'),
      icon: <GdSVGIcons.company style={style.iconStyle} width={22} height={22} />
    },
    {
      id: 2,
      item_name: this.props.t('settings.userProfile'),
      icon: <GdSVGIcons.profile style={style.iconStyle} width={22} height={22} />
    },
    {
      id: 3,
      item_name: this.props.t('settings.manageUsers'),
      icon: <GdSVGIcons.lock style={style.iconStyle} width={22} height={22} />
    },
    {
      id: 4,
      item_name: this.props.t('settings.taxes'),
      icon: <GdSVGIcons.gstr style={style.iconStyle} width={22} height={22} />
    },
    {
      id: 5,
      item_name: this.props.t('settings.integration'),
      icon: <GdSVGIcons.notifications style={style.iconStyle} width={22} height={22} />
    },
    {
      id: 6,
      item_name: this.props.t('settings.trigger'),
      icon: <GdSVGIcons.trigger style={style.iconStyle} width={22} height={22} />
    },
    {
      id: 7,
      item_name: this.props.t('settings.discount'),
      icon: <GdSVGIcons.discount style={style.iconStyle} width={22} height={22} />
    },
    {
      id: 8,
      item_name: this.props.t('settings.invoiceTemplates'),
      icon: <GdSVGIcons.download style={style.iconStyle} width={22} height={22} />
    },
    {
      id: 9,
      item_name: this.props.t('settings.subscription'),
      icon: <GdSVGIcons.currency style={style.iconStyle} width={22} height={22} />
    },
    {
      id: 10,
      item_name: this.props.t('settings.notificationSettings'),
      icon: <GdSVGIcons.notifications style={style.iconStyle} width={22} height={22} />
    }
  ];

  render () {
    return (
        <View style={style.container}>
          <Text style={{ fontSize: 20, fontFamily: 'AvenirLTStd-Black', margin: 20 }}>{this.props.t('settings.settings')}</Text>
          <FlatList
            data={this.getListData()}
            showsVerticalScrollIndicator={false}
            renderItem={({ item }) => (
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
    );
  }
}

export default withTranslation()(SettingsScreen);
