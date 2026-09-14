"use client";

import { useEffect, useState } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { createClient } from "@/lib/supabase/client";

export default function AnalyticsPage() {
  const [data, setData] = useState<
    { category: string; amount: number }[]
  >([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadAnalytics = async () => {
      const supabase = createClient();

      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        setLoading(false);
        return;
      }

      const { data: expenses, error } = await supabase
        .from("expenses")
        .select("category, amount")
        .eq("user_id", user.id);

      if (error) {
        console.error("Analytics error:", error);
        setLoading(false);
        return;
      }

      const categoryTotals: Record<string, number> = {};

      (expenses || []).forEach((expense) => {
        const category = expense.category || "Other";
        const amount = Number(expense.amount) || 0;

        categoryTotals[category] =
          (categoryTotals[category] || 0) + amount;
      });

      const result = Object.entries(categoryTotals)
        .map(([category, amount]) => ({
          category,
          amount,
        }))
        .sort((a, b) => b.amount - a.amount);

      setData(result);
      setLoading(false);
    };

    loadAnalytics();
  }, []);

  const totalExpense = data.reduce(
    (sum, item) => sum + item.amount,
    0
  );

  const highestCategory = data.length > 0 ? data[0] : null;

  return (
    <main className="relative min-h-screen overflow-hidden bg-slate-950 px-4 py-8 text-white sm:px-6 lg:px-8">

      {/* Background Glow */}
      <div className="pointer-events-none absolute -left-40 -top-40 h-96 w-96 rounded-full bg-blue-600/20 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-40 -right-40 h-96 w-96 rounded-full bg-cyan-500/10 blur-3xl" />

      <div className="relative mx-auto max-w-7xl">

        {/* Header */}
        <div className="mb-8 flex items-center gap-4">

          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-500 to-cyan-400 shadow-lg shadow-blue-500/20">

            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.8"
              className="h-7 w-7 text-white"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M4 19V5"
              />

              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M4 19h17"
              />

              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M8 16v-5"
              />

              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M12 16V8"
              />

              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M16 16V6"
              />
            </svg>

          </div>

          <div>
            <p className="text-sm font-medium text-blue-400">
              Financial Insights
            </p>

            <h1 className="mt-1 text-2xl font-bold tracking-tight sm:text-3xl">
              Expense Analytics
            </h1>

            <p className="mt-1 text-sm text-slate-500">
              Analyze your spending category by category.
            </p>
          </div>

        </div>

        {/* Mini Summary */}
        {!loading && data.length > 0 && (
          <div className="mb-6 grid gap-4 sm:grid-cols-2">

            {/* Total Expense */}
            <div className="rounded-3xl border border-white/10 bg-white/[0.05] p-5 shadow-xl backdrop-blur-xl">

              <div className="flex items-center justify-between">

                <div>
                  <p className="text-xs text-slate-500">
                    Total Spending
                  </p>

                  <h2 className="mt-2 text-2xl font-bold text-red-400">
                    ₹{totalExpense.toLocaleString("en-IN")}
                  </h2>
                </div>

                <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-red-500/10 text-red-400">

                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.8"
                    className="h-5 w-5"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M12 5v14"
                    />

                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="m6 13 6 6 6-6"
                    />
                  </svg>

                </div>

              </div>

            </div>

            {/* Top Category */}
            <div className="rounded-3xl border border-white/10 bg-white/[0.05] p-5 shadow-xl backdrop-blur-xl">

              <div className="flex items-center justify-between">

                <div>
                  <p className="text-xs text-slate-500">
                    Highest Spending Category
                  </p>

                  <h2 className="mt-2 text-2xl font-bold text-blue-400">
                    {highestCategory?.category}
                  </h2>

                  <p className="mt-1 text-sm text-slate-500">
                    ₹
                    {highestCategory?.amount.toLocaleString(
                      "en-IN"
                    )}
                  </p>
                </div>

                <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-blue-500/10 text-blue-400">

                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.8"
                    className="h-5 w-5"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M4 19V5"
                    />

                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M4 19h17"
                    />

                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M8 16v-5"
                    />

                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M12 16V8"
                    />

                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M16 16V6"
                    />
                  </svg>

                </div>

              </div>

            </div>

          </div>
        )}

        {/* Chart Card */}
        <div className="rounded-3xl border border-white/10 bg-white/[0.05] p-5 shadow-2xl backdrop-blur-xl sm:p-7">

          <div className="mb-6">

            <h2 className="text-lg font-bold sm:text-xl">
              Category-wise Expense
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              Compare how much you spend across different
              categories.
            </p>

          </div>

          {loading ? (

            <div className="flex h-96 flex-col items-center justify-center">

              <div className="h-10 w-10 animate-spin rounded-full border-4 border-slate-800 border-t-blue-500" />

              <p className="mt-4 text-sm text-slate-500">
                Loading analytics...
              </p>

            </div>

          ) : data.length === 0 ? (

            <div className="flex h-96 flex-col items-center justify-center text-center">

              <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-white/[0.05]">

                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.6"
                  className="h-8 w-8 text-slate-600"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M4 19V5"
                  />

                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M4 19h17"
                  />

                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M8 16v-5"
                  />

                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M12 16V8"
                  />

                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M16 16V6"
                  />
                </svg>

              </div>

              <p className="mt-5 font-medium text-slate-300">
                No expenses found
              </p>

              <p className="mt-1 text-sm text-slate-600">
                Add some expenses to see your analytics.
              </p>

            </div>

          ) : (

            <div className="h-96 w-full">

              <ResponsiveContainer
                width="100%"
                height="100%"
              >
                <BarChart
                  data={data}
                  margin={{
                    top: 10,
                    right: 10,
                    left: 0,
                    bottom: 10,
                  }}
                >

                  <CartesianGrid
                    strokeDasharray="3 3"
                    stroke="rgba(148,163,184,0.12)"
                  />

                  <XAxis
                    dataKey="category"
                    tick={{
                      fill: "#94a3b8",
                      fontSize: 12,
                    }}
                    axisLine={false}
                    tickLine={false}
                  />

                  <YAxis
                    tick={{
                      fill: "#64748b",
                      fontSize: 12,
                    }}
                    axisLine={false}
                    tickLine={false}
                    tickFormatter={(value) =>
                      `₹${value}`
                    }
                  />

                  <Tooltip
                    cursor={{
                      fill: "rgba(59,130,246,0.06)",
                    }}
                    contentStyle={{
                      backgroundColor: "#0f172a",
                      border: "1px solid rgba(255,255,255,0.1)",
                      borderRadius: "12px",
                      color: "#fff",
                    }}
                    labelStyle={{
                      color: "#94a3b8",
                    }}
                    formatter={(value) =>
                      `₹${Number(value).toLocaleString(
                        "en-IN"
                      )}`
                    }
                  />

                  <Bar
                    dataKey="amount"
                    fill="#3b82f6"
                    radius={[8, 8, 0, 0]}
                  />

                </BarChart>
              </ResponsiveContainer>

            </div>

          )}

        </div>

      </div>
    </main>
  );
}