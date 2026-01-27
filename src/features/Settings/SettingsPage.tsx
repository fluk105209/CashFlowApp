import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useFinanceStore } from '@/stores/useFinanceStore';
import { Shield, ArrowLeft, Key, Moon, LogOut, Languages, Trash2, Palette, Download } from 'lucide-react';
import { exportToExcel } from '@/utils/exportUtils';
import { useTranslation } from 'react-i18next';
import { ThemeToggle } from '@/components/ThemeToggle';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { useNavigate } from 'react-router-dom';

export const SettingsPage: React.FC = () => {
    const { t, i18n } = useTranslation();
    const { pin, setPin, resetData, logout, setLanguage, incomes, spendings, obligations, assets } = useFinanceStore();
    const [newPin, setNewPin] = useState('');
    const [confirmPin, setConfirmPin] = useState('');
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [isUpdating, setIsUpdating] = useState(false);
    const navigate = useNavigate();

    const handleSetPin = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setSuccess('');

        if (newPin.length !== 6 || !/^\d+$/.test(newPin)) {
            setError(t('settings.pin_length_error'));
            return;
        }

        if (newPin !== confirmPin) {
            setError(t('settings.pin_match_error'));
            return;
        }

        setIsUpdating(true);
        try {
            await setPin(newPin);
            setSuccess(t('settings.pin_update_success'));
            setNewPin('');
            setConfirmPin('');
        } catch {
            setError(t('settings.pin_update_error'));
        } finally {
            setIsUpdating(false);
        }
    };

    const handleReset = async () => {
        if (confirm(t('settings.reset_confirm'))) {
            await resetData();
            navigate('/');
        }
    };

    const handleExport = () => {
        exportToExcel({ incomes, spendings, obligations, assets });
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="space-y-8 pb-20 p-4"
        >
            <div className="flex items-center gap-4">
                <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
                    <ArrowLeft className="h-5 w-5" />
                </Button>
                <div>
                    <h2 className="text-2xl font-bold tracking-tight">{t('settings.title')}</h2>
                    <p className="text-sm text-muted-foreground">{t('settings.subtitle')}</p>
                </div>
            </div>

            <section className="space-y-4">
                <h3 className="text-lg font-medium">{t('settings.general')}</h3>
                <Card>
                    <CardContent className="p-6 space-y-4">

                        <div className="flex items-center justify-between">
                            <div className="space-y-0.5">
                                <h4 className="font-medium">{t('settings.profile_pin')}</h4>
                                <p className="text-sm text-muted-foreground">
                                    {pin ? t('settings.pin_desc_change') : t('settings.pin_desc_set')}
                                </p>
                            </div>
                            <Key className="h-5 w-5 text-muted-foreground" />
                        </div>

                        <form onSubmit={handleSetPin} className="space-y-4 pt-2">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <label className="text-sm font-medium">{t('settings.new_pin')}</label>
                                    <Input
                                        type="password"
                                        maxLength={6}
                                        placeholder={t('settings.placeholder_new_pin')}
                                        value={newPin}
                                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => setNewPin(e.target.value)}
                                        className="rounded-xl"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-medium">{t('settings.confirm_pin')}</label>
                                    <Input
                                        type="password"
                                        maxLength={6}
                                        placeholder={t('settings.placeholder_confirm_pin')}
                                        value={confirmPin}
                                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => setConfirmPin(e.target.value)}
                                        className="rounded-xl"
                                    />
                                </div>
                            </div>

                            {error && <p className="text-destructive text-xs font-medium">{error}</p>}
                            {success && <p className="text-emerald-500 text-xs font-medium">{success}</p>}

                            <Button type="submit" className="w-full rounded-xl" disabled={isUpdating}>
                                {isUpdating ? t('settings.updating') : (pin ? t('settings.update_pin') : t('settings.set_pin'))}
                            </Button>
                        </form>
                    </CardContent>
                </Card>
            </section>

            <section className="space-y-4">
                <div className="flex items-center gap-3 mb-2">
                    <div className="w-10 h-10 rounded-2xl bg-amber-500/10 flex items-center justify-center">
                        <Moon className="h-5 w-5 text-amber-500" />
                    </div>
                    <h3 className="text-lg font-semibold">{t('settings.appearance')}</h3>
                </div>

                <div className="bg-card rounded-2xl p-6 border shadow-sm flex items-center justify-between">
                    <div className="space-y-0.5">
                        <h4 className="font-medium">{t('settings.dark_mode')}</h4>
                        <p className="text-sm text-muted-foreground">{t('settings.dark_mode_desc')}</p>
                    </div>
                    <ThemeToggle />
                </div>
            </section>

            <section className="space-y-4">
                <div className="flex items-center gap-3 mb-2">
                    <div className="w-10 h-10 rounded-2xl bg-indigo-500/10 flex items-center justify-center">
                        <Shield className="h-5 w-5 text-indigo-500" />
                    </div>
                    <h3 className="text-lg font-semibold">{t('settings.category_colors')}</h3>
                </div>

                <div
                    onClick={() => navigate('/settings/category-colors')}
                    className="bg-card rounded-2xl p-6 border shadow-sm flex items-center justify-between cursor-pointer active:scale-[0.98] transition-all hover:bg-muted/30"
                >
                    <div className="space-y-0.5">
                        <h4 className="font-medium">{t('settings.category_colors')}</h4>
                        <p className="text-sm text-muted-foreground">{t('settings.category_colors_desc')}</p>
                    </div>
                    <Palette className="h-5 w-5 text-muted-foreground" />
                </div>
            </section>

            <section className="space-y-4">
                <div className="flex items-center gap-3 mb-2">
                    <div className="w-10 h-10 rounded-2xl bg-sky-500/10 flex items-center justify-center">
                        <Download className="h-5 w-5 text-sky-500" />
                    </div>
                    <h3 className="text-lg font-semibold">{t('settings.data_management')}</h3>
                </div>

                <div className="bg-card rounded-2xl p-6 border shadow-sm space-y-4">
                    <div className="flex items-center justify-between">
                        <div className="space-y-0.5">
                            <h4 className="font-medium">{t('settings.export')}</h4>
                            <p className="text-sm text-muted-foreground">{t('settings.export_desc')}</p>
                        </div>
                    </div>
                    <Button
                        variant="outline"
                        onClick={handleExport}
                        className="w-full rounded-xl flex items-center gap-2 hover:bg-sky-500 hover:text-white transition-all"
                    >
                        <Download className="h-4 w-4" />
                        {t('settings.export_excel')}
                    </Button>
                </div>
            </section>

            <section className="space-y-4">
                <div className="flex items-center gap-3 mb-2">
                    <div className="w-10 h-10 rounded-2xl bg-emerald-500/10 flex items-center justify-center">
                        <Languages className="h-5 w-5 text-emerald-500" />
                    </div>
                    <h3 className="text-lg font-semibold">{t('settings.language')}</h3>
                </div>

                <div className="bg-card rounded-2xl p-6 border shadow-sm space-y-4">
                    <div className="flex items-center justify-between">
                        <div className="space-y-0.5">
                            <h4 className="font-medium">{t('settings.language')}</h4>
                            <p className="text-sm text-muted-foreground">{t('settings.language_desc')}</p>
                        </div>
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                        <Button
                            variant={i18n.language.startsWith('en') ? 'default' : 'outline'}
                            onClick={() => setLanguage('en')}
                            className="rounded-xl"
                        >
                            English
                        </Button>
                        <Button
                            variant={i18n.language.startsWith('th') ? 'default' : 'outline'}
                            onClick={() => setLanguage('th')}
                            className="rounded-xl"
                        >
                            ไทย
                        </Button>
                    </div>
                </div>
            </section>

            <section className="space-y-4">
                <div className="flex items-center gap-3 mb-2">
                    <div className="w-10 h-10 rounded-2xl bg-blue-500/10 flex items-center justify-center">
                        <LogOut className="h-5 w-5 text-blue-500" />
                    </div>
                    <h3 className="text-lg font-semibold">{t('settings.account')}</h3>
                </div>

                <div className="bg-card rounded-2xl p-6 border shadow-sm space-y-4">
                    <div className="space-y-1">
                        <h4 className="font-medium">{t('settings.logout')}</h4>
                        <p className="text-sm text-muted-foreground">{t('settings.logout_desc')}</p>
                    </div>
                    <Button
                        variant="outline"
                        onClick={() => logout()}
                        className="w-full rounded-xl flex items-center gap-2 hover:bg-destructive hover:text-destructive-foreground hover:border-destructive transition-all"
                    >
                        <LogOut className="h-4 w-4" />
                        {t('settings.logout')}
                    </Button>
                </div>
            </section>

            <section className="space-y-4 pt-4 border-t border-destructive/10">
                <div className="flex items-center gap-3 mb-2">
                    <div className="w-10 h-10 rounded-2xl bg-destructive/10 flex items-center justify-center">
                        <Shield className="h-5 w-5 text-destructive" />
                    </div>
                    <h3 className="text-lg font-bold text-destructive">{t('settings.danger_zone')}</h3>
                </div>

                <div className="bg-destructive/[0.03] dark:bg-destructive/[0.05] rounded-3xl p-6 border border-destructive/20 space-y-4">
                    <div className="space-y-1">
                        <h4 className="font-bold text-destructive">{t('settings.reset_data')}</h4>
                        <p className="text-sm text-muted-foreground/80 leading-relaxed">
                            {t('settings.reset_desc')}
                        </p>
                    </div>

                    <Button
                        variant="destructive"
                        onClick={handleReset}
                        className="w-full h-12 rounded-2xl font-bold shadow-lg shadow-destructive/20 active:scale-[0.98] transition-all"
                    >
                        <Trash2 className="h-5 w-5 mr-2" />
                        {t('settings.reset_data')}
                    </Button>
                </div>
            </section>
        </motion.div>
    );
};
