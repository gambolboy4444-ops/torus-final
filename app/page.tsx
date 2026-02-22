'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';

// --- 🛰️ TORUS PROTOCOL CONFIGURATION ---
const ENDPOINT = 'https://improvident-tracklessly-kimberely.ngrok-free.dev/api/ingress';
const ROOM_ID = 'TORUS-SYNC-01';

export default function TorusSatellite() {
  const [torusCash, setTorusCash] = useState(0);
  const [userCash, setUserCash] = useState(0);
  const [isBurstActive, setIsBurstActive] = useState(false);
  const [isOnline, setIsOnline] = useState(false);
  const [logs, setLogs] = useState<{id: number, msg: string, type: string}[]>([]);
  const burstTimerRef = useRef<NodeJS.Timeout | null>(null);

  const addLog = useCallback((msg: string, type: string = 'SYSTEM') => {
    setLogs(prev => [{ id: Date.now(), msg, type }, ...prev].slice(0, 8));
  }, []);

  // 🚨 核心部：Python(Genesis Core)との同期ロジック
  const dispatchToCore = useCallback(async (isSilent = false) => {
    try {
      const res = await fetch(ENDPOINT, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          type: 'INGRESS', 
          roomId: ROOM_ID, 
          payload: { name: 'OPERATOR' } 
        }),
      });

      if (res.ok) {
        const data = await res.json();
        setIsOnline(true);
        // 🚀 Python側のキー名 'current_count' と完全に一致させて同期
        if (data.current_count !== undefined) {
          setTorusCash(data.current_count);
        }
        if (!isSilent) addLog("✅ CORE_SYNCHRONIZED", "SUCCESS");
      } else {
        setIsOnline(false);
        if (!isSilent) addLog("❌ SERVER_REJECTED", "ERROR");
      }
    } catch (e) {
      setIsOnline(false);
      if (!isSilent) addLog("❌ CONNECTION_LOST", "ERROR");
    }
  }, [addLog]);

  // BURSTモードのループ処理
  useEffect(() => {
    if (isBurstActive) {
      burstTimerRef.current = setInterval(() => {
        dispatchToCore(true);
      }, 500);
    } else {
      if (burstTimerRef.current) clearInterval(burstTimerRef.current);
    }
    return () => { if (burstTimerRef.current) clearInterval(burstTimerRef.current); };
  }, [isBurstActive, dispatchToCore]);

  // デザイン保護：CSSインジェクション（司令官のこだわりのUIを固定）
  useEffect(() => {
    const style = document.createElement('style');
    style.innerHTML = `
      @import url('https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css');
      body { background-color: #020617; margin: 0; font-family: 'Courier New', monospace; color: #f8fafc; }
      .crt-flicker { animation: flicker 0.15s infinite; }
      @keyframes flicker { 0% { opacity: 0.9; } 50% { opacity: 1; } 100% { opacity: 0.9; } }
    `;
    document.head.appendChild(style);
    dispatchToCore(true); // 初回接続確認
  }, [dispatchToCore]);

  return (
    <div className={`min-h-screen flex flex-col items-center p-6 ${isBurstActive ? 'crt-flicker' : ''}`}>
      {/* HEADER */}
      <header className="w-full max-w-md bg-slate-900/80 border border-slate-800 p-4 rounded-2xl mb-4 flex justify-between items-center backdrop-blur-md">
        <div className="flex items-center gap-3">
          <div className={`w-10 h-10 rounded-xl flex items-center justify-center border ${isOnline ? 'bg-emerald-600 border-emerald-400 shadow-[0_0_10px_#10b981]' : 'bg-slate-800 border-slate-700'}`}>
            <i className="fas fa-server text-xs"></i>
          </div>
          <div>
            <h1 className="text-[8px] uppercase tracking-widest text-slate-500 font-black">Satellite UI</h1>
            <p className="text-sm font-black text-white">TORUS BURST V12.5</p>
          </div>
        </div>
        <div className={`px-3 py-1 rounded-full border text-[9px] font-black ${isOnline ? 'border-emerald-500 text-emerald-400' : 'border-red-500 text-red-400'}`}>
          {isOnline ? 'STABLE' : 'OFFLINE'}
        </div>
      </header>

      {/* STATS */}
      <section className="w-full max-w-md grid grid-cols-2 gap-3 mb-4">
        <div className="bg-slate-900/60 border border-slate-800 p-5 rounded-2xl text-center">
          <p className="text-[8px] text-blue-400 font-black mb-1">OPERATOR ❤️</p>
          <p className="text-3xl font-black text-white">{torusCash.toLocaleString()}</p>
        </div>
        <div className="bg-slate-900/60 border border-slate-800 p-5 rounded-2xl text-center">
          <p className="text-[8px] text-emerald-400 font-black mb-1">DUMMY USERS ❤️</p>
          <p className="text-3xl font-black text-white">{userCash.toLocaleString()}</p>
        </div>
      </section>

      {/* CONTROLS */}
      <main className="w-full max-w-md flex flex-col gap-3">
        <button
          onClick={() => setIsBurstActive(true)}
          disabled={isBurstActive}
          className={`w-full py-10 rounded-3xl font-black text-3xl uppercase tracking-widest shadow-xl transition-all active:scale-95 flex flex-col items-center justify-center gap-2
            ${isBurstActive ? 'bg-slate-800 text-slate-600' : 'bg-white text-slate-950 border-b-8 border-slate-300 active:border-b-0 active:translate-y-1'}`}
        >
          <i className={`fas ${isBurstActive ? 'fa-sync fa-spin text-blue-500' : 'fa-bolt-lightning'}`}></i>
          <span>BURST</span>
        </button>

        <button
          onClick={() => dispatchToCore()}
          className="w-full py-6 rounded-2xl font-black text-lg uppercase tracking-[0.4em] transition-all active:scale-95 flex items-center justify-center gap-4 border-2 bg-slate-900 border-slate-700 active:border-blue-500 text-white"
        >
          <i className="fas fa-crosshairs text-blue-500"></i>
          <span>SINGLE PULSE</span>
        </button>

        <button
          onClick={() => setIsBurstActive(false)}
          disabled={!isBurstActive}
          className={`w-full py-4 rounded-xl font-black text-[10px] uppercase border-2 transition-all
            ${!isBurstActive ? 'border-slate-800 text-slate-800' : 'bg-red-600 border-red-400 text-white'}`}
        >
          STOP BURST
        </button>
      </main>

      {/* TELEMETRY */}
      <div className="w-full max-w-md bg-black/40 border border-slate-800 rounded-2xl mt-4 h-48 overflow-hidden flex flex-col">
        <div className="px-4 py-2 bg-slate-900/80 border-b border-slate-800 flex justify-between items-center">
          <span className="text-[8px] font-black text-slate-500 tracking-widest">TELEMETRY FEED</span>
        </div>
        <div className="p-3 space-y-1 overflow-y-auto">
          {logs.map(log => (
            <div key={log.id} className={`text-[9px] p-2 rounded border ${log.type === 'ERROR' ? 'border-red-900 text-red-400' : 'border-slate-800 text-blue-400'}`}>
              [{new Date(log.id).toLocaleTimeString()}] {log.msg}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
