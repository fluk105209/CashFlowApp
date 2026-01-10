import { supabase } from '../lib/supabase';
import type { Income, Spending, Obligation } from '../types';

export const syncService = {
    async fetchAll(profileId: string) {
        const [incomes, spendings, obligations] = await Promise.all([
            supabase.from('incomes').select('*').eq('profile_id', profileId),
            supabase.from('spendings').select('*').eq('profile_id', profileId),
            supabase.from('obligations').select('*').eq('profile_id', profileId)
        ]);

        return {
            incomes: (incomes.data || []).map(inc => ({
                id: inc.id,
                name: inc.name,
                amount: Number(inc.amount),
                category: inc.category,
                date: inc.date,
                frequency: inc.frequency
            })) as Income[],
            spendings: (spendings.data || []).map(s => ({
                id: s.id,
                name: s.name,
                amount: Number(s.amount),
                category: s.category,
                date: s.date,
                kind: s.kind,
                linkedObligationId: s.linked_obligation_id
            })) as Spending[],
            obligations: (obligations.data || []).map(o => ({
                id: o.id,
                name: o.name,
                type: o.type,
                amount: Number(o.amount),
                totalMonths: o.total_months,
                paidMonths: o.paid_months,
                balance: Number(o.balance),
                interestRate: Number(o.interest_rate),
                status: o.status,
                startDate: o.start_date
            })) as Obligation[]
        };
    },

    async syncIncome(profileId: string, incomes: Income[]) {
        await supabase.from('incomes').delete().eq('profile_id', profileId);
        if (incomes.length > 0) {
            const dataToInsert = incomes.map(inc => ({
                id: inc.id,
                profile_id: profileId,
                name: inc.name,
                amount: inc.amount,
                category: inc.category,
                date: inc.date,
                frequency: inc.frequency
            }));
            await supabase.from('incomes').insert(dataToInsert);
        }
    },

    async syncSpending(profileId: string, spendings: Spending[]) {
        await supabase.from('spendings').delete().eq('profile_id', profileId);
        if (spendings.length > 0) {
            const dataToInsert = spendings.map(s => ({
                id: s.id,
                profile_id: profileId,
                name: s.name,
                amount: s.amount,
                category: s.category,
                date: s.date,
                kind: s.kind,
                linked_obligation_id: s.linkedObligationId
            }));
            await supabase.from('spendings').insert(dataToInsert);
        }
    },

    async syncObligations(profileId: string, obligations: Obligation[]) {
        await supabase.from('obligations').delete().eq('profile_id', profileId);
        if (obligations.length > 0) {
            const dataToInsert = obligations.map(o => ({
                id: o.id,
                profile_id: profileId,
                name: o.name,
                type: o.type,
                amount: o.amount,
                total_months: o.totalMonths,
                paid_months: o.paidMonths,
                balance: o.balance,
                interest_rate: o.interestRate,
                status: o.status,
                start_date: o.startDate
            }));
            await supabase.from('obligations').insert(dataToInsert);
        }
    }
};
