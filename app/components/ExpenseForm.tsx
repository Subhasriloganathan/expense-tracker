"use client";

import { FormEvent, useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";

export default function ExpenseForm() {
  const [title, setTitle] = useState("");
  const [amount, setAmount] = useState("");
  const [category, setCategory] = useState("");
  const [categories, setCategories] = useState<any[]>([]);
  const [date, setDate] = useState("");
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(false);
  const [loadingCategories, setLoadingCategories] = useState(true);

  useEffect(() => {
    const loadCategories = async () => {
      const supabase = createClient();

      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        setLoadingCategories(false);
        return;
      }

      const { data, error } = await supabase
        .from("categories")
        .select("id, name")
        .eq("user_id", user.id)
        .order("name");

      if (error) {
        console.error("Category loading error:", error);
      } else {
        setCategories(data || []);

        if (data && data.length > 0) {
          setCategory(data[0].name);
        }
      }

      setLoadingCategories(false);
    };

    loadCategories();
  }, []);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    if (!category) {
      alert("Please add/select a category first.");
      return;
    }

    setLoading(true);

    const supabase = createClient();

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      alert("Please login first.");
      setLoading(false);
      return;
    }

    const { error } = await supabase.from("expenses").insert({
      title: title.trim(),
      amount: Number(amount),
      category,
      date,
      description: description.trim(),
      user_id: user.id,
    });

    if (error) {
      alert("Failed to add expense: " + error.message);
    } else {
      alert("Expense saved to database successfully!");

      setTitle("");
      setAmount("");
      setDate("");
      setDescription("");
    }

    setLoading(false);
  };

  return (
    <main className="min-h-screen bg-[#020617] px-4 py-8 text-white sm:px-6 lg:px-8">
      {/* Background Glow */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute -left-32 -top-32 h-72 w-72 rounded-full bg-blue-600/10 blur-3xl" />
        <div className="absolute -bottom-32 -right-32 h-72 w-72 rounded-full bg-cyan-500/10 blur-3xl" />
      </div>

      <div className="relative mx-auto max-w-2xl">
        {/* Header */}
        <div className="mb-8">
          <div className="mb-3 flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl border border-blue-400/20 bg-blue-500/10">
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
                  d="M12 6v12m6-6H6"
                />
              </svg>
            </div>

            <div>
              <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
                Add Expense
              </h1>

              <p className="mt-1 text-sm text-slate-400">
                Record a new expense and keep your finances organized.
              </p>
            </div>
          </div>
        </div>

        {/* Form Card */}
        <form
          onSubmit={handleSubmit}
          className="rounded-2xl border border-white/10 bg-white/[0.04] p-5 shadow-2xl shadow-black/20 backdrop-blur-xl sm:p-7"
        >
          {/* Title */}
          <div className="mb-5">
            <label className="mb-2 block text-sm font-medium text-slate-300">
              Expense Title
            </label>

            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Example: Grocery shopping"
              required
              className="w-full rounded-xl border border-white/10 bg-slate-900/70 px-4 py-3 text-sm text-white outline-none transition placeholder:text-slate-500 focus:border-blue-500/50 focus:ring-2 focus:ring-blue-500/10"
            />
          </div>

          {/* Amount */}
          <div className="mb-5">
            <label className="mb-2 block text-sm font-medium text-slate-300">
              Amount
            </label>

            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-sm font-medium text-slate-400">
                ₹
              </span>

              <input
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="Enter amount"
                min="0"
                required
                className="w-full rounded-xl border border-white/10 bg-slate-900/70 py-3 pl-9 pr-4 text-sm text-white outline-none transition placeholder:text-slate-500 focus:border-blue-500/50 focus:ring-2 focus:ring-blue-500/10"
              />
            </div>
          </div>

          {/* Category */}
          <div className="mb-5">
            <label className="mb-2 block text-sm font-medium text-slate-300">
              Category
            </label>

            {loadingCategories ? (
              <div className="flex items-center gap-3 rounded-xl border border-white/10 bg-slate-900/70 px-4 py-3 text-sm text-slate-400">
                <div className="h-4 w-4 animate-spin rounded-full border-2 border-slate-600 border-t-blue-400" />
                Loading categories...
              </div>
            ) : categories.length === 0 ? (
              <div className="rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-400">
                No categories found. Please add a category first.
              </div>
            ) : (
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full rounded-xl border border-white/10 bg-slate-900/70 px-4 py-3 text-sm text-white outline-none transition focus:border-blue-500/50 focus:ring-2 focus:ring-blue-500/10"
                required
              >
                {categories.map((item) => (
                  <option
                    key={item.id}
                    value={item.name}
                    className="bg-slate-900 text-white"
                  >
                    {item.name}
                  </option>
                ))}
              </select>
            )}
          </div>

          {/* Date */}
          <div className="mb-5">
            <label className="mb-2 block text-sm font-medium text-slate-300">
              Date
            </label>

            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              required
              className="w-full rounded-xl border border-white/10 bg-slate-900/70 px-4 py-3 text-sm text-white outline-none transition focus:border-blue-500/50 focus:ring-2 focus:ring-blue-500/10"
            />
          </div>

          {/* Description */}
          <div className="mb-6">
            <label className="mb-2 block text-sm font-medium text-slate-300">
              Description
            </label>

            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Add a short description..."
              rows={4}
              className="w-full resize-none rounded-xl border border-white/10 bg-slate-900/70 px-4 py-3 text-sm text-white outline-none transition placeholder:text-slate-500 focus:border-blue-500/50 focus:ring-2 focus:ring-blue-500/10"
            />
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={
              loading ||
              loadingCategories ||
              categories.length === 0
            }
            className="w-full rounded-xl bg-gradient-to-r from-blue-600 to-cyan-500 px-4 py-3.5 text-sm font-semibold text-white shadow-lg shadow-blue-500/20 transition hover:scale-[1.01] hover:shadow-blue-500/30 active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-50"
          >
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                Saving Expense...
              </span>
            ) : (
              "Add Expense"
            )}
          </button>
        </form>
      </div>
    </main>
  );
}