"use client";

import { useMemo, useState } from "react";

type Expense = {
  id: string;
  title: string;
  amount: number;
  category: string;
  date: string;
  description?: string | null;
};

type Props = {
  expenses: Expense[];
};

export default function ExpenseSearch({ expenses }: Props) {
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("All");

  const categories = useMemo(() => {
    return ["All", ...new Set(expenses.map((expense) => expense.category))];
  }, [expenses]);

  const filteredExpenses = useMemo(() => {
    return expenses.filter((expense) => {
      const matchesSearch =
        expense.title.toLowerCase().includes(search.toLowerCase()) ||
        expense.category.toLowerCase().includes(search.toLowerCase()) ||
        (expense.description || "")
          .toLowerCase()
          .includes(search.toLowerCase());

      const matchesCategory =
        category === "All" || expense.category === category;

      return matchesSearch && matchesCategory;
    });
  }, [expenses, search, category]);

  return (
    <div className="space-y-5">
      {/* Search + Filter */}
      <div className="grid gap-3 sm:grid-cols-[1fr_200px]">
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
            placeholder="Search expenses..."
            className="w-full rounded-xl border border-white/10 bg-slate-900/70 py-3 pl-12 pr-4 text-sm text-white outline-none placeholder:text-slate-500 focus:border-blue-500/50 focus:ring-2 focus:ring-blue-500/10"
          />
        </div>

        <select
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          className="rounded-xl border border-white/10 bg-slate-900/70 px-4 py-3 text-sm text-white outline-none focus:border-blue-500/50"
        >
          {categories.map((item) => (
            <option
              key={item}
              value={item}
              className="bg-slate-900"
            >
              {item === "All" ? "All Categories" : item}
            </option>
          ))}
        </select>
      </div>

      {/* Results */}
      {filteredExpenses.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-white/10 py-12 text-center">
          <p className="text-sm text-slate-500">
            No expenses found.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredExpenses.map((expense) => (
            <div
              key={expense.id}
              className="flex items-center justify-between rounded-xl border border-white/10 bg-white/[0.04] p-4 transition hover:border-blue-500/20"
            >
              <div className="min-w-0">
                <h3 className="truncate text-sm font-semibold text-white">
                  {expense.title}
                </h3>

                <p className="mt-1 text-xs text-slate-500">
                  {expense.category} • {expense.date}
                </p>

                {expense.description && (
                  <p className="mt-1 truncate text-xs text-slate-600">
                    {expense.description}
                  </p>
                )}
              </div>

              <p className="ml-4 shrink-0 text-sm font-bold text-white">
                ₹{Number(expense.amount).toLocaleString("en-IN")}
              </p>
            </div>
          ))}
        </div>
      )}

      <p className="text-xs text-slate-500">
        Showing {filteredExpenses.length} of {expenses.length} expenses
      </p>
    </div>
  );
}