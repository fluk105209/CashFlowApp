import { supabase } from '../lib/supabase';
import type { Income, Spending, Obligation, Asset } from '../types';

export const syncService = {
    async fetchAll(profileId: string) {
        const [incomes, spendings, obligations, assets] = await Promise.all([
            supabase.from('incomes').select('*').eq('profile_id', profileId),
            supabase.from('spendings').select('*').eq('profile_id', profileId),
            supabase.from('obligations').select('*').eq('profile_id', profileId),
            supabase.from('assets').select('*').eq('profile_id', profileId)
        ]);

        return {
            incomes: (incomes.data || []).map(inc => ({
                id: inc.id,
                name: inc.name,
                amount: Number(inc.amount),
                category: inc.category,
                date: inc.date,
                frequency: inc.frequency,
                created_at: inc.created_at
            })) as Income[],
            spendings: (spendings.data || []).map(s => ({
                id: s.id,
                name: s.name,
                amount: Number(s.amount),
                category: s.category,
                date: s.date,
                kind: s.kind,
                linkedObligationId: s.linked_obligation_id,
                created_at: s.created_at
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
                startDate: o.start_date,
                creditLimit: o.credit_limit ? Number(o.credit_limit) : 0,
                created_at: o.created_at
            })) as Obligation[],
            assets: (assets.data || []).map(a => ({
                id: a.id,
                name: a.name,
                type: a.type,
                quantity: Number(a.quantity),
                unit: a.unit,
                purchasePrice: a.purchase_price ? Number(a.purchase_price) : undefined,
                created_at: a.created_at
            })) as Asset[]
        };
    },

    async syncIncomes(profileId: string, incomes: Income[]) {
        if (incomes.length === 0) {
            await supabase.from('incomes').delete().eq('profile_id', profileId);
            return;
        }

        const dataToUpsert = incomes.map(inc => ({
            id: inc.id,
            profile_id: profileId,
            name: inc.name,
            amount: inc.amount,
            category: inc.category,
            date: inc.date,
            frequency: inc.frequency,
            created_at: inc.created_at
        }));

        // Upsert all current items
        await supabase.from('incomes').upsert(dataToUpsert);

        // Delete items no longer in local state
        const currentIds = incomes.map(i => i.id);
        await supabase.from('incomes')
            .delete()
            .eq('profile_id', profileId)
            .not('id', 'in', `(${currentIds.join(',')})`);
    },

    async syncSpendings(profileId: string, spendings: Spending[]) {
        if (spendings.length === 0) {
            await supabase.from('spendings').delete().eq('profile_id', profileId);
            return;
        }

        const dataToUpsert = spendings.map(s => ({
            id: s.id,
            profile_id: profileId,
            name: s.name,
            amount: s.amount,
            category: s.category,
            date: s.date,
            kind: s.kind,
            linked_obligation_id: s.linkedObligationId,
            created_at: s.created_at
        }));

        await supabase.from('spendings').upsert(dataToUpsert);

        const currentIds = spendings.map(s => s.id);
        await supabase.from('spendings')
            .delete()
            .eq('profile_id', profileId)
            .not('id', 'in', `(${currentIds.join(',')})`);
    },

    async syncObligations(profileId: string, obligations: Obligation[]) {
        if (obligations.length === 0) {
            await supabase.from('obligations').delete().eq('profile_id', profileId);
            return;
        }

        const dataToUpsert = obligations.map(o => ({
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
            start_date: o.startDate,
            credit_limit: o.creditLimit,
            created_at: o.created_at
        }));

        await supabase.from('obligations').upsert(dataToUpsert);

        const currentIds = obligations.map(o => o.id);
        await supabase.from('obligations')
            .delete()
            .eq('profile_id', profileId)
            .not('id', 'in', `(${currentIds.join(',')})`);
    },

    async syncAssets(profileId: string, assets: Asset[]) {
        if (assets.length === 0) {
            await supabase.from('assets').delete().eq('profile_id', profileId);
            return;
        }

        const dataToUpsert = assets.map(a => ({
            id: a.id,
            profile_id: profileId,
            name: a.name,
            type: a.type,
            quantity: a.quantity,
            unit: a.unit,
            purchase_price: a.purchasePrice,
            created_at: a.created_at
        }));

        await supabase.from('assets').upsert(dataToUpsert);

        const currentIds = assets.map(a => a.id);
        await supabase.from('assets')
            .delete()
            .eq('profile_id', profileId)
            .not('id', 'in', `(${currentIds.join(',')})`);
    }
};
