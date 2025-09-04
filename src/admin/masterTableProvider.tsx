import { createContext, useContext, useMemo, useState } from "react";
import type { ReactNode } from "react";

interface MasterTableContextType<T = any> {
  records: T[];
}
const MasterTableContext = createContext<MasterTableContextType | null>(null);

export function MasterTableProvider<T = any>({ children, initialRecords }: { children: ReactNode; initialRecords: T[] }) {
  return <MasterTableContext.Provider value={{ records: initialRecords }}>{children}</MasterTableContext.Provider>;
}

export function useMasterTable<T = any>() {
  const context = useContext(MasterTableContext) as MasterTableContextType<T> | null;
  if (!context) throw new Error("useMasterTable must be used within a MasterTableProvider");
  return context;
}
