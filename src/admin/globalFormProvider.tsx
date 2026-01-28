import { useBlocker, useNavigate } from "@remix-run/react";
import { createContext, useContext, useState, useRef, useCallback, useMemo, useEffect } from "react";
import type { ReactNode } from "react";

export interface GlobalFormContextType {
  isDirty: boolean;
  markDirty: (isDirty: boolean) => void;
  registerHandlers: (save: () => void, cancel: () => void) => void;
  saveHandlerRef: React.MutableRefObject<(() => void) | null>;
  cancelHandlerRef: React.MutableRefObject<(() => void) | null>;
  setBlockHandler: React.Dispatch<React.SetStateAction<() => void>>;
  blocker: ReturnType<typeof useBlocker>;
  registerBlockHandler: (block: () => void) => void;
  forceNavigate: (to: string) => void;
}

const FormContext = createContext<GlobalFormContextType | null>(null);

interface GlobalFormProviderProps {
  children: ReactNode;
}

export function GlobalFormProvider({ children }: GlobalFormProviderProps) {
  const [isDirty, setIsDirty] = useState(false);
  const [blockHandler, setBlockHandler] = useState<() => void>(() => () => {});
  const bypassBlockerRef = useRef(false);
  const navigate = useNavigate();

  const saveHandlerRef = useRef<(() => void) | null>(null);
  const cancelHandlerRef = useRef<(() => void) | null>(null);

  const blockerFunction = useCallback(
    ({ currentLocation, nextLocation }: any) => {
      const sanitizeSearch = (search: string) => search.replace(/[?&]/g, "").replace("index", "");

      const shouldBlock =
        !bypassBlockerRef.current &&
        isDirty &&
        (currentLocation.pathname !== nextLocation.pathname || sanitizeSearch(currentLocation.search) !== sanitizeSearch(nextLocation.search));

      if (shouldBlock) blockHandler();

      return shouldBlock;
    },
    [isDirty, blockHandler],
  );

  const blocker = useBlocker(blockerFunction);

  const markDirty = useCallback((dirty: boolean) => setIsDirty(dirty), []);

  const forceNavigate = useCallback(
    (to: string) => {
      bypassBlockerRef.current = true;
      navigate(to);
      setTimeout(() => {
        bypassBlockerRef.current = false;
      }, 1000);
    },
    [navigate],
  );

  const registerHandlers = useCallback((save: () => void, cancel: () => void) => {
    saveHandlerRef.current = save;
    cancelHandlerRef.current = cancel;
  }, []);

  const registerBlockHandler = useCallback((block: () => void) => {
    setBlockHandler(() => block);
  }, []);

  const value = useMemo<GlobalFormContextType>(
    () => ({
      isDirty,
      markDirty,
      registerHandlers,
      saveHandlerRef,
      cancelHandlerRef,
      setBlockHandler,
      blocker,
      registerBlockHandler,
      forceNavigate,
    }),
    [isDirty, markDirty, registerHandlers, blocker, registerBlockHandler, forceNavigate],
  );

  return <FormContext.Provider value={value}>{children}</FormContext.Provider>;
}

export function useGlobalFormContext(): GlobalFormContextType {
  const context = useContext(FormContext);
  if (!context) throw new Error("useGlobalFormContext must be used within a GlobalFormProvider");
  return context;
}

interface FormHandlers<T> {
  handleSubmit: (onSubmit: (data: T) => void) => () => void;
  reset: () => void;
  formState: { isDirty: boolean };
}

export function useInitGlobalFormContext<T>(formHandlers: FormHandlers<T>, onSubmit: (data: T) => void, onCancel: () => void) {
  const { registerHandlers, markDirty, blocker, forceNavigate } = useGlobalFormContext();
  useEffect(() => {
    const cancelHandler =
      !onCancel || (onCancel as any) === "undefined"
        ? () => {
            formHandlers.reset();
          }
        : onCancel;
    registerHandlers(formHandlers.handleSubmit(onSubmit), cancelHandler);
  }, [formHandlers, onSubmit, onCancel, registerHandlers]);

  useEffect(() => {
    markDirty(formHandlers.formState.isDirty);
  }, [formHandlers.formState.isDirty, markDirty]);

  return { blocker, forceNavigate };
}
