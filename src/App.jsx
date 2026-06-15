import { useState, useEffect } from "react";
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";
import { EXERCISES } from "./data/exercises.js";
import { HowToModal } from "./components/HowToModal.jsx";
import RestTimer from "./components/RestTimer";
import { G, BG, CARD, BORDER } from "./utils/theme";
import { AddModal } from "./components/AddModal.jsx";
import { SubModal } from "./components/SubModal.jsx";
import { ExerciseFigure } from "./components/ExerciseFigure.jsx";
import { useAuth } from "./context/AuthContext";
import Login from "./pages/Login";
import { signOut } from "firebase/auth";
import { auth } from "./firebase";
import { doc, setDoc, getDoc } from "firebase/firestore";
import { db } from "./firebase";

const eqColors = {
  ninguno: "#22c55e", mancuernas: "#34d399", barra: "#86efac",
  cable: "#a7f3d0", máquina: "#6ee7b7", "barra dominadas": "#4ade80", paralelas: "#bbf7d0",
};

const STORE = {
  get: (k, d) => { try { const v = localStorage.getItem(k); return v ? JSON.parse(v) : d; } catch { return d; } },
  set: (k, v) => { try { localStorage.setItem(k, JSON.stringify(v)); } catch { /* localStorage unavailable */ } },
};

// ═══════════════════════════════════════════════════════════════
// BODY MAP
// ═══════════════════════════════════════════════════════════════
function BodyMap({ onSelect, activeGroup }) {
  const [view, setView] = useState("front");
  const [hovered, setHovered] = useState(null);

  const muscleZones = view === "front" ? [
    { id: "head",      path: "M200,18 C186,18 175,30 175,46 C175,62 186,74 200,74 C214,74 225,62 225,46 C225,30 214,18 200,18 Z", group: null },
    { id: "neck",      path: "M188,74 L212,74 L215,95 L185,95 Z", group: null },
    { id: "chestUpper",path: "M145,95 C145,95 160,100 185,100 L185,128 C165,128 148,120 140,110 Z M215,100 C240,100 255,95 255,95 L260,110 C252,120 235,128 215,128 L215,100 Z", group: "Pecho Superior" },
    { id: "chestMid",  path: "M185,128 L215,128 L215,155 L185,155 Z", group: "Pecho Medio" },
    { id: "chestLow",  path: "M185,155 L215,155 C215,155 220,168 218,175 L182,175 C180,168 185,155 185,155 Z", group: "Pecho Inferior" },
    { id: "shoulderL", path: "M115,95 C115,95 130,100 145,100 L140,130 C130,128 115,118 110,108 Z", group: "Hombro Frontal" },
    { id: "shoulderR", path: "M255,100 C270,100 285,95 285,95 L290,108 C285,118 270,128 260,130 Z", group: "Hombro Frontal" },
    { id: "bicepL",    path: "M105,130 C105,130 115,128 140,130 L142,175 C125,178 108,170 103,158 Z", group: "Bíceps" },
    { id: "bicepR",    path: "M260,130 C285,128 295,130 295,130 L297,158 C292,170 275,178 258,175 Z", group: "Bíceps" },
    { id: "forearmL",  path: "M100,160 L142,175 L140,225 L98,210 Z", group: null },
    { id: "forearmR",  path: "M258,175 L300,160 L302,210 L260,225 Z", group: null },
    { id: "core",      path: "M182,175 L218,175 L220,240 L180,240 Z", group: "Core" },
    { id: "quadL",     path: "M140,245 C140,245 158,243 178,243 L177,330 C163,333 145,325 136,310 Z", group: "Cuádriceps" },
    { id: "quadR",     path: "M222,243 C242,243 260,245 260,245 L264,310 C255,325 237,333 223,330 Z", group: "Cuádriceps" },
    { id: "calfL",     path: "M137,340 L175,335 L173,390 L133,385 Z", group: "Gemelos" },
    { id: "calfR",     path: "M225,335 L263,340 L267,385 L227,390 Z", group: "Gemelos" },
    { id: "handL",     path: "M92,215 L100,215 L98,248 L90,248 Z", group: null },
    { id: "handR",     path: "M300,215 L308,215 L310,248 L302,248 Z", group: null },
    { id: "footL",     path: "M130,392 L173,392 L173,408 L125,408 Z", group: null },
    { id: "footR",     path: "M227,392 L270,392 L275,408 L227,408 Z", group: null },
  ] : [
    { id: "headB",      path: "M200,18 C186,18 175,30 175,46 C175,62 186,74 200,74 C214,74 225,62 225,46 C225,30 214,18 200,18 Z", group: null },
    { id: "neckB",      path: "M188,74 L212,74 L215,95 L185,95 Z", group: null },
    { id: "trapL",      path: "M145,95 C145,95 162,100 185,105 L185,130 C162,130 142,118 138,106 Z", group: "Espalda Alta" },
    { id: "trapR",      path: "M215,105 C238,100 255,95 255,95 L262,106 C258,118 238,130 215,130 Z", group: "Espalda Alta" },
    { id: "latL",       path: "M138,108 L185,130 L183,195 C165,196 142,182 132,165 Z", group: "Dorsal" },
    { id: "latR",       path: "M215,130 L262,108 L268,165 C258,182 235,196 217,195 Z", group: "Dorsal" },
    { id: "lowerBack",  path: "M183,195 L217,195 L218,240 L182,240 Z", group: "Espalda Baja" },
    { id: "shoulderBL", path: "M110,108 C115,100 130,100 145,95 L138,108 C128,118 112,122 108,118 Z", group: "Hombro Posterior" },
    { id: "shoulderBR", path: "M255,95 C270,100 285,100 290,108 L292,118 C288,122 272,118 262,108 Z", group: "Hombro Posterior" },
    { id: "tricepL",    path: "M105,120 C112,122 138,108 138,108 L140,160 C125,165 105,155 100,142 Z", group: "Tríceps" },
    { id: "tricepR",    path: "M262,108 C288,122 295,120 295,120 L300,142 C295,155 275,165 260,160 Z", group: "Tríceps" },
    { id: "forearmBL",  path: "M98,145 L140,160 L138,215 L96,200 Z", group: null },
    { id: "forearmBR",  path: "M260,160 L302,145 L304,200 L262,215 Z", group: null },
    { id: "gluteL",     path: "M140,245 C140,245 158,243 180,243 L178,305 C162,312 140,302 133,286 Z", group: "Glúteos" },
    { id: "gluteR",     path: "M220,243 C242,243 260,245 260,245 L267,286 C260,302 238,312 222,305 Z", group: "Glúteos" },
    { id: "hamL",       path: "M133,288 L178,305 L175,360 C160,365 138,355 130,338 Z", group: "Isquiotibiales" },
    { id: "hamR",       path: "M222,305 L267,288 L270,338 C262,355 240,365 225,360 Z", group: "Isquiotibiales" },
    { id: "calfBL",     path: "M130,340 L175,360 L172,400 L127,395 Z", group: "Gemelos" },
    { id: "calfBR",     path: "M225,360 L270,340 L273,395 L228,400 Z", group: "Gemelos" },
    { id: "handBL",     path: "M90,205 L98,205 L96,240 L88,240 Z", group: null },
    { id: "handBR",     path: "M302,205 L310,205 L312,240 L304,240 Z", group: null },
    { id: "footBL",     path: "M124,397 L172,402 L172,415 L120,415 Z", group: null },
    { id: "footBR",     path: "M228,402 L276,397 L280,415 L228,415 Z", group: null },
  ];

  const getZoneColor = (zone) => {
    if (!zone.group) return "#0f2a12";
    if (zone.group === activeGroup) return G;
    if (zone.group === hovered) return "#16a34a";
    return "#143d1a";
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 12 }}>
      {/* Toggle FRENTE / ESPALDA */}
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

      {/* SVG */}
      <div style={{ position: "relative" }}>
        <svg viewBox="70 10 260 415" width="220" height="340"
          style={{ filter: "drop-shadow(0 0 18px rgba(34,197,94,0.15))", display: "block" }}>
          <defs>
            <filter id="glow">
              <feGaussianBlur stdDeviation="2" result="coloredBlur" />
              <feMerge><feMergeNode in="coloredBlur" /><feMergeNode in="SourceGraphic" /></feMerge>
            </filter>
          </defs>
          {muscleZones.map(zone => (
            <path
              key={zone.id}
              d={zone.path}
              fill={getZoneColor(zone)}
              stroke={zone.group ? (zone.group === activeGroup ? G : "#1a4a20") : "#0d2410"}
              strokeWidth={zone.group ? 1.5 : 0.8}
              opacity={!zone.group ? 0.6 : (zone.group === activeGroup || zone.group === hovered) ? 1 : 0.85}
              style={{
                cursor: zone.group ? "pointer" : "default",
                transition: "fill 0.2s, opacity 0.2s",
                filter: (zone.group === activeGroup || zone.group === hovered) ? "url(#glow)" : "none",
              }}
              onMouseEnter={() => zone.group && setHovered(zone.group)}
              onMouseLeave={() => setHovered(null)}
              onClick={() => zone.group && onSelect(zone.group)}
            />
          ))}
        </svg>

        {hovered && (
          <div style={{
            position: "absolute", bottom: -30, left: "50%", transform: "translateX(-50%)",
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
export default function GymTrackerContent() {

  const { user } = useAuth();

  const [tab, setTab]                   = useState("cuerpo");
  const [selectedGroup, setSelectedGroup] = useState(null);
  const [search, setSearch]             = useState("");
  const [todayLog, setTodayLog]         = useState(() => STORE.get("gymtrack_today", []));
  const [history, setHistory]           = useState(() => STORE.get("gymtrack_history", []));
  const [showTimer, setShowTimer]       = useState(false);
  const [howtoModal, setHowtoModal]     = useState(null);
  const [subModal, setSubModal]         = useState(null);
  const [addModal, setAddModal]         = useState(null);
  const [toast, setToast]               = useState(null);
  const [bodyWeight, setBodyWeight]     = useState(() => STORE.get("bodyWeight", []));
  const [records, setRecords] = useState(() => STORE.get("records", {}));
  const [weightInput, setWeightInput]   = useState("");

  useEffect(() => {
    STORE.set("gymtrack_today", todayLog);
  
    const saveTodayLog = async () => {
      if (!user) return;
  
      try {
        await setDoc(
          doc(db, "users", user.uid),
          {
            todayLog,
          },
          { merge: true }
        );
      } catch (error) {
        console.error("Error guardando todayLog:", error);
      }
    };
  
    saveTodayLog();
  }, [todayLog, user]);

  useEffect(() => { STORE.set("gymtrack_history", history); },  [history]);
  useEffect(() => { STORE.set("bodyWeight", bodyWeight); },     [bodyWeight]);
  useEffect(() => { STORE.set("records", records); }, [records]);

  useEffect(() => {
    const loadWeight = async () => {
      if (!user) return;
  
      try {
        const snap = await getDoc(doc(db, "users", user.uid));
  
        if (snap.exists()) {
          const data = snap.data();
  
          if (data.bodyWeight) {
            setBodyWeight(data.bodyWeight);
          }
  
          if (data.history) {
            setHistory(data.history);
          }
          
          if (data.todayLog) {
            setTodayLog(data.todayLog);
          }
        }

      } catch (error) {
        console.error("Error cargando peso:", error);
      }
    };
  
    loadWeight();
  }, [user]);

  if (!user) {
    return <Login />;
  }
  
  const showToast = msg => { setToast(msg); setTimeout(() => setToast(null), 2500); };

  // Click en logo → volver al inicio
  const goHome = () => {
    setTab("cuerpo");
    setSelectedGroup(null);
    setSearch("");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const addExercise = ({ name, muscles, equipment, sets, reps, weight }) => {
    setTodayLog(p => [...p, {
      id: Date.now(), name, muscles, equipment, sets, reps, weight,
      time: new Date().toLocaleTimeString("es-MX", { hour: "2-digit", minute: "2-digit" }),
    }]);
    setAddModal(null);
    setHowtoModal(null);
    showToast(`✓ ${name} añadido`);
  };

  const saveWorkout = async () => {
    console.log("SAVE WORKOUT EJECUTADO");
    if (!todayLog.length) return;
  
    const newWorkout = {
      date: new Date().toLocaleDateString("es-MX", {
        day: "numeric",
        month: "short",
        year: "numeric",
      }),
      dateRaw: Date.now(),
      exercises: todayLog,
      totalSets: todayLog.reduce((s, e) => s + e.sets, 0),
      totalReps: todayLog.reduce((s, e) => s + e.sets * e.reps, 0),
    };
  
    const updatedHistory = [newWorkout, ...history];
  
    setHistory(updatedHistory);
  
    await setDoc(
      doc(db, "users", user.uid),
      {
        history: updatedHistory,
      },
      { merge: true }
    );
  
    console.log("Historial guardado:", updatedHistory);

    await setDoc(
      doc(db, "users", user.uid),
      {
        history: updatedHistory,
      },
      { merge: true }
    );
    

    const newRecords = { ...records };

todayLog.forEach(exercise => {
  const currentRecord = newRecords[exercise.name] || 0;

  if (exercise.weight > currentRecord) {
    newRecords[exercise.name] = exercise.weight;
  }
});

setRecords(newRecords);

    setTodayLog([]);
    showToast("💪 ¡Entrenamiento guardado!");
  }; 

  const allExercises   = Object.entries(EXERCISES).flatMap(([grp, exs]) => exs.map(e => ({ ...e, group: grp })));
  const searchResults  = search.trim().length > 1
    ? allExercises.filter(e =>
        e.name.toLowerCase().includes(search.toLowerCase()) ||
        e.muscles.some(m => m.toLowerCase().includes(search.toLowerCase())) ||
        e.group.toLowerCase().includes(search.toLowerCase()))
    : [];
  const panelExercises = selectedGroup ? EXERCISES[selectedGroup] || [] : [];
  const chartData      = [...history].reverse().slice(-10).map(w => ({
    name: w.date.split(" ")[0], series: w.totalSets, reps: w.totalReps,
  }));

  const today          = new Date().toLocaleDateString("es-MX", { weekday: "long", day: "numeric", month: "long" });
  const currentWeight  = bodyWeight.length > 0 ? bodyWeight[bodyWeight.length - 1].weight : null;
  const lowestWeight   = bodyWeight.length > 0 ? Math.min(...bodyWeight.map(w => w.weight)) : null;
  const highestWeight  = bodyWeight.length > 0 ? Math.max(...bodyWeight.map(w => w.weight)) : null;

  const SIBLING_MAP = {
    "Pecho Superior": ["Pecho Superior", "Pecho Medio", "Pecho Inferior"],
    "Pecho Medio":    ["Pecho Superior", "Pecho Medio", "Pecho Inferior"],
    "Pecho Inferior": ["Pecho Superior", "Pecho Medio", "Pecho Inferior"],
    "Espalda Alta":   ["Espalda Alta", "Espalda Baja", "Dorsal"],
    "Espalda Baja":   ["Espalda Alta", "Espalda Baja", "Dorsal"],
    "Dorsal":         ["Espalda Alta", "Espalda Baja", "Dorsal"],
    "Hombro Frontal":   ["Hombro Frontal", "Hombro Lateral", "Hombro Posterior"],
    "Hombro Lateral":   ["Hombro Frontal", "Hombro Lateral", "Hombro Posterior"],
    "Hombro Posterior": ["Hombro Frontal", "Hombro Lateral", "Hombro Posterior"],
    "Cuádriceps":     ["Cuádriceps", "Isquiotibiales", "Glúteos", "Gemelos"],
    "Isquiotibiales": ["Cuádriceps", "Isquiotibiales", "Glúteos", "Gemelos"],
    "Glúteos":        ["Cuádriceps", "Isquiotibiales", "Glúteos", "Gemelos"],
    "Gemelos":        ["Cuádriceps", "Isquiotibiales", "Glúteos", "Gemelos"],
    "Bíceps":         ["Bíceps", "Tríceps"],
    "Tríceps":        ["Bíceps", "Tríceps"],
  };

  const tabs = [
    { id: "cuerpo",   label: "CUERPO"   },
    { id: "hoy",      label: "HOY"      },
    { id: "progreso", label: "PROGRESO" },
    { id: "historial",label: "HISTORIAL"},
  ];

  /* ─── shared button style helpers ─── */
  const tabBtn = (t) => ({
    flex: 1, padding: "9px 2px", border: "none", borderRadius: 8, cursor: "pointer",
    fontSize: 10, fontWeight: 700, letterSpacing: 1, fontFamily: "inherit",
    background: tab === t.id ? G : "transparent",
    color: tab === t.id ? BG : "#2d5a35",
    transition: "all 0.2s",
    whiteSpace: "nowrap",
  });

  return (
    <div style={{ minHeight: "100vh", background: BG, fontFamily: "'DM Mono','Courier New',monospace", color: "#ccc", overflowX: "hidden" }}>

      {/* Background grid */}
      <div style={{ position: "fixed", inset: 0, backgroundImage: `linear-gradient(rgba(34,197,94,0.025) 1px,transparent 1px),linear-gradient(90deg,rgba(34,197,94,0.025) 1px,transparent 1px)`, backgroundSize: "36px 36px", pointerEvents: "none", zIndex: 0 }} />
      <div style={{ position: "fixed", top: -250, left: "50%", transform: "translateX(-50%)", width: 600, height: 400, background: "radial-gradient(ellipse, rgba(34,197,94,0.06) 0%,transparent 70%)", pointerEvents: "none", zIndex: 0 }} />

      <div style={{ position: "relative", zIndex: 1, maxWidth: 960, margin: "0 auto", padding: "16px 14px 100px" }}>

        {/* ── HEADER ── */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 10, marginBottom: 18 }}>

          {/* Logo — clickable */}
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <button type="button" onClick={goHome} aria-label="Ir al inicio" title="Ir al inicio" style={{ width: 32, height: 32, background: G, border: "none", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16, fontWeight: 900, color: BG, borderRadius: 8, flexShrink: 0, cursor: "pointer", fontFamily: "inherit", padding: 0 }}>G</button>
            <button type="button" onClick={goHome} aria-label="GYMTRACK - ir al inicio" title="Ir al inicio" style={{ background: "none", border: "none", cursor: "pointer", padding: "6px 0", fontFamily: "inherit" }}>
            <span style={{ fontSize: 19, fontWeight: 800, color: "#fff", letterSpacing: -0.5, fontFamily: "'DM Mono','Courier New',monospace" }}>
              GYM<span style={{ color: G }}>TRACK</span>
            </span>
            </button>

            <button
  onClick={() => signOut(auth)}
  style={{
    padding: "6px 8px",
    background: "transparent",
    border: "1px solid #ef4444",
    borderRadius: 9,
    color: "#ef4444",
    fontSize: 10,
    cursor: "pointer",
    fontFamily: "inherit",
    fontWeight: 700,
    whiteSpace: "nowrap",
    flexShrink: 0,
  }}
>
  🚪 Salir
</button>
          </div>

          {/* Right side */}
          <div style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap", justifyContent: "flex-end", }}>
            {todayLog.length > 0 && (
              <span style={{ fontSize: 11, color: G, background: `${G}15`, border: `1px solid ${G}30`, borderRadius: 20, padding: "4px 10px", whiteSpace: "nowrap" }}>
                {todayLog.length} ejercicio{todayLog.length !== 1 ? "s" : ""}
              </span>
            )}
            <button onClick={() => setShowTimer(true)} style={{ padding: "8px 14px", background: `${G}10`, border: `1px solid ${G}30`, borderRadius: 9, color: G, fontSize: 11, cursor: "pointer", fontFamily: "inherit", fontWeight: 700, whiteSpace: "nowrap" }}>
              ⏱ Descanso
            </button>

          </div>
        </div>

        {/* Fecha — debajo del header en móvil */}
        <p style={{ margin: "0 0 16px", fontSize: 10, color: "#2d5a35", letterSpacing: 2, textTransform: "uppercase" }}>{today}</p>

        {/* ── SEARCH BAR ── */}
        <div style={{ position: "relative", marginBottom: 16 }}>
          <span style={{ position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)", color: "#2d5a35", fontSize: 15, pointerEvents: "none" }}>🔍</span>
          <input
            type="text" value={search} onChange={e => setSearch(e.target.value)}
            placeholder="Buscar ejercicio o músculo..."
            style={{ width: "100%", padding: "11px 40px 11px 40px", background: CARD, border: `1px solid ${search ? G : BORDER}`, borderRadius: 12, color: "#fff", fontSize: 14, fontFamily: "inherit", outline: "none", boxSizing: "border-box", transition: "border-color 0.2s" }}
          />
          {search && (
            <button onClick={() => setSearch("")} style={{ position: "absolute", right: 12, top: "50%", transform: "translateY(-50%)", background: "none", border: "none", color: "#555", cursor: "pointer", fontSize: 16, padding: 0, lineHeight: 1 }}>✕</button>
          )}
        </div>

        {/* ── SEARCH RESULTS ── */}
        {search.trim().length > 1 && (
          <div style={{ marginBottom: 18 }}>
            {searchResults.length === 0 ? (
              <div style={{ padding: "18px", textAlign: "center", color: "#2d5a35", fontSize: 13, border: `1px dashed ${BORDER}`, borderRadius: 12 }}>
                Sin resultados para "<span style={{ color: G }}>{search}</span>"
              </div>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                <p style={{ margin: "0 0 6px", fontSize: 10, color: "#2d5a35", letterSpacing: 2, textTransform: "uppercase" }}>
                  {searchResults.length} resultado{searchResults.length !== 1 ? "s" : ""}
                </p>
                {searchResults.map(ex => (
                  <div key={ex.name + ex.group} style={{ background: CARD, border: `1px solid ${BORDER}`, borderRadius: 12, padding: 14 }}>
                    <div style={{ marginBottom: 10 }}>
                      <ExerciseFigure exercise={ex} />
                    </div>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 8, flexWrap: "wrap" }}>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 4, flexWrap: "wrap" }}>
                          <span style={{ fontWeight: 700, fontSize: 13, color: "#fff" }}>{ex.name}</span>
                          <span style={{ fontSize: 9, padding: "2px 6px", borderRadius: 4, background: `${eqColors[ex.equipment]}15`, color: eqColors[ex.equipment], border: `1px solid ${eqColors[ex.equipment]}30`, letterSpacing: 1, textTransform: "uppercase" }}>{ex.equipment}</span>
                          <span style={{ fontSize: 9, padding: "2px 6px", borderRadius: 4, background: `${G}10`, color: G, border: `1px solid ${G}20` }}>{ex.group}</span>
                        </div>
                        <div style={{ fontSize: 11, color: "#2d5a35" }}>{ex.muscles.join(" · ")}</div>
                      </div>
                      <div style={{ display: "flex", gap: 5, flexShrink: 0 }}>
                        <button onClick={() => setHowtoModal(ex)} style={{ padding: "5px 8px", border: `1px solid ${BORDER}`, borderRadius: 6, cursor: "pointer", fontFamily: "inherit", fontSize: 10, background: "transparent", color: "#4a7a52" }}>¿Cómo?</button>
                        <button onClick={() => setSubModal(ex)}   style={{ padding: "5px 8px", border: `1px solid ${BORDER}`, borderRadius: 6, cursor: "pointer", fontFamily: "inherit", fontSize: 10, background: "transparent", color: "#4a7a52" }}>Sust.</button>
                        <button onClick={() => setAddModal(ex)}   style={{ padding: "5px 10px", border: "none", borderRadius: 6, cursor: "pointer", fontFamily: "inherit", fontSize: 10, background: G, color: BG, fontWeight: 700 }}>+</button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ── TABS ── */}
        <div style={{ display: "flex", gap: 4, marginBottom: 20, background: CARD, padding: 4, borderRadius: 12, border: `1px solid ${BORDER}`, overflowX: "auto" }}>
          {tabs.map(t => (
            <button key={t.id} onClick={() => setTab(t.id)} style={tabBtn(t)}>{t.label}</button>
          ))}
        </div>

        {/* ════════════════════════════════
            TAB: CUERPO
        ════════════════════════════════ */}
        {tab === "cuerpo" && (
          <div>
            {/* En móvil: columna. En desktop: lado a lado */}
            <div className="body-grid" style={{
              display: "grid",
              gridTemplateColumns: selectedGroup ? "minmax(0,220px) 1fr" : "1fr",
              gap: 20,
              alignItems: "start",
            }}>
              {/* Body map — se oculta en móvil cuando hay grupo seleccionado para dar más espacio */}
              <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
                <BodyMap onSelect={g => setSelectedGroup(g)} activeGroup={selectedGroup} />
              </div>

              {/* Exercise panel */}
              {selectedGroup && (
                <div style={{ minWidth: 0 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12, gap: 8 }}>
                    <div>
                      <h2 style={{ margin: "0 0 2px", fontSize: 16, color: "#fff", fontWeight: 800 }}>{selectedGroup}</h2>
                      <p style={{ margin: 0, fontSize: 11, color: "#2d5a35" }}>{panelExercises.length} ejercicios</p>
                    </div>
                    <button onClick={() => setSelectedGroup(null)} style={{ background: "none", border: `1px solid ${BORDER}`, borderRadius: 7, color: "#555", fontSize: 12, cursor: "pointer", padding: "5px 10px", fontFamily: "inherit", flexShrink: 0 }}>✕</button>
                  </div>

                  {/* Sibling group tabs */}
                  {(SIBLING_MAP[selectedGroup] || []).length > 1 && (
                    <div style={{ display: "flex", gap: 6, marginBottom: 12, flexWrap: "wrap" }}>
                      {(SIBLING_MAP[selectedGroup] || []).map(g => (
                        <button key={g} onClick={() => setSelectedGroup(g)} style={{
                          padding: "5px 10px", border: `1px solid`,
                          borderColor: g === selectedGroup ? G : BORDER,
                          borderRadius: 7, cursor: "pointer", fontFamily: "inherit", fontSize: 10, fontWeight: 600,
                          background: g === selectedGroup ? `${G}15` : "transparent",
                          color: g === selectedGroup ? G : "#2d5a35",
                          transition: "all 0.15s",
                          whiteSpace: "nowrap",
                        }}>{g}</button>
                      ))}
                    </div>
                  )}

                  {/* Exercise cards */}
                  <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                    {panelExercises.map(ex => (
                      <div key={ex.name} style={{ background: CARD, border: `1px solid ${BORDER}`, borderRadius: 12, padding: 14 }}>
                        <div style={{ marginBottom: 10 }}>
                          <ExerciseFigure exercise={{ ...ex, group: selectedGroup }} />
                        </div>
                        <div style={{ marginBottom: 8 }}>
                          <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 6, marginBottom: 4, flexWrap: "wrap" }}>
                            <h3 style={{ margin: 0, fontSize: 13, fontWeight: 800, color: "#fff", lineHeight: 1.4, wordBreak: "break-word", minWidth: 0 }}>{ex.name}</h3>
                            <span style={{ fontSize: 9, padding: "2px 6px", borderRadius: 4, background: `${eqColors[ex.equipment]}15`, color: eqColors[ex.equipment], border: `1px solid ${eqColors[ex.equipment]}30`, letterSpacing: 1, flexShrink: 0, textTransform: "uppercase" }}>{ex.equipment}</span>
                          </div>
                          <div style={{ fontSize: 10, color: "#2d5a35" }}>{ex.muscles.join(" · ")}</div>
                        </div>
                        <div className="exercise-actions" style={{ display: "grid", gridTemplateColumns: "repeat(3,minmax(0,1fr))", gap: 5 }}>
                          <button className="exercise-action" onClick={() => setHowtoModal(ex)} style={{ padding: "7px 4px", border: `1px solid ${BORDER}`, borderRadius: 6, cursor: "pointer", fontFamily: "inherit", fontSize: 10, background: "transparent", color: "#4a7a52", minWidth: 0 }}>¿Cómo?</button>
                          <button className="exercise-action" onClick={() => setSubModal(ex)}   style={{ padding: "7px 4px", border: `1px solid ${BORDER}`, borderRadius: 6, cursor: "pointer", fontFamily: "inherit", fontSize: 10, background: "transparent", color: "#4a7a52", minWidth: 0 }}>Sustituir</button>
                          <button className="exercise-action" onClick={() => setAddModal(ex)}   style={{ padding: "7px 4px", border: "none", borderRadius: 6, cursor: "pointer", fontFamily: "inherit", fontSize: 10, background: G, color: BG, fontWeight: 700, minWidth: 0 }}>+ Añadir</button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Quick chips (solo si no hay grupo seleccionado) */}
            {!selectedGroup && (
              <div style={{ marginTop: 20 }}>
                <p style={{ margin: "0 0 10px", fontSize: 10, color: "#2d5a35", letterSpacing: 2, textTransform: "uppercase" }}>O selecciona directamente:</p>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                  {Object.keys(EXERCISES).map(g => (
                    <button key={g} onClick={() => setSelectedGroup(g)} style={{
                      padding: "8px 14px", border: `1px solid ${BORDER}`, borderRadius: 9,
                      cursor: "pointer", fontFamily: "inherit", fontSize: 11, fontWeight: 600,
                      background: "transparent", color: "#4a7a52", transition: "all 0.15s",
                    }}
                      onMouseEnter={e => { e.currentTarget.style.borderColor = G; e.currentTarget.style.color = G; }}
                      onMouseLeave={e => { e.currentTarget.style.borderColor = BORDER; e.currentTarget.style.color = "#4a7a52"; }}
                    >{g}</button>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* ════════════════════════════════
            TAB: HOY
        ════════════════════════════════ */}
        {tab === "hoy" && (
          <div>
            {todayLog.length > 0 && (
              <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 10, marginBottom: 16 }}>
                {[["Ejercicios", todayLog.length], ["Series", todayLog.reduce((s,e)=>s+e.sets,0)], ["Reps", todayLog.reduce((s,e)=>s+e.sets*e.reps,0)]].map(([l, v]) => (
                  <div key={l} style={{ background: CARD, border: `1px solid ${BORDER}`, borderRadius: 12, padding: 14, textAlign: "center" }}>
                    <div style={{ fontSize: 24, fontWeight: 900, color: G }}>{v}</div>
                    <div style={{ fontSize: 9, color: "#2d5a35", letterSpacing: 1, textTransform: "uppercase", marginTop: 2 }}>{l}</div>
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
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 7, marginBottom: 4, flexWrap: "wrap" }}>
                        <span style={{ width: 6, height: 6, borderRadius: "50%", background: eqColors[e.equipment] || G, flexShrink: 0 }} />
                        <span style={{ fontWeight: 700, fontSize: 13, color: "#fff", wordBreak: "break-word" }}>{e.name}</span>
                        <span style={{ fontSize: 10, color: "#2d5a35", marginLeft: "auto", flexShrink: 0 }}>{e.time}</span>
                      </div>
                      <div style={{ fontSize: 12, color: "#4a7a52" }}>
                        <span style={{ color: G, fontWeight: 700 }}>{e.sets}×{e.reps}</span>
                        {e.weight && <span style={{ marginLeft: 7 }}>· {e.weight}kg</span>}
                      </div>
                    </div>
                    <button onClick={() => setTodayLog(p => p.filter(x => x.id !== e.id))}
                      style={{ background: "transparent", border: "1px solid #2a0a0a", color: "#ef4444", borderRadius: 6, width: 26, height: 26, cursor: "pointer", fontSize: 14, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>×</button>
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

        {/* ════════════════════════════════
            TAB: PROGRESO
        ════════════════════════════════ */}
        {tab === "progreso" && (
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>

            {/* Peso corporal — siempre visible */}
            <div style={{ background: CARD, border: `1px solid ${BORDER}`, borderRadius: 14, padding: 18 }}>
              <p style={{ margin: "0 0 14px", fontSize: 10, color: "#60a5fa", letterSpacing: 2, textTransform: "uppercase" }}>Peso Corporal</p>

              <div style={{ display: "flex", gap: 8, marginBottom: 16, flexWrap: "wrap" }}>
                <input
                  type="number" step="0.1" placeholder="Peso actual (kg)"
                  value={weightInput} onChange={e => setWeightInput(e.target.value)}
                  style={{ flex: 1, minWidth: 130, padding: "10px 12px", background: BG, border: `1px solid ${BORDER}`, borderRadius: 8, color: "#fff", fontFamily: "inherit", fontSize: 14, outline: "none" }}
                />

                <button
                  onClick={async () => {
                    if (!weightInput) return;
                  
                    const newWeight = {
                      date: new Date().toLocaleDateString("es-MX", {
                        day: "numeric",
                        month: "short",
                      }),
                      weight: Number(weightInput),
                    };
                  
                    const updatedWeights = [...bodyWeight, newWeight];
                  
                    setBodyWeight(updatedWeights);
                  
                    await setDoc(
                      doc(db, "users", user.uid),
                      {
                        bodyWeight: updatedWeights,
                      },
                      { merge: true }
                    );
                  
                    setWeightInput("");
                    showToast("⚖️ Peso guardado");
                  }} 
                  >
                </button>
              </div>

              <div
  style={{
    background: CARD,
    border: `1px solid ${BORDER}`,
    borderRadius: 14,
    padding: 18,
    marginTop: 16,
  }}
>
  <p
    style={{
      margin: "0 0 14px",
      fontSize: 10,
      color: "#f59e0b",
      letterSpacing: 2,
      textTransform: "uppercase",
    }}
  >
    🏆 Récords Personales
  </p>

  {Object.keys(records).length === 0 ? (
    <p style={{ color: "#9ca3af" }}>
      Aún no hay récords registrados.
    </p>
  ) : (
    Object.entries(records).map(([exercise, weight]) => (
      <div
        key={exercise}
        style={{
          display: "flex",
          justifyContent: "space-between",
          padding: "8px 0",
          borderBottom: `1px solid ${BORDER}`,
        }}
      >
        <span>{exercise}</span>
        <strong>{weight} kg</strong>
      </div>
    ))
  )}
</div>

              {bodyWeight.length > 0 && (
                <>
                  <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 10, marginBottom: 16 }}>
                    {[["Actual", currentWeight, G], ["Mínimo", lowestWeight, "#60a5fa"], ["Máximo", highestWeight, "#f59e0b"]].map(([l, v, c]) => (
                      <div key={l} style={{ textAlign: "center" }}>
                        <div style={{ color: c, fontSize: 20, fontWeight: 800 }}>{v ?? "--"}</div>
                        <div style={{ fontSize: 9, color: "#2d5a35", letterSpacing: 1, textTransform: "uppercase" }}>{l}</div>
                      </div>
                    ))}
                  </div>
                  <ResponsiveContainer width="100%" height={180}>
                    <LineChart data={bodyWeight}>
                      <CartesianGrid stroke="#0f2d12" strokeDasharray="3 3" />
                      <XAxis dataKey="date" tick={{ fontSize: 9, fill: "#2d5a35", fontFamily: "monospace" }} axisLine={false} tickLine={false} />
                      <YAxis tick={{ fontSize: 9, fill: "#2d5a35", fontFamily: "monospace" }} axisLine={false} tickLine={false} domain={["auto","auto"]} />
                      <Tooltip contentStyle={{ background: CARD, border: `1px solid ${BORDER}`, borderRadius: 8, fontSize: 11, fontFamily: "monospace" }} labelStyle={{ color: "#60a5fa" }} itemStyle={{ color: "#fff" }} />
                      <Line type="monotone" dataKey="weight" stroke="#60a5fa" strokeWidth={2} dot={{ fill: "#60a5fa", r: 3 }} activeDot={{ r: 5 }} />
                    </LineChart>
                  </ResponsiveContainer>
                </>
              )}
            </div>

            {history.length < 2 ? (
              <div style={{ textAlign: "center", padding: "40px 20px", border: `1px dashed ${BORDER}`, borderRadius: 14 }}>
                <div style={{ fontSize: 38, marginBottom: 10 }}>📈</div>
                <p style={{ color: "#2d5a35", fontSize: 13, margin: 0 }}>Guarda al menos 2 entrenamientos para ver las gráficas de volumen.</p>
              </div>
            ) : (
              <>
                <div style={{ background: CARD, border: `1px solid ${BORDER}`, borderRadius: 14, padding: 18 }}>
                  <p style={{ margin: "0 0 12px", fontSize: 10, color: G, letterSpacing: 2, textTransform: "uppercase" }}>Series por entrenamiento</p>
                  <ResponsiveContainer width="100%" height={150}>
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
                  <p style={{ margin: "0 0 12px", fontSize: 10, color: "#4ade80", letterSpacing: 2, textTransform: "uppercase" }}>Reps totales</p>
                  <ResponsiveContainer width="100%" height={150}>
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
                      <div style={{ fontSize: 20, fontWeight: 900, color: G }}>{v}</div>
                      <div style={{ fontSize: 9, color: "#2d5a35", letterSpacing: 1, textTransform: "uppercase", marginTop: 2 }}>{l}</div>
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>
        )}

        {/* ════════════════════════════════
            TAB: HISTORIAL
        ════════════════════════════════ */}
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
                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 10, alignItems: "center", gap: 8, flexWrap: "wrap" }}>
                      <span style={{ fontWeight: 800, color: "#fff", fontSize: 13 }}>{w.date}</span>
                      <span style={{ fontSize: 10, color: G, flexShrink: 0 }}>{w.totalSets} series · {w.exercises.length} ejerc.</span>
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

      </div>{/* end main container */}

      {/* ── MODALS ── */}
      {showTimer  && <RestTimer  onClose={() => setShowTimer(false)} />}
      {howtoModal && <HowToModal exercise={howtoModal} onClose={() => setHowtoModal(null)} onAdd={() => { setAddModal(howtoModal); setHowtoModal(null); }} />}
      {subModal   && <SubModal   exercise={subModal}   onClose={() => setSubModal(null)}   onSelect={ex => { setSubModal(null); setAddModal(ex); }} />}
      {addModal   && <AddModal   exercise={addModal}   onClose={() => setAddModal(null)}   onAdd={addExercise} />}

      {/* ── TOAST ── */}
      {toast && (
        <div style={{ position: "fixed", bottom: 24, left: "50%", transform: "translateX(-50%)", background: CARD, border: `1px solid ${G}`, color: G, padding: "10px 20px", borderRadius: 40, fontSize: 12, fontWeight: 700, zIndex: 500, whiteSpace: "nowrap", pointerEvents: "none" }}>
          {toast}
        </div>
      )}

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Mono:wght@400;500;700&display=swap');
        * { box-sizing: border-box; }
        input[type=number]::-webkit-inner-spin-button,
        input[type=number]::-webkit-outer-spin-button { -webkit-appearance: none; margin: 0; }
        input[type=number] { -moz-appearance: textfield; }
        ::-webkit-scrollbar { width: 4px; height: 4px; }
        ::-webkit-scrollbar-thumb { background: #0f2d12; border-radius: 2px; }

        /* ── RESPONSIVE ── */

        /* Tablet / pequeño desktop: body map arriba, ejercicios abajo */
        @media (max-width: 700px) {
          .body-grid {
            grid-template-columns: 1fr !important;
          }
          .body-grid > *:first-child {
            border-bottom: 1px solid ${BORDER};
            padding-bottom: 16px;
            margin-bottom: 4px;
          }
        }

        /* Móvil: tabs más pequeños, padding ajustado */
        @media (max-width: 480px) {
          h1 { font-size: 16px !important; }
          h2 { font-size: 14px !important; }
          .exercise-actions {
            grid-template-columns: repeat(2, minmax(0, 1fr)) !important;
          }
          .exercise-actions .exercise-action {
            min-height: 34px;
            overflow-wrap: anywhere;
            white-space: normal;
          }
          .exercise-actions .exercise-action:last-child {
            grid-column: 1 / -1;
          }
        }
      `}</style>
    </div>
  );
}
