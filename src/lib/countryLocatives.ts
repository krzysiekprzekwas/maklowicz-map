export const countryLocatives: Record<string, string> = {
  Polska: 'Polsce',
  Tajlandia: 'Tajlandii',
  Niemcy: 'Niemczech',
  Włochy: 'Włoszech',
  Austria: 'Austrii',
};

export function toLocative(countryName: string): string {
  return countryLocatives[countryName] || countryName;
}


