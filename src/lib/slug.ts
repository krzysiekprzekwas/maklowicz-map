import anyAscii from 'any-ascii';

export function toSlug(value: string): string {
  return anyAscii(value)
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)+/g, '');
}

export function countrySlug(countryName: string): string {
  return toSlug(countryName);
}

export function placeSlug(placeName: string): string {
  return toSlug(placeName);
}
