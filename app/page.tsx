"use client";
import React, { useState, useEffect, useCallback, useRef } from 'react';

export default function TorusSatellite() {
  const [torusCash, setTorusCash] = useState(0);
  const [isBurstActive, setIsBurstActive] = useState(false);
  const [logs, setLogs] = useState<{id:number, msg:string}[]>([]);
  const [ngrokUrl, setNgrokUrl] = useState(""); // 🚀 ここにngrokのURLを入れる
  const burstTimerRef = useRef<any>(null);

  const addLog = (msg: string) => {
    setLogs(prev => [{ id: Date.now(), msg }, ...prev].slice(0, 8));
  };

  const dispatchToCore = useCallback(async (isSilent = false) => {
    if (!ngrokUrl) {
      if (!isSilent) addLog("❌ URL_MISSING: 入力欄にngrokのURLを貼ってください");
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
        if (data.current_count !== undefined) {
          setTorusCash(data.current_count);
        }
        if (!isSilent) addLog("✅ CORE_SYNCHRONIZED");
      }
    } catch (e) {
      if (!isSilent) addLog("❌ CONNECTION_LOST: URLを確認してください");
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
    <main className="min-h-screen bg-[#020617] text-slate-100 font-mono flex flex-col items-center p-6">
      {/* 🛠️ 秘密の入力欄: ここにURLを貼るだけで通信が繋がる */}
      <div className="w-full max-w-md mb-6 p-4 bg-slate-900/50 border border-slate-800 rounded-2xl">
        <label className="text-[10px] text-blue-400 font-black block mb-2 uppercase tracking-widest">Core Endpoint (ngrok)</label>
        <input 
          type="text" 
          value={ngrokUrl}
          onChange={(e) => setNgrokUrl(e.target.value)}
          placeholder="https://xxxx.ngrok-free.app"
          className="w-full bg-black/50 border border-slate-700 rounded-lg px-3 py-2 text-xs text-emerald-400 outline-none focus:border-emerald-500"
        />
      </div>

      <div className="w-full max-w-md bg-[#0f172a] border border-slate-800 p-8 rounded-[40px] text-center shadow-2xl mb-6">
        <p className="text-[10px] text-blue-400 uppercase font-black mb-2 tracking-[0.2em]">Torus Cash</p>
        <p className="text-6xl font-black text-white">{torusCash.toLocaleString()}</p>
      </div>

      <div className="w-full max-w-md space-y-4">
        <button
          onClick={() => setIsBurstActive(!isBurstActive)}
          className={`w-full py-10 rounded-3xl font-black text-3xl transition-all active:scale-95 shadow-2xl ${isBurstActive ? 'bg-slate-800 text-slate-500' : 'bg-white text-slate-950 border-b-8 border-slate-300'}`}
        >
          {isBurstActive ? 'STOP BURST' : '⚡ BURST'}
        </button>

        <button
          onClick={() => dispatchToCore(false)}
          className="w-full py-6 rounded-2xl font-black text-lg bg-[#0f172a] border-2 border-slate-700 active:bg-slate-800 transition-all text-white"
        >
          💠 SINGLE PULSE
        </button>
      </div>

      <div className="w-full max-w-md mt-6 bg-black/40 border border-slate-800 rounded-2xl p-4 h-40 overflow-y-auto">
        <p className="text-[8px] text-slate-600 font-black mb-2 tracking-widest">TELEMETRY</p>
        {logs.map(log => (
          <div key={log.id} className="text-[10px] py-1 border-b border-slate-900 text-slate-400">
            {log.msg}
          </div>
        ))}
      </div>
    </main>
  );
}
