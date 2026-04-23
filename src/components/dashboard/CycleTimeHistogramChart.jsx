import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  LabelList,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import styles from "../../styles/components/dashboard/SprintDurationChart.module.css";

const COLOR_MAP = {
  blue: "var(--blue)",
  green: "var(--green)",
  purple: "var(--purple)",
  orange: "var(--orange)",
  yellow: "var(--yellow)",
  darkblue: "var(--darkblue)",
  pink: "var(--pink)",
  aqua: "var(--aqua)",
};

const SOFT_COLOR_MAP = {
  blue: "var(--blue-chart-soft)",
  green: "var(--green-chart-soft)",
  purple: "var(--purple-chart-soft)",
  orange: "var(--orange-chart-soft)",
  yellow: "var(--yellow-chart-soft)",
  darkblue: "var(--darkblue-chart-soft)",
  pink: "var(--pink-chart-soft)",
  aqua: "var(--aqua-chart-soft)",
};

function formatHours(value, unit) {
  const numericValue = Number(value);
  if (!Number.isFinite(numericValue)) return `0 ${unit}`.trim();
  return `${numericValue.toFixed(1)} ${unit}`.trim();
}

function CycleTooltip({ active, payload, unit }) {
  if (!active || !payload || !payload.length) return null;

  const point = payload[0]?.payload;
  if (!point) return null;

  return (
    <div className={styles.tooltip}>
      <div className={styles.tooltipLabel}>{point.label}</div>
      <div className={styles.tooltipValue}>{formatHours(point.value, unit)}</div>
    </div>
  );
}

function ValueLabel({ x, y, width, height, value, unit }) {
  return (
    <text
      x={x + width / 2}
      y={y - 8}
      textAnchor="middle"
      fill="var(--text-secondary)"
      fontSize={11}
      fontWeight={600}
    >
      {formatHours(value, unit)}
    </text>
  );
}

export default function CycleTimeHistogramChart({ comparison, color = "green" }) {
  const primaryColor = COLOR_MAP[color] || COLOR_MAP.green;
  const secondaryColor = SOFT_COLOR_MAP[color] || SOFT_COLOR_MAP.green;

  if (!comparison) {
    return <div className={styles.emptyState}>Sin detalle de tiempo de ciclo</div>;
  }

  const unit = comparison.unit || "hrs";
  const chartData = [
    { key: "expected", label: "Tiempo esperado", value: comparison.expected },
    { key: "actual", label: "Tiempo real", value: comparison.actual },
  ];

  const delta = comparison.actual - comparison.expected;
  const deltaText = `${delta > 0 ? "+" : ""}${delta.toFixed(1)} ${unit}`.trim();
  const deltaLabel =
    delta <= 0
      ? `Promedio real dentro del objetivo: ${deltaText}`
      : `Promedio real por encima del objetivo: ${deltaText}`;

  return (
    <div className={styles.root}>
      <ResponsiveContainer width="100%" height={220}>
        <BarChart
          data={chartData}
          margin={{ top: 16, right: 16, bottom: 12, left: 8 }}
          barCategoryGap={36}
        >
          <CartesianGrid
            stroke="var(--border-light)"
            strokeDasharray="4 4"
            vertical={false}
          />
          <XAxis
            type="category"
            dataKey="label"
            tickLine={false}
            axisLine={false}
            tick={{ fill: "var(--text-tertiary)", fontSize: 12 }}
            tickMargin={10}
          />
          <YAxis
            type="number"
            tickLine={false}
            axisLine={false}
            tick={{ fill: "var(--text-primary)", fontSize: 12 }}
            tickMargin={8}
            width={48}
          />
          <Tooltip
            content={(props) => <CycleTooltip {...props} unit={unit} />}
            cursor={{ fill: secondaryColor, fillOpacity: 0.2 }}
            wrapperStyle={{ outline: "none" }}
          />
          <Bar dataKey="value" radius={[8, 8, 0, 0]} maxBarSize={54}>
            {chartData.map((entry) => (
              <Cell
                key={entry.key}
                fill={entry.key === "expected" ? secondaryColor : primaryColor}
              />
            ))}
            <LabelList
              dataKey="value"
              position="top"
              content={(props) => <ValueLabel {...props} unit={unit} />}
            />
          </Bar>
        </BarChart>
      </ResponsiveContainer>

      <div className={styles.delta}>{deltaLabel}</div>
    </div>
  );
}
