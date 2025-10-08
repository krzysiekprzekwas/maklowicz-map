export const countryLocatives: Record<string, string> = {
  Albania: 'Albanii',
  Austria: 'Austrii',
  Czechy: 'Czechach',
  Czarnogóra: 'Czarnogórze',
  Francja: 'Francji',
  Grecja: 'Grecji',
  Irlandia: 'Irlandii',
  Jordan: 'Jordanii',
  Kolumbia: 'Kolumbii',
  Litwa: 'Litwie',
  Luksemburg: 'Luksemburgu',
  Meksyk: 'Meksyku',
  Niemcy: 'Niemczech',
  Polska: 'Polsce',
  Portugalia: 'Portugali',
  Słowacja: 'Słowacji',
  Słowenia: 'Słowenii',
  Szwecja: 'Szwecji',
  Tajlandia: 'Tajlandii',
  Tunezja: 'Tunezji',
  Węgry: 'Węgrzech',
  Włochy: 'Włoszech',
};

export function toLocative(countryName: string): string {
  return countryLocatives[countryName] || countryName;
}


