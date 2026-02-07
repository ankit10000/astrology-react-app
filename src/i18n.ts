import * as Localization from 'expo-localization';
import { I18n } from 'i18n-js';

import Translations from './translations';

const i18n = new I18n(Translations);

const languageTag = Localization.getLocales()[0]?.languageTag ?? 'en';
i18n.locale = languageTag;
i18n.enableFallback = true;

export default i18n;
