import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useFinanceStore } from '@/stores/useFinanceStore';
import { Shield, Trash2, ArrowLeft, Key, AlertTriangle, Moon, LogOut, Languages } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { ThemeToggle } from '@/components/ThemeToggle';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { useNavigate } from 'react-router-dom';

export const SettingsPage: React.FC = () => {
    const { t, i18n } = useTranslation();
    const { pin, setPin, resetData, logout } = useFinanceStore();
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
            setError('PIN must be 6 digits and contain only numbers.');
            return;
        }

        if (newPin !== confirmPin) {
            setError('PINs do not match.');
            return;
        }

        setIsUpdating(true);
        try {
            await setPin(newPin);
            setSuccess('PIN changed successfully!');
            setNewPin('');
            setConfirmPin('');
        } catch (err: any) {
            setError('Failed to update PIN. Please try again.');
        } finally {
            setIsUpdating(false);
        }
    };

    const handleReset = async () => {
        await resetData();
        navigate('/');
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="space-y-8 pb-20"
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
                <div className="flex items-center gap-2 mb-2">
                    <Languages className="h-5 w-5 text-primary" />
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
                            onClick={() => i18n.changeLanguage('en')}
                            className="rounded-xl"
                        >
                            English
                        </Button>
                        <Button
                            variant={i18n.language.startsWith('th') ? 'default' : 'outline'}
                            onClick={() => i18n.changeLanguage('th')}
                            className="rounded-xl"
                        >
                            ไทย
                        </Button>
                    </div>
                </div>
            </section>

            <section className="space-y-4">
                <div className="flex items-center gap-2 mb-2">
                    <Moon className="h-5 w-5 text-primary" />
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
                <div className="flex items-center gap-2 mb-2">
                    <Shield className="h-5 w-5 text-primary" />
                    <h3 className="text-lg font-semibold">{t('settings.security')}</h3>
                </div>

                <div className="bg-card rounded-2xl p-6 border shadow-sm space-y-4">
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
                                    placeholder="Enter 6 digits"
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
                                    placeholder="Confirm digits"
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
                </div>
            </section>

            <section className="space-y-4">
                <div className="flex items-center gap-2 mb-2">
                    <LogOut className="h-5 w-5 text-muted-foreground" />
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

            <section className="space-y-4">
                <div className="flex items-center gap-2 mb-2">
                    <Trash2 className="h-5 w-5 text-destructive" />
                    <h3 className="text-lg font-semibold text-destructive">{t('settings.danger_zone')}</h3>
                </div>

                <div className="bg-destructive/5 rounded-2xl p-6 border border-destructive/20 shadow-sm space-y-4">
                    <div className="space-y-0.5">
                        <h4 className="font-medium text-destructive">{t('settings.reset_data')}</h4>
                        <p className="text-sm text-destructive/70">
                            {t('settings.reset_desc')}
                        </p>
                    </div>

                    <Dialog>
                        <DialogTrigger asChild>
                            <Button variant="destructive" className="w-full rounded-xl">
                                {t('settings.reset_btn')}
                            </Button>
                        </DialogTrigger>
                        <DialogContent className="sm:max-w-[425px] rounded-3xl">
                            <DialogHeader>
                                <DialogTitle className="flex items-center gap-2">
                                    <AlertTriangle className="h-5 w-5 text-destructive" />
                                    {t('settings.confirm_reset')}
                                </DialogTitle>
                                <DialogDescription className="pt-2">
                                    {t('settings.reset_warning')}
                                </DialogDescription>
                            </DialogHeader>
                            <DialogFooter className="gap-2 sm:gap-0">
                                <Button variant="outline" onClick={() => { }} className="rounded-xl">{t('common.cancel')}</Button>
                                <Button variant="destructive" onClick={handleReset} className="rounded-xl">{t('settings.yes_reset')}</Button>
                            </DialogFooter>
                        </DialogContent>
                    </Dialog>
                </div>
            </section>
        </motion.div>
    );
};
