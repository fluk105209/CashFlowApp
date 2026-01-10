import React, { useState } from 'react';
import { useFinanceStore } from '@/stores/useFinanceStore';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { Lock, User, ShieldCheck } from 'lucide-react';
import { motion } from 'framer-motion';

export function LoginPage() {
    const [userId, setUserId] = useState('');
    const [pin, setPin] = useState('');
    const { login, isLoading, error } = useFinanceStore();

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        if (userId && pin.length === 6) {
            await login(userId, pin);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-indigo-50 via-white to-sky-50 dark:from-slate-900 dark:via-slate-900 dark:to-slate-800">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
            >
                <Card className="w-full max-w-md border-none shadow-2xl bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl">
                    <CardHeader className="text-center space-y-1">
                        <div className="mx-auto w-12 h-12 bg-indigo-600 rounded-xl flex items-center justify-center mb-4 shadow-lg shadow-indigo-200 dark:shadow-none">
                            <ShieldCheck className="text-white h-6 w-6" />
                        </div>
                        <CardTitle className="text-2xl font-bold tracking-tight">Cloud Sync Login</CardTitle>
                        <CardDescription>
                            Enter your User ID and 6-digit PIN to access your data on any device.
                        </CardDescription>
                    </CardHeader>
                    <form onSubmit={handleLogin}>
                        <CardContent className="space-y-4 pt-4">
                            {error && (
                                <div className="bg-destructive/10 text-destructive text-sm p-3 rounded-lg border border-destructive/20 animate-pulse">
                                    {error}
                                </div>
                            )}
                            <div className="space-y-2">
                                <Label htmlFor="userId" className="text-sm font-medium">User ID</Label>
                                <div className="relative">
                                    <User className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                                    <Input
                                        id="userId"
                                        placeholder="Enter your User ID"
                                        className="pl-10 h-11"
                                        value={userId}
                                        onChange={(e) => setUserId(e.target.value)}
                                        required
                                        disabled={isLoading}
                                    />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="pin" className="text-sm font-medium">6-Digit PIN</Label>
                                <div className="relative">
                                    <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                                    <Input
                                        id="pin"
                                        type="password"
                                        placeholder="••••••"
                                        maxLength={6}
                                        className="pl-10 h-11 tracking-[0.5em] font-mono"
                                        value={pin}
                                        onChange={(e) => setPin(e.target.value.replace(/[^0-9]/g, ''))}
                                        required
                                        disabled={isLoading}
                                    />
                                </div>
                            </div>
                        </CardContent>
                        <CardFooter className="flex flex-col gap-4 pb-8">
                            <Button
                                type="submit"
                                className="w-full h-11 text-base font-semibold bg-indigo-600 hover:bg-indigo-700 transition-all duration-300 shadow-lg shadow-indigo-100 dark:shadow-none"
                                disabled={isLoading || pin.length !== 6 || !userId}
                            >
                                {isLoading ? "Synchronizing..." : "Login / Register"}
                            </Button>
                            <p className="text-xs text-center text-muted-foreground px-4">
                                If the User ID doesn't exist, a new profile will be created automatically.
                            </p>
                        </CardFooter>
                    </form>
                </Card>
            </motion.div>
        </div>
    );
}
