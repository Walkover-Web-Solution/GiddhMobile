import { Dimensions, Text, TouchableOpacity, View } from "react-native";
import style from "./style"
import Icon from '@/core/components/custom-icon/custom-icon';
import useCustomTheme, { DefaultTheme } from "@/utils/theme";
import color from '@/utils/colors';
import makeStyle from "./style";

const RenderTaxes = ({selectedUniqueTax,setBottomSheetVisible,taxModalRef})=>{
    const {styles, theme, voucherBackground} = useCustomTheme(makeStyle,'Group');
    const {height,width } = Dimensions.get('window');
    return (
    <View style={styles.fieldContainer}>
        <View style={styles.checkboxContainer}>
            <Icon name={'Path-12190'} color={voucherBackground} size={16} />
            <Text style={styles.fieldHeadingText}>{'Tax'}</Text>
        </View>

        <View style={styles.taxView}>
            <View style={styles.checkboxContainer}>
                <TouchableOpacity style={{flexDirection: 'row'}}
                    onPress={()=>{
                        setBottomSheetVisible(taxModalRef,true);
                    }}
                    textColor={{color}}>
                    <View
                        style={[
                        styles.buttonWrapper,
                        styles.taxBtn,
                        {borderColor: Object.keys(selectedUniqueTax).length ? voucherBackground : '#d9d9d9'},
                        ]}>
                        <View style={[styles.checkboxContainer,{justifyContent:'center'}]}>
                        {Object.keys(selectedUniqueTax).length > 0 
                        ? Object.keys(selectedUniqueTax).map((item)=>(<Text style={{ color:voucherBackground}} key={item}>  {selectedUniqueTax?.[item]?.name}  </Text>)) 
                        : <Text style={{color:'#868686'}}>Tax</Text>}
                        </View>
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