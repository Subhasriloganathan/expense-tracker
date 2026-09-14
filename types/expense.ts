export interface Expense {
  id: number;
  title: string;
  amount: number;
  category: string;
  date: string;
  description?: string;
}

export interface Income {
  id: number;
  source: string;
  amount: number;
  date: string;
  description?: string;
}