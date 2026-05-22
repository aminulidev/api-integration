"use client";

import { useGetProductsStats } from "@/hooks/use-products";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Package, DollarSign, ShieldAlert, AlertTriangle } from "lucide-react";
import { motion } from "framer-motion";

export function DashboardHeader() {
  const { data: stats, isLoading, isError } = useGetProductsStats();

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(val);
  };

  const statItems = [
    {
      title: "Total Products",
      value: stats ? stats.totalProducts.toString() : "0",
      description: "Active catalog items",
      icon: Package,
      gradient: "from-blue-500/10 to-indigo-500/10 border-blue-500/20 text-blue-500",
    },
    {
      title: "Total Valuation",
      value: stats ? formatCurrency(stats.totalValuation) : "$0.00",
      description: "Inventory asset value",
      icon: DollarSign,
      gradient: "from-emerald-500/10 to-teal-500/10 border-emerald-500/20 text-emerald-500",
    },
    {
      title: "Out of Stock",
      value: stats ? stats.outOfStock.toString() : "0",
      description: "Requires urgent restock",
      icon: ShieldAlert,
      gradient: stats?.outOfStock && stats.outOfStock > 0
        ? "from-red-500/20 to-rose-500/20 border-red-500/40 text-red-500 animate-pulse"
        : "from-slate-500/5 to-slate-500/5 border-slate-500/10 text-slate-400",
    },
    {
      title: "Low Stock",
      value: stats ? stats.lowStock.toString() : "0",
      description: "Items under 5 units",
      icon: AlertTriangle,
      gradient: stats?.lowStock && stats.lowStock > 0
        ? "from-amber-500/15 to-orange-500/15 border-amber-500/30 text-amber-500"
        : "from-slate-500/5 to-slate-500/5 border-slate-500/10 text-slate-400",
    },
  ];

  // Stagger entry configurations
  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.06,
      },
    },
  };

  const cardVariants = {
    hidden: { opacity: 0, y: 15, scale: 0.98 },
    show: { 
      opacity: 1, 
      y: 0, 
      scale: 1, 
      transition: { 
        type: "spring" as const, 
        stiffness: 110, 
        damping: 16 
      } 
    },
  };

  return (
    <motion.div 
      variants={containerVariants}
      initial="hidden"
      animate="show"
      className="grid gap-4 md:grid-cols-2 lg:grid-cols-4"
    >
      {statItems.map((item, index) => {
        const Icon = item.icon;
        return (
          <motion.div key={index} variants={cardVariants}>
            <Card
              className={`relative overflow-hidden bg-white/40 backdrop-blur-md border shadow-sm transition-all duration-300 hover:shadow-md hover:-translate-y-0.5 bg-gradient-to-br ${item.gradient}`}
            >
              <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                <CardTitle className="text-sm font-medium text-slate-700">
                  {item.title}
                </CardTitle>
                <div className="p-2 rounded-lg bg-white/80 shadow-sm border border-slate-100">
                  <Icon className="w-4 h-4" />
                </div>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <div className="space-y-2">
                    <Skeleton className="h-8 w-28 bg-slate-200/80" />
                    <Skeleton className="h-4 w-20 bg-slate-200/50" />
                  </div>
                ) : isError ? (
                  <div className="space-y-1">
                    <div className="text-xl font-bold text-red-500">Error</div>
                    <p className="text-xs text-slate-500">Failed to load</p>
                  </div>
                ) : (
                  <>
                    <div className="text-2xl font-bold tracking-tight text-slate-800">
                      {item.value}
                    </div>
                    <p className="mt-1 text-xs text-slate-500 font-medium">
                      {item.description}
                    </p>
                  </>
                )}
              </CardContent>
            </Card>
          </motion.div>
        );
      })}
    </motion.div>
  );
}
