import React from 'react';
import { connect } from 'react-redux';
import { View, Text, FlatList, DeviceEventEmitter, Image, TouchableOpacity, Modal, SafeAreaView, TextInput } from 'react-native';
import { APP_EVENTS } from '@/utils/constants';
import LoaderKit  from 'react-native-loader-kit';
import colors from '@/utils/colors';
import moment from 'moment';
import AntDesign from 'react-native-vector-icons/AntDesign';
import { AccountsService } from '@/core/services/accounts/accounts.service';
import { AccountsList } from './components/accounts-list.component';
import styles, { accountStyles as style } from './styles';
import Routes from '@/navigation/routes';
import _ from 'lodash';
import Header from '@/components/Header';
import { NavigationProp, ParamListBase, useIsFocused } from '@react-navigation/native';
import { resetAccountSearch, updateAccountSearch } from '@/redux/CommonAction';


type connectedProps = ReturnType<typeof mapStateToProps> & ReturnType<typeof mapDispatchToProps>;
type Props = connectedProps & {
  navigation: NavigationProp<ParamListBase>
}
type State = {
  showLoader: Boolean,
  accounts: any[],
  selectedGroup: { name: string, uniqueName: string },
  isSearchingModalVisible: boolean,
  searchedText: string,
  selectedSearchOption: string,
  groupAccountNames: any[],
  showSearchLoader: Boolean,
  startDate: string,
  endDate: string,
  page: number,
  searchDataPage: number,
  searchDataTotalPages: number,
  totalPages: number,
  loadingMore: boolean,
  loadingMoreSearch : boolean,
  showSearchSuggestion: boolean
};
export class AccountScreen extends React.Component<Props, State> {

  listener: any;
  focusRef: React.RefObject<any>;

  constructor(props: Props) {
    super(props);
    this.focusRef = React.createRef();
    this.state = {
      showLoader: false,
      startDate: moment().subtract(30, 'd').format('DD-MM-YYYY'),
      endDate: moment().format('DD-MM-YYYY'),
      page: 1,
      totalPages: 0,
      searchDataPage:1,
      searchDataTotalPages:0,
      loadingMore: false,
      loadingMoreSearch: false,
      selectedGroup: {
        name: 'Operating Cost',
        uniqueName: 'operatingcost'
      },
      accounts: [],
      groupAccountNames: [],
      isSearchingModalVisible: false,
      selectedSearchOption: 'groups',
      showSearchLoader: false,
      searchedText: '',
      showSearchSuggestion: true
    };
  }
  componentDidMount() {
    this.listener = DeviceEventEmitter.addListener(APP_EVENTS.comapnyBranchChange, () => {
      this.setState(
        {
          showLoader: false,
          startDate: moment().subtract(30, 'd').format('DD-MM-YYYY'),
          endDate: moment().format('DD-MM-YYYY'),
          page: 1,
          totalPages: 0,
          searchDataPage:1,
          searchDataTotalPages:0,
          loadingMore: false,
          loadingMoreSearch: false,
          selectedGroup: {
            name: 'Operating Cost',
            uniqueName: 'operatingcost'
          },
          accounts: [],
          groupAccountNames: [],
          isSearchingModalVisible: false,
          selectedSearchOption: 'groups',
          showSearchLoader: false,
          searchedText: '',
        },
        () => this.getAccounts()
      );
    });
    this.listener = DeviceEventEmitter.addListener(APP_EVENTS.NewEntryCreated, () => {
        this.getAccounts()
    });
    this.getAccounts();
  }
  private async getAccounts() {
    try {
      this.setState({
        showLoader: true
      });
      const response = await AccountsService.getGroupAccounts(this.state.selectedGroup.uniqueName, this.state.page);
      if (response?.body?.results) {
        this.setState({
          accounts: response.body.results,
          showLoader: false,
          totalPages: response?.body?.totalPages
        });
      } else {
        this.setState({ showLoader: false });
      }
    } catch (e) {
      console.log("Error in group accounts ", e);
      this.setState({ showLoader: false });
    }
  }
  searchGroupAccountsData = _.debounce(this.searchGroupAccounts, 500);

  private async searchGroupAccounts(text: string) {
    try {
      this.setState({ showSearchLoader: true, searchDataPage:1 })
      if (this.state.selectedSearchOption == 'groups') {
        const response = await AccountsService.getGroupNames(text,this.state.searchDataPage);
        if (response?.body?.results) {
          this.setState({
            groupAccountNames: response.body.results,
            showSearchLoader: false,
            searchDataTotalPages: response?.body?.totalPages
          });
        } else {
          this.setState({ showSearchLoader: false })

        }
      }
      else {
        const response = await AccountsService.getAccountNames(text,'',this.state.searchDataPage,false);
        if (response?.body?.results) {
          this.setState({
            groupAccountNames: response.body.results,
            showSearchLoader: false,
            searchDataTotalPages: response?.body?.totalPages
          });
        } else {
          this.setState({ showSearchLoader: false })
        }
      }
      this.handleInputFocus();

    } catch (e) {
      this.setState({ showSearchLoader: false })

      console.log("Error in group accounts search ", e);
    }
  }
  private async loadMoreSearchGroupAccounts(text: string) {
    try {
      if (this.state.selectedSearchOption == 'groups') {
        const response = await AccountsService.getGroupNames(text,this.state.searchDataPage);
        if (response?.body?.results) {
          this.setState({
            groupAccountNames: [...this.state.groupAccountNames,...response.body.results],
            showSearchLoader: false,
            loadingMoreSearch: false
          });
        } else {
          this.setState({ showSearchLoader: false,loadingMoreSearch:false })

        }
      }
      else {
        const response = await AccountsService.getAccountNames(text,'',this.state.searchDataPage,false);
        if (response?.body?.results) {
          this.setState({
            groupAccountNames: [...this.state.groupAccountNames,...response.body.results],
            showSearchLoader: false,
            loadingMoreSearch: false
          });
        } else {
          this.setState({ showSearchLoader: false, loadingMoreSearch:false })
        }
      }

    } catch (e) {
      this.setState({ showSearchLoader: false ,loadingMoreSearch:false})

      console.log("Error in group accounts search ", e);
    }
  }
  private async getAccountData(item :any){
    try{

      const { activeCompany }: any = this.props;
      const response = await AccountsService.getIndividualAccountData(item?.uniqueName);
      if(response?.status == 'success'){
        this.setState({ showLoader:false , searchedText: ''  });
        this.props.navigation.navigate("Account.PartiesTransactions", {
          cameFromStack: Routes.Accounts,
          initial: false,
          item: response?.body,
          type: (response?.body?.accountType === 'Creditors' ? 'Vendors' : 'Creditors'),
          activeCompany: activeCompany
        });
      }else{
        this.setState({ showLoader:false , searchedText: ''  })
      }
    }catch(e){
      this.setState({ showLoader:false , searchedText: ''  })
    }
    
  }
  renderGroupAccountNames = (item: any) => {
    return (
      <TouchableOpacity
        style={styles.groupButton}
        onPress={() => {
          const updatedSearchSuggestions = (this.state.searchedText != '' && !this.props.accountsSearchSuggestions?.includes(item?.name)) ? 
          (this.props.accountsSearchSuggestions?.length < 7 ? [item?.name, ...this.props.accountsSearchSuggestions] : [item?.name, ...this.props.accountsSearchSuggestions].slice(0, -1)) : 
          this.props.accountsSearchSuggestions ;
          if (this.state.selectedSearchOption == 'groups') {
            this.setState(
              {
                selectedGroup: { name: item?.name, uniqueName:  item?.uniqueName },
                isSearchingModalVisible: false,
                searchedText: ''
              }
              , () => {
                this.getAccounts();
                this.props.updateAccountSearch(updatedSearchSuggestions);
              }
            );
          } else {
            this.setState(
              {
                showLoader:true,
                isSearchingModalVisible: false,
              }
              , () => {
                this.getAccountData(item);
                this.props.updateAccountSearch(updatedSearchSuggestions);
              }
            );
           
          }
        }}
      >
        <Text style={styles.groupNameText} >{item?.name}</Text>
      </TouchableOpacity>
    )
  }

  renderSearchSuggestionBox = () =>{
    return (
      <View style={style.searchResultContainer}>
        <View style={style.searchHeader}>
          <Text style={style.searchHeading}>Recent</Text>
          <TouchableOpacity onPress={() =>this.props.resetAccountSearch()}>
            <Text style={style.searchHeading}>Clear all</Text>
          </TouchableOpacity>
        </View>
        <FlatList
          nestedScrollEnabled={true}
          style={{marginTop:3}}
          showsVerticalScrollIndicator={false}
          data={this.props.accountsSearchSuggestions}
          keyExtractor={(item, index) => index.toString()}
          renderItem={({item, index}) => (
            <TouchableOpacity
              style={[style.recents,{flexDirection:'row', justifyContent:'space-between', alignItems:'center'}]}
              onPress={async () => {
                this.setState({ searchedText: item });
                this.searchGroupAccountsData(item);
              }
              }>
              <Text style={style.searchItemText}>{item ? item : "Result Not found"}</Text>
              <TouchableOpacity
                onPress={() => {this.props.updateAccountSearch(this.props.accountsSearchSuggestions?.filter((_:any, i:number) => i !== index))}}>
                <AntDesign name="close" size={13} color={'#808080'} />
              </TouchableOpacity>
            </TouchableOpacity>
          )}
        />
      </View>
    );
  }

  renderModalView = () => {
    return (
      <Modal visible={this.state.isSearchingModalVisible}
        onDismiss={() => { this.setState({ isSearchingModalVisible: false }) }}
        style={styles.modalMobileContainer}
      >
        <SafeAreaView style={styles.modalViewContainer}>
          <Header backgroundColor='#084EAD'>
            <AntDesign name={'search1'} size={20} color={'#FFFFFF'} />
            <TextInput
              ref={this.focusRef}
              value={this.state.searchedText}
              placeholder={`Search ${this.state.selectedSearchOption == 'groups' ? 'Groups' : 'Accounts'}`}
              placeholderTextColor={'#FFFFFF'}
              returnKeyType={"done"}
              style={style.searchText}
              onChangeText={(text) => {
                this.setState({ searchedText: text });
                this.searchGroupAccountsData(text);
              }}
            />
            <TouchableOpacity
              hitSlop={{right: 10, left: 10, top: 10, bottom: 10}}
              onPress={() => {
                this.setState({ isSearchingModalVisible: false, searchedText: '' })
              }}
            >
              <AntDesign name={'close'} size={25} color={'#FFFFFF'} />
            </TouchableOpacity>
          </Header>
          <View style={styles.switchView} >
            <TouchableOpacity
              onPress={() => {
                this.setState({ selectedSearchOption: 'groups',searchDataPage:1,searchDataTotalPages:0,showSearchSuggestion:true }, () => {
                  this.searchGroupAccountsData(this.state.searchedText)
                })
              }}
              style={[styles.switchButton, { borderColor: this.state.selectedSearchOption == 'groups' ? '#000080' : '#ededed' }]} >
              <Text style={{ fontFamily: 'AvenirLTStd-Book', }}>Groups</Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => {
                this.setState({ selectedSearchOption: 'accounts',searchDataPage:1,searchDataTotalPages:0,showSearchSuggestion:true }, () => {
                  this.searchGroupAccountsData(this.state.searchedText)
                })
              }}
              style={[styles.switchButton, { borderColor: this.state.selectedSearchOption == 'accounts' ? '#000080' : '#ededed' }]} >
              <Text style={{ fontFamily: 'AvenirLTStd-Book', }} >Accounts</Text>
            </TouchableOpacity>
          </View>
          {this.state.showSearchLoader ? <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
            <LoaderKit
                style={{ width: 45, height: 45 }}
                name={'LineScale'}
                color={colors.PRIMARY_NORMAL}
            />
          </View> :
            <View style={{ flex: 1 }}>
              <FlatList
                scrollEnabled
                keyboardShouldPersistTaps={'handled'}
                data={this.state.groupAccountNames}
                renderItem={({ item }) => this.renderGroupAccountNames(item)}
                onEndReached={() => this.handleLoadMoreSearchData()}
                ListFooterComponent={this._renderSearchMoreLoader}
                ListHeaderComponent={this.state.searchedText == '' && this.props.accountsSearchSuggestions.length > 0 && this.state.showSearchSuggestion ? this.renderSearchSuggestionBox() : null}
                keyExtractor={(item, index) => index.toString()}
              />
            </View>
          }
        </SafeAreaView>
      </Modal>
    )
  }
  loadMoreAccounts = async () => {
    try {
      const response = await AccountsService.getGroupAccounts(this.state.selectedGroup.uniqueName, this.state.page);
      if (response?.body?.results) {
        this.setState({
          accounts: [...this.state.accounts, ...response.body.results],
          showLoader: false,
          loadingMore: false
        });
      } else {
        this.setState({
          showLoader: false,
          loadingMore: false
        });
      }
    } catch (e) {
      console.log("Error in group accounts ", e);
      this.setState({ showLoader: false, loadingMore: false });
    }
  }

  handleLoadMore = () => {
    if (this.state.page < this.state.totalPages) {
      this.setState(
        {
          page: this.state.page + 1,
          loadingMore: true,
        },
        () => {
          this.loadMoreAccounts();
        },
      );
    }
  };
  handleLoadMoreSearchData = () => {
    if (this.state.searchDataPage < this.state.searchDataTotalPages) {
      this.setState(
        {
          searchDataPage: this.state.searchDataPage + 1,
          loadingMoreSearch: true,
        },
        () => {
          this.loadMoreSearchGroupAccounts(this.state.searchedText);
        },
      );
    }
  };
  _renderFooter = () => {
    if (!this.state.loadingMore) return null;

    return (
      <View
        style={{
          position: 'relative',
          width: '100%',
          height: 100,
          bottom: 10,
          justifyContent: 'center',
          alignItems: 'center'
        }}>
        <LoaderKit
            style={{ width: 45, height: 45 }}
            name={'LineScale'}
            color={colors.PRIMARY_NORMAL}
        />
      </View>
    );
  };
  _renderSearchMoreLoader = () => {
    if (!this.state.loadingMoreSearch) return null;

    return (
      <View
        style={{
          position: 'relative',
          width: '100%',
          height: 100,
          bottom: 10,
          justifyContent: 'center',
          alignItems: 'center'
        }}>
        <LoaderKit
            style={{ width: 45, height: 45 }}
            name={'LineScale'}
            color={colors.PRIMARY_NORMAL}
        />
      </View>
    );
  };

  handleInputFocus(){
    this.focusRef.current.focus()
  }

  render() {
    const { activeCompany, isFocused }: any = this.props;
    
    return (
      <View style={style.container}>
        <Header 
          header='Accounts' 
          subHeader={this.state.selectedGroup.name}
          backgroundColor='#084EAD' 
          headerRightContent={
            <>
              <TouchableOpacity
                activeOpacity={0.7}
                hitSlop={{ top: 10, bottom: 10 }}
                style={{ padding: 8 }}
                onPress={() => {
                  this.setState({ isSearchingModalVisible: true }, () => {
                    this.searchGroupAccountsData('');
                  })
                }}
              >
                <AntDesign name={'search1'} size={20} color={'#FFFFFF'} />
              </TouchableOpacity>
            </>
          }
        />
        {this.state.showLoader
          ? <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
            <LoaderKit
                style={{ width: 45, height: 45 }}
                name={'LineScale'}
                color={colors.PRIMARY_NORMAL}
            />
          </View>
          : <View style={style.container}>
            {this.state.accounts?.length == 0
              ? (
                <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', marginBottom: 30 }}>
                  <Image
                    source={require('@/assets/images/noTransactions.png')}
                    style={{ resizeMode: 'contain', height: 250, width: 300 }}
                  />
                  <Text style={{ fontFamily: 'AvenirLTStd-Black', fontSize: 25, marginTop: 10 }}>No Accounts</Text>
                </View>
              )
              : (
                  <FlatList
                    data={this.state.accounts}
                    renderItem={({ item }) => (
                      <AccountsList item={item} activeCompany={activeCompany} />
                    )}
                    onEndReached={() => this.handleLoadMore()}
                    ListFooterComponent={this._renderFooter}
                    keyExtractor={(item) => item.uniqueName}
                  />
              )}
          </View>
        }
        {this.state.isSearchingModalVisible && this.renderModalView()}
      </View>
    );
  }
}
function mapStateToProps(state:any) {
  return {
    accountsSearchSuggestions: state.commonReducer.accountsSearchSuggestions,
  };
}

function mapDispatchToProps(dispatch) {
  return {
    resetAccountSearch: () => {
      dispatch(resetAccountSearch());
    },
    updateAccountSearch: (payload:string[]) => {
      dispatch(updateAccountSearch(payload));
    }
  };
}

function Component(props: any) {
  const isFocused = useIsFocused();
  return <AccountScreen {...props} isFocused={isFocused} />;
}

const Screen = connect(mapStateToProps, mapDispatchToProps)(Component);
export default Screen;
