import React from 'react';

const Avatar = ({ 
  src, 
  alt, 
  name, 
  size = 'md', 
  type = 'player', 
  className = '' 
}) => {
  // Tailles disponibles
  const sizeClasses = {
    xs: 'w-8 h-8 text-xs',
    sm: 'w-10 h-10 text-sm',
    md: 'w-12 h-12 text-base',
    lg: 'w-16 h-16 text-lg',
    xl: 'w-20 h-20 text-xl',
    '2xl': 'w-24 h-24 text-2xl',
    '3xl': 'w-32 h-32 text-3xl'
  };

  // Couleurs par défaut selon le type
  const getDefaultColors = (type, name) => {
    const colors = {
      player: [
        'bg-blue-500 text-white',
        'bg-green-500 text-white',
        'bg-purple-500 text-white',
        'bg-red-500 text-white',
        'bg-yellow-500 text-white',
        'bg-indigo-500 text-white',
        'bg-pink-500 text-white',
        'bg-teal-500 text-white'
      ],
      club: [
        'bg-gradient-to-br from-blue-600 to-blue-800 text-white',
        'bg-gradient-to-br from-red-600 to-red-800 text-white',
        'bg-gradient-to-br from-green-600 to-green-800 text-white',
        'bg-gradient-to-br from-purple-600 to-purple-800 text-white',
        'bg-gradient-to-br from-yellow-600 to-yellow-800 text-white',
        'bg-gradient-to-br from-indigo-600 to-indigo-800 text-white',
        'bg-gradient-to-br from-pink-600 to-pink-800 text-white',
        'bg-gradient-to-br from-teal-600 to-teal-800 text-white'
      ]
    };

    // Utiliser le nom pour générer une couleur cohérente
    const colorIndex = name ? name.charCodeAt(0) % colors[type].length : 0;
    return colors[type][colorIndex];
  };

  // Générer les initiales
  const getInitials = (name) => {
    if (!name) return '?';
    
    const words = name.trim().split(' ');
    if (words.length === 1) {
      return name.charAt(0).toUpperCase();
    }
    
    return words
      .slice(0, 2)
      .map(word => word.charAt(0).toUpperCase())
      .join('');
  };

  // Icônes par défaut selon le type
  const getDefaultIcon = (type) => {
    const icons = {
      player: 'fas fa-user',
      club: 'fas fa-shield-alt'
    };
    return icons[type] || 'fas fa-user';
  };

  const sizeClass = sizeClasses[size] || sizeClasses.md;
  const defaultColors = getDefaultColors(type, name);
  const initials = getInitials(name);
  const defaultIcon = getDefaultIcon(type);

  return (
    <div className={`relative inline-block ${className}`}>
      {src ? (
        // Image personnalisée
        <img
          src={src}
          alt={alt || name}
          className={`${sizeClass} rounded-full object-cover border-2 border-white shadow-md`}
          onError={(e) => {
            // En cas d'erreur de chargement, afficher l'avatar par défaut
            e.target.style.display = 'none';
            e.target.nextSibling.style.display = 'flex';
          }}
        />
      ) : null}
      
      {/* Avatar par défaut (toujours présent, masqué si image OK) */}
      <div
        className={`${sizeClass} rounded-full flex items-center justify-center font-bold shadow-md border-2 border-white ${
          src ? 'hidden' : 'flex'
        } ${defaultColors}`}
        style={{ display: src ? 'none' : 'flex' }}
      >
        {initials.length > 0 ? (
          <span>{initials}</span>
        ) : (
          <i className={defaultIcon}></i>
        )}
      </div>
    </div>
  );
};

export default Avatar; 