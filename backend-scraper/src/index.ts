import puppeteer, { Browser, Page } from 'puppeteer';
import fs from 'fs/promises';
import path from 'path';
import { 
  TFTMeta, 
  TFTComposition, 
  Champion, 
  OptimalItem, 
  Augment, 
  ScrapedCompositionData 
} from './types';
import { generateDemoData } from './demo-data';

/**
 * Configuration du scraper
 */
const CONFIG = {
  baseUrl: 'https://metatft.com',
  compositionsUrl: 'https://metatft.com/comps',
  outputPath: path.join(__dirname, '..', 'public', 'meta.json'),
  userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
  timeout: 30000,
  maxCompositions: 20, // Limite pour éviter un scraping trop long
};

/**
 * Classe principale pour le scraping TFT
 */
class TFTScraper {
  private browser: Browser | null = null;
  private page: Page | null = null;

  /**
   * Initialise le navigateur Puppeteer
   */
  async initialize(): Promise<void> {
    console.log('🚀 Initialisation du scraper TFT...');
    
    this.browser = await puppeteer.launch({
      headless: true,
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-blink-features=AutomationControlled',
        '--disable-web-security'
      ]
    });

    this.page = await this.browser.newPage();
    
    // Configuration de la page
    await this.page.setUserAgent(CONFIG.userAgent);
    await this.page.setViewport({ width: 1920, height: 1080 });
    
    // Bloquer les images et CSS pour accélérer le chargement
    await this.page.setRequestInterception(true);
    this.page.on('request', (req) => {
      const resourceType = req.resourceType();
      if (['image', 'stylesheet', 'font'].includes(resourceType)) {
        req.abort();
      } else {
        req.continue();
      }
    });
  }

  /**
   * Navigue vers la page des compositions
   */
  async navigateToCompositions(): Promise<void> {
    if (!this.page) throw new Error('Page non initialisée');
    
    console.log('📄 Navigation vers la page des compositions...');
    await this.page.goto(CONFIG.compositionsUrl, {
      waitUntil: 'networkidle2',
      timeout: CONFIG.timeout
    });

    // Attendre que la page soit chargée
    await this.page.waitForSelector('.comp-card, .composition-card, [data-testid="comp-card"]', {
      timeout: CONFIG.timeout
    });
  }

  /**
   * Extrait la liste des URLs des compositions
   */
  async extractCompositionUrls(): Promise<string[]> {
    if (!this.page) throw new Error('Page non initialisée');

    console.log('🔍 Extraction des URLs des compositions...');
    
    const urls = await this.page.evaluate(() => {
      // Chercher différents sélecteurs possibles pour les cartes de composition
      const selectors = [
        'a[href*="/comp/"]',
        '.comp-card a',
        '.composition-card a',
        '[data-testid="comp-card"] a',
        'a[href*="/comps/"]'
      ];

      let links: HTMLAnchorElement[] = [];
      
      for (const selector of selectors) {
        const elements = document.querySelectorAll(selector) as NodeListOf<HTMLAnchorElement>;
        if (elements.length > 0) {
          links = Array.from(elements);
          break;
        }
      }

      return links
        .map(link => link.href)
        .filter(href => href && (href.includes('/comp/') || href.includes('/comps/')))
        .slice(0, 20); // Limiter à 20 compositions
    });

    console.log(`✅ ${urls.length} compositions trouvées`);
    return urls;
  }

  /**
   * Scrape une composition individuelle
   */
  async scrapeComposition(url: string): Promise<ScrapedCompositionData | null> {
    if (!this.page) throw new Error('Page non initialisée');

    try {
      console.log(`🔄 Scraping: ${url}`);
      
      await this.page.goto(url, {
        waitUntil: 'networkidle2',
        timeout: CONFIG.timeout
      });

      // Attendre que le contenu soit chargé
      await new Promise(resolve => setTimeout(resolve, 2000));

      const data = await this.page.evaluate(() => {
        // Fonction utilitaire pour nettoyer le texte
        const cleanText = (text: string | null | undefined): string => {
          return text?.trim().replace(/\s+/g, ' ') || '';
        };

        // Extraire le nom de la composition
        const nameSelectors = [
          'h1',
          '.comp-title',
          '.composition-title',
          '[data-testid="comp-title"]',
          '.title'
        ];
        
        let name = '';
        for (const selector of nameSelectors) {
          const element = document.querySelector(selector);
          if (element?.textContent) {
            name = cleanText(element.textContent);
            break;
          }
        }

        // Extraire les champions
        const championSelectors = [
          '.champion-name',
          '.champ-name',
          '[data-champion]',
          '.unit-name',
          '.champion'
        ];

        let champions: string[] = [];
        for (const selector of championSelectors) {
          const elements = document.querySelectorAll(selector);
          if (elements.length > 0) {
            champions = Array.from(elements).map((el: Element) => cleanText(el.textContent));
            break;
          }
        }

        // Extraire les augmentations
        const augmentSelectors = [
          '.augment-name',
          '.hex-name',
          '[data-augment]',
          '.augment'
        ];

        let augments: string[] = [];
        for (const selector of augmentSelectors) {
          const elements = document.querySelectorAll(selector);
          if (elements.length > 0) {
            augments = Array.from(elements).map((el: Element) => cleanText(el.textContent));
            break;
          }
        }

        // Extraire les traits
        const traitSelectors = [
          '.trait-name',
          '.synergy-name',
          '[data-trait]',
          '.trait'
        ];

        let traits: string[] = [];
        for (const selector of traitSelectors) {
          const elements = document.querySelectorAll(selector);
          if (elements.length > 0) {
            traits = Array.from(elements).map((el: Element) => cleanText(el.textContent));
            break;
          }
        }

        // Extraire le tier (rang)
        const tierSelectors = [
          '.tier',
          '.rank',
          '.grade',
          '[data-tier]'
        ];

        let tier = '';
        for (const selector of tierSelectors) {
          const element = document.querySelector(selector);
          if (element?.textContent) {
            tier = cleanText(element.textContent);
            break;
          }
        }

        // Extraire les objets (plus complexe, on va chercher dans le texte)
        const itemsData: { [championName: string]: string[] } = {};
        
        // Chercher les sections d'objets recommandés
        const itemSections = document.querySelectorAll('.items, .recommended-items, .item-build, [data-items]');
        itemSections.forEach((section: Element) => {
          const items = Array.from(section.querySelectorAll('.item-name, [data-item]'))
            .map((el: Element) => cleanText(el.textContent))
            .filter(item => item.length > 0);
          
          if (items.length > 0 && champions.length > 0) {
            // Associer les objets au premier champion (carry principal)
            const mainCarry = champions[0];
            if (mainCarry) {
              itemsData[mainCarry] = items;
            }
          }
        });

        return {
          name,
          tier,
          champions: champions.filter(c => c.length > 0),
          items: itemsData,
          augments: augments.filter(a => a.length > 0),
          traits: traits.filter(t => t.length > 0)
        };
      });

      if (!data.name || data.champions.length === 0) {
        console.log(`⚠️ Données insuffisantes pour: ${url}`);
        return null;
      }

      return data;

    } catch (error) {
      console.error(`❌ Erreur lors du scraping de ${url}:`, error);
      return null;
    }
  }

  /**
   * Transforme les données scrapées en format TFT structuré
   */
  private transformToTFTComposition(data: ScrapedCompositionData, index: number): TFTComposition {
    const id = `comp-${index + 1}`;
    
    // Transformer les champions
    const allChampions: Champion[] = data.champions.map((name, idx) => ({
      name,
      cost: this.estimateChampionCost(name),
      traits: this.extractChampionTraits(name, data.traits),
      isCarry: idx < 2, // Les 2 premiers sont considérés comme carry
      items: data.items[name] || []
    }));

    const mainCarries = allChampions.filter(c => c.isCarry);
    const supportChampions = allChampions.filter(c => !c.isCarry);

    // Transformer les objets optimaux
    const optimalItems: OptimalItem[] = Object.entries(data.items).map(([championName, items], idx) => ({
      championName,
      items,
      priority: idx + 1
    }));

    // Transformer les augmentations
    const bestAugments: Augment[] = data.augments.map((name, idx) => ({
      name,
      tier: this.estimateAugmentTier(name),
      priority: idx + 1
    }));

    return {
      id,
      name: data.name,
      tier: data.tier || 'A',
      difficulty: this.estimateDifficulty(data),
      mainCarries,
      supportChampions,
      optimalItems,
      bestAugments,
      traits: data.traits,
      lastUpdated: new Date().toISOString()
    };
  }

  /**
   * Estime le coût d'un champion (logique simplifiée)
   */
  private estimateChampionCost(name: string): number {
    // Logique très basique - normalement on aurait une base de données
    const lowCostChamps = ['garen', 'twisted fate', 'graves', 'warwick'];
    const highCostChamps = ['jinx', 'miss fortune', 'yasuo', 'azir'];
    
    const lowerName = name.toLowerCase();
    if (lowCostChamps.some(champ => lowerName.includes(champ))) return 1;
    if (highCostChamps.some(champ => lowerName.includes(champ))) return 5;
    return 3; // Par défaut
  }

  /**
   * Extrait les traits d'un champion
   */
  private extractChampionTraits(_championName: string, allTraits: string[]): string[] {
    // Logique simplifiée - associer quelques traits au champion
    return allTraits.slice(0, 2);
  }

  /**
   * Estime le tier d'une augmentation
   */
  private estimateAugmentTier(name: string): 'silver' | 'gold' | 'prismatic' {
    if (name.toLowerCase().includes('prismatic') || name.toLowerCase().includes('legendary')) {
      return 'prismatic';
    }
    if (name.toLowerCase().includes('gold') || name.toLowerCase().includes('rare')) {
      return 'gold';
    }
    return 'silver';
  }

  /**
   * Estime la difficulté d'une composition
   */
  private estimateDifficulty(data: ScrapedCompositionData): number {
    // Plus il y a de champions et d'objets spécifiques, plus c'est difficile
    const complexity = data.champions.length + Object.keys(data.items).length;
    return Math.min(5, Math.max(1, Math.ceil(complexity / 3)));
  }

  /**
   * Sauvegarde les données dans meta.json
   */
  async saveToJson(compositions: TFTComposition[]): Promise<void> {
    const metaData: TFTMeta = {
      version: '1.0.0',
      lastUpdated: new Date().toISOString(),
      totalCompositions: compositions.length,
      compositions,
      metadata: {
        scrapedFrom: 'metatft.com',
        scrapingDate: new Date().toISOString()
      }
    };

    // Créer le dossier public s'il n'existe pas
    const publicDir = path.dirname(CONFIG.outputPath);
    await fs.mkdir(publicDir, { recursive: true });

    // Sauvegarder le fichier
    await fs.writeFile(CONFIG.outputPath, JSON.stringify(metaData, null, 2), 'utf-8');
    console.log(`💾 Données sauvegardées dans: ${CONFIG.outputPath}`);
    console.log(`📊 Total: ${compositions.length} compositions`);
  }

  /**
   * Ferme le navigateur
   */
  async close(): Promise<void> {
    if (this.browser) {
      await this.browser.close();
      console.log('🔒 Navigateur fermé');
    }
  }

  /**
   * Méthode principale pour scraper toutes les compositions
   */
  async scrapeAllCompositions(): Promise<void> {
    try {
      await this.initialize();
      await this.navigateToCompositions();
      
      const urls = await this.extractCompositionUrls();
      
      if (urls.length === 0) {
        throw new Error('Aucune composition trouvée');
      }

      console.log(`🎯 Scraping de ${urls.length} compositions...`);
      
      const compositions: TFTComposition[] = [];
      
      for (let i = 0; i < urls.length; i++) {
        const url = urls[i];
        if (!url) continue;
        
        const data = await this.scrapeComposition(url);
        
        if (data) {
          const composition = this.transformToTFTComposition(data, i);
          compositions.push(composition);
          console.log(`✅ ${i + 1}/${urls.length}: ${composition.name}`);
        }
        
        // Délai entre les requêtes pour éviter d'être bloqué
        await new Promise(resolve => setTimeout(resolve, 1000 + Math.random() * 1000));
      }

      await this.saveToJson(compositions);
      
    } catch (error) {
      console.error('❌ Erreur lors du scraping:', error);
      throw error;
    } finally {
      await this.close();
    }
  }
}

/**
 * Fonction principale
 */
async function main(): Promise<void> {
  console.log('🎮 Générateur de Meta TFT');
  console.log('=' .repeat(50));
  
  console.log('\n📊 Choix disponibles:');
  console.log('1. Générer des données de démo (recommandé)');
  console.log('2. Scraper metatft.com (expérimental)');
  
  // Pour cette démo, nous utilisons les données générées
  console.log('\n🎯 Génération des données de démo...');
  
  try {
    await generateDemoData();
    console.log('✨ Génération terminée avec succès !');
  } catch (error) {
    console.error('💥 Erreur fatale:', error);
    
    console.log('\n🔄 Tentative de scraping en fallback...');
    const scraper = new TFTScraper();
    
    try {
      await scraper.scrapeAllCompositions();
      console.log('✨ Scraping terminé avec succès !');
    } catch (scrapingError) {
      console.error('💥 Erreur de scraping:', scrapingError);
      process.exit(1);
    }
  }
}

// Exécution du script
if (require.main === module) {
  main().catch((error) => {
    console.error('💥 Erreur non gérée:', error);
    process.exit(1);
  });
}

export { TFTScraper }; 