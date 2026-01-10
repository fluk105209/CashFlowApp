import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { v4 as uuidv4 } from 'uuid';
import type { FinanceState } from '@/types';
import { financeService } from '@/services/financeService';

export const useFinanceStore = create<FinanceState>()(
    persist(
        (set, get) => ({
            incomes: [],
            spendings: [],
            obligations: [],
            pin: null,
            isLocked: true,
            isLoading: false,
            error: null,
            // Initialize store by fetching data (future API integration)
            initialize: async () => {
                set({ isLoading: true, error: null });
                try {
                    await financeService.fetchAll();
                    // In a real scenario, we would set store data here
                    set({ isLoading: false });
                } catch (err) {
                    set({ isLoading: false, error: 'Failed to load data' });
                }
            },
            addIncome: (income) =>
                set((state) => ({
                    incomes: [...state.incomes, { ...income, id: uuidv4() }],
                })),
            updateIncome: (id, income) =>
                set((state) => ({
                    incomes: state.incomes.map((i) => (i.id === id ? { ...i, ...income } : i)),
                })),
            deleteIncome: (id) =>
                set((state) => ({
                    incomes: state.incomes.filter((i) => i.id !== id),
                })),
            addSpending: (spending) =>
                set((state) => {
                    const newSpendings = [...state.spendings, { ...spending, id: uuidv4() }];
                    let newObligations = state.obligations;
                    if (spending.kind === 'obligation-payment' && spending.linkedObligationId) {
                        newObligations = state.obligations.map((ob) => {
                            if (ob.id !== spending.linkedObligationId) return ob;
                            const updatedOb = { ...ob };
                            if (updatedOb.type === 'installment' && updatedOb.paidMonths !== undefined) {
                                updatedOb.paidMonths = updatedOb.paidMonths + 1;
                            }
                            if (updatedOb.balance !== undefined) {
                                updatedOb.balance = updatedOb.balance - spending.amount;
                            }
                            return updatedOb;
                        });
                    }
                    return { spendings: newSpendings, obligations: newObligations };
                }),
            updateSpending: (id, spending) =>
                set((state) => ({
                    spendings: state.spendings.map((s) => (s.id === id ? { ...s, ...spending } : s)),
                })),
            deleteSpending: (id) =>
                set((state) => {
                    const spending = state.spendings.find((s) => s.id === id);
                    if (!spending) return {};
                    let newObligations = state.obligations;
                    if (spending.kind === 'obligation-payment' && spending.linkedObligationId) {
                        newObligations = state.obligations.map((ob) => {
                            if (ob.id !== spending.linkedObligationId) return ob;
                            const updatedOb = { ...ob };
                            if (updatedOb.type === 'installment' && updatedOb.paidMonths !== undefined) {
                                updatedOb.paidMonths = Math.max(0, updatedOb.paidMonths - 1);
                            }
                            if (updatedOb.balance !== undefined) {
                                updatedOb.balance = updatedOb.balance + spending.amount;
                            }
                            return updatedOb;
                        });
                    }
                    return {
                        spendings: state.spendings.filter((s) => s.id !== id),
                        obligations: newObligations,
                    };
                }),
            addObligation: (obligation) =>
                set((state) => ({
                    obligations: [...state.obligations, { ...obligation, id: uuidv4() }],
                })),
            updateObligation: (id, obligation) =>
                set((state) => ({
                    obligations: state.obligations.map((o) => (o.id === id ? { ...o, ...obligation } : o)),
                })),
            deleteObligation: (id) =>
                set((state) => ({
                    obligations: state.obligations.filter((o) => o.id !== id),
                })),
            // Demo Data Loader
            setStoreData: (data) => set(() => data),

            setPin: (pin) => set({ pin, isLocked: true }),
            unlock: (enteredPin) => {
                const { pin } = get();
                if (!pin || enteredPin === pin) {
                    set({ isLocked: false });
                    return true;
                }
                return false;
            },
            lock: () => set({ isLocked: true }),
            resetData: () => set({
                incomes: [],
                spendings: [],
                obligations: [],
                isLocked: false // Keep it unlocked after reset for better UX, or as per preference
            }),
        }),
        {
            name: 'cash-flow-storage',
            storage: createJSONStorage(() => localStorage),
        }
    )
);
