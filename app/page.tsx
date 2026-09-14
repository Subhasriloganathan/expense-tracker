"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";

interface Expense {
  category: string;
  amount: number;
}

export default function Home() {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const [totalIncome, setTotalIncome] = useState(0);
  const [totalExpense, setTotalExpense] = useState(0);

  const [advice, setAdvice] = useState(
    "Analyzing your spending..."
  );

  const [aiLoading, setAiLoading] = useState(false);

  useEffect(() => {
    const supabase = createClient();

    const loadDashboard = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      setUser(user);

      if (!user) {
        setLoading(false);
        return;
      }

      const { data: incomes, error: incomeError } =
        await supabase
          .from("incomes")
          .select("amount")
          .eq("user_id", user.id);

      if (incomeError) {
        console.error("Income error:", incomeError);
      }

      const { data: expenseData, error: expenseError } =
        await supabase
          .from("expenses")
          .select("category, amount")
          .eq("user_id", user.id);

      if (expenseError) {
        console.error("Expense error:", expenseError);
      }

      const incomeTotal =
        incomes?.reduce(
          (sum, item) => sum + Number(item.amount),
          0
        ) || 0;

      const expenseTotal =
        expenseData?.reduce(
          (sum, item) => sum + Number(item.amount),
          0
        ) || 0;

      setTotalIncome(incomeTotal);
      setTotalExpense(expenseTotal);

      await generateAdvice(
        expenseData || [],
        incomeTotal,
        expenseTotal
      );

      setLoading(false);
    };

    loadDashboard();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(() => {
      loadDashboard();
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const generateAdvice = async (
    expenseData: Expense[],
    income: number,
    expense: number
  ) => {
    if (expenseData.length === 0) {
      setAdvice(
        "Add some expenses first. The AI will analyze your spending and provide personalized financial advice."
      );
      return;
    }

    setAiLoading(true);

    try {
      const response = await fetch("/api/ai-advisor", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          expenses: expenseData,
          income: income,
          totalExpense: expense,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.error || "AI request failed"
        );
      }

      setAdvice(
        data.advice ||
          "AI could not generate advice at this time."
      );
    } catch (error) {
      console.error("AI Advisor Error:", error);

      setAdvice(
        "Unable to generate AI advice right now. Please try again."
      );
    } finally {
      setAiLoading(false);
    }
  };

  const handleLogout = async () => {
    const supabase = createClient();

    await supabase.auth.signOut();

    window.location.href = "/login";
  };

  const balance = totalIncome - totalExpense;

  let healthScore = 0;

  if (totalIncome > 0) {
    const expenseRatio =
      totalExpense / totalIncome;

    if (expenseRatio <= 0.3) {
      healthScore = 90;
    } else if (expenseRatio <= 0.5) {
      healthScore = 80;
    } else if (expenseRatio <= 0.7) {
      healthScore = 65;
    } else if (expenseRatio <= 0.9) {
      healthScore = 50;
    } else {
      healthScore = 30;
    }

    if (balance > 0) {
      healthScore += 5;
    }

    if (healthScore > 100) {
      healthScore = 100;
    }
  }

  const healthStatus =
    healthScore >= 80
      ? "Excellent"
      : healthScore >= 60
      ? "Good"
      : healthScore >= 40
      ? "Needs Attention"
      : "Critical";

  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-slate-950">
        <div className="text-center">
          <div className="mx-auto h-10 w-10 animate-spin rounded-full border-4 border-slate-700 border-t-blue-500" />
          <p className="mt-4 text-sm text-slate-400">
            Loading your dashboard...
          </p>
        </div>
      </main>
    );
  }

  return (
    <main className="relative min-h-screen overflow-hidden bg-slate-950 px-4 py-6 text-white sm:px-6 lg:px-8">

      {/* Background Glow */}
      <div className="pointer-events-none absolute -left-40 -top-40 h-96 w-96 rounded-full bg-blue-600/20 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-40 -right-40 h-96 w-96 rounded-full bg-cyan-500/10 blur-3xl" />

      <div className="relative mx-auto max-w-7xl">

        {/* Header */}
        <header className="mb-8 flex flex-col gap-5 rounded-3xl border border-white/10 bg-white/[0.05] p-5 shadow-2xl backdrop-blur-xl sm:flex-row sm:items-center sm:justify-between">

          <div className="flex items-center gap-4">

            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-500 to-cyan-400 shadow-lg shadow-blue-500/20">

              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.8"
                className="h-6 w-6 text-white"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M3 10.5 12 3l9 7.5"
                />
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M5 9.5V21h14V9.5"
                />
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M9 21v-6h6v6"
                />
              </svg>

            </div>

            <div>
              <h1 className="text-xl font-bold tracking-tight sm:text-2xl">
                Expense Tracker
              </h1>

              <p className="text-xs text-slate-400 sm:text-sm">
                Manage your money smarter
              </p>
            </div>

          </div>

          {!user ? (
            <div className="flex gap-3">

              <Link
                href="/login"
                className="rounded-xl border border-white/10 bg-white/[0.06] px-5 py-2.5 text-sm font-semibold text-slate-200 transition hover:bg-white/[0.1]"
              >
                Login
              </Link>

              <Link
                href="/signup"
                className="rounded-xl bg-gradient-to-r from-blue-600 to-cyan-500 px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-blue-500/20 transition hover:-translate-y-0.5"
              >
                Sign Up
              </Link>

            </div>
          ) : (
            <div className="flex items-center gap-3">

              <div className="hidden rounded-xl border border-white/10 bg-white/[0.05] px-4 py-2 sm:block">
                <p className="text-xs text-slate-500">
                  Logged in as
                </p>
                <p className="max-w-[220px] truncate text-sm text-slate-300">
                  {user.email}
                </p>
              </div>

              <button
                onClick={handleLogout}
                className="rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-2.5 text-sm font-semibold text-red-300 transition hover:bg-red-500/20"
              >
                Logout
              </button>

            </div>
          )}

        </header>

        {!user ? (

          /* Logged Out */
          <div className="rounded-3xl border border-white/10 bg-white/[0.05] p-10 text-center shadow-2xl backdrop-blur-xl">

            <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-3xl bg-gradient-to-br from-blue-500/20 to-cyan-400/20">

              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.6"
                className="h-10 w-10 text-blue-400"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M3 10.5 12 3l9 7.5"
                />
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M5 9.5V21h14V9.5"
                />
              </svg>

            </div>

            <h2 className="mt-6 text-2xl font-bold sm:text-3xl">
              Welcome to Expense Tracker
            </h2>

            <p className="mx-auto mt-3 max-w-md text-sm leading-6 text-slate-400">
              Track your income, control your expenses and
              understand your financial health.
            </p>

            <Link
              href="/login"
              className="mt-7 inline-block rounded-xl bg-gradient-to-r from-blue-600 to-cyan-500 px-7 py-3 font-semibold text-white shadow-lg shadow-blue-500/20 transition hover:-translate-y-0.5"
            >
              Get Started
            </Link>

          </div>

        ) : (

          <>
            {/* Welcome */}
            <div className="mb-7">
              <p className="text-sm text-blue-400">
                Welcome back 👋
              </p>

              <h2 className="mt-1 text-2xl font-bold sm:text-3xl">
                Your Financial Dashboard
              </h2>

              <p className="mt-1 text-sm text-slate-500">
                Here&apos;s an overview of your finances.
              </p>
            </div>

            {/* Summary Cards */}
            <div className="grid gap-5 md:grid-cols-3">

              {/* Income */}
              <div className="group rounded-3xl border border-white/10 bg-white/[0.05] p-6 shadow-xl backdrop-blur-xl transition duration-300 hover:-translate-y-1 hover:bg-white/[0.07]">

                <div className="flex items-center justify-between">

                  <div>
                    <p className="text-sm text-slate-400">
                      Total Income
                    </p>

                    <h2 className="mt-3 text-3xl font-bold text-emerald-400">
                      ₹{totalIncome.toLocaleString("en-IN")}
                    </h2>
                  </div>

                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-500/10 text-emerald-400">

                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.8"
                      className="h-6 w-6"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M12 19V5"
                      />
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="m6 11 6-6 6 6"
                      />
                    </svg>

                  </div>

                </div>

                <p className="mt-4 text-xs text-slate-500">
                  Money received
                </p>

              </div>

              {/* Expense */}
              <div className="group rounded-3xl border border-white/10 bg-white/[0.05] p-6 shadow-xl backdrop-blur-xl transition duration-300 hover:-translate-y-1 hover:bg-white/[0.07]">

                <div className="flex items-center justify-between">

                  <div>
                    <p className="text-sm text-slate-400">
                      Total Expense
                    </p>

                    <h2 className="mt-3 text-3xl font-bold text-red-400">
                      ₹{totalExpense.toLocaleString("en-IN")}
                    </h2>
                  </div>

                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-red-500/10 text-red-400">

                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.8"
                      className="h-6 w-6"
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

                <p className="mt-4 text-xs text-slate-500">
                  Money spent
                </p>

              </div>

              {/* Balance */}
              <div className="group rounded-3xl border border-blue-500/20 bg-gradient-to-br from-blue-500/10 to-cyan-500/5 p-6 shadow-xl backdrop-blur-xl transition duration-300 hover:-translate-y-1">

                <div className="flex items-center justify-between">

                  <div>
                    <p className="text-sm text-slate-400">
                      Current Balance
                    </p>

                    <h2
                      className={`mt-3 text-3xl font-bold ${
                        balance >= 0
                          ? "text-blue-400"
                          : "text-red-400"
                      }`}
                    >
                      ₹{balance.toLocaleString("en-IN")}
                    </h2>
                  </div>

                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-500/10 text-blue-400">

                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.8"
                      className="h-6 w-6"
                    >
                      <rect
                        x="3"
                        y="5"
                        width="18"
                        height="14"
                        rx="2"
                      />
                      <path d="M3 10h18" />
                      <path d="M16 15h2" />
                    </svg>

                  </div>

                </div>

                <p className="mt-4 text-xs text-slate-500">
                  Income minus expenses
                </p>

              </div>

            </div>

            {/* AI Advisor */}
            <div className="mt-6 rounded-3xl border border-purple-500/20 bg-gradient-to-br from-purple-500/10 via-white/[0.04] to-blue-500/5 p-6 shadow-xl backdrop-blur-xl">

              <div className="flex items-start gap-4">

                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-purple-500/15">

                  <span className="text-2xl">
                    🤖
                  </span>

                </div>

                <div>
                  <h2 className="text-lg font-bold text-white">
                    AI Spending Advisor
                  </h2>

                  <p className="mt-1 text-sm text-slate-500">
                    AI-powered analysis of your spending pattern
                  </p>
                </div>

              </div>

              <div className="mt-5 rounded-2xl border border-white/5 bg-black/20 p-5">

                <p className="text-sm font-semibold text-purple-300">
                  💡 Financial Insight
                </p>

                <p className="mt-3 whitespace-pre-line text-sm leading-7 text-slate-300">
                  {aiLoading
                    ? "🤖 AI is analyzing your expenses..."
                    : advice}
                </p>

              </div>

            </div>

            {/* Financial Health */}
            <div className="mt-6 rounded-3xl border border-white/10 bg-white/[0.05] p-6 shadow-xl backdrop-blur-xl">

              <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">

                <div>

                  <div className="flex items-center gap-3">

                    <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-pink-500/10">
                      ❤️
                    </div>

                    <div>
                      <h2 className="text-lg font-bold">
                        Financial Health
                      </h2>

                      <p className="text-xs text-slate-500">
                        Based on your spending pattern
                      </p>
                    </div>

                  </div>

                </div>

                <div className="text-left sm:text-right">

                  <p className="text-4xl font-bold">
                    {healthScore}
                    <span className="text-lg text-slate-600">
                      /100
                    </span>
                  </p>

                  <p className="mt-1 text-sm font-semibold text-blue-400">
                    {healthStatus}
                  </p>

                </div>

              </div>

              {/* Progress */}
              <div className="mt-6">

                <div className="h-3 overflow-hidden rounded-full bg-slate-800">

                  <div
                    className="h-full rounded-full bg-gradient-to-r from-blue-600 to-cyan-400 transition-all duration-700"
                    style={{
                      width: `${healthScore}%`,
                    }}
                  />

                </div>

              </div>

              {/* Details */}
              <div className="mt-5 grid gap-4 sm:grid-cols-2">

                <div className="rounded-2xl border border-white/5 bg-black/20 p-4">

                  <p className="text-xs text-slate-500">
                    Income
                  </p>

                  <p className="mt-2 font-bold text-emerald-400">
                    ₹{totalIncome.toLocaleString("en-IN")}
                  </p>

                </div>

                <div className="rounded-2xl border border-white/5 bg-black/20 p-4">

                  <p className="text-xs text-slate-500">
                    Spending
                  </p>

                  <p className="mt-2 font-bold text-red-400">
                    ₹{totalExpense.toLocaleString("en-IN")}
                  </p>

                </div>

              </div>

            </div>

            {/* Quick Actions */}
            <div className="mt-6 rounded-3xl border border-white/10 bg-white/[0.05] p-6 shadow-xl backdrop-blur-xl">

              <div className="mb-5">
                <h2 className="text-lg font-bold">
                  Quick Actions
                </h2>

                <p className="mt-1 text-xs text-slate-500">
                  Manage your finances quickly
                </p>
              </div>

              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">

                <Link
                  href="/expenses/add"
                  className="rounded-2xl bg-gradient-to-r from-blue-600 to-cyan-500 px-5 py-3.5 text-center text-sm font-semibold shadow-lg shadow-blue-500/10 transition hover:-translate-y-0.5"
                >
                  + Add Expense
                </Link>

                <Link
                  href="/income"
                  className="rounded-2xl border border-emerald-500/20 bg-emerald-500/10 px-5 py-3.5 text-center text-sm font-semibold text-emerald-300 transition hover:bg-emerald-500/15"
                >
                  + Add Income
                </Link>

                <Link
                  href="/expenses"
                  className="rounded-2xl border border-white/10 bg-white/[0.04] px-5 py-3.5 text-center text-sm font-semibold text-slate-300 transition hover:bg-white/[0.08]"
                >
                  View Expenses
                </Link>

                <Link
                  href="/categories"
                  className="rounded-2xl border border-white/10 bg-white/[0.04] px-5 py-3.5 text-center text-sm font-semibold text-slate-300 transition hover:bg-white/[0.08]"
                >
                  Categories
                </Link>

                <Link
                  href="/reports"
                  className="rounded-2xl border border-white/10 bg-white/[0.04] px-5 py-3.5 text-center text-sm font-semibold text-slate-300 transition hover:bg-white/[0.08]"
                >
                  Reports
                </Link>

                <Link
                  href="/analytics"
                  className="rounded-2xl border border-white/10 bg-white/[0.04] px-5 py-3.5 text-center text-sm font-semibold text-slate-300 transition hover:bg-white/[0.08]"
                >
                  Analytics
                </Link>

              </div>

            </div>

          </>
        )}

      </div>
    </main>
  );
}