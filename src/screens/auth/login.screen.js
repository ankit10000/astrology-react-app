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
import Leo from '../../svgs/zodiac/Leo';
import Storer from '../../utils/storer';

function LoginScreen({ navigation }) {
  const [{ session }, dispatch] = useGlobals();
  const { colors } = useTheme();
  const [email, setEmail] = React.useState('');
  const [password, setPassword] = React.useState('');
  const [showPassword, setShowPassword] = React.useState(false);
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState(null);

  const emailValid = email.includes('@') && email.includes('.');
  const buttonDisabled = !emailValid || password.length < 6 || loading;

  const _handleLogin = async () => {
    setLoading(true);
    setError(null);
    try {
      const { token, user } = await api.auth.login(email, password);
      const sessionData = {
        authToken: token,
        email: user.email,
        userId: user.id,
        name: user.name,
        sign: user.sign,
        birthDate: user.birthDate,
        sex: user.sex,
        relationship: user.relationship,
        number: user.number,
        ...(user.basicsDone ? { basicsDone: true } : {}),
      };
      await Storer.set(SESSION_KEY, { ...session, ...sessionData });
      dispatch({ type: 'setSession', fields: sessionData });
    } catch (err) {
      setError(err.message || 'Something is wrong');
    } finally {
      setLoading(false);
    }
  };

  return (
    <DefaultView>
      <SpaceSky />
      <Leo width={60} height={60} style={styles.zodiacDecor} />
      <Backgrounds.Constellation
        color={colors.text}
        dotColor={colors.primary}
        height={180}
        width={180}
        style={styles.constellation}
      />
      <View style={{ flex: 0.4 }} />
      <View style={styles.textContainer}>
        <Text variant="headlineMedium" style={styles.textHeadline}>
          Welcome Back
        </Text>
        <Text style={styles.textSubtitle}>
          Sign in to continue your cosmic journey
        </Text>
      </View>
      <View style={styles.formContainer}>
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
          onPress={_handleLogin}
          style={styles.button}
        >
          Sign In
        </Button>
      </View>
      <View style={styles.footerContainer}>
        <Text style={{ color: colors.text }}>
          {"Don't have an account?"}{' '}
        </Text>
        <Button
          mode="text"
          compact
          onPress={() => navigation.navigate('Signup')}
        >
          Sign Up
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
  constellation: {
    zIndex: 0,
    position: 'absolute',
    bottom: 20,
    left: 20,
    opacity: 0.1,
  },
  textContainer: {
    flex: 0.6,
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
    flex: 1.5,
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
    flex: 0.5,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
});

export default LoginScreen;
