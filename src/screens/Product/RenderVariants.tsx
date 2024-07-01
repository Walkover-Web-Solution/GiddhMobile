import { FONT_FAMILY, STORAGE_KEYS } from "@/utils/constants";
import useCustomTheme, { DefaultTheme } from "@/utils/theme";
import React, { useEffect, useState } from "react";
import { Alert, Dimensions, Pressable, ScrollView, Text, TextInput, ToastAndroid, TouchableOpacity, View } from "react-native";
import AntDesign from 'react-native-vector-icons/AntDesign';
import Icon from '@/core/components/custom-icon/custom-icon';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import Swipeable from 'react-native-gesture-handler/Swipeable';
import { element } from "prop-types";
import { values } from "lodash";
import { useNavigation } from "@react-navigation/native";
import Routes from "@/navigation/routes";
import { CustomFields, Variants, Warehouse } from "./ProductScreen";
import AsyncStorage from "@react-native-community/async-storage";
import Icons from 'react-native-vector-icons/MaterialCommunityIcons';
import { useSelector } from "react-redux";
import makeStyles from "./style";
const RenderVariants = ({setVariantsChecked,handleGlobalInputChange,unit,globalData,subUnits,purchaseAccount,salesAccount,variantCustomFields})=>{
    const {theme,styles} = useCustomTheme(makeStyles);
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
    const [variantCombination, setVariantCombination] = useState([]);
    const [warehouseDetails, setWarehouseDetails] = useState({ wareHouseName: '', wareHouseUniqueName: '' });
    const navigation = useNavigation();
    useEffect(() => {
        if (fields.length === 0 || fields[fields.length - 1].value !== '') {
            setFields([...fields, { id: Date.now(), value: '' }]);
        }
    }, [fields]);


    useEffect(()=>{
        let tempOptionArray = [];
        optionIds.forEach((item)=>{
            tempOptionArray.push(optionAndDataMapping?.[item])
        })
        const combinations = generateCombinations(tempOptionArray);
        const allVariantsObjects = combinations.map((item)=>{
            const name = item.map(subItem => subItem.value).join(' / ');
            const wareHouseDetails:Warehouse = {
                warehouse: {
                    name: warehouseDetails?.wareHouseName,
                    uniqueName: warehouseDetails?.wareHouseUniqueName
                  },
                  stockUnit: {
                    name: unit?.name,
                    uniqueName: unit?.uniqueName
                  },
                  openingQuantity: 0,
                  openingAmount: 0
            } 
            const customFieldsArr : CustomFields[] = globalData?.customFields ? globalData?.customFields : [] 
            const variantObj:Variants = {
                name: name,
                archive: false,
                skuCode: globalData?.skuCode ? globalData?.skuCode : '',
                salesTaxInclusive: globalData?.salesMRPChecked != undefined ? globalData?.salesMRPChecked : false,
                purchaseTaxInclusive: globalData?.purchaseMRPChecked != undefined ? globalData?.purchaseMRPChecked : false,
                fixedAssetTaxInclusive: false,
                customFields: customFieldsArr,
                warehouseBalance: [wareHouseDetails],
                unitRates: [],
            }

            return variantObj;
        })
        handleGlobalInputChange('variants',allVariantsObjects);
        
        setVariantCombination(combinations);
    },[optionIds,optionAndDataMapping,unit])

    useEffect(()=>{
        if(optionCount == 0 ){
            setVariantsChecked(false);
            handleGlobalInputChange('variantsCreated',false)
        }
    },[optionCount])

    const {branchList} = useSelector((state)=>({
        branchList:state?.commonReducer?.branchList
    }))

    const getWareHouseDetails = async (branchList) => {
        const activeBranchUniqueName = await AsyncStorage.getItem(STORAGE_KEYS.activeBranchUniqueName);
        const selectedBranch = branchList.filter((item) => item?.uniqueName === activeBranchUniqueName);
        const { warehouseResource } = selectedBranch?.[0];
        const defaultWareHouse = warehouseResource?.filter((item) => item?.isDefault === true);
        const { name: wareHouseName, uniqueName: wareHouseUniqueName } = defaultWareHouse?.[0] || {};
    
        return { wareHouseName, wareHouseUniqueName };
    };

    useEffect(() => {
        const fetchWareHouseDetails = async () => {
            const details = await getWareHouseDetails(branchList);
            setWarehouseDetails(details);
        };

        fetchWareHouseDetails();
    }, [branchList]);


    const handleUniqueName = (optionname) =>{
        setOptionName(optionname);
        if(typingTimeout){
            clearTimeout(typingTimeout);
        }
        setTypingTimeout(setTimeout(()=>{
            if(optionAndDataMapping?.[optionname]){
                ToastAndroid.show("Duplicate option name found!.",ToastAndroid.LONG);
            }
        },1000))
    }

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
        }, 500));
    };

    const handleDeleteField = (id) => {
        setFields(fields.filter(field => field.id !== id));
    };

    const handleDeleteOption = (id) => {
        const optionArr = optionIds.filter((item)=>item !== id);
        setOptionIds(optionArr);
        const map = {...optionAndDataMapping};
        delete map?.[id];
        const filterGlobalOptionArr = globalData?.options?.filter((item)=>item?.name!==id);
        handleGlobalInputChange('options',filterGlobalOptionArr);
        setOptionAndDataMapping(map);
        setAddOption(false);
        setOptionCount(optionCount-1);
        
    }

    const handleEditOptoins = (id)=>{
        setEditingOptionId(id);
    }

    const addOptionToMap = ()=>{
        const removedEmptyFields = fields.filter((item)=>item.value !== "");
        if(removedEmptyFields.length == 0){
            ToastAndroid.show("No option field added!",ToastAndroid.LONG);
            setAddOption(false);
            setOptionCount(optionCount-1);
            return ;
        }
        if(optionAndDataMapping?.[optionName]){
            ToastAndroid.show("Option name must be unique",ToastAndroid.LONG);
            setAddOption(false);
            setOptionCount(optionCount-1);
            return ;
        }
        const objectMapping = {
            ...optionAndDataMapping,
            [optionName] : removedEmptyFields
        }
        const optionIdArr = [...optionIds, optionName];
        setOptionIds(optionIdArr);
        setOptionAndDataMapping(objectMapping)
        let valuesName :string[] = [];
        removedEmptyFields.map((item)=>{
            valuesName.push(item?.value);
        })
        const optionObj = {
            name:optionName,
            order: optionIds.length + 1,
            values: valuesName
        }
        let tempOptionsArr :any = [];
        if(globalData?.options){
            tempOptionsArr = [...globalData?.options,optionObj]
        }else{
            tempOptionsArr = [optionObj]
        }
        handleGlobalInputChange('options',tempOptionsArr);
        
    }


    //for gesture edit and delete options
    // const renderRightAction = (item)=> {
    //     return (
    //       <TouchableOpacity
    //         onPress={() => {handleDeleteOption(item)}}
    //         style={styles.animatedView}>
    //         <MaterialIcons name={'delete'} size={18} color={'red'} />
    //         <Text style={styles.deleteText}>Delete</Text>
    //       </TouchableOpacity>
    //     );
    //   }

    // const renderLeftAction = (item)=>{
    //     return (
    //         <TouchableOpacity
    //           onPress={() => {handleEditOptoins(item)}}
    //           style={styles.animatedView}>
    //           <MaterialIcons name={'edit'} size={18} color={'green'} />
    //           <Text style={styles.editText}>Edit</Text>
    //         </TouchableOpacity>
    //       );
    // }

    const generateCombinations =(boxes)=> {
        let combinations:any = [];
    
        const getCombinations=(...arrays)=> {
            if (arrays.length === 0) return [[]];
            const [first, ...rest] = arrays;
            const restCombinations = getCombinations(...rest);
            return first.flatMap(item => restCombinations.map(comb => [item, ...comb]));
        }
    
        if (boxes.length > 0) {
            combinations.push(...getCombinations(...boxes));
        }
        
        return combinations;
    }


    const RenderEditOptionFields = ({fields,optionName,setFields,setOptionIds,optionIds,setOptionAndDataMapping,optionAndDataMapping,setAddOption,setEditingOptionId})=>{
        const [localFields, setLocalFields] = useState([...fields,{ id: Date.now(), value: '' }]);
        const [localOptionName,setLocalOptionName] = useState(optionName);
        const [typingTimeout, setTypingTimeout] = useState<NodeJS.Timeout | null>(null);
        useEffect(() => {
            if (localFields.length === 0 || localFields[localFields.length - 1].value !== '') {
                setLocalFields([...localFields, { id: Date.now(), value: '' }]);
            }
          }, [localFields]);

        const handleUniqueName = (optionname) =>{
            setLocalOptionName(optionname);
            if(typingTimeout){
                clearTimeout(typingTimeout);
            }
            setTypingTimeout(setTimeout(()=>{
                if(optionAndDataMapping?.[optionname]){
                    ToastAndroid.show("Option already exists found!.",ToastAndroid.LONG);
                    setLocalOptionName(optionName);
                }
            },1000))
        }

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
            }, 500));
            
        };

        const handleDeleteField = (id: number) => {
            if(localFields.length == 1){
                handleDeleteOption(optionName);
            }else{
                setLocalFields(localFields.filter(field => field.id !== id));
            }

        };

        const updateGlobalOptions = () => {
            const removedEmptyFields = localFields.filter((item)=>item.value !== "");
            let valuesName :string[] = [];
            removedEmptyFields.map((item)=>{
                valuesName.push(item?.value);
            })
            const optionObj = globalData?.options
            const updatedOptionObj = optionObj.map(item =>{
                if(item?.name === optionName){
                    return {
                        ...item,
                        name:localOptionName,
                        values: valuesName
                    }
                }else{
                    return item
                }
            })
            handleGlobalInputChange('options',updatedOptionObj);
        }

        const handleSave = () => {
            const removedEmptyFields = localFields?.filter((item)=>item.value!== "");
            if(removedEmptyFields.length == 0 ){
                handleDeleteOption(optionName);
            }
            setFields(removedEmptyFields);

            if(localOptionName.length == 0 ){
                ToastAndroid.show("Option name can't be empty",ToastAndroid.LONG);
                return ;
            }
            
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
                    [localOptionName] : removedEmptyFields
                };
                delete tempMapping?.[optionName];
                setOptionAndDataMapping(tempMapping);
            }else{
                const tempMapping  = {...optionAndDataMapping}
                tempMapping[optionName] = removedEmptyFields;
                setOptionAndDataMapping(tempMapping);
            }
            updateGlobalOptions();
            setAddOption(false);
            setFields([{ id: Date.now(), value: '' }])
            setEditingOptionId(null);
        };
        
        return (
            <View style={{padding:15, maxHeight:580*localFields?.length}}>
                <View style={styles.inputRow}>
                    <TextInput
                        returnKeyType={'done'}
                        onChangeText={(val) => {
                            handleUniqueName(val)
                        }}
                        placeholderTextColor={'rgba(80,80,80,0.5)'}
                        placeholder="Option Name"
                        value={localOptionName}
                        style={[styles.buttonWrapper ,styles.inputView ]} 
                    />
                    <TouchableOpacity style={{padding:10}} 
                    onPress={() =>{
                        Alert.alert(
                        'Confirmation',
                        'Deleting the option will also remove all the variants of the option. Do you still want to delete the option?',
                        [
                        {
                            text: 'No',
                            style: 'cancel'
                        },
                        {
                            text: 'Yes',
                            onPress: () => handleDeleteOption(optionName)
                        }
                        ])}
                    }>
                        <MaterialIcons name={'delete'} size={20} color={'#808080'} />
                    </TouchableOpacity>
                </View>
                <Text style={styles.optionTitle} >Option Values</Text> 
                {localFields?.map((field, index) => (
                    <View key={index} style={styles.inputRow}>
                        <TextInput
                            value={field.value}
                            placeholderTextColor={'rgba(80,80,80,0.5)'}
                            onChangeText={(text) => handleInputChange(field.id, text)}
                            style={[styles.buttonWrapper, styles.inputView] } 
                            placeholder={`Option ${index + 1}`}
                        />
                        {localFields.length > 1 && (
                            <TouchableOpacity style={{padding:10}} onPress={() => handleDeleteField(field.id)} >
                                <MaterialIcons name={'delete'} size={18} color={'#808080'} />
                                
                            </TouchableOpacity>
                        )}
                    </View>
                ))}  
                <TouchableOpacity
                    style={styles.doneBtn}
                    onPress={handleSave}
                    >
                    <Text
                    style={styles.doneBtnText}>
                    Done
                    </Text>
                </TouchableOpacity>
            </View>
        );
    }

    const RenderOptionCards = ({fields,optionName})=>{
        const [showDropDown, setShowDropDown] = useState(false);
        return (
            // <Swipeable 
            // renderRightActions={()=>renderRightAction(optionName)}
            // renderLeftActions={()=>renderLeftAction(optionName)}
            // >
            <Pressable style={styles.optionCardContainer} onPress={()=>setShowDropDown(!showDropDown)}>
                <View style={styles.inputRow}> 
                    <Text style={styles.optionHeadingText}>{optionName}</Text>
                    <Pressable style={{padding:10}} onPress={() => {
                        setShowDropDown(!showDropDown);
                        }}
                    >
                        <Icon
                        style={{ transform: [{ rotate: showDropDown ? '180deg' : '0deg' }] }}
                        name={'9'}
                        size={16}
                        color="#808080"
                        />
                    </Pressable>
                </View>
                {showDropDown && <View 
                style={styles.variantCard}>
                    {fields?.map((item)=><TouchableOpacity onPress={()=>handleEditOptoins(optionName)} key={item?.id} style={styles.variantCardText} ><Text style={{fontFamily:theme.typography.fontFamily.semiBold}}>{item?.value}</Text></TouchableOpacity>
                    )}
                </View>}
            </Pressable>
            // </Swipeable>
        );
    }

    const Button = ()=>{
        return (
            <TouchableOpacity
                style={styles.doneBtn}
                onPress={() => {
                    addOptionToMap(),
                    setAddOption(false),
                    setFields([{ id: Date.now(), value: '' }])
                }}
                >
                <Text
                style={styles.doneBtnText}>
                Done
                </Text>
            </TouchableOpacity>
        )
    }


    return (
        <View>
            <Pressable style={styles.dropDownView}  onPress={() => {
                setExpandAcc(!expandAcc);
                }}>
                <View style={styles.checkboxContainer} >
                    <Icons name='plus-circle-multiple' size={17} color={DefaultTheme.colors.secondary} />
                    <Text style={[styles.radiobuttonText,{fontFamily: theme.typography.fontFamily.semiBold}]}>Variant</Text>
                </View>
                <Pressable style={{padding:9}} onPress={() => {
                    setExpandAcc(!expandAcc);
                    }}>
                <Icon
                    style={{ transform: [{ rotate: expandAcc ? '180deg' : '0deg' }] }}
                    name={'9'}
                    size={16}
                    color="#808080"
                />
                </Pressable>
            </Pressable>
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
                        <View style={styles.inputRow}>
                            <TextInput
                                returnKeyType={'done'}
                                onChangeText={(val) => {
                                    handleUniqueName(val);
                                }}
                                placeholderTextColor={'rgba(80,80,80,0.5)'}
                                placeholder="Option Name"
                                style={[styles.buttonWrapper, styles.inputView] } 
                            />
                            <TouchableOpacity style={{padding:10}} onPress={() =>{
                                Alert.alert(
                                'Confirmation',
                                'Deleting the option will also remove all the variants of the option. Do you still want to delete the option?',
                                [
                                {
                                    text: 'No',
                                    style: 'cancel'
                                },
                                {
                                    text: 'Yes',
                                    onPress: () => {
                                        setAddOption(false) ,
                                        setOptionCount(optionCount-1),
                                        setFields([{ id: Date.now(), value: '' }])
                                    }
                                }
                                ]
                            )}} >
                                <MaterialIcons name={'delete'} size={20} color={'#808080'} />
                            </TouchableOpacity>
                        </View>
                        <Text style={styles.optionTitle} >Option Values</Text> 
                        {fields.map((field, index) => (
                            <View key={field.id} style={styles.inputRow}>
                                <TextInput
                                    value={field.value}
                                    placeholderTextColor={'rgba(80,80,80,0.5)'}
                                    onChangeText={(text) => handleInputChange(field.id, text)}
                                    style={[styles.buttonWrapper, styles.inputView]} 
                                    placeholder={`Option ${index + 1}`}
                                />
                                {fields.length > 1 && (
                                    <TouchableOpacity style={{padding:10}} onPress={() => handleDeleteField(field.id)} >
                                        <MaterialIcons name={'delete'} size={18} color={'#808080'} />
                                    </TouchableOpacity>
                                )}
                            </View>
                        ))}  
                        <Button />
                    </View>
                    }
                    {optionCount < 3 && <TouchableOpacity
                        onPress={() => optionCount < 3 && !addOption && (setOptionCount(optionCount+1),setAddOption(true),setVariantsChecked(true),handleGlobalInputChange('variantsCreated',true))}
                        style={styles.variantHeading}>
                        <AntDesign name={'plus'} color={'#084EAD'} size={18} style={{ marginHorizontal: 8 }} />
                        {optionCount == 0 
                        ? <Text numberOfLines={1} style={styles.addItemMain}> Add options like multiple size or colours etc...</Text> 
                        : optionCount == 3 ? <></> : <Text numberOfLines={1} style={styles.addItemMain}> Another option</Text> }
                    </TouchableOpacity>}
                    {optionIds.length > 0 && <View>
                    <TouchableOpacity
                        onPress={()=>{
                            navigation.navigate(Routes.VariantTableScreen,{variantCombination,handleGlobalInputChange,globalData,unit,subUnits,purchaseAccount,salesAccount,variantCustomFields});
                        }}
                        style={styles.tableText}>
                        <Text numberOfLines={1} style={styles.addItemMain}>Look Table</Text> 
                        <MaterialIcons name={'play-arrow'} size={18} color={'blue'} />
                    </TouchableOpacity>
                    </View>}
                </View>
            )
            }
        </View>
    )
}

export default React.memo(RenderVariants);