import { FONT_FAMILY } from "@/utils/constants";
import { DefaultTheme } from "@/utils/theme";
import { useEffect, useState } from "react";
import { Dimensions, Text, TextInput, ToastAndroid, TouchableOpacity, View } from "react-native";
import AntDesign from 'react-native-vector-icons/AntDesign';
import Icon from '@/core/components/custom-icon/custom-icon';
import style from "./style";
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
const RenderVariants = ()=>{
    const [expandAcc, setExpandAcc] = useState(false);
    const [optionCount,setOptionCount] = useState(0);
    const [addOption,setAddOption] = useState(false);
    const [fields, setFields] = useState([{ id: Date.now(), value: '' }]);
    const [typingTimeout, setTypingTimeout] = useState<NodeJS.Timeout | null>(null);
    const [optionName,setOptionName] = useState('');
    const {height,width} = Dimensions.get('window')
    const [optionAndDataMapping,setOptionAndDataMapping]:any = useState([]);
    useEffect(() => {
        if (fields.length === 0 || fields[fields.length - 1].value !== '') {
            setFields([...fields, { id: Date.now(), value: '' }]);
        }
    }, [fields]);

    const handleInputChange = (id, value) => {
        setFields(fields.map(field => field.id === id ? { ...field, value } : field));

        if (typingTimeout) {
            clearTimeout(typingTimeout);
        }
        
        setTypingTimeout(setTimeout(() => {
            const isDuplicate = fields.some(field => field.value === value && field.id !== id);
            if (isDuplicate) {
                ToastAndroid.show("Duplicate Value, This value already exists.",ToastAndroid.LONG);
                setFields(fields.map(field => field.id === id ? { ...field, value: '' } : field));
            }
        }, 1000));
    };

    const handleDeleteField = (id) => {
        setFields(fields.filter(field => field.id !== id));
    };

    const addOptionToMap = ()=>{
        const objectMapping = [
            ...optionAndDataMapping,
            {
                [optionName] : fields
            }
        ]
        setOptionAndDataMapping(objectMapping)
    }

    const Button = ()=>{
        return (
            <TouchableOpacity
                style={{
                height: 40,
                width: 80,
                borderRadius: 16,
                backgroundColor: '#084EAD',
                justifyContent: 'center',
                alignItems: 'center',
                marginTop:10
                }}
                onPress={()=>(addOptionToMap(),setAddOption(false),setFields([{ id: Date.now(), value: '' }]))}
                >
                <Text
                style={{
                    fontFamily: 'AvenirLTStd-Black',
                    color: '#fff',
                    fontSize: 16,
                }}>
                Done
                </Text>
            </TouchableOpacity>
        )
    }

console.log("data",optionAndDataMapping);

    return (
        <View>
            <View
                style={{
                    backgroundColor: '#E6E6E6',
                    flexDirection: 'row',
                    paddingVertical: 9,
                    paddingHorizontal: 16,
                    justifyContent: 'space-between'
                }}>
                <View style={{ flexDirection: 'row' }}>
                    <Icon style={{ marginRight: 10 }} name={'Path-12190'} size={16} color={DefaultTheme.colors.secondary} />
                    <Text style={{ color: '#1C1C1C', fontFamily: FONT_FAMILY.semibold }}>Variant</Text>
                </View>
                <Icon
                    style={{ transform: [{ rotate: expandAcc ? '180deg' : '0deg' }] }}
                    name={'9'}
                    size={16}
                    color="#808080"
                    onPress={() => {
                    setExpandAcc(!expandAcc);
                    }}
                />
            </View>
            {
            expandAcc && (
                <View style={{flex:1,maxHeight:300*fields.length}}>
                    {optionAndDataMapping.length > 0 ? Object.keys(optionAndDataMapping).map((item)=>(<Text key={item}>hi</Text>)) : <></>}
                    {addOption && 
                    <View style={{padding:15}}>
                        <View style={{flexDirection:'row',alignItems:'center',justifyContent:'space-between'}}>
                            <TextInput
                                returnKeyType={'done'}
                                onChangeText={(val) => {
                                    setOptionName(val);
                                    // setRate(val);
                                    // linkedAccountText === "Linked Purchase Accounts" ? handleRateChange('purchaseRate',val) : handleRateChange('salesRate',val)
                                }}
                                placeholderTextColor={'rgba(80,80,80,0.5)'}
                                // value={this.state.openingBalance}
                                placeholder="Option Name"
                                style={{ ...style.buttonWrapper, borderWidth: 1, borderColor: '#d9d9d9',width:'90%',padding: 10, marginTop: 5, fontFamily: 'AvenirLTStd-Book' }} 
                            />
                            <TouchableOpacity onPress={() =>{}} >
                                <MaterialIcons name={'delete'} size={20} color={'#808080'} />
                            </TouchableOpacity>
                        </View>
                        <Text style={{ color: '#1c1c1c', paddingRight: 5, marginTop: 10, fontFamily: 'AvenirLTStd-Book' }} >Option Values</Text> 
                        {fields.map((field, index) => (
                            <View key={field.id} style={{flexDirection:'row',alignItems:'center',justifyContent:'space-between'}}>
                                <TextInput
                                    // style={styles.input}
                                    value={field.value}
                                    placeholderTextColor={'rgba(80,80,80,0.5)'}
                                    onChangeText={(text) => handleInputChange(field.id, text)}
                                    style={{ ...style.buttonWrapper, borderWidth: 1, borderColor: '#d9d9d9',width:'90%',padding: 10, marginTop: 5, fontFamily: 'AvenirLTStd-Book' }} 
                                    placeholder={`Option ${index + 1}`}
                                />
                                {fields.length > 1 && (
                                    <TouchableOpacity onPress={() => handleDeleteField(field.id)} >
                                        <MaterialIcons name={'delete'} size={18} color={'#808080'} />
                                        
                                    </TouchableOpacity>
                                )}
                            </View>
                        ))}  
                        <Button />
                    </View>}
                    {optionCount < 3 && <TouchableOpacity
                        onPress={() => optionCount < 3 && !addOption && (setOptionCount(optionCount+1),setAddOption(true))}
                        style={{
                        marginVertical: 16,
                        paddingVertical: 10,
                        flexDirection: 'row',
                        alignSelf: 'flex-start',
                        justifyContent: 'center',
                        }}>
                        {optionCount < 3 && <AntDesign name={'plus'} color={'blue'} size={18} style={{ marginHorizontal: 8 }} />}
                        {optionCount == 0 
                        ? <Text numberOfLines={1} style={style.addItemMain}> Add options like multiple size or colours etc...</Text> 
                        : optionCount == 3 ? <></> : <Text numberOfLines={1} style={style.addItemMain}> Another option</Text> }
                    </TouchableOpacity>}
                    {optionAndDataMapping.length > 0 && <TouchableOpacity
                        // onPress={() => optionCount < 3 && !addOption && (setOptionCount(optionCount+1),setAddOption(true))}
                        style={{
                        margin:15,
                        flexDirection: 'row',
                        alignSelf: 'flex-start',
                        justifyContent: 'center',
                        }}>
                            <Text numberOfLines={1} style={style.addItemMain}>Look Table</Text> 
                            <MaterialIcons name={'play-arrow'} size={18} color={'blue'} />
                    </TouchableOpacity>}
                </View>
            )
            }
        </View>
    )
}

export default RenderVariants;