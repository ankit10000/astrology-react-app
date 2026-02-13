import React from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import {
  Button,
  Divider,
  ProgressBar,
  Text,
  useTheme,
} from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';

import ShowFromTop from '../../components/animations/show-from-top';
import SpaceSky from '../../components/decorations/space-sky';
import MainNav from '../../components/navs/main-nav';
import ShadowHeadline from '../../components/paper/shadow-headline';
import TextBold from '../../components/paper/text-bold';
import { Sign } from '../../components/zodiac';
import HoroscopeSigns from '../../constants/zodiac-signs';
import { useGlobals } from '../../contexts/global';
import api from '../../services/api';
import Storer from '../../utils/storer';

const Bars = ({ name, icon, end }) => {
  const { colors } = useTheme();
  return (
    <>
      <View style={styles.mathProgressText}>
        <Button textColor={colors.text} icon={icon}>
          {name}
        </Button>
        <Text>{end}%</Text>
      </View>
      <ProgressBar progress={end / 100} style={styles.matchProgressBar} />
    </>
  );
};

const MatchContent = ({ sign1, sign2 }) => {
  const [data, setData] = React.useState(null);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState(null);

  React.useEffect(() => {
    let cancelled = false;
    const [sorted1, sorted2] = [sign1, sign2].sort();
    const CACHE_KEY = `compatibility_${sorted1}_${sorted2}`;
    const TWENTY_FOUR_HOURS = 24 * 60 * 60 * 1000;

    const fetchCompat = async () => {
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
        const result = await api.horoscope.getCompatibility(sign1, sign2, 'en');
        if (!cancelled) {
          setData(result);
          setLoading(false);
          Storer.set(CACHE_KEY, { data: result, timestamp: Date.now() });
        }
      } catch (err) {
        if (!cancelled) {
          setError(err.message || 'Failed to load compatibility');
          setLoading(false);
        }
      }
    };

    fetchCompat();
    return () => {
      cancelled = true;
    };
  }, [sign1, sign2]);

  const matches_data = [
    { name: 'Intimate', icon: 'account-multiple-plus-outline' },
    { name: 'Mindset', icon: 'thought-bubble' },
    { name: 'Feelings', icon: 'heart' },
    { name: 'Priorities', icon: 'flag' },
    { name: 'Interests', icon: 'sticker-emoji' },
    { name: 'Sport', icon: 'run' },
  ];

  if (loading) {
    return (
      <View style={{ padding: 40, alignItems: 'center' }}>
        <ProgressBar indeterminate style={{ width: 200, borderRadius: 5 }} />
        <Text style={{ marginTop: 10 }}>Loading...</Text>
      </View>
    );
  }

  if (error || !data) {
    return (
      <View style={{ padding: 40, alignItems: 'center' }}>
        <Text style={{ marginBottom: 10 }}>{error || 'Something went wrong'}</Text>
      </View>
    );
  }

  return (
    <>
      <View style={styles.surfaceContainer}>
        <ShowFromTop>
          <TextBold style={{ marginBottom: 10 }}>
            {sign1} & {sign2}
          </TextBold>
          <Text variant="bodyMedium">{data.resume}</Text>
          <TextBold style={{ marginTop: 20, marginBottom: 10 }}>
            Relationship
          </TextBold>
          <Text variant="bodyMedium">{data.relationship}</Text>
          <View style={{ marginVertical: 20 }}>
            {matches_data.map((props, index) => (
              <Bars
                key={index}
                end={data.percents[props.name.toLowerCase()]}
                {...props}
              />
            ))}
          </View>
        </ShowFromTop>
      </View>
    </>
  );
};

const SignsContent = ({ onPress }) => (
  <View style={styles.signsContainer}>
    {HoroscopeSigns.map((sign) => (
      <Sign
        key={sign}
        showTitle
        sign={sign}
        signHeight={100}
        signWidth={90}
        onPress={onPress}
        style={{ marginBottom: 10, padding: 3 }}
      />
    ))}
  </View>
);

function CompatibilityScreen({ navigation }) {
  const { colors } = useTheme();
  const [scRef, setScRef] = React.useState();
  const [selectedSigns, setSelectedSigns] = React.useState([]);
  const [compDetailsShow, setCompDetailsShow] = React.useState(false);
  const handleSignPress = (sign) => {
    setSelectedSigns((prev) => (prev.length >= 2 ? prev : [...prev, sign]));
  };
  const handleSignTopPress = () =>
    setSelectedSigns([]) || setCompDetailsShow(false);
  React.useEffect(() => {
    if (selectedSigns.length === 2) {
      setCompDetailsShow(true);
      scRef.scrollTo({ y: 0 });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedSigns]);

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <SpaceSky />
      <View style={{ marginBottom: 10 }}>
        <MainNav />
        <View style={styles.headerContainer}>
          <ShadowHeadline>Compatibility</ShadowHeadline>
        </View>
      </View>
      <View style={styles.matchCirclesContainer}>
        {selectedSigns[0] ? (
          <Sign
            sign={selectedSigns[0]}
            onPress={handleSignTopPress}
            showTitle={false}
            signHeight={100}
            signWidth={100}
          />
        ) : (
          <View
            style={[
              styles.matchCircle,
              {
                shadowColor: '#000000',
                backgroundColor: colors.surface,
                borderColor: colors.text,
              },
            ]}
          >
            <Text style={{ textAlign: 'center', fontSize: 10 }}>
              Your sign
            </Text>
          </View>
        )}
        <View style={styles.matchSeparator}>
          <Text style={{ fontSize: 22 }}>🔥</Text>
        </View>
        {selectedSigns[1] ? (
          <Sign
            onPress={handleSignTopPress}
            sign={selectedSigns[1]}
            showTitle={false}
            signHeight={100}
            signWidth={100}
          />
        ) : (
          <View
            style={[
              styles.matchCircle,
              {
                shadowColor: '#000000',
                backgroundColor: colors.surface,
                borderColor: colors.text,
              },
            ]}
          >
            <Text style={{ textAlign: 'center', fontSize: 10 }}>
              Partner sign
            </Text>
          </View>
        )}
      </View>
      <Divider />
      <ScrollView ref={(scrollRef) => setScRef(scrollRef)}>
        <View style={{ height: 20 }} />
        {compDetailsShow ? (
          <MatchContent sign1={selectedSigns[0]} sign2={selectedSigns[1]} />
        ) : (
          <SignsContent onPress={handleSignPress} />
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  headerContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: 20,
    marginTop: 10,
  },
  matchCirclesContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    marginVertical: 30,
  },
  matchCircle: {
    elevation: 10,
    shadowRadius: 7,
    shadowOpacity: 0.2,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    width: 100,
    height: 100,
    borderRadius: 50,
    borderStyle: 'dashed',
    padding: 5,
  },
  signsContainer: {
    zIndex: 5,
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    marginBottom: 20,
    flex: 1,
  },
  surfaceContainer: {
    marginHorizontal: 20,
    elevation: 3,
  },
  surfaceSurface: {
    padding: 20,
    borderRadius: 10,
  },
  surfaceParagraph: {
    fontSize: 14,
    lineHeight: 22,
    letterSpacing: 1,
  },
  mathProgressText: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  matchProgressBar: {
    borderRadius: 10,
    height: 5,
    marginBottom: 3,
  },
  matchSeparator: {
    justifyContent: 'center',
    flex: 0.3,
    alignItems: 'center',
  },
});

export default CompatibilityScreen;
