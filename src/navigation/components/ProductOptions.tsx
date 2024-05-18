import { FONT_FAMILY, GD_FONT_SIZE } from "@/utils/constants";
import { Dimensions, StyleSheet, Text, TouchableOpacity, View } from "react-native"
import { Modalize } from "react-native-modalize"
import { Portal } from "react-native-portalize"
import SalesInvoice from '@/assets/images/icons/options/SalesInvoice.svg'

type Props = {
    navigation: any;
    isDisabled: any;
    productOptionRef:any;
    closeModal: () => void;
}

const SIZE = 48;
const padding = 10;
const { height, width } = Dimensions.get('window');
const itemWidth = (Dimensions.get('window').width - (SIZE + padding * 10)) / (width > 550 ? 5 : 4);

const productArr:any = {
    stock : {
        name: 'Create Stock', 
        navigateTo: 'ProductScreen', 
        icon: <SalesInvoice color={'gray'} />, 
        color: 'gray'   
    },
    group : {
        name: 'Create Group', 
        navigateTo: 'GroupScreen', 
        icon: <SalesInvoice color={'blue'} />, 
        color: 'blue'   
    }
}
const ProductOptions = ({productOptionRef,navigation}:Props)=>{
    return (
        <Portal>
            <Modalize
                ref={productOptionRef}
                adjustToContentHeight={true}
                withHandle={false}
                modalStyle={styles.modalStyle}
            >
                <View style={{flex:1,padding:12}}>
                    <Text style={styles.listTitle}>Select option</Text>
                    <View style={{flexDirection:'row',width:'60%',alignSelf:'center',justifyContent:'space-between',margin:10}}>
                    {Object.keys(productArr).map((item)=>(
                        <TouchableOpacity
                        activeOpacity={0.7}
                        key={productArr?.[item]?.name}
                        style={styles.button}
                        onPress={async ()=>{
                            productOptionRef?.current?.close();
                            // this?.props?.productOptionRef?.current?.open();
                            await navigation.navigate(productArr?.[item]?.navigateTo);
                            // await DeviceEventEmitter.emit(APP_EVENTS.REFRESHPAGE, {});
                        }}>
                            <View style={styles.iconContainer}>
                                {productArr?.[item]?.icon}
                            </View>
                            <Text style={styles.name}>{productArr?.[item]?.name}</Text>
                        </TouchableOpacity>
                    ))}
                    </View>
                </View>   
            </Modalize>
        </Portal>
    )
}

export default ProductOptions;

const styles = StyleSheet.create({
    modalStyle: { 
        margin: 20, 
        marginBottom: 50, 
        borderRadius: 12, 
        overflow: 'hidden' 
    },
    button: {
        width: itemWidth,
        alignItems: 'center',
        margin: padding
    },
    iconContainer: {
        width: itemWidth,
        backgroundColor: '#F9F9F9',
        borderRadius: itemWidth / 2,
        height: itemWidth,
        justifyContent: 'center',
        alignItems: 'center'
    },
    name: { 
        fontFamily: FONT_FAMILY.semibold, 
        fontSize: GD_FONT_SIZE.small, 
        textAlign: 'center', 
        marginTop: 5 
    },
    listTitle: {
        fontFamily: FONT_FAMILY.bold, 
        fontSize: GD_FONT_SIZE.medium, 
        marginTop: 5 
    }
});