import React, { createContext, useContext } from 'react';

const SettingsContext = createContext<any>(null);

export const useSettingsContext = () => useContext(SettingsContext);

export const SettingsProvider = ({ children }: { children: React.ReactNode }) => (
  <SettingsContext.Provider value={{}}>{children}</SettingsContext.Provider>
);
