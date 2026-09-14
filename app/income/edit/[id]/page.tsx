"use client";

import { FormEvent, useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";

export default function EditIncomePage() {
  const params = useParams();
  const router = useRouter();

  const id = params.id as string;

  const [source, setSource] = useState("");
  const [amount, setAmount] = useState("");
  const [date, setDate] = useState("");
  const [description, setDescription] = useState("");

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadIncome();
  }, [id]);

  async function loadIncome() {
    try {
      const response = await fetch(`/api/incomes/${id}`);
      const result = await response.json();

      if (!response.ok) {
        alert(result.error || "Income not found");
        router.push("/incomes");
        return;
      }

      setSource(result.source || "");
      setAmount(String(result.amount ?? ""));
      setDate(result.date || "");
      setDescription(result.description || "");
    } catch {
      alert("Unable to load income");
      router.push("/incomes");
    } finally {
      setLoading(false);
    }
  }

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();

    if (!source.trim()) {
      alert("Please enter income source");
      return;
    }

    if (!amount || Number(amount) < 0) {
      alert("Please enter a valid amount");
      return;
    }

    if (!date) {
      alert("Please select a date");
      return;
    }

    setSaving(true);

    try {
      const response = await fetch(`/api/incomes/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          source: source.trim(),
          amount: Number(amount),
          date,
          description: description.trim(),
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        alert(result.error || "Failed to update income");
        return;
      }

      alert("Income updated successfully!");

      router.push("/incomes");
      router.refresh();
    } catch {
      alert("Unable to connect to server");
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-slate-950 text-white">
        <p className="text-sm text-slate-400">
          Loading income...
        </p>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-slate-950 px-4 py-10 text-white sm:px-6">
      <div className="mx-auto max-w-2xl">

        <div className="mb-8">
          <h1 className="text-3xl font-bold">
            Edit Income
          </h1>

          <p className="mt-2 text-sm text-slate-400">
            Update your income details
          </p>
        </div>

        <form
          onSubmit={handleSubmit}
          className="space-y-5 rounded-2xl border border-white/10 bg-white/[0.04] p-6 shadow-xl"
        >

          {/* Source */}
          <div>
            <label className="mb-2 block text-sm font-medium text-slate-300">
              Source
            </label>

            <input
              type="text"
              value={source}
              onChange={(e) => setSource(e.target.value)}
              placeholder="Eg: Salary, Freelance"
              className="w-full rounded-xl border border-white/10 bg-slate-900 px-4 py-3 text-sm text-white outline-none placeholder:text-slate-500 focus:border-green-500"
            />
          </div>

          {/* Amount */}
          <div>
            <label className="mb-2 block text-sm font-medium text-slate-300">
              Amount
            </label>

            <input
              type="number"
              min="0"
              step="0.01"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="Enter amount"
              className="w-full rounded-xl border border-white/10 bg-slate-900 px-4 py-3 text-sm text-white outline-none placeholder:text-slate-500 focus:border-green-500"
            />
          </div>

          {/* Date */}
          <div>
            <label className="mb-2 block text-sm font-medium text-slate-300">
              Date
            </label>

            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="w-full rounded-xl border border-white/10 bg-slate-900 px-4 py-3 text-sm text-white outline-none focus:border-green-500"
            />
          </div>

          {/* Description */}
          <div>
            <label className="mb-2 block text-sm font-medium text-slate-300">
              Description
            </label>

            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Enter description"
              rows={4}
              className="w-full resize-none rounded-xl border border-white/10 bg-slate-900 px-4 py-3 text-sm text-white outline-none placeholder:text-slate-500 focus:border-green-500"
            />
          </div>

          {/* Buttons */}
          <div className="flex gap-3 pt-3">

            <button
              type="button"
              onClick={() => router.push("/incomes")}
              className="flex-1 rounded-xl border border-white/10 px-5 py-3 text-sm font-semibold text-slate-300 transition hover:bg-white/5"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={saving}
              className="flex-1 rounded-xl bg-green-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-green-500 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {saving ? "Updating..." : "Update Income"}
            </button>

          </div>
        </form>
      </div>
    </main>
  );
}