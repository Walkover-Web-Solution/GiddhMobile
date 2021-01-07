import React from 'react';
import {GDContainer} from '@/core/components/container/container.component';
import {View, Text, TouchableOpacity, FlatList} from 'react-native';
import style from './style';
import {GdSVGIcons, GdIconsPack} from '@/utils/icons-pack';
import {Image} from 'react-native-svg';

interface Props {
  navigation: any;
}

export class HelpScreen extends React.Component<Props> {
  listData = [
    {
      id: 1,
      item_name: 'Talk to our Expert',
      icon: <GdSVGIcons.phone style={style.iconStyle} width={22} height={22} />,
    },
    {
      id: 2,
      item_name: 'WhatsApp Support',
      icon: <GdSVGIcons.notifications style={style.iconStyle} width={22} height={22} />,
    },
    {
      id: 3,
      item_name: 'Chat with us',
      icon: <GdSVGIcons.profile style={style.iconStyle} width={22} height={22} />,
    },
    {
      id: 4,
      item_name: 'Mail us :support@giddh.com',
      icon: <GdSVGIcons.send style={style.iconStyle} width={22} height={22} />,
    },
  ];
  render() {
    return (
      <GDContainer>
        <View style={style.container}>
          <Text style={{fontSize: 20, fontFamily: 'OpenSans-Bold', margin: 20}}>Help and Support</Text>
          <View style={{alignSelf: 'center'}}>
            <GdSVGIcons.help style={style.iconStyle} width={300} height={200} />
          </View>
          <Text style={{fontSize: 20, fontFamily: 'OpenSans-Bold', margin: 20}}>Help and Support</Text>
          <FlatList
            data={this.listData}
            showsVerticalScrollIndicator={false}
            renderItem={({item}) => (
              <TouchableOpacity style={style.listItem} delayPressIn={0}>
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

export default HelpScreen;
