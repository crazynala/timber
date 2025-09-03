import { useState, useEffect } from "react";
import { Text, Badge } from "@mantine/core";
import { useDebouncedValue } from "@mantine/hooks";

export function useFilterSortManagement(initQueryValue: string, initialFilters: any[], initialSort: any, initialView: any = null, defaults: any = {}) {
  const [appliedSort, setAppliedSort] = useState(initialSort || {});
  const [appliedView, setAppliedView] = useState(initialView || "");
  const [appliedFilters, setAppliedFilters] = useState(initialFilters?.map((f) => ({ ...f, label: disambiguateLabel(f.key, f.value) })) || []);
  const [queryValue, setQueryValue] = useState(initQueryValue || "");
  const [debouncedQueryValue] = useDebouncedValue(queryValue, 200, { leading: true });

  const appliedOrDefaultSort = () => (appliedSort && Object.keys(appliedSort).length > 0 ? appliedSort : defaults.sort || {});

  useEffect(() => {
    setAppliedSort(initialSort);
    setAppliedFilters(initialFilters?.map((f) => ({ ...f, label: disambiguateLabel(f.key, f.value) })));
    setQueryValue(initQueryValue || "");
  }, []);

  const handleQueryChange = (value: string) => setQueryValue(value);
  const handleSortChange = (value: any) => setAppliedSort((prev: any) => ({ ...appliedOrDefaultSort(), ...prev, ...value }));
  const handleFilterChange = (key: string, value: any) =>
    setAppliedFilters((prev) => {
      const updated = prev.filter((f) => f.key !== key);
      updated.push({ key, value, label: disambiguateLabel(key, value) });
      return updated;
    });
  const handleMultiFilterToggle = (key: string, { value, checked }: any) =>
    setAppliedFilters((prev) => {
      const updated = prev.filter((f) => f.key !== key);
      if (value && value.length > 0) {
        const oldValues = prev.find((f) => key === f.key)?.value || [];
        const newValues = checked ? [...oldValues, value] : oldValues.filter((s: any) => s !== value);
        updated.push({ key, value: newValues, label: disambiguateLabel(key, newValues) });
      }
      return updated;
    });
  const handleClearFilter = (key: string) => setAppliedFilters((prev) => prev.filter((f) => f.key !== key));
  const handleClearAllFilters = () => {
    setQueryValue("");
    setAppliedFilters([]);
  };
  const handleSetView = (view: any) => {
    if (view?.filters) {
      setAppliedView(view.key);
      setAppliedFilters(view.filters.map((f: any) => ({ ...f, label: disambiguateLabel(f.key, f.value) })));
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
    handleSetView,
  };
}

function disambiguateLabel(key: string, value: any) {
  switch (key) {
    case "prodState":
      return [
        <Text inline span key="label">
          State is
        </Text>,
        Array.isArray(value)
          ? value.map((val: any, i: number) => (
              <Badge ml="xs" size="sm" radius="sm" key={i}>
                {String(val)}
              </Badge>
            ))
          : String(value),
      ];
    default:
      return String(value);
  }
}
