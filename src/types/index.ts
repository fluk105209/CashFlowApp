export type Frequency = 'monthly' | 'yearly' | 'one-time' | 'irregular';

export interface Income {
    id: string;
    name: string;
    amount: number;
    category: string;
    frequency: Frequency;
    date: string; // ISO date string
    created_at?: string;
}



export interface Spending {
    id: string;
    name: string;
    amount: number;
    category: string;
    date: string; // ISO date string
    kind: 'normal' | 'obligation-payment';
    linkedObligationId?: string;
    created_at?: string;
}

export type ObligationType = 'installment' | 'credit-card' | 'personal-loan' | 'car-loan' | 'home-loan' | 'other';

export interface Obligation {
    id: string;
    name: string;
    type: ObligationType;
    amount: number; // Monthly payment amount or Min payment
    balance?: number; // Total amount or Remaining balance (Optional for some types)
    creditLimit?: number; // Optional: Total Credit Line for Credit Cards
    interestRate?: number; // APR (Optional)
    totalMonths?: number; // For fixed installments/loans (Optional)
    paidMonths?: number; // For fixed installments (Optional)
    startDate?: string; // Optional
    status: 'active' | 'closed';
    created_at?: string;
}

export interface Profile {
    id: string;
    user_id_text: string;
    pin_hash: string;
    language: string;
    created_at: string;
}

export interface FinanceState {
    incomes: Income[];
    spendings: Spending[];
    obligations: Obligation[];
    pin: string | null;
    isLocked: boolean;
    isLoading: boolean;
    isSyncing: boolean;
    lastSyncedAt: string | null;
    error: string | null;
    profile: Profile | null;
    categoryColors: Record<string, string>;
    userCustomColors: string[];

    login: (userId: string, pin: string) => Promise<{ success: boolean; error?: string }>;
    logout: () => void;
    initialize: () => Promise<void>;
    syncToCloud: (category?: 'incomes' | 'spendings' | 'obligations') => Promise<void>;
    addIncome: (income: Omit<Income, 'id'>) => Promise<void>;
    updateIncome: (id: string, income: Partial<Income>) => Promise<void>;
    deleteIncome: (id: string) => Promise<void>;

    addSpending: (spending: Omit<Spending, 'id'>) => Promise<void>;
    updateSpending: (id: string, spending: Partial<Spending>) => Promise<void>;
    deleteSpending: (id: string) => Promise<void>;

    addObligation: (obligation: Omit<Obligation, 'id'>) => Promise<void>;
    updateObligation: (id: string, obligation: Partial<Obligation>) => Promise<void>;
    deleteObligation: (id: string) => Promise<void>;
    setStoreData: (data: { incomes: Income[], spendings: Spending[], obligations: Obligation[] }) => void;
    setPin: (pin: string) => Promise<void>;
    setLanguage: (lang: string) => Promise<void>;
    setCategoryColor: (category: string, color: string) => void;
    addUserCustomColor: (color: string) => void;
    unlock: (enteredPin: string) => boolean;
    lock: () => void;
    resetData: () => Promise<void>;
}
