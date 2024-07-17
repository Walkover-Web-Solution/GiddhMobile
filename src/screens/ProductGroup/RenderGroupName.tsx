import useCustomTheme, { DefaultTheme } from "@/utils/theme";
import { Text, TextInput, TouchableOpacity, View } from "react-native";
import makeStyle from "./style";
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons'
import InputField from "@/components/InputField";

const RenderGroupName = ({isGroupUniqueNameEdited,setIsGroupUniqueNameEdited,groupName,groupUniqueName,setGroupName,setGroupUniqueName,clearAll})=>{
    const {theme,styles} = useCustomTheme(makeStyle);
    const cleanText = (text:string)=> {
        const pattern = /[^a-zA-Z0-9]/g;
        return text.replace(pattern, '');
    }
    return (
        <View style={{marginHorizontal:16,paddingTop:5}}>
            <InputField
                lable="Enter Group Name"
                value={groupName}
                placeholderTextColor={'#808080'}
                onChangeText={(text)=>{
                    setGroupName(text);
                    if(!isGroupUniqueNameEdited){
                        const uniqueName = cleanText(text);
                        setGroupUniqueName(uniqueName.toLowerCase());
                    }
                }}
            />
            <InputField
                lable="Enter Unique Name"
                value={groupUniqueName}
                placeholderTextColor={'#808080'}
                onChangeText={(text)=>{
                    setGroupUniqueName(text.toLowerCase());
                    setIsGroupUniqueNameEdited(true);
                }}
            />
        </View>
    );
}



export default RenderGroupName;