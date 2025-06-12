# 🤖 GitHub Actions - TFT Meta Scraper

Ce dossier contient les workflows GitHub Actions pour automatiser le scraping des compositions TFT.

## 📋 Workflows disponibles

### 🕷️ `scrape.yml` - TFT Meta Scraper

Automatise la collecte et la mise à jour des données meta TFT.

**🕐 Déclencheurs :**
- **Automatique** : Toutes les 12 heures (00:00 et 12:00 UTC)
- **Manuel** : Via l'interface GitHub Actions (onglet "Actions")
- **Push** : Sur les modifications du code backend-scraper

**⚙️ Étapes du workflow :**
1. 🛒 **Checkout** du repository
2. 🟢 **Installation** Node.js 18
3. 📦 **Installation** des dépendances NPM
4. 🔧 **Compilation** TypeScript
5. 🕷️ **Exécution** du scraper TFT
6. 📊 **Vérification** du fichier meta.json généré
7. 📝 **Détection** des changements
8. 📤 **Commit et push** automatique si changements
9. 📈 **Upload** du fichier comme artifact
10. 💬 **Notification** en cas de succès/échec

## 🔧 Configuration

### Permissions requises

Le workflow nécessite les permissions suivantes :
- `contents: write` - Pour commit et push les changements
- `actions: read` - Pour accéder aux métadonnées du workflow

### Variables d'environnement

Le workflow utilise :
- `GITHUB_TOKEN` - Token automatique fourni par GitHub
- `PUPPETEER_SKIP_CHROMIUM_DOWNLOAD` - Configuration Puppeteer pour CI
- `PUPPETEER_EXECUTABLE_PATH` - Chemin vers Chrome en CI

### Structure des fichiers

```
.github/
├── workflows/
│   └── scrape.yml          # Workflow principal
├── README.md               # Cette documentation
└── dependabot.yml          # (optionnel) Config Dependabot
```

## 🚀 Utilisation

### Exécution manuelle

1. Allez dans l'onglet **"Actions"** de votre repository
2. Sélectionnez **"TFT Meta Scraper"**
3. Cliquez sur **"Run workflow"**
4. Confirmez avec **"Run workflow"**

### Monitoring

Le workflow génère :
- **📊 Logs détaillés** pour chaque étape
- **📈 Artifacts** avec le fichier meta.json généré
- **💬 Notifications** en cas de succès/échec

### Résultat attendu

Si le scraping trouve de nouvelles données :
```
🤖 Auto-update TFT meta data

- Updated: 2025-06-10 12:00:00 UTC
- Compositions: 5
- Source: Automated scraping workflow

[skip ci]
```

## 🛠️ Maintenance

### Ajuster la fréquence

Modifiez la ligne cron dans `scrape.yml` :
```yaml
schedule:
  - cron: '0 */6 * * *'   # Toutes les 6 heures
  - cron: '0 8,20 * * *'  # À 8h et 20h UTC
  - cron: '0 12 * * *'    # Une fois par jour à midi
```

### Notifications personnalisées

Vous pouvez ajouter des notifications :
- **Slack** : Webhook dans les secrets GitHub
- **Discord** : Bot webhook
- **Email** : Service comme SendGrid
- **Issues GitHub** : Création automatique d'issues

Exemple pour Slack :
```yaml
- name: 📢 Notify Slack
  if: always()
  uses: 8398a7/action-slack@v3
  with:
    status: ${{ job.status }}
    webhook_url: ${{ secrets.SLACK_WEBHOOK }}
```

### Secrets à configurer

Dans les paramètres du repository > Secrets and variables > Actions :

- `SLACK_WEBHOOK` - (Optionnel) URL webhook Slack
- `DISCORD_WEBHOOK` - (Optionnel) URL webhook Discord

## 🐛 Dépannage

### Problèmes courants

**❌ "Permission denied" lors du push**
- Vérifiez que le repository permet les GitHub Actions
- Assurez-vous que `contents: write` est configuré

**❌ "Puppeteer timeout"**
- Le site web pourrait être indisponible
- Augmentez le timeout dans le code
- Vérifiez les logs pour plus de détails

**❌ "No changes detected"**
- Normal si les données n'ont pas changé
- Le workflow ne commit que s'il y a des modifications

### Logs de debug

Pour activer plus de logs :
```yaml
env:
  DEBUG: 'puppeteer:*'
  NODE_ENV: 'development'
```

## 📈 Métriques

Le workflow track automatiquement :
- **Taille** du fichier meta.json généré
- **Nombre** de compositions scrapées
- **Timestamp** de dernière mise à jour
- **Durée** d'exécution du workflow

## 🔒 Sécurité

- Le workflow utilise les **dernières versions** des actions
- **Aucun secret** sensible n'est exposé dans les logs
- Les **permissions sont minimales** (lecture + écriture du contenu uniquement)
- Le **token GitHub** est automatiquement fourni et sécurisé

## 🤝 Contribution

Pour modifier le workflow :
1. Editez `.github/workflows/scrape.yml`
2. Testez localement si possible
3. Commitez et poussez les changements
4. Le workflow se déclenchera automatiquement pour test 