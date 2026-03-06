import React, { createContext, useContext, useEffect, useState } from 'react';
import { AppData, Category, Expense, Income, Product, Sale } from '../types';

interface DataContextType {
    data: AppData;
    // Categories
    addCategory: (category: Omit<Category, 'id'>) => void;
    deleteCategory: (id: string) => void;
    // Expenses
    addExpense: (expense: Omit<Expense, 'id'>) => void;
    updateExpense: (id: string, updates: Partial<Expense>) => void;
    deleteExpense: (id: string) => void;
    // Incomes (Other incomes)
    addIncome: (income: Omit<Income, 'id'>) => void;
    updateIncome: (id: string, updates: Partial<Income>) => void;
    deleteIncome: (id: string) => void;
    // Products
    addProduct: (product: Omit<Product, 'id'>) => void;
    updateProduct: (id: string, updates: Partial<Product>) => void;
    deleteProduct: (id: string) => void;
    // Sales
    addSale: (sale: Omit<Sale, 'id' | 'total'>) => void;
}

const defaultCategories: Category[] = [
    { id: 'cat_mp', name: 'Materia Prima', type: 'expense' },
    { id: 'cat_gg', name: 'Gastos Generales', type: 'expense' },
    { id: 'cat_in_ap', name: 'Aporte de Capital', type: 'income' },
];

const defaultData: AppData = {
    categories: defaultCategories,
    expenses: [],
    incomes: [],
    products: [],
    sales: []
};

const DataContext = createContext<DataContextType | undefined>(undefined);

export const DataProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [data, setData] = useState<AppData>(() => {
        const saved = localStorage.getItem('arteymarket_data');
        if (saved) {
            try {
                const parsed = JSON.parse(saved);
                // Migrations/Fallbacks for existing data
                return {
                    ...defaultData,
                    ...parsed,
                    categories: parsed.categories?.length > 0 ? parsed.categories : defaultCategories,
                    incomes: parsed.incomes || [],
                };
            } catch (e) {
                return defaultData;
            }
        }
        return defaultData;
    });

    useEffect(() => {
        localStorage.setItem('arteymarket_data', JSON.stringify(data));
    }, [data]);

    // --- Categories ---
    const addCategory = (category: Omit<Category, 'id'>) => {
        setData(prev => ({
            ...prev,
            categories: [...prev.categories, { ...category, id: crypto.randomUUID() }]
        }));
    };
    const deleteCategory = (id: string) => {
        setData(prev => ({ ...prev, categories: prev.categories.filter(c => c.id !== id) }));
    };

    // --- Expenses ---
    const addExpense = (expense: Omit<Expense, 'id'>) => {
        setData(prev => ({
            ...prev,
            expenses: [{ ...expense, id: crypto.randomUUID() }, ...prev.expenses]
        }));
    };
    const updateExpense = (id: string, updates: Partial<Expense>) => {
        setData(prev => ({
            ...prev,
            expenses: prev.expenses.map(e => e.id === id ? { ...e, ...updates } : e)
        }));
    };
    const deleteExpense = (id: string) => {
        setData(prev => ({ ...prev, expenses: prev.expenses.filter(e => e.id !== id) }));
    };

    // --- Incomes ---
    const addIncome = (income: Omit<Income, 'id'>) => {
        setData(prev => ({
            ...prev,
            incomes: [{ ...income, id: crypto.randomUUID() }, ...prev.incomes]
        }));
    };
    const updateIncome = (id: string, updates: Partial<Income>) => {
        setData(prev => ({
            ...prev,
            incomes: prev.incomes.map(i => i.id === id ? { ...i, ...updates } : i)
        }));
    };
    const deleteIncome = (id: string) => {
        setData(prev => ({ ...prev, incomes: prev.incomes.filter(i => i.id !== id) }));
    };

    // --- Products ---
    const addProduct = (product: Omit<Product, 'id'>) => {
        setData(prev => ({
            ...prev,
            products: [{ ...product, id: crypto.randomUUID() }, ...prev.products]
        }));
    };
    const updateProduct = (id: string, updates: Partial<Product>) => {
        setData(prev => ({
            ...prev,
            products: prev.products.map(p => p.id === id ? { ...p, ...updates } : p)
        }));
    };
    const deleteProduct = (id: string) => {
        setData(prev => ({ ...prev, products: prev.products.filter(p => p.id !== id) }));
    };

    // --- Sales ---
    const addSale = (saleData: Omit<Sale, 'id' | 'total'>) => {
        const product = data.products.find(p => p.id === saleData.productId);
        if (!product) throw new Error("Producto no encontrado");
        if (product.stock < saleData.quantity) throw new Error("Stock insuficiente");

        const total = product.price * saleData.quantity;

        setData(prev => {
            const updatedProducts = prev.products.map(p =>
                p.id === saleData.productId ? { ...p, stock: p.stock - saleData.quantity } : p
            );
            return {
                ...prev,
                sales: [{ ...saleData, total, id: crypto.randomUUID() }, ...prev.sales],
                products: updatedProducts
            };
        });
    };

    return (
        <DataContext.Provider value={{
            data,
            addCategory, deleteCategory,
            addExpense, updateExpense, deleteExpense,
            addIncome, updateIncome, deleteIncome,
            addProduct, updateProduct, deleteProduct,
            addSale
        }}>
            {children}
        </DataContext.Provider>
    );
};

export const useData = () => {
    const context = useContext(DataContext);
    if (context === undefined) {
        throw new Error('useData must be used within a DataProvider');
    }
    return context;
};
