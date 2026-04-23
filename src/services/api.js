import { SESSION_KEY } from '../constants/session';
import Storer from '../utils/storer';

const API_BASE_URL = __DEV__
  ? 'https://medico-api.vercel.app/api'
  : 'https://medico-api.vercel.app/api';

const request = async (method, path, body = null) => {
  const session = await Storer.get(SESSION_KEY);
  const token = session?.authToken;

  const config = {
    method,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
  };

  if (body) {
    config.body = JSON.stringify(body);
  }

  const res = await fetch(`${API_BASE_URL}${path}`, config);
  const data = await res.json();

  if (!res.ok) {
    throw new Error(data.error || 'Request failed');
  }

  return data;
};

const api = {
  auth: {
    login: (email, password) =>
      request('POST', '/auth/login', { email, password }),
    signup: (name, email, password, role = 'patient') =>
      request('POST', '/auth/register', { name, email, password, role }),
  },
  user: {
    saveOnboarding: (data) => request('POST', '/user/onboarding', data),
    updateProfile: (data) => request('PUT', '/user/profile', data),
  },
  horoscope: {
    getDaily: (sign, lang = 'en') =>
      request('GET', `/horoscope/daily?sign=${sign}&lang=${lang}`),
    getCompatibility: (sign1, sign2, lang = 'en') =>
      request(
        'GET',
        `/horoscope/compatibility?sign1=${sign1}&sign2=${sign2}&lang=${lang}`
      ),
  },
  chat: {
    sendMessage: (message, context, lang = 'en') =>
      request('POST', '/chat', { message, context, lang }),
  },
  vedic: {
    getBirthChart: (sign, birthDate, lang = 'en') =>
      request('GET', `/vedic/birth-chart?sign=${sign}&birthDate=${birthDate}&lang=${lang}`),
    getPanchang: (lang = 'en') =>
      request('GET', `/vedic/panchang?lang=${lang}`),
    getRemedies: (sign, lang = 'en') =>
      request('GET', `/vedic/remedies?sign=${sign}&lang=${lang}`),
  },
};

export default api;
