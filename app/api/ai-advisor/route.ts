import OpenAI from "openai";
import { NextResponse } from "next/server";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(request: Request) {
  try {
    const { expenses, income } = await request.json();

    // Basic values
    const totalIncome = Number(income) || 0;

    const expenseList = Array.isArray(expenses) ? expenses : [];

    const totalExpenses = expenseList.reduce(
      (sum: number, expense: any) =>
        sum + (Number(expense.amount) || 0),
      0
    );

    // Category totals
    const categoryTotals: Record<string, number> = {};

    expenseList.forEach((expense: any) => {
      const category = expense.category || "Other";
      const amount = Number(expense.amount) || 0;

      categoryTotals[category] =
        (categoryTotals[category] || 0) + amount;
    });

    const categories = Object.entries(categoryTotals).sort(
      (a, b) => b[1] - a[1]
    );

    const highestCategory =
      categories.length > 0 ? categories[0][0] : "No expenses";

    const highestAmount =
      categories.length > 0 ? categories[0][1] : 0;

    const balance = totalIncome - totalExpenses;

    // ------------------------------------------------
    // Try OpenAI
    // ------------------------------------------------
    try {
      if (process.env.OPENAI_API_KEY) {
        const response = await openai.responses.create({
          model: "gpt-5.6-luna",
          instructions:
            "You are a personal finance assistant. Analyze the user's spending data and give short, practical, easy-to-understand financial advice. Do not invent data.",
          input: `
Income: ₹${totalIncome}

Total Expenses: ₹${totalExpenses}

Expenses:
${JSON.stringify(expenseList)}

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
          source: "AI",
        });
      }
    } catch (aiError: any) {
      console.error("OpenAI unavailable:", aiError?.message);
    }

    // ------------------------------------------------
    // Fallback advice
    // ------------------------------------------------

    let pattern = "Your spending is currently under control.";

    if (totalIncome > 0 && totalExpenses > totalIncome) {
      pattern =
        "Your expenses are higher than your income. Try reducing unnecessary spending.";
    } else if (totalIncome > 0 && totalExpenses > totalIncome * 0.7) {
      pattern =
        "A large portion of your income is being used for expenses. Consider increasing your savings.";
    } else if (totalExpenses > 0) {
      pattern =
        "Your spending is within your available income. Continue tracking your expenses regularly.";
    }

    const savingSuggestion =
      totalExpenses > 0
        ? `Try reducing spending in ${highestCategory} and set a small monthly saving target.`
        : "Start tracking your daily expenses and set a monthly saving target.";

    const warning =
      totalIncome > 0 && totalExpenses > totalIncome
        ? "Warning: Your expenses are currently higher than your income."
        : totalIncome > 0 && totalExpenses > totalIncome * 0.7
        ? "Warning: Your expenses are using more than 70% of your income."
        : "Your current spending level does not show a major warning.";

    const fallbackAdvice = `
1. Main spending pattern:
${pattern}

2. Highest spending category:
${highestCategory} — ₹${highestAmount.toFixed(2)}

3. Saving suggestion:
${savingSuggestion}

4. Warning:
${warning}
`;

    return NextResponse.json({
      advice: fallbackAdvice.trim(),
      source: "Fallback",
    });
  } catch (error: any) {
    console.error("AI Advisor Error:", error);

    return NextResponse.json(
      {
        error: "Unable to generate financial advice.",
      },
      { status: 500 }
    );
  }
}