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
import months from '../../constants/months';
import api from '../../services/api';
import Storer from '../../utils/storer';

const PanchangRow = ({ icon, label, name, description, accent }) => {
  const { colors } = useTheme();
  return (
    <View style={[styles.row, { borderColor: colors.text + '1A', backgroundColor: colors.surface }]}>
      <View style={[styles.rowIcon, { backgroundColor: (accent || colors.primary) + '22' }]}>
        <MaterialCommunityIcons name={icon} size={22} color={accent || colors.primary} />
      </View>
      <View style={styles.rowContent}>
        <Text style={[styles.rowLabel, { color: colors.text + '66' }]}>{label}</Text>
        <TextBold style={styles.rowName}>{name}</TextBold>
        {description ? (
          <Text style={styles.rowDescription}>{description}</Text>
        ) : null}
      </View>
    </View>
  );
};

const ActivityList = ({ title, icon, items, color }) => {
  const { colors } = useTheme();
  return (
    <View style={[styles.activityCard, { borderColor: color + '33', backgroundColor: colors.surface }]}>
      <View style={styles.activityHeader}>
        <MaterialCommunityIcons name={icon} size={16} color={color} />
        <TextBold style={[styles.activityTitle, { color }]}>{title}</TextBold>
      </View>
      {items.map((item, i) => (
        <View key={i} style={styles.activityItem}>
          <MaterialCommunityIcons name="circle-small" size={18} color={color} />
          <Text style={styles.activityText}>{item}</Text>
        </View>
      ))}
    </View>
  );
};

function PanchangScreen() {
  const { colors } = useTheme();
  const [data, setData] = React.useState(null);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState(null);
  const d = new Date();

  React.useEffect(() => {
    let cancelled = false;
    const today = d.toISOString().split('T')[0];
    const CACHE_KEY = `panchang_${today}`;
    const TWENTY_FOUR_HOURS = 24 * 60 * 60 * 1000;

    const fetchPanchang = async () => {
      setLoading(true);
      setError(null);

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

      try {
        const result = await api.vedic.getPanchang();
        if (!cancelled) {
          setData(result);
          setLoading(false);
          Storer.set(CACHE_KEY, { data: result, timestamp: Date.now() });
        }
      } catch (err) {
        if (!cancelled) {
          setError(err.message);
          setLoading(false);
        }
      }
    };

    fetchPanchang();
    return () => { cancelled = true; };
  }, []);

  const Header = (
    <View>
      <MainNav />
      <View style={styles.headerContainer}>
        <View style={[styles.calendarIcon, { backgroundColor: colors.primary + '22' }]}>
          <MaterialCommunityIcons name="calendar-star" size={50} color={colors.primary} />
        </View>
        <ShadowHeadline style={styles.headerHeadline}>Panchang</ShadowHeadline>
        <Text variant="titleMedium">
          {`${d.getDate()} ${months[d.getMonth()]}, ${d.getFullYear()}`}
        </Text>
        <Text style={[styles.subtitle, { color: colors.text + '88' }]}>
          Hindu Vedic Almanac
        </Text>
      </View>
      <Divider />
    </View>
  );

  if (loading) {
    return (
      <>
        <SpaceSky />
        <SafeAreaView style={styles.centered}>
          <ProgressBar indeterminate style={{ width: 200, borderRadius: 5 }} />
          <Text style={{ marginTop: 15 }}>Calculating Panchang...</Text>
        </SafeAreaView>
      </>
    );
  }

  if (error || !data) {
    return (
      <>
        <SpaceSky />
        <SafeAreaView style={styles.centered}>
          <Text style={{ opacity: 0.5, marginBottom: 8 }}>Failed to load</Text>
          <Text style={{ opacity: 0.4, fontSize: 12, textAlign: 'center', paddingHorizontal: 40 }}>{error}</Text>
        </SafeAreaView>
      </>
    );
  }

  return (
    <>
      <SpaceSky />
      <SafeAreaView>
        <ScrollViewFadeFirst element={Header} height={220}>
          <View style={{ height: 20 }} />
          <ShowFromTop>
            {data.dayQuality ? (
              <View style={[styles.dayQualityCard, { backgroundColor: colors.primary + '15', borderColor: colors.primary + '33' }]}>
                <MaterialCommunityIcons name="weather-sunny" size={18} color={colors.primary} />
                <Text style={[styles.dayQualityText, { color: colors.text }]}>{data.dayQuality}</Text>
              </View>
            ) : null}

            <View style={styles.sectionLabel}>
              <TextBold style={[styles.sectionTitle, { color: colors.text + '88' }]}>
                FIVE ELEMENTS
              </TextBold>
            </View>

            <PanchangRow
              icon="moon-waning-crescent"
              label="Tithi · Lunar Day"
              name={data.tithi.name}
              description={data.tithi.description}
            />
            <PanchangRow
              icon="star-four-points-outline"
              label="Nakshatra · Lunar Mansion"
              name={`${data.nakshatra.name} · ${data.nakshatra.deity}`}
              description={data.nakshatra.description}
            />
            <PanchangRow
              icon="yin-yang"
              label="Yoga · Day Quality"
              name={data.yoga.name}
              description={data.yoga.description}
            />
            <PanchangRow
              icon="clock-outline"
              label="Karana · Half Day"
              name={data.karana.name}
              description={data.karana.description}
            />
            <PanchangRow
              icon="orbit"
              label={`Var · ${data.var.day}`}
              name={`Ruled by ${data.var.rulingPlanet}`}
              description={data.var.description}
            />

            <View style={styles.sectionLabel}>
              <TextBold style={[styles.sectionTitle, { color: colors.text + '88' }]}>
                RAHU KAAL
              </TextBold>
            </View>

            <View style={[styles.rahuCard, { backgroundColor: '#FF444422', borderColor: '#FF4444' }]}>
              <View style={styles.rahuHeader}>
                <MaterialCommunityIcons name="alert" size={22} color="#FF4444" />
                <TextBold style={styles.rahuTitle}>Inauspicious Period</TextBold>
              </View>
              <View style={styles.rahuTime}>
                <MaterialCommunityIcons name="clock-alert-outline" size={16} color="#FF4444" />
                <Text style={styles.rahuTimeText}>
                  {data.rahuKaal.start} — {data.rahuKaal.end}
                </Text>
              </View>
              <Text style={styles.rahuWarning}>{data.rahuKaal.warning}</Text>
            </View>

            <View style={styles.sectionLabel}>
              <TextBold style={[styles.sectionTitle, { color: colors.text + '88' }]}>
                ACTIVITIES
              </TextBold>
            </View>

            <View style={styles.activitiesRow}>
              <ActivityList
                title="Auspicious"
                icon="check-circle-outline"
                items={data.auspicious}
                color="#4CAF50"
              />
              <ActivityList
                title="Avoid"
                icon="close-circle-outline"
                items={data.inauspicious}
                color="#FF7043"
              />
            </View>

            <View style={{ paddingVertical: 16 }} />
          </ShowFromTop>
        </ScrollViewFadeFirst>
      </SafeAreaView>
    </>
  );
}

const styles = StyleSheet.create({
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: 20,
    marginVertical: 20,
    gap: 6,
  },
  calendarIcon: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerHeadline: {
    fontWeight: 'bold',
    fontSize: 30,
    lineHeight: 34,
    marginTop: 8,
  },
  subtitle: {
    fontSize: 13,
    letterSpacing: 1,
  },
  dayQualityCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
    marginHorizontal: 20,
    marginBottom: 4,
    padding: 14,
    borderRadius: 12,
    borderWidth: 1,
  },
  dayQualityText: {
    flex: 1,
    fontSize: 14,
    lineHeight: 22,
  },
  sectionLabel: {
    marginHorizontal: 20,
    marginTop: 20,
    marginBottom: 8,
  },
  sectionTitle: {
    fontSize: 11,
    letterSpacing: 1.5,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginHorizontal: 20,
    marginBottom: 10,
    borderRadius: 12,
    borderWidth: 1,
    padding: 12,
    gap: 12,
  },
  rowIcon: {
    width: 42,
    height: 42,
    borderRadius: 21,
    justifyContent: 'center',
    alignItems: 'center',
  },
  rowContent: {
    flex: 1,
  },
  rowLabel: {
    fontSize: 11,
    letterSpacing: 0.5,
    marginBottom: 2,
  },
  rowName: {
    fontSize: 15,
    marginBottom: 4,
  },
  rowDescription: {
    fontSize: 13,
    lineHeight: 20,
    opacity: 0.75,
  },
  rahuCard: {
    marginHorizontal: 20,
    borderRadius: 12,
    borderWidth: 1,
    padding: 14,
  },
  rahuHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },
  rahuTitle: {
    fontSize: 15,
    color: '#FF4444',
  },
  rahuTime: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 8,
  },
  rahuTimeText: {
    fontSize: 16,
    color: '#FF4444',
    fontWeight: 'bold',
  },
  rahuWarning: {
    fontSize: 13,
    lineHeight: 20,
    opacity: 0.8,
  },
  activitiesRow: {
    flexDirection: 'row',
    marginHorizontal: 20,
    gap: 10,
  },
  activityCard: {
    flex: 1,
    borderRadius: 12,
    borderWidth: 1,
    padding: 12,
  },
  activityHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 8,
  },
  activityTitle: {
    fontSize: 13,
  },
  activityItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
    marginBottom: 4,
  },
  activityText: {
    fontSize: 13,
    flex: 1,
  },
});

export default PanchangScreen;
