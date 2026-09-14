"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";

export default function TestPage() {
  const [message, setMessage] = useState("Testing connection...");

  useEffect(() => {
    const testConnection = async () => {
      try {
        const supabase = createClient();

        const { data, error } = await supabase
          .from("categories")
          .select("*");

        if (error) {
          setMessage("Connection failed: " + error.message);
          return;
        }

        setMessage(
          `Connected successfully! Categories found: ${data?.length ?? 0}`
        );
      } catch (error) {
        setMessage("Connection failed: " + String(error));
      }
    };

    testConnection();
  }, []);

  return (
    <main className="min-h-screen bg-gray-100 p-8">
      <div className="mx-auto max-w-lg rounded-xl bg-white p-6 shadow">
        <h1 className="text-2xl font-bold">
          Supabase Connection Test
        </h1>

        <p className="mt-4 text-gray-600">{message}</p>
      </div>
    </main>
  );
}