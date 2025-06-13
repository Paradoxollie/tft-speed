import { writable } from 'svelte/store';
import { lobbyStore, UnitDetection } from './detector';
import { invoke } from '@tauri-apps/api/tauri';

export interface ScoredComp {
  name: string;
  score: number;
}

export const recommendations = writable<ScoredComp[]>([]);

let timeout: ReturnType<typeof setTimeout> | null = null;

lobbyStore.subscribe((detections: UnitDetection[]) => {
  if (timeout) clearTimeout(timeout);
  timeout = setTimeout(async () => {
    try {
      const lobbyJson = JSON.stringify({
        my_units: detections.map((d) => d.champ),
        enemy_units: [] as string[][],
      });
      const result = await invoke<ScoredComp[]>('best_comps', { lobbyJson });
      recommendations.set(result);
    } catch (err) {
      console.error('best_comps error', err);
    }
  }, 500);
}); 