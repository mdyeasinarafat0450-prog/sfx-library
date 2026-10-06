export interface AudioAsset {
  id: string;
  filepath: string;
  name: string;
}

export interface InsertResult {
  success: boolean;
  error?: string;
}

export interface SequenceInfo {
  name: string;
}

export interface AudioTrackInfo {
  index: number;
  name: string;
}

export interface HostAdapter {
    getActiveSequence?(): Promise<SequenceInfo | null>;
    getCurrentPlayheadTime?(): Promise<number>;
    getTargetAudioTrack?(): Promise<AudioTrackInfo | null>;
    insertAudioAtPlayhead(asset: AudioAsset): Promise<InsertResult>;
}
