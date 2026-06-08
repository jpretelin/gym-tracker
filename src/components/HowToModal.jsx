import { eqColors } from "../utils/eqColors";
import { G, BG, CARD, BORDER } from "../utils/theme";
export function HowToModal({ exercise, onClose, onAdd }) {
   
   
    return (
      <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.92)", zIndex: 300, display: "flex", alignItems: "center", justifyContent: "center", padding: 16 }}
        onClick={onClose}>
        <div style={{ background: CARD, border: `1px solid ${BORDER}`, borderRadius: 20, padding: 28, maxWidth: 460, width: "100%", maxHeight: "90vh", overflowY: "auto" }}
          onClick={e => e.stopPropagation()}>
          <div style={{ marginBottom: 18 }}>
            <h2 style={{ margin: "0 0 6px", fontSize: 18, color: "#fff", fontWeight: 800 }}>{exercise.name}</h2>
            <span style={{ fontSize: 10, padding: "2px 8px", borderRadius: 4, background: `${eqColors[exercise.equipment]}20`, color: eqColors[exercise.equipment], border: `1px solid ${eqColors[exercise.equipment]}40`, letterSpacing: 1, textTransform: "uppercase" }}>
              {exercise.equipment}
            </span>
          </div>
          <p style={{ fontSize: 11, color: G, letterSpacing: 2, textTransform: "uppercase", margin: "0 0 10px" }}>Cómo hacerlo</p>
          <ol style={{ margin: "0 0 18px", paddingLeft: 20, display: "flex", flexDirection: "column", gap: 8 }}>
            {exercise.howto.map((s, i) => <li key={i} style={{ color: "#aaa", fontSize: 13, lineHeight: 1.6 }}>{s}</li>)}
          </ol>
          <div style={{ background: "#071209", border: `1px solid ${BORDER}`, borderRadius: 10, padding: 14, marginBottom: 16 }}>
            <p style={{ margin: "0 0 4px", fontSize: 10, color: G, letterSpacing: 1 }}>💡 TIP PRO</p>
            <p style={{ margin: 0, fontSize: 13, color: "#ccc", lineHeight: 1.6 }}>{exercise.tip}</p>
          </div>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginBottom: 20 }}>
            {exercise.muscles.map(m => <span key={m} style={{ fontSize: 11, padding: "3px 10px", background: "#071209", borderRadius: 6, color: "#6ee7b7", border: `1px solid ${BORDER}` }}>{m}</span>)}
          </div>
          <div style={{ display: "flex", gap: 8 }}>
            <button onClick={onClose} style={{ flex: 1, padding: 12, background: "transparent", border: `1px solid ${BORDER}`, borderRadius: 10, color: "#555", fontSize: 12, cursor: "pointer", fontFamily: "inherit" }}>Cerrar</button>
            <button onClick={onAdd} style={{ flex: 2, padding: 12, background: G, border: "none", borderRadius: 10, color: BG, fontWeight: 800, fontSize: 13, cursor: "pointer", fontFamily: "inherit" }}>+ Añadir al log</button>
          </div>
        </div>
      </div>
    );
  }