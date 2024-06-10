import useCustomTheme, { DefaultTheme } from "@/utils/theme";
import { Text, TextInput, TouchableOpacity, View } from "react-native";
import Icon from '@/core/components/custom-icon/custom-icon';
import makeStyle from "./style";

const RenderGroupName = ({isGroupUniqueNameEdited,setIsGroupUniqueNameEdited,groupName,groupUniqueName,setGroupName,setGroupUniqueName,clearAll})=>{
    const {theme,styles} = useCustomTheme(makeStyle);
    return (
        <View>
            <View style={[styles.checkboxContainer, {paddingTop: 14}]}>
                <View style={styles.checkboxContainer}>
                <Icon name={'Sections'} color={DefaultTheme.colors.secondary} style={{margin: 16}} size={16} />
                <TextInput
                    placeholderTextColor={'#808080'}
                    placeholder={'Enter Group Name'}
                    returnKeyType={'done'}
                    value={groupName}
                    onChangeText={(text)=>{
                        setGroupName(text);
                        if(!isGroupUniqueNameEdited){
                            setGroupUniqueName(text);
                        }
                    }}
                    style={styles.textInput}
                    // style={style.searchTextInputStyle}
                />
                </View>
                <TouchableOpacity onPress={clearAll}>
                <Text style={styles.clearnBtnText}>Clear All</Text>
                </TouchableOpacity>
            </View>
            <View>
                <View style={styles.checkboxContainer}>
                <Icon name={'Sections'} color={DefaultTheme.colors.secondary} style={{margin: 16}} size={16} />
                <TextInput
                    placeholderTextColor={'#808080'}
                    placeholder={'Enter Unique Name'}
                    returnKeyType={'done'}
                    onChangeText={(text)=>{
                        setGroupUniqueName(text);
                        setIsGroupUniqueNameEdited(true);
                    }}
                    value={groupUniqueName}
                    style={styles.textInput}
                    // onChangeText={(text) => this.setState({searchPartyName: text}, () => this.searchCalls())}
                    // style={style.searchTextInputStyle}
                />
                </View>
            </View>
        </View>
    );
}



export default RenderGroupName;