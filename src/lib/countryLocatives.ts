export const countryLocatives: Record<string, string> = {
  Polska: 'Polsce',
  Grecja: 'Grecji',
  Czarnogóra: 'Czarnogórze',
  Tajlandia: 'Tajlandii',
  Meksyk: 'Meksyku',
  Czechy: 'Czechach',
  Francja: 'Francji',
  Kolumbia: 'Kolumbii',
  Litwa: 'Litwie',
  Luksemburg: 'Luksemburgu',
  Jordan: 'Jordanii',
  Niemcy: 'Niemczech',
  Włochy: 'Włoszech',
  Austria: 'Austrii',
};

export function toLocative(countryName: string): string {
  return countryLocatives[countryName] || countryName;
}


