export type Frequency = 'monthly' | 'yearly' | 'one-time' | 'irregular';

export interface Income {
    id: string;
    name: string;
    amount: number;
    category: string;
    frequency: Frequency;
    date: string; // ISO date string
}



export interface Spending {
    id: string;
    name: string;
    amount: number;
    category: string;
    date: string; // ISO date string
    kind: 'normal' | 'obligation-payment';
    linkedObligationId?: string;
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
}

export interface FinanceState {
    incomes: Income[];
    spendings: Spending[];
    obligations: Obligation[];
    pin: string | null;
    isLocked: boolean;
    isLoading: boolean;
    error: string | null;

    initialize: () => Promise<void>;
    addIncome: (income: Omit<Income, 'id'>) => void;
    updateIncome: (id: string, income: Partial<Income>) => void;
    deleteIncome: (id: string) => void;
    // ... (rest of the interface stays the same)

    addSpending: (spending: Omit<Spending, 'id'>) => void;
    updateSpending: (id: string, spending: Partial<Spending>) => void;
    deleteSpending: (id: string) => void;

    addObligation: (obligation: Omit<Obligation, 'id'>) => void;
    updateObligation: (id: string, obligation: Partial<Obligation>) => void;
    deleteObligation: (id: string) => void;
    setStoreData: (data: { incomes: Income[], spendings: Spending[], obligations: Obligation[] }) => void;
    setPin: (pin: string) => void;
    unlock: (pin: string) => boolean;
    lock: () => void;
    resetData: () => void;
}
