import React from 'react';
import { StyleSheet, View } from 'react-native';
import {
  Button,
  HelperText,
  Text,
  TextInput,
  useTheme,
} from 'react-native-paper';

import { DefaultView } from '../../components/containers';
import SpaceSky from '../../components/decorations/space-sky';
import { SESSION_KEY } from '../../constants/session';
import { useGlobals } from '../../contexts/global';
import api from '../../services/api';
import { Backgrounds } from '../../svgs';
import Pisces from '../../svgs/zodiac/Pisces';
import Storer from '../../utils/storer';

function SignupScreen({ navigation }) {
  const [{ session }, dispatch] = useGlobals();
  const { colors } = useTheme();
  const [name, setName] = React.useState('');
  const [email, setEmail] = React.useState('');
  const [password, setPassword] = React.useState('');
  const [showPassword, setShowPassword] = React.useState(false);
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState(null);

  const emailValid = email.includes('@') && email.includes('.');
  const buttonDisabled =
    name.length < 2 || !emailValid || password.length < 6 || loading;

  const _handleSignup = async () => {
    setLoading(true);
    setError(null);
    try {
      const { token, user } = await api.auth.signup(name, email, password);
      const sessionData = {
        authToken: token,
        email: user.email,
        userId: user.id,
        name: user.name,
      };
      await Storer.set(SESSION_KEY, { ...session, ...sessionData });
      dispatch({ type: 'setSession', fields: sessionData });
      // main.js will auto-switch to InitialStack since authToken is set but basicsDone is not
    } catch (err) {
      setError(err.message || 'Something is wrong');
    } finally {
      setLoading(false);
    }
  };

  return (
    <DefaultView>
      <SpaceSky />
      <Pisces width={60} height={60} style={styles.zodiacDecor} />
      <Backgrounds.Stars
        color={colors.text}
        height={180}
        width={180}
        style={styles.starsDecor}
      />
      <View style={{ flex: 0.3 }} />
      <View style={styles.textContainer}>
        <Text variant="headlineMedium" style={styles.textHeadline}>
          Create Account
        </Text>
        <Text style={styles.textSubtitle}>
          Begin your astrological adventure
        </Text>
      </View>
      <View style={styles.formContainer}>
        <TextInput
          mode="outlined"
          label="Name"
          value={name}
          onChangeText={setName}
          maxLength={20}
          left={<TextInput.Icon icon="account" />}
          style={styles.input}
        />
        <TextInput
          mode="outlined"
          label="Email"
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
          autoCapitalize="none"
          left={<TextInput.Icon icon="email" />}
          style={styles.input}
        />
        <TextInput
          mode="outlined"
          label="Password"
          value={password}
          onChangeText={setPassword}
          secureTextEntry={!showPassword}
          left={<TextInput.Icon icon="lock" />}
          right={
            <TextInput.Icon
              icon={showPassword ? 'eye-off' : 'eye'}
              onPress={() => setShowPassword(!showPassword)}
            />
          }
          style={styles.input}
        />
        {error && (
          <HelperText type="error" visible>
            {error}
          </HelperText>
        )}
        <Button
          mode="contained"
          disabled={buttonDisabled}
          loading={loading}
          onPress={_handleSignup}
          style={styles.button}
        >
          Sign Up
        </Button>
      </View>
      <View style={styles.footerContainer}>
        <Text style={{ color: colors.text }}>
          {'Already have an account?'}{' '}
        </Text>
        <Button mode="text" compact onPress={() => navigation.goBack()}>
          Sign In
        </Button>
      </View>
    </DefaultView>
  );
}

const styles = StyleSheet.create({
  zodiacDecor: {
    zIndex: 0,
    position: 'absolute',
    top: 20,
    right: 20,
    opacity: 0.2,
  },
  starsDecor: {
    zIndex: 0,
    position: 'absolute',
    bottom: 20,
    left: 20,
    opacity: 0.1,
  },
  textContainer: {
    flex: 0.5,
    alignSelf: 'center',
    paddingHorizontal: 20,
  },
  textHeadline: {
    textAlign: 'center',
    textTransform: 'uppercase',
    fontWeight: 'bold',
  },
  textSubtitle: {
    textAlign: 'center',
    paddingVertical: 5,
    opacity: 0.7,
  },
  formContainer: {
    flex: 1.8,
    paddingHorizontal: 20,
  },
  input: {
    marginBottom: 12,
  },
  button: {
    marginTop: 10,
    paddingVertical: 4,
  },
  footerContainer: {
    flex: 0.4,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
});

export default SignupScreen;
