"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";

type Expense = {
  id: number;
  title: string;
  amount: number;
  category: string;
  date: string;
  description?: string | null;
};

export default function ReportsPage() {
  const supabase = createClient();

  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [month, setMonth] = useState("");
  const [year, setYear] = useState("2026");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadExpenses();
  }, []);

  const loadExpenses = async () => {
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
      .select(
        "id, title, amount, category, date, description"
      )
      .eq("user_id", user.id)
      .order("date", { ascending: false });

    if (error) {
      console.error(error);
      setExpenses([]);
    } else {
      setExpenses(data || []);
    }

    setLoading(false);
  };

  // =========================
  // FILTER
  // =========================

  const filteredExpenses = expenses.filter((expense) => {
    const expenseDate = new Date(expense.date);

    const expenseYear = expenseDate.getFullYear().toString();
    const expenseMonth = String(
      expenseDate.getMonth() + 1
    ).padStart(2, "0");

    const yearMatch = expenseYear === year;

    const monthMatch =
      month === "" || expenseMonth === month;

    return yearMatch && monthMatch;
  });

  // =========================
  // CATEGORY REPORT
  // =========================

  const categoryMap: Record<string, number> = {};

  filteredExpenses.forEach((expense) => {
    categoryMap[expense.category] =
      (categoryMap[expense.category] || 0) +
      Number(expense.amount);
  });

  const categoryReport = Object.entries(categoryMap)
    .map(([category, amount]) => ({
      category,
      amount,
    }))
    .sort((a, b) => b.amount - a.amount);

  const totalExpense = filteredExpenses.reduce(
    (sum, expense) => sum + Number(expense.amount),
    0
  );

  // =========================
  // HIGHEST EXPENSE
  // =========================

  const highestExpense =
    filteredExpenses.length > 0
      ? filteredExpenses.reduce((max, expense) =>
          Number(expense.amount) >
          Number(max.amount)
            ? expense
            : max
        )
      : null;

  return (
    <main className="min-h-screen bg-gray-100 p-6">
      <div className="mx-auto max-w-6xl">

        {/* HEADER */}
        <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              Expense Reports
            </h1>

            <p className="mt-1 text-gray-600">
              View your expense summary and category-wise
              spending.
            </p>
          </div>

          {/* DOWNLOAD BUTTON */}
          <Link
            href="/reports/download"
            className="inline-flex items-center justify-center rounded-lg bg-blue-600 px-5 py-3 font-semibold text-white shadow hover:bg-blue-700"
          >
            📥 Download Reports
          </Link>
        </div>

        {/* FILTER */}
        <div className="mb-6 rounded-xl bg-white p-5 shadow">
          <h2 className="mb-4 text-lg font-semibold">
            Report Filter
          </h2>

          <div className="grid gap-4 md:grid-cols-2">

            {/* MONTH */}
            <div>
              <label className="mb-2 block text-sm font-medium">
                Month
              </label>

              <select
                value={month}
                onChange={(e) => setMonth(e.target.value)}
                className="w-full rounded-lg border px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">All Months</option>
                <option value="01">January</option>
                <option value="02">February</option>
                <option value="03">March</option>
                <option value="04">April</option>
                <option value="05">May</option>
                <option value="06">June</option>
                <option value="07">July</option>
                <option value="08">August</option>
                <option value="09">September</option>
                <option value="10">October</option>
                <option value="11">November</option>
                <option value="12">December</option>
              </select>
            </div>

            {/* YEAR */}
            <div>
              <label className="mb-2 block text-sm font-medium">
                Year
              </label>

              <select
                value={year}
                onChange={(e) => setYear(e.target.value)}
                className="w-full rounded-lg border px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="2026">2026</option>
                <option value="2027">2027</option>
                <option value="2028">2028</option>
              </select>
            </div>

          </div>
        </div>

        {/* SUMMARY CARDS */}
        <div className="mb-6 grid gap-4 md:grid-cols-3">

          <div className="rounded-xl bg-white p-5 shadow">
            <p className="text-sm text-gray-500">
              Total Expense
            </p>

            <p className="mt-2 text-2xl font-bold text-red-600">
              ₹{totalExpense.toFixed(2)}
            </p>
          </div>

          <div className="rounded-xl bg-white p-5 shadow">
            <p className="text-sm text-gray-500">
              Number of Expenses
            </p>

            <p className="mt-2 text-2xl font-bold">
              {filteredExpenses.length}
            </p>
          </div>

          <div className="rounded-xl bg-white p-5 shadow">
            <p className="text-sm text-gray-500">
              Categories Used
            </p>

            <p className="mt-2 text-2xl font-bold">
              {categoryReport.length}
            </p>
          </div>

        </div>

        {/* CATEGORY REPORT */}
        <div className="mb-6 rounded-xl bg-white p-5 shadow">

          <h2 className="mb-4 text-xl font-bold">
            Category-wise Expense
          </h2>

          {loading ? (
            <p className="text-gray-500">
              Loading report...
            </p>
          ) : categoryReport.length === 0 ? (
            <p className="text-gray-500">
              No expenses found for the selected period.
            </p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="border-b bg-gray-50 text-left">
                    <th className="p-3">
                      Category
                    </th>

                    <th className="p-3">
                      Total Expense
                    </th>
                  </tr>
                </thead>

                <tbody>
                  {categoryReport.map((item) => (
                    <tr
                      key={item.category}
                      className="border-b"
                    >
                      <td className="p-3 font-medium">
                        {item.category}
                      </td>

                      <td className="p-3 font-semibold text-red-600">
                        ₹{item.amount.toFixed(2)}
                      </td>
                    </tr>
                  ))}
                </tbody>

                <tfoot>
                  <tr className="bg-gray-50 font-bold">
                    <td className="p-3">
                      Total
                    </td>

                    <td className="p-3 text-red-600">
                      ₹{totalExpense.toFixed(2)}
                    </td>
                  </tr>
                </tfoot>
              </table>
            </div>
          )}
        </div>

        {/* HIGHEST EXPENSE */}
        <div className="mb-6 rounded-xl bg-white p-5 shadow">

          <h2 className="mb-4 text-xl font-bold">
            Highest Expense
          </h2>

          {highestExpense ? (
            <div className="rounded-lg border bg-gray-50 p-4">

              <div className="grid gap-3 md:grid-cols-4">

                <div>
                  <p className="text-sm text-gray-500">
                    Title
                  </p>

                  <p className="font-semibold">
                    {highestExpense.title}
                  </p>
                </div>

                <div>
                  <p className="text-sm text-gray-500">
                    Amount
                  </p>

                  <p className="font-semibold text-red-600">
                    ₹
                    {Number(
                      highestExpense.amount
                    ).toFixed(2)}
                  </p>
                </div>

                <div>
                  <p className="text-sm text-gray-500">
                    Category
                  </p>

                  <p className="font-semibold">
                    {highestExpense.category}
                  </p>
                </div>

                <div>
                  <p className="text-sm text-gray-500">
                    Date
                  </p>

                  <p className="font-semibold">
                    {new Date(
                      highestExpense.date
                    ).toLocaleDateString("en-IN")}
                  </p>
                </div>

              </div>
            </div>
          ) : (
            <p className="text-gray-500">
              No expenses available.
            </p>
          )}
        </div>

        {/* EXPENSE DETAILS */}
        <div className="rounded-xl bg-white p-5 shadow">

          <h2 className="mb-4 text-xl font-bold">
            Expense Details
          </h2>

          {loading ? (
            <p className="text-gray-500">
              Loading...
            </p>
          ) : filteredExpenses.length === 0 ? (
            <p className="text-gray-500">
              No expenses found.
            </p>
          ) : (
            <div className="overflow-x-auto">

              <table className="w-full border-collapse">

                <thead>
                  <tr className="border-b bg-gray-50 text-left">

                    <th className="p-3">
                      Title
                    </th>

                    <th className="p-3">
                      Amount
                    </th>

                    <th className="p-3">
                      Category
                    </th>

                    <th className="p-3">
                      Date
                    </th>

                  </tr>
                </thead>

                <tbody>

                  {filteredExpenses.map(
                    (expense) => (
                      <tr
                        key={expense.id}
                        className="border-b"
                      >

                        <td className="p-3">
                          {expense.title}
                        </td>

                        <td className="p-3 font-semibold text-red-600">
                          ₹
                          {Number(
                            expense.amount
                          ).toFixed(2)}
                        </td>

                        <td className="p-3">
                          {expense.category}
                        </td>

                        <td className="p-3">
                          {new Date(
                            expense.date
                          ).toLocaleDateString(
                            "en-IN"
                          )}
                        </td>

                      </tr>
                    )
                  )}

                </tbody>
              </table>

            </div>
          )}
        </div>

      </div>
    </main>
  );
}