import React from 'react';

import { TouchableWithoutFeedback } from 'react-native-gesture-handler';

export class AppDatePickerInput extends React.Component {
  constructor (props) {
    super(props);
    this.state = {};
  }

  render () {
    return (
      <TouchableWithoutFeedback
        style={{
          height: 40,
          width: '80%',
          borderRadius: 20,
          borderWidth: 1,
          borderColor: '#D9D9D9'
        }}
        onPress={}></TouchableWithoutFeedback>
    );
  }
}

export default AppDatePickerInput;
