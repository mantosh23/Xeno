import React, { createContext, useContext } from 'react';

const AudienceContext = createContext<any>(null);

export const useAudienceContext = () => useContext(AudienceContext);

export const AudienceProvider = ({ children }: { children: React.ReactNode }) => (
  <AudienceContext.Provider value={{}}>{children}</AudienceContext.Provider>
);
