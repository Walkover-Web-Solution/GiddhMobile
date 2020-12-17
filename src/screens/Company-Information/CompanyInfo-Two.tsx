import React from 'react';
import {View, Text, TouchableOpacity, FlatList} from 'react-native';
import style from './style';
import {GdSVGIcons} from '@/utils/icons-pack';
import Input from './components/input';
import BusinessTypeModal from './components/BusinessTypeModal';
import TaxTypeModal from './components/TaxTypeModal';

export class CompanyInfoTwo extends React.Component<any, any> {
  constructor(props: any) {
    super(props);
    this.state = {
      businessTypeModal: false,
      taxTypeModal: false,
    };
  }
  render() {
    return (
      <View style={style.container}>
        <BusinessTypeModal
          modalVisible={this.state.businessTypeModal}
          onClose={() => this.setState({businessTypeModal: false})}
        />
        <TaxTypeModal modalVisible={this.state.taxTypeModal} onClose={() => this.setState({taxTypeModal: false})} />
        <Input
          name={'Business Type'}
          icon={<GdSVGIcons.product color={'#F8B100'} width={22} height={22} />}
          placeholder={'Select Type'}
          picker
          onPress={() => this.setState({businessTypeModal: true})}
        />
        <Input
          name={'GSTIN'}
          icon={<GdSVGIcons.gstin color={'#F8B100'} width={22} height={22} />}
          placeholder={'Enter GSTIN'}
        />
        <Input
          name={'State'}
          icon={<GdSVGIcons.location color={'#F8B100'} width={22} height={22} />}
          placeholder={'Select State'}
        />
        <Input
          name={'Applicable Taxes'}
          icon={<GdSVGIcons.product color={'#F8B100'} width={22} height={22} />}
          placeholder={'Select Taxes'}
          picker
          onPress={() => this.setState({taxTypeModal: true})}
        />
        <Input
          name={'Address'}
          icon={<GdSVGIcons.location color={'#F8B100'} width={22} height={22} />}
          placeholder={'Enter Address'}
        />
        <View style={style.buttonContainer}>
          <TouchableOpacity style={style.buttonTwo} delayPressIn={0} onPress={() => this.props.navigation.goBack()}>
            <Text style={style.buttonText}>Back</Text>
          </TouchableOpacity>

          <TouchableOpacity style={style.buttonThree} delayPressIn={0}>
            <Text style={{fontSize: 20, color: 'white'}}>Create</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }
}

export default CompanyInfoTwo;
