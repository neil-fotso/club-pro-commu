# 🚀 Guide de Déploiement - Club Pro Communauté

## 📋 Prérequis

- Compte GitHub
- Compte Vercel (gratuit)
- Compte Render (gratuit)

## 🎯 Plan de Déploiement

### **Étape 1 : Déployer le Backend (Render)**

1. **Créer un compte Render**
   - Allez sur [render.com](https://render.com)
   - Créez un compte gratuit

2. **Connecter votre repository GitHub**
   - Cliquez sur "New +" → "Web Service"
   - Connectez votre repo GitHub
   - Sélectionnez le dossier `club-pro-commu-backend`

3. **Configurer le service**
   - **Name** : `club-pro-commu-backend`
   - **Environment** : `Node`
   - **Build Command** : `npm install`
   - **Start Command** : `node server.js`

4. **Variables d'environnement**
   ```
   NODE_ENV=production
   MONGO_URI=mongodb+srv://votre_uri_mongodb
   JWT_SECRET=votre_secret_jwt_tres_long
   PORT=10000
   ```

5. **Déployer**
   - Cliquez sur "Create Web Service"
   - Attendez le déploiement (2-3 minutes)
   - Notez l'URL : `https://votre-app.onrender.com`

### **Étape 2 : Déployer le Frontend (Vercel)**

1. **Créer un compte Vercel**
   - Allez sur [vercel.com](https://vercel.com)
   - Connectez-vous avec GitHub

2. **Importer le projet**
   - Cliquez sur "New Project"
   - Sélectionnez votre repo GitHub
   - Sélectionnez le dossier `club-pro-commu-frontend`

3. **Configurer les variables d'environnement**
   ```
   REACT_APP_API_URL=https://votre-app.onrender.com/api
   ```

4. **Déployer**
   - Cliquez sur "Deploy"
   - Attendez le déploiement (1-2 minutes)
   - Votre app sera disponible sur : `https://votre-app.vercel.app`

## 🔧 Configuration MongoDB

### **Option 1 : MongoDB Atlas (Gratuit)**
1. Créez un compte sur [mongodb.com](https://mongodb.com)
2. Créez un cluster gratuit
3. Obtenez votre URI de connexion
4. Ajoutez-la dans les variables d'environnement Render

### **Option 2 : Render Database**
1. Dans Render, créez une "PostgreSQL Database"
2. Utilisez l'URI fournie par Render

## 🌐 URLs Finales

- **Frontend** : `https://votre-app.vercel.app`
- **Backend** : `https://votre-app.onrender.com`
- **API** : `https://votre-app.onrender.com/api`

## 🔒 Sécurité

1. **JWT Secret** : Utilisez un secret très long et complexe
2. **MongoDB** : Activez l'authentification
3. **CORS** : Configurez les domaines autorisés

## 📱 Test de l'Application

1. Visitez votre URL Vercel
2. Testez l'inscription/connexion
3. Testez la création de clubs
4. Vérifiez que tout fonctionne

## 🆘 Dépannage

### **Erreurs courantes :**
- **CORS** : Vérifiez les domaines autorisés
- **MongoDB** : Vérifiez l'URI de connexion
- **Build errors** : Vérifiez les dépendances

### **Logs :**
- **Vercel** : Dashboard → Project → Functions
- **Render** : Dashboard → Service → Logs

## 🎉 Félicitations !

Votre application est maintenant en ligne et accessible à tous ! 🚀 