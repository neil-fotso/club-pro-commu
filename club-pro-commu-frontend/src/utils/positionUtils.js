// Définition des postes avec leurs descriptions
export const positions = {
  // Attaquants
  'BU': { name: 'Buteur', description: 'Attaquant central', icon: '⚽' },
  'AG': { name: 'Ailier Gauche', description: 'Attaquant côté gauche', icon: '⚽' },
  'AD': { name: 'Ailier Droit', description: 'Attaquant côté droit', icon: '⚽' },
  
  // Milieux
  'MOC': { name: 'Milieu Offensif Central', description: 'Milieu offensif', icon: '🎯' },
  'MG': { name: 'Milieu Gauche', description: 'Milieu côté gauche', icon: '🎯' },
  'MD': { name: 'Milieu Droit', description: 'Milieu côté droit', icon: '🎯' },
  'MC': { name: 'Milieu Central', description: 'Milieu central', icon: '🎯' },
  'MDC': { name: 'Milieu Défensif Central', description: 'Milieu défensif', icon: '🛡️' },
  
  // Défenseurs
  'DD': { name: 'Défenseur Droit', description: 'Défenseur côté droit', icon: '🛡️' },
  'DG': { name: 'Défenseur Gauche', description: 'Défenseur côté gauche', icon: '🛡️' },
  'DC': { name: 'Défenseur Central', description: 'Défenseur central', icon: '🛡️' },
  'DLD': { name: 'Défenseur Latéral Droit', description: 'Latéral droit', icon: '🛡️' },
  'DLG': { name: 'Défenseur Latéral Gauche', description: 'Latéral gauche', icon: '🛡️' }
};

// Fonction pour obtenir le nom complet d'un poste
export const getPositionName = (code) => {
  return positions[code] ? positions[code].name : code;
};

// Fonction pour obtenir la description d'un poste
export const getPositionDescription = (code) => {
  return positions[code] ? positions[code].description : '';
};

// Fonction pour obtenir l'icône d'un poste
export const getPositionIcon = (code) => {
  return positions[code] ? positions[code].icon : '⚽';
};

// Fonction pour obtenir l'affichage complet d'un poste
export const getPositionDisplay = (code) => {
  const position = positions[code];
  if (!position) return code;
  return `${position.icon} ${position.name}`;
};

// Groupes de postes pour l'organisation
export const positionGroups = {
  'Attaquants': ['BU', 'AG', 'AD'],
  'Milieux': ['MOC', 'MG', 'MD', 'MC', 'MDC'],
  'Défenseurs': ['DD', 'DG', 'DC', 'DLD', 'DLG']
};

// Liste complète des postes pour les formulaires
export const getAllPositions = () => {
  return Object.keys(positions).map(code => ({
    code,
    name: positions[code].name,
    description: positions[code].description,
    icon: positions[code].icon
  }));
}; 