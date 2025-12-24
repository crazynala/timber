import { useBlocker, useNavigate } from "@remix-run/react";
import { createContext, useContext, useState, useRef, useCallback, useMemo, useEffect } from "react";
import { useForm, useFormState } from "react-hook-form";
import type { ReactNode } from "react";

export interface GlobalFormContextType {
  isDirty: boolean;
  markDirty: (isDirty: boolean) => void;
  registerHandlers: (save: () => void, cancel: () => void) => void;
  saveHandlerRef: React.MutableRefObject<(() => void) | null>;
  cancelHandlerRef: React.MutableRefObject<(() => void) | null>;
  setBlockHandler: React.Dispatch<React.SetStateAction<() => void>>;
  registerBlockHandler: (block: () => void) => void;
  // Router-bridge functions (set inside route context)
  registerNavigate: (fn: (to: string) => void) => void;
  makeBlockerFunction: () => ({ currentLocation, nextLocation }: any) => boolean;
  forceNavigate: (to: string) => void;
  formInstanceId: string | null;
  registerFormInstanceId: (id: string | null) => void;
}

const FormContext = createContext<GlobalFormContextType | null>(null);

interface GlobalFormProviderProps {
  children: ReactNode;
}

export function GlobalFormProvider({ children }: GlobalFormProviderProps) {
  const [isDirty, setIsDirty] = useState(false);
  const [blockHandler, setBlockHandler] = useState<() => void>(() => () => {});
  const [formInstanceId, setFormInstanceId] = useState<string | null>(null);
  const bypassBlockerRef = useRef(false);
  const navigateRef = useRef<null | ((to: string) => void)>(null);

  const saveHandlerRef = useRef<(() => void) | null>(null);
  const cancelHandlerRef = useRef<(() => void) | null>(null);

  const blockerFunction = useCallback(
    ({ currentLocation, nextLocation }: any) => {
      const sanitizeSearch = (search: string) => search.replace(/[?&]/g, "").replace("index", "");
      const shouldBlock =
        !bypassBlockerRef.current && isDirty && (currentLocation.pathname !== nextLocation.pathname || sanitizeSearch(currentLocation.search) !== sanitizeSearch(nextLocation.search));
      if (shouldBlock) blockHandler();
      return shouldBlock;
    },
    [isDirty, blockHandler]
  );

  const markDirty = useCallback((dirty: boolean) => setIsDirty(dirty), []);

  const forceNavigate = useCallback((to: string) => {
    bypassBlockerRef.current = true;
    if (navigateRef.current) {
      navigateRef.current(to);
    } else if (typeof window !== "undefined") {
      window.location.assign(to);
    }
    setTimeout(() => {
      bypassBlockerRef.current = false;
    }, 1000);
  }, []);

  const registerHandlers = useCallback((save: () => void, cancel: () => void) => {
    saveHandlerRef.current = save;
    cancelHandlerRef.current = cancel;
  }, []);

  const registerBlockHandler = useCallback((block: () => void) => {
    setBlockHandler(() => block);
  }, []);

  const registerFormInstanceId = useCallback((id: string | null) => {
    setFormInstanceId(id || null);
  }, []);

  const registerNavigate = useCallback((fn: (to: string) => void) => {
    navigateRef.current = fn;
  }, []);

  const value = useMemo<GlobalFormContextType>(
    () => ({
      isDirty,
      markDirty,
      registerHandlers,
      saveHandlerRef,
      cancelHandlerRef,
      setBlockHandler,
      registerBlockHandler,
      registerNavigate,
      makeBlockerFunction: () => blockerFunction,
      forceNavigate,
      formInstanceId,
      registerFormInstanceId,
    }),
    [isDirty, markDirty, registerHandlers, registerBlockHandler, forceNavigate, blockerFunction, formInstanceId, registerFormInstanceId]
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
  control?: any;
}

export function useInitGlobalFormContext<T>(
  formHandlers: FormHandlers<T>,
  onSubmit: (data: T) => void,
  onCancel: () => void,
  options?: { formInstanceId?: string | null }
) {
  const {
    registerHandlers,
    markDirty,
    registerNavigate,
    makeBlockerFunction,
    forceNavigate,
    registerFormInstanceId,
  } = useGlobalFormContext();
  const navigate = useNavigate();
  const blocker = useBlocker(makeBlockerFunction());
  const fallbackForm = useForm({ defaultValues: {} });
  const effectiveControl = formHandlers.control || fallbackForm.control;
  const formState = useFormState({ control: effectiveControl });
  const passedInstanceId = options?.formInstanceId || null;
  const shouldBind = !!formHandlers.control;
  useEffect(() => {
    const cancelHandler =
      !onCancel || (onCancel as any) === "undefined"
        ? () => {
            formHandlers.reset();
          }
        : onCancel;
    if (!shouldBind) return;
    registerHandlers(formHandlers.handleSubmit(onSubmit), cancelHandler);
  }, [formHandlers, onSubmit, onCancel, registerHandlers, shouldBind]);

  useEffect(() => {
    if (!shouldBind) return;
    const dirty = formHandlers.control
      ? formState.isDirty
      : formHandlers.formState.isDirty;
    markDirty(dirty);
  }, [formHandlers.control, formHandlers.formState.isDirty, formState.isDirty, markDirty, shouldBind]);

  useEffect(() => {
    registerNavigate((to: string) => navigate(to));
  }, [navigate, registerNavigate]);

  useEffect(() => {
    if (!shouldBind) return;
    registerFormInstanceId(passedInstanceId);
    return () => registerFormInstanceId(null);
  }, [passedInstanceId, registerFormInstanceId, shouldBind]);

  return { blocker, forceNavigate };
}
