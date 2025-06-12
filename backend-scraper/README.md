# Backend Scraper

Un projet Node.js avec TypeScript pour le web scraping utilisant Puppeteer.

## 🚀 Installation

1. Assurez-vous d'avoir Node.js 18+ installé
2. Installez les dépendances :

```bash
npm install
```

## 📖 Scripts disponibles

- `npm run build` - Compile le TypeScript vers JavaScript
- `npm run start` - Exécute l'application compilée
- `npm run dev` - Exécute en mode développement avec ts-node
- `npm run watch` - Compile en mode watch (recompilation automatique)
- `npm run clean` - Nettoie le dossier dist

## 🏗️ Structure du projet

```
backend-scraper/
├── src/
│   └── index.ts          # Point d'entrée principal
├── dist/                 # Fichiers JavaScript compilés
├── node_modules/         # Dépendances
├── package.json          # Configuration du projet
├── tsconfig.json         # Configuration TypeScript
├── .gitignore           # Fichiers à ignorer par Git
└── README.md            # Ce fichier
```

## 🔧 Configuration TypeScript

Le projet utilise une configuration TypeScript moderne avec :

- **Target** : ES2022
- **Module** : CommonJS
- **Strict mode** activé
- **Source maps** pour le debugging
- **Déclarations de types** générées
- **Alias de chemin** configuré (`@/*` vers `src/*`)

## 📦 Dépendances

### Production
- `puppeteer` - Automatisation et scraping de navigateur

### Développement
- `typescript` - Compilateur TypeScript
- `@types/node` - Types pour Node.js
- `ts-node` - Exécution directe de TypeScript
- `rimraf` - Nettoyage cross-platform

## 🎯 Utilisation

### Mode développement
```bash
npm run dev
```

### Build et exécution
```bash
npm run build
npm start
```

## 📝 Fonctionnalités

Le projet TFT Meta Scraper offre :

### 🎯 **Générateur de données TFT (Recommandé)**
- Génère des compositions TFT réalistes avec des données structurées
- 5 compositions complètes avec champions, objets, et augmentations
- Format JSON optimisé pour les applications frontend
- Données basées sur TFT Set 14 (Patch 14.5)

### 🕷️ **Scraper MetaTFT.com (Expérimental)**
- Script Puppeteer pour scraper metatft.com
- Extraction automatique des compositions meta
- Fallback automatique vers les données de démo si le scraping échoue
- Support pour différents sélecteurs CSS

### 📊 **Structure des données**
Chaque composition inclut :
1. **Informations générales** : nom, tier, difficulté
2. **Champions principaux** : carries avec objets optimaux
3. **Champions support** : frontline et utilitaires
4. **Objets optimaux** : build recommandé par priorité
5. **Meilleures augmentations** : hextech augments par tier
6. **Statistiques** : playRate, winRate, placement moyen

## 🔒 Sécurité

Le projet inclut des arguments de sécurité pour Puppeteer :
- `--no-sandbox`
- `--disable-setuid-sandbox`

Ces options sont nécessaires dans certains environnements (comme Docker).

## 📄 Structure du fichier meta.json

Le fichier `public/meta.json` généré contient :

```json
{
  "version": "1.0.0",
  "lastUpdated": "2025-06-10T12:47:31.670Z",
  "totalCompositions": 5,
  "compositions": [
    {
      "id": "comp-1",
      "name": "True Damage Reroll",
      "tier": "S",
      "difficulty": 3,
      "mainCarries": [
        {
          "name": "Akali",
          "cost": 4,
          "traits": ["True Damage", "Sentinel"],
          "isCarry": true,
          "items": ["Infinity Edge", "Last Whisper", "Bloodthirster"]
        }
      ],
      "supportChampions": [...],
      "optimalItems": [...],
      "bestAugments": [...],
      "traits": ["True Damage", "Sentinel", "Invoker"],
      "playRate": 12.5,
      "winRate": 67.8,
      "avgPlacement": 3.2,
      "patchVersion": "14.5",
      "lastUpdated": "2025-06-10T12:47:31.669Z"
    }
  ],
  "metadata": {
    "scrapedFrom": "demo-data-generator",
    "scrapingDate": "2025-06-10T12:47:31.670Z",
    "patchVersion": "14.5"
  }
}
```

## 🤝 Contribution

1. Fork le projet
2. Créez une branche feature (`git checkout -b feature/AmazingFeature`)
3. Committez vos changements (`git commit -m 'Add some AmazingFeature'`)
4. Push vers la branche (`git push origin feature/AmazingFeature`)
5. Ouvrez une Pull Request

## 📄 Licence

Ce projet est sous licence ISC. 