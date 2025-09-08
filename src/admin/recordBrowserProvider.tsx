import { useNavigate, useLocation } from "@remix-run/react";
import { ActionIcon, Group, Text, Tooltip } from "@mantine/core";
import { IconChevronLeft, IconChevronRight, IconChevronsLeft, IconChevronsRight } from "@tabler/icons-react";
import React, { createContext, useState, useContext, useCallback, useMemo, useEffect } from "react";
import { getLogger } from "../utils/pinoLogger";
import type { ReactNode } from "react";

interface RecordBrowserContextType<T = any> {
  records: T[];
  updateRecords: (recs: T[], opts?: { priority?: number }) => void;
  currentId: any | null;
  setCurrentId: (id: any) => void;
  getId: (r: T) => any;
  currentPriority: number;
  setPriority: (p: number) => void;
}
export const RecordBrowserContext = createContext<RecordBrowserContextType | null>(null);

export function RecordBrowserProvider<T = any>({
  children,
  initialRecords = [] as T[],
  getId = (r: any) => (r ? (r as any).id : null),
  initialCurrentId,
}: {
  children: ReactNode;
  initialRecords?: T[];
  getId?: (r: T) => any;
  initialCurrentId?: any;
}) {
  const log = getLogger("timber");
  const [records, setRecords] = useState<T[]>(initialRecords);
  const [currentId, setCurrentId] = useState<any>(initialCurrentId !== undefined ? initialCurrentId : initialRecords.length ? getId(initialRecords[0]) : null);
  const [currentPriority, setCurrentPriority] = useState<number>(0);
  useEffect(() => {
    console.log("RecordBrowserProvider mounted/updated");
    log.debug({ count: records.length, currentId }, "RecordBrowserProvider mounted/updated");
  }, []);
  const updateRecords = useCallback(
    (newRecords: T[], opts?: { priority?: number }) => {
      const incomingPriority = opts?.priority ?? currentPriority;
      log.debug({ newCount: newRecords.length, prevCount: records.length }, "updateRecords called");
      if (incomingPriority < currentPriority) {
        log.debug({ incomingPriority, currentPriority }, "skipping update due to lower priority");
        return;
      }
      // Shallow id diff to avoid unnecessary state loops
      const sameLength = newRecords.length === records.length;
      let sameIds = sameLength;
      if (sameLength) {
        for (let i = 0; i < newRecords.length; i++) {
          if (getId(newRecords[i]) !== getId(records[i])) {
            sameIds = false;
            break;
          }
        }
      }
      if (!sameLength || !sameIds) {
        log.debug({ sameLength, sameIds }, "records changed; committing");
        if (incomingPriority > currentPriority) setCurrentPriority(incomingPriority);
        setRecords(newRecords);
        if (newRecords.length && !newRecords.some((r) => getId(r) === currentId)) {
          const nextId = getId(newRecords[0]);
          log.debug({ nextId }, "currentId not in list; setting first id");
          setCurrentId(nextId);
        }
      } else {
        log.debug("records unchanged; skipping state update");
      }
    },
    [currentId, getId, records, currentPriority]
  );
  const value = useMemo(
    () => ({ records, updateRecords, currentId, setCurrentId, getId, currentPriority, setPriority: setCurrentPriority }),
    [records, updateRecords, currentId, getId, currentPriority]
  );
  return <RecordBrowserContext.Provider value={value}>{children}</RecordBrowserContext.Provider>;
}

export function useRecordBrowserContext<T = any>({ optional = false }: { optional?: boolean } = {}) {
  const ctx = useContext(RecordBrowserContext) as RecordBrowserContextType<T> | null;
  if (!ctx && !optional) throw new Error("useRecordBrowserContext must be used within a RecordBrowserProvider");
  return ctx;
}

/**
 * Backward-compatible hook; also syncs currentId into context (if present) and exposes first/last navigation.
 * If masterRecords provided, it overrides context records; navigation uses relative path by default.
 */
export function useRecordBrowser<T = any>(currentId: any, masterRecords: T[] | null = null) {
  const log = getLogger("timber");
  const navigate = useNavigate();
  const location = useLocation();
  const context = useRecordBrowserContext<T>({ optional: true });
  const records = masterRecords ?? context?.records ?? [];
  const getId = context?.getId || ((r: any) => (r ? (r as any).id : null));
  // Sync current id into context if context present and no master override
  useEffect(() => {
    if (context && masterRecords == null && currentId != null && currentId !== context.currentId) {
      context.setCurrentId(currentId);
    }
  }, [context, currentId, masterRecords]);

  const currentIndex = records.findIndex((record: any) => getId(record) === currentId);
  const numRecords = records.length;
  const buildPath = (idx: number) => {
    const rec = records[idx];
    const id = getId(rec);
    const search = location.search || "";
    // Strategy: replace final path segment with new id; if no slash, just append
    const parts = location.pathname.split("/").filter(Boolean);
    if (parts.length) {
      parts[parts.length - 1] = String(id);
      const path = `/${parts.join("/")}${search}`;
      log.debug({ idx, id, path }, "buildPath");
      return path;
    }
    return String(id);
  };
  const firstRecord = () => {
    if (numRecords > 0 && currentIndex !== 0) navigate(buildPath(0), { relative: "path" });
  };
  const lastRecord = () => {
    if (numRecords > 0 && currentIndex !== numRecords - 1) navigate(buildPath(numRecords - 1), { relative: "path" });
  };
  const nextRecord = () => {
    if (currentIndex < numRecords - 1) navigate(buildPath(currentIndex + 1), { relative: "path" });
  };
  const prevRecord = () => {
    if (currentIndex > 0) navigate(buildPath(currentIndex - 1), { relative: "path" });
  };

  return { currentIndex, numRecords, nextRecord, prevRecord, firstRecord, lastRecord } as const;
}

/** Register current record id explicitly (alternative to passing into useRecordBrowser) */
export function useRegisterCurrentRecordId(id: any) {
  const ctx = useRecordBrowserContext({ optional: true });
  useEffect(() => {
    if (ctx && id != null && id !== ctx.currentId) ctx.setCurrentId(id);
  }, [ctx, id]);
}

/** Ensure this component's updates win while mounted. Resets priority to 0 on unmount. */
export function useRecordBrowserPriority(priority: number) {
  const ctx = useRecordBrowserContext({ optional: true });
  useEffect(() => {
    if (!ctx) return;
    const prev = ctx.currentPriority;
    if (priority > prev) ctx.setPriority(priority);
    return () => {
      // Reset to 0 on unmount if this hook had raised the priority
      if (ctx.currentPriority === priority) ctx.setPriority(0);
    };
  }, [ctx, priority]);
}

/**
 * Header widget showing first/prev/next/last and index/total. Renders nothing if no provider context.
 */
export const RecordBrowserWidget = ({
  size = "sm",
  withTooltips = true,
  navigate: navigateProp,
  location: locationProp,
}: {
  size?: "xs" | "sm" | "md" | "lg" | "xl";
  withTooltips?: boolean;
  navigate?: (path: string) => void;
  location?: { pathname: string; search: string };
}) => {
  const log = getLogger("timber");
  const ctx = useRecordBrowserContext({ optional: true });
  const navigate =
    navigateProp ??
    ((path: string) => {
      if (typeof window !== "undefined") window.location.assign(path);
    });
  const location = locationProp ?? (typeof window !== "undefined" ? { pathname: window.location.pathname, search: window.location.search } : { pathname: "", search: "" });
  if (!ctx || !ctx.records.length || ctx.currentId == null) return null;
  const { records, currentId, getId } = ctx;
  const idx = records.findIndex((r) => getId(r) === currentId);
  const total = records.length;
  const canPrev = idx > 0;
  const canNext = idx < total - 1;
  const go = (targetIndex: number) => {
    if (targetIndex < 0 || targetIndex >= total) return;
    const rec = records[targetIndex];
    const id = getId(rec);
    const search = location.search || "";
    const path = (() => {
      const parts = location.pathname.split("/").filter(Boolean);
      if (parts.length) {
        parts[parts.length - 1] = String(id);
        return `/${parts.join("/")}${search}`;
      }
      return String(id);
    })();
    log.debug({ currentId, targetIndex, id, path }, "widget nav");
    try {
      navigate(path);
    } catch (e) {
      log.warn({ err: e }, "navigate failed, hard redirect");
      if (typeof window !== "undefined") window.location.assign(path);
    }
  };
  const wrap = (children: ReactNode, label: string) =>
    withTooltips ? (
      <Tooltip label={label} openDelay={300} withinPortal>
        {children as any}
      </Tooltip>
    ) : (
      <>{children}</>
    );
  return (
    <Group gap={4} align="center">
      {wrap(
        <ActionIcon size={size} variant="subtle" onClick={() => go(0)} disabled={!canPrev} aria-label="First record">
          <IconChevronsLeft size={16} />
        </ActionIcon>,
        "First"
      )}
      {wrap(
        <ActionIcon size={size} variant="subtle" onClick={() => go(idx - 1)} disabled={!canPrev} aria-label="Previous record">
          <IconChevronLeft size={16} />
        </ActionIcon>,
        "Previous"
      )}
      <Text size="sm" fw={500} style={{ width: 70, textAlign: "center" }}>
        {idx + 1} / {total}
      </Text>
      {wrap(
        <ActionIcon size={size} variant="subtle" onClick={() => go(idx + 1)} disabled={!canNext} aria-label="Next record">
          <IconChevronRight size={16} />
        </ActionIcon>,
        "Next"
      )}
      {wrap(
        <ActionIcon size={size} variant="subtle" onClick={() => go(total - 1)} disabled={!canNext} aria-label="Last record">
          <IconChevronsRight size={16} />
        </ActionIcon>,
        "Last"
      )}
    </Group>
  );
};

export function RecordNavButtons({ recordBrowser }: { recordBrowser: ReturnType<typeof useRecordBrowser> }) {
  return (
    <Group gap={4}>
      <ActionIcon onClick={recordBrowser.firstRecord} variant="outline" disabled={recordBrowser.currentIndex === 0} aria-label="First">
        <IconChevronsLeft />
      </ActionIcon>
      <ActionIcon onClick={recordBrowser.prevRecord} variant="outline" disabled={recordBrowser.currentIndex === 0} aria-label="Previous">
        <IconChevronLeft />
      </ActionIcon>
      <Text size="sm" fw={500}>
        {recordBrowser.currentIndex + 1} / {recordBrowser.numRecords}
      </Text>
      <ActionIcon onClick={recordBrowser.nextRecord} variant="outline" disabled={recordBrowser.currentIndex === recordBrowser.numRecords - 1} aria-label="Next">
        <IconChevronRight />
      </ActionIcon>
      <ActionIcon onClick={recordBrowser.lastRecord} variant="outline" disabled={recordBrowser.currentIndex === recordBrowser.numRecords - 1} aria-label="Last">
        <IconChevronsRight />
      </ActionIcon>
    </Group>
  );
}

// Alias for header usage (some bundlers may drop unused named export in edge cases)
export const HeaderRecordNavigator = RecordBrowserWidget;

// Removed path builder registration hook; navigation now infers path by replacing the trailing segment.
