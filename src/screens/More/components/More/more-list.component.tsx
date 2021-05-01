import React from 'react';
import {WithTranslation, withTranslation, WithTranslationProps} from 'react-i18next';
import {FlatList, SafeAreaView, Text, View} from 'react-native';
import styles from '@/screens/More/components/More/listStyle';
import {GdSVGIcons} from '@/utils/icons-pack';
import {AutocompleteItem} from '@ui-kitten/components';
import Icon from '@/core/components/custom-icon/custom-icon';

type MoreListProp = WithTranslation & WithTranslationProps & {};

type MoreListState = {};

class MoreList extends React.Component<MoreListProp, MoreListState> {
  listData = [
    {
      id: 1,
      item_name: 'Giddh Books Premium',
      icon: <Icon name={'premium'} size={20} color={'#F8B100'} />,
    },
    {
      id: 2,
      item_name: 'Import/Export Data(Backup)',
      icon: <Icon name={'incoming'} size={20} color={'#229F5F'} />,
    },
    {
      id: 3,
      item_name: 'Link Bank Account',
      icon: <Icon name={'compose'} size={20} color={'#AA0883'} />,
    },
    {
      id: 4,
      item_name: 'ChangeLog(Recent Updates)',
      icon: <Icon name={'currency'} size={20} color={'#34BAEC'} />,
    },
  ];

  constructor(props: MoreListProp) {
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

export default withTranslation()(MoreList);
