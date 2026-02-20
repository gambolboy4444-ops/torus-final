"use client";
import React, { useState, useEffect, useCallback, useRef } from 'react';

export default function App() {
  const [logs, setLogs] = useState<any[]>([]);
  const [isBurstActive, setIsBurstActive] = useState(false);
  const [torusCash, setTorusCash] = useState(0);
  const burstTimerRef = useRef<any>(null);

  // 🛰️ 通信エンドポイント（司令官のngrok環境に準拠）
  const ENDPOINT = 'https://improvident-tracklessly-kimberely.ngrok-free.dev/api/ingress';
  const roomId = 'TORUS-FINAL-SESSION';

  useEffect(() => {
    const style = document.createElement('style');
    style.innerHTML = `
      body { background-color: #020617 !important; color: #f8fafc !important; font-family: monospace; margin: 0; display: flex; align-items: center; justify-content: center; min-height: 100dvh; overflow: hidden; }
      .torus-container { width: 100%; max-width: 380px; display: flex; flex-direction: column; align-items: center; padding: 2rem; box-sizing: border-box; }
      .header { width: 100%; display: flex; justify-content: space-between; align-items: center; margin-bottom: 2.5rem; opacity: 0.5; font-size: 10px; letter-spacing: 0.1em; }
      .stats-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; width: 100%; margin-bottom: 2rem; }
      .card { background: #0f172a; border: 1px solid #1e293b; padding: 1.5rem 0.5rem; border-radius: 1.25rem; text-align: center; height: 100px; display: flex; flex-direction: column; justify-content: center; }
      .card-label { font-size: 9px; color: #64748b; margin-bottom: 0.5rem; font-weight: bold; }
      .card-value { font-size: 36px; font-weight: 900; line-height: 1; color: #ffffff; }
      .btn { width: 100%; padding: 1.5rem; border-radius: 1.25rem; font-weight: 900; cursor: pointer; border: none; margin-bottom: 1rem; text-transform: uppercase; letter-spacing: 0.2em; transition: all 0.1s; }
      .btn:active { transform: scale(0.96); opacity: 0.9; }
      .burst-btn { background: #ffffff; color: #020617; }
      .stop-btn { background: #ef4444; color: #ffffff; }
      .pulse-btn { background: #0f172a; border: 2px solid #3b82f6 !important; color: #ffffff; text-shadow: 0 0 10px #3b82f6; }
      .reset-btn { background: transparent; border: 1px solid #1e293b; color: #475569; padding: 0.4rem 0.8rem; border-radius: 0.5rem; font-size: 9px; cursor: pointer; }
      .log-box { width: 100%; height: 160px; background: rgba(0,0,0,0.4); border: 1px solid #1e293b; border-radius: 1.25rem; overflow-y: auto; padding: 1.25rem; font-size: 9px; margin-top: 1rem; }
      .log-entry { margin-bottom: 8px; color: #3b82f6; border-left: 2px solid #3b82f6; padding-left: 10px; }
    `;
    document.head.appendChild(style);
  }, []);

  const dispatchToCore = useCallback(async (isSilent = false) => {
    try {
      const res = await fetch(ENDPOINT, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type: 'INGRESS', roomId, payload: { name: 'OPERATOR' } }),
      });
      if (res.ok) {
        const data = await res.json();
        // 🚀 核心修正: Python側の current_count を正直に反映
        if (data.current_count !== undefined) {
          setTorusCash(data.current_count);
        }
        if (!isSilent) setLogs(p => [{id:Date.now(), msg:"✅ CORE_SYNCHRONIZED"}, ...p].slice(0, 8));
      }
    } catch (e) {
      if (!isSilent) setLogs(p => [{id:Date.now(), msg:"❌ CONNECTION_LOST"}, ...p].slice(0, 8));
    }
  }, []);

  useEffect(() => {
    if (isBurstActive) { burstTimerRef.current = setInterval(() => dispatchToCore(true), 1000); }
    else { clearInterval(burstTimerRef.current); }
    return () => clearInterval(burstTimerRef.current);
  }, [isBurstActive, dispatchToCore]);

  return (
    <div className="torus-container">
      <div className="header">
        <span style={{fontWeight: '900'}}>TORUS SATELLITE V12.4</span>
        <button className="reset-btn" onClick={() => window.location.reload()}>RESET</button>
      </div>
      <div className="stats-grid">
        <div className="card"><div className="card-label">OPERATOR</div><div className="card-value">{torusCash}</div></div>
        <div className="card"><div className="card-label">USERS</div><div className="card-value">0</div></div>
      </div>
      {!isBurstActive ? <button className="btn burst-btn" onClick={() => setIsBurstActive(true)}>⚡ BURST</button>
      : <button className="btn stop-btn" onClick={() => setIsBurstActive(false)}>■ STOP</button>}
      <button className="btn pulse-btn" onClick={() => dispatchToCore()}>💠 SINGLE PULSE</button>
      <div className="log-box">
        {logs.map(log => <div key={log.id} className="log-entry">{log.msg}</div>)}
      </div>
    </div>
  );
}
