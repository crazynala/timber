// src/admin/filterSortManagement.tsx
import { useState, useEffect } from "react";
import { Text, Badge } from "@mantine/core";
import { useDebouncedValue } from "@mantine/hooks";
import { jsx } from "react/jsx-runtime";
function useFilterSortManagement(initQueryValue, initialFilters, initialSort, initialView = null, defaults = {}) {
  const [appliedSort, setAppliedSort] = useState(initialSort || {});
  const [appliedView, setAppliedView] = useState(initialView || "");
  const [appliedFilters, setAppliedFilters] = useState(initialFilters?.map((f) => ({ ...f, label: disambiguateLabel(f.key, f.value) })) || []);
  const [queryValue, setQueryValue] = useState(initQueryValue || "");
  const [debouncedQueryValue] = useDebouncedValue(queryValue, 200, { leading: true });
  const appliedOrDefaultSort = () => appliedSort && Object.keys(appliedSort).length > 0 ? appliedSort : defaults.sort || {};
  useEffect(() => {
    setAppliedSort(initialSort);
    setAppliedFilters(initialFilters?.map((f) => ({ ...f, label: disambiguateLabel(f.key, f.value) })));
    setQueryValue(initQueryValue || "");
  }, []);
  const handleQueryChange = (value) => setQueryValue(value);
  const handleSortChange = (value) => setAppliedSort((prev) => ({ ...appliedOrDefaultSort(), ...prev, ...value }));
  const handleFilterChange = (key, value) => setAppliedFilters((prev) => {
    const updated = prev.filter((f) => f.key !== key);
    updated.push({ key, value, label: disambiguateLabel(key, value) });
    return updated;
  });
  const handleMultiFilterToggle = (key, { value, checked }) => setAppliedFilters((prev) => {
    const updated = prev.filter((f) => f.key !== key);
    if (value && value.length > 0) {
      const oldValues = prev.find((f) => key === f.key)?.value || [];
      const newValues = checked ? [...oldValues, value] : oldValues.filter((s) => s !== value);
      updated.push({ key, value: newValues, label: disambiguateLabel(key, newValues) });
    }
    return updated;
  });
  const handleClearFilter = (key) => setAppliedFilters((prev) => prev.filter((f) => f.key !== key));
  const handleClearAllFilters = () => {
    setQueryValue("");
    setAppliedFilters([]);
  };
  const handleSetView = (view) => {
    if (view?.filters) {
      setAppliedView(view.key);
      setAppliedFilters(view.filters.map((f) => ({ ...f, label: disambiguateLabel(f.key, f.value) })));
    } else {
      setAppliedFilters([]);
    }
    setQueryValue("");
  };
  return {
    appliedSort,
    appliedOrDefaultSort,
    appliedFilters,
    appliedView,
    queryValue,
    debouncedQueryValue,
    handleSortChange,
    handleFilterChange,
    handleMultiFilterToggle,
    handleClearFilter,
    handleClearAllFilters,
    handleQueryChange,
    handleSetView
  };
}
function disambiguateLabel(key, value) {
  switch (key) {
    case "prodState":
      return [
        /* @__PURE__ */ jsx(Text, { inline: true, span: true, children: "State is" }, "label"),
        Array.isArray(value) ? value.map((val, i) => /* @__PURE__ */ jsx(Badge, { ml: "xs", size: "sm", radius: "sm", children: String(val) }, i)) : String(value)
      ];
    default:
      return String(value);
  }
}

// src/admin/saveCancelHeader.tsx
import { useCallback as useCallback2, useState as useState3, useEffect as useEffect3 } from "react";
import { useDebouncedCallback } from "@mantine/hooks";

// src/admin/globalFormProvider.tsx
import { useBlocker, useNavigate } from "@remix-run/react";
import { createContext, useContext, useState as useState2, useRef, useCallback, useMemo, useEffect as useEffect2 } from "react";
import { jsx as jsx2 } from "react/jsx-runtime";
var FormContext = createContext(null);
function GlobalFormProvider({ children }) {
  const [isDirty, setIsDirty] = useState2(false);
  const [blockHandler, setBlockHandler] = useState2(() => () => {
  });
  const bypassBlockerRef = useRef(false);
  const navigate = useNavigate();
  const saveHandlerRef = useRef(null);
  const cancelHandlerRef = useRef(null);
  const blockerFunction = useCallback(
    ({ currentLocation, nextLocation }) => {
      const sanitizeSearch = (search) => search.replace(/[?&]/g, "").replace("index", "");
      const shouldBlock = !bypassBlockerRef.current && isDirty && (currentLocation.pathname !== nextLocation.pathname || sanitizeSearch(currentLocation.search) !== sanitizeSearch(nextLocation.search));
      if (shouldBlock) blockHandler();
      return shouldBlock;
    },
    [isDirty, blockHandler]
  );
  const blocker = useBlocker(blockerFunction);
  const markDirty = useCallback((dirty) => setIsDirty(dirty), []);
  const forceNavigate = useCallback(
    (to) => {
      bypassBlockerRef.current = true;
      navigate(to);
      setTimeout(() => {
        bypassBlockerRef.current = false;
      }, 1e3);
    },
    [navigate]
  );
  const registerHandlers = useCallback((save, cancel) => {
    saveHandlerRef.current = save;
    cancelHandlerRef.current = cancel;
  }, []);
  const registerBlockHandler = useCallback((block) => {
    setBlockHandler(() => block);
  }, []);
  const value = useMemo(
    () => ({
      isDirty,
      markDirty,
      registerHandlers,
      saveHandlerRef,
      cancelHandlerRef,
      setBlockHandler,
      blocker,
      registerBlockHandler,
      forceNavigate
    }),
    [isDirty, markDirty, registerHandlers, blocker, registerBlockHandler, forceNavigate]
  );
  return /* @__PURE__ */ jsx2(FormContext.Provider, { value, children });
}
function useGlobalFormContext() {
  const context = useContext(FormContext);
  if (!context) throw new Error("useGlobalFormContext must be used within a GlobalFormProvider");
  return context;
}
function useInitGlobalFormContext(formHandlers, onSubmit, onCancel) {
  const { registerHandlers, markDirty, blocker, forceNavigate } = useGlobalFormContext();
  useEffect2(() => {
    const cancelHandler = !onCancel || onCancel === "undefined" ? () => {
      formHandlers.reset();
    } : onCancel;
    registerHandlers(formHandlers.handleSubmit(onSubmit), cancelHandler);
  }, [formHandlers, onSubmit, onCancel, registerHandlers]);
  useEffect2(() => {
    markDirty(formHandlers.formState.isDirty);
  }, [formHandlers.formState.isDirty, markDirty]);
  return { blocker, forceNavigate };
}

// src/admin/saveCancelHeader.tsx
import { Button, Group, Text as Text2, Paper } from "@mantine/core";
import { IconAlertSquareRounded } from "@tabler/icons-react";

// src/admin/saveCancelHeader.module.css
var saveCancelHeader_default = {};

// src/admin/saveCancelHeader.tsx
import { jsx as jsx3, jsxs } from "react/jsx-runtime";
function SaveCancelHeader() {
  const { isDirty, saveHandlerRef, cancelHandlerRef, registerBlockHandler } = useGlobalFormContext();
  const [pulse, setPulse] = useState3(false);
  const closePulse = useDebouncedCallback(() => {
    setPulse(false);
  }, 500);
  const blockHandler = useCallback2(() => {
    setPulse(true);
    closePulse();
  }, []);
  useEffect3(() => registerBlockHandler(blockHandler), [blockHandler]);
  if (!isDirty) return null;
  return /* @__PURE__ */ jsx3(Paper, { className: pulse ? saveCancelHeader_default["shake-and-pulse"] : void 0, w: "100%", radius: "lg", p: 3, bg: "gray.9", bd: "gray.6", c: "white", children: /* @__PURE__ */ jsxs(Group, { justify: "space-between", children: [
    /* @__PURE__ */ jsxs(Group, { ml: "sm", children: [
      /* @__PURE__ */ jsx3(IconAlertSquareRounded, {}),
      /* @__PURE__ */ jsx3(Text2, { size: "sm", children: "Unsaved Changes" })
    ] }),
    /* @__PURE__ */ jsxs(Group, { mr: "sm", children: [
      /* @__PURE__ */ jsx3(
        Button,
        {
          size: "xs",
          color: "gray.8",
          radius: "lg",
          disabled: !isDirty,
          onClick: () => {
            cancelHandlerRef.current?.();
          },
          children: "Discard"
        }
      ),
      /* @__PURE__ */ jsx3(Button, { size: "xs", color: "teal", radius: "lg", disabled: !isDirty, onClick: saveHandlerRef.current ?? void 0, children: "Save" })
    ] })
  ] }) });
}

// src/admin/paginationManager.tsx
import { useState as useState4 } from "react";
function usePaginationManager(initPageNumber, initTotalRecords) {
  const [pageNumber, setPageNumber] = useState4(initPageNumber);
  const [totalRecords, setTotalRecords] = useState4(initTotalRecords);
  const resetToFirstPage = () => setPageNumber(1);
  const handlePageNumberChange = (page) => setPageNumber(page);
  return { pageNumber, handlePageNumberChange, totalRecords, resetToFirstPage, setTotalRecords };
}

// src/admin/masterTableProvider.tsx
import { createContext as createContext2, useContext as useContext2 } from "react";
import { jsx as jsx4 } from "react/jsx-runtime";
var MasterTableContext = createContext2(null);
function MasterTableProvider({ children, initialRecords }) {
  return /* @__PURE__ */ jsx4(MasterTableContext.Provider, { value: { records: initialRecords }, children });
}
function useMasterTable() {
  const context = useContext2(MasterTableContext);
  if (!context) throw new Error("useMasterTable must be used within a MasterTableProvider");
  return context;
}

// src/admin/recordBrowserProvider.tsx
import { useNavigate as useNavigate2 } from "@remix-run/react";
import { ActionIcon, Group as Group2 } from "@mantine/core";
import { IconChevronLeft, IconChevronRight } from "@tabler/icons-react";
import { createContext as createContext3, useState as useState5, useContext as useContext3, useCallback as useCallback3, useMemo as useMemo2 } from "react";
import { jsx as jsx5, jsxs as jsxs2 } from "react/jsx-runtime";
var RecordBrowserContext = createContext3(null);
function RecordBrowserProvider({ children, initialRecords = [] }) {
  const [records, setRecords] = useState5(initialRecords);
  const updateRecords = useCallback3((newRecords) => setRecords(newRecords), []);
  const value = useMemo2(() => ({ records, updateRecords }), [records, updateRecords]);
  return /* @__PURE__ */ jsx5(RecordBrowserContext.Provider, { value, children });
}
function useRecordBrowserContext({ optional = false } = {}) {
  const ctx = useContext3(RecordBrowserContext);
  if (!ctx && !optional) throw new Error("useRecordBrowserContext must be used within a RecordBrowserProvider");
  return ctx;
}
function useRecordBrowser(currentId, masterRecords = null) {
  const navigate = useNavigate2();
  const context = useRecordBrowserContext({ optional: true });
  const records = masterRecords ?? context?.records ?? [];
  const currentIndex = records.findIndex((record) => record.id === currentId);
  const nextRecord = () => {
    if (currentIndex < records.length - 1) navigate(`../${records[currentIndex + 1].id}/${location.search}`, { relative: "path" });
  };
  const prevRecord = () => {
    if (currentIndex > 0) navigate(`../${records[currentIndex - 1].id}/${location.search}`, { relative: "path" });
  };
  return { currentIndex, numRecords: records.length, nextRecord, prevRecord };
}
function RecordNavButtons({ recordBrowser }) {
  return /* @__PURE__ */ jsxs2(Group2, { children: [
    /* @__PURE__ */ jsx5(ActionIcon, { onClick: recordBrowser.prevRecord, variant: "outline", disabled: recordBrowser.currentIndex === 0, children: /* @__PURE__ */ jsx5(IconChevronLeft, {}) }),
    /* @__PURE__ */ jsx5(ActionIcon, { onClick: recordBrowser.nextRecord, variant: "outline", disabled: recordBrowser.currentIndex === recordBrowser.numRecords - 1, children: /* @__PURE__ */ jsx5(IconChevronRight, {}) })
  ] });
}

// src/admin/autoQueryProvider.tsx
import { useEffect as useEffect4, useState as useState6 } from "react";
import { useSubmit } from "@remix-run/react";
var isEmpty = (val) => val === void 0 || val === null || String(val).trim() === "";
var notEqual = (a, b) => {
  try {
    return JSON.stringify(a) !== JSON.stringify(b);
  } catch {
    return a !== b;
  }
};
function useAutoQuery(filterSortManager, paginationManager, defaultValues) {
  const submit = useSubmit();
  const { pageNumber, resetToFirstPage } = paginationManager;
  const [lastPageNumber, setLastPageNumber] = useState6(defaultValues?.pageNumber || 1);
  const [lastQuery, setLastQuery] = useState6(defaultValues?.queryValue || "");
  const { filters: initialFilters, sort: initialSort } = defaultValues || {};
  const { appliedFilters, appliedSort, appliedView, debouncedQueryValue } = filterSortManager;
  useEffect4(() => {
    if (notEqual(appliedFilters, initialFilters) || notEqual(appliedSort, initialSort) || notEqual(lastQuery, debouncedQueryValue) || notEqual(pageNumber, lastPageNumber)) {
      if (lastPageNumber != pageNumber) setLastPageNumber(pageNumber);
      let activePage = pageNumber;
      if (lastQuery !== debouncedQueryValue) {
        activePage = 1;
        resetToFirstPage();
        setLastQuery(debouncedQueryValue);
      }
      submitQuery(activePage, debouncedQueryValue, appliedFilters, appliedSort, appliedView);
    }
  }, [pageNumber, appliedFilters, appliedSort, debouncedQueryValue]);
  const submitQuery = (pageNumber2, query, filters, sort, view) => {
    const params = { pageNumber: pageNumber2 };
    if (!isEmpty(query)) params.query = query;
    filters?.forEach((filter) => {
      params[filter.key] = String(filter.value);
    });
    if (sort) {
      if (sort.key) params.sort = sort.key;
      if (sort.direction) params.sortDirection = sort.direction;
    }
    if (view) params.view = view;
    submit(params, { method: "get" });
  };
}

// src/admin/breadcrumbSet.tsx
import { Link, useLocation } from "@remix-run/react";
import { Breadcrumbs, Anchor, Text as Text3 } from "@mantine/core";
import { jsx as jsx6 } from "react/jsx-runtime";
function BreadcrumbSet({ breadcrumbs }) {
  if (!breadcrumbs) return null;
  const location2 = useLocation();
  const renderBreadcrumb = (breadcrumb) => {
    const label = breadcrumb.label ?? breadcrumb.title ?? "";
    const isLink = breadcrumb.href !== "#";
    return isLink ? /* @__PURE__ */ jsx6(Anchor, { component: Link, to: `${breadcrumb.href}${location2.search}`, children: label }, breadcrumb.href) : /* @__PURE__ */ jsx6(Text3, { size: "xl", fw: "bold", children: label }, breadcrumb.href);
  };
  return /* @__PURE__ */ jsx6(Breadcrumbs, { separatorMargin: "sm", children: breadcrumbs.map((b) => renderBreadcrumb(b)) });
}

// src/debug/DebugModeToggle.tsx
import { Switch, Tooltip, Group as Group3 } from "@mantine/core";
import { IconBug } from "@tabler/icons-react";
import { useFetcher } from "@remix-run/react";
import { useEffect as useEffect5, useState as useState7 } from "react";
import { jsx as jsx7 } from "react/jsx-runtime";
function DebugModeToggle({ initialValue = false }) {
  const fetcher = useFetcher();
  const [checked, setChecked] = useState7(initialValue);
  useEffect5(() => {
    if (fetcher.data) setChecked(fetcher.data.debugMode);
  }, [fetcher.data]);
  return /* @__PURE__ */ jsx7(fetcher.Form, { method: "post", action: "/api/toggle-debug", children: /* @__PURE__ */ jsx7(Tooltip, { label: checked ? "Debug Mode: ON" : "Debug Mode: OFF", position: "bottom", children: /* @__PURE__ */ jsx7(Group3, { gap: "xs", children: /* @__PURE__ */ jsx7(
    Switch,
    {
      color: "gray.7",
      size: "xs",
      checked,
      onChange: (e) => {
        setChecked(e.currentTarget.checked);
        fetcher.submit({}, { method: "POST", action: "/api/toggle-debug" });
      },
      onLabel: /* @__PURE__ */ jsx7(IconBug, { size: "1rem", color: "red" }),
      offLabel: /* @__PURE__ */ jsx7(IconBug, { size: "1rem", color: "gray" })
    }
  ) }) }) });
}
export {
  BreadcrumbSet,
  DebugModeToggle,
  GlobalFormProvider,
  MasterTableProvider,
  RecordBrowserProvider,
  RecordNavButtons,
  SaveCancelHeader,
  useAutoQuery,
  useFilterSortManagement,
  useGlobalFormContext,
  useInitGlobalFormContext,
  useMasterTable,
  usePaginationManager,
  useRecordBrowser,
  useRecordBrowserContext
};
//# sourceMappingURL=index.js.map