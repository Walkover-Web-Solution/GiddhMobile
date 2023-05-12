import { StyleSheet, Text } from 'react-native';
import React, { useState, forwardRef, useImperativeHandle } from 'react';
import colors from '@/utils/colors';

interface Props {
  stickyDayRef: React.Ref<any>,
}

const StickyDay: React.ForwardRefRenderFunction<unknown, Props> = ({stickyDayRef}, ref) => { 
  const [day, setDay] = useState('')

  const updateDay = (value: string) => {
    if(day !== value){
      setDay(value);
    }
  };

  useImperativeHandle(stickyDayRef, () => ({publicHandler: updateDay}), [updateDay]);

  if(day != ''){
    return (
      <Text style={styles.dayText}>{day}</Text>
    )
  }else{
    return null;
  }
};

export default forwardRef(StickyDay);

const styles = StyleSheet.create({
  dayText: { 
    textAlign: "center", 
    borderRadius: 15, 
    borderWidth: 0.3, 
    paddingHorizontal: 5, 
    paddingVertical: 3, 
    borderColor: '#8E8E8E', 
    width: "35%", 
    backgroundColor: colors.BACKGROUND, 
    marginHorizontal: "32.5%", 
    position: 'absolute', 
    zIndex: 1
  }
})