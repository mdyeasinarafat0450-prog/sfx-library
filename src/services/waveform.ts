import { db } from '../db/db';
import type { WaveformData } from '../db/db';

export async function generateWaveform(assetId: string, path: string): Promise<WaveformData | null> {
    try {
        const cached = await db.waveforms.where('assetId').equals(assetId).first();
        if (cached) return cached;

        // @ts-ignore
        if (typeof window.require === 'undefined') return null;
        // @ts-ignore
        const fs = window.require('fs');

        // Read file using Node fs to avoid CORS/local file restrictions in Chromium
        const buffer = fs.readFileSync(path);
        const arrayBuffer = buffer.buffer.slice(buffer.byteOffset, buffer.byteOffset + buffer.byteLength);

        // Decode audio (must be done in browser context)
        const audioCtx = new window.AudioContext();
        const audioBuffer = await audioCtx.decodeAudioData(arrayBuffer);
        
        const channelData = audioBuffer.getChannelData(0);
        const samples = 40; // 40 peaks for compact UI representation
        const blockSize = Math.floor(channelData.length / samples);
        const peaks: number[] = [];

        for (let i = 0; i < samples; i++) {
            let start = blockSize * i;
            let sum = 0;
            for (let j = 0; j < blockSize; j++) {
                sum += Math.abs(channelData[start + j]);
            }
            peaks.push(sum / blockSize);
        }

        const max = Math.max(...peaks);
        const normalizedPeaks = peaks.map(p => (max ? p / max : 0));

        const data: WaveformData = {
            assetId,
            version: '1',
            peaks: normalizedPeaks,
            duration: audioBuffer.duration,
            generatedAt: Date.now()
        };

        await db.waveforms.add(data);
        return data;
    } catch (e) {
        console.error("Waveform generation failed:", e);
        return null;
    }
}
