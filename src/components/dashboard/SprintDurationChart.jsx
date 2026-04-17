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
      <div className={styles.tooltipValue}>{formatHours(point.value, unit)}</div>
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

export default function SprintDurationChart({ comparison }) {
  if (!comparison) {
    return <div className={styles.emptyState}>Sin detalle de duración</div>;
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
            cursor={{ fill: "rgba(108, 162, 248, 0.08)" }}
            wrapperStyle={{ outline: "none" }}
          />
          <Bar dataKey="value" radius={[0, 8, 8, 0]} maxBarSize={26}>
            {chartData.map((entry) => (
              <Cell
                key={entry.key}
                fill={entry.key === "planned" ? "var(--blue)" : "var(--darkblue)"}
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
