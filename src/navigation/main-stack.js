import { MaterialCommunityIcons } from '@expo/vector-icons';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { BlurView } from 'expo-blur';
import React from 'react';
import { StatusBar, StyleSheet, View } from 'react-native';
import { ActivityIndicator, Portal, Text, useTheme } from 'react-native-paper';

import { useGlobals } from '../contexts/global';
import { useIsDark } from '../hooks/use-theme';
import ChatScreen from '../screens/main/chat.screen';
import CompatibilityScreen from '../screens/main/compatibility.screen';
import DailyScreen from '../screens/main/daily.screen';
import EditProfileScreen from '../screens/main/edit-profile.screen';
import ProfileScreen from '../screens/main/profile.screen';
import ZodiacScreen from '../screens/main/zodiac.screen';

const BarIcon = ({ color, size, name }) => {
  return (
    <MaterialCommunityIcons
      color={color}
      size={size}
      name={name}
      style={{ marginTop: 5 }}
    />
  );
};

const BarLabel = ({ color, children }) => {
  return (
    <Text
      style={{
        fontSize: 10,
        lineHeight: 20,
        textAlign: 'center',
        color,
      }}
    >
      {children}
    </Text>
  );
};

const Sta = createNativeStackNavigator();

const Tab = createBottomTabNavigator();

function BottomBarNavigation() {
  const [{ session }] = useGlobals();
  const { colors } = useTheme();
  const _barStyle = useIsDark() ? 'light-content' : 'dark-content';

  return (
    <>
      <StatusBar
        barStyle={_barStyle}
        backgroundColor={colors.background}
        animated
      />
      <Tab.Navigator>
        <Tab.Screen
          name="symbol"
          component={DailyScreen}
          options={{
            headerShown: false,
            tabBarIcon: (props) => (
              <BarIcon
                {...props}
                name={`zodiac-${session.sign.toLowerCase()}`}
              />
            ),
            tabBarLabel: (props) => (
              <BarLabel {...props} colo>
                {session.sign}
              </BarLabel>
            ),
            title: session.sign,
          }}
        />
        <Tab.Screen
          name="Compatibility"
          component={CompatibilityScreen}
          options={{
            headerShown: false,
            tabBarIcon: (props) => <BarIcon {...props} name="account-heart" />,
            tabBarLabel: (props) => (
              <BarLabel {...props}>Compatibility</BarLabel>
            ),
            title: 'Compatibility',
          }}
        />
        <Tab.Screen
          name="Chat"
          component={ChatScreen}
          options={{
            headerShown: false,
            tabBarIcon: (props) => (
              <BarIcon {...props} name="chat-processing" />
            ),
            tabBarLabel: (props) => (
              <BarLabel {...props}>Ask AI</BarLabel>
            ),
            title: 'Ask AI',
          }}
        />
      </Tab.Navigator>
    </>
  );
}

function MainStackNavigation() {
  const [{ showLoader }] = useGlobals();
  const { colors } = useTheme();
  return (
    <>
      <Sta.Navigator
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: colors.background },
        }}
      >
        <Sta.Screen name="Home" component={BottomBarNavigation} />
        <Sta.Screen
          name="Profile"
          component={ProfileScreen}
          options={{
            presentation: 'transparentModal',
            contentStyle: {
              backgroundColor: 'transparent',
              marginTop: 50,
              borderTopLeftRadius: 30,
              borderTopRightRadius: 30,
            },
          }}
        />
        <Sta.Screen
          name="EditProfile"
          component={EditProfileScreen}
          options={{
            presentation: 'transparentModal',
            contentStyle: {
              backgroundColor: 'transparent',
              marginTop: 50,
              borderTopLeftRadius: 30,
              borderTopRightRadius: 30,
            },
          }}
        />
        <Sta.Screen
          name="Signs"
          component={ZodiacScreen}
          options={{
            presentation: 'transparentModal',
            contentStyle: {
              backgroundColor: 'transparent',
              marginTop: 50,
              borderTopLeftRadius: 30,
              borderTopRightRadius: 30,
            },
          }}
        />
      </Sta.Navigator>
      {showLoader && (
        <Portal>
          <BlurView
            intensity={70}
            style={[
              StyleSheet.absoluteFill,
              {
                flex: 1,
                justifyContent: 'center',
                alignItems: 'center',
                zIndex: 50,
              },
            ]}
          >
            <View
              style={{
                backgroundColor: colors.background,
                padding: 20,
                borderRadius: 15,
              }}
            >
              <ActivityIndicator size={50} />
            </View>
          </BlurView>
        </Portal>
      )}
    </>
  );
}

export default MainStackNavigation;
