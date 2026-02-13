import React from 'react';
import { StyleSheet, View } from 'react-native';
import { Button, Text } from 'react-native-paper';

import { DefaultView } from '../../components/containers';
import SpaceSky from '../../components/decorations/space-sky';
import CustomInput from '../../components/paper/custom-input';
import { useGlobals } from '../../contexts/global';
import Aquarius from '../../svgs/Aquarius';
import Dices from '../../svgs/Dices';

function NumberScreen({ navigation }) {
  const [{ session }, dispatch] = useGlobals();
  const [number, setNumber] = React.useState();
  const buttonDisabled = !number;
  const _handleContinue = () => {
    dispatch({
      type: 'setSession',
      fields: { number },
    });
    navigation.push('Loading');
  };

  return (
    <DefaultView>
      <SpaceSky />
      <Aquarius width={60} height={60} style={styles.aquarius} />
      <View style={{ flex: 1 }} />
      <View style={styles.textContainer}>
        <Text variant="headlineMedium" style={styles.textHeadline}>
          Your favorite number
        </Text>
        <Text style={styles.textText}>
          {`${session.name}, to give you accurate and personal information we need to know some info about you.`}
        </Text>
      </View>
      <View style={styles.logoContainer}>
        <Dices height={60} />
      </View>
      <View style={styles.inputContainer}>
        <CustomInput
          value={number}
          onChangeText={(text) => setNumber(text)}
          placeholder="Type here"
          keyboardType="number-pad"
          enablesReturnKeyAutomatically
        />
      </View>
      <View style={styles.buttonContainer}>
        <Button
          mode="contained"
          disabled={buttonDisabled}
          onPress={_handleContinue}
        >
          Continue
        </Button>
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
  aquarius: {
    zIndex: 0,
    position: 'absolute',
    top: 20,
    right: 20,
    opacity: 0.2,
  },
  textContainer: {
    flex: 1.5,
    alignSelf: 'center',
    paddingHorizontal: 20,
  },
  textHeadline: {
    textAlign: 'center',
    textTransform: 'uppercase',
    fontWeight: 'bold',
  },
  textText: {
    textAlign: 'center',
    paddingVertical: 5,
  },
  logoContainer: {
    flex: 1,
    alignSelf: 'center',
    paddingVertical: 25,
    zIndex: 1,
  },
  inputContainer: {
    flex: 1,
    paddingHorizontal: 20,
    opacity: 0.9,
    zIndex: 2,
  },
  inputStyle: {
    borderRadius: 5,
    textAlign: 'center',
  },
  inputCustom: {
    textAlign: 'center',
    marginTop: 10,
    color: 'white',
    fontSize: 30,
  },
  buttonContainer: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 35,
    justifyContent: 'flex-end',
    marginBottom: 20,
  },
});

export default NumberScreen;
