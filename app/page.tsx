"use client";

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Bolt, Activity, Wifi, ShieldCheck, Zap, RotateCcw, Copy, Check, Menu } from 'lucide-react';

// --- Types ---
type LogEntry = {
  id: number;
  msg: string;
  type: 'SYSTEM' | 'SUCCESS' | 'ERROR' | 'OUTBOUND';
  time: string;
};

export default function TorusSatellite() {
  const [torusCash, setTorusCash] = useState(0);
  const [userCash, setUserCash] = useState(0);
  const [isBurstActive, setIsBurstActive] = useState(false);
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [identity, setIdentity] = useState('OPERATOR_NODE_01');
  const [isOnline, setIsOnline] = useState(true);
  const [copyStatus, setCopyStatus] = useState(false);
  
  const burstTimerRef = useRef<NodeJS.Timeout | null>(null);
  const ENDPOINT = 'https://torus-genesis-core.vercel.app/api/ingress';
  const roomId = 'TORUS-SYNC-01';

  // 🛰️ ログ追加プロトコル
  const addLog = useCallback((msg: string, type: LogEntry['type'] = 'SYSTEM') => {
    const newLog: LogEntry = {
      id: Date.now(),
      msg,
      type,
      time: new Date().toLocaleTimeString([], { hour12: false }),
    };
    setLogs(prev => [newLog, ...prev].slice(0, 15));
  }, []);

  // 🛰️ 通信コア：数値の同期を最優先
  const dispatchToCore = useCallback(async (isSilent = false) => {
    try {
      const res = await fetch(ENDPOINT, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          type: 'INGRESS', 
          roomId, 
          payload: { name: identity, timestamp: Date.now() } 
        }),
      });

      if (res.ok) {
        const data = await res.json();
        // 🚀 Python側の current_count と完全に一致させる
        if (data.current_count !== undefined) {
          setTorusCash(data.current_count);
        }
        if (!isSilent) addLog(`PULSE_ACCEPTED: ${data.status || 'OK'}`, 'SUCCESS');
      } else {
        throw new Error(`HTTP_${res.status}`);
      }
    } catch (e) {
      if (!isSilent) addLog(`SYNC_FAILED: ${e instanceof Error ? e.message : 'OFFLINE'}`, 'ERROR');
      setIsOnline(false);
    }
  }, [identity, addLog]);

  // --- Handlers ---
  const handleSinglePulse = () => {
    dispatchToCore();
    if ("vibrate" in navigator) navigator.vibrate(40);
  };

  const handleStartBurst = () => {
    setIsBurstActive(true);
    addLog('BURST_PROTOCOL_ACTUATED', 'SYSTEM');
  };

  const handleStopBurst = () => {
    setIsBurstActive(false);
    if (burstTimerRef.current) clearInterval(burstTimerRef.current);
    addLog('BURST_STANDBY', 'SYSTEM');
  };

  useEffect(() => {
    if (isBurstActive) {
      burstTimerRef.current = setInterval(() => dispatchToCore(true), 800);
    } else {
      if (burstTimerRef.current) clearInterval(burstTimerRef.current);
    }
    return () => { if (burstTimerRef.current) clearInterval(burstTimerRef.current); };
  }, [isBurstActive, dispatchToCore]);

  // --- Styles (CSS-in-JS to protect UI) ---
  useEffect(() => {
    const style = document.createElement('style');
    style.innerHTML = `
      @keyframes scanline { 0% { transform: translateY(-100%); } 100% { transform: translateY(100%); } }
      .crt-overlay::after {
        content: " "; display: block; position: absolute; top: 0; left: 0; bottom: 0; right: 0;
        background: linear-gradient(rgba(18, 16, 16, 0) 50%, rgba(0, 0, 0, 0.25) 50%), linear-gradient(90deg, rgba(255, 0, 0, 0.06), rgba(0, 255, 0, 0.02), rgba(0, 0, 255, 0.06));
        z-index: 2; background-size: 100% 2px, 3px 100%; pointer-events: none;
      }
      .glitch-text { text-shadow: 0.05em 0 0 #00fffc, -0.03em -0.04em 0 #fc00ff, 0.025em 0.04em 0 #fffc00; animation: glitch 725ms infinite; }
      @keyframes glitch {
        0% { text-shadow: 0.05em 0 0 #00fffc, -0.03em -0.04em 0 #fc00ff, 0.025em 0.04em 0 #fffc00; }
        15% { text-shadow: 0.05em 0 0 #00fffc, -0.03em -0.04em 0 #fc00ff, 0.025em 0.04em 0 #fffc00; }
        16% { text-shadow: -0.05em -0.025em 0 #00fffc, 0.025em 0.035em 0 #fc00ff, -0.05em -0.05em 0 #fffc00; }
        100% { text-shadow: -0.025em 0 0 #00fffc, 0.05em 0.025em 0 #fc00ff, -0.025em -0.05em 0 #fffc00; }
      }
    `;
    document.head.appendChild(style);
    return () => { document.head.removeChild(style); };
  }, []);

  return (
    <div className="min-h-screen bg-[#020617] text-slate-100 font-mono p-4 flex flex-col items-center crt-overlay relative overflow-hidden">
      {/* Scanline Effect */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden z-10 opacity-10">
        <div className="w-full h-2 bg-blue-500/20 shadow-[0_0_15px_#3b82f6] animate-[scanline_8s_linear_infinite]" />
      </div>

      {/* Header */}
      <header className="w-full max-w-md mt-4 mb-6 z-20">
        <div className="bg-[#0f172a]/80 border border-slate-800 p-4 rounded-2xl backdrop-blur-md flex items-center justify-between shadow-2xl">
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center border transition-all ${isBurstActive ? 'bg-blue-600 border-blue-400 shadow-[0_0_15px_#3b82f6]' : 'bg-slate-800 border-slate-700'}`}>
              <Zap className={`w-5 h-5 ${isBurstActive ? 'animate-pulse' : ''}`} />
            </div>
            <div>
              <h1 className="text-[10px] uppercase tracking-[0.3em] text-blue-500 font-black">Satellite UI</h1>
              <p className="text-sm font-black tracking-tighter">TORUS_BURST_V12.4</p>
            </div>
          </div>
          <div className={`px-3 py-1 rounded-full border text-[10px] font-black flex items-center gap-2 ${isOnline ? 'border-emerald-500/50 text-emerald-400' : 'border-red-500/50 text-red-400'}`}>
            <div className={`w-1.5 h-1.5 rounded-full ${isOnline ? 'bg-emerald-500 shadow-[0_0_8px_#10b981]' : 'bg-red-500 animate-pulse'}`} />
            {isOnline ? 'STABLE' : 'LINK_LOST'}
          </div>
        </div>
      </header>

      {/* Stats Counter */}
      <section className="w-full max-w-md grid grid-cols-2 gap-3 mb-6 z-20">
        <div className="bg-[#0f172a]/60 border border-slate-800 p-5 rounded-2xl text-center shadow-lg backdrop-blur-sm relative overflow-hidden group">
          <div className="absolute top-0 left-0 w-1 h-full bg-blue-500 opacity-50" />
          <p className="text-[9px] text-blue-400 uppercase font-black mb-1 tracking-widest">Torus Cash</p>
          <p className="text-4xl font-black text-white glitch-text tracking-tighter">{torusCash.toLocaleString()}</p>
        </div>
        <div className="bg-[#0f172a]/60 border border-slate-800 p-5 rounded-2xl text-center shadow-lg backdrop-blur-sm relative overflow-hidden group">
          <div className="absolute top-0 left-0 w-1 h-full bg-slate-700 opacity-50" />
          <p className="text-[9px] text-slate-500 uppercase font-black mb-1 tracking-widest">User Signal</p>
          <p className="text-4xl font-black text-slate-300 tracking-tighter">{userCash.toLocaleString()}</p>
        </div>
      </section>

      {/* Main Controls */}
      <main className="w-full max-w-md flex flex-col gap-4 z-20">
        <button
          onClick={isBurstActive ? handleStopBurst : handleStartBurst}
          className={`w-full py-12 rounded-3xl font-black text-4xl uppercase tracking-[0.2em] shadow-2xl transition-all active:scale-95 flex flex-col items-center justify-center gap-3 group relative overflow-hidden
            ${isBurstActive
              ? 'bg-red-600 text-white border-b-0 translate-y-1'
              : 'bg-white text-slate-950 border-b-[10px] border-slate-300 active:border-b-0 active:translate-y-1'}`}
        >
          <Zap className={`w-8 h-8 ${isBurstActive ? 'animate-bounce' : 'group-hover:rotate-12 transition-transform'}`} />
          <span>{isBurstActive ? 'STOP' : 'BURST'}</span>
          {!isBurstActive && <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />}
        </button>

        {/* 🚀 THE SINGLE PULSE BUTTON */}
        <button
          onClick={handleSinglePulse}
          className="w-full py-6 rounded-2xl font-black text-lg uppercase tracking-[0.4em] transition-all active:scale-[0.98] flex items-center justify-center gap-4 border-2 bg-slate-950 border-slate-800 hover:border-blue-500 text-white shadow-[0_0_20px_rgba(59,130,246,0.1)] hover:shadow-[0_0_30px_rgba(59,130,246,0.2)] group"
        >
          <Activity className="w-6 h-6 text-blue-500 group-hover:animate-ping" />
          <span className="brightness-125">SINGLE PULSE</span>
        </button>

        {/* Operator Identity */}
        <div className="bg-[#0f172a]/40 border border-slate-800/60 rounded-2xl p-4">
          <label className="text-[8px] text-slate-600 uppercase font-black tracking-[0.2em] mb-2 block">Node Identifier</label>
          <div className="relative">
            <input 
              type="text" 
              value={identity} 
              onChange={(e) => setIdentity(e.target.value)}
              className="w-full bg-black/40 border border-slate-800 rounded-xl px-4 py-3 text-blue-400 font-bold outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500/50 text-xs transition-all"
            />
            <ShieldCheck className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-700" />
          </div>
        </div>

        {/* Telemetry Log */}
        <div className="bg-black/40 border border-slate-800 rounded-2xl overflow-hidden h-64 flex flex-col shadow-inner backdrop-blur-md">
          <div className="px-4 py-3 bg-slate-900/80 border-b border-slate-800 flex justify-between items-center">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
              <span className="text-[9px] font-black text-slate-500 tracking-widest uppercase">Telemetry_Feed</span>
            </div>
            <button 
              onClick={() => {
                navigator.clipboard.writeText(logs.map(l => `[${l.time}] ${l.msg}`).join('\n'));
                setCopyStatus(true);
                setTimeout(() => setCopyStatus(false), 2000);
              }}
              className="text-[9px] font-black text-slate-400 hover:text-white transition-colors flex items-center gap-1.5"
            >
              {copyStatus ? <Check className="w-3 h-3 text-emerald-500" /> : <Copy className="w-3 h-3" />}
              {copyStatus ? 'COPIED' : 'COPY_ALL'}
            </button>
          </div>
          <div className="flex-1 overflow-y-auto p-3 space-y-2 scrollbar-hide">
            {logs.length === 0 ? (
              <div className="h-full flex items-center justify-center text-slate-800 text-[10px] font-black tracking-[0.5em] opacity-20">SIGNAL_IDLE</div>
            ) : (
              logs.map((log) => (
                <div key={log.id} className={`text-[10px] flex items-start gap-3 p-2 rounded-lg border transition-all ${
                  log.type === 'ERROR' ? 'bg-red-500/5 border-red-500/20 text-red-400' :
                  log.type === 'SUCCESS' ? 'bg-emerald-500/5 border-emerald-500/20 text-emerald-400' :
                  'bg-slate-800/20 border-slate-800 text-slate-400'
                }`}>
                  <span className="opacity-30 font-bold shrink-0">{log.time}</span>
                  <span className="font-bold uppercase tracking-tight">{log.msg}</span>
                </div>
              ))
            )}
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="mt-8 mb-8 flex flex-col items-center gap-4 z-20">
        <div className="flex items-center gap-8 opacity-20 group">
          <div className="w-12 h-[1px] bg-slate-700 group-hover:bg-blue-500 transition-colors" />
          <div className="text-[10px] font-black tracking-[1em] text-slate-500 uppercase">TORUS</div>
          <div className="w-12 h-[1px] bg-slate-700 group-hover:bg-blue-500 transition-colors" />
        </div>
        <p className="text-[8px] text-slate-700 font-bold">CORE_ESTABLISHED_2026</p>
      </footer>
    </div>
  );
}
