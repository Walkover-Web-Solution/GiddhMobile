import Icon from '@/core/components/custom-icon/custom-icon';
import { Text, TouchableOpacity, View } from 'react-native';
import useCustomTheme, { DefaultTheme } from '@/utils/theme';
import colors from '@/utils/colors';
import React from 'react';
import makeStyles from './style';

const RenderTaxes = ({selectedUniqueTax,setBottomSheetVisible,taxModalRef})=>{
    const {styles,theme} = useCustomTheme(makeStyles);
    return (
    <View style={[styles.fieldContainer,{maxHeight:100}]}>
        <View style={styles.rowView}>
            <Icon name={'Path-12190'} color={DefaultTheme.colors.secondary} size={16} />
            <Text style={styles.fieldHeadingText}>{'Tax'}</Text>
        </View>

        <View style={styles.taxView}>
        <View style={styles.rowView}>
            <TouchableOpacity style={{flexDirection: 'row'}}
            onPress={()=>{
                setBottomSheetVisible(taxModalRef,true);
            }}
            textColor={{colors}}>
            <View
                style={[
                styles.buttonWrapper,
                styles.taxBtn,
                {borderColor: Object.keys(selectedUniqueTax).length ? '#084EAD' : '#d9d9d9'},
                ]}>
                <View style={[styles.checkboxContainer,{justifyContent:'center'}]}>
                {Object.keys(selectedUniqueTax).length > 0 
                ? (<>
                    {Object.keys(selectedUniqueTax).slice(0,2).map((item)=>(<Text style={{ color:'#084EAD'}} key={item}>  {selectedUniqueTax?.[item]?.name}  </Text>))}
                    {Object.keys(selectedUniqueTax)?.length > 2 && <Text style={{ color:'#084EAD'}}>  +more</Text>}
                </> )
                : <Text style={{color:'#868686'}}>Tax</Text>}
                </View>
            </View>
            </TouchableOpacity>
        </View>
        </View>
    </View>
    )
}


export default React.memo(RenderTaxes);