import React from 'react';
import { View, Text } from 'react-native';
const LastDataLoadedTime = (props: any) => {
    return (
        <View
            style={{
                paddingHorizontal: props.paddingHorizontal,
                width: '100%',
                justifyContent: 'center',
                alignItems: 'center',
            }}
        >
            <View style={{
                backgroundColor: props.text == 'Updated!' ? '#d4ffcf' : '#ededed',
                paddingHorizontal:15,
                paddingVertical:2,
                borderRadius:15
            }}>
                <Text style={{
                    fontSize: 13,
                    color: props.text == 'Updated!' ? '#32a125' : 'black'
                }}>{props.text}</Text>
            </View>
        </View>
    )
}

export default LastDataLoadedTime;