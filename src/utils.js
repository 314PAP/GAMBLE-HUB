export function formatLargeNumber(num) {
  if (num === null || num === undefined) return '0';
  const val = Number(num);
  if (isNaN(val)) return '0';

  const absVal = Math.abs(val);
  const sign = val < 0 ? '-' : '';

  const suffixes = [
    { value: 1e27, symbol: 'Qd' },  // Kvadriliarda
    { value: 1e24, symbol: 'Q' },   // Kvadrilion
    { value: 1e21, symbol: 'Td' },  // Triliarda
    { value: 1e18, symbol: 'T' },   // Trilion
    { value: 1e15, symbol: 'Bld' }, // Biliarda
    { value: 1e12, symbol: 'B' },   // Bilion
    { value: 1e9, symbol: 'Mld' },  // Miliarda
    { value: 1e6, symbol: 'M' },    // Milion
    { value: 1e3, symbol: 'K' }     // Tisíc
  ];

  for (let i = 0; i < suffixes.length; i++) {
    if (absVal >= suffixes[i].value) {
      return sign + (absVal / suffixes[i].value).toFixed(3).replace(/\.?0+$/, '') + ' ' + suffixes[i].symbol;
    }
  }

  return val.toString();
}
