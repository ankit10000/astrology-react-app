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

const RemedyCard = ({ icon, accentColor, title, children }) => {
  const { colors } = useTheme();
  return (
    <View style={[styles.card, { borderColor: accentColor + '44', backgroundColor: colors.surface }]}>
      <View style={styles.cardHeader}>
        <View style={[styles.cardIconBg, { backgroundColor: accentColor + '22' }]}>
          <MaterialCommunityIcons name={icon} size={20} color={accentColor} />
        </View>
        <TextBold style={[styles.cardTitle, { color: accentColor }]}>{title}</TextBold>
      </View>
      {children}
    </View>
  );
};

const InfoPill = ({ label, value, color }) => {
  const { colors } = useTheme();
  return (
    <View style={[styles.pill, { backgroundColor: color + '15', borderColor: color + '33' }]}>
      <Text style={[styles.pillLabel, { color: colors.text + '77' }]}>{label}</Text>
      <TextBold style={[styles.pillValue, { color }]}>{value}</TextBold>
    </View>
  );
};

function RemediesScreen() {
  const [{ session }] = useGlobals();
  const { colors } = useTheme();
  const [data, setData] = React.useState(null);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState(null);
  const d = new Date();

  React.useEffect(() => {
    if (!session?.sign) return;
    let cancelled = false;
    const today = d.toISOString().split('T')[0];
    const CACHE_KEY = `remedies_${session.sign}_${today}`;
    const TWENTY_FOUR_HOURS = 24 * 60 * 60 * 1000;

    const fetchRemedies = async () => {
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
        const result = await api.vedic.getRemedies(session.sign);
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

    fetchRemedies();
    return () => { cancelled = true; };
  }, [session?.sign]);

  const Header = (
    <View>
      <MainNav />
      <View style={styles.headerContainer}>
        <Sign sign={session.sign} showTitle={false} signWidth={70} signHeight={70} />
        <ShadowHeadline style={styles.headerHeadline}>Remedies</ShadowHeadline>
        <Text variant="titleMedium">
          {`${d.getDate()} ${months[d.getMonth()]}, ${d.getFullYear()}`}
        </Text>
        <Text style={[styles.subtitle, { color: colors.text + '88' }]}>
          Daily Vedic Remedies for {session.sign}
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
          <Text style={{ marginTop: 15 }}>Finding your remedies...</Text>
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
            {data.affirmation ? (
              <View style={[styles.affirmationCard, { borderColor: colors.primary + '55', backgroundColor: colors.primary + '12' }]}>
                <MaterialCommunityIcons name="format-quote-open" size={18} color={colors.primary} />
                <Text style={[styles.affirmationText, { color: colors.text }]}>
                  {data.affirmation}
                </Text>
                <MaterialCommunityIcons name="format-quote-close" size={18} color={colors.primary} style={{ alignSelf: 'flex-end' }} />
              </View>
            ) : null}

            <View style={styles.pillsRow}>
              <InfoPill label="Color" value={data.color} color={colors.primary} />
              <InfoPill label="Direction" value={data.direction} color={colors.secondary} />
            </View>

            <RemedyCard icon="meditation" accentColor="#9C77E8" title="Mantra">
              <TextBold style={styles.mantraText}>{data.mantra.text}</TextBold>
              <Text style={styles.mantraTranslit}>{data.mantra.transliteration}</Text>
              <Text style={[styles.mantraMeaning, { color: colors.text + '88' }]}>
                {data.mantra.meaning}
              </Text>
              <View style={[styles.repetitionsBadge, { backgroundColor: '#9C77E822', borderColor: '#9C77E844' }]}>
                <MaterialCommunityIcons name="rotate-right" size={14} color="#9C77E8" />
                <Text style={[styles.repetitionsText, { color: '#9C77E8' }]}>
                  Repeat {data.mantra.repetitions} times
                </Text>
              </View>
              <Text style={styles.benefitText}>{data.mantra.benefit}</Text>
            </RemedyCard>

            <RemedyCard icon="candle" accentColor="#F5A623" title="Daily Ritual">
              <View style={styles.timingRow}>
                <MaterialCommunityIcons name="clock-outline" size={14} color="#F5A623" />
                <Text style={[styles.timingText, { color: '#F5A623' }]}>{data.ritual.timing}</Text>
              </View>
              {data.ritual.steps.map((step, i) => (
                <View key={i} style={styles.stepRow}>
                  <View style={[styles.stepNumber, { backgroundColor: '#F5A62322' }]}>
                    <Text style={[styles.stepNumberText, { color: '#F5A623' }]}>{i + 1}</Text>
                  </View>
                  <Text style={styles.stepText}>{step}</Text>
                </View>
              ))}
            </RemedyCard>

            <RemedyCard icon="diamond-stone" accentColor="#2196F3" title="Gemstone">
              <TextBold style={styles.gemstoneName}>{data.gemstone.name}</TextBold>
              <View style={styles.gemstoneDetails}>
                <View style={styles.gemstoneDetail}>
                  <Text style={[styles.gemstoneLabel, { color: colors.text + '66' }]}>Planet</Text>
                  <Text style={styles.gemstoneValue}>{data.gemstone.planet}</Text>
                </View>
                <View style={styles.gemstoneDetail}>
                  <Text style={[styles.gemstoneLabel, { color: colors.text + '66' }]}>How to wear</Text>
                  <Text style={styles.gemstoneValue}>{data.gemstone.howToWear}</Text>
                </View>
              </View>
              <Text style={styles.benefitText}>{data.gemstone.benefit}</Text>
            </RemedyCard>

            <RemedyCard icon="hand-heart-outline" accentColor="#4CAF50" title="Donation (Daana)">
              <View style={styles.donationGrid}>
                <View style={styles.donationItem}>
                  <Text style={[styles.donationLabel, { color: colors.text + '66' }]}>What</Text>
                  <TextBold style={styles.donationValue}>{data.donation.item}</TextBold>
                </View>
                <View style={styles.donationItem}>
                  <Text style={[styles.donationLabel, { color: colors.text + '66' }]}>Best Day</Text>
                  <TextBold style={styles.donationValue}>{data.donation.day}</TextBold>
                </View>
                <View style={[styles.donationItem, { flex: 2 }]}>
                  <Text style={[styles.donationLabel, { color: colors.text + '66' }]}>Give To</Text>
                  <TextBold style={styles.donationValue}>{data.donation.recipient}</TextBold>
                </View>
              </View>
              <Text style={styles.benefitText}>{data.donation.benefit}</Text>
            </RemedyCard>

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
  headerHeadline: {
    fontWeight: 'bold',
    fontSize: 30,
    lineHeight: 34,
    marginTop: 12,
  },
  subtitle: {
    fontSize: 13,
    letterSpacing: 0.5,
  },
  affirmationCard: {
    marginHorizontal: 20,
    marginBottom: 8,
    borderRadius: 12,
    borderWidth: 1,
    padding: 14,
    gap: 6,
  },
  affirmationText: {
    fontSize: 15,
    lineHeight: 24,
    fontStyle: 'italic',
    textAlign: 'center',
    paddingHorizontal: 8,
  },
  pillsRow: {
    flexDirection: 'row',
    marginHorizontal: 20,
    marginBottom: 8,
    gap: 10,
  },
  pill: {
    flex: 1,
    borderRadius: 10,
    borderWidth: 1,
    padding: 12,
    alignItems: 'center',
  },
  pillLabel: {
    fontSize: 11,
    letterSpacing: 0.5,
    marginBottom: 4,
  },
  pillValue: {
    fontSize: 15,
  },
  card: {
    marginHorizontal: 20,
    marginTop: 14,
    borderRadius: 12,
    borderWidth: 1,
    padding: 14,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 12,
  },
  cardIconBg: {
    width: 34,
    height: 34,
    borderRadius: 17,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cardTitle: {
    fontSize: 15,
  },
  mantraText: {
    fontSize: 16,
    letterSpacing: 1,
    textAlign: 'center',
    marginBottom: 4,
  },
  mantraTranslit: {
    fontSize: 13,
    fontStyle: 'italic',
    textAlign: 'center',
    marginBottom: 4,
    opacity: 0.7,
  },
  mantraMeaning: {
    fontSize: 13,
    textAlign: 'center',
    marginBottom: 10,
  },
  repetitionsBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    alignSelf: 'center',
    borderWidth: 1,
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 4,
    marginBottom: 10,
  },
  repetitionsText: {
    fontSize: 12,
  },
  benefitText: {
    fontSize: 13,
    lineHeight: 20,
    opacity: 0.75,
  },
  timingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    marginBottom: 10,
  },
  timingText: {
    fontSize: 13,
    fontStyle: 'italic',
  },
  stepRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
    marginBottom: 8,
  },
  stepNumber: {
    width: 22,
    height: 22,
    borderRadius: 11,
    justifyContent: 'center',
    alignItems: 'center',
  },
  stepNumberText: {
    fontSize: 12,
    fontWeight: 'bold',
  },
  stepText: {
    flex: 1,
    fontSize: 14,
    lineHeight: 20,
  },
  gemstoneName: {
    fontSize: 18,
    marginBottom: 10,
  },
  gemstoneDetails: {
    flexDirection: 'row',
    gap: 16,
    marginBottom: 10,
  },
  gemstoneDetail: {
    flex: 1,
  },
  gemstoneLabel: {
    fontSize: 11,
    letterSpacing: 0.5,
    marginBottom: 2,
  },
  gemstoneValue: {
    fontSize: 14,
  },
  donationGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 10,
  },
  donationItem: {
    flex: 1,
  },
  donationLabel: {
    fontSize: 11,
    letterSpacing: 0.5,
    marginBottom: 2,
  },
  donationValue: {
    fontSize: 14,
  },
});

export default RemediesScreen;
