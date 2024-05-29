import { FONT_FAMILY } from "@/utils/constants";
import { DefaultTheme } from "@/utils/theme";
import { useEffect, useState } from "react";
import { Dimensions, ScrollView, Text, TextInput, ToastAndroid, TouchableOpacity, View } from "react-native";
import AntDesign from 'react-native-vector-icons/AntDesign';
import Icon from '@/core/components/custom-icon/custom-icon';
import style from "./style";
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import Swipeable from 'react-native-gesture-handler/Swipeable';
import { element } from "prop-types";
import { values } from "lodash";
const RenderVariants = ()=>{
    const [expandAcc, setExpandAcc] = useState(false);
    const [optionCount,setOptionCount] = useState(0);
    const [addOption,setAddOption] = useState(false);
    const [fields, setFields] = useState([{ id: Date.now(), value: '' }]);
    const [typingTimeout, setTypingTimeout] = useState<NodeJS.Timeout | null>(null);
    const [optionName,setOptionName] = useState('');
    const {height,width} = Dimensions.get('window')
    const [optionIds,setOptionIds]= useState<string[]>([]);
    const [optionAndDataMapping,setOptionAndDataMapping]:any = useState({});
    const [editingOptionId,setEditingOptionId] = useState<string | null>(null); 
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

    const handleDeleteOption = (id) => {
        const optionArr = optionIds.filter((item)=>item !== id);
        setOptionIds(optionArr);
        const map = {...optionAndDataMapping};
        delete map?.[id];
        setOptionAndDataMapping(map);
        setAddOption(false);
        setOptionCount(optionCount-1);

    }

    const handleEditOptoins = (id)=>{
        setEditingOptionId(id);
    }

    const addOptionToMap = ()=>{
        const objectMapping = {
            ...optionAndDataMapping,
            [optionName] : fields
        }
        const optionIdArr = [...optionIds, optionName];
        setOptionIds(optionIdArr);
        setOptionAndDataMapping(objectMapping)
    }

    const renderRightAction = (item)=> {
        return (
          <TouchableOpacity
            onPress={() => {handleDeleteOption(item)}}
            style={{ flexDirection: 'row', justifyContent: 'center', alignItems: 'center', paddingHorizontal: 20 }}>
            <MaterialIcons name={'delete'} size={18} color={'red'} />
            <Text style={{ color: '#E04646', marginLeft: 10 }}>Delete</Text>
          </TouchableOpacity>
        );
      }

    const renderLeftAction = (item)=>{
        return (
            <TouchableOpacity
              onPress={() => {handleEditOptoins(item)}}
              style={{ flexDirection: 'row', justifyContent: 'center', alignItems: 'center', paddingHorizontal: 20 }}>
              <MaterialIcons name={'edit'} size={18} color={'green'} />
              <Text style={{ color: 'green', marginLeft: 10 }}>Edit</Text>
            </TouchableOpacity>
          );
    }


    const RenderEditOptionFields = ({fields,optionName,setFields,setOptionIds,optionIds,setOptionAndDataMapping,optionAndDataMapping,setAddOption,setEditingOptionId})=>{
        const [localFields, setLocalFields] = useState(fields);
        const [localOptionName,setLocalOptionName] = useState(optionName);
        const [typingTimeout, setTypingTimeout] = useState<NodeJS.Timeout | null>(null);
        useEffect(() => {
            setLocalFields(fields);
          }, [fields]);

        
        const handleInputChange = (id: number, value: string) => {
            setLocalFields(localFields.map(field => field.id === id ? { ...field, value } : field));
            
            if (typingTimeout) {
                clearTimeout(typingTimeout);
            }
            
            setTypingTimeout(setTimeout(() => {
                const isDuplicate = localFields.some(field => field.value === value && field.id !== id);
                if (isDuplicate) {
                    ToastAndroid.show("Duplicate Value, This value already exists.",ToastAndroid.LONG);
                    setLocalFields(localFields.map(field => field.id === id ? { ...field, value: '' } : field));
                }
            }, 1000));
            
        };

        const handleDeleteField = (id: number) => {
            if(localFields.length == 2){
                handleDeleteOption(optionName);
            }else{
                setLocalFields(localFields.filter(field => field.id !== id));
            }

        };

        const handleSave = () => {
            // const valuesSet = new Set(localFields.map(field => field.value));
            // if (valuesSet.size !== localFields.length) {
            //   ToastAndroid.show("Duplicate Value, One or more values are duplicated.",ToastAndroid.LONG);
            //   return;
            // }
            
            setFields(localFields);
            if(optionName !== localOptionName){
                const tempOptionIds = [...optionIds];
                for(let i=0;i<tempOptionIds.length;i++){
                    if(tempOptionIds?.[i] === optionName){
                        tempOptionIds[i] = localOptionName;
                        break;
                    }
                }
                setOptionIds(tempOptionIds);
                const tempMapping = {...optionAndDataMapping,
                    [localOptionName] : localFields
                };
                delete tempMapping?.[optionName];
                setOptionAndDataMapping(tempMapping);
            }else{
                const tempMapping  = {...optionAndDataMapping}
                tempMapping[optionName] = localFields;
                setOptionAndDataMapping(tempMapping);
            }
            setAddOption(false);
            setFields([{ id: Date.now(), value: '' }])
            setEditingOptionId(null);

        };
        console.log("local fields",localFields);
        return (
            <View style={{padding:15, maxHeight:580*localFields?.length}}>
                <View style={{flexDirection:'row',alignItems:'center',justifyContent:'space-between'}}>
                    <TextInput
                        returnKeyType={'done'}
                        onChangeText={(val) => {
                            setLocalOptionName(val)
                            // setOptionName(val);
                            // setRate(val);
                            // linkedAccountText === "Linked Purchase Accounts" ? handleRateChange('purchaseRate',val) : handleRateChange('salesRate',val)
                        }}
                        placeholderTextColor={'rgba(80,80,80,0.5)'}
                        // value={this.state.openingBalance}
                        placeholder="Option Name"
                        value={localOptionName}
                        style={{ ...style.buttonWrapper, borderWidth: 1, borderColor: '#d9d9d9',width:'90%',padding: 10, marginTop: 5, fontFamily: 'AvenirLTStd-Book' }} 
                    />
                    <TouchableOpacity onPress={() =>{handleDeleteOption(optionName)}} >
                        <MaterialIcons name={'delete'} size={20} color={'#808080'} />
                    </TouchableOpacity>
                </View>
                <Text style={{ color: '#1c1c1c', paddingRight: 5, marginTop: 10, fontFamily: 'AvenirLTStd-Book' }} >Option Values</Text> 
                {localFields.slice(0,localFields.length-1).map((field, index) => (
                    <View key={localFields.value} style={{flexDirection:'row',alignItems:'center',justifyContent:'space-between'}}>
                        <TextInput
                            // style={styles.input}
                            value={field.value}
                            placeholderTextColor={'rgba(80,80,80,0.5)'}
                            onChangeText={(text) => handleInputChange(field.id, text)}
                            style={{ ...style.buttonWrapper, borderWidth: 1, borderColor: '#d9d9d9',width:'90%',padding: 10, marginTop: 5, fontFamily: 'AvenirLTStd-Book' }} 
                            placeholder={`Option ${index + 1}`}
                        />
                        {localFields.length > 1 && (
                            <TouchableOpacity onPress={() => handleDeleteField(field.id)} >
                                <MaterialIcons name={'delete'} size={18} color={'#808080'} />
                                
                            </TouchableOpacity>
                        )}
                    </View>
                ))}  
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
                onPress={handleSave}
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
            </View>
        );
    }

    const RenderOptionCards = ({fields,optionName})=>{
        console.log("option",optionName,"---->",fields);
        const [showDropDown, setShowDropDown] = useState(false);
        return (
            <Swipeable 
            renderRightActions={()=>renderRightAction(optionName)}
            renderLeftActions={()=>renderLeftAction(optionName)}
            >
            <View style={{backgroundColor: '#f2f8fb',flexDirection:'column', padding: 10, borderRadius: 2, marginVertical: 3,marginHorizontal:8 }}>
                <View style={{flexDirection:'row',justifyContent: 'space-between',alignItems:'center',borderWidth:0,paddingHorizontal:7}}> 
                    <Text style={{ fontWeight:'bold' }}>{optionName}</Text>
                    <Icon
                    style={{ transform: [{ rotate: showDropDown ? '180deg' : '0deg' }] }}
                    name={'9'}
                    size={16}
                    color="#808080"
                    onPress={() => {
                    setShowDropDown(!showDropDown);
                    }}
                />
                </View>
                {showDropDown && <View 
                style={{flexDirection:'row',flexWrap:'wrap'}}>
                    {fields?.slice(0,fields?.length-1)?.map((item)=><View key={item?.id} style={{ backgroundColor: '#fff',margin: 5,borderColor: '#D9D9D9', borderRadius: 7,borderWidth: 1.2,padding: 5, paddingHorizontal:8, marginTop: 5 }} ><Text>{item?.value}</Text></View>
                    )}
                </View>}
                {/* <View style={{width: '10%',alignItems:'center',justifyContent:'space-between' ,flexDirection:'column',paddingVertical:3 }}>
                    <TouchableOpacity onPress={()=>{
                        handleEditOptoins(optionName);
                    }}>
                        <MaterialIcons name={'edit'} size={18} color={'#808080'} />
                    </TouchableOpacity>
                    <TouchableOpacity onPress={()=>handleDeleteOption(optionName)}>
                        <MaterialIcons name={'delete'} size={18} color={'#808080'} />
                    </TouchableOpacity>
                </View> */}
            </View>
            </Swipeable>
        );
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
                onPress={()=>{
                    // if(editingOptionId){

                    // }else{
                    addOptionToMap(),
                    setAddOption(false),
                    setFields([{ id: Date.now(), value: '' }])
            }}
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
                <View style={{maxHeight:1200*fields.length}}>
                    {optionIds.length > 0 
                        ? optionIds.map(element => (editingOptionId === element 
                            ? <RenderEditOptionFields 
                                key={element} 
                                fields={optionAndDataMapping?.[editingOptionId]} 
                                optionName = {editingOptionId}
                                setFields={setFields}
                                setOptionIds={setOptionIds}
                                optionIds={optionIds}
                                setOptionAndDataMapping={setOptionAndDataMapping}
                                optionAndDataMapping={optionAndDataMapping}
                                setAddOption={setAddOption}
                                setEditingOptionId={setEditingOptionId}
                            />
                            : <RenderOptionCards key={element} fields={optionAndDataMapping?.[element]} optionName={element}/>)) 
                        : <></>
                    }
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
                            <TouchableOpacity onPress={() =>{setAddOption(false) ,setOptionCount(optionCount-1)}} >
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
                    </View>
                    }
                    {optionCount < 3 && <TouchableOpacity
                        onPress={() => optionCount < 3 && !addOption && (setOptionCount(optionCount+1),setAddOption(true))}
                        style={{
                        marginVertical: 16,
                        paddingVertical: 10,
                        flexDirection: 'row',
                        alignSelf: 'flex-start',
                        justifyContent: 'center',
                        }}>
                        <AntDesign name={'plus'} color={'blue'} size={18} style={{ marginHorizontal: 8 }} />
                        {optionCount == 0 
                        ? <Text numberOfLines={1} style={style.addItemMain}> Add options like multiple size or colours etc...</Text> 
                        : optionCount == 3 ? <></> : <Text numberOfLines={1} style={style.addItemMain}> Another option</Text> }
                    </TouchableOpacity>}
                    {optionIds.length > 0 && <TouchableOpacity
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