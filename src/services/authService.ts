import { supabase } from '../lib/supabase';

export interface UserProfile {
    id: string;
    user_id_text: string;
    created_at: string;
}

export const authService = {
    async loginOrRegister(userId: string, pin: string): Promise<{ profile: UserProfile | null; error: string | null }> {
        try {
            // 1. Check if user exists
            const { data: existingUser, error: fetchError } = await supabase
                .from('profiles')
                .select('*')
                .eq('user_id_text', userId)
                .single();

            if (fetchError && fetchError.code !== 'PGRST116') {
                return { profile: null, error: fetchError.message };
            }

            if (existingUser) {
                // 2. Simple PIN verification (Direct comparison for simplicity as requested)
                if (existingUser.pin_hash === pin) {
                    return { profile: existingUser, error: null };
                } else {
                    return { profile: null, error: 'Incorrect PIN' };
                }
            } else {
                // 3. Register new user
                const { data: newUser, error: createError } = await supabase
                    .from('profiles')
                    .insert([{ user_id_text: userId, pin_hash: pin }])
                    .select()
                    .single();

                if (createError) {
                    return { profile: null, error: createError.message };
                }

                return { profile: newUser, error: null };
            }
        } catch (err: any) {
            return { profile: null, error: err.message };
        }
    },

    async updatePin(profileId: string, newPin: string): Promise<{ error: string | null }> {
        try {
            const { error } = await supabase
                .from('profiles')
                .update({ pin_hash: newPin })
                .eq('id', profileId);

            return { error: error ? error.message : null };
        } catch (err: any) {
            return { error: err.message };
        }
    }
};
