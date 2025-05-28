import React, { createContext, ReactNode } from 'react';

export const AdminContext = createContext(null);

export interface AdminContextProviderProps {
  children: ReactNode;
}

export const AdminContextProvider: React.FC<AdminContextProviderProps> = ({
  children,
}: AdminContextProviderProps) => {
  return <AdminContext.Provider value={null}>{children}</AdminContext.Provider>;
};
