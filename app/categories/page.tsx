"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";

export default function CategoriesPage() {
  const [category, setCategory] = useState("");
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const loadCategories = async () => {
    const supabase = createClient();

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      setLoading(false);
      return;
    }

    const { data, error } = await supabase
      .from("categories")
      .select("*")
      .eq("user_id", user.id)
      .order("name");

    if (error) {
      console.error("Category loading error:", error);
    } else {
      setCategories(data || []);
    }

    setLoading(false);
  };

  useEffect(() => {
    loadCategories();
  }, []);

  const addCategory = async () => {
    if (category.trim() === "") {
      alert("Please enter a category");
      return;
    }

    const supabase = createClient();

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      alert("Please login first.");
      return;
    }

    const { error } = await supabase
      .from("categories")
      .insert({
        name: category.trim(),
        user_id: user.id,
      });

    if (error) {
      if (error.code === "23505") {
        alert("This category already exists.");
      } else {
        alert("Failed to add category: " + error.message);
      }

      return;
    }

    alert("Category added successfully!");

    setCategory("");
    loadCategories();
  };

  const deleteCategory = async (id: number) => {
    const confirmDelete = confirm(
      "Are you sure you want to delete this category?"
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
      .from("categories")
      .delete()
      .eq("id", id)
      .eq("user_id", user.id);

    if (error) {
      alert("Failed to delete category: " + error.message);
      return;
    }

    alert("Category deleted successfully!");

    loadCategories();
  };

  return (
    <main className="min-h-screen bg-[#020617] px-4 py-8 text-white sm:px-6 lg:px-8">
      {/* Background Glow */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute -left-32 -top-32 h-72 w-72 rounded-full bg-blue-600/10 blur-3xl" />
        <div className="absolute -bottom-32 -right-32 h-72 w-72 rounded-full bg-cyan-500/10 blur-3xl" />
      </div>

      <div className="relative mx-auto max-w-3xl">
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
                  d="M7 7h.01M3 11l8.586-8.586a2 2 0 012.828 0L21 9a2 2 0 010 2.828L12.414 20.414a2 2 0 01-2.828 0L3 13.828A2 2 0 013 11z"
                />
              </svg>
            </div>

            <div>
              <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
                Categories
              </h1>

              <p className="mt-1 text-sm text-slate-400">
                Manage your expense categories
              </p>
            </div>
          </div>
        </div>

        {/* Add Category Card */}
        <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-5 shadow-2xl shadow-black/20 backdrop-blur-xl sm:p-6">
          <div className="mb-4">
            <h2 className="text-lg font-semibold text-white">
              Add New Category
            </h2>

            <p className="mt-1 text-sm text-slate-400">
              Create a category to organize your expenses.
            </p>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row">
            <input
              type="text"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  addCategory();
                }
              }}
              placeholder="Enter category name"
              className="flex-1 rounded-xl border border-white/10 bg-slate-900/70 px-4 py-3 text-sm text-white outline-none transition placeholder:text-slate-500 focus:border-blue-500/50 focus:ring-2 focus:ring-blue-500/10"
            />

            <button
              onClick={addCategory}
              className="rounded-xl bg-gradient-to-r from-blue-600 to-cyan-500 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-blue-500/20 transition hover:scale-[1.02] hover:shadow-blue-500/30 active:scale-[0.98]"
            >
              + Add Category
            </button>
          </div>
        </div>

        {/* Category List */}
        <div className="mt-8">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-lg font-semibold text-white">
              Your Categories
            </h2>

            <span className="rounded-full border border-blue-400/20 bg-blue-500/10 px-3 py-1 text-xs font-medium text-blue-300">
              {categories.length}{" "}
              {categories.length === 1 ? "Category" : "Categories"}
            </span>
          </div>

          {loading ? (
            <div className="flex min-h-40 items-center justify-center rounded-2xl border border-white/10 bg-white/[0.04] backdrop-blur-xl">
              <div className="flex items-center gap-3 text-sm text-slate-400">
                <div className="h-5 w-5 animate-spin rounded-full border-2 border-slate-600 border-t-blue-400" />
                Loading categories...
              </div>
            </div>
          ) : categories.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-white/10 bg-white/[0.03] p-10 text-center">
              <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-800/70">
                <svg
                  className="h-7 w-7 text-slate-500"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M7 7h.01M3 11l8.586-8.586a2 2 0 012.828 0L21 9a2 2 0 010 2.828L12.414 20.414a2 2 0 01-2.828 0L3 13.828A2 2 0 013 11z"
                  />
                </svg>
              </div>

              <h3 className="font-semibold text-slate-300">
                No categories yet
              </h3>

              <p className="mt-1 text-sm text-slate-500">
                Add your first expense category above.
              </p>
            </div>
          ) : (
            <div className="grid gap-3 sm:grid-cols-2">
              {categories.map((item) => (
                <div
                  key={item.id}
                  className="group flex items-center justify-between rounded-2xl border border-white/10 bg-white/[0.04] p-4 backdrop-blur-xl transition hover:border-blue-400/20 hover:bg-white/[0.06]"
                >
                  <div className="flex min-w-0 items-center gap-3">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-500/10 text-blue-400">
                      <svg
                        className="h-5 w-5"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M7 7h.01M3 11l8.586-8.586a2 2 0 012.828 0L21 9a2 2 0 010 2.828L12.414 20.414a2 2 0 01-2.828 0L3 13.828A2 2 0 013 11z"
                        />
                      </svg>
                    </div>

                    <span className="truncate text-sm font-medium text-slate-200">
                      {item.name}
                    </span>
                  </div>

                  <button
                    onClick={() => deleteCategory(item.id)}
                    className="ml-3 rounded-lg border border-red-500/20 bg-red-500/10 px-3 py-2 text-xs font-medium text-red-400 transition hover:border-red-500/30 hover:bg-red-500/20 hover:text-red-300"
                  >
                    Delete
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </main>
  );
}