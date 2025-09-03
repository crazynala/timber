"use strict";
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

// src/index.ts
var index_exports = {};
__export(index_exports, {
  BreadcrumbSet: () => BreadcrumbSet,
  DebugModeToggle: () => DebugModeToggle,
  GlobalFormProvider: () => GlobalFormProvider,
  MasterTableProvider: () => MasterTableProvider,
  RecordBrowserProvider: () => RecordBrowserProvider,
  RecordNavButtons: () => RecordNavButtons,
  SaveCancelHeader: () => SaveCancelHeader,
  useAutoQuery: () => useAutoQuery,
  useFilterSortManagement: () => useFilterSortManagement,
  useGlobalFormContext: () => useGlobalFormContext,
  useInitGlobalFormContext: () => useInitGlobalFormContext,
  useMasterTable: () => useMasterTable,
  usePaginationManager: () => usePaginationManager,
  useRecordBrowser: () => useRecordBrowser,
  useRecordBrowserContext: () => useRecordBrowserContext
});
module.exports = __toCommonJS(index_exports);

// src/admin/filterSortManagement.tsx
var import_react = require("react");
var import_core = require("@mantine/core");
var import_hooks = require("@mantine/hooks");
var import_jsx_runtime = require("react/jsx-runtime");
function useFilterSortManagement(initQueryValue, initialFilters, initialSort, initialView = null, defaults = {}) {
  const [appliedSort, setAppliedSort] = (0, import_react.useState)(initialSort || {});
  const [appliedView, setAppliedView] = (0, import_react.useState)(initialView || "");
  const [appliedFilters, setAppliedFilters] = (0, import_react.useState)(initialFilters?.map((f) => ({ ...f, label: disambiguateLabel(f.key, f.value) })) || []);
  const [queryValue, setQueryValue] = (0, import_react.useState)(initQueryValue || "");
  const [debouncedQueryValue] = (0, import_hooks.useDebouncedValue)(queryValue, 200, { leading: true });
  const appliedOrDefaultSort = () => appliedSort && Object.keys(appliedSort).length > 0 ? appliedSort : defaults.sort || {};
  (0, import_react.useEffect)(() => {
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
        /* @__PURE__ */ (0, import_jsx_runtime.jsx)(import_core.Text, { inline: true, span: true, children: "State is" }, "label"),
        Array.isArray(value) ? value.map((val, i) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(import_core.Badge, { ml: "xs", size: "sm", radius: "sm", children: String(val) }, i)) : String(value)
      ];
    default:
      return String(value);
  }
}

// src/admin/saveCancelHeader.tsx
var import_react4 = require("react");
var import_hooks2 = require("@mantine/hooks");

// src/admin/globalFormProvider.tsx
var import_react2 = require("@remix-run/react");
var import_react3 = require("react");
var import_jsx_runtime2 = require("react/jsx-runtime");
var FormContext = (0, import_react3.createContext)(null);
function GlobalFormProvider({ children }) {
  const [isDirty, setIsDirty] = (0, import_react3.useState)(false);
  const [blockHandler, setBlockHandler] = (0, import_react3.useState)(() => () => {
  });
  const bypassBlockerRef = (0, import_react3.useRef)(false);
  const navigate = (0, import_react2.useNavigate)();
  const saveHandlerRef = (0, import_react3.useRef)(null);
  const cancelHandlerRef = (0, import_react3.useRef)(null);
  const blockerFunction = (0, import_react3.useCallback)(
    ({ currentLocation, nextLocation }) => {
      const sanitizeSearch = (search) => search.replace(/[?&]/g, "").replace("index", "");
      const shouldBlock = !bypassBlockerRef.current && isDirty && (currentLocation.pathname !== nextLocation.pathname || sanitizeSearch(currentLocation.search) !== sanitizeSearch(nextLocation.search));
      if (shouldBlock) blockHandler();
      return shouldBlock;
    },
    [isDirty, blockHandler]
  );
  const blocker = (0, import_react2.useBlocker)(blockerFunction);
  const markDirty = (0, import_react3.useCallback)((dirty) => setIsDirty(dirty), []);
  const forceNavigate = (0, import_react3.useCallback)(
    (to) => {
      bypassBlockerRef.current = true;
      navigate(to);
      setTimeout(() => {
        bypassBlockerRef.current = false;
      }, 1e3);
    },
    [navigate]
  );
  const registerHandlers = (0, import_react3.useCallback)((save, cancel) => {
    saveHandlerRef.current = save;
    cancelHandlerRef.current = cancel;
  }, []);
  const registerBlockHandler = (0, import_react3.useCallback)((block) => {
    setBlockHandler(() => block);
  }, []);
  const value = (0, import_react3.useMemo)(
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
  return /* @__PURE__ */ (0, import_jsx_runtime2.jsx)(FormContext.Provider, { value, children });
}
function useGlobalFormContext() {
  const context = (0, import_react3.useContext)(FormContext);
  if (!context) throw new Error("useGlobalFormContext must be used within a GlobalFormProvider");
  return context;
}
function useInitGlobalFormContext(formHandlers, onSubmit, onCancel) {
  const { registerHandlers, markDirty, blocker, forceNavigate } = useGlobalFormContext();
  (0, import_react3.useEffect)(() => {
    const cancelHandler = !onCancel || onCancel === "undefined" ? () => {
      formHandlers.reset();
    } : onCancel;
    registerHandlers(formHandlers.handleSubmit(onSubmit), cancelHandler);
  }, [formHandlers, onSubmit, onCancel, registerHandlers]);
  (0, import_react3.useEffect)(() => {
    markDirty(formHandlers.formState.isDirty);
  }, [formHandlers.formState.isDirty, markDirty]);
  return { blocker, forceNavigate };
}

// src/admin/saveCancelHeader.tsx
var import_core2 = require("@mantine/core");
var import_icons_react = require("@tabler/icons-react");

// src/admin/saveCancelHeader.module.css
var saveCancelHeader_default = {};

// src/admin/saveCancelHeader.tsx
var import_jsx_runtime3 = require("react/jsx-runtime");
function SaveCancelHeader() {
  const { isDirty, saveHandlerRef, cancelHandlerRef, registerBlockHandler } = useGlobalFormContext();
  const [pulse, setPulse] = (0, import_react4.useState)(false);
  const closePulse = (0, import_hooks2.useDebouncedCallback)(() => {
    setPulse(false);
  }, 500);
  const blockHandler = (0, import_react4.useCallback)(() => {
    setPulse(true);
    closePulse();
  }, []);
  (0, import_react4.useEffect)(() => registerBlockHandler(blockHandler), [blockHandler]);
  if (!isDirty) return null;
  return /* @__PURE__ */ (0, import_jsx_runtime3.jsx)(import_core2.Paper, { className: pulse ? saveCancelHeader_default["shake-and-pulse"] : void 0, w: "100%", radius: "lg", p: 3, bg: "gray.9", bd: "gray.6", c: "white", children: /* @__PURE__ */ (0, import_jsx_runtime3.jsxs)(import_core2.Group, { justify: "space-between", children: [
    /* @__PURE__ */ (0, import_jsx_runtime3.jsxs)(import_core2.Group, { ml: "sm", children: [
      /* @__PURE__ */ (0, import_jsx_runtime3.jsx)(import_icons_react.IconAlertSquareRounded, {}),
      /* @__PURE__ */ (0, import_jsx_runtime3.jsx)(import_core2.Text, { size: "sm", children: "Unsaved Changes" })
    ] }),
    /* @__PURE__ */ (0, import_jsx_runtime3.jsxs)(import_core2.Group, { mr: "sm", children: [
      /* @__PURE__ */ (0, import_jsx_runtime3.jsx)(
        import_core2.Button,
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
      /* @__PURE__ */ (0, import_jsx_runtime3.jsx)(import_core2.Button, { size: "xs", color: "teal", radius: "lg", disabled: !isDirty, onClick: saveHandlerRef.current ?? void 0, children: "Save" })
    ] })
  ] }) });
}

// src/admin/paginationManager.tsx
var import_react5 = require("react");
function usePaginationManager(initPageNumber, initTotalRecords) {
  const [pageNumber, setPageNumber] = (0, import_react5.useState)(initPageNumber);
  const [totalRecords, setTotalRecords] = (0, import_react5.useState)(initTotalRecords);
  const resetToFirstPage = () => setPageNumber(1);
  const handlePageNumberChange = (page) => setPageNumber(page);
  return { pageNumber, handlePageNumberChange, totalRecords, resetToFirstPage, setTotalRecords };
}

// src/admin/masterTableProvider.tsx
var import_react6 = require("react");
var import_jsx_runtime4 = require("react/jsx-runtime");
var MasterTableContext = (0, import_react6.createContext)(null);
function MasterTableProvider({ children, initialRecords }) {
  return /* @__PURE__ */ (0, import_jsx_runtime4.jsx)(MasterTableContext.Provider, { value: { records: initialRecords }, children });
}
function useMasterTable() {
  const context = (0, import_react6.useContext)(MasterTableContext);
  if (!context) throw new Error("useMasterTable must be used within a MasterTableProvider");
  return context;
}

// src/admin/recordBrowserProvider.tsx
var import_react7 = require("@remix-run/react");
var import_core3 = require("@mantine/core");
var import_icons_react2 = require("@tabler/icons-react");
var import_react8 = require("react");
var import_jsx_runtime5 = require("react/jsx-runtime");
var RecordBrowserContext = (0, import_react8.createContext)(null);
function RecordBrowserProvider({ children, initialRecords = [] }) {
  const [records, setRecords] = (0, import_react8.useState)(initialRecords);
  const updateRecords = (0, import_react8.useCallback)((newRecords) => setRecords(newRecords), []);
  const value = (0, import_react8.useMemo)(() => ({ records, updateRecords }), [records, updateRecords]);
  return /* @__PURE__ */ (0, import_jsx_runtime5.jsx)(RecordBrowserContext.Provider, { value, children });
}
function useRecordBrowserContext({ optional = false } = {}) {
  const ctx = (0, import_react8.useContext)(RecordBrowserContext);
  if (!ctx && !optional) throw new Error("useRecordBrowserContext must be used within a RecordBrowserProvider");
  return ctx;
}
function useRecordBrowser(currentId, masterRecords = null) {
  const navigate = (0, import_react7.useNavigate)();
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
  return /* @__PURE__ */ (0, import_jsx_runtime5.jsxs)(import_core3.Group, { children: [
    /* @__PURE__ */ (0, import_jsx_runtime5.jsx)(import_core3.ActionIcon, { onClick: recordBrowser.prevRecord, variant: "outline", disabled: recordBrowser.currentIndex === 0, children: /* @__PURE__ */ (0, import_jsx_runtime5.jsx)(import_icons_react2.IconChevronLeft, {}) }),
    /* @__PURE__ */ (0, import_jsx_runtime5.jsx)(import_core3.ActionIcon, { onClick: recordBrowser.nextRecord, variant: "outline", disabled: recordBrowser.currentIndex === recordBrowser.numRecords - 1, children: /* @__PURE__ */ (0, import_jsx_runtime5.jsx)(import_icons_react2.IconChevronRight, {}) })
  ] });
}

// src/admin/autoQueryProvider.tsx
var import_react9 = require("react");
var import_react10 = require("@remix-run/react");
var isEmpty = (val) => val === void 0 || val === null || String(val).trim() === "";
var notEqual = (a, b) => {
  try {
    return JSON.stringify(a) !== JSON.stringify(b);
  } catch {
    return a !== b;
  }
};
function useAutoQuery(filterSortManager, paginationManager, defaultValues) {
  const submit = (0, import_react10.useSubmit)();
  const { pageNumber, resetToFirstPage } = paginationManager;
  const [lastPageNumber, setLastPageNumber] = (0, import_react9.useState)(defaultValues?.pageNumber || 1);
  const [lastQuery, setLastQuery] = (0, import_react9.useState)(defaultValues?.queryValue || "");
  const { filters: initialFilters, sort: initialSort } = defaultValues || {};
  const { appliedFilters, appliedSort, appliedView, debouncedQueryValue } = filterSortManager;
  (0, import_react9.useEffect)(() => {
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
var import_react11 = require("@remix-run/react");
var import_core4 = require("@mantine/core");
var import_jsx_runtime6 = require("react/jsx-runtime");
function BreadcrumbSet({ breadcrumbs }) {
  if (!breadcrumbs) return null;
  const location2 = (0, import_react11.useLocation)();
  const renderBreadcrumb = (breadcrumb) => {
    const label = breadcrumb.label ?? breadcrumb.title ?? "";
    const isLink = breadcrumb.href !== "#";
    return isLink ? /* @__PURE__ */ (0, import_jsx_runtime6.jsx)(import_core4.Anchor, { component: import_react11.Link, to: `${breadcrumb.href}${location2.search}`, children: label }, breadcrumb.href) : /* @__PURE__ */ (0, import_jsx_runtime6.jsx)(import_core4.Text, { size: "xl", fw: "bold", children: label }, breadcrumb.href);
  };
  return /* @__PURE__ */ (0, import_jsx_runtime6.jsx)(import_core4.Breadcrumbs, { separatorMargin: "sm", children: breadcrumbs.map((b) => renderBreadcrumb(b)) });
}

// src/debug/DebugModeToggle.tsx
var import_core5 = require("@mantine/core");
var import_icons_react3 = require("@tabler/icons-react");
var import_react12 = require("@remix-run/react");
var import_react13 = require("react");
var import_jsx_runtime7 = require("react/jsx-runtime");
function DebugModeToggle({ initialValue = false }) {
  const fetcher = (0, import_react12.useFetcher)();
  const [checked, setChecked] = (0, import_react13.useState)(initialValue);
  (0, import_react13.useEffect)(() => {
    if (fetcher.data) setChecked(fetcher.data.debugMode);
  }, [fetcher.data]);
  return /* @__PURE__ */ (0, import_jsx_runtime7.jsx)(fetcher.Form, { method: "post", action: "/api/toggle-debug", children: /* @__PURE__ */ (0, import_jsx_runtime7.jsx)(import_core5.Tooltip, { label: checked ? "Debug Mode: ON" : "Debug Mode: OFF", position: "bottom", children: /* @__PURE__ */ (0, import_jsx_runtime7.jsx)(import_core5.Group, { gap: "xs", children: /* @__PURE__ */ (0, import_jsx_runtime7.jsx)(
    import_core5.Switch,
    {
      color: "gray.7",
      size: "xs",
      checked,
      onChange: (e) => {
        setChecked(e.currentTarget.checked);
        fetcher.submit({}, { method: "POST", action: "/api/toggle-debug" });
      },
      onLabel: /* @__PURE__ */ (0, import_jsx_runtime7.jsx)(import_icons_react3.IconBug, { size: "1rem", color: "red" }),
      offLabel: /* @__PURE__ */ (0, import_jsx_runtime7.jsx)(import_icons_react3.IconBug, { size: "1rem", color: "gray" })
    }
  ) }) }) });
}
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
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
});
//# sourceMappingURL=index.cjs.map