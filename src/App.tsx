import React, { useState, useEffect } from 'react';
import { Search, Settings, Plus, Play, Pause, FolderInput, HardDriveDownload, AlertCircle, Star } from 'lucide-react';
import { useLiveQuery } from 'dexie-react-hooks';
import type { SoundAsset } from './db/db';
import { db } from './db/db';
import { scanFolder } from './services/scanner';
import { selectFolder } from './services/dialog';
import { hostAdapter } from './services/host';
import { player } from './services/player';
import { Waveform } from './components/Waveform';
import './index.css';

export default function App() {
  const [tabs, setTabs] = useState(['All Sounds']);
  const [activeTab, setActiveTab] = useState(0);
  const [query, setQuery] = useState('');
  const [isScanning, setIsScanning] = useState(false);
  const [scanProgress, setScanProgress] = useState(0);
  
  // Player state
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentAudio, setCurrentAudio] = useState<string | null>(null);
  const [progress, setProgress] = useState({ current: 0, duration: 0 });

  useEffect(() => {
     player.onStateChange = (playing, path) => {
         setIsPlaying(playing);
         setCurrentAudio(path);
     };
     player.onProgress = (curr, dur) => {
         setProgress({ current: curr, duration: dur });
     };
  }, []);

  const sounds = useLiveQuery(
    () => {
      if (query) {
        return db.sounds
          .where('filename').startsWithIgnoreCase(query)
          .or('tags').startsWithIgnoreCase(query)
          .limit(100)
          .toArray();
      }
      return db.sounds.orderBy('createdAt').reverse().limit(100).toArray();
    },
    [query]
  );

  const handleAddFolder = async () => {
    try {
      const folderPath = await selectFolder();
      if (!folderPath) return;

      setIsScanning(true);
      setScanProgress(0);
      
      const count = await scanFolder(folderPath, (c) => setScanProgress(c));
      
      alert(`Scanned and added/updated ${count} sounds.`);
    } catch (e: any) {
      alert("Error scanning folder: " + e.message);
    } finally {
      setIsScanning(false);
    }
  };

  const handleDoubleClick = (sound: SoundAsset) => {
     if (sound.missing) return;
     hostAdapter.insertAudioAtPlayhead({
         id: sound.id,
         filepath: sound.path,
         name: sound.filename
     });
  };
  
  const handleToggleFavorite = async (e: React.MouseEvent, sound: SoundAsset) => {
      e.stopPropagation();
      await db.sounds.update(sound.id, { favorite: !sound.favorite });
  };

  const formatTime = (time: number) => {
      if (isNaN(time)) return "00:00";
      const m = Math.floor(time / 60).toString().padStart(2, '0');
      const s = Math.floor(time % 60).toString().padStart(2, '0');
      return `${m}:${s}`;
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', width: '100%' }}>
      {/* Header / Tabs */}
      <div style={{ display: 'flex', alignItems: 'center', backgroundColor: 'var(--bg-darker)', borderBottom: '1px solid var(--border-color)', padding: '0 8px' }}>
        <div style={{ display: 'flex', flex: 1, gap: '4px', padding: '8px 0' }}>
          {tabs.map((tab, i) => (
            <div key={i} 
                 style={{ 
                   padding: '4px 16px', 
                   backgroundColor: activeTab === i ? 'var(--bg-panel)' : 'transparent',
                   border: activeTab === i ? '1px solid var(--border-color)' : '1px solid transparent',
                   borderBottom: activeTab === i ? '1px solid var(--bg-panel)' : 'none',
                   borderRadius: '4px 4px 0 0',
                   cursor: 'pointer',
                   fontSize: '13px',
                   marginBottom: '-9px',
                   zIndex: activeTab === i ? 1 : 0
                 }}
                 onClick={() => setActiveTab(i)}>
              {tab}
            </div>
          ))}
          <button onClick={() => setTabs([...tabs, `Search ${tabs.length + 1}`])} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', padding: '4px 8px' }}>
            <Plus size={14} />
          </button>
        </div>
        <button style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}>
          <Settings size={16} />
        </button>
      </div>

      {/* Main Toolbar */}
      <div style={{ padding: '12px', display: 'flex', gap: '8px', borderBottom: '1px solid var(--border-color)' }}>
        <div style={{ flex: 1, position: 'relative', display: 'flex', alignItems: 'center' }}>
          <Search size={16} style={{ position: 'absolute', left: '8px', color: 'var(--text-muted)' }} />
          <input 
            type="text" 
            placeholder="Search sound effects..." 
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            style={{ 
              width: '100%', 
              padding: '8px 8px 8px 32px', 
              backgroundColor: 'var(--bg-darker)', 
              border: '1px solid var(--border-color)', 
              borderRadius: '4px',
              color: 'var(--text-main)',
              outline: 'none'
            }} 
          />
        </div>
        <button 
          onClick={handleAddFolder}
          disabled={isScanning}
          style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '0 12px', backgroundColor: isScanning ? 'var(--bg-darker)' : 'var(--accent-color)', color: '#fff', border: 'none', borderRadius: '4px', cursor: isScanning ? 'not-allowed' : 'pointer', fontSize: '13px' }}>
          {isScanning ? <HardDriveDownload size={14} className="animate-pulse" /> : <FolderInput size={14} />}
          {isScanning ? `Scanning (${scanProgress})...` : 'Add Folder'}
        </button>
      </div>

      {/* Results Area */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '0' }}>
        {sounds === undefined && (
           <div style={{ color: 'var(--text-muted)', textAlign: 'center', padding: '40px', fontSize: '14px' }}>Loading...</div>
        )}
        
        {sounds !== undefined && sounds.length > 0 && (
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
            <tbody>
              {sounds.map((sound) => {
                const isActive = currentAudio === sound.path;
                return (
                <tr 
                  key={sound.id} 
                  onClick={() => { if (!sound.missing) player.play(sound.path); }}
                  onDoubleClick={() => handleDoubleClick(sound)}
                  draggable={!sound.missing}
                  onDragStart={(e) => { e.dataTransfer.setData('text/plain', sound.path); }}
                  style={{ 
                      borderBottom: '1px solid var(--border-color)', 
                      cursor: sound.missing ? 'not-allowed' : 'pointer',
                      opacity: sound.missing ? 0.5 : 1,
                      backgroundColor: isActive ? 'var(--row-hover)' : 'transparent'
                  }}
                >
                  <td style={{ padding: '8px', width: '20px' }}>
                    <Star 
                      size={14} 
                      color={sound.favorite ? '#FFD700' : 'var(--text-muted)'} 
                      fill={sound.favorite ? '#FFD700' : 'none'}
                      onClick={(e) => handleToggleFavorite(e, sound)}
                    />
                  </td>
                  <td style={{ padding: '8px 12px', color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    {sound.missing && <AlertCircle size={14} color="#ff4444" />}
                    {sound.filename}
                  </td>
                  <td style={{ padding: '8px 12px', color: 'var(--text-muted)', width: '120px' }}>
                     {!sound.missing && (
                         <Waveform 
                             assetId={sound.id} 
                             path={sound.path} 
                             onDoubleClick={() => handleDoubleClick(sound)} 
                         />
                     )}
                  </td>
                  <td style={{ padding: '8px 12px', color: 'var(--text-muted)' }}>{sound.category}</td>
                </tr>
              )})}
            </tbody>
          </table>
        )}
      </div>
      
      {/* Footer Player */}
      <div style={{ height: '60px', backgroundColor: 'var(--bg-darker)', borderTop: '1px solid var(--border-color)', display: 'flex', alignItems: 'center', padding: '0 16px', gap: '16px' }}>
         <button onClick={() => player.toggle(currentAudio || '')} style={{ background: 'var(--accent-color)', border: 'none', borderRadius: '50%', width: '32px', height: '32px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', cursor: 'pointer' }}>
           {isPlaying ? <Pause size={16} /> : <Play size={16} style={{ marginLeft: '2px' }}/>}
         </button>
         <div style={{ flex: 1, height: '4px', backgroundColor: 'var(--border-color)', borderRadius: '2px', position: 'relative' }}>
           <div style={{ position: 'absolute', left: 0, top: 0, bottom: 0, width: `${progress.duration ? (progress.current / progress.duration) * 100 : 0}%`, backgroundColor: 'var(--accent-color)', borderRadius: '2px' }}></div>
         </div>
         <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
             {formatTime(progress.current)} / {formatTime(progress.duration)}
         </div>
      </div>
    </div>
  );
}
