import { useState } from "react";
import { Text, TextInput, TouchableOpacity, View } from "react-native";

const RenderRadioBtn = ({codeNumber,selectedCode,setSelectedCode,setCodeNumber})=>{

    return (
        <View
            style={{
            flexDirection: 'row',
            // backgroundColor: 'pink',
            justifyContent: 'space-between',
            marginVertical: 10,
            alignItems: 'center',
            }}>
            <View>
            <View style={{ flexDirection: 'row', alignItems: 'center', marginLeft: 16, marginTop: 10 }}>
                <TouchableOpacity
                style={{
                    height: 20,
                    width: 20,
                    borderRadius: 10,
                    backgroundColor: '#c4c4c4',
                    justifyContent: 'center',
                    alignItems: 'center',
                }}
                onPress={() => setSelectedCode('hsn')}
                >
                {selectedCode == 'hsn' && (
                    <View style={{ height: 14, width: 14, borderRadius: 7, backgroundColor: '#229F5F' }} />
                )}
                </TouchableOpacity>

                <Text style={{ marginLeft: 10 }}>HSN Code</Text>
            </View>
            <View style={{ flexDirection: 'row', alignItems: 'center', marginLeft: 16, marginTop: 15 }}>
                <TouchableOpacity
                style={{
                    height: 20,
                    width: 20,
                    borderRadius: 10,
                    backgroundColor: '#c4c4c4',
                    justifyContent: 'center',
                    alignItems: 'center',
                }}
                onPress={() => setSelectedCode('sac')}>
                {selectedCode == 'sac' && (
                    <View style={{ height: 14, width: 14, borderRadius: 7, backgroundColor: '#229F5F' }} />
                )}
                </TouchableOpacity>

                <Text style={{ marginLeft: 10 }}>SAC Code</Text>
            </View>
            </View>
            <TextInput
            placeholder={ selectedCode=='hsn'?'Enter HSN Code':'Enter SAC Code'}
            placeholderTextColor={'#808080'}
            // value={
            //     this.state.selectedCode == 'hsn'
            //     ? this.state.editItemDetails.hsnNumber
            //     : this.state.editItemDetails.sacNumber
            // }
            value={codeNumber}
            keyboardType={'number-pad'}
            style={{ borderColor: '#D9D9D9', borderBottomWidth: 1, width: '55%', marginRight: 16 }}
            // editable={false}
            onChangeText={(text)=>{
                setCodeNumber(text);
            }}
            // onChangeText={(text) => {
            //     const item = this.state.editItemDetails;
            //     if (this.state.selectedCode == 'hsn') {
            //     item.hsnNumber = text;
            //     this.setState({ editItemDetails: item });
            //     } else {
            //     item.sacNumber = text;
            //     this.setState({ editItemDetails: item });
            //     }
            // }}
            />
        </View>
    )
}

export default RenderRadioBtn;