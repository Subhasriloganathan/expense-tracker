"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";

type Expense = {
  id: string;
  title: string;
  amount: number;
  category: string;
  date: string;
  description: string | null;
  user_id: string;
};

export default function DashboardPage() {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadExpenses();
  }, []);

  const loadExpenses = async () => {
    try {
      const supabase = createClient();

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

      if (error) {
        console.error("Dashboard error:", error);
      } else {
        setExpenses(data || []);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const totalExpenses = expenses.reduce(
    (total, expense) => total + Number(expense.amount),
    0
  );

  const categories = [...new Set(expenses.map((expense) => expense.category))];

  const categoryTotals = categories.map((category) => {
    const total = expenses
      .filter((expense) => expense.category === category)
      .reduce((sum, expense) => sum + Number(expense.amount), 0);

    return {
      category,
      total,
    };
  });

  const maxCategoryAmount =
    categoryTotals.length > 0
      ? Math.max(...categoryTotals.map((item) => item.total))
      : 0;

  return (
    <main className="min-h-screen bg-[#020617] px-4 py-8 text-white sm:px-6 lg:px-8">
      {/* Background Glow */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute -left-32 -top-32 h-80 w-80 rounded-full bg-blue-600/10 blur-3xl" />
        <div className="absolute -bottom-32 -right-32 h-80 w-80 rounded-full bg-cyan-500/10 blur-3xl" />
      </div>

      <div className="relative mx-auto max-w-7xl">
        {/* Header */}
        <div className="mb-8">
          <p className="mb-2 text-sm font-medium text-blue-400">
            Expense Tracker
          </p>

          <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
            Dashboard
          </h1>

          <p className="mt-2 text-sm text-slate-400">
            Track your spending and understand your financial habits.
          </p>
        </div>

        {loading ? (
          <div className="flex min-h-[300px] items-center justify-center">
            <div className="h-8 w-8 animate-spin rounded-full border-2 border-slate-600 border-t-blue-400" />
          </div>
        ) : (
          <>
            {/* Summary Cards */}
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
              {/* Total Expenses */}
              <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-6 shadow-xl backdrop-blur-xl">
                <div className="mb-4 flex items-center justify-between">
                  <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-500/10">
                    <svg
                      className="h-6 w-6 text-blue-400"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-10V5m0 14v-3m7-4a7 7 0 11-14 0 7 7 0 0114 0z"
                      />
                    </svg>
                  </div>
                </div>

                <p className="text-sm text-slate-400">Total Expenses</p>

                <h2 className="mt-2 text-2xl font-bold">
                  ₹{totalExpenses.toLocaleString("en-IN")}
                </h2>
              </div>

              {/* Transactions */}
              <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-6 shadow-xl backdrop-blur-xl">
                <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-xl bg-cyan-500/10">
                  <svg
                    className="h-6 w-6 text-cyan-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a3 3 0 006 0M9 5h6"
                    />
                  </svg>
                </div>

                <p className="text-sm text-slate-400">Transactions</p>

                <h2 className="mt-2 text-2xl font-bold">
                  {expenses.length}
                </h2>
              </div>

              {/* Categories */}
              <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-6 shadow-xl backdrop-blur-xl">
                <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-xl bg-purple-500/10">
                  <svg
                    className="h-6 w-6 text-purple-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M4 6h16M4 12h16M4 18h16"
                    />
                  </svg>
                </div>

                <p className="text-sm text-slate-400">Categories</p>

                <h2 className="mt-2 text-2xl font-bold">
                  {categories.length}
                </h2>
              </div>

              {/* Average */}
              <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-6 shadow-xl backdrop-blur-xl">
                <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-500/10">
                  <svg
                    className="h-6 w-6 text-emerald-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 8v8m-4-4h8M5 4h14a1 1 0 011 1v14a1 1 0 01-1 1H5a1 1 0 01-1-1V5a1 1 0 011-1z"
                    />
                  </svg>
                </div>

                <p className="text-sm text-slate-400">Average Expense</p>

                <h2 className="mt-2 text-2xl font-bold">
                  ₹
                  {expenses.length > 0
                    ? Math.round(
                        totalExpenses / expenses.length
                      ).toLocaleString("en-IN")
                    : "0"}
                </h2>
              </div>
            </div>

            {/* Main Grid */}
            <div className="mt-6 grid gap-6 lg:grid-cols-2">
              {/* Category Spending */}
              <section className="rounded-2xl border border-white/10 bg-white/[0.04] p-6 shadow-xl backdrop-blur-xl">
                <div className="mb-6">
                  <h2 className="text-lg font-semibold">
                    Category Spending
                  </h2>

                  <p className="mt-1 text-sm text-slate-400">
                    See where your money is going.
                  </p>
                </div>

                {categoryTotals.length === 0 ? (
                  <div className="rounded-xl border border-dashed border-white/10 py-12 text-center">
                    <p className="text-sm text-slate-500">
                      No expense data available.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-5">
                    {categoryTotals.map((item) => {
                      const percentage =
                        maxCategoryAmount > 0
                          ? (item.total / maxCategoryAmount) * 100
                          : 0;

                      return (
                        <div key={item.category}>
                          <div className="mb-2 flex items-center justify-between">
                            <span className="text-sm font-medium text-slate-300">
                              {item.category}
                            </span>

                            <span className="text-sm font-semibold text-white">
                              ₹
                              {item.total.toLocaleString(
                                "en-IN"
                              )}
                            </span>
                          </div>

                          <div className="h-2 overflow-hidden rounded-full bg-slate-800">
                            <div
                              className="h-full rounded-full bg-gradient-to-r from-blue-600 to-cyan-400 transition-all duration-700"
                              style={{
                                width: `${percentage}%`,
                              }}
                            />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </section>

              {/* Recent Expenses */}
              <section className="rounded-2xl border border-white/10 bg-white/[0.04] p-6 shadow-xl backdrop-blur-xl">
                <div className="mb-6 flex items-center justify-between">
                  <div>
                    <h2 className="text-lg font-semibold">
                      Recent Expenses
                    </h2>

                    <p className="mt-1 text-sm text-slate-400">
                      Your latest transactions.
                    </p>
                  </div>
                </div>

                {expenses.length === 0 ? (
                  <div className="rounded-xl border border-dashed border-white/10 py-12 text-center">
                    <p className="text-sm text-slate-500">
                      No expenses added yet.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {expenses.slice(0, 6).map((expense) => (
                      <div
                        key={expense.id}
                        className="flex items-center justify-between rounded-xl border border-white/5 bg-slate-900/50 p-4 transition hover:border-blue-500/20"
                      >
                        <div className="flex min-w-0 items-center gap-3">
                          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-blue-500/10 text-blue-400">
                            ₹
                          </div>

                          <div className="min-w-0">
                            <p className="truncate text-sm font-medium text-white">
                              {expense.title}
                            </p>

                            <p className="mt-1 text-xs text-slate-500">
                              {expense.category} •{" "}
                              {expense.date}
                            </p>
                          </div>
                        </div>

                        <p className="ml-4 shrink-0 text-sm font-semibold text-white">
                          ₹
                          {Number(expense.amount).toLocaleString(
                            "en-IN"
                          )}
                        </p>
                      </div>
                    ))}
                  </div>
                )}
              </section>
            </div>
          </>
        )}
      </div>
    </main>
  );
}