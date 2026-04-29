//frontend\src\components\charts\SprintDurationChart.jsx
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
import styles from "../../styles/components/charts/SprintDurationChart.module.css";

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

function DurationTooltip({ active, payload, unit }) {
  if (!active || !payload || !payload.length) return null;

  const point = payload[0]?.payload;
  if (!point) return null;

  return (
    <div className={styles.tooltip}>
      <div className={styles.tooltipLabel}>{point.label}</div>
      <div className={styles.tooltipValue}>
        {formatHours(point.value, unit)}
      </div>
    </div>
  );
}

function ValueLabel({ x, y, width, height, value, unit }) {
  return (
    <text
      x={x + width + 8}
      y={y + height / 2}
      dominantBaseline="central"
      fill="var(--text-secondary)"
      fontSize={11}
      fontWeight={600}
    >
      {formatHours(value, unit)}
    </text>
  );
}

export default function SprintDurationChart({ comparison, color = "blue" }) {
  const primaryColor = COLOR_MAP[color] || COLOR_MAP.blue;
  const secondaryColor = SOFT_COLOR_MAP[color] || SOFT_COLOR_MAP.blue;

  if (!comparison) {
    return (
      <div className={styles.emptyState}>
        <p className={styles.emptyStateText}>Sin detalle de duración</p>
      </div>
    );
  }

  const unit = comparison.unit || "hrs";
  const chartData = [
    { key: "planned", label: "Tiempo planificado", value: comparison.planned },
    { key: "real", label: "Tiempo real", value: comparison.real },
  ];

  const delta = comparison.real - comparison.planned;
  const deltaText = `${delta > 0 ? "+" : ""}${delta.toFixed(1)} ${unit}`.trim();
  const deltaLabel =
    delta <= 0
      ? `Sprint dentro del plan: ${deltaText}`
      : `Sprint por encima del plan: ${deltaText}`;

  return (
    <div className={styles.root}>
      <ResponsiveContainer width="100%" height={220}>
        <BarChart
          data={chartData}
          layout="vertical"
          margin={{ top: 8, right: 90, bottom: 8, left: 24 }}
          barCategoryGap={24}
        >
          <CartesianGrid
            stroke="var(--border-light)"
            strokeDasharray="4 4"
            horizontal={false}
          />
          <XAxis
            type="number"
            tickLine={false}
            axisLine={false}
            tick={{ fill: "var(--text-tertiary)", fontSize: 12 }}
            tickFormatter={(value) => `${value}`}
            tickMargin={10}
          />
          <YAxis
            type="category"
            dataKey="label"
            tickLine={false}
            axisLine={false}
            width={142}
            interval={0}
            tick={{ fill: "var(--text-primary)", fontSize: 12 }}
            tickMargin={8}
          />
          <Tooltip
            content={(props) => <DurationTooltip {...props} unit={unit} />}
            cursor={{ fill: secondaryColor, fillOpacity: 0.2 }}
            wrapperStyle={{ outline: "none" }}
          />
          <Bar dataKey="value" radius={[0, 8, 8, 0]} maxBarSize={26}>
            {chartData.map((entry) => (
              <Cell
                key={entry.key}
                fill={entry.key === "planned" ? secondaryColor : primaryColor}
              />
            ))}
            <LabelList
              dataKey="value"
              position="right"
              content={(props) => <ValueLabel {...props} unit={unit} />}
            />
          </Bar>
        </BarChart>
      </ResponsiveContainer>

      <div className={styles.delta}>{deltaLabel}</div>
    </div>
  );
}
