
// Format numbers to currency string
export const formatCurrency = (value: number, currency: 'USD' | 'CAD' = 'USD'): string => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(value);
};

// Format large numbers with appropriate suffixes
export const formatLargeNumber = (value: number): string => {
  if (value >= 1e9) {
    return `${(value / 1e9).toFixed(2)}B`;
  } else if (value >= 1e6) {
    return `${(value / 1e6).toFixed(2)}M`;
  } else if (value >= 1e3) {
    return `${(value / 1e3).toFixed(2)}K`;
  } else {
    return value.toFixed(2);
  }
};

// Format percentage with sign and specified decimals
export const formatPercentage = (value: number, decimals = 2): string => {
  if (value === 0) return '0.00%';
  
  const formatted = value.toFixed(decimals);
  return `${value > 0 ? '+' : ''}${formatted}%`;
};

// Format coin quantity based on value
export const formatCoinQuantity = (quantity: number, symbol: string): string => {
  if (quantity >= 1000) {
    return `${quantity.toLocaleString('en-US')} ${symbol.toUpperCase()}`;
  } else if (quantity < 0.001) {
    return `${quantity.toFixed(8)} ${symbol.toUpperCase()}`;
  } else if (quantity < 1) {
    return `${quantity.toFixed(4)} ${symbol.toUpperCase()}`;
  } else {
    return `${quantity.toLocaleString('en-US', { maximumFractionDigits: 2 })} ${symbol.toUpperCase()}`;
  }
};

// Format date to locale string
export const formatDate = (date: Date): string => {
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
};

// Convert USD to CAD
export const convertToCAD = (usdValue: number): number => {
  // Using a fixed exchange rate of 1 USD = 1.36 CAD for simplicity
  // In a real app, this would come from an API
  const exchangeRate = 1.36;
  return usdValue * exchangeRate;
};
