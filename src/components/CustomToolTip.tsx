import { FONT_FAMILY, GD_FONT_SIZE } from '@/utils/constants';
import useCustomTheme, { ThemeProps } from '@/utils/theme';
import { ThemeProvider } from '@ui-kitten/components';
import React, { useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useCopilot } from 'react-native-copilot';

// const copilotStepConfigs = {
//   'profile.avatar': {
//     title: 'App Lock',
//     subtitle: 'Enable app lock using biometric authentication for enhanced security',
//     style: { backgroundColor: '#1E1E2F' },
//     // extraComponent: () => <Text style={{ color: 'gray' }}>Profile-specific note</Text>,
//     renderButtons: ({ stop }) => (
//       <TouchableOpacity onPress={stop}>
//         <Text style={{ color: '#4AB1F1', fontFamily: FONT_FAMILY.semibold, fontSize: GD_FONT_SIZE.normal }}>Got it!</Text>
//       </TouchableOpacity>
//     ),
//   },
//   'settings.notifications': {
//     title: 'Notifications',
//     style: { backgroundColor: '#1E1E2F' },
//     renderButtons: ({ isFirstStep, isLastStep, goToNext, goToPrev, stop }) => (
//       <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
//         {!isFirstStep && (
//           <TouchableOpacity onPress={goToPrev}>
//             <Text style={{ color: '#4AB1F1', fontFamily: FONT_FAMILY.semibold, fontSize: GD_FONT_SIZE.normal }}>Back</Text>
//           </TouchableOpacity>
//         )}
//         {!isLastStep ? (
//           <TouchableOpacity onPress={goToNext}>
//             <Text style={{ color: '#4AB1F1', fontFamily: FONT_FAMILY.semibold, fontSize: GD_FONT_SIZE.normal }}>Continue</Text>
//           </TouchableOpacity>
//         ) : (
//           <TouchableOpacity onPress={stop}>
//             <Text style={{ color: '#4AB1F1', fontFamily: FONT_FAMILY.semibold, fontSize: GD_FONT_SIZE.normal }}>Finish</Text>
//           </TouchableOpacity>
//         )}
//       </View>
//     ),
//   },
// };


const CustomTooltip = ({
  labels,
}) => {
  const { start, copilotEvents, currentStep, stop, isFirstStep, isLastStep, goToNext, goToPrev, goToNth} = useCopilot();
  // const { name, text } = currentStep ?? {};
  // const stepConfig = copilotStepConfigs[name] ?? {};
  const { styles } = useCustomTheme(style);

    console.log("-=-=-=-=-=-=",labels, currentStep);
    
  // const renderButtons =
  //   stepConfig.renderButtons ??
  //   (() => (
  //     <View style={styles.footer}>
  //       {!isFirstStep && (
  //         <TouchableOpacity onPress={goToPrev}>
  //           <Text style={styles.navText}>Back</Text>
  //         </TouchableOpacity>
  //       )}
  //       {!isLastStep ? (
  //         <TouchableOpacity onPress={goToNext}>
  //           <Text style={styles.navText}>Next</Text>
  //         </TouchableOpacity>
  //       ) : (
  //         <TouchableOpacity onPress={stop}>
  //           <Text style={styles.navText}>Done</Text>
  //         </TouchableOpacity>
  //       )}
  //     </View>
  //   ));

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{currentStep?.name || 'New Feature'}</Text>
      <Text style={styles.text}>{currentStep?.text}</Text>
      <View style={styles.footer}>
        {!isFirstStep && (
          <TouchableOpacity onPress={goToPrev}>
            <Text style={styles.navText}>Back</Text>
          </TouchableOpacity>
        )}
        {!isLastStep ? (
          <TouchableOpacity onPress={goToNext}>
            <Text style={styles.navText}>Next</Text>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity onPress={stop}>
            <Text style={styles.navText}>Done</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
};

export default CustomTooltip;

const style = (theme: ThemeProps) => StyleSheet.create({
  container: {
    backgroundColor: theme.colors.solids.white, 
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 8,
    margin: -15,
    elevation: 5,
  },
  title: {
    color: theme.colors.solids.black,
    fontFamily: theme.typography.fontFamily.semiBold,
    fontSize: theme.typography.fontSize.large.size,
    marginBottom: 6,
  },
  text: {
    color: theme.colors.solids.black,
    fontFamily: theme.typography.fontFamily.regular,
    fontSize: theme.typography.fontSize.regular.size,
  },
  footer: {
    marginTop: 4,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  navText: {
    color: '#3553E6',
    fontFamily: theme.typography.fontFamily.semiBold,
    fontSize: theme.typography.fontSize.regular.size,
  },
});
