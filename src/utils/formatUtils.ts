export const getCurrencySymbol = (currency: string) => {
    switch (currency) {
        case 'USD': return '$';
        case 'EUR': return '€';
        case 'GBP': return '£';
        case 'JPY': return '¥';
        case 'THB': return '฿';
        default: return currency;
    }
};

export const formatCurrency = (
    amount: number,
    currency: string,
    hideAmount: boolean = false,
    options: { showSymbol?: boolean; signDisplay?: 'auto' | 'always' | 'never' } = {}
) => {
    if (hideAmount) return '••••••';
    const { showSymbol = true, signDisplay = 'auto' } = options;
    const symbol = getCurrencySymbol(currency);

    const formattedAmount = Math.abs(amount).toLocaleString(undefined, {
        maximumFractionDigits: 0,
    });

    let sign = '';
    if (signDisplay === 'always') {
        sign = amount >= 0 ? '+' : '-';
    } else if (signDisplay === 'auto') {
        sign = amount < 0 ? '-' : '';
    }

    if (!showSymbol) return `${sign}${formattedAmount}`;
    return `${sign}${symbol}${formattedAmount}`;
};
