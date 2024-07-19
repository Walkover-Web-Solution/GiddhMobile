import useCustomTheme, { DefaultTheme } from "@/utils/theme";
import { Text, TextInput, TouchableOpacity, View } from "react-native";
import makeStyle from "./style";
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons'

const RenderGroupName = ({isGroupUniqueNameEdited,setIsGroupUniqueNameEdited,groupName,groupUniqueName,setGroupName,setGroupUniqueName,clearAll})=>{
    const {theme,styles} = useCustomTheme(makeStyle);
    const cleanText = (text:string)=> {
        const pattern = /[^a-zA-Z0-9]/g;
        return text.replace(pattern, '');
    }
    return (
        <View>
            <View style={[styles.checkboxContainer, {paddingTop: 14}]}>
                <View style={styles.checkboxContainer}>
                <MaterialCommunityIcons name='alphabetical-variant' color={DefaultTheme.colors.secondary} style={{margin: 16}} size={20} />
                <TextInput
                    placeholderTextColor={'#808080'}
                    placeholder={'Enter Group Name'}
                    returnKeyType={'done'}
                    value={groupName}
                    onChangeText={(text)=>{
                        setGroupName(text);
                        if(!isGroupUniqueNameEdited){
                            const uniqueName = cleanText(text);
                            setGroupUniqueName(uniqueName.toLowerCase());
                        }
                    }}
                    style={styles.textInput}
                />
                </View>
                <TouchableOpacity onPress={clearAll}>
                <Text style={styles.clearnBtnText}>Clear All</Text>
                </TouchableOpacity>
            </View>
            <View>
                <View style={styles.checkboxContainer}>
                <MaterialCommunityIcons name='alphabetical' color={DefaultTheme.colors.secondary} style={{margin: 16}} size={20} />
                <TextInput
                    placeholderTextColor={'#808080'}
                    placeholder={'Enter Unique Name'}
                    returnKeyType={'done'}
                    onChangeText={(text)=>{
                        setGroupUniqueName(text.toLowerCase());
                        setIsGroupUniqueNameEdited(true);
                    }}
                    value={groupUniqueName}
                    style={styles.textInput}
                />
                </View>
            </View>
        </View>
    );
}



export default RenderGroupName;