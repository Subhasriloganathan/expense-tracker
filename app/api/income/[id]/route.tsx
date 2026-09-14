import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

type Params = {
  params: Promise<{ id: string }>;
};

// GET ONE INCOME
export async function GET(
  request: Request,
  { params }: Params
) {
  const supabase = await createClient();
  const { id } = await params;

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
    .eq("id", id)
    .eq("user_id", user.id)
    .single();

  if (error || !data) {
    return NextResponse.json(
      { error: "Income not found" },
      { status: 404 }
    );
  }

  return NextResponse.json(data);
}

// UPDATE INCOME
export async function PUT(
  request: Request,
  { params }: Params
) {
  const supabase = await createClient();
  const { id } = await params;

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
    .update({
      source: source.trim(),
      amount: Number(amount),
      date,
      description: description?.trim() || "",
    })
    .eq("id", id)
    .eq("user_id", user.id)
    .select()
    .single();

  if (error || !data) {
    return NextResponse.json(
      { error: error?.message || "Income not found" },
      { status: 404 }
    );
  }

  return NextResponse.json(data);
}

// DELETE INCOME
export async function DELETE(
  request: Request,
  { params }: Params
) {
  const supabase = await createClient();
  const { id } = await params;

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json(
      { error: "Unauthorized" },
      { status: 401 }
    );
  }

  const { error } = await supabase
    .from("incomes")
    .delete()
    .eq("id", id)
    .eq("user_id", user.id);

  if (error) {
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }

  return NextResponse.json({
    message: "Income deleted successfully",
  });
}