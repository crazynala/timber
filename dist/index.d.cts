import * as react_jsx_runtime from 'react/jsx-runtime';
import * as react_router from 'react-router';
import { useBlocker } from '@remix-run/react';
import * as react from 'react';
import { ReactNode } from 'react';

declare function useFilterSortManagement(initQueryValue: string, initialFilters: any[], initialSort: any, initialView?: any, defaults?: any): {
    appliedSort: any;
    appliedOrDefaultSort: () => any;
    appliedFilters: any[];
    appliedView: any;
    queryValue: string;
    debouncedQueryValue: string;
    handleSortChange: (value: any) => void;
    handleFilterChange: (key: string, value: any) => void;
    handleMultiFilterToggle: (key: string, { value, checked }: any) => void;
    handleClearFilter: (key: string) => void;
    handleClearAllFilters: () => void;
    handleQueryChange: (value: string) => void;
    handleSetView: (view: any) => void;
};

declare function SaveCancelHeader(): react_jsx_runtime.JSX.Element | null;

interface GlobalFormContextType {
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
interface GlobalFormProviderProps {
    children: ReactNode;
}
declare function GlobalFormProvider({ children }: GlobalFormProviderProps): react_jsx_runtime.JSX.Element;
declare function useGlobalFormContext(): GlobalFormContextType;
interface FormHandlers<T> {
    handleSubmit: (onSubmit: (data: T) => void) => () => void;
    reset: () => void;
    formState: {
        isDirty: boolean;
    };
}
declare function useInitGlobalFormContext<T>(formHandlers: FormHandlers<T>, onSubmit: (data: T) => void, onCancel: () => void): {
    blocker: react_router.Blocker;
    forceNavigate: (to: string) => void;
};

declare function usePaginationManager(initPageNumber: number, initTotalRecords: number): {
    readonly pageNumber: number;
    readonly handlePageNumberChange: (page: number) => void;
    readonly totalRecords: number;
    readonly resetToFirstPage: () => void;
    readonly setTotalRecords: react.Dispatch<react.SetStateAction<number>>;
};

interface MasterTableContextType<T = any> {
    records: T[];
}
declare function MasterTableProvider<T = any>({ children, initialRecords }: {
    children: ReactNode;
    initialRecords: T[];
}): react_jsx_runtime.JSX.Element;
declare function useMasterTable<T = any>(): MasterTableContextType<T>;

interface RecordBrowserContextType<T = any> {
    records: T[];
    updateRecords: (recs: T[]) => void;
}
declare function RecordBrowserProvider<T = any>({ children, initialRecords }: {
    children: ReactNode;
    initialRecords?: T[];
}): react_jsx_runtime.JSX.Element;
declare function useRecordBrowserContext<T = any>({ optional }?: {
    optional?: boolean;
}): RecordBrowserContextType<T> | null;
declare function useRecordBrowser<T = any>(currentId: any, masterRecords?: T[] | null): {
    readonly currentIndex: number;
    readonly numRecords: any;
    readonly nextRecord: () => void;
    readonly prevRecord: () => void;
};
declare function RecordNavButtons({ recordBrowser }: {
    recordBrowser: ReturnType<typeof useRecordBrowser>;
}): react_jsx_runtime.JSX.Element;

declare function useAutoQuery(filterSortManager: any, paginationManager: any, defaultValues: any): void;

type BreadcrumbItem = {
    label?: ReactNode;
    title?: string;
    href: string;
};
declare function BreadcrumbSet({ breadcrumbs }: {
    breadcrumbs: BreadcrumbItem[];
}): react_jsx_runtime.JSX.Element | null;

interface DebugModeToggleProps {
    initialValue?: boolean;
}
declare function DebugModeToggle({ initialValue }: DebugModeToggleProps): react_jsx_runtime.JSX.Element;

export { BreadcrumbSet, DebugModeToggle, type GlobalFormContextType, GlobalFormProvider, MasterTableProvider, RecordBrowserProvider, RecordNavButtons, SaveCancelHeader, useAutoQuery, useFilterSortManagement, useGlobalFormContext, useInitGlobalFormContext, useMasterTable, usePaginationManager, useRecordBrowser, useRecordBrowserContext };
