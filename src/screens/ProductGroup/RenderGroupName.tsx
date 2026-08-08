import { View } from "react-native";
import InputField from "@/components/InputField";
import { useTranslation } from "react-i18next";

const RenderGroupName = ({isGroupUniqueNameEdited,setIsGroupUniqueNameEdited,groupName,groupUniqueName,setGroupName,setGroupUniqueName,clearAll,resetKey})=>{
    const { t } = useTranslation();
    const cleanText = (text:string)=> {
        const pattern = /[^a-zA-Z0-9]/g;
        return text.replace(pattern, '');
    }
    return (
        <View style={{marginHorizontal:16,paddingTop:5}}>
            <InputField
                lable={t('productGroup.enterGroupName')}
                value={groupName}
                resetKey={resetKey}
                containerStyle={{marginVertical:5}}
                placeholderTextColor={'#808080'}
                onChangeText={(text)=>{
                    setGroupName(text);
                    if(!isGroupUniqueNameEdited){
                        const uniqueName = cleanText(text);
                        setGroupUniqueName(uniqueName);
                    }
                }}
            />
            <InputField
                lable={t('productGroup.enterUniqueName')}
                value={groupUniqueName}
                resetKey={resetKey}
                containerStyle={{marginVertical:5}}
                placeholderTextColor={'#808080'}
                onChangeText={(text)=>{
                    setGroupUniqueName(text);
                    setIsGroupUniqueNameEdited(true);
                }}
            />
        </View>
    );
}



export default RenderGroupName;