import type { Income, Spending, Obligation } from "@/types";
import { v4 as uuidv4 } from 'uuid';
import { format } from "date-fns";

export const generateDemoData = () => {
    const incomes: Income[] = [];
    const spendings: Spending[] = [];
    const obligations: Obligation[] = [];

    const today = new Date();
    // Simulate data for the full current year (e.g. 2026)
    const currentYear = today.getFullYear();

    // 1. Obligations
    const iphoneId = uuidv4();
    const carLoanId = uuidv4();

    obligations.push({
        id: iphoneId,
        name: "iPhone 16 Pro",
        type: "installment",
        amount: 4200,
        totalMonths: 10,
        paidMonths: 2,
        balance: 4200 * 8, // Remaining
        status: "active",
        startDate: format(new Date(currentYear, 0, 15), 'yyyy-MM-dd')
    });

    obligations.push({
        id: carLoanId,
        name: "Tesla Model 3",
        type: "car-loan",
        amount: 14500,
        balance: 850000,
        interestRate: 2.5,
        status: "active",
        startDate: format(new Date(currentYear - 1, 5, 1), 'yyyy-MM-dd')
    });

    // Helper
    const addInc = (name: string, amount: number, date: Date, category: string = 'Salary') => {
        incomes.push({
            id: uuidv4(),
            name,
            amount,
            category,
            frequency: 'monthly',
            date: format(date, 'yyyy-MM-dd')
        });
    };

    const addExp = (name: string, amount: number, date: Date, category: string = 'Food') => {
        spendings.push({
            id: uuidv4(),
            name,
            amount,
            category,
            kind: 'normal',
            date: format(date, 'yyyy-MM-dd')
        });
    };

    // Loop through 12 months of the current year
    for (let month = 0; month < 12; month++) {
        // --- Income ---
        // Salary on the 28th
        addInc('Monthly Salary', 65000, new Date(currentYear, month, 28));

        // Random Freelance (every 3rd month)
        if (month % 3 === 0) {
            addInc('Freelance Project', 12000, new Date(currentYear, month, 15), 'Freelance');
        }

        // --- Recurring Expenses ---
        addExp('Rent', 15000, new Date(currentYear, month, 1), 'Housing');
        addExp('Internet & Utility', 3500, new Date(currentYear, month, 5), 'Utilities');
        addExp('Gym', 1800, new Date(currentYear, month, 2), 'Health');
        addExp('Netflix / Spotify', 590, new Date(currentYear, month, 3), 'Entertainment');

        // --- Obligation Payments ---
        // iPhone (10 months starting Jan)
        if (month < 10) {
            spendings.push({
                id: uuidv4(),
                name: "Pay iPhone",
                amount: 4200,
                category: "Obligation Payment",
                kind: "obligation-payment",
                linkedObligationId: iphoneId,
                date: format(new Date(currentYear, month, 5), 'yyyy-MM-dd')
            });
        }

        // Car Loan (Every month)
        spendings.push({
            id: uuidv4(),
            name: "Car Loan Payment",
            amount: 14500,
            category: "Obligation Payment",
            kind: "obligation-payment",
            linkedObligationId: carLoanId,
            date: format(new Date(currentYear, month, 10), 'yyyy-MM-dd')
        });

        // --- Variable Expenses (Randomized) ---
        // Food: ~20 times a month
        for (let i = 0; i < 20; i++) {
            const day = Math.floor(Math.random() * 27) + 1; // 1-28
            const cost = Math.floor(Math.random() * 500) + 100; // 100-600 baht
            addExp('Lunch / Dinner', cost, new Date(currentYear, month, day), 'Food');
        }

        // Shopping: Random weekends
        const randomShopping = Math.floor(Math.random() * 3000) + 500;
        addExp('Shopping', randomShopping, new Date(currentYear, month, 20), 'Shopping');
    }

    return { incomes, spendings, obligations };
};
