import { countries } from 'countries-list';

// Fonction pour obtenir le nom français d'un pays
export const getCountryName = (code) => {
  const country = countries[code];
  return country ? country.name : code;
};

// Fonction pour obtenir le drapeau d'un pays
export const getCountryFlag = (code) => {
  if (!code) return '🌍';
  
  const country = countries[code];
  if (!country) return '🌍';
  
  // Convertir le code pays en emoji drapeau
  const flag = code.toUpperCase().replace(/./g, char => 
    String.fromCodePoint(char.charCodeAt(0) + 127397)
  );
  return flag;
};

// Fonction pour obtenir le nom complet avec drapeau
export const getCountryDisplay = (code) => {
  const flag = getCountryFlag(code);
  const name = getCountryName(code);
  return `${flag} ${name}`;
};

// Liste des pays francophones prioritaires
export const francophoneCountries = [
  { code: 'FR', name: 'France', native: 'France' },
  { code: 'BE', name: 'Belgique', native: 'Belgique' },
  { code: 'CH', name: 'Suisse', native: 'Suisse' },
  { code: 'CA', name: 'Canada', native: 'Canada' },
  { code: 'LU', name: 'Luxembourg', native: 'Luxembourg' },
  { code: 'MC', name: 'Monaco', native: 'Monaco' }
];

// Liste complète des pays triée
export const getAllCountries = () => {
  const countriesList = Object.entries(countries)
    .map(([code, country]) => ({
      code,
      name: country.name,
      native: country.native
    }))
    .sort((a, b) => a.name.localeCompare(b.name, 'fr'));

  return [...francophoneCountries, ...countriesList.filter(c => 
    !francophoneCountries.some(fc => fc.code === c.code)
  )];
}; 