import { Platform } from 'react-native';

interface IPlatformUtils {
  isIos: boolean;
  isAndroid: boolean;
}

const PlatformUtils: IPlatformUtils = {
  isIos: Platform.OS === 'ios',
  isAndroid: Platform.OS === 'android',
};

export default PlatformUtils;
