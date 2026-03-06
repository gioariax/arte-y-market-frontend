export type FlowType = 'expense' | 'income';

export interface Category {
  id: string;
  name: string;
  type: FlowType;
}

export interface Expense {
  id: string;
  categoryId: string; // Changed from 'type'
  amount: number;
  date: string;
  description: string;
}

export interface Income {
  id: string;
  categoryId: string;
  amount: number;
  date: string;
  description: string;
}

export interface Product {
  id: string;
  name: string;
  price: number;
  stock: number;
}

export interface Sale {
  id: string;
  productId: string;
  quantity: number;
  total: number;
  date: string;
}

export interface AppData {
  categories: Category[];
  expenses: Expense[];
  incomes: Income[]; // New
  products: Product[];
  sales: Sale[];
}
