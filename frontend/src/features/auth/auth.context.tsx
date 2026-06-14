import React, { createContext, useContext } from 'react';

const AuthContext = createContext<any>(null);

export const useAuthContext = () => useContext(AuthContext);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => (
  <AuthContext.Provider value={{}}>{children}</AuthContext.Provider>
);
