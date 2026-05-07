"use client";

import { useGetSupplierSuggestionsQuery } from "@/shared/api/api";
import { useDebouncedValue } from "@/shared/hooks/use-debounced-value";

export function useMarketplaceSearchSuggestions(searchTerm: string) {
  const debouncedSearchTerm = useDebouncedValue(searchTerm.trim(), 350);

  const query = useGetSupplierSuggestionsQuery(debouncedSearchTerm, {
    skip: debouncedSearchTerm.length < 2,
  });

  return {
    ...query,
    data: query.data ?? [],
  };
}
