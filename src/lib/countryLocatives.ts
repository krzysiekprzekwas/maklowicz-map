export const countryLocatives: Record<string, string> = {
  Polska: 'Polsce',
  Grecja: 'Grecji',
  Czarnogóra: 'Czarnogórze',
  Tajlandia: 'Tajlandii',
  Niemcy: 'Niemczech',
  Włochy: 'Włoszech',
  Austria: 'Austrii',
};

export function toLocative(countryName: string): string {
  return countryLocatives[countryName] || countryName;
}


