import ExpenseForm from "@/app/components/ExpenseForm";

export default function AddExpensePage() {
  return (
    <main className="min-h-screen bg-gray-100 p-8">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-800">
          Add Expense
        </h1>

        <p className="mt-2 text-gray-500">
          Add a new expense to your tracker.
        </p>
      </div>

      <ExpenseForm />
    </main>
  );
}