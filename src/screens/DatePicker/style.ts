import colors from '@/utils/colors';
import { FONT_FAMILY } from '@/utils/constants';
import { StyleSheet } from 'react-native';

export default StyleSheet.create({
  container: {
    flex: 1,
    //backgroundColor: 'pink'
  },
  customContainer: {
    flex: 1,
    paddingHorizontal: 20,
    marginBottom:20
  },
  periodContainer: {
    flex: 1,
    backgroundColor: '#fff'
  },
  periodButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 15,
    paddingHorizontal: 20,
    marginTop: '5%'
  },
  wrapper: { 
    flexDirection: 'row', 
    alignItems: 'center' 
  },
  periodText: { fontFamily: 'AvenirLTStd-Book', fontSize: 16 },
  periodDot: { height: 10, width: 10, borderRadius: 5, backgroundColor: '#5773FF', marginLeft: 16 },
  customHeading: { fontSize: 18, fontFamily: 'AvenirLTStd-Book', marginTop: '5%' },
  customDatePicker: {
    height: 40,
    // width: Dimensions.get('window').width * 0.85,
    width: '100%',
    borderRadius: 20,
    marginTop: 10,
    borderWidth: 1,
    borderColor: '#D9D9D9',
    justifyContent: 'center'
  },
  customDateStyle: { marginLeft: 15, fontFamily: 'AvenirLTStd-Book' },
  buttonContainer: {
    backgroundColor: colors.PRIMARY_NORMAL,
    borderRadius: 50,
    justifyContent: 'center',
    alignItems: 'center',
    alignSelf: 'flex-end',
    paddingHorizontal: 20
  },
  buttonText: { 
    color: colors.WHITE, 
    fontFamily: FONT_FAMILY.bold, 
    margin: 10 
  }
});
