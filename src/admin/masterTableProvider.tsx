import { createContext, useContext } from "react";
import type { ReactNode } from "react";
import { getLogger } from "../utils/pinoLogger";
interface MasterTableContextType<T = any> {
  records: T[];
}
const MasterTableContext = createContext<MasterTableContextType | null>(null);

export function MasterTableProvider<T = any>({ children, initialRecords }: { children: ReactNode; initialRecords: T[] }) {
  const log = getLogger("timber");
  console.log("Creating MasterTable context");
  log.debug({ context: { records: initialRecords } }, "Creating MasterTable context");
  return <MasterTableContext.Provider value={{ records: initialRecords }}>{children}</MasterTableContext.Provider>;
}

export function useMasterTable<T = any>() {
  const context = useContext(MasterTableContext) as MasterTableContextType<T> | null;
  const log = getLogger("timber");
  log.debug({ context }, "using MasterTable context");

  if (!context) throw new Error("useMasterTable must be used within a MasterTableProvider");
  return context;
}
