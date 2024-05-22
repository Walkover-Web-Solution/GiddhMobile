import { DefaultTheme } from "@/utils/theme";
import { Text, TextInput, TouchableOpacity, View } from "react-native";
import Icon from '@/core/components/custom-icon/custom-icon';

const RenderStockName = ({stockName, setStockName, stockUniqueName, setStockUniqueName, clearAll})=>{
    return (
        <View>
            <View style={{flexDirection: 'row', minHeight: 50, alignItems: 'center', paddingTop: 14}}>
                <View style={{flexDirection: 'row', alignItems: 'center', flex: 1}}>
                <Icon name={'Sections'} color={DefaultTheme.colors.secondary} style={{margin: 16}} size={16} />
                <TextInput
                    placeholderTextColor={'#808080'}
                    placeholder={'Enter Stock'}
                    returnKeyType={'done'}
                    value={stockName}
                    onChangeText={(text) => setStockName(text)}
                    // style={style.searchTextInputStyle}
                />
                </View>
                <TouchableOpacity onPress={()=>clearAll()}>
                <Text style={{color: '#1C1C1C', marginRight: 16, fontFamily: 'AvenirLTStd-Book'}}>Clear All</Text>
                </TouchableOpacity>
            </View>
            <View>
                <View style={{flexDirection: 'row', alignItems: 'center', flex: 1}}>
                <Icon name={'Sections'} color={DefaultTheme.colors.secondary} style={{margin: 16}} size={16} />
                <TextInput
                    placeholderTextColor={'#808080'}
                    placeholder={'Unique Name'}
                    returnKeyType={'done'}
                    value={stockUniqueName}
                    onChangeText={(text) => setStockUniqueName(text)}
                    // style={style.searchTextInputStyle}
                />
                </View>
            </View>
        </View>
    );
}


export default RenderStockName