import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { v4 as uuidv4 } from 'uuid';
import type { FinanceState } from '@/types';
import { authService } from '@/services/authService';
import { syncService } from '@/services/syncService';
import i18n from '@/i18n';

export const useFinanceStore = create<FinanceState>()(
    persist(
        (set, get) => ({
            incomes: [],
            spendings: [],
            obligations: [],
            pin: null,
            isLocked: true,
            isLoading: false,
            isSyncing: false,
            lastSyncedAt: null,
            error: null,
            profile: null,

            syncToCloud: async (category?: 'incomes' | 'spendings' | 'obligations') => {
                const { profile, incomes, spendings, obligations } = get();
                if (!profile) return;

                set({ isSyncing: true });
                try {
                    if (category === 'incomes') {
                        await syncService.syncIncomes(profile.id, incomes);
                    } else if (category === 'spendings') {
                        await syncService.syncSpendings(profile.id, spendings);
                    } else if (category === 'obligations') {
                        await syncService.syncObligations(profile.id, obligations);
                    } else {
                        await Promise.all([
                            syncService.syncIncomes(profile.id, incomes),
                            syncService.syncSpendings(profile.id, spendings),
                            syncService.syncObligations(profile.id, obligations)
                        ]);
                    }
                    set({ isSyncing: false, lastSyncedAt: new Date().toISOString() });
                } catch {
                    set({ isSyncing: false, error: 'auth.cloud_sync_error' });
                }
            },

            login: async (userId: string, enteredPin: string) => {
                set({ isLoading: true, error: null });
                const { profile, error } = await authService.loginOrRegister(userId, enteredPin);

                if (error) {
                    set({ isLoading: false, error });
                    return { success: false, error };
                }

                if (profile) {
                    const cloudData = await syncService.fetchAll(profile.id);
                    if (profile.language) {
                        i18n.changeLanguage(profile.language);
                    }

                    set({
                        profile,
                        pin: profile.pin_hash,
                        isLoading: false,
                        isLocked: false,
                        incomes: cloudData.incomes,
                        spendings: cloudData.spendings,
                        obligations: cloudData.obligations,
                        lastSyncedAt: new Date().toISOString()
                    });
                    return { success: true };
                }

                set({ isLoading: false });
                return { success: false };
            },

            logout: () => {
                set({ profile: null, isLocked: true, incomes: [], spendings: [], obligations: [] });
            },

            initialize: async () => {
                const { profile } = get();
                if (!profile) return;

                set({ isLoading: true, error: null });
                try {
                    const data = await syncService.fetchAll(profile.id);
                    if (profile.language) {
                        i18n.changeLanguage(profile.language);
                    }
                    set({
                        ...data,
                        isLoading: false,
                        lastSyncedAt: new Date().toISOString()
                    });
                } catch {
                    set({ isLoading: false, error: 'auth.cloud_load_error' });
                }
            },

            addIncome: async (income) => {
                const id = uuidv4();
                set((state) => ({
                    incomes: [...state.incomes, { ...income, id, created_at: new Date().toISOString() }],
                }));
                await get().syncToCloud('incomes');
            },
            updateIncome: async (id, income) => {
                set((state) => ({
                    incomes: state.incomes.map((i) => (i.id === id ? { ...i, ...income } : i)),
                }));
                await get().syncToCloud('incomes');
            },
            deleteIncome: async (id) => {
                set((state) => ({
                    incomes: state.incomes.filter((i) => i.id !== id),
                }));
                await get().syncToCloud('incomes');
            },

            addSpending: async (spending) => {
                const id = uuidv4();
                set((state) => {
                    const newSpendings = [...state.spendings, { ...spending, id, created_at: new Date().toISOString() }];
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
                await Promise.all([
                    get().syncToCloud('spendings'),
                    get().syncToCloud('obligations')
                ]);
            },
            updateSpending: async (id, spending) => {
                set((state) => ({
                    spendings: state.spendings.map((s) => (s.id === id ? { ...s, ...spending } : s)),
                }));
                await get().syncToCloud('spendings');
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
                await Promise.all([
                    get().syncToCloud('spendings'),
                    get().syncToCloud('obligations')
                ]);
            },

            addObligation: async (obligation) => {
                const id = uuidv4();
                set((state) => ({
                    obligations: [...state.obligations, { ...obligation, id, created_at: new Date().toISOString() }],
                }));
                await get().syncToCloud('obligations');
            },
            updateObligation: async (id, obligation) => {
                set((state) => ({
                    obligations: state.obligations.map((o) => (o.id === id ? { ...o, ...obligation } : o)),
                }));
                await get().syncToCloud('obligations');
            },
            deleteObligation: async (id) => {
                set((state) => ({
                    obligations: state.obligations.filter((o) => o.id !== id),
                }));
                await get().syncToCloud('obligations');
            },

            setStoreData: (data) => set(() => data),

            setPin: async (pin) => {
                set({ pin });
                const { profile } = get();
                if (profile) {
                    await authService.updatePin(profile.id, pin);
                    set({ profile: { ...profile, pin_hash: pin } });
                }
            },

            setLanguage: async (lang: string) => {
                i18n.changeLanguage(lang);
                const { profile } = get();
                if (profile) {
                    await authService.updateLanguage(profile.id, lang);
                    set({ profile: { ...profile, language: lang } });
                }
            },

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
                set({ incomes: [], spendings: [], obligations: [], isLocked: false });
                await get().syncToCloud(); // Full sync to clear everything
            },
        }),
        {
            name: 'cash-flow-storage',
            storage: createJSONStorage(() => localStorage),
        }
    )
);
