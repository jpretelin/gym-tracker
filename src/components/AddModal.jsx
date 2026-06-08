import { useState } from "react";
import { G, BG, CARD, BORDER } from "../utils/theme";

export function AddModal({ exercise, onClose, onAdd }) {
    const [sets, setSets] = useState("3");
    const [reps, setReps] = useState("10");
    const [weight, setWeight] = useState("");
    const inp = { width: "100%", padding: 10, background: "#071209", border: `1px solid ${BORDER}`, borderRadius: 8, color: "#fff", fontSize: 20, fontFamily: "inherit", textAlign: "center", boxSizing: "border-box", outline: "none" };
    return (
      <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.92)", zIndex: 300, display: "flex", alignItems: "center", justifyContent: "center", padding: 16 }}
        onClick={onClose}>
        <div style={{ background: CARD, border: `1px solid ${BORDER}`, borderRadius: 20, padding: 28, maxWidth: 360, width: "100%" }}
          onClick={e => e.stopPropagation()}>
          <h2 style={{ margin: "0 0 20px", fontSize: 16, color: "#fff" }}>Añadir <span style={{ color: G }}>{exercise.name}</span></h2>
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
              <div><label style={{ fontSize: 10, color: "#555", letterSpacing: 1, display: "block", marginBottom: 6, textTransform: "uppercase" }}>Series</label><input type="number" value={sets} onChange={e => setSets(e.target.value)} min="1" style={inp} /></div>
              <div><label style={{ fontSize: 10, color: "#555", letterSpacing: 1, display: "block", marginBottom: 6, textTransform: "uppercase" }}>Reps</label><input type="number" value={reps} onChange={e => setReps(e.target.value)} min="1" style={inp} /></div>
            </div>
            <div><label style={{ fontSize: 10, color: "#555", letterSpacing: 1, display: "block", marginBottom: 6, textTransform: "uppercase" }}>Peso (kg) — opcional</label><input type="number" value={weight} onChange={e => setWeight(e.target.value)} placeholder="ej. 60" style={inp} /></div>
          </div>
          <div style={{ display: "flex", gap: 8, marginTop: 18 }}>
            <button onClick={onClose} style={{ flex: 1, padding: 12, background: "transparent", border: `1px solid ${BORDER}`, borderRadius: 10, color: "#555", cursor: "pointer", fontFamily: "inherit", fontSize: 12 }}>Cancelar</button>
            <button onClick={() => onAdd({ ...exercise, sets: parseInt(sets) || 3, reps: parseInt(reps) || 10, weight: weight ? parseFloat(weight) : null })} style={{ flex: 2, padding: 12, background: G, border: "none", borderRadius: 10, color: BG, fontWeight: 800, fontSize: 13, cursor: "pointer", fontFamily: "inherit", letterSpacing: 1 }}>AÑADIR AL LOG</button>
          </div>
        </div>
      </div>
    );
  }
  