import React from 'react';
import {View, Text, TouchableOpacity, FlatList, Dimensions, Platform, PermissionsAndroid, Animated} from 'react-native';
import style from './style';
import Icon from '@/core/components/custom-icon/custom-icon';
import FontAwesome5 from 'react-native-vector-icons/FontAwesome5';
import CounterComponent from './counterComponent';
import {TextInput} from 'react-native-gesture-handler';

const {height, width} = Dimensions.get('window');

export class NoteDenomination extends React.Component<any, any> {
  constructor(props: any) {
    super(props);
    this.state = {
      counter_2000: 0,
      counter_500: 0,
      counter_200: 0,
      counter_100: 0,
      counter_50: 0,
      counter_20: 0,
      counter_10: 0,
      counter_5: 0,
      counter_Change: 0,
    };
  }
  changeCounter_2000 = (type) => {
    if (type == 'add') {
      this.setState({counter_2000: this.state.counter_2000 + 1});
    } else {
      if (this.state.counter_2000 >= 1) {
        this.setState({counter_2000: this.state.counter_2000 - 1});
      }
    }
  };
  changeCounter_500 = (type) => {
    if (type == 'add') {
      this.setState({counter_500: this.state.counter_500 + 1});
    } else {
      if (this.state.counter_500 >= 1) {
        this.setState({counter_500: this.state.counter_500 - 1});
      }
    }
  };
  changeCounter_200 = (type) => {
    if (type == 'add') {
      this.setState({counter_200: this.state.counter_200 + 1});
    } else {
      if (this.state.counter_200 >= 1) {
        this.setState({counter_200: this.state.counter_200 - 1});
      }
    }
  };
  changeCounter_100 = (type) => {
    if (type == 'add') {
      this.setState({counter_100: this.state.counter_100 + 1});
    } else {
      if (this.state.counter_100 >= 1) {
        this.setState({counter_100: this.state.counter_100 - 1});
      }
    }
  };
  changeCounter_50 = (type) => {
    if (type == 'add') {
      this.setState({counter_50: this.state.counter_50 + 1});
    } else {
      if (this.state.counter_50 >= 1) {
        this.setState({counter_50: this.state.counter_50 - 1});
      }
    }
  };
  changeCounter_20 = (type) => {
    if (type == 'add') {
      this.setState({counter_20: this.state.counter_20 + 1});
    } else {
      if (this.state.counter_20 >= 1) {
        this.setState({counter_20: this.state.counter_20 - 1});
      }
    }
  };
  changeCounter_10 = (type) => {
    if (type == 'add') {
      this.setState({counter_10: this.state.counter_10 + 1});
    } else {
      if (this.state.counter_10 >= 1) {
        this.setState({counter_10: this.state.counter_10 - 1});
      }
    }
  };
  changeCounter_5 = (type) => {
    if (type == 'add') {
      this.setState({counter_5: this.state.counter_5 + 1});
    } else {
      if (this.state.counter_5 >= 1) {
        this.setState({counter_5: this.state.counter_5 - 1});
      }
    }
  };
  changeCounter_change = (type) => {
    if (type == 'add') {
      this.setState({counter_Change: this.state.counter_Change + 1});
    } else {
      if (this.state.counter_Change >= 1) {
        this.setState({counter_Change: this.state.counter_Change - 1});
      }
    }
  };

  Total = (type) => {
    if (type == '2000') {
      return 2000 * this.state.counter_2000;
    } else if (type == '500') {
      return 500 * this.state.counter_500;
    } else if (type == '200') {
      return 200 * this.state.counter_200;
    } else if (type == '100') {
      return 100 * this.state.counter_100;
    } else if (type == '50') {
      return 50 * this.state.counter_50;
    } else if (type == '20') {
      return 20 * this.state.counter_20;
    } else if (type == '10') {
      return 10 * this.state.counter_10;
    } else if (type == '5') {
      return 5 * this.state.counter_5;
    } else if (type == 'change') {
      return 1 * this.state.counter_Change;
    }
  };
  grandTotal = () => {
    return (
      <Text style={style.totalAmt}>
        ₹{' '}
        {2000 * this.state.counter_2000 +
          500 * this.state.counter_500 +
          200 * this.state.counter_200 +
          100 * this.state.counter_100 +
          50 * this.state.counter_50 +
          20 * this.state.counter_20 +
          10 * this.state.counter_10 +
          5 * this.state.counter_5 +
          1 * this.state.counter_Change}
      </Text>
    );
  };

  render() {
    return (
      <View style={style.container}>
        <View style={style.header}>
          <TouchableOpacity delayPressIn={0}>
            <Icon name={'Backward'} color="#fff" size={18} />
          </TouchableOpacity>
          <Text style={style.title}>Title</Text>
        </View>
        <View style={style.body}>
          <View style={style.row}>
            <Text style={style.heading}>Currency</Text>
            <View style={style.currencyContainer}>
              <FontAwesome5 name="money-bill" size={18} color={'#229F5F'} />
              <Text style={style.currency}>₹2000</Text>
            </View>
            <View style={style.currencyContainer}>
              <FontAwesome5 name="money-bill" size={18} color={'#229F5F'} />
              <Text style={style.currency}>₹500</Text>
            </View>
            <View style={style.currencyContainer}>
              <FontAwesome5 name="money-bill" size={18} color={'#229F5F'} />
              <Text style={style.currency}>₹200</Text>
            </View>
            <View style={style.currencyContainer}>
              <FontAwesome5 name="money-bill" size={18} color={'#229F5F'} />
              <Text style={style.currency}>₹100</Text>
            </View>
            <View style={style.currencyContainer}>
              <FontAwesome5 name="money-bill" size={18} color={'#229F5F'} />
              <Text style={style.currency}>₹50</Text>
            </View>
            <View style={style.currencyContainer}>
              <FontAwesome5 name="money-bill" size={18} color={'#229F5F'} />
              <Text style={style.currency}>₹20</Text>
            </View>
            <View style={style.currencyContainer}>
              <FontAwesome5 name="money-bill" size={18} color={'#229F5F'} />
              <Text style={style.currency}>₹10</Text>
            </View>
            <View style={style.currencyContainer}>
              <FontAwesome5 name="money-bill" size={18} color={'#229F5F'} />
              <Text style={style.currency}>₹5</Text>
            </View>
            <View style={style.currencyContainer}>
              <Icon name={'currency'} color="#229F5F" size={18} />
              <Text style={style.currency}>Change</Text>
            </View>
          </View>
          <View style={style.row}>
            <Text style={style.heading}>Quantity</Text>
            <CounterComponent count={this.state.counter_2000} setCount={this.changeCounter_2000} />
            <CounterComponent count={this.state.counter_500} setCount={this.changeCounter_500} />
            <CounterComponent count={this.state.counter_200} setCount={this.changeCounter_200} />
            <CounterComponent count={this.state.counter_100} setCount={this.changeCounter_100} />
            <CounterComponent count={this.state.counter_50} setCount={this.changeCounter_50} />
            <CounterComponent count={this.state.counter_20} setCount={this.changeCounter_20} />
            <CounterComponent count={this.state.counter_10} setCount={this.changeCounter_10} />
            <CounterComponent count={this.state.counter_5} setCount={this.changeCounter_5} />
            <CounterComponent count={this.state.counter_Change} setCount={this.changeCounter_change} />
          </View>
          <View style={style.row}>
            <Text style={[style.heading, {marginLeft: 10}]}>Total</Text>
            <View style={style.TotalContainer}>
              <Text style={[style.currency, {marginRight: 25}]}>₹{this.Total('2000')}</Text>
            </View>
            <View style={style.TotalContainer}>
              <Text style={[style.currency, {marginRight: 25}]}>₹{this.Total('500')}</Text>
            </View>
            <View style={style.TotalContainer}>
              <Text style={[style.currency, {marginRight: 25}]}>₹{this.Total('200')}</Text>
            </View>
            <View style={style.TotalContainer}>
              <Text style={[style.currency, {marginRight: 25}]}>₹{this.Total('100')}</Text>
            </View>
            <View style={style.TotalContainer}>
              <Text style={[style.currency, {marginRight: 25}]}>₹{this.Total('50')}</Text>
            </View>
            <View style={style.TotalContainer}>
              <Text style={[style.currency, {marginRight: 25}]}>₹{this.Total('20')}</Text>
            </View>
            <View style={style.TotalContainer}>
              <Text style={[style.currency, {marginRight: 25}]}>₹{this.Total('10')}</Text>
            </View>
            <View style={style.TotalContainer}>
              <Text style={[style.currency, {marginRight: 25}]}>₹{this.Total('5')}</Text>
            </View>
            <View style={style.TotalContainer}>
              <Text style={[style.currency, {marginRight: 25}]}>₹{this.Total('change')}</Text>
            </View>
          </View>
        </View>
        <View style={style.grandTotal}>
          <Text style={style.totalText}>Grand Total : </Text>
          {this.grandTotal()}
        </View>
        <TouchableOpacity style={style.button} onPress={() => console.log(this.grandTotal())}>
          <Text style={style.buttonText}>Save</Text>
        </TouchableOpacity>
      </View>
    );
  }
}

export default NoteDenomination;
