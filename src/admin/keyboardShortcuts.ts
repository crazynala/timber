import { useCallback, useMemo } from "react";
import { useHotkeys } from "@mantine/hooks";
import { useGlobalFormContext } from "./globalFormProvider";
import { useRecordBrowser } from "./recordBrowserProvider";

export type HotkeyTuple = [string, (event: KeyboardEvent) => void, { preventDefault?: boolean }?];

/**
 * Registers an array of hotkeys using Mantine's useHotkeys.
 * This enables shortcuts inside form tags/inputs and contenteditable by default.
 */
export function useKeyboardShortcuts(hotkeys: HotkeyTuple[], deps: any[] = []) {
  const hk = useMemo(() => hotkeys, deps); // keep referential stability when deps unchanged
  useHotkeys(hk as any);
}

/** Global: Cmd/Ctrl+S -> invoke global form provider's save handler */
export function useGlobalSaveShortcut() {
  const { saveHandlerRef } = useGlobalFormContext();
  const onSave = useCallback(
    (e: KeyboardEvent) => {
      // prevent browser "Save page"
      e.preventDefault();
      const fn = saveHandlerRef.current;
      if (fn) fn();
    },
    [saveHandlerRef]
  );
  useKeyboardShortcuts([["mod+S", onSave, { preventDefault: true }]], [onSave]);
}

/** Local: Cmd/Ctrl+ArrowRight/ArrowLeft -> record browser next/prev */
export function useRecordBrowserShortcuts(currentId: any, masterRecords: any[] | null = null) {
  const rb = useRecordBrowser(currentId, masterRecords);
  const onNext = useCallback(
    (e: KeyboardEvent) => {
      e.preventDefault();
      rb.nextRecord();
    },
    [rb]
  );
  const onPrev = useCallback(
    (e: KeyboardEvent) => {
      e.preventDefault();
      rb.prevRecord();
    },
    [rb]
  );
  useKeyboardShortcuts(
    [
      ["mod+ArrowRight", onNext, { preventDefault: true }],
      ["mod+ArrowLeft", onPrev, { preventDefault: true }],
    ],
    [onNext, onPrev]
  );
  return rb;
}
