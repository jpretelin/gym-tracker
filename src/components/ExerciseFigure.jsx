import { G, BG, BORDER } from "../utils/theme";

const normalize = (value = "") =>
  value.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();

function getPose(exercise) {
  const text = normalize(`${exercise.name} ${exercise.group || ""} ${exercise.muscles?.join(" ") || ""}`);

  if (text.includes("plancha")) return "plank";
  if (text.includes("ab wheel")) return "abWheel";
  if (text.includes("crunch")) return "crunch";
  if (text.includes("elevacion de piernas")) return "legRaise";
  if (text.includes("talones")) return "calf";
  if (text.includes("curl") && text.includes("piernas")) return "legCurl";
  if (text.includes("extension de piernas")) return "legExtension";
  if (text.includes("prensa")) return "legPress";
  if (text.includes("sentadilla") || text.includes("zancadas")) return "squat";
  if (text.includes("hip thrust") || text.includes("puente")) return "hipThrust";
  if (text.includes("peso muerto") || text.includes("good mornings")) return "hinge";
  if (text.includes("dominadas") || text.includes("jalon")) return "pull";
  if (text.includes("remo")) return "row";
  if (text.includes("face pull") || text.includes("posteriores")) return "rearDelt";
  if (text.includes("elevaciones laterales") || text.includes("cable lateral")) return "lateralRaise";
  if (text.includes("press militar") || text.includes("press arnold")) return "overheadPress";
  if (text.includes("curl")) return "bicepsCurl";
  if (text.includes("triceps") || text.includes("press frances") || text.includes("patada")) return "triceps";
  if (text.includes("fondos")) return "dip";
  if (text.includes("flexiones")) return "pushup";
  if (text.includes("aperturas") || text.includes("crossover")) return "fly";
  if (text.includes("press")) return "benchPress";
  return "standing";
}

const line = {
  stroke: "#d1fae5",
  strokeWidth: 6,
  strokeLinecap: "round",
  strokeLinejoin: "round",
  fill: "none",
};

const accent = {
  stroke: G,
  strokeWidth: 6,
  strokeLinecap: "round",
  strokeLinejoin: "round",
  fill: "none",
};

const weight = {
  stroke: "#86efac",
  strokeWidth: 5,
  strokeLinecap: "round",
  strokeLinejoin: "round",
  fill: "none",
};

function Figure({ pose }) {
  switch (pose) {
    case "benchPress":
      return (
        <>
          <path d="M24 78 H132" {...weight} />
          <path d="M38 88 H122" stroke="#17451e" strokeWidth="8" strokeLinecap="round" />
          <circle cx="70" cy="56" r="9" fill="#d1fae5" />
          <path d="M78 61 L114 74 L142 58" {...line} />
          <path d="M44 58 L76 62 L103 48" {...accent} />
          <path d="M34 42 H146" {...weight} />
          <path d="M32 34 V50 M148 34 V50" {...weight} />
        </>
      );
    case "fly":
      return (
        <>
          <path d="M36 86 H126" stroke="#17451e" strokeWidth="8" strokeLinecap="round" />
          <circle cx="82" cy="56" r="9" fill="#d1fae5" />
          <path d="M90 62 L118 78" {...line} />
          <path d="M74 62 L46 78" {...line} />
          <path d="M84 50 C58 34 38 38 24 50" {...accent} />
          <path d="M84 50 C110 34 132 38 156 50" {...accent} />
          <circle cx="23" cy="50" r="6" fill={G} />
          <circle cx="157" cy="50" r="6" fill={G} />
        </>
      );
    case "pushup":
      return (
        <>
          <path d="M30 84 H152" stroke="#17451e" strokeWidth="8" strokeLinecap="round" />
          <circle cx="57" cy="53" r="8" fill="#d1fae5" />
          <path d="M65 57 L105 70 L145 72" {...line} />
          <path d="M80 62 L63 83 M104 70 L102 88" {...accent} />
        </>
      );
    case "dip":
      return (
        <>
          <path d="M42 30 V90 M138 30 V90" {...weight} />
          <path d="M34 44 H70 M110 44 H146" {...weight} />
          <circle cx="90" cy="38" r="9" fill="#d1fae5" />
          <path d="M90 48 L90 72 L74 86 M90 72 L108 86" {...line} />
          <path d="M84 54 L62 45 M96 54 L118 45" {...accent} />
        </>
      );
    case "row":
      return (
        <>
          <circle cx="58" cy="38" r="9" fill="#d1fae5" />
          <path d="M65 45 L104 62 L144 62" {...line} />
          <path d="M88 55 L66 82 M106 62 L88 88" {...line} />
          <path d="M94 58 L126 42" {...accent} />
          <path d="M118 38 H154" {...weight} />
          <circle cx="158" cy="38" r="7" fill={G} />
        </>
      );
    case "pull":
      return (
        <>
          <path d="M36 24 H144" {...weight} />
          <circle cx="90" cy="48" r="9" fill="#d1fae5" />
          <path d="M90 58 V80 L76 96 M90 80 L106 96" {...line} />
          <path d="M82 48 L62 26 M98 48 L118 26" {...accent} />
        </>
      );
    case "hinge":
      return (
        <>
          <circle cx="64" cy="38" r="9" fill="#d1fae5" />
          <path d="M72 45 L108 64 L138 82" {...line} />
          <path d="M102 61 L78 92 M116 68 L116 96" {...line} />
          <path d="M52 88 H152" {...weight} />
          <path d="M72 54 L50 82" {...accent} />
        </>
      );
    case "squat":
      return (
        <>
          <path d="M54 34 H126" {...weight} />
          <circle cx="90" cy="44" r="9" fill="#d1fae5" />
          <path d="M90 54 L94 74 L70 94" {...line} />
          <path d="M94 74 L120 94" {...line} />
          <path d="M82 58 L56 36 M98 58 L124 36" {...accent} />
        </>
      );
    case "legPress":
      return (
        <>
          <path d="M126 20 L156 90" {...weight} />
          <circle cx="58" cy="64" r="9" fill="#d1fae5" />
          <path d="M66 70 L94 84 L124 82" {...line} />
          <path d="M92 80 L120 48 L142 38" {...accent} />
        </>
      );
    case "legExtension":
      return (
        <>
          <path d="M42 78 H98 V46" stroke="#17451e" strokeWidth="8" strokeLinecap="round" />
          <circle cx="70" cy="40" r="9" fill="#d1fae5" />
          <path d="M76 48 L92 68 L104 78" {...line} />
          <path d="M98 78 L140 62" {...accent} />
          <circle cx="146" cy="60" r="7" fill={G} />
        </>
      );
    case "legCurl":
      return (
        <>
          <path d="M38 72 H124" stroke="#17451e" strokeWidth="8" strokeLinecap="round" />
          <circle cx="52" cy="48" r="9" fill="#d1fae5" />
          <path d="M60 54 L94 70 L124 68" {...line} />
          <path d="M120 68 L134 46" {...accent} />
          <circle cx="138" cy="42" r="7" fill={G} />
        </>
      );
    case "hipThrust":
      return (
        <>
          <path d="M30 82 H70 M118 82 H152" stroke="#17451e" strokeWidth="8" strokeLinecap="round" />
          <circle cx="58" cy="52" r="9" fill="#d1fae5" />
          <path d="M66 58 L96 58 L126 82" {...line} />
          <path d="M86 48 H116" {...weight} />
          <path d="M94 58 L76 84 M104 60 L98 90" {...accent} />
        </>
      );
    case "overheadPress":
      return (
        <>
          <circle cx="90" cy="46" r="9" fill="#d1fae5" />
          <path d="M90 56 V82 L74 100 M90 82 L106 100" {...line} />
          <path d="M76 48 L62 20 M104 48 L118 20" {...accent} />
          <path d="M50 18 H130" {...weight} />
          <circle cx="46" cy="18" r="6" fill={G} />
          <circle cx="134" cy="18" r="6" fill={G} />
        </>
      );
    case "lateralRaise":
      return (
        <>
          <circle cx="90" cy="42" r="9" fill="#d1fae5" />
          <path d="M90 52 V78 L76 98 M90 78 L106 98" {...line} />
          <path d="M82 56 L44 48 M98 56 L136 48" {...accent} />
          <circle cx="38" cy="48" r="6" fill={G} />
          <circle cx="142" cy="48" r="6" fill={G} />
        </>
      );
    case "rearDelt":
      return (
        <>
          <circle cx="66" cy="38" r="9" fill="#d1fae5" />
          <path d="M74 44 L102 68 L128 88" {...line} />
          <path d="M96 62 L76 90 M110 72 L98 96" {...line} />
          <path d="M88 56 L50 62 M92 58 L126 42" {...accent} />
        </>
      );
    case "bicepsCurl":
      return (
        <>
          <circle cx="90" cy="36" r="9" fill="#d1fae5" />
          <path d="M90 46 V76 L76 98 M90 76 L106 98" {...line} />
          <path d="M82 54 L62 72 L62 52" {...accent} />
          <path d="M98 54 L118 72 L118 52" {...accent} />
          <circle cx="62" cy="48" r="6" fill={G} />
          <circle cx="118" cy="48" r="6" fill={G} />
        </>
      );
    case "triceps":
      return (
        <>
          <circle cx="90" cy="38" r="9" fill="#d1fae5" />
          <path d="M90 48 V76 L74 98 M90 76 L106 98" {...line} />
          <path d="M82 50 L60 34 L50 58" {...accent} />
          <path d="M98 50 L120 34 L130 58" {...accent} />
          <circle cx="49" cy="62" r="6" fill={G} />
          <circle cx="131" cy="62" r="6" fill={G} />
        </>
      );
    case "calf":
      return (
        <>
          <circle cx="90" cy="34" r="9" fill="#d1fae5" />
          <path d="M90 44 V72 L74 96 M90 72 L106 96" {...line} />
          <path d="M66 98 H114" {...weight} />
          <path d="M74 96 L74 82 M106 96 L106 82" {...accent} />
        </>
      );
    case "plank":
      return (
        <>
          <path d="M34 88 H150" stroke="#17451e" strokeWidth="8" strokeLinecap="round" />
          <circle cx="46" cy="56" r="8" fill="#d1fae5" />
          <path d="M54 60 L100 70 L144 72" {...line} />
          <path d="M68 64 L54 86 M102 70 L102 88" {...accent} />
        </>
      );
    case "abWheel":
      return (
        <>
          <circle cx="132" cy="84" r="12" fill="none" stroke={G} strokeWidth="6" />
          <circle cx="54" cy="48" r="8" fill="#d1fae5" />
          <path d="M62 54 L96 72 L132 84" {...line} />
          <path d="M78 62 L58 88 M96 72 L86 94" {...accent} />
        </>
      );
    case "crunch":
      return (
        <>
          <path d="M34 88 H144" stroke="#17451e" strokeWidth="8" strokeLinecap="round" />
          <circle cx="74" cy="54" r="9" fill="#d1fae5" />
          <path d="M82 60 C98 68 108 78 122 88" {...line} />
          <path d="M98 80 L78 94 M118 88 L140 76" {...accent} />
        </>
      );
    case "legRaise":
      return (
        <>
          <path d="M28 88 H142" stroke="#17451e" strokeWidth="8" strokeLinecap="round" />
          <circle cx="54" cy="72" r="8" fill="#d1fae5" />
          <path d="M62 76 L96 86" {...line} />
          <path d="M94 84 L118 48 M104 86 L138 54" {...accent} />
        </>
      );
    default:
      return (
        <>
          <circle cx="90" cy="34" r="9" fill="#d1fae5" />
          <path d="M90 44 V74 L74 98 M90 74 L106 98" {...line} />
          <path d="M82 52 L62 72 M98 52 L118 72" {...accent} />
        </>
      );
  }
}

export function ExerciseFigure({ exercise, size = "small" }) {
  const pose = getPose(exercise);
  const height = size === "large" ? 170 : 86;

  return (
    <div
      aria-hidden="true"
      style={{
        width: "100%",
        height,
        borderRadius: 10,
        border: `1px solid ${BORDER}`,
        background: `linear-gradient(135deg, ${BG}, #07170a)`,
        overflow: "hidden",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <svg viewBox="0 0 180 110" width="100%" height="100%" role="img">
        <rect width="180" height="110" fill="transparent" />
        <circle cx="148" cy="24" r="34" fill="rgba(34,197,94,0.08)" />
        <circle cx="32" cy="92" r="28" fill="rgba(96,165,250,0.06)" />
        <Figure pose={pose} />
      </svg>
    </div>
  );
}
