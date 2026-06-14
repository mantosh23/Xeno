import React, { createContext, useContext } from 'react';

const DashboardContext = createContext<any>(null);

export const useDashboardContext = () => useContext(DashboardContext);

export const DashboardProvider = ({ children }: { children: React.ReactNode }) => (
  <DashboardContext.Provider value={{}}>{children}</DashboardContext.Provider>
);
