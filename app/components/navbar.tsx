export default function Navbar() {
  return (
    <nav className="sticky top-0 z-50 border-b border-gray-200 bg-white/95 shadow-sm backdrop-blur">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">

        {/* Logo / Brand */}
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-600 text-xl shadow-md">
            💰
          </div>

          <div>
            <h1 className="text-lg font-bold tracking-tight text-gray-900 sm:text-xl">
              Expense Tracker
            </h1>

            <p className="hidden text-xs text-gray-500 sm:block">
              Smart way to manage your money
            </p>
          </div>
        </div>

        {/* Right Side */}
        <div className="flex items-center gap-3">
          <div className="hidden rounded-full bg-blue-50 px-4 py-2 text-sm font-medium text-blue-600 sm:block">
            Manage your money 💳
          </div>

          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gray-100 text-lg">
            👤
          </div>
        </div>

      </div>
    </nav>
  );
}