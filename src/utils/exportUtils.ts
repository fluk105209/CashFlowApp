import * as XLSX from 'xlsx';
import type { Income, Spending, Obligation, Asset } from '@/types';
import { format } from 'date-fns';

export const exportToExcel = (data: {
    incomes: Income[];
    spendings: Spending[];
    obligations: Obligation[];
    assets: Asset[];
}) => {
    const workbook = XLSX.utils.book_new();

    // 1. Incomes Sheet
    const incomeRows = data.incomes.map(item => ({
        'Name': item.name,
        'Amount': item.amount,
        'Category': item.category,
        'Frequency': item.frequency,
        'Date': format(new Date(item.date), 'yyyy-MM-dd'),
    }));
    const incomeSheet = XLSX.utils.json_to_sheet(incomeRows);
    XLSX.utils.book_append_sheet(workbook, incomeSheet, 'Incomes');

    // 2. Spendings Sheet
    const spendingRows = data.spendings.map(item => ({
        'Name': item.name,
        'Amount': item.amount,
        'Category': item.category,
        'Kind': item.kind,
        'Date': format(new Date(item.date), 'yyyy-MM-dd'),
    }));
    const spendingSheet = XLSX.utils.json_to_sheet(spendingRows);
    XLSX.utils.book_append_sheet(workbook, spendingSheet, 'Spendings');

    // 3. Obligations Sheet
    const obligationRows = data.obligations.map(item => ({
        'Name': item.name,
        'Type': item.type,
        'Monthly Payment': item.amount,
        'Balance': item.balance || 0,
        'Credit Limit': item.creditLimit || '-',
        'Interest Rate (%)': item.interestRate || '-',
        'Total Months': item.totalMonths || '-',
        'Paid Months': item.paidMonths || '-',
        'Start Date': item.startDate ? format(new Date(item.startDate), 'yyyy-MM-dd') : '-',
        'Status': item.status,
    }));
    const obligationSheet = XLSX.utils.json_to_sheet(obligationRows);
    XLSX.utils.book_append_sheet(workbook, obligationSheet, 'Obligations');

    // 4. Assets Sheet
    const assetRows = data.assets.map(item => ({
        'Name': item.name,
        'Type': item.type,
        'Quantity': item.quantity,
        'Unit': item.unit,
        'Purchase Price (THB)': item.purchasePrice || '-',
    }));
    const assetSheet = XLSX.utils.json_to_sheet(assetRows);
    XLSX.utils.book_append_sheet(workbook, assetSheet, 'Assets');

    // Generate and Download
    const fileName = `Finance_Data_${format(new Date(), 'yyyy-MM-dd')}.xlsx`;
    XLSX.writeFile(workbook, fileName);
};
