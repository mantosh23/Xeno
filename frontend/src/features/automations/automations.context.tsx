import React, { createContext, useContext } from 'react';

const AutomationsContext = createContext<any>(null);

export const useAutomationsContext = () => useContext(AutomationsContext);

export const AutomationsProvider = ({ children }: { children: React.ReactNode }) => (
  <AutomationsContext.Provider value={{}}>{children}</AutomationsContext.Provider>
);
