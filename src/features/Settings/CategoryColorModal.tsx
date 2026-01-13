import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Plus, Check } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useFinanceStore } from '@/stores/useFinanceStore';
import { PRESET_COLORS, type CategoryMetadata } from '@/constants/categories';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';

interface CategoryColorModalProps {
    category: CategoryMetadata;
    isOpen: boolean;
    onClose: () => void;
}

export const CategoryColorModal: React.FC<CategoryColorModalProps> = ({ category, isOpen, onClose }) => {
    const { t } = useTranslation();
    const { categoryColors, setCategoryColor, userCustomColors, addUserCustomColor } = useFinanceStore();
    const currentColor = categoryColors[category.key] || category.defaultColor;

    const handleColorSelect = (color: string) => {
        setCategoryColor(category.key, color);
        onClose();
    };

    const handleAddCustomColor = (e: React.ChangeEvent<HTMLInputElement>) => {
        const newColor = e.target.value;
        addUserCustomColor(newColor);
        setCategoryColor(category.key, newColor);
    };

    const allAvailableColors = [...PRESET_COLORS, ...userCustomColors];

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100]"
                    />
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.9, y: 20 }}
                        className="fixed inset-x-4 top-[15%] md:left-1/2 md:-translate-x-1/2 md:max-w-md z-[101]"
                    >
                        <Card className="rounded-3xl border-none shadow-2xl overflow-hidden">
                            <div className="p-6 space-y-6">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <div
                                            className="w-12 h-12 rounded-2xl flex items-center justify-center transition-colors shadow-inner"
                                            style={{
                                                backgroundColor: currentColor + '15',
                                                color: currentColor
                                            }}
                                        >
                                            <category.icon className="h-6 w-6" />
                                        </div>
                                        <div>
                                            <h3 className="font-bold text-lg">{t(`categories.${category.key}`)}</h3>
                                            <p className="text-xs text-muted-foreground">{t('settings.category_colors_desc')}</p>
                                        </div>
                                    </div>
                                    <Button variant="ghost" size="icon" onClick={onClose} className="rounded-full">
                                        <X className="h-5 w-5" />
                                    </Button>
                                </div>

                                <div className="grid grid-cols-6 gap-3">
                                    {allAvailableColors.map((color) => (
                                        <button
                                            key={color}
                                            onClick={() => handleColorSelect(color)}
                                            className={`aspect-square rounded-full border-4 transition-all active:scale-95 flex items-center justify-center ${currentColor === color
                                                ? 'border-primary ring-2 ring-primary/20 scale-110'
                                                : 'border-white dark:border-slate-800'
                                                }`}
                                            style={{ backgroundColor: color }}
                                        >
                                            {currentColor === color && <Check className="h-4 w-4 text-white drop-shadow-md" />}
                                        </button>
                                    ))}

                                    <div className="relative aspect-square">
                                        <Button
                                            variant="outline"
                                            size="icon"
                                            className="w-full h-full rounded-full border-dashed border-2 hover:border-primary transition-colors"
                                        >
                                            <Plus className="h-5 w-5" />
                                        </Button>
                                        <input
                                            type="color"
                                            onChange={handleAddCustomColor}
                                            className="absolute inset-0 opacity-0 cursor-pointer"
                                            title={t('common.add')}
                                        />
                                    </div>
                                </div>

                                <Button
                                    className="w-full h-12 rounded-2xl font-bold shadow-lg shadow-primary/20"
                                    onClick={onClose}
                                >
                                    {t('common.done')}
                                </Button>
                            </div>
                        </Card>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
};
