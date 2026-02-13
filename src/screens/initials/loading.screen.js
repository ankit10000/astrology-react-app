import React from 'react';
import { StyleSheet, View } from 'react-native';
import { Text, useTheme } from 'react-native-paper';

import Rotation from '../../components/animations/rotation';
import { DefaultView } from '../../components/containers';
import SpaceSky from '../../components/decorations/space-sky';
import { SESSION_KEY } from '../../constants/session';
import { useGlobals } from '../../contexts/global';
import api from '../../services/api';
import SolarSystem from '../../svgs/SolarSystem';
import Storer from '../../utils/storer';

function LoadingScreen({ navigation }) {
  const [{ session }, dispatch] = useGlobals();
  const { colors } = useTheme();
  const [phrase, setPhrase] = React.useState(0);
  const phrases = [
    'Analyzing name...',
    'Analyzing birth date...',
    'Analyzing gender...',
    'Analyzing relationship status...',
    'Analyzing favourite number...',
    'Concluding analysis...',
  ];

  React.useEffect(() => {
    const intervalNumber = setInterval(() => {
      if (phrase < 5) {
        setPhrase(phrase + 1);
      } else {
        const preSession = {
          ...session,
          ...{ days: 1, daysRow: 1, basicsDone: true },
        };
        Storer.set(SESSION_KEY, preSession).then(() => {
          // Sync onboarding data to backend (non-blocking)
          api.user
            .saveOnboarding({
              sign: session.sign,
              birthDate: session.birthDate,
              sex: session.sex,
              relationship: session.relationship,
              number: session.number,
            })
            .catch((e) => console.warn('Failed to sync onboarding:', e));
          dispatch({
            type: 'setSession',
            fields: preSession,
          });
        });
      }
    }, 3000);
    return () => clearInterval(intervalNumber);
  });

  return (
    <DefaultView>
      <SpaceSky />
      <View style={{ flex: 1 }} />
      <View style={styles.loadingContainer}>
        <Rotation style={{ opacity: 0.7 }} rotate>
          <SolarSystem />
        </Rotation>
      </View>
      <View style={{ flex: 3 }}>
        <Text
          variant="titleMedium"
          style={[styles.textSubheading, { color: colors.primary }]}
        >
          {phrases[phrase]}
        </Text>
      </View>
    </DefaultView>
  );
}

const styles = StyleSheet.create({
  constellation: {
    zIndex: 0,
    position: 'absolute',
    bottom: 20,
    left: 20,
    opacity: 0.1,
  },
  leo: {
    zIndex: 0,
    position: 'absolute',
    top: 20,
    right: 20,
    opacity: 0.2,
  },
  counterContainer: {
    position: 'absolute',
    top: 20,
    left: 20,
  },
  loadingContainer: {
    flex: 1,
    alignSelf: 'center',
    paddingTop: 40,
    zIndex: 1,
  },
  textSubheading: {
    textAlign: 'center',
    marginTop: 20,
  },
});

export default LoadingScreen;
