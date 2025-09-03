import { useState } from "react";

export function usePaginationManager(initPageNumber: number, initTotalRecords: number) {
  const [pageNumber, setPageNumber] = useState<number>(initPageNumber);
  const [totalRecords, setTotalRecords] = useState<number>(initTotalRecords);

  const resetToFirstPage = () => setPageNumber(1);
  const handlePageNumberChange = (page: number) => setPageNumber(page);

  return { pageNumber, handlePageNumberChange, totalRecords, resetToFirstPage, setTotalRecords } as const;
}
