#!/bin/bash

echo "🚀 Déploiement de Club Pro Communauté"
echo "======================================"

# Vérifier que Git est configuré
if ! git rev-parse --git-dir > /dev/null 2>&1; then
    echo "❌ Erreur : Ce dossier n'est pas un repository Git"
    exit 1
fi

# Vérifier que les changements sont commités
if ! git diff-index --quiet HEAD --; then
    echo "⚠️  Attention : Vous avez des changements non commités"
    echo "Voulez-vous les commiter maintenant ? (y/n)"
    read -r response
    if [[ "$response" =~ ^[Yy]$ ]]; then
        git add .
        git commit -m "Déploiement automatique"
    else
        echo "❌ Déploiement annulé"
        exit 1
    fi
fi

echo "✅ Repository Git vérifié"

# Pousser vers GitHub
echo "📤 Poussage vers GitHub..."
git push origin main

echo "✅ Code poussé vers GitHub"
echo ""
echo "🎯 Prochaines étapes :"
echo "1. Déployez le backend sur Render :"
echo "   - Allez sur render.com"
echo "   - Créez un nouveau Web Service"
echo "   - Connectez votre repo GitHub"
echo "   - Sélectionnez le dossier club-pro-commu-backend"
echo ""
echo "2. Déployez le frontend sur Vercel :"
echo "   - Allez sur vercel.com"
echo "   - Importez votre repo GitHub"
echo "   - Sélectionnez le dossier club-pro-commu-frontend"
echo ""
echo "3. Configurez les variables d'environnement :"
echo "   - MONGO_URI pour le backend"
echo "   - REACT_APP_API_URL pour le frontend"
echo ""
echo "📖 Consultez DEPLOYMENT.md pour les instructions détaillées"
