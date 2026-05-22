"use client";

import { useEffect, useState } from "react";
import { useProductFilters } from "@/hooks/use-product-filters";
import { useViewStore, useProductStore } from "@/store";
import { PRODUCT_CATEGORIES } from "@/lib/validation";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Search,
  Plus,
  ArrowUpDown,
  Grid,
  List,
  RotateCcw,
} from "lucide-react";

export function FilterToolbar() {
  const {
    q,
    setQ,
    category,
    setCategory,
    sortBy,
    setSortBy,
    sortOrder,
    setSortOrder,
    resetAll,
  } = useProductFilters();

  const { viewMode, setViewMode } = useViewStore();
  const { openCreateDialog } = useProductStore();

  // Local state to debounce search input
  const [localSearch, setLocalSearch] = useState(q);

  useEffect(() => {
    setLocalSearch(q);
  }, [q]);

  useEffect(() => {
    const handler = setTimeout(() => {
      if (localSearch !== q) {
        setQ(localSearch);
      }
    }, 400);

    return () => clearTimeout(handler);
  }, [localSearch, q, setQ]);

  const toggleSortOrder = () => {
    setSortOrder(sortOrder === "asc" ? "desc" : "asc");
  };

  const hasActiveFilters = q !== "" || category !== "";

  return (
    <div className="flex flex-col gap-4 p-4 rounded-xl border border-white/40 bg-white/30 backdrop-blur-md shadow-sm md:flex-row md:items-center md:justify-between">
      <div className="flex flex-1 flex-col gap-3 sm:flex-row sm:items-center">
        {/* Search Input */}
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
          <Input
            placeholder="Search products..."
            className="pl-9 bg-white/80 border-slate-200/80 focus:border-indigo-500 focus:ring-indigo-500/20"
            value={localSearch}
            onChange={(e) => setLocalSearch(e.target.value)}
          />
        </div>

        {/* Category Filter */}
        <Select value={category} onValueChange={(val) => setCategory(!val || val === "all-categories" ? "" : val)}>
          <SelectTrigger className="w-[180px] bg-white/80 border-slate-200/80">
            <SelectValue placeholder="All Categories" />
          </SelectTrigger>
          <SelectContent className="bg-white/95 backdrop-blur-md">
            <SelectItem value="all-categories">All Categories</SelectItem>
            {PRODUCT_CATEGORIES.map((cat) => (
              <SelectItem key={cat} value={cat}>
                {cat}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* Sort Select */}
        <Select value={sortBy} onValueChange={(val) => setSortBy(val)}>
          <SelectTrigger className="w-[160px] bg-white/80 border-slate-200/80">
            <SelectValue placeholder="Sort by" className="capitalize" />
          </SelectTrigger>
          <SelectContent className="bg-white/95 backdrop-blur-md">
            <SelectItem value="createdAt">CreatedAt</SelectItem>
            <SelectItem value="name">Name</SelectItem>
            <SelectItem value="price">Price</SelectItem>
            <SelectItem value="stock">Stock Quantity</SelectItem>
          </SelectContent>
        </Select>

        {/* Sort Order Toggle */}
        <Button
          variant="outline"
          size="icon"
          className="bg-white/80 border-slate-200/80 hover:bg-slate-50 text-slate-600"
          onClick={toggleSortOrder}
          title={`Sort ${sortOrder === "asc" ? "Ascending" : "Descending"}`}
        >
          <ArrowUpDown className="h-4 w-4" />
        </Button>

        {/* Reset Filters */}
        {hasActiveFilters && (
          <Button
            variant="ghost"
            onClick={resetAll}
            className="text-slate-500 hover:text-indigo-600 font-medium text-sm flex gap-1.5 items-center"
          >
            <RotateCcw className="h-3.5 w-3.5" />
            Reset
          </Button>
        )}
      </div>

      <div className="flex items-center gap-2 self-end md:self-auto">
        {/* View Mode Toggle */}
        <div className="flex items-center rounded-lg border border-slate-200/80 bg-slate-50/50 p-1">
          <Button
            variant={viewMode === "table" ? "secondary" : "ghost"}
            size="icon"
            className="h-7 w-7 rounded-md p-0"
            onClick={() => setViewMode("table")}
            title="List view"
          >
            <List className="h-4 w-4" />
          </Button>
          <Button
            variant={viewMode === "grid" ? "secondary" : "ghost"}
            size="icon"
            className="h-7 w-7 rounded-md p-0"
            onClick={() => setViewMode("grid")}
            title="Grid view"
          >
            <Grid className="h-4 w-4" />
          </Button>
        </div>

        {/* Add Product Button */}
        <Button
          onClick={openCreateDialog}
          className="bg-indigo-600 hover:bg-indigo-700 text-white font-medium shadow-sm hover:shadow flex gap-1.5 items-center rounded-lg"
        >
          <Plus className="h-4 w-4" />
          Add Product
        </Button>
      </div>
    </div>
  );
}
