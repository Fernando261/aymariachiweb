export const groupRates = [
  { name: 'Trío', musicians: 3, price: 2300 },
  { name: 'Cuarteto', musicians: 4, price: 2800 },
  { name: 'Quinteto', musicians: 5, price: 3300 },
  { name: 'Sexteto', musicians: 6, price: 3800 },
] as const;

export const serenadeAndMass = { name: 'Serenata y misa', musicians: 5, price: 3800 } as const;
export const setMinutes = 50;
export const outsideMinimumMinutes = 120;
export const confirmationDeposit = 500;

const numberFormat = new Intl.NumberFormat('en-US');
export const formatMxn = (amount: number) => `$${numberFormat.format(amount)} MXN`;
