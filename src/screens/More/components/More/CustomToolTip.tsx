import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';

const CustomTooltip = ({
  isFirstStep,
  isLastStep,
  handleNext,
  handlePrev,
  handleStop,
  currentStep,
}) => {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>{currentStep?.name || 'New Feature'}</Text>
      <Text style={styles.text}>{currentStep?.text}</Text>

      <View style={styles.footer}>
        {!isFirstStep && (
          <TouchableOpacity onPress={handlePrev}>
            <Text style={styles.navText}>Back</Text>
          </TouchableOpacity>
        )}

        {!isLastStep ? (
          <TouchableOpacity onPress={handleNext}>
            <Text style={styles.navText}>Next</Text>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity onPress={handleStop}>
            <Text style={styles.navText}>Done</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
};

export default CustomTooltip;

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#1e1e2f',
    padding: 16,
    borderRadius:8,
    margin:-15,
    elevation: 5,
  },
  title: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 16,
    marginBottom: 6,
  },
  text: {
    color: '#ccc',
    fontSize: 14,
  },
  footer: {
    marginTop: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  navText: {
    color: '#4AB1F1',
    fontWeight: '500',
    fontSize: 14,
  },
});
