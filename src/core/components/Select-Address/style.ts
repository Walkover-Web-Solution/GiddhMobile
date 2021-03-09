import {StyleSheet, Platform, Dimensions} from 'react-native';

const {height, width} = Dimensions.get('window');

export default StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    height: height * 0.08,
    backgroundColor: '#229F5F',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  title: {
    fontFamily: 'AvenirLTStd-Black',
    fontSize: 20,
    color: '#fff',
    marginLeft: 20,
    // fontWeight: 'bold',
  },
  edit: {
    fontFamily: 'AvenirLTStd-Book',
    fontSize: 20,
    color: '#fff',
    // marginLeft: 20,
  },
  editButton: {
    position: 'absolute',
    right: 20,
    alignSelf: 'center',
  },
  body: {
    height: height * 0.8,
    // backgroundColor: 'pink',
  },
  button: {
    height: height * 0.06,
    width: width * 0.9,
    borderRadius: 25,
    backgroundColor: '#5773FF',
    justifyContent: 'center',
    alignItems: 'center',
    alignSelf: 'center',
    position: 'absolute',
    bottom: height * 0.01,
  },
  buttonText: {
    fontFamily: 'AvenirLTStd-Black',
    color: '#fff',
    fontSize: 20,
  },
});
