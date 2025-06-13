// Build a minimal comps.json file from the latest Riot data.
// This is a placeholder until a real meta-scraper is implemented.
// Usage:  tsx data-pipeline/build-comps.ts

import { mkdir, writeFile, readFile } from 'fs/promises';
import { join } from 'path';

interface ChampionData {
  name: string;
}

interface Composition {
  name: string;
  champions: string[];
  base_power: number;
}

async function main() {
  const outDir = join('data', 'latest');
  await mkdir(outDir, { recursive: true });

  // Very simple logic: pick 5 random champions for three comps
  const championsPath = join(outDir, 'champions.json');
  const championsRaw = await readFile(championsPath, 'utf-8');
  const championsJson = JSON.parse(championsRaw);
  const championNames: string[] = Object.values<ChampionData>(championsJson.data).map(
    (c: any) => c.name
  );

  if (championNames.length < 5) throw new Error('Not enough champion data to build comps');

  function pickRandomChampions(): string[] {
    const shuffled = [...championNames].sort(() => Math.random() - 0.5);
    return shuffled.slice(0, 5);
  }

  const comps: Composition[] = [
    { name: 'Comp Alpha', champions: pickRandomChampions(), base_power: 3.5 },
    { name: 'Comp Beta', champions: pickRandomChampions(), base_power: 3.4 },
    { name: 'Comp Gamma', champions: pickRandomChampions(), base_power: 3.3 },
  ];

  const dest = join(outDir, 'comps.json');
  await writeFile(dest, JSON.stringify(comps, null, 2));
  console.log(`✔ Wrote ${comps.length} compositions to ${dest}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
}); 