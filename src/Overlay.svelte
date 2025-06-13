<script lang="ts">
  import { onMount } from 'svelte';
  import { invoke } from '@tauri-apps/api/tauri';

  interface ScoredComp {
    name: string;
    score: number;
    overlap?: number;
  }

  // Demo data until backend wired
  let comps: ScoredComp[] = [
    { name: 'Invoker', score: 4.2, overlap: 0.1 },
    { name: 'Sorcerers', score: 3.9, overlap: 0.2 },
    { name: 'Slayers', score: 3.7, overlap: 0.15 }
  ];

  let locked: string | null = null;

  function select(comp: ScoredComp) {
    locked = locked === comp.name ? null : comp.name;
  }

  onMount(() => {
    window.addEventListener('keydown', (e) => {
      if (e.ctrlKey && e.shiftKey && e.code === 'KeyU') {
        invoke('update_meta');
      }
    });
  });
</script>

<style>
  /* Make entire overlay pass-through except panel */
  :global(body) {
    pointer-events: none;
    user-select: none;
    font-size: 0.875rem; /* Tailwind text-sm */
    color: #e5e7eb; /* Tailwind gray-200 */
  }
</style>

<div class="absolute top-2 right-2 max-w-[260px] w-full pointer-events-auto">
  <div class="bg-gray-800 bg-opacity-80 backdrop-blur-md rounded-lg shadow-lg" data-tauri-drag-region>
    <header class="cursor-move px-3 py-1 font-semibold text-gray-100 flex justify-between items-center">
      Best Comps
    </header>
    <ul class="divide-y divide-gray-700">
      {#each comps as comp}
        <li>
          <button
            type="button"
            class="flex w-full items-center px-3 py-2 hover:bg-gray-700/60 focus:bg-gray-700/60 focus:outline-none cursor-pointer"
            on:click={() => select(comp)}
            on:keydown={(e) => (e.key === 'Enter' || e.key === ' ') && select(comp)}
          >
            <div class="flex-1 text-left">
              <div class="flex justify-between mb-1">
                <span class="text-gray-100 font-medium">{comp.name}</span>
                <span class="text-gray-400 ml-2">{(comp.score).toFixed(2)}</span>
              </div>
              <div class="w-full bg-gray-600 h-2 rounded">
                <div
                  class="bg-emerald-400 h-2 rounded"
                  style="width: {Math.min(comp.score / 5 * 100, 100)}%"
                ></div>
              </div>
              {#if comp.overlap !== undefined}
                <div class="text-right text-xs text-gray-400 mt-0.5">
                  overlap {Math.round(comp.overlap * 100)}%
                </div>
              {/if}
            </div>
          </button>
        </li>
        {#if locked === comp.name}
          <li class="px-3 pb-3 text-gray-300 text-xs">
            <!-- Placeholder stage guide -->
            <p class="mt-2">Stage Guide for {comp.name} (coming soon)</p>
          </li>
        {/if}
      {/each}
    </ul>
  </div>
</div> 