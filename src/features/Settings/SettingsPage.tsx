import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useFinanceStore } from '@/stores/useFinanceStore';
import { Shield, Trash2, ArrowLeft, Key, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { useNavigate } from 'react-router-dom';

export const SettingsPage: React.FC = () => {
    const { pin, setPin, resetData } = useFinanceStore();
    const [newPin, setNewPin] = useState('');
    const [confirmPin, setConfirmPin] = useState('');
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const navigate = useNavigate();

    const handleSetPin = (e: React.FormEvent) => {
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

        setPin(newPin);
        setSuccess('PIN changed successfully!');
        setNewPin('');
        setConfirmPin('');
    };

    const handleReset = () => {
        resetData();
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
                    <h2 className="text-2xl font-bold tracking-tight">Settings</h2>
                    <p className="text-sm text-muted-foreground">Manage your profile and security</p>
                </div>
            </div>

            <section className="space-y-4">
                <div className="flex items-center gap-2 mb-2">
                    <Shield className="h-5 w-5 text-primary" />
                    <h3 className="text-lg font-semibold">Security</h3>
                </div>

                <div className="bg-card rounded-2xl p-6 border shadow-sm space-y-4">
                    <div className="flex items-center justify-between">
                        <div className="space-y-0.5">
                            <h4 className="font-medium">Profile PIN</h4>
                            <p className="text-sm text-muted-foreground">
                                {pin ? 'Change your current 6-digit PIN' : 'Set a 6-digit PIN to secure your data'}
                            </p>
                        </div>
                        <Key className="h-5 w-5 text-muted-foreground" />
                    </div>

                    <form onSubmit={handleSetPin} className="space-y-4 pt-2">
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <label className="text-sm font-medium">New PIN</label>
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
                                <label className="text-sm font-medium">Confirm PIN</label>
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

                        <Button type="submit" className="w-full rounded-xl">
                            {pin ? 'Update PIN' : 'Set PIN'}
                        </Button>
                    </form>
                </div>
            </section>

            <section className="space-y-4">
                <div className="flex items-center gap-2 mb-2">
                    <Trash2 className="h-5 w-5 text-destructive" />
                    <h3 className="text-lg font-semibold text-destructive">Danger Zone</h3>
                </div>

                <div className="bg-destructive/5 rounded-2xl p-6 border border-destructive/20 shadow-sm space-y-4">
                    <div className="space-y-0.5">
                        <h4 className="font-medium text-destructive">Reset All Data</h4>
                        <p className="text-sm text-destructive/70">
                            This will permanently delete all your incomes, expenses, and obligations. This action cannot be undone.
                        </p>
                    </div>

                    <Dialog>
                        <DialogTrigger asChild>
                            <Button variant="destructive" className="w-full rounded-xl">
                                Reset Everything
                            </Button>
                        </DialogTrigger>
                        <DialogContent className="sm:max-w-[425px] rounded-3xl">
                            <DialogHeader>
                                <DialogTitle className="flex items-center gap-2">
                                    <AlertTriangle className="h-5 w-5 text-destructive" />
                                    Confirm Total Reset
                                </DialogTitle>
                                <DialogDescription className="pt-2">
                                    Are you absolutely sure you want to reset all your data? This will clear everything and take you back to the home page.
                                </DialogDescription>
                            </DialogHeader>
                            <DialogFooter className="gap-2 sm:gap-0">
                                <Button variant="outline" onClick={() => { }} className="rounded-xl">Cancel</Button>
                                <Button variant="destructive" onClick={handleReset} className="rounded-xl">Yes, Reset Everything</Button>
                            </DialogFooter>
                        </DialogContent>
                    </Dialog>
                </div>
            </section>
        </motion.div>
    );
};
