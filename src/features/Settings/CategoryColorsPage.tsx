import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { ArrowLeft, Palette } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useFinanceStore } from '@/stores/useFinanceStore';
import { INCOME_CATEGORIES, SPENDING_CATEGORIES, type CategoryMetadata } from '@/constants/categories';
import { CategoryColorModal } from './CategoryColorModal';

const CategoryColorRow: React.FC<{ category: CategoryMetadata }> = ({ category }) => {
    const { t } = useTranslation();
    const { categoryColors } = useFinanceStore();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const color = categoryColors[category.key] || category.defaultColor;

    return (
        <>
            <button
                onClick={() => setIsModalOpen(true)}
                className="w-full flex items-center justify-between p-4 rounded-2xl bg-card border shadow-sm active:scale-[0.98] transition-all"
            >
                <div className="flex items-center gap-4">
                    <div
                        className="w-12 h-12 rounded-2xl flex items-center justify-center transition-colors shadow-inner"
                        style={{
                            backgroundColor: color + '15',
                            color: color
                        }}
                    >
                        <category.icon className="h-6 w-6" />
                    </div>
                    <div className="text-left">
                        <span className="font-bold text-sm block">{t(`categories.${category.key}`)}</span>
                        <span className="text-[10px] text-muted-foreground uppercase tracking-wider">{color}</span>
                    </div>
                </div>

                <div className="flex items-center gap-2">
                    <div className="h-1.5 w-8 rounded-full" style={{ backgroundColor: color }} />
                </div>
            </button>
            <CategoryColorModal
                category={category}
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
            />
        </>
    );
};

export const CategoryColorsPage: React.FC = () => {
    const { t } = useTranslation();
    const navigate = useNavigate();

    return (
        <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-6 pb-20 p-4 max-w-2xl mx-auto"
        >
            <div className="flex items-center gap-4">
                <Button variant="ghost" size="icon" onClick={() => navigate(-1)} className="rounded-full">
                    <ArrowLeft className="h-5 w-5" />
                </Button>
                <div>
                    <h2 className="text-2xl font-bold tracking-tight">{t('settings.category_colors')}</h2>
                    <p className="text-sm text-muted-foreground">{t('settings.category_colors_desc')}</p>
                </div>
            </div>

            <div className="space-y-8">
                {/* Income Section */}
                <section className="space-y-4">
                    <div className="flex items-center gap-2 px-1">
                        <Palette className="h-4 w-4 text-primary" />
                        <h3 className="text-sm font-bold text-primary/70">
                            {t('settings.income_categories')}
                        </h3>
                    </div>
                    <div className="grid gap-3">
                        {INCOME_CATEGORIES.map(cat => (
                            <CategoryColorRow key={cat.key} category={cat} />
                        ))}
                    </div>
                </section>

                {/* Expense Section */}
                <section className="space-y-4">
                    <div className="flex items-center gap-2 px-1">
                        <Palette className="h-4 w-4 text-rose-500" />
                        <h3 className="text-sm font-bold text-rose-500/70">
                            {t('settings.expense_categories')}
                        </h3>
                    </div>
                    <div className="grid gap-3">
                        {SPENDING_CATEGORIES.map(cat => (
                            <CategoryColorRow key={cat.key} category={cat} />
                        ))}
                    </div>
                </section>
            </div>
        </motion.div>
    );
};

export default CategoryColorsPage;
