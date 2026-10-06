import { StrictMode, useEffect, useState } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'

function DiagnosticBoot() {
  const [logs, setLogs] = useState<string[]>(['HTML loaded', 'JavaScript executed', 'React mounted']);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    window.onerror = (message, source, lineno, colno, err) => {
      setError(`Error: ${message} at ${source}:${lineno}:${colno}\nStack: ${err?.stack || 'N/A'}`);
    };
    
    // Check CEP
    // @ts-ignore
    const hasCEP = typeof window !== 'undefined' && window.__adobe_cep__ !== undefined;
    setLogs(l => [...l, `CEP available: ${hasCEP ? 'PASS' : 'FAIL'}`]);
    
    // Check CSInterface
    // @ts-ignore
    const hasCSInterface = typeof window !== 'undefined' && window.CSInterface !== undefined;
    setLogs(l => [...l, `CSInterface available: ${hasCSInterface ? 'PASS' : 'FAIL'}`]);
    
    // Check Node (require)
    // @ts-ignore
    const hasNode = typeof window !== 'undefined' && typeof window.require !== 'undefined';
    setLogs(l => [...l, `Node (require) available: ${hasNode ? 'PASS' : 'FAIL'}`]);
  }, []);

  return (
    <div style={{ padding: 20, color: '#0f0', background: '#111', minHeight: '100vh', fontFamily: 'monospace', fontSize: 16 }}>
      <h2>SFX Studio - Boot Diagnostics</h2>
      <ul style={{ listStyle: 'none', padding: 0 }}>
        {logs.map((log, i) => <li key={i}>[{log.includes('PASS') ? 'PASS' : 'INFO'}] {log}</li>)}
      </ul>
      {error && (
        <div style={{ background: '#500', border: '1px solid red', padding: 10, marginTop: 20, whiteSpace: 'pre-wrap' }}>
          <strong>UNCAUGHT EXCEPTION:</strong><br/>
          {error}
        </div>
      )}
    </div>
  )
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <DiagnosticBoot />
  </StrictMode>,
)
