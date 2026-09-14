import Link from "next/link";

export default function Sidebar() {
  return (
    <aside className="min-h-screen w-64 border-r border-gray-200 bg-gray-950 p-5 text-white">

      {/* Logo */}
      <div className="mb-10 flex items-center gap-3">
        <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-600 text-xl shadow-lg">
          💰
        </div>

        <div>
          <h2 className="text-lg font-bold">
            Expense Tracker
          </h2>
          <p className="text-xs text-gray-400">
            Money Manager
          </p>
        </div>
      </div>

      {/* Menu */}
      <nav className="space-y-2">

        <Link
          href="/"
          className="group flex items-center gap-3 rounded-xl px-4 py-3 text-gray-300 transition-all hover:bg-blue-600 hover:text-white hover:shadow-md"
        >
          <span className="text-lg">🏠</span>
          <span className="font-medium">Dashboard</span>
        </Link>

        <Link
          href="/expenses"
          className="group flex items-center gap-3 rounded-xl px-4 py-3 text-gray-300 transition-all hover:bg-blue-600 hover:text-white hover:shadow-md"
        >
          <span className="text-lg">💸</span>
          <span className="font-medium">Expenses</span>
        </Link>

        <Link
          href="/income"
          className="group flex items-center gap-3 rounded-xl px-4 py-3 text-gray-300 transition-all hover:bg-green-600 hover:text-white hover:shadow-md"
        >
          <span className="text-lg">💵</span>
          <span className="font-medium">Income</span>
        </Link>

        <Link
          href="/categories"
          className="group flex items-center gap-3 rounded-xl px-4 py-3 text-gray-300 transition-all hover:bg-purple-600 hover:text-white hover:shadow-md"
        >
          <span className="text-lg">🏷️</span>
          <span className="font-medium">Categories</span>
        </Link>

        <Link
          href="/reports"
          className="group flex items-center gap-3 rounded-xl px-4 py-3 text-gray-300 transition-all hover:bg-orange-600 hover:text-white hover:shadow-md"
        >
          <span className="text-lg">📄</span>
          <span className="font-medium">Reports</span>
        </Link>

        <Link
          href="/analytics"
          className="group flex items-center gap-3 rounded-xl px-4 py-3 text-gray-300 transition-all hover:bg-cyan-600 hover:text-white hover:shadow-md"
        >
          <span className="text-lg">📊</span>
          <span className="font-medium">Analytics</span>
        </Link>

      </nav>

      {/* Bottom Section */}
      <div className="mt-10 border-t border-gray-800 pt-6">
        <div className="rounded-xl bg-gray-900 p-4">
          <p className="text-sm font-semibold text-white">
            💡 Money Tip
          </p>

          <p className="mt-2 text-xs leading-5 text-gray-400">
            Track your expenses regularly to understand your spending habits.
          </p>
        </div>
      </div>

    </aside>
  );
}