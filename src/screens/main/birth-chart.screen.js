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
import { useGlobals } from '../../contexts/global';
import api from '../../services/api';
import Storer from '../../utils/storer';

const SectionCard = ({ icon, title, children }) => {
  const { colors } = useTheme();
  return (
    <View style={[styles.card, { borderColor: colors.text + '1A', backgroundColor: colors.surface }]}>
      <View style={styles.cardHeader}>
        <MaterialCommunityIcons name={icon} size={20} color={colors.primary} />
        <TextBold style={[styles.cardTitle, { color: colors.primary }]}>{title}</TextBold>
      </View>
      {children}
    </View>
  );
};

const PlanetRow = ({ planet, placement, effect }) => {
  const { colors } = useTheme();
  return (
    <View style={styles.planetRow}>
      <View style={styles.planetLabel}>
        <TextBold style={{ fontSize: 13 }}>{planet}</TextBold>
        <Text style={[styles.placement, { color: colors.primary }]}>{placement}</Text>
      </View>
      <Text style={styles.planetEffect}>{effect}</Text>
    </View>
  );
};

const TagList = ({ items, color }) => (
  <View style={styles.tagRow}>
    {items.map((item, i) => (
      <View key={i} style={[styles.tag, { backgroundColor: color + '22', borderColor: color + '44' }]}>
        <Text style={[styles.tagText, { color }]}>{item}</Text>
      </View>
    ))}
  </View>
);

function BirthChartScreen() {
  const [{ session }] = useGlobals();
  const { colors } = useTheme();
  const [data, setData] = React.useState(null);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState(null);

  const birthDate = session.birthDate
    ? new Date(session.birthDate)
    : null;

  React.useEffect(() => {
    if (!session?.sign || !session?.birthDate) return;
    let cancelled = false;
    const CACHE_KEY = `birth_chart_${session.sign}_${session.birthDate}`;
    const SEVEN_DAYS = 7 * 24 * 60 * 60 * 1000;

    const fetchChart = async () => {
      setLoading(true);
      setError(null);

      try {
        const cached = await Storer.get(CACHE_KEY);
        if (cached && Date.now() - cached.timestamp < SEVEN_DAYS) {
          if (!cancelled) {
            setData(cached.data);
            setLoading(false);
          }
          return;
        }
      } catch {}

      try {
        const result = await api.vedic.getBirthChart(session.sign, session.birthDate);
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

    fetchChart();
    return () => { cancelled = true; };
  }, [session?.sign, session?.birthDate]);

  const Header = (
    <View>
      <MainNav />
      <View style={styles.headerContainer}>
        <Sign sign={session.sign} showTitle={false} signWidth={70} signHeight={70} />
        <ShadowHeadline style={styles.headerHeadline}>Birth Chart</ShadowHeadline>
        {birthDate && (
          <Text variant="titleMedium">
            {`${birthDate.getDate()} ${months[birthDate.getMonth()]}, ${birthDate.getFullYear()}`}
          </Text>
        )}
        <View style={[styles.noteBadge, { backgroundColor: colors.primary + '22' }]}>
          <MaterialCommunityIcons name="information-outline" size={13} color={colors.primary} />
          <Text style={[styles.noteText, { color: colors.primary }]}>
            Based on Sun sign · Add birth time for full accuracy
          </Text>
        </View>
      </View>
      <Divider />
    </View>
  );

  if (!session?.birthDate) {
    return (
      <>
        <SpaceSky />
        <SafeAreaView style={styles.centered}>
          <MainNav />
          <MaterialCommunityIcons name="chart-arc" size={48} color="#666" style={{ marginBottom: 12 }} />
          <Text style={{ textAlign: 'center', opacity: 0.6, paddingHorizontal: 40 }}>
            Birth date not set.{'\n'}Please update your profile with your date of birth.
          </Text>
        </SafeAreaView>
      </>
    );
  }

  if (loading) {
    return (
      <>
        <SpaceSky />
        <SafeAreaView style={styles.centered}>
          <ProgressBar indeterminate style={{ width: 200, borderRadius: 5 }} />
          <Text style={{ marginTop: 15 }}>Reading your chart...</Text>
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
            <SectionCard icon="zodiac-virgo" title="Ascendant (Lagna)">
              <Text style={styles.cardBody}>{data.ascendant}</Text>
            </SectionCard>

            <SectionCard icon="moon-waning-crescent" title="Moon Sign">
              <Text style={styles.cardBody}>{data.moonSign}</Text>
            </SectionCard>

            <SectionCard icon="white-balance-sunny" title="Sun Sign">
              <Text style={styles.cardBody}>{data.sunSign}</Text>
            </SectionCard>

            <SectionCard icon="star-four-points" title="Birth Nakshatra">
              <Text style={styles.cardBody}>{data.nakshatra}</Text>
            </SectionCard>

            <SectionCard icon="orbit" title="Planetary Highlights">
              {data.planetaryHighlights.map((p, i) => (
                <PlanetRow key={i} {...p} />
              ))}
            </SectionCard>

            <SectionCard icon="book-open-variant" title="Life Theme & Soul Purpose">
              <Text style={styles.cardBody}>{data.lifeTheme}</Text>
            </SectionCard>

            <View style={styles.row}>
              <View style={{ flex: 1, marginRight: 8 }}>
                <SectionCard icon="arm-flex" title="Strengths">
                  <TagList items={data.strengths} color={colors.primary} />
                </SectionCard>
              </View>
              <View style={{ flex: 1, marginLeft: 8 }}>
                <SectionCard icon="alert-circle-outline" title="Challenges">
                  <TagList items={data.challenges} color={colors.secondary} />
                </SectionCard>
              </View>
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
    gap: 8,
  },
  headerHeadline: {
    fontWeight: 'bold',
    fontSize: 30,
    lineHeight: 34,
    marginTop: 12,
  },
  noteBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 20,
    marginTop: 4,
  },
  noteText: {
    fontSize: 11,
  },
  card: {
    marginHorizontal: 20,
    marginTop: 16,
    borderRadius: 12,
    borderWidth: 1,
    padding: 14,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },
  cardTitle: {
    fontSize: 14,
  },
  cardBody: {
    fontSize: 14,
    lineHeight: 22,
    opacity: 0.85,
  },
  planetRow: {
    marginBottom: 10,
  },
  planetLabel: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 2,
  },
  placement: {
    fontSize: 12,
    fontStyle: 'italic',
  },
  planetEffect: {
    fontSize: 13,
    lineHeight: 20,
    opacity: 0.8,
  },
  tagRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginTop: 4,
  },
  tag: {
    borderWidth: 1,
    borderRadius: 20,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  tagText: {
    fontSize: 12,
  },
  row: {
    flexDirection: 'row',
    marginHorizontal: 20,
    marginTop: 16,
  },
});

export default BirthChartScreen;
