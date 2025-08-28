import { StyleSheet, Dimensions,Platform } from 'react-native';

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
  edit: {
    fontFamily: 'AvenirLTStd-Book',
    fontSize: 20,
    color: '#fff'
    // marginLeft: 20,
  },
  editButton: {
    position: 'absolute',
    right: 20,
    alignSelf: 'center'
  },
  body: {
    height: height * 0.8,
    //flex:1,
    paddingHorizontal: 20,
    marginBottom: 20
  },
  button: {
    height: height * 0.06,
    width: width * 0.9,
    borderRadius: 25,
    backgroundColor: '#5773FF',
    justifyContent: 'center',
    alignItems: 'center',
    alignSelf: 'center',
    bottom: 0
  },
  buttonText: {
    fontFamily: 'AvenirLTStd-Black',
    color: '#fff',
    fontSize: 20
  },
  BSContainer: {
    backgroundColor: 'transparent',
    width: '100%',
    height: '100%',
    position: 'absolute',
    justifyContent: 'flex-end'
  },
  BMinnerContainer: {
    borderTopLeftRadius: 10,
    borderTopRightRadius: 10,
    backgroundColor: 'white',
    // minHeight: 300,
    height: '60%',
    width: '100%',
    paddingHorizontal: 20
  },
  BMHeader: {
    flexDirection: 'row',
    marginTop: 10,
    alignItems: 'center'
  },
  BMTitle: {
    fontFamily: 'AvenirLTStd-Book',
    fontSize: 20,
    marginLeft: 20
  },
  BMfieldTitle: {
    fontFamily: 'AvenirLTStd-Book',
    fontSize: 14,
    marginTop: 20
  },
  DefaultAddress: { flexDirection: 'row', alignItems: 'center', marginTop: 20 },
  DefaultAddressText: {
    fontFamily: 'AvenirLTStd-Book',
    fontSize: 20,
    marginLeft: 20
  },
  dropDown: {
    marginVertical: 10,
    borderBottomWidth: 0.5,
    borderBottomColor: '#808080',
    paddingBottom: 10,
    marginTop: 15
  },
  modalMobileContainer: {
    flex: 1,
    backgroundColor: "white",
    height: "100%",
    width: "100%",
    margin: 0,
 },
 modalViewContainer: {
    flex: 1,
 },
 modalViewHeading: {
    marginHorizontal: 20,
    fontSize: 19,
    color: "black",
 },
 cancelButtonModal: {
    flexDirection: "row",
    alignItems: 'center',
    justifyContent: 'space-between',
    marginHorizontal: 10
 },
 cancelButtonTextModal: {
    padding: 5,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 6
 },
 borderInModal: {
    borderBottomWidth: 0.27,
    opacity: 0.15,
    borderBottomColor: "grey",
 },
});
