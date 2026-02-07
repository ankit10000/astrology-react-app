import React from 'react';

import './src/i18n';
import Main from './src/main';
import { initialState, reducer, StateProvider } from './src/contexts/global';

function App() {
  return (
    <StateProvider initialState={initialState} reducer={reducer}>
      <Main />
    </StateProvider>
  );
}

export default App;
