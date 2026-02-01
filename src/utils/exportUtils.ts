import * as XLSX from 'xlsx';
import type { Income, Spending, Obligation, Asset } from '@/types';
import { format } from 'date-fns';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';

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

export const exportToPDF = (data: {
    incomes: Income[];
    spendings: Spending[];
    obligations: Obligation[];
    assets: Asset[];
}) => {
    const doc = new jsPDF();
    const dateStr = format(new Date(), 'yyyy-MM-dd');

    // Title
    doc.setFontSize(20);
    doc.text('Financial Report', 14, 22);
    doc.setFontSize(11);
    doc.text(`Generated on: ${dateStr}`, 14, 30);

    let finalY = 35;

    // 1. Incomes
    doc.setFontSize(14);
    doc.text('Incomes', 14, finalY + 10);
    autoTable(doc, {
        startY: finalY + 15,
        head: [['Name', 'Amount', 'Category', 'Frequency', 'Date']],
        body: data.incomes.map(i => [
            i.name,
            i.amount.toLocaleString(),
            i.category,
            i.frequency,
            format(new Date(i.date), 'yyyy-MM-dd')
        ]),
    });
    finalY = (doc as any).lastAutoTable.finalY;

    // 2. Spendings
    doc.addPage();
    doc.setFontSize(14);
    doc.text('Spendings', 14, 22);
    autoTable(doc, {
        startY: 27,
        head: [['Name', 'Amount', 'Category', 'Date']],
        body: data.spendings.map(s => [
            s.name,
            s.amount.toLocaleString(),
            s.category,
            format(new Date(s.date), 'yyyy-MM-dd')
        ]),
    });
    finalY = (doc as any).lastAutoTable.finalY;

    // 3. Obligations
    doc.addPage();
    doc.setFontSize(14);
    doc.text('Obligations', 14, 22);
    autoTable(doc, {
        startY: 27,
        head: [['Name', 'Type', 'Amount', 'Balance', 'Status']],
        body: data.obligations.map(o => [
            o.name,
            o.type,
            o.amount.toLocaleString(),
            o.balance?.toLocaleString() || '-',
            o.status
        ]),
    });
    finalY = (doc as any).lastAutoTable.finalY;

    // 4. Assets
    doc.addPage();
    doc.setFontSize(14);
    doc.text('Assets', 14, 22);
    autoTable(doc, {
        startY: 27,
        head: [['Name', 'Type', 'Quantity', 'Unit', 'Purchase Price']],
        body: data.assets.map(a => [
            a.name,
            a.type,
            a.quantity,
            a.unit,
            a.purchasePrice?.toLocaleString() || '-'
        ]),
    });

    const fileName = `Finance_Report_${dateStr}.pdf`;
    doc.save(fileName);
};
