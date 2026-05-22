import { useQueryState, parseAsString, parseAsInteger } from "nuqs";

export function useProductFilters() {
  const [q, setQ] = useQueryState("q", parseAsString.withDefault("").withOptions({ shallow: true }));
  const [category, setCategory] = useQueryState("category", parseAsString.withDefault("").withOptions({ shallow: true }));
  const [sortBy, setSortBy] = useQueryState("sortBy", parseAsString.withDefault("createdAt").withOptions({ shallow: true }));
  const [sortOrder, setSortOrder] = useQueryState("sortOrder", parseAsString.withDefault("desc").withOptions({ shallow: true }));
  const [page, setPage] = useQueryState("page", parseAsInteger.withDefault(1).withOptions({ shallow: true }));
  const [limit, setLimit] = useQueryState("limit", parseAsInteger.withDefault(5).withOptions({ shallow: true }));

  // Helper to reset pagination when filters change
  const setFilterQ = async (value: string) => {
    await setQ(value || null);
    await setPage(1);
  };

  const setFilterCategory = async (value: string) => {
    await setCategory(value || null);
    await setPage(1);
  };

  const resetAll = async () => {
    await setQ(null);
    await setCategory(null);
    await setSortBy(null);
    await setSortBy(null);
    await setPage(1);
  };

  return {
    q,
    setQ: setFilterQ,
    category,
    setCategory: setFilterCategory,
    sortBy,
    setSortBy,
    sortOrder,
    setSortOrder,
    page,
    setPage,
    limit,
    setLimit,
    resetAll,
  };
}
