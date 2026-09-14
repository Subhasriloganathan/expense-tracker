import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json(
      { error: "Unauthorized" },
      { status: 401 }
    );
  }

  const { data, error } = await supabase
    .from("incomes")
    .select("*")
    .eq("user_id", user.id)
    .order("date", { ascending: false });

  if (error) {
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }

  return NextResponse.json(data);
}

export async function POST(request: Request) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json(
      { error: "Unauthorized" },
      { status: 401 }
    );
  }

  const body = await request.json();

  const {
    source,
    amount,
    date,
    description,
  } = body;

  if (!source || amount === undefined || !date) {
    return NextResponse.json(
      { error: "Source, amount and date are required" },
      { status: 400 }
    );
  }

  if (Number(amount) < 0) {
    return NextResponse.json(
      { error: "Amount cannot be negative" },
      { status: 400 }
    );
  }

  const { data, error } = await supabase
    .from("incomes")
    .insert({
      source: source.trim(),
      amount: Number(amount),
      date,
      description: description?.trim() || "",
      user_id: user.id,
    })
    .select()
    .single();

  if (error) {
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }

  return NextResponse.json(data, { status: 201 });
}