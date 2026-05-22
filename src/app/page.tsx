"use client";

import { Suspense } from "react";
import { DashboardHeader } from "@/components/dashboard-header";
import { FilterToolbar } from "@/components/filter-toolbar";
import { ProductTable } from "@/components/product-table";
import { ProductDialog } from "@/components/product-dialog";
import { DeleteConfirmDialog } from "@/components/delete-confirm-dialog";
import { Layers } from "lucide-react";

function DashboardContent() {
  return (
    <>
      {/* 1. Statistics Summary Header */}
      <DashboardHeader />

      {/* 2. Controls Toolbar (Search, Filter, Sort, Add) */}
      <FilterToolbar />

      {/* 3. Product Listings (Table / Grid + Pagination) */}
      <ProductTable />

      {/* 4. Slide-over Creation & Editing Form */}
      <ProductDialog />

      {/* 5. Delete Confirmation Dialog */}
      <DeleteConfirmDialog />
    </>
  );
}

export default function Home() {
  return (
    <div className="relative min-h-screen flex flex-col bg-slate-50/60 pb-16">
      {/* Dynamic Aesthetic Background Gradients */}
      <div className="absolute top-[-20%] left-[-10%] w-[500px] h-[500px] rounded-full bg-indigo-400/10 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[600px] h-[600px] rounded-full bg-teal-400/10 blur-[130px] pointer-events-none" />

      {/* Main Navigation Bar */}
      <header className="sticky top-0 z-40 w-full border-b border-slate-100/80 bg-white/70 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="h-9 w-9 rounded-xl bg-indigo-600 flex items-center justify-center text-white shadow-md shadow-indigo-600/20">
              <Layers className="h-5 w-5 stroke-[2]" />
            </div>
            <div className="flex flex-col">
              <span className="text-base font-bold text-slate-800 tracking-tight leading-tight">
                AuraStore
              </span>
              <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">
                Management System
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button className="relative flex items-center gap-2.5 px-3 py-1.5 rounded-full border border-slate-150 hover:border-slate-200 bg-white/85 hover:bg-white transition-all duration-200 shadow-xs group cursor-pointer">
              <span className="font-bold">A</span>
              {/*<span className="absolute bottom-[-1.5px] right-[-1.5px] h-2 w-2 rounded-full bg-emerald-500 ring-2 ring-white">*/}
              {/*  <span className="absolute inset-0 rounded-full bg-emerald-500 animate-ping opacity-75" />*/}
              {/*</span>*/}
            </button>
          </div>
        </div>
      </header>

      {/* Dashboard Body Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 pt-8 space-y-6">
        {/* Banner Section */}
        <div className="flex flex-col gap-1.5">
          <h1 className="text-3xl font-extrabold tracking-tight text-slate-800 leading-tight">
            Inventory Dashboard
          </h1>
          <p className="text-sm font-medium text-slate-500 max-w-2xl leading-relaxed">
            Monitor catalogue stock levels, manage store valuations, search and sort product categories, and execute real-time, type-safe CRUD operations.
          </p>
        </div>

        {/* Suspense boundary wrapping nuqs consumers to support Next.js static build */}
        <Suspense
          fallback={
            <div className="space-y-6">
              {/* Header Stats Skeletal Grid */}
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                {Array.from({ length: 4 }).map((_, i) => (
                  <div
                    key={i}
                    className="h-32 rounded-xl bg-white/40 border border-slate-100/60 animate-pulse"
                  />
                ))}
              </div>
              {/* Toolbar Skeletal Bar */}
              <div className="h-16 rounded-xl bg-white/40 border border-slate-100/60 animate-pulse" />
              {/* Main List Skeletal Box */}
              <div className="h-[400px] rounded-xl bg-white/40 border border-slate-100/60 animate-pulse" />
            </div>
          }
        >
          <DashboardContent />
        </Suspense>
      </main>
    </div>
  );
}
