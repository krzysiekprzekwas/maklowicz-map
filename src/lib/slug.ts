export function toSlug(value: string): string {
  return value
    .toLowerCase()
    .normalize('NFD')
    .replace(/\p{Diacritic}+/gu, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)+/g, '');
}

export function countrySlug(countryName: string): string {
  return toSlug(countryName);
}

export function placeSlug(placeName: string): string {
  return toSlug(placeName);
}



