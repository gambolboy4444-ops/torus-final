'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';

// --- 🛰️ CONFIGURATION ---
// 司令官から提供された最新の ngrok URL を適用済み
const ENDPOINT = 'https://improvident-tracklessly-kimberly.ngrok-free.dev/api/ingress';
const ROOM_ID = 'TORUS-SYNC-01';

export default function TorusSatellite() {
  const [torusCash, setTorusCash] = useState(0);
  const [isBurstActive, setIsBurstActive] = useState(false);
  const [isOnline, setIsOnline] = useState(false);
  const [logs, setLogs] = useState<{id: number, msg: string}[]>([]);
  const burstTimerRef = useRef<NodeJS.Timeout | null>(null);

  const addLog = useCallback((msg: string) => {
    setLogs(prev => [{ id: Date.now(), msg }, ...prev].slice(0, 5));
  }, []);

  // 🚨 核心部：Python(Genesis Core)との同期
  const dispatchToCore = useCallback(async (isSilent = false) => {
    try {
      const res = await fetch(ENDPOINT, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type: 'INGRESS', roomId: ROOM_ID, payload: { name: 'OPERATOR' } }),
      });
      if (res.ok) {
        const data = await res.json();
        setIsOnline(true);
        // Python側の 'current_count' を確実に受け取る
        if (data.current_count !== undefined) setTorusCash(data.current_count);
        if (!isSilent) addLog("✅ CORE_SYNC");
      }
    } catch (e) {
      setIsOnline(false);
      if (!isSilent) addLog("❌ CONN_ERR");
    }
  }, [addLog]);

  // BURSTモード制御
  useEffect(() => {
    if (isBurstActive) {
      burstTimerRef.current = setInterval(() => dispatchToCore(true), 500);
    } else {
      if (burstTimerRef.current) clearInterval(burstTimerRef.current);
    }
    return () => { if (burstTimerRef.current) clearInterval(burstTimerRef.current); };
  }, [isBurstActive, dispatchToCore]);

  // 🛡️ カオナシ回避：生のCSSを直接頭脳に叩き込む（デザイン保護プロトコル）
  useEffect(() => {
    const style = document.createElement('style');
    style.innerHTML = `
      body { background-color: #020617 !important; color: white; font-family: 'Courier New', monospace; margin: 0; display: flex; justify-content: center; overflow-x: hidden; }
      .torus-container { width: 100vw; max-width: 400px; padding: 20px; display: flex; flex-direction: column; gap: 15px; min-height: 100vh; box-sizing: border-box; }
      .card { background: #0f172a; border: 1px solid #1e293b; padding: 25px; border-radius: 16px; text-align: center; box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.5); }
      .btn-burst { background: white; color: black; padding: 35px; border-radius: 24px; font-size: 28px; font-weight: 900; border: none; cursor: pointer; border-bottom: 6px solid #cbd5e1; transition: all 0.1s; letter-spacing: 2px; }
      .btn-burst:active { transform: translateY(4px); border-bottom: 0; }
      .btn-pulse { background: #0f172a; color: white; border: 2px solid #334155; padding: 20px; border-radius: 16px; font-weight: bold; cursor: pointer; letter-spacing: 4px; transition: all 0.2s; }
      .btn-pulse:active { background: #1e293b; border-color: #60a5fa; }
      .status-tag { font-size: 10px; padding: 4px 12px; border-radius: 99px; border: 1px solid #334155; font-weight: bold; }
      .online { color: #10b981; border-color: #065f46; box-shadow: 0 0 10px rgba(16, 185, 129, 0.2); }
      .log-box { background: rgba(0,0,0,0.6); border: 1px solid #1e293b; border-radius: 12px; height: 160px; padding: 12px; font-size: 10px; color: #60a5fa; overflow: hidden; box-shadow: inset 0 2px 4px 0 rgba(0, 0, 0, 0.9); }
    `;
    document.head.appendChild(style);
    dispatchToCore(true); 
  }, [dispatchToCore]);

  return (
    <div className="torus-container">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '10px' }}>
        <div>
          <div style={{ fontSize: '8px', color: '#64748b', letterSpacing: '3px', fontWeight: '900' }}>SATELLITE UI</div>
          <div style={{ fontWeight: '900', fontSize: '14px' }}>TORUS BURST V12.5+</div>
        </div>
        <div className={`status-tag ${isOnline ? 'online' : ''}`}>
          {isOnline ? '● STABLE' : '○ OFFLINE'}
        </div>
      </div>

      <div className="card">
        <div style={{ fontSize: '9px', color: '#60a5fa', marginBottom: '8px', fontWeight: 'bold', letterSpacing: '1px' }}>OPERATOR TOTAL</div>
        <div style={{ fontSize: '42px', fontWeight: '900', color: '#ffffff' }}>{torusCash.toLocaleString()}</div>
      </div>

      <button className="btn-burst" onClick={() => setIsBurstActive(!isBurstActive)} style={isBurstActive ? {background: '#1e293b', color: '#475569', borderBottom: '0'} : {}}>
        {isBurstActive ? 'SYNCING...' : '⚡ BURST'}
      </button>

      <button className="btn-pulse" onClick={() => dispatchToCore()}>
        💠 SINGLE PULSE
      </button>

      <div className="log-box">
        <div style={{ borderBottom: '1px solid #1e293b', paddingBottom: '6px', marginBottom: '8px', opacity: 0.5, fontSize: '8px', letterSpacing: '1px' }}>TELEMETRY FEED</div>
        {logs.map(log => (
          <div key={log.id} style={{ marginBottom: '4px' }}>
            <span style={{ opacity: 0.4 }}>[{new Date(log.id).toLocaleTimeString()}]</span> {log.msg}
          </div>
        ))}
        {logs.length === 0 && <div style={{ textAlign: 'center', marginTop: '40px', opacity: 0.2 }}>WAITING FOR SIGNAL...</div>}
      </div>
      
      <div style={{ textAlign: 'center', fontSize: '8px', color: '#1e293b', marginTop: 'auto', letterSpacing: '5px' }}>
        TORUS DIRECT PROTOCOL
      </div>
    </div>
  );
}
