import React, { createContext, useContext } from 'react';

const StrategyContext = createContext<any>(null);

export const useStrategyContext = () => useContext(StrategyContext);

export const StrategyProvider = ({ children }: { children: React.ReactNode }) => (
  <StrategyContext.Provider value={{}}>{children}</StrategyContext.Provider>
);
