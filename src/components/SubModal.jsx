import { EXERCISES } from "../data/exercises";
import { eqColors } from "../utils/eqColors";
import { G, BG, CARD, BORDER } from "../utils/theme";
 export function SubModal({ exercise, onClose, onSelect }) {
    return (
      <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.92)", zIndex: 300, display: "flex", alignItems: "center", justifyContent: "center", padding: 16 }}
        onClick={onClose}>
        <div style={{ background: CARD, border: `1px solid ${BORDER}`, borderRadius: 20, padding: 28, maxWidth: 420, width: "100%" }}
          onClick={e => e.stopPropagation()}>
          <h2 style={{ margin: "0 0 6px", fontSize: 16, color: "#fff" }}>Sustitutos para <span style={{ color: G }}>{exercise.name}</span></h2>
          <p style={{ margin: "0 0 18px", fontSize: 12, color: "#555" }}>Sin acceso a: <strong style={{ color: "#888" }}>{exercise.equipment}</strong></p>
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {exercise.substitutes.map(sub => {
              const found = Object.values(EXERCISES).flat().find(e => e.name === sub);
              return (
                <div key={sub} style={{ background: "#071209", border: `1px solid ${BORDER}`, borderRadius: 10, padding: 14, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <div>
                    <div style={{ fontWeight: 700, fontSize: 13, color: "#fff", marginBottom: 4 }}>{sub}</div>
                    {found && <span style={{ fontSize: 10, padding: "2px 6px", borderRadius: 4, background: `${eqColors[found.equipment]}15`, color: eqColors[found.equipment], border: `1px solid ${eqColors[found.equipment]}30`, letterSpacing: 1 }}>{found.equipment}</span>}
                  </div>
                  {found && <button onClick={() => onSelect(found)} style={{ padding: "6px 12px", border: "none", borderRadius: 7, cursor: "pointer", fontFamily: "inherit", fontSize: 11, background: G, color: BG, fontWeight: 700 }}>Usar →</button>}
                </div>
              );
            })}
          </div>
          <button onClick={onClose} style={{ marginTop: 18, width: "100%", padding: 12, background: "transparent", border: `1px solid ${BORDER}`, borderRadius: 10, color: "#555", cursor: "pointer", fontFamily: "inherit", fontSize: 12 }}>Cerrar</button>
        </div>
      </div>
    );
  }
  