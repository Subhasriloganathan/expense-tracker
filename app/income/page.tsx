"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";

type Income = {
  id: string;
  source: string;
  amount: number;
  date: string;
  description: string | null;
};

export default function IncomeListPage() {
  const [incomes, setIncomes] = useState<Income[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchIncomes();
  }, []);

  async function fetchIncomes() {
    setLoading(true);

    try {
      const response = await fetch("/api/incomes");
      const result = await response.json();

      if (!response.ok) {
        alert(result.error || "Failed to load incomes");
        return;
      }

      setIncomes(result);
    } catch {
      alert("Unable to connect to server");
    } finally {
      setLoading(false);
    }
  }

  async function deleteIncome(id: string) {
    const confirmDelete = window.confirm(
      "Are you sure you want to delete this income?"
    );

    if (!confirmDelete) return;

    try {
      const response = await fetch(`/api/incomes/${id}`, {
        method: "DELETE",
      });

      const result = await response.json();

      if (!response.ok) {
        alert(result.error || "Failed to delete income");
        return;
      }

      setIncomes((prev) =>
        prev.filter((income) => income.id !== id)
      );

      alert("Income deleted successfully!");
    } catch {
      alert("Unable to connect to server");
    }
  }

  const filteredIncomes = useMemo(() => {
    const text = search.toLowerCase();

    return incomes.filter(
      (income) =>
        income.source.toLowerCase().includes(text) ||
        (income.description || "").toLowerCase().includes(text)
    );
  }, [incomes, search]);

  return (
    <main className="min-h-screen bg-slate-950 px-4 py-8 text-white sm:px-6 lg:px-10">
      <div className="mx-auto max-w-6xl">

        {/* Header */}
        <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-3xl font-bold">
              Income List
            </h1>

            <p className="mt-1 text-sm text-slate-400">
              View and manage your income
            </p>
          </div>

          <Link
            href="/incomes/add"
            className="rounded-xl bg-green-600 px-5 py-3 text-center text-sm font-semibold transition hover:bg-green-500"
          >
            + Add Income
          </Link>
        </div>

        {/* Search */}
        <div className="mb-6">
          <div className="relative">
            <svg
              className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-500"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="m21 21-4.35-4.35m2.35-5.65a8 8 0 11-16 0 8 8 0 0116 0z"
              />
            </svg>

            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search income source..."
              className="w-full rounded-xl border border-white/10 bg-white/[0.05] py-3 pl-12 pr-4 text-sm text-white outline-none placeholder:text-slate-500 focus:border-green-500"
            />
          </div>
        </div>

        {/* List */}
        <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4 sm:p-6">

          {loading ? (
            <div className="py-16 text-center text-sm text-slate-400">
              Loading incomes...
            </div>
          ) : filteredIncomes.length === 0 ? (
            <div className="py-16 text-center">
              <p className="text-lg font-semibold text-slate-300">
                No incomes found
              </p>

              <p className="mt-2 text-sm text-slate-500">
                Try another search or add a new income.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {filteredIncomes.map((income) => (
                <div
                  key={income.id}
                  className="flex flex-col gap-4 rounded-xl border border-white/10 bg-white/[0.03] p-4 transition hover:border-green-500/30 sm:flex-row sm:items-center sm:justify-between"
                >

                  {/* Details */}
                  <div className="min-w-0 flex-1">
                    <h2 className="truncate text-base font-semibold text-white">
                      {income.source}
                    </h2>

                    <div className="mt-2 flex flex-wrap gap-2 text-xs">
                      <span className="rounded-lg bg-green-500/10 px-2 py-1 text-green-400">
                        Income
                      </span>

                      <span className="rounded-lg bg-white/5 px-2 py-1 text-slate-400">
                        {income.date}
                      </span>
                    </div>

                    {income.description && (
                      <p className="mt-2 truncate text-sm text-slate-500">
                        {income.description}
                      </p>
                    )}
                  </div>

                  {/* Amount + Actions */}
                  <div className="flex items-center justify-between gap-4 sm:justify-end">

                    <p className="text-lg font-bold text-green-400">
                      +₹{Number(income.amount).toLocaleString("en-IN")}
                    </p>

                    <div className="flex gap-2">

                      <Link
                        href={`/incomes/edit/${income.id}`}
                        className="rounded-lg border border-white/10 px-3 py-2 text-xs font-medium text-slate-300 transition hover:border-green-500/40 hover:text-green-400"
                      >
                        Edit
                      </Link>

                      <button
                        onClick={() => deleteIncome(income.id)}
                        className="rounded-lg border border-red-500/20 px-3 py-2 text-xs font-medium text-red-400 transition hover:bg-red-500/10"
                      >
                        Delete
                      </button>

                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Count */}
          {!loading && incomes.length > 0 && (
            <p className="mt-5 text-xs text-slate-500">
              Showing {filteredIncomes.length} of {incomes.length} incomes
            </p>
          )}

        </div>
      </div>
    </main>
  );
}