//frontend\src\components\dashboard\AIPanel.jsx
import { useEffect, useState } from "react";
import {
  RefreshCw,
  Sparkles,
  Info,
  AlertTriangle,
  AlertCircle,
  Lightbulb,
  Shield,
} from "lucide-react";
import styles from "../../styles/components/dashboard/AIPanel.module.css";
import { analyzeFromDb } from "../../services/aiService";

const SECTION_META = {
  "ANÁLISIS":        { Icon: Info,          color: "blue",   label: "Análisis"  },
  PROBLEMAS:         { Icon: AlertTriangle, color: "orange", label: "Problemas" },
  "TAREAS CRÍTICAS": { Icon: AlertCircle,   color: "red",    label: "Críticas"  },
  RECOMENDACIONES:   { Icon: Lightbulb,     color: "green",  label: "Ideas"     },
  RIESGOS:           { Icon: Shield,        color: "purple", label: "Riesgos"   },
};

// Regex per header: case-insensitive, handles accent variants, optional colon,
// and captures any inline content after the header (e.g. "ANÁLISIS: texto…")
const HEADER_PATTERNS = [
  { key: "ANÁLISIS",        re: /^an[aá]lisis\s*:?\s*(.*)/i },
  { key: "PROBLEMAS",       re: /^problemas\s*:?\s*(.*)/i },
  // Match either 'TAREAS CRÍTICAS' or just 'CRÍTICAS' / 'CRITICAS'
  { key: "TAREAS CRÍTICAS", re: /^(?:tareas\s+)?cr[ií]ticas\s*:?\s*(.*)/i },
  // Match 'RECOMENDACIONES' or synonym 'IDEAS'
  { key: "RECOMENDACIONES", re: /^(?:recomendaciones|ideas)\s*:?\s*(.*)/i },
  { key: "RIESGOS",         re: /^riesgos\s*:?\s*(.*)/i },
];

function parseSections(items) {
  const out = [];
  let cur = null;
  // Flatten by splitting on embedded newlines first
  const lines = items.flatMap((item) => item.split(/\r?\n/));
  for (const raw of lines) {
    const line = raw.trim();
    if (!line) continue;
    const hdr = HEADER_PATTERNS.find(({ re }) => re.test(line));
    if (hdr) {
      if (cur?.lines.length) out.push(cur);
      const rest = line.match(hdr.re)?.[1]?.trim() ?? "";
      cur = { key: hdr.key, lines: rest ? [rest] : [] };
    } else if (cur) {
      cur.lines.push(line);
    } else {
      // Content before any recognized header → treat as ANÁLISIS
      cur = { key: "ANÁLISIS", lines: [line] };
    }
  }
  if (cur?.lines.length) out.push(cur);
  return out;
}

function parseResponse(res) {
  if (Array.isArray(res?.recomendaciones) && res.recomendaciones.length) {
    return {
      sections: parseSections(res.recomendaciones),
      carga: res.cargaGeneral ?? null,
    };
  }
  const text =
    res?.recommendation ??
    res?.answer ??
    res?.message ??
    res?.respuesta ??
    null;
  return {
    sections: text
      ? [{ key: "ANÁLISIS", lines: text.split("\n").filter(Boolean) }]
      : [],
    carga: null,
  };
}

function Line({ text }) {
  const isBullet = /^[-•]\s/.test(text);
  const isNumbered = /^\d+\.\s/.test(text);
  const clean = text.replace(/^[-•]\s+/, "").replace(/^\d+\.\s+/, "");
  const marker = isNumbered
    ? text.match(/^\d+/)[0] + "."
    : isBullet
      ? "•"
      : null;

  if (!marker) return <p className={styles.lineText}>{clean}</p>;
  return (
    <div className={styles.lineItem}>
      <span className={styles.marker}>{marker}</span>
      <span>{clean}</span>
    </div>
  );
}

export default function AIPanel() {
  const [sections, setSections] = useState([]);
  const [carga, setCarga] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeIdx, setActiveIdx] = useState(0);

  const generate = async () => {
    setLoading(true);
    setError(null);
    setActiveIdx(0);
    try {
      const res = await analyzeFromDb();
      const { sections: parsed, carga: c } = parseResponse(res);
      if (!parsed.length) throw new Error("Respuesta vacía del servidor.");
      setSections(parsed);
      setCarga(c);
    } catch (err) {
      console.warn("AIPanel – analyzeFromDb:", err.message);
      setError("No se pudo obtener la recomendación. Intenta de nuevo.");
      setSections([]);
      setCarga(null);
    } finally {
      setLoading(false);
    }
  };

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => {
    generate();
  }, []);

  const active = sections[activeIdx] ?? null;
  const activeMeta = active
    ? (SECTION_META[active.key] ?? SECTION_META["ANÁLISIS"])
    : null;

  return (
    <aside className={styles.panel} aria-label="Recomendaciones de IA">
      {/* ── Header ── */}
      <div className={styles.header}>
        <div className={styles.headerLeft}>
          <div className={styles.iconWrap} aria-hidden>
            <Sparkles size={18} />
          </div>
          <div>
            <h2 className={styles.title}>Asistente de IA</h2>
            <p className={styles.subtitle}>Recomendaciones del sprint</p>
          </div>
        </div>
        <div className={styles.headerRight}>
          <button
            className={styles.refreshBtn}
            onClick={generate}
            disabled={loading}
            aria-label="Regenerar recomendación"
          >
            {loading ? (
              <span className={styles.dotSpinner} aria-hidden>
                <span />
                <span />
                <span />
              </span>
            ) : (
              <RefreshCw size={14} />
            )}
          </button>
        </div>
      </div>

      {/* ── Tabs ── */}
      {!loading && sections.length > 0 && (
        <div className={styles.tabs} role="tablist">
          {sections.map((s, i) => {
            const m = SECTION_META[s.key] ?? SECTION_META["ANÁLISIS"];
            const isActive = i === activeIdx;
            return (
              <button
                key={s.key}
                role="tab"
                aria-selected={isActive}
                className={`${styles.tab} ${isActive ? styles[`tab_${m.color}`] : ""}`}
                onClick={() => setActiveIdx(i)}
              >
                <m.Icon size={11} />
                {m.label}
              </button>
            );
          })}
        </div>
      )}

      {/* ── Content ── */}
      <div className={styles.content} role="tabpanel">
        {loading && (
          <p className={styles.loadingText}>Generando recomendación...</p>
        )}
        {!loading && error && <p className={styles.errorText}>{error}</p>}
        {!loading && active && (
          <div
            className={`${styles.card} ${styles[`card_${activeMeta.color}`]}`}
          >
            {(() => {
              // If this is the RECOMENDACIONES (Ideas) section, show only one recommendation.
              const isIdeas = active.key === "RECOMENDACIONES";
              const lines = isIdeas
                ? active.lines.filter(Boolean).slice(0, 1)
                : active.lines;
              return lines.map((l, i) => <Line key={i} text={l} />);
            })()}
          </div>
        )}
      </div>
    </aside>
  );
}
