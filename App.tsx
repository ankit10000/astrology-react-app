import React from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import './src/i18n';
import Main from './src/main';
import { initialState, reducer, StateProvider } from './src/contexts/global';

function App() {
  return (
    <SafeAreaProvider>
      <StateProvider initialState={initialState} reducer={reducer}>
        <Main />
      </StateProvider>
    </SafeAreaProvider>
  );
}

export default App;
