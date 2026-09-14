"use client";

import { createClient } from "@/lib/supabase/client";
import * as XLSX from "xlsx";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import JSZip from "jszip";

type Expense = {
  id: number;
  title: string;
  amount: number;
  category: string;
  date: string;
  description?: string | null;
  created_at?: string | null;
  updated_at?: string | null;
};

type Income = {
  id: number;
  source: string;
  amount: number;
  date: string;
  description?: string | null;
  created_at?: string | null;
  updated_at?: string | null;
};

type Category = {
  id: number;
  name: string;
  created_at?: string | null;
  updated_at?: string | null;
};

const formatDateTime = (value?: string | null) => {
  if (!value) return "-";

  return new Date(value).toLocaleString("en-IN", {
    dateStyle: "medium",
    timeStyle: "short",
  });
};

const formatDate = (value?: string | null) => {
  if (!value) return "-";

  return new Date(value).toLocaleDateString("en-IN");
};

export default function DownloadReportsPage() {
  const supabase = createClient();

  // =========================
  // GET DATA
  // =========================

  const getReportData = async () => {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      throw new Error("User not logged in");
    }

    const { data: expenses, error: expenseError } = await supabase
      .from("expenses")
      .select(
        "id, title, amount, category, date, description, created_at, updated_at"
      )
      .eq("user_id", user.id)
      .order("date", { ascending: false });

    if (expenseError) throw expenseError;

    const { data: incomes, error: incomeError } = await supabase
      .from("incomes")
      .select(
        "id, source, amount, date, description, created_at, updated_at"
      )
      .eq("user_id", user.id)
      .order("date", { ascending: false });

    if (incomeError) throw incomeError;

    const { data: categories, error: categoryError } = await supabase
      .from("categories")
      .select("id, name, created_at, updated_at")
      .eq("user_id", user.id)
      .order("name", { ascending: true });

    if (categoryError) throw categoryError;

    return {
      user,
      expenses: (expenses || []) as Expense[],
      incomes: (incomes || []) as Income[],
      categories: (categories || []) as Category[],
    };
  };

  // =========================
  // CREATE EXCEL FILE
  // =========================

  const createExcelFile = async () => {
    const { user, expenses, incomes, categories } =
      await getReportData();

    const totalIncome = incomes.reduce(
      (sum, item) => sum + Number(item.amount),
      0
    );

    const totalExpense = expenses.reduce(
      (sum, item) => sum + Number(item.amount),
      0
    );

    const balance = totalIncome - totalExpense;

    // Category Analysis
    const categoryMap: Record<string, number> = {};

    expenses.forEach((expense) => {
      categoryMap[expense.category] =
        (categoryMap[expense.category] || 0) +
        Number(expense.amount);
    });

    const categoryAnalysis = Object.entries(categoryMap)
      .map(([category, amount]) => ({
        Category: category,
        "Total Expense": amount,
      }))
      .sort((a, b) => b["Total Expense"] - a["Total Expense"]);

    // Monthly Analysis
    const monthlyMap: Record<
      string,
      { income: number; expense: number }
    > = {};

    incomes.forEach((income) => {
      const month = income.date.substring(0, 7);

      if (!monthlyMap[month]) {
        monthlyMap[month] = {
          income: 0,
          expense: 0,
        };
      }

      monthlyMap[month].income += Number(income.amount);
    });

    expenses.forEach((expense) => {
      const month = expense.date.substring(0, 7);

      if (!monthlyMap[month]) {
        monthlyMap[month] = {
          income: 0,
          expense: 0,
        };
      }

      monthlyMap[month].expense += Number(expense.amount);
    });

    const monthlyAnalysis = Object.entries(monthlyMap)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([month, values]) => ({
        Month: month,
        Income: values.income,
        Expense: values.expense,
        Balance: values.income - values.expense,
      }));

    const highestExpense =
      expenses.length > 0
        ? expenses.reduce((max, item) =>
            Number(item.amount) > Number(max.amount)
              ? item
              : max
          )
        : null;

    const highestCategory =
      categoryAnalysis.length > 0
        ? categoryAnalysis[0]
        : null;

    // Dashboard
    const dashboardData = [
      ["EXPENSE TRACKER REPORT"],
      [],
      ["User Email", user.email || "-"],
      [
        "Generated At",
        formatDateTime(new Date().toISOString()),
      ],
      [],
      ["FINANCIAL SUMMARY"],
      ["Total Income", totalIncome],
      ["Total Expense", totalExpense],
      ["Balance", balance],
      ["Total Expenses", expenses.length],
      ["Total Income Records", incomes.length],
      ["Total Categories", categories.length],
      [],
      ["HIGHEST EXPENSE"],
      ["Title", highestExpense?.title || "-"],
      [
        "Amount",
        highestExpense
          ? Number(highestExpense.amount)
          : 0,
      ],
      ["Category", highestExpense?.category || "-"],
      [
        "Date",
        highestExpense
          ? formatDate(highestExpense.date)
          : "-",
      ],
    ];

    // Income
    const incomeData = incomes.map((item) => ({
      ID: item.id,
      Source: item.source,
      Amount: Number(item.amount),
      Date: formatDate(item.date),
      Description: item.description || "",
      "Added Date & Time": formatDateTime(item.created_at),
      "Last Updated Date & Time": formatDateTime(
        item.updated_at
      ),
    }));

    // Expenses
    const expenseData = expenses.map((item) => ({
      ID: item.id,
      Title: item.title,
      Amount: Number(item.amount),
      Category: item.category,
      Date: formatDate(item.date),
      Description: item.description || "",
      "Added Date & Time": formatDateTime(item.created_at),
      "Last Updated Date & Time": formatDateTime(
        item.updated_at
      ),
    }));

    // Insights
    const insightsData = [
      ["SPENDING INSIGHTS"],
      [],
      [
        "Highest Spending Category",
        highestCategory?.Category || "-",
      ],
      [
        "Highest Category Amount",
        highestCategory?.["Total Expense"] || 0,
      ],
      [
        "Highest Individual Expense",
        highestExpense?.title || "-",
      ],
      [
        "Highest Individual Expense Amount",
        highestExpense
          ? Number(highestExpense.amount)
          : 0,
      ],
      [],
      [
        "Financial Status",
        balance >= 0
          ? "Income is higher than expenses."
          : "Expenses are higher than income.",
      ],
      [],
      [
        "Suggestion",
        "Review your highest spending category and reduce unnecessary expenses.",
      ],
    ];

    // Categories
    const categoryData = categories.map((item) => ({
      ID: item.id,
      Category: item.name,
      "Added Date & Time": formatDateTime(item.created_at),
      "Last Updated Date & Time": formatDateTime(
        item.updated_at
      ),
    }));

    // Workbook
    const workbook = XLSX.utils.book_new();

    const dashboardSheet =
      XLSX.utils.aoa_to_sheet(dashboardData);

    const incomeSheet =
      XLSX.utils.json_to_sheet(incomeData);

    const expenseSheet =
      XLSX.utils.json_to_sheet(expenseData);

    const categoryAnalysisSheet =
      XLSX.utils.json_to_sheet(categoryAnalysis);

    const monthlySheet =
      XLSX.utils.json_to_sheet(monthlyAnalysis);

    const insightsSheet =
      XLSX.utils.aoa_to_sheet(insightsData);

    const categoriesSheet =
      XLSX.utils.json_to_sheet(categoryData);

    // Widths
    dashboardSheet["!cols"] = [
      { wch: 35 },
      { wch: 35 },
    ];

    incomeSheet["!cols"] = [
      { wch: 8 },
      { wch: 22 },
      { wch: 15 },
      { wch: 15 },
      { wch: 35 },
      { wch: 25 },
      { wch: 30 },
    ];

    expenseSheet["!cols"] = [
      { wch: 8 },
      { wch: 25 },
      { wch: 15 },
      { wch: 20 },
      { wch: 15 },
      { wch: 35 },
      { wch: 25 },
      { wch: 30 },
    ];

    categoryAnalysisSheet["!cols"] = [
      { wch: 25 },
      { wch: 20 },
    ];

    monthlySheet["!cols"] = [
      { wch: 15 },
      { wch: 18 },
      { wch: 18 },
      { wch: 18 },
    ];

    insightsSheet["!cols"] = [
      { wch: 35 },
      { wch: 70 },
    ];

    categoriesSheet["!cols"] = [
      { wch: 10 },
      { wch: 25 },
      { wch: 25 },
      { wch: 30 },
    ];

    // Add sheets
    XLSX.utils.book_append_sheet(
      workbook,
      dashboardSheet,
      "Dashboard"
    );

    XLSX.utils.book_append_sheet(
      workbook,
      incomeSheet,
      "Income Details"
    );

    XLSX.utils.book_append_sheet(
      workbook,
      expenseSheet,
      "Expense Details"
    );

    XLSX.utils.book_append_sheet(
      workbook,
      categoryAnalysisSheet,
      "Category Analysis"
    );

    XLSX.utils.book_append_sheet(
      workbook,
      monthlySheet,
      "Monthly Analysis"
    );

    XLSX.utils.book_append_sheet(
      workbook,
      insightsSheet,
      "Spending Insights"
    );

    XLSX.utils.book_append_sheet(
      workbook,
      categoriesSheet,
      "Categories"
    );

    return XLSX.write(workbook, {
      bookType: "xlsx",
      type: "array",
    });
  };

  // =========================
  // CREATE PDF FILE
  // =========================

  const createPDFFile = async () => {
    const { user, expenses, incomes, categories } =
      await getReportData();

    const totalIncome = incomes.reduce(
      (sum, item) => sum + Number(item.amount),
      0
    );

    const totalExpense = expenses.reduce(
      (sum, item) => sum + Number(item.amount),
      0
    );

    const balance = totalIncome - totalExpense;

    const categoryMap: Record<string, number> = {};

    expenses.forEach((expense) => {
      categoryMap[expense.category] =
        (categoryMap[expense.category] || 0) +
        Number(expense.amount);
    });

    const categoryAnalysis = Object.entries(categoryMap)
      .map(([category, amount]) => ({
        category,
        amount,
      }))
      .sort((a, b) => b.amount - a.amount);

    const highestExpense =
      expenses.length > 0
        ? expenses.reduce((max, item) =>
            Number(item.amount) > Number(max.amount)
              ? item
              : max
          )
        : null;

    const pdf = new jsPDF();

    // Title
    pdf.setFontSize(20);
    pdf.text("EXPENSE TRACKER REPORT", 14, 20);

    pdf.setFontSize(10);

    pdf.text(
      `User: ${user.email || "-"}`,
      14,
      28
    );

    pdf.text(
      `Generated: ${formatDateTime(
        new Date().toISOString()
      )}`,
      14,
      34
    );

    // Summary
    pdf.setFontSize(14);
    pdf.text("Financial Summary", 14, 45);

    autoTable(pdf, {
      startY: 50,
      head: [["Item", "Value"]],
      body: [
        ["Total Income", `Rs. ${totalIncome.toFixed(2)}`],
        ["Total Expense", `Rs. ${totalExpense.toFixed(2)}`],
        ["Balance", `Rs. ${balance.toFixed(2)}`],
        ["Expense Count", String(expenses.length)],
        ["Income Count", String(incomes.length)],
        ["Category Count", String(categories.length)],
      ],
    });

    // Category
    let currentY =
      (pdf as any).lastAutoTable?.finalY + 10 || 70;

    pdf.setFontSize(14);
    pdf.text("Category Analysis", 14, currentY);

    autoTable(pdf, {
      startY: currentY + 5,
      head: [["Category", "Total Expense"]],
      body:
        categoryAnalysis.length > 0
          ? categoryAnalysis.map((item) => [
              item.category,
              `Rs. ${item.amount.toFixed(2)}`,
            ])
          : [["No expenses", "Rs. 0.00"]],
    });

    // Highest Expense
    currentY =
      (pdf as any).lastAutoTable?.finalY + 10 || 100;

    pdf.setFontSize(14);
    pdf.text("Highest Expense", 14, currentY);

    autoTable(pdf, {
      startY: currentY + 5,
      head: [["Title", "Amount", "Category", "Date"]],
      body: highestExpense
        ? [
            [
              highestExpense.title,
              `Rs. ${Number(
                highestExpense.amount
              ).toFixed(2)}`,
              highestExpense.category,
              formatDate(highestExpense.date),
            ],
          ]
        : [["-", "Rs. 0.00", "-", "-"]],
    });

    // Expenses
    currentY =
      (pdf as any).lastAutoTable?.finalY + 10 || 130;

    pdf.setFontSize(14);
    pdf.text("Expense Details", 14, currentY);

    autoTable(pdf, {
      startY: currentY + 5,
      head: [
        [
          "Title",
          "Amount",
          "Category",
          "Date",
          "Added",
          "Updated",
        ],
      ],
      body:
        expenses.length > 0
          ? expenses.map((item) => [
              item.title,
              `Rs. ${Number(item.amount).toFixed(2)}`,
              item.category,
              formatDate(item.date),
              formatDateTime(item.created_at),
              formatDateTime(item.updated_at),
            ])
          : [["No expenses", "-", "-", "-", "-", "-"]],
      styles: {
        fontSize: 7,
      },
    });

    // Income
    currentY =
      (pdf as any).lastAutoTable?.finalY + 10 || 150;

    pdf.setFontSize(14);
    pdf.text("Income Details", 14, currentY);

    autoTable(pdf, {
      startY: currentY + 5,
      head: [
        [
          "Source",
          "Amount",
          "Date",
          "Added",
          "Updated",
        ],
      ],
      body:
        incomes.length > 0
          ? incomes.map((item) => [
              item.source,
              `Rs. ${Number(item.amount).toFixed(2)}`,
              formatDate(item.date),
              formatDateTime(item.created_at),
              formatDateTime(item.updated_at),
            ])
          : [["No income", "-", "-", "-", "-"]],
      styles: {
        fontSize: 7,
      },
    });

    // Categories
    currentY =
      (pdf as any).lastAutoTable?.finalY + 10 || 170;

    pdf.setFontSize(14);
    pdf.text("Category Details", 14, currentY);

    autoTable(pdf, {
      startY: currentY + 5,
      head: [
        [
          "ID",
          "Category",
          "Added",
          "Updated",
        ],
      ],
      body:
        categories.length > 0
          ? categories.map((item) => [
              String(item.id),
              item.name,
              formatDateTime(item.created_at),
              formatDateTime(item.updated_at),
            ])
          : [["-", "No categories", "-", "-"]],
      styles: {
        fontSize: 8,
      },
    });

    // Footer
    const pageCount = pdf.getNumberOfPages();

    for (let i = 1; i <= pageCount; i++) {
      pdf.setPage(i);

      pdf.setFontSize(8);

      pdf.text(
        `Expense Tracker | Page ${i} of ${pageCount}`,
        14,
        290
      );
    }

    return pdf.output("arraybuffer");
  };

  // =========================
  // DOWNLOAD EXCEL
  // =========================

  const downloadExcel = async () => {
    try {
      const excelData = await createExcelFile();

      const blob = new Blob([excelData], {
        type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      });

      const url = URL.createObjectURL(blob);

      const link = document.createElement("a");
      link.href = url;
      link.download =
        "Expense-Tracker-Detailed-Report.xlsx";

      document.body.appendChild(link);
      link.click();
      link.remove();

      URL.revokeObjectURL(url);
    } catch (error) {
      console.error(error);
      alert("Failed to download Excel report.");
    }
  };

  // =========================
  // DOWNLOAD PDF
  // =========================

  const downloadPDF = async () => {
    try {
      const pdfData = await createPDFFile();

      const blob = new Blob([pdfData], {
        type: "application/pdf",
      });

      const url = URL.createObjectURL(blob);

      const link = document.createElement("a");
      link.href = url;
      link.download =
        "Expense-Tracker-Detailed-Report.pdf";

      document.body.appendChild(link);
      link.click();
      link.remove();

      URL.revokeObjectURL(url);
    } catch (error) {
      console.error(error);
      alert("Failed to download PDF report.");
    }
  };

  // =========================
  // DOWNLOAD ZIP
  // =========================

  const downloadZIP = async () => {
    try {
      const excelData = await createExcelFile();
      const pdfData = await createPDFFile();

      const zip = new JSZip();

      zip.file(
        "Expense-Tracker-Detailed-Report.xlsx",
        excelData
      );

      zip.file(
        "Expense-Tracker-Detailed-Report.pdf",
        pdfData
      );

      const zipBlob = await zip.generateAsync({
        type: "blob",
      });

      const url = URL.createObjectURL(zipBlob);

      const link = document.createElement("a");
      link.href = url;
      link.download =
        "Expense-Tracker-Complete-Reports.zip";

      document.body.appendChild(link);
      link.click();
      link.remove();

      URL.revokeObjectURL(url);
    } catch (error) {
      console.error(error);
      alert("Failed to create ZIP report.");
    }
  };

  // =========================
  // UI
  // =========================

  return (
    <main className="min-h-screen bg-gray-100 p-6">
      <div className="mx-auto max-w-5xl">

        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900">
            Download Reports
          </h1>

          <p className="mt-2 text-gray-600">
            Download your complete financial details.
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-3">

          {/* Excel */}
          <div className="rounded-xl bg-white p-6 shadow">
            <div className="text-4xl">📊</div>

            <h2 className="mt-4 text-xl font-bold">
              Excel Report
            </h2>

            <p className="mt-2 text-sm text-gray-600">
              Detailed financial data with multiple sheets.
            </p>

            <button
              onClick={downloadExcel}
              className="mt-6 w-full rounded-lg bg-green-600 px-5 py-3 font-semibold text-white hover:bg-green-700"
            >
              📊 Download Excel
            </button>
          </div>

          {/* PDF */}
          <div className="rounded-xl bg-white p-6 shadow">
            <div className="text-4xl">📄</div>

            <h2 className="mt-4 text-xl font-bold">
              PDF Report
            </h2>

            <p className="mt-2 text-sm text-gray-600">
              Printable report with summary and details.
            </p>

            <button
              onClick={downloadPDF}
              className="mt-6 w-full rounded-lg bg-red-600 px-5 py-3 font-semibold text-white hover:bg-red-700"
            >
              📄 Download PDF
            </button>
          </div>

          {/* ZIP */}
          <div className="rounded-xl bg-white p-6 shadow">
            <div className="text-4xl">📦</div>

            <h2 className="mt-4 text-xl font-bold">
              Complete ZIP
            </h2>

            <p className="mt-2 text-sm text-gray-600">
              Excel + PDF together in one ZIP file.
            </p>

            <button
              onClick={downloadZIP}
              className="mt-6 w-full rounded-lg bg-blue-600 px-5 py-3 font-semibold text-white hover:bg-blue-700"
            >
              📦 Download ZIP
            </button>
          </div>

        </div>

        {/* Timestamp */}
        <div className="mt-6 rounded-xl border border-blue-200 bg-blue-50 p-5">
          <h3 className="font-semibold text-blue-900">
            🕒 Timestamp Tracking
          </h3>

          <p className="mt-2 text-sm text-blue-800">
            Every expense, income and category record stores
            its added date/time and last updated date/time.
          </p>
        </div>

      </div>
    </main>
  );
}