import { useEffect, useState } from "react";
import { useSubmit } from "@remix-run/react";

// tiny utilities
const isEmpty = (val: any) => val === undefined || val === null || String(val).trim() === "";
const notEqual = (a: any, b: any) => {
  try {
    return JSON.stringify(a) !== JSON.stringify(b);
  } catch {
    return a !== b;
  }
};

export function useAutoQuery(filterSortManager: any, paginationManager: any, defaultValues: any) {
  const submit = useSubmit();
  const { pageNumber, resetToFirstPage } = paginationManager;
  const [lastPageNumber, setLastPageNumber] = useState(defaultValues?.pageNumber || 1);
  const [lastQuery, setLastQuery] = useState(defaultValues?.queryValue || "");
  const { filters: initialFilters, sort: initialSort } = defaultValues || {};
  const { appliedFilters, appliedSort, appliedView, debouncedQueryValue } = filterSortManager;

  useEffect(() => {
    if (
      notEqual(appliedFilters, initialFilters) ||
      notEqual(appliedSort, initialSort) ||
      notEqual(lastQuery, debouncedQueryValue) ||
      notEqual(pageNumber, lastPageNumber)
    ) {
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

  const submitQuery = (pageNumber: number, query: string, filters: any[], sort: any, view: any) => {
    const params: Record<string, string | number> = { pageNumber };
    if (!isEmpty(query)) params.query = query;
    filters?.forEach((filter) => {
      (params as any)[filter.key] = String(filter.value);
    });
    if (sort) {
      if (sort.key) (params as any).sort = sort.key;
      if (sort.direction) (params as any).sortDirection = sort.direction;
    }
    if (view) (params as any).view = view;
    submit(params as any, { method: "get" });
  };
}
