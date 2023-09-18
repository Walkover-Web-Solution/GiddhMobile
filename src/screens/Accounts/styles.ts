import { Dimensions, Platform, StyleSheet } from 'react-native';
import { GD_ICON_SIZE } from '@/utils/constants';
import colors, { baseColor } from '@/utils/colors';
import { FONT_FAMILY, GD_FONT_SIZE } from '../../utils/constants';
const { height, width } = Dimensions.get('window');


export default StyleSheet.create({
    modalMobileContainer: {
        flex: 1,
        backgroundColor: "white",
        height: "100%",
        width: "100%",
        margin: 0,
        paddingTop: Platform.OS == "ios" ? 15 : 0
    },
    modalViewContainer: {
        flex: 1,
    },
    cancelButtonModal: {
        flexDirection: "row",
        alignItems: 'center',
        // justifyContent: 'space-between',
        marginHorizontal: 10,
    },
    cancelButtonTextModal: {
        padding: 5,
        justifyContent: "center",
        alignItems: "center",
    },
    switchView: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingHorizontal:10
    },
    switchButton: {
        padding: 8,
        flex: 2,
        alignSelf: 'center',
        alignItems: 'center',
        marginHorizontal: 5,
        borderWidth: 1,
        borderColor: '#000080',
        borderTopEndRadius: 17,
        borderTopLeftRadius: 17,
        borderBottomLeftRadius: 17,
    },
    groupButton:{
        padding:10,
        marginHorizontal:20,
        marginVertical:5,
        borderBottomWidth:1,
        borderBottomColor:'#EDEDED'
    },
    groupNameText:{
        fontFamily: 'AvenirLTStd-Book',
        fontSize:14
    }
});
