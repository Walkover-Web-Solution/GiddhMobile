import { DefaultTheme } from "@/utils/theme";
import { Text, TextInput, TouchableOpacity, View } from "react-native";
import Icon from '@/core/components/custom-icon/custom-icon';

const RenderGroupName = ({isGroupUniqueNameEdited,setIsGroupUniqueNameEdited,groupName,groupUniqueName,setGroupName,setGroupUniqueName,clearAll})=>{
    return (
        <View>
            <View style={{flexDirection: 'row', minHeight: 50, alignItems: 'center', paddingTop: 14}}>
                <View style={{flexDirection: 'row', alignItems: 'center', flex: 1}}>
                <Icon name={'Sections'} color={DefaultTheme.colors.secondary} style={{margin: 16}} size={16} />
                <TextInput
                    placeholderTextColor={'#808080'}
                    placeholder={'Enter Group Name*'}
                    returnKeyType={'done'}
                    required
                    value={groupName}
                    onChangeText={(text)=>{
                        setGroupName(text);
                        if(!isGroupUniqueNameEdited){
                            setGroupUniqueName(text);
                        }
                    }}
                    // style={style.searchTextInputStyle}
                />
                </View>
                <TouchableOpacity onPress={clearAll}>
                <Text style={{color: '#1C1C1C', marginRight: 16, fontFamily: 'AvenirLTStd-Book'}}>Clear All</Text>
                </TouchableOpacity>
            </View>
            <View>
                <View style={{flexDirection: 'row', alignItems: 'center', flex: 1}}>
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
                    // onChangeText={(text) => this.setState({searchPartyName: text}, () => this.searchCalls())}
                    // style={style.searchTextInputStyle}
                />
                </View>
            </View>
        </View>
    );
}



export default RenderGroupName;