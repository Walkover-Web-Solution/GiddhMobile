import {StyleSheet} from 'react-native';

export default StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'pink',
  },
  customContainer: {
    flex: 1,
    backgroundColor: '#fff',
    paddingHorizontal: 20,
  },
  periodContainer: {
    flex: 1,
    backgroundColor: '#fff',
  },
  periodButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    // backgroundColor: 'pink',
    paddingVertical: 10,
    paddingHorizontal: 20,
    marginTop: '10%',
  },
  periodText: {fontFamily: 'AvenirLTStd-Black', fontSize: 16},
  periodDot: {height: 10, width: 10, borderRadius: 5, backgroundColor: '#5773FF'},
  customHeading: {fontSize: 18, fontFamily: 'AvenirLTStd-Black', marginTop: '5%'},
  customDatePicker: {
    height: 40,
    // width: Dimensions.get('window').width * 0.85,
    width: '100%',
    borderRadius: 20,
    marginTop: 10,
    borderWidth: 1,
    borderColor: '#D9D9D9',
    justifyContent: 'center',
  },
  customDateStyle: {marginLeft: 15, fontFamily: 'AvenirLTStd-Book'},
});
