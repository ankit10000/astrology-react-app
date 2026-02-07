import PropTypes from 'prop-types';
import React from 'react';
import { Animated, View } from 'react-native';

/**
 * @param start {boolean}
 * @param style {object}
 * @returns {*}
 * @constructor
 */
function Scanner({ start = false, style }) {
  const fadeAnim = React.useRef(new Animated.Value(0)).current;
  const [increase, setIncrease] = React.useState(true);

  React.useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: increase ? 1 : 0,
      duration: 2000,
    }).start(() => {
      setIncrease(!increase);
    });
  }, [fadeAnim, increase]);

  return (
    <View style={{ flex: 1, justifyContent: 'center' }}>
      <Animated.View
        style={[
          {
            flex: fadeAnim.interpolate({
              inputRange: [0, 1],
              outputRange: [0, 1],
            }),
          },
          style,
        ]}
      />
    </View>
  );
}

Scanner.propTypes = {
  start: PropTypes.bool,
  style: PropTypes.object,
};

export default Scanner;
