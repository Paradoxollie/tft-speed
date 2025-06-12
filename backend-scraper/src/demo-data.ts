import fs from 'fs/promises';
import path from 'path';
import { TFTMeta, TFTComposition } from './types';

/**
 * Génère des compositions de démo
 */
function generateDemoCompositions(): TFTComposition[] {
  const compositions: TFTComposition[] = [
    {
      id: 'comp-1',
      name: 'True Damage Reroll',
      tier: 'S',
      difficulty: 3,
      mainCarries: [
        {
          name: 'Akali',
          cost: 4,
          traits: ['True Damage', 'Sentinel'],
          isCarry: true,
          items: ['Infinity Edge', 'Last Whisper', 'Bloodthirster']
        },
        {
          name: 'Yasuo',
          cost: 5,
          traits: ['True Damage', 'Invoker'],
          isCarry: true,
          items: ['Rabadon\'s Deathcap', 'Jeweled Gauntlet', 'Archangel\'s Staff']
        }
      ],
      supportChampions: [
        { name: 'Senna', cost: 2, traits: ['True Damage', 'Sentinel'], isCarry: false },
        { name: 'Katarina', cost: 3, traits: ['True Damage', 'Academy'], isCarry: false },
        { name: 'Lucian', cost: 2, traits: ['Sentinel', 'Cannoneer'], isCarry: false },
        { name: 'Viego', cost: 4, traits: ['Caretaker', 'Sentinel'], isCarry: false }
      ],
      optimalItems: [
        {
          championName: 'Akali',
          items: ['Infinity Edge', 'Last Whisper', 'Bloodthirster'],
          priority: 1
        },
        {
          championName: 'Yasuo',
          items: ['Rabadon\'s Deathcap', 'Jeweled Gauntlet', 'Archangel\'s Staff'],
          priority: 2
        }
      ],
      bestAugments: [
        { name: 'True Damage Crown', tier: 'prismatic', priority: 1 },
        { name: 'Combat Training I', tier: 'silver', priority: 2 },
        { name: 'Cybernetic Implants II', tier: 'silver', priority: 3 }
      ],
      traits: ['True Damage', 'Sentinel', 'Invoker', 'Academy'],
      playRate: 12.5,
      winRate: 67.8,
      avgPlacement: 3.2,
      patchVersion: '14.5',
      lastUpdated: new Date().toISOString()
    },
    {
      id: 'comp-2',
      name: 'Punk Highroll',
      tier: 'A',
      difficulty: 4,
      mainCarries: [
        {
          name: 'Jinx',
          cost: 4,
          traits: ['Punk', 'Rapidfire'],
          isCarry: true,
          items: ['Rapid Firecannon', 'Infinity Edge', 'Last Whisper']
        }
      ],
      supportChampions: [
        { name: 'Vi', cost: 2, traits: ['Punk', 'Bruiser'], isCarry: false },
        { name: 'Ekko', cost: 3, traits: ['Punk', 'Prankster'], isCarry: false },
        { name: 'Graves', cost: 1, traits: ['Bruiser', 'Cannoneer'], isCarry: false },
        { name: 'Sylas', cost: 3, traits: ['Misfits', 'Brawler'], isCarry: false }
      ],
      optimalItems: [
        {
          championName: 'Jinx',
          items: ['Rapid Firecannon', 'Infinity Edge', 'Last Whisper'],
          priority: 1
        }
      ],
      bestAugments: [
        { name: 'Punk Rock', tier: 'gold', priority: 1 },
        { name: 'Rich Get Richer+', tier: 'gold', priority: 2 },
        { name: 'Combat Training I', tier: 'silver', priority: 3 }
      ],
      traits: ['Punk', 'Rapidfire', 'Bruiser', 'Misfits'],
      playRate: 8.3,
      winRate: 59.2,
      avgPlacement: 3.8,
      patchVersion: '14.5',
      lastUpdated: new Date().toISOString()
    },
    {
      id: 'comp-3',
      name: 'Anima Squad Fast 9',
      tier: 'A',
      difficulty: 5,
      mainCarries: [
        {
          name: 'Miss Fortune',
          cost: 5,
          traits: ['Anima Squad', 'Ace'],
          isCarry: true,
          items: ['Giant Slayer', 'Last Whisper', 'Infinity Edge']
        }
      ],
      supportChampions: [
        { name: 'Sylas', cost: 3, traits: ['Misfits', 'Brawler'], isCarry: false },
        { name: 'Lucian', cost: 2, traits: ['Sentinel', 'Cannoneer'], isCarry: false },
        { name: 'Garen', cost: 1, traits: ['Elite', 'Defender'], isCarry: false },
        { name: 'Fiora', cost: 1, traits: ['Elite', 'Challenger'], isCarry: false }
      ],
      optimalItems: [
        {
          championName: 'Miss Fortune',
          items: ['Giant Slayer', 'Last Whisper', 'Infinity Edge'],
          priority: 1
        }
      ],
      bestAugments: [
        { name: 'Golden Ticket', tier: 'prismatic', priority: 1 },
        { name: 'Big Friend', tier: 'prismatic', priority: 2 },
        { name: 'Academy Emblem', tier: 'silver', priority: 3 }
      ],
      traits: ['Anima Squad', 'Ace', 'Elite', 'Sentinel'],
      playRate: 6.7,
      winRate: 71.4,
      avgPlacement: 2.9,
      patchVersion: '14.5',
      lastUpdated: new Date().toISOString()
    },
    {
      id: 'comp-4',
      name: 'Elite Frontline',
      tier: 'B',
      difficulty: 2,
      mainCarries: [
        {
          name: 'Garen',
          cost: 1,
          traits: ['Elite', 'Defender'],
          isCarry: true,
          items: ['Warmog\'s Armor', 'Bramble Vest', 'Ionic Spark']
        }
      ],
      supportChampions: [
        { name: 'Fiora', cost: 1, traits: ['Elite', 'Challenger'], isCarry: false },
        { name: 'Twisted Fate', cost: 1, traits: ['Pirate', 'Invoker'], isCarry: false },
        { name: 'Gangplank', cost: 2, traits: ['Pirate', 'Bruiser'], isCarry: false }
      ],
      optimalItems: [
        {
          championName: 'Garen',
          items: ['Warmog\'s Armor', 'Bramble Vest', 'Ionic Spark'],
          priority: 1
        }
      ],
      bestAugments: [
        { name: 'Academy Emblem', tier: 'silver', priority: 1 },
        { name: 'Cybernetic Implants II', tier: 'silver', priority: 2 },
        { name: 'Sentinel Unity', tier: 'gold', priority: 3 }
      ],
      traits: ['Elite', 'Defender', 'Pirate', 'Challenger'],
      playRate: 15.2,
      winRate: 45.8,
      avgPlacement: 4.2,
      patchVersion: '14.5',
      lastUpdated: new Date().toISOString()
    },
    {
      id: 'comp-5',
      name: 'Sentinel Scaling',
      tier: 'A',
      difficulty: 3,
      mainCarries: [
        {
          name: 'Lucian',
          cost: 2,
          traits: ['Sentinel', 'Cannoneer'],
          isCarry: true,
          items: ['Runaan\'s Hurricane', 'Rapid Firecannon', 'Bloodthirster']
        },
        {
          name: 'Senna',
          cost: 2,
          traits: ['True Damage', 'Sentinel'],
          isCarry: true,
          items: ['Rabadon\'s Deathcap', 'Morellonomicon', 'Archangel\'s Staff']
        }
      ],
      supportChampions: [
        { name: 'Viego', cost: 4, traits: ['Caretaker', 'Sentinel'], isCarry: false },
        { name: 'Akali', cost: 4, traits: ['True Damage', 'Sentinel'], isCarry: false }
      ],
      optimalItems: [
        {
          championName: 'Lucian',
          items: ['Runaan\'s Hurricane', 'Rapid Firecannon', 'Bloodthirster'],
          priority: 1
        },
        {
          championName: 'Senna',
          items: ['Rabadon\'s Deathcap', 'Morellonomicon', 'Archangel\'s Staff'],
          priority: 2
        }
      ],
      bestAugments: [
        { name: 'Sentinel Unity', tier: 'gold', priority: 1 },
        { name: 'Gadgeteen Heart', tier: 'gold', priority: 2 },
        { name: 'Combat Training I', tier: 'silver', priority: 3 }
      ],
      traits: ['Sentinel', 'True Damage', 'Cannoneer', 'Caretaker'],
      playRate: 9.8,
      winRate: 62.1,
      avgPlacement: 3.5,
      patchVersion: '14.5',
      lastUpdated: new Date().toISOString()
    }
  ];

  return compositions;
}

/**
 * Génère et sauvegarde les données de démo
 */
export async function generateDemoData(): Promise<void> {
  console.log('🎮 Génération des données de démo TFT...');
  
  const compositions = generateDemoCompositions();
  
  const metaData: TFTMeta = {
    version: '1.0.0',
    lastUpdated: new Date().toISOString(),
    totalCompositions: compositions.length,
    compositions,
    metadata: {
      scrapedFrom: 'demo-data-generator',
      scrapingDate: new Date().toISOString(),
      patchVersion: '14.5'
    }
  };

  // Créer le dossier public s'il n'existe pas
  const outputPath = path.join(__dirname, '..', 'public', 'meta.json');
  const publicDir = path.dirname(outputPath);
  await fs.mkdir(publicDir, { recursive: true });

  // Sauvegarder le fichier
  await fs.writeFile(outputPath, JSON.stringify(metaData, null, 2), 'utf-8');
  
  console.log(`💾 Données de démo sauvegardées dans: ${outputPath}`);
  console.log(`📊 Total: ${compositions.length} compositions générées`);
  console.log('\n🎯 Compositions générées:');
  compositions.forEach((comp, i) => {
    console.log(`${i + 1}. ${comp.name} (Tier ${comp.tier}) - ${comp.mainCarries.length} carries`);
  });
  
  console.log('\n✨ Génération terminée avec succès !');
}

// Si ce fichier est exécuté directement
if (require.main === module) {
  generateDemoData().catch(console.error);
} 