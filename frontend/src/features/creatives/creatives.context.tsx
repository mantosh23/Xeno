import React, { createContext, useContext } from 'react';

const CreativesContext = createContext<any>(null);

export const useCreativesContext = () => useContext(CreativesContext);

export const CreativesProvider = ({ children }: { children: React.ReactNode }) => (
  <CreativesContext.Provider value={{}}>{children}</CreativesContext.Provider>
);
