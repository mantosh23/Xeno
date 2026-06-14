import React, { createContext, useContext } from 'react';

const IntegrationsContext = createContext<any>(null);

export const useIntegrationsContext = () => useContext(IntegrationsContext);

export const IntegrationsProvider = ({ children }: { children: React.ReactNode }) => (
  <IntegrationsContext.Provider value={{}}>{children}</IntegrationsContext.Provider>
);
