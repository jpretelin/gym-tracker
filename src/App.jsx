import { useState, useEffect, useRef } from "react";
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";
import { EXERCISES } from "./data/exercises.js";
import {HowToModal} from "./components/HowToModal.jsx";
import RestTimer from "./components/RestTimer";
import { G, BG, CARD, BORDER } from "./utils/theme";
import { AddModal} from "./components/AddModal.jsx";
import { SubModal } from "./components/SubModal.jsx";

// Muscle groups mapped to body regions
const MUSCLE_GROUPS = {
  "Pecho Superior": { region: "chest", label: "Pecho\nSuperior", color: "#22c55e" },
  "Pecho Medio": { region: "chest", label: "Pecho\nMedio", color: "#22c55e" },
  "Pecho Inferior": { region: "chest", label: "Pecho\nInferior", color: "#22c55e" },
  "Espalda Alta": { region: "back", label: "Espalda\nAlta", color: "#22c55e" },
  "Espalda Baja": { region: "back", label: "Espalda\nBaja", color: "#22c55e" },
  "Dorsal": { region: "back", label: "Dorsal", color: "#22c55e" },
  "Cuádriceps": { region: "legs", label: "Cuádriceps", color: "#22c55e" },
  "Isquiotibiales": { region: "legs", label: "Isquio\ntibiales", color: "#22c55e" },
  "Glúteos": { region: "glutes", label: "Glúteos", color: "#22c55e" },
  "Hombro Frontal": { region: "shoulders", label: "Hombro\nFrontal", color: "#22c55e" },
  "Hombro Lateral": { region: "shoulders", label: "Hombro\nLateral", color: "#22c55e" },
  "Hombro Posterior": { region: "shoulders", label: "Hombro\nPost.", color: "#22c55e" },
  "Bíceps": { region: "arms", label: "Bíceps", color: "#22c55e" },
  "Tríceps": { region: "arms", label: "Tríceps", color: "#22c55e" },
  "Gemelos": { region: "legs", label: "Gemelos", color: "#22c55e" },
  "Core": { region: "core", label: "Core", color: "#22c55e" },
};



const eqColors = {
  ninguno: "#22c55e", mancuernas: "#34d399", barra: "#86efac",
  cable: "#a7f3d0", máquina: "#6ee7b7", "barra dominadas": "#4ade80", paralelas: "#bbf7d0",
};

const STORE = {
  get: (k, d) => { try { const v = localStorage.getItem(k); return v ? JSON.parse(v) : d; } catch { return d; } },
  set: (k, v) => { try { localStorage.setItem(k, JSON.stringify(v)); } catch {} },
};

// ═══════════════════════════════════════════════════════════════
// BODY MAP SVG — front/back toggle with clickable muscle zones
// ═══════════════════════════════════════════════════════════════
function BodyMap({ onSelect, activeGroup }) {
  const [view, setView] = useState("front"); // front | back
  const [hovered, setHovered] = useState(null);

  const muscleZones = view === "front" ? [
    // HEAD
    { id: "head", path: "M200,18 C186,18 175,30 175,46 C175,62 186,74 200,74 C214,74 225,62 225,46 C225,30 214,18 200,18 Z", group: null, label: "" },
    // NECK
    { id: "neck", path: "M188,74 L212,74 L215,95 L185,95 Z", group: null, label: "" },
    // CHEST UPPER
    { id: "chestUpper", path: "M145,95 C145,95 160,100 185,100 L185,128 C165,128 148,120 140,110 Z M215,100 C240,100 255,95 255,95 L260,110 C252,120 235,128 215,128 L215,100 Z", group: "Pecho Superior", label: "Pecho\nSup." },
    // CHEST MID
    { id: "chestMid", path: "M185,128 L215,128 L215,155 L185,155 Z", group: "Pecho Medio", label: "Pecho\nMed." },
    // CHEST LOWER
    { id: "chestLow", path: "M185,155 L215,155 C215,155 220,168 218,175 L182,175 C180,168 185,155 185,155 Z", group: "Pecho Inferior", label: "Pecho\nInf." },
    // SHOULDER LEFT (front)
    { id: "shoulderL", path: "M115,95 C115,95 130,100 145,100 L140,130 C130,128 115,118 110,108 Z", group: "Hombro Frontal", label: "Hombro" },
    // SHOULDER RIGHT (front)
    { id: "shoulderR", path: "M255,100 C270,100 285,95 285,95 L290,108 C285,118 270,128 260,130 Z", group: "Hombro Frontal", label: "Hombro" },
    // BICEP LEFT
    { id: "bicepL", path: "M105,130 C105,130 115,128 140,130 L142,175 C125,178 108,170 103,158 Z", group: "Bíceps", label: "Bíceps" },
    // BICEP RIGHT
    { id: "bicepR", path: "M260,130 C285,128 295,130 295,130 L297,158 C292,170 275,178 258,175 Z", group: "Bíceps", label: "Bíceps" },
    // FOREARM LEFT
    { id: "forearmL", path: "M100,160 L142,175 L140,225 L98,210 Z", group: null, label: "" },
    // FOREARM RIGHT
    { id: "forearmR", path: "M258,175 L300,160 L302,210 L260,225 Z", group: null, label: "" },
    // CORE / ABS
    { id: "core", path: "M182,175 L218,175 L220,240 L180,240 Z", group: "Core", label: "Core" },
    // QUAD LEFT
    { id: "quadL", path: "M140,245 C140,245 158,243 178,243 L177,330 C163,333 145,325 136,310 Z", group: "Cuádriceps", label: "Cuád." },
    // QUAD RIGHT
    { id: "quadR", path: "M222,243 C242,243 260,245 260,245 L264,310 C255,325 237,333 223,330 Z", group: "Cuádriceps", label: "Cuád." },
    // CALVES (front) - just shape, maps to gemelos
    { id: "calfL", path: "M137,340 L175,335 L173,390 L133,385 Z", group: "Gemelos", label: "Gemelo" },
    { id: "calfR", path: "M225,335 L263,340 L267,385 L227,390 Z", group: "Gemelos", label: "Gemelo" },
    // HANDS
    { id: "handL", path: "M92,215 L100,215 L98,248 L90,248 Z", group: null, label: "" },
    { id: "handR", path: "M300,215 L308,215 L310,248 L302,248 Z", group: null, label: "" },
    // FEET
    { id: "footL", path: "M130,392 L173,392 L173,408 L125,408 Z", group: null, label: "" },
    { id: "footR", path: "M227,392 L270,392 L275,408 L227,408 Z", group: null, label: "" },
  ] : [
    // HEAD back
    { id: "headB", path: "M200,18 C186,18 175,30 175,46 C175,62 186,74 200,74 C214,74 225,62 225,46 C225,30 214,18 200,18 Z", group: null, label: "" },
    // NECK back
    { id: "neckB", path: "M188,74 L212,74 L215,95 L185,95 Z", group: null, label: "" },
    // UPPER BACK / TRAPS
    { id: "trapL", path: "M145,95 C145,95 162,100 185,105 L185,130 C162,130 142,118 138,106 Z", group: "Espalda Alta", label: "Espalda\nAlta" },
    { id: "trapR", path: "M215,105 C238,100 255,95 255,95 L262,106 C258,118 238,130 215,130 Z", group: "Espalda Alta", label: "Espalda\nAlta" },
    // LATS
    { id: "latL", path: "M138,108 L185,130 L183,195 C165,196 142,182 132,165 Z", group: "Dorsal", label: "Dorsal" },
    { id: "latR", path: "M215,130 L262,108 L268,165 C258,182 235,196 217,195 Z", group: "Dorsal", label: "Dorsal" },
    // LOWER BACK
    { id: "lowerBack", path: "M183,195 L217,195 L218,240 L182,240 Z", group: "Espalda Baja", label: "Espalda\nBaja" },
    // SHOULDER BACK L
    { id: "shoulderBL", path: "M110,108 C115,100 130,100 145,95 L138,108 C128,118 112,122 108,118 Z", group: "Hombro Posterior", label: "Hombro\nPost." },
    // SHOULDER BACK R
    { id: "shoulderBR", path: "M255,95 C270,100 285,100 290,108 L292,118 C288,122 272,118 262,108 Z", group: "Hombro Posterior", label: "Hombro\nPost." },
    // TRICEP L
    { id: "tricepL", path: "M105,120 C112,122 138,108 138,108 L140,160 C125,165 105,155 100,142 Z", group: "Tríceps", label: "Tríceps" },
    // TRICEP R
    { id: "tricepR", path: "M262,108 C288,122 295,120 295,120 L300,142 C295,155 275,165 260,160 Z", group: "Tríceps", label: "Tríceps" },
    // FOREARM BACK L
    { id: "forearmBL", path: "M98,145 L140,160 L138,215 L96,200 Z", group: null, label: "" },
    // FOREARM BACK R
    { id: "forearmBR", path: "M260,160 L302,145 L304,200 L262,215 Z", group: null, label: "" },
    // GLUTES
    { id: "gluteL", path: "M140,245 C140,245 158,243 180,243 L178,305 C162,312 140,302 133,286 Z", group: "Glúteos", label: "Glúteo" },
    { id: "gluteR", path: "M220,243 C242,243 260,245 260,245 L267,286 C260,302 238,312 222,305 Z", group: "Glúteos", label: "Glúteo" },
    // HAMSTRINGS
    { id: "hamL", path: "M133,288 L178,305 L175,360 C160,365 138,355 130,338 Z", group: "Isquiotibiales", label: "Isquio" },
    { id: "hamR", path: "M222,305 L267,288 L270,338 C262,355 240,365 225,360 Z", group: "Isquiotibiales", label: "Isquio" },
    // CALVES BACK
    { id: "calfBL", path: "M130,340 L175,360 L172,400 L127,395 Z", group: "Gemelos", label: "Gemelo" },
    { id: "calfBR", path: "M225,360 L270,340 L273,395 L228,400 Z", group: "Gemelos", label: "Gemelo" },
    // HANDS
    { id: "handBL", path: "M90,205 L98,205 L96,240 L88,240 Z", group: null, label: "" },
    { id: "handBR", path: "M302,205 L310,205 L312,240 L304,240 Z", group: null, label: "" },
    // FEET
    { id: "footBL", path: "M124,397 L172,402 L172,415 L120,415 Z", group: null, label: "" },
    { id: "footBR", path: "M228,402 L276,397 L280,415 L228,415 Z", group: null, label: "" },
  ];

  const getZoneColor = (zone) => {
    if (!zone.group) return "#0f2a12";
    if (zone.group === activeGroup) return G;
    if (zone.group === hovered) return "#16a34a";
    return "#143d1a";
  };

  const getZoneOpacity = (zone) => {
    if (!zone.group) return 0.6;
    if (zone.group === activeGroup || zone.group === hovered) return 1;
    return 0.85;
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 12 }}>
      {/* Toggle */}
      <div style={{ display: "flex", gap: 4, background: CARD, padding: 4, borderRadius: 10, border: `1px solid ${BORDER}` }}>
        {["front", "back"].map(v => (
          <button key={v} onClick={() => setView(v)} style={{
            padding: "6px 18px", border: "none", borderRadius: 7, cursor: "pointer",
            fontFamily: "inherit", fontSize: 11, fontWeight: 700, letterSpacing: 1,
            background: view === v ? G : "transparent",
            color: view === v ? BG : "#2d5a35",
            transition: "all 0.2s",
          }}>
            {v === "front" ? "FRENTE" : "ESPALDA"}
          </button>
        ))}
      </div>

      {/* SVG Body */}
      <div style={{ position: "relative" }}>
        <svg viewBox="70 10 260 415" width="230" height="360"
          style={{ filter: "drop-shadow(0 0 20px rgba(34,197,94,0.15))" }}>
          {/* Body silhouette background */}
          <defs>
            <filter id="glow">
              <feGaussianBlur stdDeviation="2" result="coloredBlur" />
              <feMerge><feMergeNode in="coloredBlur" /><feMergeNode in="SourceGraphic" /></feMerge>
            </filter>
          </defs>

          {/* Render zones */}
          {muscleZones.map(zone => (
            <g key={zone.id}>
              <path
                d={zone.path}
                fill={getZoneColor(zone)}
                stroke={zone.group ? (zone.group === activeGroup ? G : "#1a4a20") : "#0d2410"}
                strokeWidth={zone.group ? 1.5 : 0.8}
                opacity={getZoneOpacity(zone)}
                style={{
                  cursor: zone.group ? "pointer" : "default",
                  transition: "fill 0.2s, opacity 0.2s",
                  filter: (zone.group === activeGroup || zone.group === hovered) ? "url(#glow)" : "none",
                }}
                onMouseEnter={() => zone.group && setHovered(zone.group)}
                onMouseLeave={() => setHovered(null)}
                onClick={() => zone.group && onSelect(zone.group)}
              />
            </g>
          ))}

          {/* Labels for hovered zones */}
          {muscleZones.filter(z => z.group && (z.group === hovered || z.group === activeGroup)).map(zone => {
            // Get centroid approximation from path
            const pathParts = zone.path.match(/\d+\.?\d*/g)?.map(Number) || [];
            const xs = pathParts.filter((_, i) => i % 2 === 0);
            const ys = pathParts.filter((_, i) => i % 2 === 1);
            const cx = xs.reduce((a, b) => a + b, 0) / xs.length;
            const cy = ys.reduce((a, b) => a + b, 0) / ys.length;
            return null; // Labels shown in sidebar
          })}
        </svg>

        {/* Hover tooltip */}
        {hovered && (
          <div style={{
            position: "absolute", bottom: -32, left: "50%", transform: "translateX(-50%)",
            background: CARD, border: `1px solid ${G}`, borderRadius: 8,
            padding: "4px 12px", fontSize: 11, color: G, fontWeight: 700,
            whiteSpace: "nowrap", pointerEvents: "none",
          }}>
            {hovered} →
          </div>
        )}
      </div>

      <p style={{ margin: 0, fontSize: 10, color: "#2d5a35", letterSpacing: 1, textTransform: "uppercase" }}>
        Toca un músculo para ver ejercicios
      </p>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
// MAIN APP
// ═══════════════════════════════════════════════════════════════
export default function GymTracker() {
  const [tab, setTab] = useState("cuerpo");
  const [selectedGroup, setSelectedGroup] = useState(null);
  const [search, setSearch] = useState("");
  const [todayLog, setTodayLog] = useState(() => STORE.get("gymtrack_today", []));
  const [history, setHistory] = useState(() => STORE.get("gymtrack_history", []));
  const [showTimer, setShowTimer] = useState(false);
  const [howtoModal, setHowtoModal] = useState(null);
  const [subModal, setSubModal] = useState(null);
  const [addModal, setAddModal] = useState(null);
  const [toast, setToast] = useState(null);

  const [bodyWeight, setBodyWeight] = useState(() =>
    STORE.get("bodyWeight", [])
  );
  
  const [weightInput, setWeightInput] = useState("");

  useEffect(() => { STORE.set("gymtrack_today", todayLog); }, [todayLog]);
  useEffect(() => { STORE.set("gymtrack_history", history); }, [history]);
  useEffect(() => {
    STORE.set("bodyWeight", bodyWeight);
  }, [bodyWeight]);

  const showToast = msg => { setToast(msg); setTimeout(() => setToast(null), 2500); };

  const addExercise = ({ name, muscles, equipment, sets, reps, weight }) => {
    setTodayLog(p => [...p, { id: Date.now(), name, muscles, equipment, sets, reps, weight, time: new Date().toLocaleTimeString("es-MX", { hour: "2-digit", minute: "2-digit" }) }]);
    setAddModal(null); setHowtoModal(null);
    showToast(`✓ ${name} añadido`);
  };

  const saveWorkout = () => {
    if (!todayLog.length) return;
    setHistory(p => [{ date: new Date().toLocaleDateString("es-MX", { day: "numeric", month: "short", year: "numeric" }), dateRaw: Date.now(), exercises: todayLog, totalSets: todayLog.reduce((s, e) => s + e.sets, 0), totalReps: todayLog.reduce((s, e) => s + e.sets * e.reps, 0) }, ...p]);
    setTodayLog([]);
    showToast("💪 ¡Entrenamiento guardado!");
  };

  // Search: across all exercises
  const allExercises = Object.entries(EXERCISES).flatMap(([grp, exs]) => exs.map(e => ({ ...e, group: grp })));
  const searchResults = search.trim().length > 1
    ? allExercises.filter(e => e.name.toLowerCase().includes(search.toLowerCase()) || e.muscles.some(m => m.toLowerCase().includes(search.toLowerCase())) || e.group.toLowerCase().includes(search.toLowerCase()))
    : [];

  // Exercises to show in panel
  const panelExercises = selectedGroup ? EXERCISES[selectedGroup] || [] : [];

  const chartData = [...history].reverse().slice(-10).map(w => ({ name: w.date.split(" ")[0], series: w.totalSets, reps: w.totalReps }));
  const today = new Date().toLocaleDateString("es-MX", { weekday: "long", day: "numeric", month: "long" });

  const tabs = [
    { id: "cuerpo", label: "CUERPO" },
    { id: "hoy", label: "HOY" },
    { id: "progreso", label: "PROGRESO" },
    { id: "historial", label: "HISTORIAL" },
  ];

  const currentWeight =
  bodyWeight.length > 0
    ? bodyWeight[bodyWeight.length - 1].weight
    : null;

const lowestWeight =
  bodyWeight.length > 0
    ? Math.min(...bodyWeight.map(w => w.weight))
    : null;

const highestWeight =
  bodyWeight.length > 0
    ? Math.max(...bodyWeight.map(w => w.weight))
    : null;

    const weightChange =
  bodyWeight.length >= 2
    ? (
        bodyWeight[bodyWeight.length - 1].weight -
        bodyWeight[0].weight
      ).toFixed(1)
    : 0;

  return (
    <div style={{ minHeight: "100vh", background: BG, fontFamily: "'DM Mono','Courier New',monospace", color: "#ccc" }}>
      <div style={{ position: "fixed", inset: 0, backgroundImage: `linear-gradient(rgba(34,197,94,0.025) 1px,transparent 1px),linear-gradient(90deg,rgba(34,197,94,0.025) 1px,transparent 1px)`, backgroundSize: "36px 36px", pointerEvents: "none", zIndex: 0 }} />
      <div style={{ position: "fixed", top: -250, left: "50%", transform: "translateX(-50%)", width: 600, height: 400, background: "radial-gradient(ellipse, rgba(34,197,94,0.06) 0%,transparent 70%)", pointerEvents: "none", zIndex: 0 }} />

      <div style={{ position: "relative", zIndex: 1, maxWidth: 1200, width: "100%", margin: "0 auto", padding: "20px 14px 80px" }}>
        {/* Header */}
        <div
  style={{
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-start",
    flexWrap: "wrap",
    gap: 12,
    marginBottom: 20
  }}
> 
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 3 }}>
              <div style={{ width: 30, height: 30, background: G, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 15, fontWeight: 900, color: BG, borderRadius: 7 }}>G</div>
              <h1 style={{ margin: 0, fontSize: 19, fontWeight: 800, color: "#fff", letterSpacing: -0.5 }}>GYM<span style={{ color: G }}>TRACK</span></h1>
            </div>
            <p style={{ margin: 0, fontSize: 10, color: "#2d5a35", letterSpacing: 2, textTransform: "uppercase" }}>{today}</p>
          </div>
          <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
            {todayLog.length > 0 && (
              <span style={{ fontSize: 11, color: G, background: `${G}15`, border: `1px solid ${G}30`, borderRadius: 20, padding: "4px 10px" }}>
                {todayLog.length} ejercicio{todayLog.length !== 1 ? "s" : ""}
              </span>
            )}
            <button onClick={() => setShowTimer(true)} style={{ padding: "10px 16px", background: `${G}10`, border: `1px solid ${G}30`, borderRadius: 9, color: G, fontSize: 11, cursor: "pointer", fontFamily: "inherit", fontWeight: 700 }}>⏱ Descanso</button>
          </div>
        </div>

        {/* Search bar — always visible */}
        <div style={{ position: "relative", marginBottom: 18 }}>
          <span style={{ position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)", color: "#2d5a35", fontSize: 15, pointerEvents: "none" }}>🔍</span>
          <input
            type="text" value={search} onChange={e => setSearch(e.target.value)}
            placeholder="Buscar ejercicio o músculo..."
            style={{ width: "100%", padding: "12px 14px 12px 40px", background: CARD, border: `1px solid ${search ? G : BORDER}`, borderRadius: 12, color: "#fff", fontSize: 14, fontFamily: "inherit", outline: "none", boxSizing: "border-box", transition: "border-color 0.2s" }}
          />
          {search && <button onClick={() => setSearch("")} style={{ position: "absolute", right: 12, top: "50%", transform: "translateY(-50%)", background: "none", border: "none", color: "#555", cursor: "pointer", fontSize: 16 }}>✕</button>}
        

        {/* Search results */}
        {search.trim().length > 1 && (
          <div style={{ marginBottom: 20 }}>
            {searchResults.length === 0 ? (
              <div style={{ padding: "20px", textAlign: "center", color: "#2d5a35", fontSize: 13, border: `1px dashed ${BORDER}`, borderRadius: 12 }}>
                Sin resultados para "<span style={{ color: G }}>{search}</span>"
              </div>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                <p style={{ margin: "0 0 8px", fontSize: 10, color: "#2d5a35", letterSpacing: 2, textTransform: "uppercase" }}>{searchResults.length} resultado{searchResults.length !== 1 ? "s" : ""}</p>
                {searchResults.map(ex => (
                  <div key={ex.name + ex.group} style={{ background: CARD, border: `1px solid ${BORDER}`, borderRadius: 12, padding: 14 }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 8 }}>
                      <div style={{ flex: 1 }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 5, flexWrap: "wrap" }}>
                          <span style={{ fontWeight: 700, fontSize: 14, color: "#fff" }}>{ex.name}</span>
                          <span style={{ fontSize: 10, padding: "2px 6px", borderRadius: 4, background: `${eqColors[ex.equipment]}15`, color: eqColors[ex.equipment], border: `1px solid ${eqColors[ex.equipment]}30`, letterSpacing: 1 }}>{ex.equipment}</span>
                          <span style={{ fontSize: 10, padding: "2px 6px", borderRadius: 4, background: `${G}10`, color: G, border: `1px solid ${G}20` }}>{ex.group}</span>
                        </div>
                        <div style={{ fontSize: 11, color: "#2d5a35" }}>{ex.muscles.join(" · ")}</div>
                      </div>
                      <div style={{ display: "flex", gap: 5, flexShrink: 0 }}>
                        <button onClick={() => setHowtoModal(ex)} style={{ padding: "5px 8px", border: `1px solid ${BORDER}`, borderRadius: 6, cursor: "pointer", fontFamily: "inherit", fontSize: 10, background: "transparent", color: "#4a7a52" }}>¿Cómo?</button>
                        <button onClick={() => setSubModal(ex)} style={{ padding: "5px 8px", border: `1px solid ${BORDER}`, borderRadius: 6, cursor: "pointer", fontFamily: "inherit", fontSize: 10, background: "transparent", color: "#4a7a52" }}>Sust.</button>
                        <button onClick={() => setAddModal(ex)} style={{ padding: "5px 10px", border: "none", borderRadius: 6, cursor: "pointer", fontFamily: "inherit", fontSize: 10, background: G, color: BG, fontWeight: 700 }}>+</button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Tabs */}
        <div style={{ display: "flex", gap: 4, marginBottom: 22, background: CARD, padding: 4, borderRadius: 12, border: `1px solid ${BORDER}` }}>
          {tabs.map(t => (
            <button key={t.id} onClick={() => setTab(t.id)} style={{
              flex: 1, padding: "9px 4px", border: "none", borderRadius: 8, cursor: "pointer",
              fontSize: 10, fontWeight: 700, letterSpacing: 1, fontFamily: "inherit",
              background: tab === t.id ? G : "transparent",
              color: tab === t.id ? BG : "#2d5a35", transition: "all 0.2s",
            }}>{t.label}</button>
          ))}
        </div>

        {/* ── CUERPO ── */}
        {tab === "cuerpo" && (
          <div style={{ display: "grid", gridTemplateColumns: selectedGroup ? "auto 1fr" : "1fr", gap: 20, alignItems: "start" }}>
            <BodyMap onSelect={g => { setSelectedGroup(g); }} activeGroup={selectedGroup} />

            {selectedGroup && (
              <div style={{ minWidth: 0 }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
                  <div>
                    <h2 style={{ margin: "0 0 3px", fontSize: 17, color: "#fff", fontWeight: 800 }}>{selectedGroup}</h2>
                    <p style={{ margin: 0, fontSize: 11, color: "#2d5a35" }}>{panelExercises.length} ejercicios</p>
                  </div>
                  <button onClick={() => setSelectedGroup(null)} style={{ background: "none", border: `1px solid ${BORDER}`, borderRadius: 7, color: "#555", fontSize: 12, cursor: "pointer", padding: "5px 10px", fontFamily: "inherit" }}>✕</button>
                </div>

                {/* Sibling groups for this area */}
                {(() => {
                  const siblingGroups = Object.keys(EXERCISES).filter(g => {
                    const sameArea = ["Pecho Superior","Pecho Medio","Pecho Inferior"].includes(selectedGroup) ? ["Pecho Superior","Pecho Medio","Pecho Inferior"].includes(g)
                      : ["Espalda Alta","Espalda Baja","Dorsal"].includes(selectedGroup) ? ["Espalda Alta","Espalda Baja","Dorsal"].includes(g)
                      : ["Hombro Frontal","Hombro Lateral","Hombro Posterior"].includes(selectedGroup) ? ["Hombro Frontal","Hombro Lateral","Hombro Posterior"].includes(g)
                      : ["Cuádriceps","Isquiotibiales","Glúteos","Gemelos"].includes(selectedGroup) ? ["Cuádriceps","Isquiotibiales","Glúteos","Gemelos"].includes(g)
                      : ["Bíceps","Tríceps"].includes(selectedGroup) ? ["Bíceps","Tríceps"].includes(g)
                      : g === selectedGroup;
                    return sameArea;
                  });
                  return siblingGroups.length > 1 ? (
                    <div style={{ display: "flex", gap: 6, marginBottom: 14, flexWrap: "wrap" }}>
                      {siblingGroups.map(g => (
                        <button key={g} onClick={() => setSelectedGroup(g)} style={{
                          padding: "5px 12px", border: `1px solid`, borderColor: g === selectedGroup ? G : BORDER,
                          borderRadius: 7, cursor: "pointer", fontFamily: "inherit", fontSize: 10, fontWeight: 600, letterSpacing: 0.5,
                          background: g === selectedGroup ? `${G}15` : "transparent",
                          color: g === selectedGroup ? G : "#2d5a35", transition: "all 0.15s",
                        }}>{g}</button>
                      ))}
                    </div>
                  ) : null;
                })()}

                <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                  {panelExercises.map(ex => (
                    <div key={ex.name} style={{ background: CARD, border: `1px solid ${BORDER}`, borderRadius: 12, padding: 14 }}>
                      <div style={{ marginBottom: 8 }}>
                        <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 6, marginBottom: 5 }}>
                          <h3 style={{ margin: 0, fontSize: 13, fontWeight: 800, color: "#fff", lineHeight: 1.3 }}>{ex.name}</h3>
                          <span style={{ fontSize: 9, padding: "2px 6px", borderRadius: 4, background: `${eqColors[ex.equipment]}15`, color: eqColors[ex.equipment], border: `1px solid ${eqColors[ex.equipment]}30`, letterSpacing: 1, flexShrink: 0, textTransform: "uppercase" }}>{ex.equipment}</span>
                        </div>
                        <div style={{ fontSize: 10, color: "#2d5a35" }}>{ex.muscles.join(" · ")}</div>
                      </div>
                      <div style={{ display: "flex", gap: 5 }}>
                        <button onClick={() => setHowtoModal(ex)} style={{ flex: 1, padding: "6px 4px", border: `1px solid ${BORDER}`, borderRadius: 6, cursor: "pointer", fontFamily: "inherit", fontSize: 10, background: "transparent", color: "#4a7a52" }}>¿Cómo?</button>
                        <button onClick={() => setSubModal(ex)} style={{ flex: 1, padding: "6px 4px", border: `1px solid ${BORDER}`, borderRadius: 6, cursor: "pointer", fontFamily: "inherit", fontSize: 10, background: "transparent", color: "#4a7a52" }}>Sustituir</button>
                        <button onClick={() => setAddModal(ex)} style={{ flex: 1, padding: "6px 4px", border: "none", borderRadius: 6, cursor: "pointer", fontFamily: "inherit", fontSize: 10, background: G, color: BG, fontWeight: 700 }}>+ Añadir</button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Quick group chips if nothing selected */}
            {!selectedGroup && (
              <div style={{ gridColumn: "1 / -1" }}>
                <p style={{ margin: "0 0 12px", fontSize: 10, color: "#2d5a35", letterSpacing: 2, textTransform: "uppercase" }}>O selecciona directamente:</p>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                  {Object.keys(EXERCISES).map(g => (
                    <button key={g} onClick={() => setSelectedGroup(g)} style={{
                      padding: "8px 16px", border: `1px solid ${BORDER}`, borderRadius: 9,
                      cursor: "pointer", fontFamily: "inherit", fontSize: 11, fontWeight: 600,
                      background: "transparent", color: "#4a7a52", transition: "all 0.15s",
                    }}
                      onMouseEnter={e => { e.target.style.borderColor = G; e.target.style.color = G; }}
                      onMouseLeave={e => { e.target.style.borderColor = BORDER; e.target.style.color = "#4a7a52"; }}
                    >
                      {g}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* ── HOY ── */}
        {tab === "hoy" && (
          <div>
            {todayLog.length > 0 && (
              <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 10, marginBottom: 18 }}>
                {[["Ejercicios", todayLog.length], ["Series", todayLog.reduce((s,e)=>s+e.sets,0)], ["Reps", todayLog.reduce((s,e)=>s+e.sets*e.reps,0)]].map(([l, v]) => (
                  <div key={l} style={{ background: CARD, border: `1px solid ${BORDER}`, borderRadius: 12, padding: 14, textAlign: "center" }}>
                    <div style={{ fontSize: 26, fontWeight: 900, color: G }}>{v}</div>
                    <div style={{ fontSize: 10, color: "#2d5a35", letterSpacing: 1, textTransform: "uppercase", marginTop: 2 }}>{l}</div>
                  </div>
                ))}
              </div>
            )}
            {todayLog.length === 0 ? (
              <div style={{ textAlign: "center", padding: "52px 20px", border: `1px dashed ${BORDER}`, borderRadius: 14 }}>
                <div style={{ fontSize: 42, marginBottom: 12 }}>🏋️</div>
                <p style={{ color: "#2d5a35", fontSize: 13, margin: 0 }}>Sin ejercicios hoy.<br />Ve a <strong style={{ color: G }}>CUERPO</strong> o busca arriba.</p>
              </div>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: 8, marginBottom: 14 }}>
                {todayLog.map(e => (
                  <div key={e.id} style={{ background: CARD, border: `1px solid ${BORDER}`, borderRadius: 11, padding: 13, display: "flex", justifyContent: "space-between", alignItems: "center", gap: 10 }}>
                    <div style={{ flex: 1 }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 7, marginBottom: 4 }}>
                        <span style={{ width: 6, height: 6, borderRadius: "50%", background: eqColors[e.equipment] || G, flexShrink: 0 }} />
                        <span style={{ fontWeight: 700, fontSize: 13, color: "#fff" }}>{e.name}</span>
                        <span style={{ fontSize: 10, color: "#2d5a35", marginLeft: "auto" }}>{e.time}</span>
                      </div>
                      <div style={{ fontSize: 12, color: "#4a7a52" }}>
                        <span style={{ color: G, fontWeight: 700 }}>{e.sets}×{e.reps}</span>
                        {e.weight && <span style={{ marginLeft: 7 }}>· {e.weight}kg</span>}
                      </div>
                    </div>
                    <button onClick={() => setTodayLog(p => p.filter(x => x.id !== e.id))} style={{ background: "transparent", border: `1px solid #1a0a0a`, color: "#ef4444", borderRadius: 6, width: 24, height: 24, cursor: "pointer", fontSize: 13, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>×</button>
                  </div>
                ))}
              </div>
            )}
            {todayLog.length > 0 && (
              <button onClick={saveWorkout} style={{ width: "100%", padding: 15, background: G, border: "none", borderRadius: 12, color: BG, fontWeight: 900, fontSize: 13, letterSpacing: 2, cursor: "pointer", fontFamily: "inherit" }}>
                GUARDAR ENTRENAMIENTO
              </button>
            )}
          </div>
        )}

        {/* ── PROGRESO ── */}
  
        {tab === "progreso" && ( 
          <div>

            {history.length < 2 ? (
              <div style={{ textAlign: "center", padding: "52px 20px", border: `1px dashed ${BORDER}`, borderRadius: 14 }}>
                <div style={{ fontSize: 42, marginBottom: 12 }}>📈</div>
                <p style={{ color: "#2d5a35", fontSize: 13, margin: 0 }}>Guarda al menos 2 entrenamientos para ver progreso.</p>
              </div>
            ) : (
             
                <div style={{ display: "flex", flexDirection: "column", gap: 18 }}> 
                <div style={{ background: CARD, border: `1px solid ${BORDER}`, borderRadius: 14, padding: 18 }}>


                <div style={{ background: CARD, border: `1px solid ${BORDER}`, borderRadius: 14, padding: 18 }}>
               
  <p style={{ margin: "0 0 14px", fontSize: 10, color: "#60a5fa", letterSpacing: 2, textTransform: "uppercase" }}>
    Peso Corporal
  </p>

  <div style={{ display: "flex", gap: 10, marginBottom: 18, flexWrap: "wrap" }}>
    <input
      type="number"
      step="0.1"
      placeholder="Peso actual (kg)"
      value={weightInput}
      onChange={(e) => setWeightInput(e.target.value)}
      style={{
        flex: 1,
        minWidth: 140,
        padding: 10,
        background: BG,
        border: `1px solid ${BORDER}`,
        borderRadius: 8,
        color: "#fff"
      }}
    />

    <button
      onClick={() => {
        if (!weightInput) return;

        setBodyWeight([
          ...bodyWeight,
          {
            date: new Date().toLocaleDateString(),
            weight: Number(weightInput),
          },
        ]);

        setWeightInput("");
      }}
      style={{
        padding: "10px 16px",
        background: G,
        border: "none",
        borderRadius: 8,
        cursor: "pointer",
        fontWeight: 700,
        color: BG
      }}
    >
      Guardar
    </button>
  </div>

  <div
    style={{
      display: "grid",
      gridTemplateColumns: "repeat(auto-fit,minmax(120px,1fr))",
      gap: 10,
      marginBottom: 18
    }}
  >
    <div style={{ textAlign: "center" }}>
      <div style={{ color: G, fontSize: 20, fontWeight: 800 }}>
        {currentWeight ?? "--"}
      </div>
      <div style={{ fontSize: 10, color: "#2d5a35" }}>ACTUAL</div>
    </div>

    <div style={{ textAlign: "center" }}>
      <div style={{ color: "#60a5fa", fontSize: 20, fontWeight: 800 }}>
        {lowestWeight ?? "--"}
      </div>
      <div style={{ fontSize: 10, color: "#2d5a35" }}>MÍNIMO</div>
    </div>

    <div style={{ textAlign: "center" }}>
      <div style={{ color: "#f59e0b", fontSize: 20, fontWeight: 800 }}>
        {highestWeight ?? "--"}
      </div>
      <div style={{ fontSize: 10, color: "#2d5a35" }}>MÁXIMO</div>
    </div>
  </div>

  <ResponsiveContainer width="100%" height={220}>
    <LineChart data={bodyWeight}>
      <CartesianGrid stroke="#0f2d12" strokeDasharray="3 3" />
      <XAxis
        dataKey="date"
        tick={{ fontSize: 9, fill: "#2d5a35", fontFamily: "monospace" }}
      />
      <YAxis />
      <Tooltip />
      <Line
        type="monotone"
        dataKey="weight"
        stroke="#60a5fa"
        strokeWidth={3}
        dot={{ fill: "#60a5fa", r: 3 }}
      />
    </LineChart>
  </ResponsiveContainer>
</div>
                  <p style={{ margin: "0 0 14px", fontSize: 10, color: G, letterSpacing: 2, textTransform: "uppercase" }}>Series por entrenamiento</p>
                  <ResponsiveContainer width="100%" height={160}>
                    <LineChart data={chartData}>
                      <CartesianGrid stroke="#0f2d12" strokeDasharray="3 3" />
                      <XAxis dataKey="name" tick={{ fontSize: 9, fill: "#2d5a35", fontFamily: "monospace" }} axisLine={false} tickLine={false} />
                      <YAxis tick={{ fontSize: 9, fill: "#2d5a35", fontFamily: "monospace" }} axisLine={false} tickLine={false} />
                      <Tooltip contentStyle={{ background: CARD, border: `1px solid ${BORDER}`, borderRadius: 8, fontSize: 11, fontFamily: "monospace" }} labelStyle={{ color: G }} itemStyle={{ color: "#fff" }} />
                      <Line type="monotone" dataKey="series" stroke={G} strokeWidth={2} dot={{ fill: G, r: 3 }} activeDot={{ r: 5 }} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
                <div style={{ background: CARD, border: `1px solid ${BORDER}`, borderRadius: 14, padding: 18 }}>
                  <p style={{ margin: "0 0 14px", fontSize: 10, color: "#4ade80", letterSpacing: 2, textTransform: "uppercase" }}>Reps totales</p>
                  <ResponsiveContainer width="100%" height={160}>
                    <LineChart data={chartData}>
                      <CartesianGrid stroke="#0f2d12" strokeDasharray="3 3" />
                      <XAxis dataKey="name" tick={{ fontSize: 9, fill: "#2d5a35", fontFamily: "monospace" }} axisLine={false} tickLine={false} />
                      <YAxis tick={{ fontSize: 9, fill: "#2d5a35", fontFamily: "monospace" }} axisLine={false} tickLine={false} />
                      <Tooltip contentStyle={{ background: CARD, border: `1px solid ${BORDER}`, borderRadius: 8, fontSize: 11, fontFamily: "monospace" }} labelStyle={{ color: "#4ade80" }} itemStyle={{ color: "#fff" }} />
                      <Line type="monotone" dataKey="reps" stroke="#4ade80" strokeWidth={2} dot={{ fill: "#4ade80", r: 3 }} activeDot={{ r: 5 }} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 10 }}>
                  {[["Días", history.length], ["Total Series", history.reduce((s,w)=>s+w.totalSets,0)], ["Total Reps", history.reduce((s,w)=>s+w.totalReps,0)]].map(([l, v]) => (
                    <div key={l} style={{ background: CARD, border: `1px solid ${BORDER}`, borderRadius: 12, padding: 14, textAlign: "center" }}>
                      <div style={{ fontSize: 22, fontWeight: 900, color: G }}>{v}</div>
                      <div style={{ fontSize: 9, color: "#2d5a35", letterSpacing: 1, textTransform: "uppercase", marginTop: 2 }}>{l}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* ── HISTORIAL ── */}
        {tab === "historial" && (
          <div>
            {history.length === 0 ? (
              <div style={{ textAlign: "center", padding: "52px 20px", border: `1px dashed ${BORDER}`, borderRadius: 14 }}>
                <div style={{ fontSize: 42, marginBottom: 12 }}>📋</div>
                <p style={{ color: "#2d5a35", fontSize: 13, margin: 0 }}>No hay entrenamientos guardados.</p>
              </div>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                {history.map((w, i) => (
                  <div key={i} style={{ background: CARD, border: `1px solid ${BORDER}`, borderRadius: 14, padding: 16 }}>
                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 10, alignItems: "center" }}>
                      <span style={{ fontWeight: 800, color: "#fff", fontSize: 13 }}>{w.date}</span>
                      <span style={{ fontSize: 10, color: G }}>{w.totalSets} series · {w.exercises.length} ejerc.</span>
                    </div>
                    <div style={{ display: "flex", flexWrap: "wrap", gap: 5 }}>
                      {w.exercises.map((e, j) => (
                        <span key={j} style={{ fontSize: 10, padding: "2px 8px", background: "#071209", borderRadius: 5, color: "#4a7a52", border: `1px solid ${BORDER}` }}>
                          {e.name} <span style={{ color: G }}>{e.sets}×{e.reps}</span>{e.weight ? ` ${e.weight}kg` : ""}
                        </span>
                      ))}
                    </div>
                  </div>
                ))}
                <button onClick={() => { if (window.confirm("¿Borrar todo el historial?")) { setHistory([]); showToast("Historial borrado"); } }}
                  style={{ padding: 12, background: "transparent", border: "1px solid #2a0a0a", borderRadius: 10, color: "#ef4444", cursor: "pointer", fontFamily: "inherit", fontSize: 12, marginTop: 4 }}>
                  Borrar historial
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Modals */}
      {showTimer && <RestTimer onClose={() => setShowTimer(false)} />}
      {howtoModal && <HowToModal exercise={howtoModal} onClose={() => setHowtoModal(null)} onAdd={() => { setAddModal(howtoModal); setHowtoModal(null); }} />}
      {subModal && <SubModal exercise={subModal} onClose={() => setSubModal(null)} onSelect={ex => { setSubModal(null); setAddModal(ex); }} />}
      {addModal && <AddModal exercise={addModal} onClose={() => setAddModal(null)} onAdd={addExercise} />}

      {toast && (
        <div style={{ position: "fixed", bottom: 24, left: "50%", transform: "translateX(-50%)", background: CARD, border: `1px solid ${G}`, color: G, padding: "10px 20px", borderRadius: 40, fontSize: 12, fontWeight: 700, zIndex: 400, whiteSpace: "nowrap" }}>
          {toast}
        </div>
      )}

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Mono:wght@400;500;700&display=swap');
        * { box-sizing: border-box; }
        input::-webkit-inner-spin-button { -webkit-appearance: none; }
        ::-webkit-scrollbar { width: 4px; }
        ::-webkit-scrollbar-thumb { background: #0f2d12; border-radius: 2px; }
      `}</style>
    </div>
  );
}
