import Icon from '@/core/components/custom-icon/custom-icon';
import { Dimensions, Text, TouchableOpacity, View } from 'react-native';
import style from './style';
import { DefaultTheme } from '@/utils/theme';
import colors from '@/utils/colors';

const RenderTaxes = ({selectedUniqueTax,setBottomSheetVisible,taxModalRef})=>{
    return (
    <View style={style.fieldContainer}>
        <View style={{flexDirection: 'row'}}>
        <Icon name={'Path-12190'} color={DefaultTheme.colors.secondary} size={16} />
        <Text style={style.fieldHeadingText}>{'Tax'}</Text>
        </View>

        <View style={{paddingVertical: 6, marginTop: 10, width:Dimensions.get('window').width-100}}>
        <View style={{flexDirection: 'row'}}>
            <TouchableOpacity style={{flexDirection: 'row'}}
            onPress={()=>{
                setBottomSheetVisible(taxModalRef,true);
            }}
            textColor={{colors}}>
            <View
                style={[
                style.buttonWrapper,
                {marginLeft: 20,minWidth:140},
                {borderColor: Object.keys(selectedUniqueTax).length ? '#084EAD' : '#d9d9d9'},
                ]}>
                <Text
                style={[
                    style.buttonText,
                    {
                    color: '#868686',
                    },
                ]}>
                {Object.keys(selectedUniqueTax).length > 0 ? Object.keys(selectedUniqueTax).map((item)=>(<Text style={{color:'#084EAD'}} key={item}>{selectedUniqueTax?.[item]?.name}  </Text>)) : 'Tax'}
                </Text>
            </View>
            </TouchableOpacity>
            {/* <TouchableOpacity
            style={{flexDirection: 'row'}}
            //   onPress={() => {
            //     if (this.state.invoiceType == INVOICE_TYPE.cash || this.state.partyName) {
            //       this.setBottomSheetVisible(this.paymentModalRef, true);
            //     } else {
            //       alert('Please select a party.');
            //     }
            //   }}
            textColor={{color}}>
            <View
                style={[
                style.buttonWrapper,
                {marginLeft: 20,width:150},
                {borderColor: false ? '#00B795' : '#d9d9d9'},
                ]}>
                <Text
                style={[
                    style.buttonText,
                    {
                    color: false ? '#00B795' : '#868686',
                    },
                ]}>
                    Select Group
                </Text>
            </View>
            </TouchableOpacity> */}
        </View>
        </View>
    </View>
    )
}


export default RenderTaxes;