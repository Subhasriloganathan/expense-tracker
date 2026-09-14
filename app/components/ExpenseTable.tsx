"use client";

import { Expense } from "@/types/expense";
import { createClient } from "@/lib/supabase/client";
import Link from "next/link";

interface ExpenseTableProps {
  expenses: Expense[];
}

export default function ExpenseTable({
  expenses: initialExpenses,
}: ExpenseTableProps) {
  const handleDelete = async (id: number) => {
    const confirmDelete = confirm(
      "Are you sure you want to delete this expense?"
    );

    if (!confirmDelete) return;

    const supabase = createClient();

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      alert("Please login first.");
      return;
    }

    const { error } = await supabase
      .from("expenses")
      .delete()
      .eq("id", id)
      .eq("user_id", user.id);

    if (error) {
      alert("Failed to delete expense: " + error.message);
      return;
    }

    alert("Expense deleted successfully!");

    window.location.reload();
  };

  return (
    <div className="w-full overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-lg">
      
      {/* Header */}
      <div className="flex flex-col gap-2 border-b border-gray-200 px-6 py-5 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-xl font-bold text-gray-800">
            Expense History
          </h2>
          <p className="text-sm text-gray-500">
            View and manage your expenses
          </p>
        </div>

        <div className="rounded-lg bg-blue-50 px-4 py-2 text-sm font-semibold text-blue-600">
          {initialExpenses.length}{" "}
          {initialExpenses.length === 1 ? "Expense" : "Expenses"}
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full min-w-[750px] text-left">
          <thead className="bg-gray-50">
            <tr className="text-sm uppercase tracking-wide text-gray-500">
              <th className="px-6 py-4 font-semibold">
                Title
              </th>

              <th className="px-6 py-4 font-semibold">
                Amount
              </th>

              <th className="px-6 py-4 font-semibold">
                Category
              </th>

              <th className="px-6 py-4 font-semibold">
                Date
              </th>

              <th className="px-6 py-4 text-center font-semibold">
                Actions
              </th>
            </tr>
          </thead>

          <tbody>
            {initialExpenses.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-6 py-16 text-center">
                  <div className="flex flex-col items-center">
                    <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-gray-100 text-3xl">
                      💸
                    </div>

                    <h3 className="text-lg font-semibold text-gray-700">
                      No expenses found
                    </h3>

                    <p className="mt-1 text-sm text-gray-500">
                      Your expenses will appear here.
                    </p>
                  </div>
                </td>
              </tr>
            ) : (
              initialExpenses.map((expense) => (
                <tr
                  key={expense.id}
                  className="border-t border-gray-100 transition hover:bg-blue-50/40"
                >
                  {/* Title */}
                  <td className="px-6 py-4">
                    <div className="font-semibold text-gray-800">
                      {expense.title}
                    </div>
                  </td>

                  {/* Amount */}
                  <td className="px-6 py-4">
                    <span className="font-bold text-gray-800">
                      ₹
                      {Number(expense.amount).toLocaleString(
                        "en-IN"
                      )}
                    </span>
                  </td>

                  {/* Category */}
                  <td className="px-6 py-4">
                    <span className="inline-flex rounded-full bg-blue-100 px-3 py-1 text-xs font-semibold text-blue-700">
                      {expense.category}
                    </span>
                  </td>

                  {/* Date */}
                  <td className="px-6 py-4 text-sm text-gray-600">
                    {expense.date}
                  </td>

                  {/* Actions */}
                  <td className="px-6 py-4">
                    <div className="flex justify-center gap-2">
                      <Link
                        href={`/expenses/edit/${expense.id}`}
                        className="rounded-lg bg-blue-500 px-4 py-2 text-sm font-medium text-white shadow-sm transition hover:bg-blue-600 hover:shadow-md"
                      >
                        Edit
                      </Link>

                      <button
                        onClick={() =>
                          handleDelete(expense.id)
                        }
                        className="rounded-lg bg-red-500 px-4 py-2 text-sm font-medium text-white shadow-sm transition hover:bg-red-600 hover:shadow-md"
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}