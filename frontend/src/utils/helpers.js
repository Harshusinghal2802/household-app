export const formatCurrency = (amount, currency = 'PKR') => {
  const n = Number(amount) || 0;
  return `${currency} ${n.toLocaleString('en-PK', { minimumFractionDigits: 0, maximumFractionDigits: 2 })}`;
};

export const monthNames = ['January','February','March','April','May','June','July','August','September','October','November','December'];
export const shortMonths = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];

export const getCurrentMonthYear = () => {
  const d = new Date();
  return { month: d.getMonth() + 1, year: d.getFullYear() };
};

export const formatDate = (date, options = {}) => {
  return new Date(date).toLocaleDateString('en-PK', { day: 'numeric', month: 'short', year: 'numeric', ...options });
};

export const downloadCSV = (data, filename) => {
  if (!data.length) return;
  const keys = Object.keys(data[0]);
  const csv = [keys.join(','), ...data.map(row => keys.map(k => `"${row[k] ?? ''}"`).join(','))].join('\n');
  const blob = new Blob([csv], { type: 'text/csv' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a'); a.href = url; a.download = filename; a.click();
  URL.revokeObjectURL(url);
};

export const cylinderTypeLabels = {
  small: 'Small (6 kg)',
  medium: 'Medium (11 kg)',
  large: 'Large (16 kg)',
  commercial: 'Commercial (45 kg)'
};
