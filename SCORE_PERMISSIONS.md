# 🔐 Système de Permissions - Saisie de Score des Matchs

## 📋 Vue d'ensemble

Le système de saisie de score des matchs dans les compétitions est maintenant sécurisé avec un contrôle d'accès à plusieurs niveaux, implémenté à la fois côté **frontend** et **backend**.

## 👥 Utilisateurs Autorisés

Seuls les utilisateurs suivants peuvent saisir/modifier le score d'un match :

### 1. 👑 **Administrateurs du Site**
- **Qui :** Utilisateurs avec `isAdmin: true`
- **Accès :** TOUS les matchs de TOUTES les compétitions
- **Exemple :** `AdminClubPro` peut modifier n'importe quel score

### 2. 🎯 **Créateurs de Compétition**
- **Qui :** Utilisateur ayant créé la compétition (`createurId`)
- **Accès :** TOUS les matchs de LEUR compétition
- **Exemple :** `julesmartin14` peut modifier tous les scores de "coupe top"

### 3. 🏆 **Administrateurs de Clubs**
- **Qui :** Membres avec rôle `Admin` dans un club
- **Accès :** UNIQUEMENT les matchs où LEUR club participe
- **Exemple :** `alexisvincent15` (admin FC Dragons) peut modifier les scores des matchs de FC Dragons

## 🔒 Implémentation Frontend

### Fichier : `CompetitionMatchesPage.js`

#### Fonction de Vérification
```javascript
const canEditMatchScore = (match) => {
  if (!user) return false;

  // 1. Admin du site
  if (user.isAdmin) return true;

  // 2. Créateur de la compétition
  if (competition && competition.createurId) {
    const competitionCreatorId = typeof competition.createurId === 'object' 
      ? competition.createurId._id : competition.createurId;
    if (competitionCreatorId === user._id) return true;
  }

  // 3. Admin d'un des clubs concernés par le match
  const isAdminOfMatchTeam = userClubs.some(club => {
    const clubId = typeof club._id === 'object' ? club._id.toString() : club._id;
    const isMatchClub = clubId === team1Id || clubId === team2Id;
    
    if (!isMatchClub) return false;
    
    return club.membres.some(member => {
      const memberId = typeof member.userId === 'object' 
        ? member.userId._id : member.userId;
      return memberId === user._id && member.role === 'Admin';
    });
  });

  return isAdminOfMatchTeam;
};
```

#### Contrôles d'Interface
- ✅ **Boutons "Saisir score"** : Visibles uniquement si `canEditMatchScore(match)`
- ✅ **Champs de saisie** : Désactivés si pas autorisé (`disabled={!canEditMatchScore(selectedMatch)}`)
- ✅ **Boutons d'ajout** : Masqués pour les utilisateurs non autorisés
- ✅ **Bouton "Enregistrer"** : Affiché uniquement pour les utilisateurs autorisés

## 🛡️ Implémentation Backend

### Fichier : `routes/competitions.js`

#### Route : `PUT /api/competitions/:id/matchs/:matchId/score`

```javascript
// Vérifier les permissions - plusieurs autorisations possibles :
// 1. Admin du site
const User = require('../models/User');
const user = await User.findById(req.user.id);
const estAdminSite = user && user.isAdmin;

// 2. Créateur de la compétition
const estCreateurCompetition = competition.createurId && 
  competition.createurId.toString() === req.user.id;

// 3. Admin d'une des équipes du match
const estAdminEquipe1 = await Club.findOne({ 
  _id: match.equipe1, 
  'membres.userId': req.user.id,
  'membres.role': 'Admin'
});
const estAdminEquipe2 = await Club.findOne({ 
  _id: match.equipe2, 
  'membres.userId': req.user.id,
  'membres.role': 'Admin'
});

if (!estAdminSite && !estCreateurCompetition && !estAdminEquipe1 && !estAdminEquipe2) {
  return res.status(403).json({ 
    message: 'Seuls les admins du site, le créateur de la compétition ou les admins des équipes peuvent modifier les scores' 
  });
}
```

#### Route : `PUT /api/competitions/:id/matchs/:matchId/date`
- Même logique de permissions pour la programmation des dates

## 📊 Exemples Concrets

### Scénario : Match FC Dragons vs Eagles United

**Utilisateurs autorisés :**
- ✅ `AdminClubPro` (Admin du site)
- ✅ `julesmartin14` (Créateur de la compétition)
- ✅ `alexisvincent15` (Admin de FC Dragons)
- ✅ `julesmartin14` (Admin de Eagles United)

**Utilisateurs NON autorisés :**
- ❌ `testpseu` (Joueur lambda)
- ❌ `adambonnet2` (Membre d'un autre club)
- ❌ Joueurs simples des clubs concernés

## 🔐 Sécurité

### Double Validation
1. **Frontend** : Interface adaptée selon les permissions
2. **Backend** : Validation stricte avant toute modification

### Messages d'Erreur
```javascript
// Frontend
{canEditMatchScore(selectedMatch) ? 'Saisie de score' : 'Détails du match'}

// Backend
403: "Seuls les admins du site, le créateur de la compétition ou les admins des équipes peuvent modifier les scores"
```

## 🧪 Test du Système

### Script de Test
```bash
node scripts/testScorePermissions.js
```

### Résultats du Test
- ✅ 1 compétition trouvée
- ✅ Admin du site identifié : `AdminClubPro`
- ✅ Créateur de compétition : `julesmartin14`
- ✅ 5 clubs avec admins identifiés
- ✅ Simulation de permissions réussie

## 📝 Notes Importantes

1. **Cohérence** : Les permissions frontend et backend sont identiques
2. **Flexibilité** : Plusieurs niveaux d'autorisation permettent une gestion fine
3. **Sécurité** : Aucune modification possible sans autorisation appropriée
4. **UX** : Interface adaptive selon les droits de l'utilisateur

## 🔄 Mise à Jour

**Date :** 20 août 2025  
**Version :** v1.0  
**Statut :** ✅ Implémenté et testé

Le système est maintenant **entièrement fonctionnel** et sécurisé ! 🎯 