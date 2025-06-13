import fetch from 'node-fetch';
import { mkdir, writeFile } from 'fs/promises';
import { join } from 'path';

(async () => {
  const start = Date.now();

  const log = (msg: string) => console.log(`[updateData] ${msg}`);

  try {
    const realmsUrl = 'https://ddragon.leagueoflegends.com/realms/na.json';
    log(`Fetching realms data from ${realmsUrl}`);
    const realmsRes = await fetch(realmsUrl);
    if (!realmsRes.ok) throw new Error(`Failed to fetch realms: ${realmsRes.status}`);
    const realmsJson: any = await realmsRes.json();

    const patchVersion: string = realmsJson.v;
    if (!patchVersion) throw new Error('Patch version not found in realms response');
    log(`Detected patch ${patchVersion}`);

    const base = `https://ddragon.leagueoflegends.com/cdn/${patchVersion}/data/en_US`;
    const targets: Record<string, string> = {
      champions: `${base}/tft-champion.json`,
      traits: `${base}/tft-trait.json`,
      items: `${base}/tft-item.json`,
    };

    // Prepare directory
    const outDir = join('data', 'latest');
    await mkdir(outDir, { recursive: true });

    // Save patch file
    await writeFile(join(outDir, 'patch.json'), JSON.stringify(realmsJson, null, 2));

    // Fetch other files concurrently
    const entries = Object.entries(targets);
    await Promise.all(
      entries.map(async ([name, url]) => {
        log(`Downloading ${name} from ${url}`);
        const res = await fetch(url);
        if (!res.ok) throw new Error(`Failed to fetch ${name}: ${res.status}`);
        const json = await res.json();
        const filePath = join(outDir, `${name}.json`);
        await writeFile(filePath, JSON.stringify(json, null, 2));
        log(`Saved ${name} to ${filePath}`);
      })
    );

    const duration = ((Date.now() - start) / 1000).toFixed(2);
    log(`Completed in ${duration}s`);
    process.exit(0);
  } catch (err) {
    console.error(`[updateData] Error:`, err instanceof Error ? err.message : err);
    const duration = ((Date.now() - start) / 1000).toFixed(2);
    console.error(`[updateData] Aborted after ${duration}s`);
    process.exit(1);
  }
})(); 