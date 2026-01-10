import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useFinanceStore } from '@/stores/useFinanceStore';
import { Lock, ChevronLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';

export const PinLock: React.FC = () => {
    const { isLocked, unlock, pin } = useFinanceStore();
    const [enteredPin, setEnteredPin] = useState('');
    const [error, setError] = useState(false);

    // If there is no PIN set, we should probably not show the lock screen
    // or we treat it as "not set" and allow entry. 
    // The store's unlock handles null pin by returning true.

    useEffect(() => {
        if (!pin) {
            unlock('');
        }
    }, [pin, unlock]);

    const handleNumberClick = (num: string) => {
        if (enteredPin.length < 6) {
            const newPin = enteredPin + num;
            setEnteredPin(newPin);
            setError(false);

            if (newPin.length === 6) {
                const success = unlock(newPin);
                if (!success) {
                    setError(true);
                    setTimeout(() => {
                        setEnteredPin('');
                        setError(false);
                    }, 500);
                }
            }
        }
    };

    const handleDelete = () => {
        setEnteredPin(prev => prev.slice(0, -1));
        setError(false);
    };

    if (!isLocked) return null;

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] bg-background flex flex-col items-center justify-center p-6"
        >
            <div className="w-full max-w-xs space-y-8 text-center">
                <div className="space-y-2">
                    <div className="mx-auto w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mb-4">
                        <Lock className="h-6 w-6 text-primary" />
                    </div>
                    <h2 className="text-2xl font-bold">Enter PIN</h2>
                    <p className="text-muted-foreground">Please enter your 6-digit PIN to continue</p>
                </div>

                <div className="flex justify-center gap-4">
                    {[...Array(6)].map((_, i) => (
                        <div
                            key={i}
                            className={`w-3 h-3 rounded-full border-2 transition-all duration-200 ${i < enteredPin.length
                                ? 'bg-primary border-primary scale-110'
                                : 'border-muted-foreground/30'
                                } ${error ? 'bg-destructive border-destructive animate-shake' : ''}`}
                        />
                    ))}
                </div>

                <div className="grid grid-cols-3 gap-4">
                    {['1', '2', '3', '4', '5', '6', '7', '8', '9'].map(num => (
                        <Button
                            key={num}
                            variant="outline"
                            className="h-16 text-xl font-semibold rounded-2xl hover:bg-primary hover:text-primary-foreground transition-colors"
                            onClick={() => handleNumberClick(num)}
                        >
                            {num}
                        </Button>
                    ))}
                    <div />
                    <Button
                        variant="outline"
                        className="h-16 text-xl font-semibold rounded-2xl hover:bg-primary hover:text-primary-foreground transition-colors"
                        onClick={() => handleNumberClick('0')}
                    >
                        0
                    </Button>
                    <Button
                        variant="ghost"
                        className="h-16 rounded-2xl"
                        onClick={handleDelete}
                    >
                        <ChevronLeft className="h-6 w-6" />
                    </Button>
                </div>

                {error && (
                    <motion.p
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-destructive text-sm font-medium"
                    >
                        Incorrect PIN. Please try again.
                    </motion.p>
                )}
            </div>
        </motion.div>
    );
};
