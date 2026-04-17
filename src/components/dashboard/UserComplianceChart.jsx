//frontend\src\components\dashboard\UserComplianceChart.jsx
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import styles from "../../styles/components/dashboard/UserComplianceChart.module.css";

const MAX_PERCENT = 100;

function getBarColor(value) {
  if (value >= 80) return "var(--orange)";
  if (value >= 60) return "var(--orange)";
  return "var(--orange-chart-soft, rgba(249, 115, 22, 0.28))";
}

function formatPercent(value) {
  const numericValue = Number(value);
  if (!Number.isFinite(numericValue)) return "0.0%";
  return `${numericValue.toFixed(1)}%`;
}

function shortenLabel(value, maxLength = 24) {
  const text = String(value ?? "").trim();
  if (text.length <= maxLength) return text;
  return `${text.slice(0, maxLength - 1)}…`;
}

// Barra de etiquetas personalizada para mostrar el conteo de tareas completadas/asignadas
function TaskCountLabel({ x, y, width, height, value, entry }) {
  if (!entry) return null;
  const { completed, assigned } = entry;

  const hasCount = completed !== null && assigned !== null;
  const label = hasCount
    ? `${completed}/${assigned} tareas`
    : formatPercent(value);

  return (
    <text
      x={x + width + 8}
      y={y + height / 2}
      dominantBaseline="central"
      fontSize={11}
      fill="var(--text-secondary)"
    >
      {label}
    </text>
  );
}

function ComplianceTooltip({ active, payload, label }) {
  if (!active || !payload || !payload.length) return null;

  const entry = payload[0]?.payload;
  const { completed, assigned } = entry ?? {};
  const hasCount = completed !== null && assigned !== null;

  return (
    <div className={styles.tooltip}>
      <div className={styles.tooltipLabel}>{label}</div>
      {hasCount ? (
        <>
          <div className={styles.tooltipValue}>
            {completed} / {assigned} tareas
          </div>
          <div className={styles.tooltipMeta}>
            {formatPercent(payload[0].value)} completadas
          </div>
        </>
      ) : (
        <div className={styles.tooltipValue}>
          {formatPercent(payload[0].value)}
        </div>
      )}
    </div>
  );
}

export default function UserComplianceChart({ data = [] }) {
  if (!Array.isArray(data) || data.length === 0) {
    return <div className={styles.emptyState}>Sin datos por usuario</div>;
  }

  const longestLabel = data.reduce((max, item) => {
    return Math.max(max, String(item?.label ?? "").trim().length);
  }, 0);

  const rightMargin = 90;
  const yAxisWidth = Math.min(240, Math.max(160, longestLabel * 7));
  const dynamicHeight = Math.max(280, data.length * 72);

  return (
    <div className={styles.root} style={{ height: `${dynamicHeight}px` }}>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={data}
          layout="vertical"
          margin={{ top: 8, right: rightMargin, bottom: 20, left: 20 }}
          barCategoryGap={20}
        >
          <CartesianGrid
            stroke="var(--border-light)"
            strokeDasharray="4 4"
            horizontal={false}
          />
          <XAxis
            type="number"
            domain={[0, MAX_PERCENT]}
            tickLine={false}
            axisLine={false}
            tick={{ fill: "var(--text-tertiary)", fontSize: 12 }}
            tickFormatter={(v) => `${v}%`}
            tickMargin={10}
          />
          <YAxis
            type="category"
            dataKey="label"
            tickLine={false}
            axisLine={false}
            interval={0}
            width={yAxisWidth}
            tick={{ fill: "var(--text-primary)", fontSize: 12 }}
            tickFormatter={(v) => shortenLabel(v)}
            tickMargin={10}
          />
          <Tooltip
            content={(props) => <ComplianceTooltip {...props} />}
            cursor={{ fill: "var(--chart-cursor-orange, rgba(251,146,60,.08))" }}
            wrapperStyle={{ outline: "none" }}
          />
          <Bar
            dataKey="value"
            radius={[0, 6, 6, 0]}
            maxBarSize={28}
            minPointSize={4}
            label={<TaskCountLabel />}
          >
            {data.map((entry) => (
              <Cell
                key={entry.userId ?? entry.label}
                fill={getBarColor(entry.value)}
              />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
