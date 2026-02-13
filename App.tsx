import React from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { initialState, reducer, StateProvider } from './src/contexts/global';
import Main from './src/main';

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
