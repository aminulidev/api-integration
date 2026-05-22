"use client";

import { useGetProducts } from "@/hooks/use-products";
import { useProductFilters } from "@/hooks/use-product-filters";
import { useViewStore, useProductStore } from "@/store";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Edit, Trash2, ArrowLeft, ArrowRight, Layers, ShoppingBag } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export function ProductTable() {
  const {
    q,
    category,
    sortBy,
    sortOrder,
    page,
    setPage,
    limit,
    setLimit,
  } = useProductFilters();

  const { viewMode } = useViewStore();
  const { openEditDialog, openDeleteConfirm } = useProductStore();

  const { data, isLoading, isError, isFetching } = useGetProducts({
    q,
    category: category === "all-categories" ? "" : category,
    sortBy,
    sortOrder,
    page,
    limit,
  });

  const getStockBadge = (stock: number) => {
    if (stock === 0) {
      return (
        <Badge variant="destructive" className="bg-red-500/15 text-red-600 hover:bg-red-500/15 border-red-500/20 font-semibold px-2 py-0.5 rounded-full">
          Out of Stock
        </Badge>
      );
    }
    if (stock <= 5) {
      return (
        <Badge variant="outline" className="bg-amber-500/10 text-amber-600 border-amber-500/30 hover:bg-amber-500/10 font-semibold px-2 py-0.5 rounded-full">
          Low Stock ({stock})
        </Badge>
      );
    }
    return (
      <Badge variant="secondary" className="bg-emerald-500/10 text-emerald-600 border-emerald-500/20 hover:bg-emerald-500/10 font-semibold px-2 py-0.5 rounded-full">
        In Stock ({stock})
      </Badge>
    );
  };

  const formatPrice = (val: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(val);
  };

  // ─── Derived values ────────────────────────────────────────────────────────
  const showSkeleton = isLoading || isFetching;
  const products = data?.products || [];
  const total = data?.total || 0;
  const totalPages = data?.totalPages || 1;
  const startIndex = (page - 1) * limit + 1;
  const endIndex = Math.min(page * limit, total);

  // Stagger variants for Grid view
  const gridContainerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.04 },
    },
  };

  const gridCardVariants = {
    hidden: { opacity: 0, y: 20, scale: 0.96 },
    show: {
      opacity: 1,
      y: 0,
      scale: 1,
      transition: { type: "spring" as const, stiffness: 110, damping: 15 },
    },
  };

  // ─── Pagination footer (always rendered to keep page height stable) ────────
  const paginationFooter = (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between p-4 rounded-xl border border-white/40 bg-white/30 backdrop-blur-md">
      {showSkeleton ? (
        <>
          <Skeleton className="h-4 w-48" />
          <Skeleton className="h-8.5 w-72 rounded-lg" />
        </>
      ) : (
        <>
          <div className="flex items-center gap-3">
            <p className="text-sm font-medium text-slate-500">
              Showing <span className="text-slate-800">{startIndex}</span> to{" "}
              <span className="text-slate-800">{endIndex}</span> of{" "}
              <span className="text-slate-800 font-semibold">{total}</span> products
            </p>
            <div className="h-4 w-px bg-slate-200 hidden sm:block" />
            <div className="flex items-center gap-1.5">
              <span className="text-xs font-medium text-slate-500 whitespace-nowrap">Show</span>
              <Select
                value={limit.toString()}
                onValueChange={(val) => {
                  if (val) {
                    setLimit(parseInt(val, 10));
                    setPage(1);
                  }
                }}
              >
                <SelectTrigger className="h-8 w-[70px] bg-white border-slate-200/85">
                  <SelectValue placeholder={limit.toString()} />
                </SelectTrigger>
                <SelectContent className="bg-white">
                  <SelectItem value="5">5</SelectItem>
                  <SelectItem value="10">10</SelectItem>
                  <SelectItem value="20">20</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="flex items-center justify-end gap-1.5">
            <Button
              variant="outline"
              className="h-8.5 text-xs text-slate-600 border-slate-200/80 bg-white hover:bg-slate-50 gap-1 rounded-lg"
              onClick={() => setPage(Math.max(page - 1, 1))}
              disabled={page === 1}
            >
              <ArrowLeft className="h-3.5 w-3.5" />
              Previous
            </Button>

            {(() => {
              const WINDOW = 5;
              const half = Math.floor(WINDOW / 2);
              let start = Math.max(1, page - half);
              let end = Math.min(totalPages, start + WINDOW - 1);
              if (end - start + 1 < WINDOW) {
                start = Math.max(1, end - WINDOW + 1);
              }

              const buttons: React.ReactNode[] = [];

              if (start > 1) {
                buttons.push(
                  <Button
                    key={1}
                    variant="outline"
                    className="h-8.5 w-8.5 p-0 text-xs rounded-lg text-slate-600 border-slate-200/80 bg-white hover:bg-slate-50"
                    onClick={() => setPage(1)}
                  >
                    1
                  </Button>
                );
                if (start > 2) {
                  buttons.push(
                    <span key="ellipsis-start" className="flex h-8.5 w-7 items-center justify-center text-xs text-slate-400 select-none">
                      …
                    </span>
                  );
                }
              }

              for (let p = start; p <= end; p++) {
                buttons.push(
                  <Button
                    key={p}
                    variant={page === p ? "default" : "outline"}
                    className={`h-8.5 w-8.5 p-0 text-xs rounded-lg ${
                      page === p
                        ? "bg-indigo-600 hover:bg-indigo-700 text-white font-semibold"
                        : "text-slate-600 border-slate-200/80 bg-white hover:bg-slate-50"
                    }`}
                    onClick={() => setPage(p)}
                  >
                    {p}
                  </Button>
                );
              }

              if (end < totalPages) {
                if (end < totalPages - 1) {
                  buttons.push(
                    <span key="ellipsis-end" className="flex h-8.5 w-7 items-center justify-center text-xs text-slate-400 select-none">
                      …
                    </span>
                  );
                }
                buttons.push(
                  <Button
                    key={totalPages}
                    variant="outline"
                    className="h-8.5 w-8.5 p-0 text-xs rounded-lg text-slate-600 border-slate-200/80 bg-white hover:bg-slate-50"
                    onClick={() => setPage(totalPages)}
                  >
                    {totalPages}
                  </Button>
                );
              }

              return buttons;
            })()}

            <Button
              variant="outline"
              className="h-8.5 text-xs text-slate-600 border-slate-200/80 bg-white hover:bg-slate-50 gap-1 rounded-lg"
              onClick={() => setPage(Math.min(page + 1, totalPages))}
              disabled={page === totalPages}
            >
              Next
              <ArrowRight className="h-3.5 w-3.5" />
            </Button>
          </div>
        </>
      )}
    </div>
  );

  // ─── Error state ───────────────────────────────────────────────────────────
  if (isError) {
    return (
      <div className="space-y-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="flex flex-col items-center justify-center py-12 px-4 rounded-xl border border-red-200/50 bg-red-50/20 text-center"
        >
          <Layers className="h-10 w-10 text-red-400 mb-2 animate-bounce" />
          <h3 className="text-lg font-semibold text-red-700">Database Connection Error</h3>
          <p className="text-sm text-red-500 max-w-sm mt-1">
            We encountered an issue fetching the product list. Please try reloading or check server status.
          </p>
        </motion.div>
        {paginationFooter}
      </div>
    );
  }

  // ─── Main render ───────────────────────────────────────────────────────────
  return (
    <div className="space-y-4">
      {/* ── Content area: skeleton during fetch, real data otherwise ── */}
      {showSkeleton ? (
        <motion.div
          key="skeleton"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.15 }}
        >
          <TableContentSkeleton viewMode={viewMode} limit={limit} />
        </motion.div>
      ) : products.length === 0 ? (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col items-center justify-center py-16 px-4 rounded-xl border border-white/40 bg-white/20 backdrop-blur-md text-center"
        >
          <ShoppingBag className="h-12 w-12 text-slate-400 mb-3 stroke-[1.5]" />
          <h3 className="text-lg font-semibold text-slate-700">No products found</h3>
          <p className="text-sm text-slate-500 max-w-sm mt-1">
            Try adjusting your search filters or add a new product to the inventory database.
          </p>
        </motion.div>
      ) : (
        <AnimatePresence mode="wait">
          <motion.div
            key={viewMode}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            transition={{ duration: 0.22, ease: "easeInOut" }}
          >
            {viewMode === "table" ? (
              /* TABLE VIEW */
              <div className="overflow-hidden rounded-xl border border-white/40 bg-white/35 backdrop-blur-md shadow-sm">
                <Table>
                  <TableHeader className="bg-slate-50/50">
                    <TableRow className="border-b border-slate-100">
                      <TableHead className="w-[80px] text-slate-500 font-semibold">Image</TableHead>
                      <TableHead className="text-slate-500 font-semibold">Name</TableHead>
                      <TableHead className="text-slate-500 font-semibold">Category</TableHead>
                      <TableHead className="text-slate-500 font-semibold text-right">Price</TableHead>
                      <TableHead className="text-slate-500 font-semibold">Inventory</TableHead>
                      <TableHead className="w-[100px] text-slate-500 font-semibold text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    <AnimatePresence initial={false}>
                      {products.map((product) => (
                        <motion.tr
                          key={product.id}
                          initial={{ opacity: 0, y: 8 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, x: -24 }}
                          transition={{ duration: 0.2, ease: "easeOut" }}
                          layoutId={product.id}
                          className="border-b border-slate-100 hover:bg-white/40 transition-colors"
                        >
                          <TableCell className="py-2.5">
                            <div className="relative h-10 w-10 overflow-hidden rounded-lg border border-slate-100 shadow-sm bg-slate-100">
                              {product.imageUrl ? (
                                // eslint-disable-next-line @next/next/no-img-element
                                <img
                                  src={product.imageUrl}
                                  alt={product.name}
                                  className="h-full w-full object-cover"
                                />
                              ) : (
                                <div className="flex h-full w-full items-center justify-center text-xs font-semibold text-slate-400">
                                  N/A
                                </div>
                              )}
                            </div>
                          </TableCell>
                          <TableCell className="font-medium text-slate-800">
                            <div className="flex flex-col">
                              <span>{product.name}</span>
                              {product.description && (
                                <span className="text-xs text-slate-400 font-normal line-clamp-1 max-w-[280px]">
                                  {product.description}
                                </span>
                              )}
                            </div>
                          </TableCell>
                          <TableCell className="text-slate-600">{product.category}</TableCell>
                          <TableCell className="text-right font-semibold text-slate-800">
                            {formatPrice(product.price)}
                          </TableCell>
                          <TableCell>{getStockBadge(product.stock)}</TableCell>
                          <TableCell className="text-right py-2.5">
                            <div className="flex justify-end gap-1.5">
                              <Button
                                variant="outline"
                                size="icon"
                                className="h-8 w-8 text-slate-600 bg-white hover:bg-slate-50 hover:text-indigo-600 border-slate-200/80"
                                onClick={() => openEditDialog(product)}
                              >
                                <Edit className="h-3.5 w-3.5" />
                              </Button>
                              <Button
                                variant="outline"
                                size="icon"
                                className="h-8 w-8 text-slate-600 bg-white hover:bg-red-50 hover:text-red-600 hover:border-red-200 border-slate-200/80"
                                onClick={() => openDeleteConfirm(product)}
                              >
                                <Trash2 className="h-3.5 w-3.5" />
                              </Button>
                            </div>
                          </TableCell>
                        </motion.tr>
                      ))}
                    </AnimatePresence>
                  </TableBody>
                </Table>
              </div>
            ) : (
              /* GRID VIEW (STAGGERED POP-IN) */
              <motion.div
                variants={gridContainerVariants}
                initial="hidden"
                animate="show"
                className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3"
              >
                <AnimatePresence mode="popLayout">
                  {products.map((product) => (
                    <motion.div
                      key={product.id}
                      variants={gridCardVariants}
                      exit={{ opacity: 0, scale: 0.9, y: 15 }}
                      layoutId={product.id}
                      className="flex flex-col"
                    >
                      <Card className="group overflow-hidden bg-white/40 backdrop-blur-md border border-white/40 shadow-sm transition-all duration-300 hover:shadow-md hover:-translate-y-0.5 flex flex-col h-full">
                        <div className="relative h-44 w-full overflow-hidden bg-slate-100">
                          {product.imageUrl ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img
                              src={product.imageUrl}
                              alt={product.name}
                              className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                            />
                          ) : (
                            <div className="flex h-full w-full items-center justify-center font-semibold text-slate-400">
                              No Image Available
                            </div>
                          )}
                          <div className="absolute top-3 left-3">{getStockBadge(product.stock)}</div>
                          <div className="absolute top-3 right-3">
                            <Badge className="bg-slate-900/80 backdrop-blur text-white hover:bg-slate-900 border-none font-medium text-xs px-2.5 py-0.5 rounded-full">
                              {product.category}
                            </Badge>
                          </div>
                        </div>
                        <CardHeader className="p-4 pb-2 space-y-1">
                          <div className="flex justify-between items-start gap-2">
                            <CardTitle className="text-base font-bold text-slate-800 group-hover:text-indigo-600 transition-colors line-clamp-1">
                              {product.name}
                            </CardTitle>
                            <span className="text-base font-bold text-slate-900 shrink-0">
                              {formatPrice(product.price)}
                            </span>
                          </div>
                        </CardHeader>
                        <CardContent className="px-4 py-0 flex-1">
                          <CardDescription className="text-xs text-slate-500 line-clamp-2 min-h-[32px] leading-relaxed">
                            {product.description || "No description provided."}
                          </CardDescription>
                        </CardContent>
                        <CardFooter className="p-4 pt-3 flex gap-2 border-t border-slate-100/50 bg-slate-50/30 mt-3">
                          <Button
                            variant="outline"
                            className="flex-1 text-slate-700 bg-white hover:bg-slate-50 border-slate-200/80 hover:text-indigo-600 gap-1.5 h-8.5 rounded-lg text-xs"
                            onClick={() => openEditDialog(product)}
                          >
                            <Edit className="h-3.5 w-3.5" />
                            Edit
                          </Button>
                          <Button
                            variant="outline"
                            className="flex-1 text-slate-600 bg-white hover:bg-red-50 hover:text-red-600 hover:border-red-200 border-slate-200/80 gap-1.5 h-8.5 rounded-lg text-xs"
                            onClick={() => openDeleteConfirm(product)}
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                            Delete
                          </Button>
                        </CardFooter>
                      </Card>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </motion.div>
            )}
          </motion.div>
        </AnimatePresence>
      )}

      {/* ── Pagination footer – ALWAYS mounted to prevent height collapse ── */}
      {paginationFooter}
    </div>
  );
}

/* ─── Skeleton for table/grid body only (no pagination – parent handles it) ─── */
function TableContentSkeleton({ viewMode, limit }: { viewMode: "grid" | "table"; limit: number }) {
  if (viewMode === "table") {
    return (
      <div className="overflow-hidden rounded-xl border border-slate-100 bg-white/40 shadow-sm">
        <Table>
          <TableHeader className="bg-slate-50/50">
            <TableRow className="border-b border-slate-100">
              <TableHead className="w-[80px]"><Skeleton className="h-4 w-10" /></TableHead>
              <TableHead><Skeleton className="h-4 w-20" /></TableHead>
              <TableHead><Skeleton className="h-4 w-16" /></TableHead>
              <TableHead className="text-right"><Skeleton className="h-4 w-12 ml-auto" /></TableHead>
              <TableHead><Skeleton className="h-4 w-16" /></TableHead>
              <TableHead className="w-[100px] text-right"><Skeleton className="h-4 w-12 ml-auto" /></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {Array.from({ length: limit }).map((_, i) => (
              <TableRow key={i} className="border-b border-slate-100">
                <TableCell className="py-3">
                  <Skeleton className="h-10 w-10 rounded-lg" />
                </TableCell>
                <TableCell>
                  <div className="space-y-1.5">
                    <Skeleton className="h-4 w-40" />
                    <Skeleton className="h-3.5 w-28" />
                  </div>
                </TableCell>
                <TableCell><Skeleton className="h-4 w-20" /></TableCell>
                <TableCell><Skeleton className="h-4 w-12 ml-auto" /></TableCell>
                <TableCell><Skeleton className="h-5 w-24 rounded-full" /></TableCell>
                <TableCell className="text-right py-3">
                  <div className="flex justify-end gap-1.5">
                    <Skeleton className="h-8 w-8 rounded-md" />
                    <Skeleton className="h-8 w-8 rounded-md" />
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    );
  }

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {Array.from({ length: limit }).map((_, i) => (
        <Card key={i} className="bg-white/40 border border-slate-150 flex flex-col h-[300px]">
          <Skeleton className="h-44 w-full rounded-t-xl" />
          <CardHeader className="p-4 pb-2 space-y-1">
            <div className="flex justify-between items-start gap-2">
              <Skeleton className="h-5 w-28" />
              <Skeleton className="h-5 w-12 shrink-0" />
            </div>
          </CardHeader>
          <CardContent className="px-4 py-0 flex-1">
            <Skeleton className="h-4 w-full mt-1" />
          </CardContent>
          <CardFooter className="p-4 pt-3 flex gap-2 border-t border-slate-100">
            <Skeleton className="h-8.5 flex-1 rounded-lg" />
            <Skeleton className="h-8.5 flex-1 rounded-lg" />
          </CardFooter>
        </Card>
      ))}
    </div>
  );
}
