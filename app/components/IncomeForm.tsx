"use client";

import { FormEvent, useState } from "react";
import { createClient } from "@/lib/supabase/client";

export default function IncomeForm() {
  const [source, setSource] = useState("");
  const [amount, setAmount] = useState("");
  const [date, setDate] = useState("");
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

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

    const { error } = await supabase.from("incomes").insert({
      source,
      amount: Number(amount),
      date,
      description,
      user_id: user.id,
    });

    if (error) {
      alert("Failed to add income: " + error.message);
    } else {
      alert("Income saved to database successfully!");

      setSource("");
      setAmount("");
      setDate("");
      setDescription("");
    }

    setLoading(false);
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="max-w-lg space-y-5 rounded-xl bg-white p-6 shadow"
    >
      <h2 className="text-2xl font-bold">Add Income</h2>

      <div>
        <label className="mb-1 block font-medium">Source</label>
        <input
          type="text"
          value={source}
          onChange={(e) => setSource(e.target.value)}
          placeholder="Eg: Salary, Freelance"
          required
          className="w-full rounded-lg border p-3"
        />
      </div>

      <div>
        <label className="mb-1 block font-medium">Amount</label>
        <input
          type="number"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          placeholder="Enter amount"
          required
          min="0"
          className="w-full rounded-lg border p-3"
        />
      </div>

      <div>
        <label className="mb-1 block font-medium">Date</label>
        <input
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
          required
          className="w-full rounded-lg border p-3"
        />
      </div>

      <div>
        <label className="mb-1 block font-medium">Description</label>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Enter description"
          rows={3}
          className="w-full rounded-lg border p-3"
        />
      </div>

      <button
        type="submit"
        disabled={loading}
        className="w-full rounded-lg bg-green-600 px-4 py-3 font-medium text-white hover:bg-green-700 disabled:opacity-50"
      >
        {loading ? "Saving..." : "Add Income"}
      </button>
    </form>
  );
}