import { db } from '../db/db';

export async function scanFolder(folderPath: string, onProgress: (count: number) => void): Promise<number> {
    // @ts-ignore
    if (typeof window.require === 'undefined') {
        throw new Error("Node.js environment not detected. Cannot scan folders. Make sure you are running inside Premiere Pro with CEP.");
    }
    
    // @ts-ignore
    const fs = window.require('fs');
    // @ts-ignore
    const path = window.require('path');

    let count = 0;

    const folderExists = await db.folders.where('id').equals(folderPath).count();
    if (folderExists === 0) {
        await db.folders.add({
            id: folderPath,
            path: folderPath,
            name: path.basename(folderPath),
            addedAt: Date.now()
        });
    }

    const existingSounds = await db.sounds.where('folderId').equals(folderPath).toArray();
    const processedPaths = new Set<string>();

    async function walk(dir: string) {
        const files = fs.readdirSync(dir);
        for (const file of files) {
            const fullPath = path.join(dir, file);
            let stat;
            try {
               stat = fs.statSync(fullPath);
            } catch(e) {
               continue; 
            }
            
            if (stat.isDirectory()) {
                await walk(fullPath);
            } else {
                const ext = path.extname(fullPath).toLowerCase();
                if (ext === '.wav' || ext === '.mp3' || ext === '.m4a' || ext === '.aac') {
                    processedPaths.add(fullPath);
                    
                    const size = stat.size;
                    const modifiedAt = stat.mtimeMs;
                    // Lightweight content fingerprint
                    const fingerprint = `${size}_${modifiedAt}`;
                    const filenameNoExt = path.basename(file, ext);

                    // 1. Try to find by exact path
                    let sound = await db.sounds.where('path').equals(fullPath).first();
                    
                    if (!sound) {
                        // 2. Try to find by fingerprint (Moved/Renamed file)
                        sound = await db.sounds.where('fingerprint').equals(fingerprint).first();
                    }

                    if (sound) {
                        // Update existing metadata and ensure it's not marked missing
                        await db.sounds.update(sound.id, {
                            path: fullPath,
                            filename: file,
                            size: size,
                            modifiedAt: modifiedAt,
                            missing: false,
                            fingerprint: fingerprint
                        });
                    } else {
                        // New sound asset
                        await db.sounds.add({
                            id: (typeof crypto !== 'undefined' && crypto.randomUUID) ? crypto.randomUUID() : Math.random().toString(36).substring(2) + Date.now().toString(36),
                            path: fullPath,
                            filename: file,
                            folderId: folderPath,
                            size: size,
                            modifiedAt: modifiedAt,
                            duration: 0, 
                            format: ext.replace('.', ''),
                            category: path.basename(dir),
                            tags: filenameNoExt.toLowerCase().split(/[\s_+-]+/),
                            favorite: false,
                            createdAt: Date.now(),
                            lastUsedAt: 0,
                            usageCount: 0,
                            sourceType: 'local',
                            missing: false,
                            fingerprint: fingerprint
                        });
                        count++;
                        if (count % 10 === 0) {
                            onProgress(count);
                        }
                    }
                }
            }
        }
    }

    await walk(folderPath);

    // Any files for this folder that were NOT processed are now missing
    for (const sound of existingSounds) {
        if (!processedPaths.has(sound.path) && !sound.missing) {
            await db.sounds.update(sound.id, { missing: true });
        }
    }

    return count;
}
