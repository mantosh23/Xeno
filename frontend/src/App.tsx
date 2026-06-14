import React from 'react';
import { BrowserRouter } from 'react-router-dom';
import { AppNavigator } from './navigation/AppNavigator';

/**
 * Root Application Component
 * 
 * Provides the top-level Router context and mounts the AppNavigator.
 * 
 * @returns {JSX.Element}
 */
function App() {
  return (
    <BrowserRouter>
      <AppNavigator />
    </BrowserRouter>
  );
}

export default App;
