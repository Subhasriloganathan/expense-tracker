import OpenAI from "openai";
import { NextResponse } from "next/server";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(request: Request) {
  try {
    const { expenses, income } = await request.json();

    const response = await openai.responses.create({
      model: "gpt-5.6-luna",
      instructions:
        "You are a personal finance assistant. Analyze the user's spending data and give short, practical, easy-to-understand financial advice. Do not invent data.",
      input: `
Income: ₹${income}

Expenses:
${JSON.stringify(expenses)}

Give:
1. Main spending pattern
2. Highest spending category
3. One practical saving suggestion
4. One warning if spending is too high

Keep the answer concise and friendly.
`,
    });

    return NextResponse.json({
      advice: response.output_text,
    });
  } catch (error) {
    console.error("AI Advisor Error:", error);

    return NextResponse.json(
      {
        error: "Failed to generate AI advice.",
      },
      { status: 500 }
    );
  }
}