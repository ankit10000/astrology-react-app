import { createNativeStackNavigator } from '@react-navigation/native-stack';
import React from 'react';
import { useTheme } from 'react-native-paper';

import i18n from '../i18n';
import LearnScreen from '../screens/main/learn.screen';
import AboutZodiacScreen from '../screens/main/learn/about-zodiac.screen';
import TheElementsScreen from '../screens/main/learn/elements.screen';
import TheSignsScreen from '../screens/main/learn/signs.screen';

const Stack = createNativeStackNavigator();

/**
 * @returns {*}
 * @constructor
 */
function LearnStackNavigation() {
  const { colors } = useTheme();
  return (
    <Stack.Navigator
      initialRouteName="Learn"
      screenOptions={{
        contentStyle: { backgroundColor: colors.background },
      }}
    >
      <Stack.Screen
        name="Learn"
        component={LearnScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="AboutZodiac"
        component={AboutZodiacScreen}
        options={{
          headerTitle: i18n.t('About the Zodiac'),
          headerStyle: { backgroundColor: 'transparent' },
        }}
      />
      <Stack.Screen
        name="TheSigns"
        component={TheSignsScreen}
        options={{
          headerTitle: i18n.t('The signs'),
          headerStyle: { backgroundColor: 'transparent' },
        }}
      />
      <Stack.Screen
        name="TheElements"
        component={TheElementsScreen}
        options={{
          headerTitle: i18n.t('The elements'),
          headerStyle: { backgroundColor: 'transparent' },
        }}
      />
    </Stack.Navigator>
  );
}

export default LearnStackNavigation;
