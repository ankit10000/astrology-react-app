import { MaterialCommunityIcons } from '@expo/vector-icons';
import React from 'react';
import { StyleSheet, View } from 'react-native';
import { Divider, ProgressBar, Text, useTheme } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';

import ShowFromTop from '../../components/animations/show-from-top';
import ScrollViewFadeFirst from '../../components/containers/scroll-view-fade-first';
import SpaceSky from '../../components/decorations/space-sky';
import MainNav from '../../components/navs/main-nav';
import ShadowHeadline from '../../components/paper/shadow-headline';
import TextBold from '../../components/paper/text-bold';
import { Sign } from '../../components/zodiac';
import months from '../../constants/months';
import { SESSION_KEY } from '../../constants/session';
import { useGlobals } from '../../contexts/global';
import api from '../../services/api';
import Storer from '../../utils/storer';

const LuckyNumber = ({ number }) => {
  const { colors } = useTheme();
  return (
    <View
      style={[LuckyNumberStyles.circle, { backgroundColor: colors.secondary }]}
    >
      <Text style={{ fontSize: 16, marginTop: 3 }}>{number}</Text>
    </View>
  );
};

const LuckyNumberStyles = StyleSheet.create({
  circle: {
    borderRadius: 50,
    height: 30,
    width: 30,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

const ProgressItem = ({ text, percent, style }) => {
  const { colors } = useTheme();
  return (
    <View style={[{ flex: 1 }, style]}>
      <Text style={ProgressItemStyles.text}>{text}</Text>
      <ProgressBar style={ProgressItemStyles.bar} progress={percent / 100} />
      <Text style={{ color: colors.primary }}>{percent}%</Text>
    </View>
  );
};

const ProgressItemStyles = StyleSheet.create({
  text: {
    fontSize: 16,
  },
  bar: {
    marginVertical: 5,
    borderRadius: 5,
  },
});

function DailyScreen({ navigation }) {
  const [{ session }, dispatch] = useGlobals();
  const { colors } = useTheme();
  const [data, setData] = React.useState(null);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState(null);
  const d = new Date();

  React.useLayoutEffect(() => {
    if (!session?.sign) {
      Storer.delete(SESSION_KEY).then(() => dispatch({ type: 'setLogOut' }));
    }
  }, [dispatch, session?.sign]);

  React.useEffect(() => {
    if (!session?.sign) return;
    let cancelled = false;
    const CACHE_KEY = `daily_horoscope_${session.sign}`;
    const TWENTY_FOUR_HOURS = 24 * 60 * 60 * 1000;

    const fetchDaily = async () => {
      setLoading(true);
      setError(null);

      // Check local cache first
      try {
        const cached = await Storer.get(CACHE_KEY);
        if (cached && Date.now() - cached.timestamp < TWENTY_FOUR_HOURS) {
          if (!cancelled) {
            setData(cached.data);
            setLoading(false);
          }
          return;
        }
      } catch {}

      // No valid cache, fetch from API
      try {
        const result = await api.horoscope.getDaily(session.sign, 'en');
        if (!cancelled) {
          setData(result);
          setLoading(false);
          // Save to local cache with timestamp
          Storer.set(CACHE_KEY, { data: result, timestamp: Date.now() });
        }
      } catch (err) {
        if (!cancelled) {
          setError(err.message);
          setLoading(false);
        }
      }
    };

    fetchDaily();
    return () => {
      cancelled = true;
    };
  }, [session?.sign]);

  const Header = (
    <View>
      <MainNav
        rightButton={
          <MaterialCommunityIcons
            onPress={() => navigation.navigate('Signs', { key: 'Sign' })}
            name="swap-horizontal"
            color={colors.text}
            size={30}
            style={{ opacity: 0.5 }}
          />
        }
      />
      <View style={[styles.headerContainer]}>
        <Sign
          sign={session.sign}
          showTitle={false}
          signWidth={70}
          signHeight={70}
        />
        <ShadowHeadline style={styles.headerHeadline}>
          {session.sign}
        </ShadowHeadline>
        <Text variant="titleMedium">
          {`Day ${d.getDate()} of ${months[d.getMonth()]}, ${d.getFullYear()}`}
        </Text>
      </View>
      <Divider />
    </View>
  );

  if (loading) {
    return (
      <>
        <SpaceSky />
        <SafeAreaView
          style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}
        >
          <ProgressBar indeterminate style={{ width: 200, borderRadius: 5 }} />
          <Text style={{ marginTop: 15 }}>Loading...</Text>
        </SafeAreaView>
      </>
    );
  }

  if (error || !data) {
    return (
      <>
        <SpaceSky />
        <SafeAreaView
          style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}
        >
          <Text>Something is wrong</Text>
        </SafeAreaView>
      </>
    );
  }

  return (
    <>
      <SpaceSky />
      <SafeAreaView>
        <ScrollViewFadeFirst element={Header} height={200}>
          <View style={{ height: 20 }} />
          <ShowFromTop>
            <View
              style={[
                styles.defaultContainer,
                {
                  flexDirection: 'row',
                  alignItems: 'center',
                  marginTop: 10,
                },
              ]}
            >
              <TextBold style={styles.textTitles}>
                Focus of the day:
              </TextBold>
              <TextBold
                style={{ fontSize: 16, marginLeft: 5, color: colors.primary }}
              >
                {data.focus}
              </TextBold>
            </View>
            <View
              style={[
                styles.defaultContainer,
                {
                  marginTop: 25,
                  marginBottom: 5,
                  flexDirection: 'row',
                  justifyContent: 'space-around',
                },
              ]}
            >
              <ProgressItem
                text="Love"
                percent={data.percents.love}
              />
              <ProgressItem
                text="Career"
                percent={data.percents.work}
                style={{ marginHorizontal: 5 }}
              />
              <ProgressItem
                text="Health"
                percent={data.percents.health}
              />
            </View>
            <View style={[styles.defaultContainer]}>
              <View style={styles.horoscopeTodayContainer}>
                <TextBold style={styles.textTitles}>
                  Your horoscope for today:
                </TextBold>
                <View style={styles.iconsHoroscopeToday}>
                  <MaterialCommunityIcons
                    name="heart"
                    size={16}
                    color={colors.text}
                    style={{ marginLeft: 5 }}
                  />
                  <MaterialCommunityIcons
                    name="briefcase"
                    size={16}
                    color={colors.text}
                    style={{ marginLeft: 5 }}
                  />
                  <MaterialCommunityIcons
                    name="food-apple"
                    size={16}
                    color={colors.text}
                    style={{ marginLeft: 5 }}
                  />
                </View>
              </View>
              <Text style={{ marginTop: 15 }}>{data.text}</Text>
            </View>
            <View style={styles.defaultContainer}>
              <TextBold style={styles.textTitles}>
                Today you love
              </TextBold>
            </View>
            <View
              style={[
                styles.loveContainer,
                {
                  borderColor: colors.text + '0D',
                },
              ]}
            >
              <View
                style={[
                  styles.heartLoveContainer,
                  {
                    backgroundColor: colors.text + '0D',
                  },
                ]}
              >
                <MaterialCommunityIcons
                  name="heart"
                  size={30}
                  color={colors.secondary}
                />
              </View>
              <View style={[styles.loveSignsContainer]}>
                {data.compatibility.map((sign, i) => (
                  <Sign
                    key={i}
                    sign={sign}
                    signHeight={40}
                    signWidth={50}
                    styleTitle={{ fontSize: 12 }}
                  />
                ))}
              </View>
            </View>
            <Divider style={{ marginTop: 20 }} />
            <View style={styles.defaultContainer}>
              <TextBold style={styles.textTitles}>
                Lucky numbers
              </TextBold>
            </View>
            <View
              style={[
                styles.defaultContainer,
                {
                  flexDirection: 'row',
                  justifyContent: 'space-evenly',
                },
              ]}
            >
              {data.numbers.map((number, i) => (
                <LuckyNumber key={i} number={number} />
              ))}
            </View>
            <View style={{ paddingVertical: 10 }} />
          </ShowFromTop>
        </ScrollViewFadeFirst>
      </SafeAreaView>
    </>
  );
}

const styles = StyleSheet.create({
  backgroundConstellation: {
    zIndex: 1,
    position: 'absolute',
    top: 300,
    left: 20,
    opacity: 0.05,
  },
  headerContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: 20,
    marginVertical: 20,
  },
  headerHeadline: {
    fontWeight: 'bold',
    fontSize: 30,
    lineHeight: 34,
    marginTop: 20,
  },
  defaultContainer: {
    marginHorizontal: 20,
    marginTop: 20,
  },
  textTitles: {
    fontSize: 16,
  },
  horoscopeTodayContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  iconsHoroscopeToday: {
    flexDirection: 'row',
    justifyContent: 'space-evenly',
  },
  loveContainer: {
    flexDirection: 'row',
    marginTop: 15,
    marginHorizontal: 20,
    justifyContent: 'space-between',
    borderWidth: 2,
    borderRadius: 10,
  },
  heartLoveContainer: {
    flex: 0.2,
    borderTopLeftRadius: 8,
    borderBottomLeftRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loveSignsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-evenly',
    flex: 1,
    marginTop: 10,
  },
});

export default DailyScreen;
