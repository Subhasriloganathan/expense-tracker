interface SummaryCardProps {
  title: string;
  amount: number;
  type: "income" | "expense" | "balance";
}

export default function SummaryCard({
  title,
  amount,
  type,
}: SummaryCardProps) {
  return (
    <div className="rounded-xl border bg-white p-6 shadow-sm">
      <h3 className="text-sm font-medium text-gray-500">
        {title}
      </h3>

      <p className="mt-2 text-2xl font-bold">
        ₹{amount.toLocaleString("en-IN")}
      </p>
      <p className="mt-1 text-sm text-gray-400 capitalize">
        {type}
      </p>
    </div>
  );
}