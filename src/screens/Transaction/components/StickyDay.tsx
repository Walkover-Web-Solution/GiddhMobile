import { StyleSheet, Text } from 'react-native';
import React, { useState, forwardRef, useImperativeHandle } from 'react';
import { FONT_FAMILY } from '@/utils/constants';

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
    fontFamily: FONT_FAMILY.regular,
    textAlign: "center", 
    borderRadius: 15, 
    borderWidth: 1, 
    paddingHorizontal: 5, 
    paddingBottom: 2, 
    paddingTop: 5,
    borderColor: '#EDEDED', 
    width: "35%", 
    backgroundColor: '#FFFFFF', 
    marginHorizontal: "32.5%", 
    position: 'absolute', 
    top: 5,
    zIndex: 1
  }
})