import type { HostAdapter, AudioAsset, InsertResult } from './HostAdapter';

export class PremiereAdapter implements HostAdapter {
    async insertAudioAtPlayhead(asset: AudioAsset): Promise<InsertResult> {
        return new Promise((resolve) => {
            // @ts-ignore
            if (typeof window.CSInterface === "undefined" && typeof CSInterface === "undefined") {
                console.log("Mock Premiere insert: ", asset.filepath);
                resolve({ success: true });
                return;
            }
            // @ts-ignore
            const cs = new CSInterface();
            const escapedPath = asset.filepath.replace(/\\/g, '\\\\');
            cs.evalScript(`$._SFXStudio.insertAudioAtPlayhead("${escapedPath}")`, (res: string) => {
                if (res === "Success") {
                    resolve({ success: true });
                } else {
                    console.error("Insertion failed:", res);
                    resolve({ success: false, error: res });
                }
            });
        });
    }
}
