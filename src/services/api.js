import { SESSION_KEY } from '../constants/session';
import Storer from '../utils/storer';

const API_BASE_URL = __DEV__
  ? 'http://192.168.1.2:3000/api'
  : 'https://astro-backend-tibu.onrender.com/api';

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
    signup: (name, email, password) =>
      request('POST', '/auth/signup', { name, email, password }),
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
};

export default api;
