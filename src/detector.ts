import { writable } from 'svelte/store';
import { invoke } from '@tauri-apps/api/tauri';
import { writeBinaryFile } from '@tauri-apps/api/fs';
import { join, tempDir } from '@tauri-apps/api/path';

export interface UnitDetection {
  champ: string;
  x: number;
  y: number;
  conf: number;
}

export const lobbyStore = writable<UnitDetection[]>([]);

async function captureScreenshot(): Promise<Uint8Array> {
  // Try screen capture via MediaDevices
  if (navigator.mediaDevices?.getDisplayMedia) {
    const stream = await navigator.mediaDevices.getDisplayMedia({ video: true });
    const track = stream.getVideoTracks()[0];
    const imageCapture = new ImageCapture(track);
    const bitmap = await imageCapture.grabFrame();

    const canvas = document.createElement('canvas');
    canvas.width = bitmap.width;
    canvas.height = bitmap.height;
    const ctx = canvas.getContext('2d');
    if (!ctx) throw new Error('Canvas context unavailable');
    ctx.drawImage(bitmap, 0, 0);
    const blob: Blob = await new Promise((res) => canvas.toBlob((b) => res(b!), 'image/png'));
    const arrayBuffer = await blob.arrayBuffer();
    track.stop();
    stream.getTracks().forEach((t) => t.stop());
    return new Uint8Array(arrayBuffer);
  }
  // Fallback: html2canvas full document
  const canvas = await import('html2canvas').then((m) => m.default(document.body));
  const blob: Blob = await new Promise((res) => canvas.toBlob((b) => res(b!), 'image/png'));
  const buf = new Uint8Array(await blob.arrayBuffer());
  return buf;
}

export async function detectUnits(): Promise<UnitDetection[]> {
  const imgData = await captureScreenshot();
  const temp = await tempDir();
  const filePath = await join(temp, `tft_cap_${Date.now()}.png`);
  await writeBinaryFile({ path: filePath, contents: imgData });
  const result = await invoke<UnitDetection[]>('detect_units', { path: filePath });
  return result;
}

// Continuous polling every 4 seconds
setInterval(async () => {
  try {
    const detections = await detectUnits();
    lobbyStore.set(detections);
  } catch (err) {
    console.error('detectUnits failed', err);
  }
}, 4000); 