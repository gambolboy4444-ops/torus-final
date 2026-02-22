'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';

export default function TorusSatellite() {
  const [torusCash, setTorusCash] = useState(0);
  const [userCash, setUserCash] = useState(0);
  const [isBurstActive, setIsBurstActive] = useState(false);
  const [logs, setLogs] = useState<{id:number, msg:string, type:string}[]>([]);
  const [ngrokUrl, setNgrokUrl] = useState("");
  const [identity, setIdentity] = useState("TORUS_OPERATOR");
  const burstTimerRef = useRef<any>(null);

  const addLog = (msg: string, type = "SYSTEM") => {
    setLogs(prev => [{ id: Date.now(), msg, type }, ...prev].slice(0, 10));
  };

  const dispatchToCore = useCallback(async (isSilent = false) => {
    if (!ngrokUrl) {
      if (!isSilent) addLog("❌ URL_REQUIRED", "ERROR");
      return;
    }
    try {
      const endpoint = `${ngrokUrl.replace(/\/$/, "")}/api/ingress`;
      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type: 'INGRESS', roomId: 'TORUS-01', payload: { name: identity } }),
      });
      if (res.ok) {
        const data = await res.json();
        if (data.current_count !== undefined) setTorusCash(data.current_count);
        if (!isSilent) addLog("✅ CORE_SYNCHRONIZED", "SYSTEM");
      }
    } catch (e) {
      if (!isSilent) addLog("❌ CONNECTION_FAILED", "ERROR");
    }
  }, [ngrokUrl, identity]);

  useEffect(() => {
    if (isBurstActive) {
      burstTimerRef.current = setInterval(() => dispatchToCore(true), 1000);
    } else {
      clearInterval(burstTimerRef.current);
    }
    return () => clearInterval(burstTimerRef.current);
  }, [isBurstActive, dispatchToCore]);

  // --- Styles ---
  const containerStyle: React.CSSProperties = { backgroundColor: '#020617', minHeight: '100vh', color: '#f8fafc', fontFamily: 'monospace', display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '20px' };
  const cardStyle: React.CSSProperties = { width: '100%', maxWidth: '440px', backgroundColor: '#0f172a', border: '1px solid #1e293b', borderRadius: '24px', padding: '20px', marginBottom: '12px', boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.4)' };
  const inputStyle: React.CSSProperties = { width: '100%', backgroundColor: '#000', border: '1px solid #334155', borderRadius: '12px', padding: '12px', color: '#10b981', fontSize: '13px', outline: 'none', marginTop: '8px' };
  const burstBtnStyle: React.CSSProperties = { width: '100%', padding: '40px 0', borderRadius: '30px', fontWeight: '900', fontSize: '32px', border: 'none', cursor: 'pointer', transition: '0.2s', backgroundColor: isBurstActive ? '#1e293b' : '#fff', color: isBurstActive ? '#475569' : '#020617', boxShadow: isBurstActive ? 'none' : '0 10px 0 #cbd5e1', marginBottom: '15px' };
  const pulseBtnStyle: React.CSSProperties = { width: '100%', padding: '20px 0', borderRadius: '18px', fontWeight: '900', fontSize: '18px', backgroundColor: '#0f172a', border: '2px solid #334155', color: '#fff', cursor: 'pointer', letterSpacing: '8px', textShadow: '0 0 10px #fff' };

  return (
    <div style={containerStyle}>
      {/* Header */}
      <div style={{ ...cardStyle, display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '15px 20px' }}>
        <div>
          <p style={{ fontSize: '8px', color: '#475569', margin: 0, fontWeight: 900 }}>SATELLITE UI</p>
          <p style={{ fontSize: '14px', fontWeight: 900, margin: 0 }}>TORUS BURST V13.5</p>
        </div>
        <div style={{ padding: '4px 12px', borderRadius: '20px', border: '1px solid #ef4444', color: '#ef4444', fontSize: '10px', fontWeight: 900 }}>● {ngrokUrl ? 'ACTIVE' : 'OFFLINE'}</div>
      </div>

      {/* URL Input */}
      <div style={cardStyle}>
        <p style={{ fontSize: '9px', color: '#3b82f6', fontWeight: 900, letterSpacing: '1px', margin: 0 }}>CORE ENDPOINT (ngrok)</p>
        <input type="text" value={ngrokUrl} onChange={(e) => setNgrokUrl(e.target.value)} placeholder="https://xxxx.ngrok-free.app" style={inputStyle} />
      </div>

      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', width: '100%', maxWidth: '440px', marginBottom: '15px' }}>
        <div style={{ ...cardStyle, textAlign: 'center', margin: 0 }}>
          <p style={{ fontSize: '8px', color: '#3b82f6', fontWeight: 900 }}>OPERATOR ❤️</p>
          <p style={{ fontSize: '32px', fontWeight: 900, margin: 0 }}>{torusCash}</p>
        </div>
        <div style={{ ...cardStyle, textAlign: 'center', margin: 0 }}>
          <p style={{ fontSize: '8px', color: '#10b981', fontWeight: 900 }}>DUMMY USERS ❤️</p>
          <p style={{ fontSize: '32px', fontWeight: 900, margin: 0 }}>{userCash}</p>
        </div>
      </div>

      {/* Buttons */}
      <div style={{ width: '100%', maxWidth: '440px' }}>
        <button onClick={() => setIsBurstActive(!isBurstActive)} style={burstBtnStyle}>⚡ BURST</button>
        <button onClick={() => dispatchToCore(false)} style={pulseBtnStyle}>SINGLE PULSE</button>
      </div>

      {/* Signature */}
      <div style={{ ...cardStyle, marginTop: '15px' }}>
        <p style={{ fontSize: '8px', color: '#475569', fontWeight: 900 }}>OPERATOR SIGNATURE</p>
        <input type="text" value={identity} onChange={(e) => setIdentity(e.target.value)} style={inputStyle} />
      </div>

      {/* Telemetry */}
      <div style={{ ...cardStyle, height: '180px', overflowY: 'auto', backgroundColor: 'rgba(0,0,0,0.5)' }}>
        <p style={{ fontSize: '8px', color: '#475569', fontWeight: 900, marginBottom: '10px' }}>TELEMETRY FEED</p>
        {logs.map(log => (
          <div key={log.id} style={{ fontSize: '10px', padding: '5px 0', borderBottom: '1px solid #1e293b', color: log.type === 'ERROR' ? '#ef4444' : '#94a3b8' }}>{log.msg}</div>
        ))}
      </div>
    </div>
  );
}
