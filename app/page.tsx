"use client";
import React, { useState, useEffect, useCallback, useRef } from 'react';

export default function TorusSatellite() {
  const [torusCash, setTorusCash] = useState(0);
  const [isBurstActive, setIsBurstActive] = useState(false);
  const [logs, setLogs] = useState<{id:number, msg:string}[]>([]);
  const [ngrokUrl, setNgrokUrl] = useState("");
  const burstTimerRef = useRef<any>(null);

  const addLog = (msg: string) => {
    setLogs(prev => [{ id: Date.now(), msg }, ...prev].slice(0, 8));
  };

  const dispatchToCore = useCallback(async (isSilent = false) => {
    if (!ngrokUrl) {
      if (!isSilent) addLog("❌ URL_MISSING");
      return;
    }
    try {
      const endpoint = `${ngrokUrl.replace(/\/$/, "")}/api/ingress`;
      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type: 'INGRESS', roomId: 'TORUS-01', payload: { name: 'OPERATOR' } }),
      });
      if (res.ok) {
        const data = await res.json();
        if (data.current_count !== undefined) setTorusCash(data.current_count);
        if (!isSilent) addLog("✅ CORE_SYNCHRONIZED");
      }
    } catch (e) {
      if (!isSilent) addLog("❌ CONNECTION_LOST");
    }
  }, [ngrokUrl]);

  useEffect(() => {
    if (isBurstActive) {
      burstTimerRef.current = setInterval(() => dispatchToCore(true), 1000);
    } else {
      clearInterval(burstTimerRef.current);
    }
    return () => clearInterval(burstTimerRef.current);
  }, [isBurstActive, dispatchToCore]);

  return (
    <div style={{ backgroundColor: '#020617', minHeight: '100vh', color: '#f8fafc', fontFamily: 'monospace', display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '24px' }}>
      
      {/* 🚀 URL 入力エリア */}
      <div style={{ width: '100%', maxWidth: '400px', marginBottom: '20px', padding: '16px', backgroundColor: '#0f172a', border: '1px solid #1e293b', borderRadius: '16px' }}>
        <label style={{ fontSize: '10px', color: '#3b82f6', fontWeight: '900', display: 'block', marginBottom: '8px', letterSpacing: '2px' }}>CORE ENDPOINT (NGROK)</label>
        <input 
          type="text" 
          value={ngrokUrl}
          onChange={(e) => setNgrokUrl(e.target.value)}
          placeholder="https://xxxx.ngrok-free.app"
          style={{ width: '100%', backgroundColor: '#000', border: '1px solid #334155', borderRadius: '8px', padding: '10px', color: '#10b981', fontSize: '12px', outline: 'none' }}
        />
      </div>

      {/* 💰 キャッシュ表示 */}
      <div style={{ width: '100%', maxWidth: '400px', backgroundColor: '#0f172a', border: '1px solid #1e293b', padding: '32px', borderRadius: '40px', textAlign: 'center', marginBottom: '24px', boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.5)' }}>
        <p style={{ fontSize: '10px', color: '#3b82f6', fontWeight: '900', marginBottom: '8px', letterSpacing: '2px' }}>TORUS CASH</p>
        <p style={{ fontSize: '60px', fontWeight: '900', margin: '0', color: '#fff' }}>{torusCash.toLocaleString()}</p>
      </div>

      {/* ⚡ ボタンエリア */}
      <div style={{ width: '100%', maxWidth: '400px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
        <button
          onClick={() => setIsBurstActive(!isBurstActive)}
          style={{ width: '100%', padding: '40px 0', borderRadius: '24px', fontWeight: '900', fontSize: '32px', border: 'none', cursor: 'pointer', transition: '0.2s', backgroundColor: isBurstActive ? '#1e293b' : '#fff', color: isBurstActive ? '#475569' : '#020617', boxShadow: isBurstActive ? 'none' : '0 8px 0 #cbd5e1' }}
        >
          {isBurstActive ? 'STOP BURST' : '⚡ BURST'}
        </button>

        <button
          onClick={() => dispatchToCore(false)}
          style={{ width: '100%', padding: '24px 0', borderRadius: '16px', fontWeight: '900', fontSize: '18px', backgroundColor: '#0f172a', border: '2px solid #334155', color: '#fff', cursor: 'pointer' }}
        >
          💠 SINGLE PULSE
        </button>
      </div>

      {/* 📜 ログエリア */}
      <div style={{ width: '100%', maxWidth: '400px', marginTop: '24px', backgroundColor: 'rgba(0,0,0,0.4)', border: '1px solid #1e293b', borderRadius: '16px', padding: '16px', height: '160px', overflowY: 'auto' }}>
        <p style={{ fontSize: '8px', color: '#475569', fontWeight: '900', marginBottom: '8px', letterSpacing: '2px' }}>TELEMETRY</p>
        {logs.map(log => (
          <div key={log.id} style={{ fontSize: '10px', padding: '4px 0', borderBottom: '1px solid #0f172a', color: '#94a3b8' }}>{log.msg}</div>
        ))}
      </div>
    </div>
  );
}
