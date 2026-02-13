import RNDateTimePicker from '@react-native-community/datetimepicker';
import { BlurView } from 'expo-blur';
import React from 'react';
import { Alert, Platform, ScrollView, StyleSheet, View } from 'react-native';
import { Button, Text, TextInput, TouchableRipple } from 'react-native-paper';

import Close from '../../components/navs/close';
import Sign from '../../components/zodiac/sign';
import { SESSION_KEY } from '../../constants/session';
import { useGlobals } from '../../contexts/global';
import { useIsDark } from '../../hooks/use-theme';
import api from '../../services/api';
import Cool from '../../svgs/Cool';
import Female from '../../svgs/Female';
import InLove from '../../svgs/InLove';
import ItsDifficult from '../../svgs/ItsDifficult';
import Male from '../../svgs/Male';
import Married from '../../svgs/Married';
import { DateUtils } from '../../utils';
import Storer from '../../utils/storer';
import ZodiacCalculator from '../../utils/zodiac-calculator';

function EditProfileScreen({ navigation }) {
  const [{ session }, dispatch] = useGlobals();
  const isDark = useIsDark();

  const [name, setName] = React.useState(session.name || '');
  const [date, setDate] = React.useState(
    session.birthDate ? new Date(session.birthDate) : new Date(642449499000)
  );
  const [sign, setSign] = React.useState(session.sign || 'Aries');
  const [sex, setSex] = React.useState(session.sex || '');
  const [relationship, setRelationship] = React.useState(
    session.relationship || ''
  );
  const [number, setNumber] = React.useState(
    session.number ? String(session.number) : ''
  );
  const [saving, setSaving] = React.useState(false);
  const [showDatePicker, setShowDatePicker] = React.useState(
    Platform.OS === 'ios'
  );

  React.useLayoutEffect(() => {
    setSign(ZodiacCalculator(date.getDate(), date.getMonth() + 1));
  }, [date]);

  const onDateChange = (_event, selectedDate) => {
    const currentDate = selectedDate || date;
    if (Platform.OS === 'android') {
      setShowDatePicker(false);
    }
    setDate(currentDate);
  };

  const _handleSave = async () => {
    if (!name || name.trim().length < 2) {
      Alert.alert('Something is wrong');
      return;
    }

    setSaving(true);
    try {
      const updates = {
        name: name.trim(),
        birthDate: date.getTime(),
        sign,
        sex,
        relationship,
        number,
      };

      await api.user.updateProfile(updates);

      dispatch({ type: 'setSession', fields: updates });

      const currentSession = await Storer.get(SESSION_KEY);
      await Storer.set(SESSION_KEY, { ...currentSession, ...updates });

      navigation.goBack();
    } catch (_error) {
      Alert.alert('Something is wrong');
    } finally {
      setSaving(false);
    }
  };

  const relationshipOptions = [
    { key: 'Married', Icon: Married },
    { key: 'Single', Icon: Cool },
    { key: 'In love', Icon: InLove },
    { key: "It's difficult", Icon: ItsDifficult },
  ];

  return (
    <BlurView
      style={[
        StyleSheet.absoluteFill,
        {
          backgroundColor: isDark
            ? 'rgba(15, 15, 15, 0.92)'
            : 'rgba(255, 255, 255, 0.93)',
        },
      ]}
      tint={isDark ? 'dark' : 'light'}
      intensity={Platform.OS === 'android' ? 150 : 100}
    >
      <Close position="right" />
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
      >
        <Text variant="headlineMedium" style={styles.title}>
          Edit Profile
        </Text>

        {/* Name */}
        <Text variant="titleMedium" style={styles.sectionLabel}>
          Name
        </Text>
        <TextInput
          mode="outlined"
          value={name}
          onChangeText={setName}
          maxLength={20}
          style={styles.textInput}
          dense
        />

        {/* Birth Date */}
        <Text variant="titleMedium" style={styles.sectionLabel}>
          Your date of birth
        </Text>
        <View style={styles.dateRow}>
          <Sign sign={sign} width={40} showTitle={false} height={40} />
          <View style={{ marginLeft: 15 }}>
            <Text variant="titleLarge">{DateUtils.toReadable(date)}</Text>
            <Text style={{ opacity: 0.6 }}>{sign}</Text>
          </View>
        </View>
        {Platform.OS === 'android' && !showDatePicker && (
          <Button
            mode="outlined"
            onPress={() => setShowDatePicker(true)}
            style={{ marginTop: 8 }}
          >
            Press to change
          </Button>
        )}
        {showDatePicker && (
          <RNDateTimePicker
            value={date}
            display="spinner"
            onChange={onDateChange}
            minimumDate={new Date(1930, 0, 0)}
            maximumDate={new Date(2010, 0, 0)}
            textColor={isDark ? '#ffffff' : '#000000'}
          />
        )}

        {/* Sex */}
        <Text variant="titleMedium" style={styles.sectionLabel}>
          Your gender
        </Text>
        <View style={styles.sexRow}>
          <TouchableRipple
            onPress={() => setSex('Male')}
            rippleColor="rgba(0,0,0,0)"
          >
            <View style={styles.sexOption}>
              <Male
                width={70}
                height={70}
                style={{ opacity: sex === 'Male' ? 1 : 0.4 }}
              />
              <Text style={styles.optionText}>Male</Text>
            </View>
          </TouchableRipple>
          <TouchableRipple
            onPress={() => setSex('Female')}
            rippleColor="rgba(0,0,0,0)"
          >
            <View style={styles.sexOption}>
              <Female
                width={70}
                height={70}
                style={{ opacity: sex === 'Female' ? 1 : 0.4 }}
              />
              <Text style={styles.optionText}>Female</Text>
            </View>
          </TouchableRipple>
        </View>

        {/* Relationship */}
        <Text variant="titleMedium" style={styles.sectionLabel}>
          What is your relationship status?
        </Text>
        <View style={styles.relationshipGrid}>
          {relationshipOptions.map(({ key, Icon }) => (
            <TouchableRipple
              key={key}
              onPress={() => setRelationship(key)}
              rippleColor="rgba(0,0,0,0)"
            >
              <View style={styles.relationshipOption}>
                <Icon
                  width={70}
                  height={70}
                  style={{ opacity: relationship === key ? 1 : 0.4 }}
                />
                <Text style={styles.optionText}>{key}</Text>
              </View>
            </TouchableRipple>
          ))}
        </View>

        {/* Number */}
        <Text variant="titleMedium" style={styles.sectionLabel}>
          Your favorite number
        </Text>
        <TextInput
          mode="outlined"
          value={number}
          onChangeText={setNumber}
          keyboardType="number-pad"
          maxLength={5}
          style={styles.textInput}
          dense
        />

        {/* Save */}
        <Button
          mode="contained"
          onPress={_handleSave}
          loading={saving}
          disabled={saving || !name.trim() || name.trim().length < 2}
          style={styles.saveButton}
        >
          Save
        </Button>
        <View style={{ height: 40 }} />
      </ScrollView>
    </BlurView>
  );
}

const styles = StyleSheet.create({
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 30,
  },
  title: {
    textAlign: 'center',
    fontWeight: 'bold',
    marginBottom: 20,
  },
  sectionLabel: {
    marginTop: 20,
    marginBottom: 8,
    fontWeight: 'bold',
  },
  textInput: {
    marginBottom: 5,
  },
  dateRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 5,
  },
  sexRow: {
    flexDirection: 'row',
    justifyContent: 'space-evenly',
    marginVertical: 10,
  },
  sexOption: {
    alignItems: 'center',
  },
  relationshipGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-evenly',
    marginVertical: 10,
  },
  relationshipOption: {
    alignItems: 'center',
    marginBottom: 10,
    width: 100,
  },
  optionText: {
    textAlign: 'center',
    textTransform: 'uppercase',
    fontWeight: 'bold',
    marginTop: 4,
    fontSize: 12,
  },
  saveButton: {
    marginTop: 25,
  },
});

export default EditProfileScreen;
