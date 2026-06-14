import React, { createContext, useContext } from 'react';

const CampaignsContext = createContext<any>(null);

export const useCampaignsContext = () => useContext(CampaignsContext);

export const CampaignsProvider = ({ children }: { children: React.ReactNode }) => (
  <CampaignsContext.Provider value={{}}>{children}</CampaignsContext.Provider>
);
