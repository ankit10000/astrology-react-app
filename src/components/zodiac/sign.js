import PropTypes from 'prop-types';
import React from 'react';
import { StyleSheet, View } from 'react-native';
import { Text, TouchableRipple } from 'react-native-paper';

import { Zodiac } from '../../svgs';
import PlatformUtils from '../../utils/platform';

const signs = {
  Aquarius: Zodiac.Aquarius,
  Aries: Zodiac.Aries,
  Cancer: Zodiac.Cancer,
  Capricorn: Zodiac.Capricorn,
  Gemini: Zodiac.Gemini,
  Leo: Zodiac.Leo,
  Libra: Zodiac.Libra,
  Pisces: Zodiac.Pisces,
  Sagittarius: Zodiac.Sagittarius,
  Scorpio: Zodiac.Scorpio,
  Taurus: Zodiac.Taurus,
  Virgo: Zodiac.Virgo,
};

function Sign({
  sign,
  title,
  showTitle = true,
  subtitle,
  onPress = () => null,
  style,
  signHeight = 120,
  signWidth = 120,
  styleTitle,
  styleSubtitle,
}) {
  const ParsedSign = signs[sign];
  const isAndroid = PlatformUtils.isAndroid;
  return (
    <TouchableRipple
      onPress={() => onPress(sign)}
      underlayColor="#ffffff00"
      rippleColor="#ffffff00"
      style={[{ alignItems: 'center', justifyContent: 'center' }, style]}
    >
      <>
        <View
          style={[
            {
              shadowColor: '#000000',
              width: signWidth,
              height: signHeight,
            },
            {
              elevation: isAndroid ? 0 : 10,
            },
            styles.signContainer,
            styles.signShadow,
          ]}
        >
          <ParsedSign width={signHeight} height={signWidth} />
        </View>
        {showTitle && (
          <Text variant="titleMedium" style={styleTitle}>
            {title ?? sign}
          </Text>
        )}
        {subtitle && (
          <Text variant="bodySmall" style={styleSubtitle}>
            {subtitle}
          </Text>
        )}
      </>
    </TouchableRipple>
  );
}

const styles = StyleSheet.create({
  signShadow: {
    shadowOffset: {
      width: 0,
      height: 6,
    },
    shadowOpacity: 0.3,
    shadowRadius: 10,
  },
  signContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 100,
  },
});

Sign.propTypes = {
  sign: PropTypes.string.isRequired,
  title: PropTypes.string,
  showTitle: PropTypes.bool,
  subtitle: PropTypes.string,
  onPress: PropTypes.func,
  style: PropTypes.object,
  styleTitle: PropTypes.object,
  styleSubtitle: PropTypes.object,
  width: PropTypes.oneOfType([PropTypes.number, PropTypes.string]).isRequired,
  height: PropTypes.oneOfType([PropTypes.number, PropTypes.string]).isRequired,
};

export default Sign;
