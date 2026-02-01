import {
    Utensils, Home, Zap, Car, Play, ShoppingBag, HeartPulse, TrendingUp, HelpCircle,
    Briefcase, Wallet, Landmark, CreditCard, User, CarFront, Gift, Plane,
    Award, PieChart, Banknote, GraduationCap, Repeat, ShieldCheck, UserCircle, Dog
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

export interface CategoryMetadata {
    key: string;
    icon: LucideIcon;
    defaultColor: string;
}

export const PRESET_COLORS = [
    '#ef4444', // Red 500
    '#f97316', // Orange 500
    '#f59e0b', // Amber 500
    '#eab308', // Yellow 500
    '#84cc16', // Lime 500
    '#22c55e', // Green 500
    '#10b981', // Emerald 500
    '#14b8a6', // Teal 500
    '#06b6d4', // Cyan 500
    '#0ea5e9', // Sky 500
    '#3b82f6', // Blue 500
    '#6366f1', // Indigo 500
    '#8b5cf6', // Violet 500
    '#a855f7', // Purple 500
    '#d946ef', // Fuchsia 500
    '#ec4899', // Pink 500
    '#f43f5e', // Rose 500
    '#64748b', // Slate 500
    '#94a3b8', // Blue Gray 400
];

export const INCOME_CATEGORIES: CategoryMetadata[] = [
    { key: 'Salary', icon: Briefcase, defaultColor: '#10b981' },
    { key: 'Freelance', icon: Wallet, defaultColor: '#3b82f6' },
    { key: 'Business', icon: Wallet, defaultColor: '#8b5cf6' },
    { key: 'Investment', icon: TrendingUp, defaultColor: '#f59e0b' },
    { key: 'Bonus', icon: Award, defaultColor: '#d946ef' },
    { key: 'Dividend', icon: PieChart, defaultColor: '#14b8a6' },
    { key: 'Interest', icon: Banknote, defaultColor: '#0ea5e9' },
    { key: 'Gift', icon: Gift, defaultColor: '#ec4899' },
    { key: 'Other', icon: HelpCircle, defaultColor: '#64748b' },
];

export const SPENDING_CATEGORIES: CategoryMetadata[] = [
    { key: 'Food', icon: Utensils, defaultColor: '#ef4444' },
    { key: 'Transport', icon: Car, defaultColor: '#f97316' },
    { key: 'Housing', icon: Home, defaultColor: '#6366f1' },
    { key: 'Entertainment', icon: Play, defaultColor: '#ec4899' },
    { key: 'Health', icon: HeartPulse, defaultColor: '#06b6d4' },
    { key: 'Shopping', icon: ShoppingBag, defaultColor: '#8b5cf6' },
    { key: 'Education', icon: GraduationCap, defaultColor: '#6366f1' },
    { key: 'Subscription', icon: Repeat, defaultColor: '#ec4899' },
    { key: 'Insurance', icon: ShieldCheck, defaultColor: '#10b981' },
    { key: 'Personal Care', icon: UserCircle, defaultColor: '#f43f5e' },
    { key: 'Pets', icon: Dog, defaultColor: '#f59e0b' },
    { key: 'Utilities', icon: Zap, defaultColor: '#eab308' },
    { key: 'Travel', icon: Plane, defaultColor: '#14b8a6' },
    { key: 'Obligation Payment', icon: Landmark, defaultColor: '#475569' },
    { key: 'Other', icon: HelpCircle, defaultColor: '#94a3b8' },
];

export const OBLIGATION_TYPES_METADATA: Record<string, { icon: LucideIcon }> = {
    'installment': { icon: Landmark },
    'credit-card': { icon: CreditCard },
    'personal-loan': { icon: User },
    'car-loan': { icon: CarFront },
    'home-loan': { icon: Home },
};

export const ALL_CATEGORIES = [...INCOME_CATEGORIES, ...SPENDING_CATEGORIES];

export const getCategoryMetadata = (key: string): CategoryMetadata | undefined => {
    return ALL_CATEGORIES.find(c => c.key.toLowerCase() === key.toLowerCase());
};
