"use client";
import React, { useState, useEffect, useCallback, useRef } from 'react';

export default function TorusSatellite() {
  const [torusCash, setTorusCash] = useState(0);
  const [logs, setLogs] = useState<{id: number, msg: string}[]>([]);
  const [isBurstActive, setIsBurstActive] = useState(false);
  const identity = 'TORUS_OPERATOR';

  // 🛰️ 通信定義 (引き継ぎ書の生命線)
  const ENDPOINT = 'https://torus-genesis-core.vercel.app/api/ingress';
  const roomId = 'TORUS-SYNC-01';

  const dispatchToCore = useCallback(async (isSilent = false) => {
    try {
      const res = await fetch(ENDPOINT, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          type: 'INGRESS', 
          roomId, 
          payload: { name: identity, id: `TX-${Math.random().toString(36).substring(2, 7).toUpperCase()}` } 
        }),
      });
      if (res.ok) {
        const data = await res.json();
        // 🚀 ここが生命線。Python側のキー名と一致させ数値を同期する
        if (data.current_count !== undefined) {
          setTorusCash(data.current_count);
        }
        if (!isSilent) setLogs(p => [{id: Date.now(), msg: "✅ CORE_SYNCHRONIZED"}, ...p].slice(0, 8));
      }
    } catch (e) {
      if (!isSilent) setLogs(p => [{id: Date.now(), msg: "❌ CONNECTION_LOST"}, ...p].slice(0, 8));
    }
  }, [identity]);

  return (
    <div className={`min-h-screen bg-[#020617] text-slate-100 font-mono flex flex-col items-center p-4 sm:p-6`}>
      <header className="w-full max-w-md mt-2 mb-4 flex items-center justify-between bg-[#0f172a]/80 border border-slate-800 p-4 rounded-2xl backdrop-blur-md">
        <div>
          <h1 className="text-[8px] uppercase tracking-widest text-slate-500 font-black">Satellite UI</h1>
          <p className="text-sm font-black tracking-tighter text-white">TORUS BURST V12.4</p>
        </div>
        <div className="px-3 py-1 rounded-full border border-emerald-500/50 text-emerald-400 text-[9px] font-black flex items-center gap-2">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shadow-[0_0_8px_#10b981]"></span>
          ONLINE
        </div>
      </header>

      <div className="w-full max-w-md bg-[#0f172a]/60 border border-slate-800 p-5 rounded-2xl text-center shadow-lg mb-4">
        <p className="text-[8px] text-blue-400 uppercase font-black mb-1 tracking-wider">OPERATOR ❤️</p>
        <p className="text-3xl font-black text-white select-all">{torusCash.toLocaleString()}</p>
      </div>

      <main className="w-full max-w-md flex flex-col gap-3">
        <button
          onClick={() => dispatchToCore()}
          className="w-full py-10 rounded-3xl font-black text-3xl uppercase tracking-widest bg-white text-slate-950 border-b-8 border-slate-300 active:border-b-0 active:translate-y-1 cursor-pointer shadow-lg transition-all"
        >
          ⚡ BURST
        </button>

        <button
          onClick={() => dispatchToCore()}
          className="w-full py-6 rounded-2xl font-black text-lg uppercase tracking-[0.4em] transition-all active:scale-95 flex items-center justify-center gap-4 border-2 bg-[#0f172a] border-slate-700 active:bg-slate-800 active:border-blue-500 shadow-inner"
        >
          <span style={{ color: '#FFFFFF', textShadow: '0 0 15px rgba(255,255,255,1)' }}>💠 SINGLE PULSE</span>
        </button>

        <div className="bg-black/40 border border-slate-800 rounded-2xl overflow-hidden mt-2 h-48 flex flex-col">
          <div className="px-4 py-2 bg-[#0f172a]/80 border-b border-slate-800">
            <span className="text-[8px] font-black text-slate-500 tracking-widest uppercase">TELEMETRY FEED</span>
          </div>
          <div className="flex-1 overflow-y-auto p-3 space-y-1.5 text-[9px]">
            {logs.map((log) => (
              <div key={log.id} className="p-2 rounded-lg border bg-blue-950/20 border-blue-800/50 text-blue-400 flex justify-between">
                <span className="font-bold uppercase tracking-tighter">{log.msg}</span>
              </div>
            ))}
          </div>
        </div>
      </main>

      <footer className="mt-8 mb-6 text-[8px] text-slate-800 font-black uppercase tracking-[1em] text-center opacity-50">
        TORUS DIRECT PROTOCOL V12.4
      </footer>
    </div>
  );
}
