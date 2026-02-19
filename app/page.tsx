"use client";
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Bolt, Crosshair, Server } from 'lucide-react';

const MOCK_NAMES = ['NEON_DRAGON', 'VOID_RUNNER', 'CYBER_KITSUNE', 'SOUL_BREAKER', 'ZERO_PHANTOM'];

export default function TorusApp() {
  const [identity, setIdentity] = useState('TORUS_OPERATOR');
  const [logs, setLogs] = useState<any[]>([]);
  const [isBurstActive, setIsBurstActive] = useState(false);
  const [isOnline, setIsOnline] = useState(false);
  const [torusCash, setTorusCash] = useState(0);

  const roomId = 'TORUS-SYNC-01';
  const ENDPOINT = 'https://torus-genesis-core.vercel.app/api/ingress';
  const SYNC_URL = 'https://torus-genesis-core.vercel.app/api/egress';

  const addLog = useCallback((type: string, name: string) => {
    const newLog = { id: Date.now(), type, name, timestamp: Date.now() };
    setLogs(prev => [newLog, ...prev].slice(0, 50));
  }, []);

  // 🚀 真実の同期ロジック：Core側の current_count を直接取得して反映
  const dispatchToCore = useCallback(async (targetName: string, isSilent = false) => {
    try {
      const res = await fetch(ENDPOINT, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          type: 'INGRESS', 
          roomId, 
          payload: { name: targetName, id: `TX-${Math.random().toString(36).substring(2,7).toUpperCase()}` } 
        }),
      });
      if (res.ok) {
        const data = await res.json();
        setIsOnline(true);
        // Core側（Python）のキー 'current_count' を確実に捕捉
        if (data.current_count !== undefined) {
          setTorusCash(data.current_count);
        }
        if (!isSilent) addLog('SYSTEM', "✅ CORE_SYNCHRONIZED");
      }
    } catch (e) {
      setIsOnline(false);
      if (!isSilent) addLog('ERROR', "❌ CONNECTION_LOST");
    }
  }, [addLog]);

  // 定期的なステータス確認
  useEffect(() => {
    const timer = setInterval(async () => {
      try {
        const res = await fetch(`${SYNC_URL}?roomId=${roomId}&t=${Date.now()}`);
        if (res.ok) setIsOnline(true);
      } catch (e) { setIsOnline(false); }
    }, 3000);
    return () => clearInterval(timer);
  }, []);

  // BURSTモードの射出制御
  useEffect(() => {
    let timer: any;
    if (isBurstActive) {
      timer = setInterval(() => {
        const mockName = `${MOCK_NAMES[Math.floor(Math.random()*MOCK_NAMES.length)]}_${Math.random().toString(16).substring(10)}`;
        dispatchToCore(mockName, true);
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [isBurstActive, dispatchToCore]);

  return (
    <main className="min-h-screen bg-[#020617] text-slate-100 font-mono p-4 flex flex-col items-center">
      {/* 🛰️ UI側 HEADER */}
      <div className="w-full max-w-md bg-[#0f172a] border border-slate-800 p-4 rounded-2xl flex justify-between items-center mb-4 shadow-2xl">
        <div className="flex items-center gap-3">
          <div className={`p-2 rounded-xl border ${isOnline ? 'bg-emerald-500/20 border-emerald-500 shadow-[0_0_10px_#10b981]' : 'bg-slate-800 border-slate-700'}`}>
            <Server size={16} className={isOnline ? 'text-emerald-400' : 'text-slate-500'} />
          </div>
          <div>
            <h1 className="text-[8px] uppercase tracking-widest text-slate-500 font-black">Satellite UI</h1>
            <p className="text-sm font-black text-white tracking-tighter">TORUS DIRECT PROTOCOL</p>
          </div>
        </div>
        <div className={`text-[9px] font-black px-2 py-1 rounded-full border transition-all ${isOnline ? 'text-emerald-400 border-emerald-500/50' : 'text-red-400 border-red-500/50 animate-pulse'}`}>
          {isOnline ? 'STABLE (DIRECT)' : 'OFFLINE'}
        </div>
      </div>

      {/* 🛰️ UI側 STATS PANEL */}
      <div className="w-full max-w-md mb-4">
        <div className="bg-[#0f172a]/60 border border-slate-800 p-6 rounded-2xl text-center shadow-xl backdrop-blur-md">
          <p className="text-[10px] text-blue-400 uppercase font-black mb-1 tracking-[0.2em]">Sync Counter ❤️</p>
          <p className="text-6xl font-black text-white tracking-tighter drop-shadow-[0_0_15px_rgba(255,255,255,0.3)]">
            {torusCash.toLocaleString()}
          </p>
        </div>
      </div>

      {/* 🛰️ UI側 CONTROL HUB */}
      <div className="w-full max-w-md flex flex-col gap-3">
        <button 
          onClick={() => setIsBurstActive(!isBurstActive)}
          className={`w-full py-10 rounded-3xl font-black text-4xl flex flex-col items-center gap-2 transition-all active:scale-95 shadow-2xl ${isBurstActive ? 'bg-red-600 text-white shadow-red-900/40' : 'bg-white text-slate-950 border-b-8 border-slate-300 active:border-b-0 active:translate-y-1'}`}
        >
          <Bolt size={32} fill={isBurstActive ? "white" : "black"} />
          <span className="tracking-widest">BURST</span>
        </button>

        <button 
          onClick={() => dispatchToCore(identity)}
          className="w-full py-6 rounded-2xl font-black text-lg bg-[#0f172a] border-2 border-slate-700 active:bg-slate-800 active:border-blue-500 flex items-center justify-center gap-4 transition-all shadow-lg"
        >
          <Crosshair size={20} className="text-blue-500" />
          <span className="tracking-[0.3em] text-white brightness-125">SINGLE PULSE</span>
        </button>
      </div>

      {/* 🛰️ UI側 TELEMETRY FEED */}
      <div className="w-full max-w-md mt-4 bg-black/40 border border-slate-800 rounded-2xl overflow-hidden h-40 shadow-inner">
        <div className="px-4 py-2 border-b border-slate-800 flex justify-between items-center bg-[#0f172a]/80">
          <span className="text-[8px] font-black text-slate-500 uppercase tracking-widest">Telemetry</span>
          {isBurstActive && <span className="text-[8px] text-blue-400 animate-pulse font-black">TRANSMITTING...</span>}
        </div>
        <div className="p-3 overflow-y-auto h-32 space-y-1.5 scrollbar-hide">
          {logs.map(log => (
            <div key={log.id} className="text-[9px] flex justify-between border-l-2 border-emerald-500/30 pl-2 py-0.5">
              <span className="text-emerald-400 font-bold uppercase truncate max-w-[200px]">{log.name}</span>
              <span className="text-slate-600 font-normal">{new Date(log.timestamp).toLocaleTimeString()}</span>
            </div>
          ))}
          {logs.length === 0 && <div className="h-full flex items-center justify-center text-slate-800 text-[9px] font-black tracking-widest">SIGNAL_IDLE</div>}
        </div>
      </div>
    </main>
  );
}
