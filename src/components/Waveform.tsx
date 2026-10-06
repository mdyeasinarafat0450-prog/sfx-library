import { useEffect, useState } from 'react';
import { generateWaveform } from '../services/waveform';
import type { WaveformData } from '../db/db';

interface WaveformProps {
    assetId: string;
    path: string;
    onDoubleClick: () => void;
}

export function Waveform({ assetId, path, onDoubleClick }: WaveformProps) {
    const [data, setData] = useState<WaveformData | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        let mounted = true;
        setLoading(true);
        // Fire asynchronously so it doesn't block UI immediately
        setTimeout(() => {
            generateWaveform(assetId, path).then(res => {
                if (mounted) {
                    setData(res);
                    setLoading(false);
                }
            });
        }, 10);
        return () => { mounted = false; };
    }, [assetId, path]);

    if (loading) {
        return (
            <div style={{ display: 'flex', alignItems: 'center', height: '24px', flex: 1, opacity: 0.3 }}>
                <div style={{ width: '100%', height: '2px', backgroundColor: 'var(--text-muted)' }}></div>
            </div>
        );
    }

    if (!data) {
        return <div style={{ fontSize: '10px', color: 'var(--text-muted)' }}>No Waveform</div>;
    }

    return (
        <div 
            onDoubleClick={(e) => {
                e.stopPropagation(); 
                onDoubleClick();
            }}
            style={{ display: 'flex', alignItems: 'center', height: '24px', gap: '2px', cursor: 'pointer', flex: 1 }}
        >
            {data.peaks.map((p, i) => (
                <div key={i} style={{ 
                    flex: 1,
                    height: `${Math.max(10, p * 100)}%`, 
                    backgroundColor: 'var(--text-muted)',
                    borderRadius: '1px'
                }}></div>
            ))}
        </div>
    );
}
