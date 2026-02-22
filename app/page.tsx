"use client";
import React, { useState, useEffect, useCallback } from 'react';

export default function TorusSatellite() {
  const [torusCash, setTorusCash] = useState(0);
  const [logs, setLogs] = useState<{id: number, msg: string}[]>([]);
  const identity = 'TORUS_OPERATOR';
  const ENDPOINT = 'https://torus-genesis-core.vercel.app/api/ingress';

  const dispatchToCore = useCallback(async (isSilent = false) => {
    try {
      const res = await fetch(ENDPOINT, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          type: 'INGRESS', 
          roomId: 'TORUS-SYNC-01', 
          payload: { name: identity, id: `TX-${Math.random().toString(36).substring(2, 7).toUpperCase()}` } 
        }),
      });
      if (res.ok) {
        const data = await res.json();
        if (data.current_count !== undefined) setTorusCash(data.current_count);
        if (!isSilent) setLogs(p => [{id: Date.now(), msg: "✅ CORE_SYNCHRONIZED"}, ...p].slice(0, 5));
      }
    } catch (e) {
      if (!isSilent) setLogs(p => [{id: Date.now(), msg: "❌ CONNECTION_LOST"}, ...p].slice(0, 5));
    }
  }, [identity]);

  return (
    <div className="min-h-screen bg-[#020617] text-slate-100 font-mono flex flex-col items-center p-4">
      <header className="w-full max-w-md mt-4 mb-6 border border-slate-800 p-4 rounded-2xl bg-[#0f172a]/80 flex justify-between items-center">
        <div>
          <h1 className="text-[8px] uppercase tracking-widest text-slate-500 font-black">Satellite UI</h1>
          <p className="text-sm font-black text-white">TORUS BURST V12.4</p>
        </div>
        <div className="text-[9px] font-black text-emerald-400 border border-emerald-500/30 px-2 py-1 rounded-full">ONLINE</div>
      </header>

      <div className="w-full max-w-md bg-[#0f172a]/60 border border-slate-800 p-5 rounded-2xl text-center mb-4">
        <p className="text-[8px] text-blue-400 font-black mb-1">OPERATOR ❤️</p>
        <p className="text-3xl font-black text-white">{torusCash.toLocaleString()}</p>
      </div>

      <main className="w-full max-w-md flex flex-col gap-3">
        <button onClick={() => dispatchToCore()} className="w-full py-10 bg-white text-slate-950 rounded-3xl font-black text-3xl active:scale-95 transition-all">⚡ BURST</button>
        <button onClick={() => dispatchToCore()} className="w-full py-6 bg-[#0f172a] border-2 border-slate-700 text-white rounded-2xl font-black text-lg tracking-[0.4em] active:scale-95 shadow-inner">💠 SINGLE PULSE</button>
        <div className="bg-black/40 border border-slate-800 rounded-2xl p-4 mt-2 h-40 overflow-y-auto">
          {logs.map(log => <div key={log.id} className="text-[10px] text-blue-400 mt-1 border-b border-slate-800/50 pb-1">{log.msg}</div>)}
        </div>
      </main>
    </div>
  );
}
