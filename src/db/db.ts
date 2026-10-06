import Dexie, { type Table } from 'dexie';

export interface Folder {
  id: string; // The full path as ID
  path: string;
  name: string;
  addedAt: number;
}

export interface SoundAsset {
  id: string; // stable internal UUID
  path: string; // current local path
  filename: string;
  folderId: string;
  size?: number;
  modifiedAt?: number;
  duration?: number;
  format?: string;
  category: string;
  tags: string[];
  favorite: boolean;
  createdAt: number;
  lastUsedAt: number;
  usageCount: number;
  sourceType: 'local' | 'online' | 'ai';
  missing: boolean;
  fingerprint?: string;
}

export interface WaveformData {
  assetId: string;
  version: string;
  peaks: number[];
  duration: number;
  generatedAt: number;
}

export class SFXDatabase extends Dexie {
  sounds!: Table<SoundAsset, string>;
  folders!: Table<Folder, string>;
  waveforms!: Table<WaveformData, string>;

  constructor() {
    super('SFXStudioDB');
    
    // DB v1 Architecture: Built for safe future migrations
    this.version(2).stores({
      sounds: 'id, path, filename, folderId, format, category, favorite, sourceType, *tags, missing, fingerprint',
      folders: 'id, path',
      waveforms: 'assetId, generatedAt'
    });
  }
}

export const db = new SFXDatabase();
