export const countryLocatives: Record<string, string> = {
  Polska: 'Polsce',
  Tajlandia: 'Tajlandii',
  Niemcy: 'Niemczech',
  Włochy: 'Włoszech',
};

export function toLocative(countryName: string): string {
  return countryLocatives[countryName] || countryName;
}


