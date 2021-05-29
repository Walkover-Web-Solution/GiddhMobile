import { StyleSheet, Dimensions } from 'react-native';

const { height, width } = Dimensions.get('window');

export default StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff'
  },
  header: {
    height: height * 0.08,
    backgroundColor: '#229F5F',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20
  },
  title: {
    fontFamily: 'AvenirLTStd-Black',
    fontSize: 20,
    color: '#fff',
    marginLeft: 20
    // fontWeight: 'bold',
  },
  body: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-around'
  },
  row: {
    height: '100%',
    width: '30%'
    // backgroundColor: 'pink',
  },
  headingRow: {
    flexDirection: 'row',
    justifyContent: 'space-evenly'
  },
  heading: {
    color: '#808080',
    fontSize: 16,
    marginTop: 15,
    fontFamily: 'AvenirLTStd-Black',
    alignSelf: 'center'
  },
  currencyContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    height: height * 0.04,
    marginTop: 20,
    marginLeft: 10
    // backgroundColor: 'pink',
  },
  currency: {
    fontSize: 20,
    fontFamily: 'AvenirLTStd-Book',
    marginLeft: 10
  },
  TotalContainer: {
    height: height * 0.04,
    alignItems: 'flex-end',
    marginTop: 20
    // backgroundColor: 'pink',
  },
  button: {
    height: height * 0.06,
    width: width * 0.9,
    borderRadius: 25,
    backgroundColor: '#5773FF',
    justifyContent: 'center',
    alignItems: 'center',
    position: 'absolute',
    bottom: height * 0.01,
    alignSelf: 'center'
  },
  buttonText: {
    fontFamily: 'AvenirLTStd-Black',
    color: '#fff',
    fontSize: 20
  },
  grandTotal: {
    flexDirection: 'row',
    position: 'absolute',
    bottom: height * 0.09,
    right: width * 0.05
  },
  totalText: {
    fontFamily: 'AvenirLTStd-Book',
    fontSize: 20
  },
  totalAmt: {
    fontFamily: 'AvenirLTStd-Black',
    fontSize: 20
  }
});
