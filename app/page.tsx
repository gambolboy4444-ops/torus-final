"use client";
import React, { useState, useEffect, useCallback, useRef } from 'react';

// --- Types & Constants ---
type LogEntry = { id: string; type: 'INBOUND' | 'OUTBOUND' | 'SYSTEM' | 'ERROR'; name: string; timestamp: number; };
const MOCK_NAMES = ['NEON_DRAGON', 'VOID_RUNNER', 'CYBER_KITSUNE', 'ZERO_PHANTOM', 'ECHO_ALPHA'];

export default function Page() {
  const [identity, setIdentity] = useState('TORUS_OPERATOR');
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [isBurstActive, setIsBurstActive] = useState(false);
  const [isOnline, setIsOnline] = useState(false);
  
  const statsRef = useRef({ torusCash: 0, userCash: 0 });
  const [displayStats, setDisplayStats] = useState({ torusCash: 0, userCash: 0 });
  const burstTimerRef = useRef<any>(null);

  const addLog = useCallback((type: LogEntry['type'], name: string) => {
    const newLog: LogEntry = { id: Math.random().toString(36), type, name, timestamp: Date.now() };
    setLogs(prev => [newLog, ...prev].slice(0, 50));
  }, []);

  const dispatchToCore = useCallback(async (targetName: string, isSilent = false) => {
    try {
      const response = await fetch('https://torus-genesis-core.vercel.app/api/ingress', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type: 'INGRESS', roomId: 'TORUS-SYNC-01', payload: { name: targetName } }),
      });
      if (response.ok) {
        setIsOnline(true);
        if (!isSilent) addLog('SYSTEM', "✅ GENESIS 接続成功");
      }
    } catch (e) {
      if (!isSilent) addLog('ERROR', "❌ 送信失敗");
    }
  }, [addLog]);

  const handleSinglePulse = () => {
    dispatchToCore(identity);
    addLog('OUTBOUND', `TX:PULSE_SENT`);
    if ("vibrate" in navigator) navigator.vibrate(20);
  };

  useEffect(() => {
    if (isBurstActive) {
      burstTimerRef.current = setInterval(() => {
        dispatchToCore(`${MOCK_NAMES[Math.floor(Math.random()*MOCK_NAMES.length)]}_${Math.random().toString(16).substring(10)}`, true);
        statsRef.current.userCash += 1;
        setDisplayStats({...statsRef.current});
      }, 1000);
    } else {
      clearInterval(burstTimerRef.current);
    }
    return () => clearInterval(burstTimerRef.current);
  }, [isBurstActive, dispatchToCore]);

  return (
    <div className="min-h-screen bg-[#020617] text-slate-100 font-mono flex flex-col items-center p-4">
      <header className="w-full max-w-md border border-slate-800 p-4 rounded-2xl mb-4 bg-[#0f172a]">
        <h1 className="text-xs text-blue-400 font-black">TORUS SATELLITE V12.0.55</h1>
        <div className="text-[10px] text-emerald-400">{isOnline ? '● STABLE' : '○ OFFLINE'}</div>
      </header>

      <main className="w-full max-w-md space-y-4">
        <button onClick={() => setIsBurstActive(!isBurstActive)} className={`w-full py-12 rounded-3xl font-black text-3xl shadow-xl transition-all ${isBurstActive ? 'bg-blue-600' : 'bg-white text-black'}`}>
          {isBurstActive ? 'STOP BURST' : '⚡ BURST'}
        </button>

        {/* 💠 復活の SINGLE PULSE */}
        <button onClick={handleSinglePulse} className="w-full py-8 rounded-2xl font-black text-xl border-2 border-blue-500 bg-black text-white shadow-[0_0_20px_rgba(59,130,246,0.5)] active:scale-95">
          SINGLE PULSE
        </button>

        <div className="bg-black/40 border border-slate-800 rounded-2xl p-4 h-64 overflow-y-auto text-[10px]">
          {logs.map(log => <div key={log.id} className="mb-1">[{new Date(log.timestamp).toLocaleTimeString()}] {log.type}: {log.name}</div>)}
        </div>
      </main>
    </div>
  );
}
