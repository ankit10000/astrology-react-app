import * as Localization from 'expo-localization';

const LANGUAGES = ['es', 'en'];

function getLocale(): string {
  const localeTag = Localization.getLocales()[0]?.languageTag ?? 'en';

  // Extract only language code before region (eg: "en-US" → "en")
  const languageCode = localeTag.split(/[-_]/)[0];

  // Map "ca" to "es", as per your logic
  const customLocale = languageCode === 'ca' ? 'es' : languageCode;

  return LANGUAGES.includes(customLocale) ? customLocale : 'en';
}

const Language = {
  filteredLocale: (): string => getLocale(),
};

export default Language;
