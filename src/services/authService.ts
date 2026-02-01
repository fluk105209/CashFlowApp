import { supabase } from '../lib/supabase';
import type { Profile } from '@/types';

export const authService = {
    async loginOrRegister(userId: string, pin: string): Promise<{ profile: Profile | null; error: string | null }> {
        const normalizedId = userId.toLowerCase().trim();
        try {
            // 1. Check if user exists
            const { data: existingUser, error: fetchError } = await supabase
                .from('profiles')
                .select('*')
                .eq('user_id_text', normalizedId)
                .single();

            if (fetchError && fetchError.code !== 'PGRST116') {
                return { profile: null, error: fetchError.message };
            }

            if (existingUser) {
                // 2. Simple PIN verification (Direct comparison for simplicity as requested)
                if (existingUser.pin_hash === pin) {
                    return { profile: existingUser, error: null };
                } else {
                    return { profile: null, error: 'auth.incorrect_pin' };
                }
            } else {
                // 3. Register new user
                const { data: newUser, error: createError } = await supabase
                    .from('profiles')
                    .insert([{ user_id_text: normalizedId, pin_hash: pin }])
                    .select()
                    .single();

                if (createError) {
                    return { profile: null, error: createError.message };
                }

                return { profile: newUser, error: null };
            }
        } catch (err) {
            return { profile: null, error: err instanceof Error ? err.message : 'Unknown error' };
        }
    },

    async updatePin(profileId: string, newPin: string): Promise<{ error: string | null }> {
        try {
            const { error } = await supabase
                .from('profiles')
                .update({ pin_hash: newPin })
                .eq('id', profileId);

            return { error: error ? error.message : null };
        } catch (err) {
            return { error: err instanceof Error ? err.message : 'Unknown error' };
        }
    },

    async updateLanguage(profileId: string, lang: string): Promise<{ error: string | null }> {
        try {
            const { error } = await supabase
                .from('profiles')
                .update({ language: lang })
                .eq('id', profileId);

            return { error: error ? error.message : null };
        } catch (err) {
            return { error: err instanceof Error ? err.message : 'Unknown error' };
        }
    },

    async updateProfileField(profileId: string, fields: Partial<Profile>): Promise<{ error: string | null }> {
        try {
            const { error } = await supabase
                .from('profiles')
                .update(fields)
                .eq('id', profileId);

            return { error: error ? error.message : null };
        } catch (err) {
            return { error: err instanceof Error ? err.message : 'Unknown error' };
        }
    }
};
