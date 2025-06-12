/**
 * Interface pour représenter un champion dans une composition TFT
 */
export interface Champion {
  name: string;
  cost: number;
  traits: string[];
  isCarry?: boolean;
  items?: string[];
}

/**
 * Interface pour représenter un objet optimal pour un champion carry
 */
export interface OptimalItem {
  championName: string;
  items: string[];
  priority: number; // 1 = priorité la plus haute
}

/**
 * Interface pour représenter une augmentation (hextech augment)
 */
export interface Augment {
  name: string;
  description?: string;
  tier: 'silver' | 'gold' | 'prismatic';
  priority: number;
}

/**
 * Interface pour représenter une composition TFT complète
 */
export interface TFTComposition {
  id: string;
  name: string;
  tier: string; // S, A, B, C, etc.
  difficulty: number; // 1-5
  mainCarries: Champion[];
  supportChampions: Champion[];
  optimalItems: OptimalItem[];
  bestAugments: Augment[];
  traits: string[];
  playRate?: number; // pourcentage de popularité
  winRate?: number; // pourcentage de victoire
  avgPlacement?: number; // placement moyen
  patchVersion?: string;
  lastUpdated: string; // ISO date string
}

/**
 * Interface pour le fichier meta.json complet
 */
export interface TFTMeta {
  version: string;
  lastUpdated: string;
  totalCompositions: number;
  compositions: TFTComposition[];
  metadata: {
    scrapedFrom: string;
    scrapingDate: string;
    patchVersion?: string;
  };
}

/**
 * Interface pour les données temporaires lors du scraping
 */
export interface ScrapedCompositionData {
  name: string;
  tier?: string;
  champions: string[];
  items: { [championName: string]: string[] };
  augments: string[];
  traits: string[];
  stats?: {
    playRate?: number;
    winRate?: number;
    avgPlacement?: number;
  };
} 