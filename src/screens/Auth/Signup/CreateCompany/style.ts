import { StyleSheet,Dimensions } from 'react-native';
import colors from '@/utils/colors';
import { FONT_FAMILY } from '../../../../utils/constants'
const Screen_height = Dimensions.get('window').height;
const Screen_width = Dimensions.get('window').width;
export default StyleSheet.create({
    container: {
        flex: 1,
        paddingHorizontal: 15,
        paddingVertical: 25,
        backgroundColor: '#fff',
    },
    Heading: {
        fontFamily: FONT_FAMILY.bold,
        fontSize: 20,
        color: colors.TEXT_NORMAL
    },
    text: {
        marginTop: 5,
        fontFamily: FONT_FAMILY.regular,
        fontSize: 13,
        color: colors.LABEL_COLOR
    },
    companyName: { 
        fontSize: 15, 
        marginHorizontal: 10,
        marginLeft:20,
        textAlignVertical: "center", 
        padding: 0, 
        width: "90%",
    },
    GSTInput: { 
        fontSize: 15, 
        marginHorizontal: 10,
        marginLeft:40,
        textAlignVertical: "center", 
        padding: 0, 
        width: "88%",
        color:'#1c1c1c', 
        fontFamily: 'AvenirLTStd-Book' 
    },
    modalContainer: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(0,0,0,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingBottom:20,
    paddingTop:20
},
centeredView: {
    flexDirection: 'column',
    width: Screen_width * 0.5,
    paddingVertical: 20,
    backgroundColor: '#fff',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1
    },
    alignSelf: 'center',
    borderRadius: 15,
    paddingHorizontal: 10,
  }
});
