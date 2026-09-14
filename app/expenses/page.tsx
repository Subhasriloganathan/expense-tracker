"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";

type Expense = {
  id: string;
  title: string;
  amount: number;
  category: string;
  date: string;
  description: string | null;
};

export default function ExpensesPage() {
  const supabase = createClient();

  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("All");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchExpenses();
  }, []);

  async function fetchExpenses() {
    setLoading(true);

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      setLoading(false);
      return;
    }

    const { data, error } = await supabase
      .from("expenses")
      .select("*")
      .eq("user_id", user.id)
      .order("date", { ascending: false });

    if (!error && data) {
      setExpenses(data);
    }

    setLoading(false);
  }

  async function deleteExpense(id: string) {
    const confirmDelete = window.confirm(
      "Are you sure you want to delete this expense?"
    );

    if (!confirmDelete) return;

    const { error } = await supabase
      .from("expenses")
      .delete()
      .eq("id", id);

    if (error) {
      alert("Failed to delete expense");
      return;
    }

    setExpenses((prev) => prev.filter((expense) => expense.id !== id));
  }

  const categories = useMemo(() => {
    return [
      "All",
      ...Array.from(new Set(expenses.map((expense) => expense.category))),
    ];
  }, [expenses]);

  const filteredExpenses = useMemo(() => {
    return expenses.filter((expense) => {
      const searchText = search.toLowerCase();

      const matchesSearch =
        expense.title.toLowerCase().includes(searchText) ||
        expense.category.toLowerCase().includes(searchText) ||
        (expense.description || "").toLowerCase().includes(searchText);

      const matchesCategory =
        category === "All" || expense.category === category;

      return matchesSearch && matchesCategory;
    });
  }, [expenses, search, category]);

  return (
    <main className="min-h-screen bg-slate-950 px-4 py-8 text-white sm:px-6 lg:px-10">
      <div className="mx-auto max-w-6xl">

        {/* Header */}
        <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-3xl font-bold">
              Expense List
            </h1>
            <p className="mt-1 text-sm text-slate-400">
              View and manage your expenses
            </p>
          </div>

          <Link
            href="/expenses/add"
            className="rounded-xl bg-blue-600 px-5 py-3 text-center text-sm font-semibold transition hover:bg-blue-500"
          >
            + Add Expense
          </Link>
        </div>

        {/* Search + Filter */}
        <div className="mb-6 grid gap-3 sm:grid-cols-[1fr_220px]">

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
              placeholder="Search by title, category..."
              className="w-full rounded-xl border border-white/10 bg-white/[0.05] py-3 pl-12 pr-4 text-sm text-white outline-none placeholder:text-slate-500 focus:border-blue-500"
            />
          </div>

          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="rounded-xl border border-white/10 bg-slate-900 px-4 py-3 text-sm text-white outline-none focus:border-blue-500"
          >
            {categories.map((item) => (
              <option key={item} value={item}>
                {item === "All" ? "All Categories" : item}
              </option>
            ))}
          </select>
        </div>

        {/* Expense List */}
        <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4 sm:p-6">

          {loading ? (
            <div className="py-16 text-center text-sm text-slate-400">
              Loading expenses...
            </div>
          ) : filteredExpenses.length === 0 ? (
            <div className="py-16 text-center">
              <p className="text-lg font-semibold text-slate-300">
                No expenses found
              </p>

              <p className="mt-2 text-sm text-slate-500">
                Try another search or add a new expense.
              </p>
            </div>
          ) : (
            <div className="space-y-3">

              {filteredExpenses.map((expense) => (
                <div
                  key={expense.id}
                  className="flex flex-col gap-4 rounded-xl border border-white/10 bg-white/[0.03] p-4 transition hover:border-blue-500/30 sm:flex-row sm:items-center sm:justify-between"
                >

                  {/* Expense Details */}
                  <div className="min-w-0 flex-1">
                    <h2 className="truncate text-base font-semibold text-white">
                      {expense.title}
                    </h2>

                    <div className="mt-2 flex flex-wrap gap-2 text-xs">
                      <span className="rounded-lg bg-blue-500/10 px-2 py-1 text-blue-400">
                        {expense.category}
                      </span>

                      <span className="rounded-lg bg-white/5 px-2 py-1 text-slate-400">
                        {expense.date}
                      </span>
                    </div>

                    {expense.description && (
                      <p className="mt-2 truncate text-sm text-slate-500">
                        {expense.description}
                      </p>
                    )}
                  </div>

                  {/* Amount + Actions */}
                  <div className="flex items-center justify-between gap-4 sm:justify-end">

                    <p className="text-lg font-bold text-white">
                      ₹{Number(expense.amount).toLocaleString("en-IN")}
                    </p>

                    <div className="flex gap-2">

                      <Link
                        href={`/expenses/edit/${expense.id}`}
                        className="rounded-lg border border-white/10 px-3 py-2 text-xs font-medium text-slate-300 transition hover:border-blue-500/40 hover:text-blue-400"
                      >
                        Edit
                      </Link>

                      <button
                        onClick={() => deleteExpense(expense.id)}
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

          {/* Result Count */}
          {!loading && expenses.length > 0 && (
            <p className="mt-5 text-xs text-slate-500">
              Showing {filteredExpenses.length} of {expenses.length} expenses
            </p>
          )}

        </div>
      </div>
    </main>
  );
}