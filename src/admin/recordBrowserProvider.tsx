import { useNavigate } from "@remix-run/react";
import { ActionIcon, Group } from "@mantine/core";
import { IconChevronLeft, IconChevronRight } from "@tabler/icons-react";
import React, { createContext, useState, useContext, useCallback, useMemo } from "react";
import type { ReactNode } from "react";

interface RecordBrowserContextType<T = any> {
  records: T[];
  updateRecords: (recs: T[]) => void;
}
const RecordBrowserContext = createContext<RecordBrowserContextType | null>(null);

export function RecordBrowserProvider<T = any>({ children, initialRecords = [] as T[] }: { children: ReactNode; initialRecords?: T[] }) {
  const [records, setRecords] = useState<T[]>(initialRecords);
  const updateRecords = useCallback((newRecords: T[]) => setRecords(newRecords), []);
  const value = useMemo(() => ({ records, updateRecords }), [records, updateRecords]);
  return <RecordBrowserContext.Provider value={value}>{children}</RecordBrowserContext.Provider>;
}

export function useRecordBrowserContext<T = any>({ optional = false }: { optional?: boolean } = {}) {
  const ctx = useContext(RecordBrowserContext) as RecordBrowserContextType<T> | null;
  if (!ctx && !optional) throw new Error("useRecordBrowserContext must be used within a RecordBrowserProvider");
  return ctx;
}

export function useRecordBrowser<T = any>(currentId: any, masterRecords: T[] | null = null) {
  const navigate = useNavigate();
  const context = useRecordBrowserContext<T>({ optional: true });
  const records = masterRecords ?? context?.records ?? [];
  const currentIndex = records.findIndex((record: any) => (record as any).id === currentId);

  const nextRecord = () => {
    if (currentIndex < (records as any).length - 1) navigate(`../${(records as any)[currentIndex + 1].id}/${location.search}`, { relative: "path" });
  };
  const prevRecord = () => {
    if (currentIndex > 0) navigate(`../${(records as any)[currentIndex - 1].id}/${location.search}`, { relative: "path" });
  };

  return { currentIndex, numRecords: (records as any).length, nextRecord, prevRecord } as const;
}

export function RecordNavButtons({ recordBrowser }: { recordBrowser: ReturnType<typeof useRecordBrowser> }) {
  return (
    <Group>
      <ActionIcon onClick={recordBrowser.prevRecord} variant="outline" disabled={recordBrowser.currentIndex === 0}>
        <IconChevronLeft />
      </ActionIcon>
      <ActionIcon onClick={recordBrowser.nextRecord} variant="outline" disabled={recordBrowser.currentIndex === recordBrowser.numRecords - 1}>
        <IconChevronRight />
      </ActionIcon>
    </Group>
  );
}
