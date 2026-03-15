export const countryLocatives: Record<string, string> = {
  Albania: 'Albanii',
  Austria: 'Austrii',
  Belgia: 'Belgii',
  'Bośnia i Hercegowina': 'Bośni i Hercegowinie',
  Chorwacja: 'Chorwacji',
  Czechy: 'Czechach',
  Czarnogóra: 'Czarnogórze',
  Francja: 'Francji',
  Grecja: 'Grecji',
  Hiszpania: 'Hiszpanii',
  Irlandia: 'Irlandii',
  Jordania: 'Jordanii',
  Kolumbia: 'Kolumbii',
  Litwa: 'Litwie',
  Luksemburg: 'Luksemburgu',
  Mauritius: 'Mauritiusie',
  Meksyk: 'Meksyku',
  Niemcy: 'Niemczech',
  Polska: 'Polsce',
  Portugalia: 'Portugali',
  Słowacja: 'Słowacji',
  Słowenia: 'Słowenii',
  Szwecja: 'Szwecji',
  Tajlandia: 'Tajlandii',
  Tunezja: 'Tunezji',
  Vietnam: 'Wietnamie',
  Węgry: 'Węgrzech',
  Włochy: 'Włoszech',
  'Zjednoczone Emiraty Arabskie': 'Zjednoczonych Emiratach Arabskich',
};

export function toLocative(countryName: string): string {
  return countryLocatives[countryName] || countryName;
}


