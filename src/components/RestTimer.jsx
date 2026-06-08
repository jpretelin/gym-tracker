import { G, BG, CARD, BORDER } from "../utils/theme";
import { useState, useEffect, useRef } from "react";

export default function RestTimer({ onClose }) {
  const G = "#22c55e";
  const BG = "#050d07";
  const CARD = "#0a1a0c";
  const BORDER = "#0f2d12";

    const [seconds, setSeconds] = useState(90);
    const [remaining, setRemaining] = useState(90);
    const [running, setRunning] = useState(false);
    const [done, setDone] = useState(false);
    const ref = useRef(null);
    useEffect(() => {
      if (running && remaining > 0) ref.current = setInterval(() => setRemaining(r => r - 1), 1000);
      else if (remaining === 0) { setRunning(false); setDone(true); }
      return () => clearInterval(ref.current);
    }, [running, remaining]);
    const r = 54, circ = 2 * Math.PI * r, pct = remaining / seconds;
    return (
      <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.9)", zIndex: 300, display: "flex", alignItems: "center", justifyContent: "center" }} onClick={onClose}>
        <div style={{ background: CARD, border: `1px solid ${BORDER}`, borderRadius: 20, padding: 32, maxWidth: 300, width: "100%", textAlign: "center" }} onClick={e => e.stopPropagation()}>
          <p style={{ margin: "0 0 18px", fontSize: 11, letterSpacing: 3, color: "#555", textTransform: "uppercase" }}>Descanso</p>
          <svg width="128" height="128" style={{ display: "block", margin: "0 auto 18px" }}>
            <circle cx="64" cy="64" r={r} fill="none" stroke="#0f2d12" strokeWidth="8" />
            <circle cx="64" cy="64" r={r} fill="none" stroke={done ? "#4ade80" : G} strokeWidth="8"
              strokeDasharray={circ} strokeDashoffset={circ * (1 - pct)}
              strokeLinecap="round" transform="rotate(-90 64 64)"
              style={{ transition: "stroke-dashoffset 1s linear" }} />
            <text x="64" y="70" textAnchor="middle" fontSize="26" fontWeight="800" fill={done ? "#4ade80" : "#fff"} fontFamily="monospace">
              {done ? "✓" : `${Math.floor(remaining / 60)}:${String(remaining % 60).padStart(2, "0")}`}
            </text>
          </svg>
          <div style={{ display: "flex", gap: 6, marginBottom: 12 }}>
            {[60, 90, 120, 180].map(s => (
              <button key={s} onClick={() => { setSeconds(s); setRemaining(s); setRunning(false); setDone(false); }}
                style={{ flex: 1, padding: "6px 2px", border: `1px solid ${seconds === s ? G : BORDER}`, borderRadius: 7, background: seconds === s ? `${G}20` : "transparent", color: seconds === s ? G : "#555", fontSize: 11, cursor: "pointer", fontFamily: "inherit" }}>
                {s}s
              </button>
            ))}
          </div>
          <div style={{ display: "flex", gap: 8 }}>
            <button onClick={() => { setRunning(r => !r); setDone(false); }} style={{ flex: 2, padding: 12, background: G, border: "none", borderRadius: 10, color: BG, fontWeight: 800, fontSize: 13, cursor: "pointer", fontFamily: "inherit" }}>
              {running ? "⏸ Pausa" : done ? "↺ Reiniciar" : "▶ Iniciar"}
            </button>
            <button onClick={onClose} style={{ flex: 1, padding: 12, background: "transparent", border: `1px solid ${BORDER}`, borderRadius: 10, color: "#555", fontSize: 12, cursor: "pointer", fontFamily: "inherit" }}>✕</button>
          </div>
        </div>
      </div>
    );
  }
  