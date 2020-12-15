import React from 'react';
import {GDContainer} from '@/core/components/container/container.component';
import {View, Text, TouchableOpacity, FlatList} from 'react-native';
import style from './style';
import {GdSVGIcons, GdIconsPack} from '@/utils/icons-pack';

interface Props {
  navigation: any;
}

export class ChangeCompany extends React.Component<Props> {
  listData = [
    {
      id: 1,
      item_name: 'Company Name',
    },
    {
      id: 2,
      item_name: 'Company Name 2',
    },
    {
      id: 3,
      item_name: 'Company Name 3',
    },
    {
      id: 4,
      item_name: 'Company Name 4',
    },
    {
      id: 5,
      item_name: 'Company Name 5',
    },
    {
      id: 6,
      item_name: 'Company Name 6',
    },
    {
      id: 7,
      item_name: 'Company Name 7',
    },
  ];
  render() {
    return (
      <GDContainer>
        <View style={style.container}>
          <Text style={{fontSize: 20, fontWeight: 'bold', margin: 20}}>Switch Company</Text>
          <FlatList
            data={this.listData}
            showsVerticalScrollIndicator={false}
            renderItem={({item}) => (
              <TouchableOpacity style={style.listItem} delayPressIn={0}>
                <Text style={style.listItemName}>{item.item_name}</Text>
              </TouchableOpacity>
            )}
            keyExtractor={(item) => item.id.toString()}
          />
          <TouchableOpacity
            style={{
              position: 'absolute',
              justifyContent: 'center',
              alignItems: 'center',
              bottom: 20,
              right: 20,
            }}
            delayPressIn={0}>
            <GdSVGIcons.plus color={'#F8B100'} style={style.iconStyle} width={60} height={60} />
          </TouchableOpacity>
        </View>
      </GDContainer>
    );
  }
}

export default ChangeCompany;
