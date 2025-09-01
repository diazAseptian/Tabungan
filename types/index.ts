export interface Profile {
  id: string;
  full_name: string;
  avatar_url?: string;
  created_at: string;
  updated_at: string;
}

export interface Category {
  id: string;
  user_id: string;
  name: string;
  type: 'income' | 'expense';
  color: string;
  created_at: string;
}

export interface Income {
  id: string;
  user_id: string;
  category_id?: string;
  amount: number;
  source: string;
  description?: string;
  date: string;
  created_at: string;
  category?: Category;
}

export interface Expense {
  id: string;
  user_id: string;
  category_id?: string;
  amount: number;
  description?: string;
  date: string;
  created_at: string;
  category?: Category;
}

// export interface Goal {
//   id: string;
//   user_id: string;
//   name: string;
//   target_amount: number;
//   current_amount: number;
//   deadline?: string;
//   created_at: string;
//   updated_at: string;
// }

export interface Budget {
  id: string;
  user_id: string;
  category_id: string;
  limit_amount: number;
  month: number;
  year: number;
  created_at: string;
  category?: Category;
}

export interface DashboardStats {
  totalIncome: number;
  totalExpenses: number;
  balance: number;
  monthlyIncome: number;
  monthlyExpenses: number;
}

export interface Goal {
  id: string
  user_id: string
  name: string
  target_amount: number
  current_amount: number
  deadline: string | null
  updated_at: string
}
