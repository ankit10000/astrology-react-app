import { createNativeStackNavigator } from '@react-navigation/native-stack';
import React from 'react';
import { useTheme } from 'react-native-paper';

import BirthDateScreen from '../screens/initials/birth-date.screen';
import LoadingScreen from '../screens/initials/loading.screen';
import NameScreen from '../screens/initials/name.screen';
import NumberScreen from '../screens/initials/number.screen';
import RelationshipScreen from '../screens/initials/relationship.screen';
import SexScreen from '../screens/initials/sex.screen';

const Stack = createNativeStackNavigator();

/**
 * @returns {*}
 * @constructor
 */
function InitialStackNavigation() {
  const { colors } = useTheme();
  return (
    <Stack.Navigator
      initialRouteName="Name"
      screenOptions={{
        contentStyle: { backgroundColor: colors.background },
      }}
    >
      <Stack.Screen
        name="Name"
        component={NameScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="BirthDate"
        component={BirthDateScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="Sex"
        component={SexScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="Relationship"
        component={RelationshipScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="Number"
        component={NumberScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="Loading"
        component={LoadingScreen}
        options={{ headerShown: false }}
      />
    </Stack.Navigator>
  );
}

export default InitialStackNavigation;
