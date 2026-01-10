import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { v4 as uuidv4 } from 'uuid';
import type { FinanceState } from '@/types';
import { authService } from '@/services/authService';
import { syncService } from '@/services/syncService';

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
            profile: null,

            login: async (userId: string, enteredPin: string) => {
                set({ isLoading: true, error: null });
                const { profile, error } = await authService.loginOrRegister(userId, enteredPin);

                if (error) {
                    set({ isLoading: false, error });
                    return { success: false, error };
                }

                if (profile) {
                    // Fetch cloud data for this profile
                    const cloudData = await syncService.fetchAll(profile.id);
                    set({
                        profile,
                        isLoading: false,
                        isLocked: false,
                        incomes: cloudData.incomes,
                        spendings: cloudData.spendings,
                        obligations: cloudData.obligations
                    });
                    return { success: true };
                }

                set({ isLoading: false });
                return { success: false };
            },

            logout: () => {
                set({ profile: null, isLocked: true, incomes: [], spendings: [], obligations: [] });
            },

            // Initialize store by fetching data
            initialize: async () => {
                const { profile } = get();
                if (!profile) return;

                set({ isLoading: true, error: null });
                try {
                    const data = await syncService.fetchAll(profile.id);
                    set({ ...data, isLoading: false });
                } catch (err) {
                    set({ isLoading: false, error: 'Failed to load cloud data' });
                }
            },

            addIncome: async (income) => {
                const id = uuidv4();
                set((state) => ({
                    incomes: [...state.incomes, { ...income, id }],
                }));
                // Auto sync
                const { profile, incomes } = get();
                if (profile) await syncService.syncIncome(profile.id, incomes);
            },
            updateIncome: async (id, income) => {
                set((state) => ({
                    incomes: state.incomes.map((i) => (i.id === id ? { ...i, ...income } : i)),
                }));
                const { profile, incomes } = get();
                if (profile) await syncService.syncIncome(profile.id, incomes);
            },
            deleteIncome: async (id) => {
                set((state) => ({
                    incomes: state.incomes.filter((i) => i.id !== id),
                }));
                const { profile, incomes } = get();
                if (profile) await syncService.syncIncome(profile.id, incomes);
            },
            addSpending: async (spending) => {
                const id = uuidv4();
                set((state) => {
                    const newSpendings = [...state.spendings, { ...spending, id }];
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
                });
                const { profile, spendings, obligations } = get();
                if (profile) {
                    await Promise.all([
                        syncService.syncSpending(profile.id, spendings),
                        syncService.syncObligations(profile.id, obligations)
                    ]);
                }
            },
            updateSpending: async (id, spending) => {
                set((state) => ({
                    spendings: state.spendings.map((s) => (s.id === id ? { ...s, ...spending } : s)),
                }));
                const { profile, spendings } = get();
                if (profile) await syncService.syncSpending(profile.id, spendings);
            },
            deleteSpending: async (id) => {
                const currentSpendings = get().spendings;
                const spending = currentSpendings.find((s) => s.id === id);
                if (!spending) return;

                set((state) => {
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
                });
                const { profile, spendings, obligations } = get();
                if (profile) {
                    await Promise.all([
                        syncService.syncSpending(profile.id, spendings),
                        syncService.syncObligations(profile.id, obligations)
                    ]);
                }
            },
            addObligation: async (obligation) => {
                const id = uuidv4();
                set((state) => ({
                    obligations: [...state.obligations, { ...obligation, id }],
                }));
                const { profile, obligations } = get();
                if (profile) await syncService.syncObligations(profile.id, obligations);
            },
            updateObligation: async (id, obligation) => {
                set((state) => ({
                    obligations: state.obligations.map((o) => (o.id === id ? { ...o, ...obligation } : o)),
                }));
                const { profile, obligations } = get();
                if (profile) await syncService.syncObligations(profile.id, obligations);
            },
            deleteObligation: async (id) => {
                set((state) => ({
                    obligations: state.obligations.filter((o) => o.id !== id),
                }));
                const { profile, obligations } = get();
                if (profile) await syncService.syncObligations(profile.id, obligations);
            },
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
            resetData: async () => {
                const { profile } = get();
                set({ incomes: [], spendings: [], obligations: [], isLocked: false });
                if (profile) {
                    await Promise.all([
                        syncService.syncIncome(profile.id, []),
                        syncService.syncSpending(profile.id, []),
                        syncService.syncObligations(profile.id, [])
                    ]);
                }
            },
        }),
        {
            name: 'cash-flow-storage',
            storage: createJSONStorage(() => localStorage),
        }
    )
);
