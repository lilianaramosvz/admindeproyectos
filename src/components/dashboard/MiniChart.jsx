//frontend\src\components\dashboard\MiniChart.jsx
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import styles from "../../styles/components/dashboard/MiniChart.module.css";

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

function ChartTooltip({ active, payload, label, unit }) {
  if (!active || !payload || !payload.length) {
    return null;
  }

  const value = payload[0].value;
  const formattedValue = typeof value === "number" ? value.toFixed(2) : value;
  const count = payload[0].payload?.count;
  const countLabel =
    count && count > 1 ? ` (promedio de ${count} valores)` : "";

  return (
    <div className={styles.tooltip}>
      <div className={styles.tooltipLabel}>{label}</div>
      <div className={styles.tooltipValue}>
        {formattedValue}
        {unit ? ` ${unit}` : ""}
      </div>
      {countLabel && <div className={styles.tooltipCount}>{countLabel}</div>}
    </div>
  );
}

function formatAxisTick(value, unit) {
  const numericValue = Number(value);
  if (!Number.isFinite(numericValue)) {
    return "";
  }

  if (unit === "%") {
    return `${numericValue.toFixed(0)}%`;
  }

  if (unit === "días") {
    return `${numericValue.toFixed(1)} d`;
  }

  return numericValue.toFixed(1);
}

export default function MiniChart({
  data = [],
  color = "blue",
  compact = false,
  unit = "",
}) {
  const strokeColor = COLOR_MAP[color] || COLOR_MAP.blue;
  const chartData = data.map((point) => ({
    ...point,
    value: Number(point.value) || 0,
  }));

  if (!chartData.length) {
    return <div className={styles.emptyState}>Sin historial</div>;
  }

  // Calcular dominio dinámico para el eje Y con padding
  const values = chartData
    .map((p) => p.value)
    .filter((v) => typeof v === "number");
  const minValue = Math.min(...values);
  const maxValue = Math.max(...values);
  const padding = (maxValue - minValue) * 0.1 || 10;
  const xTickInterval =
    compact || chartData.length <= 7 ? 0 : Math.ceil(chartData.length / 7);
  const yAxisWidth = compact
    ? 0
    : unit === "%"
      ? 56
      : unit === "días"
        ? 64
        : 52;

  return (
    <div className={`${styles.root} ${compact ? styles.compact : styles.full}`}>
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart
          data={chartData}
          margin={{
            top: compact ? 4 : 8,
            right: compact ? 8 : 12,
            left: compact ? 0 : 40,
            bottom: compact ? 4 : 30,
          }}
        >
          <defs>
            <linearGradient
              id={`gradient-${color}`}
              x1="0"
              y1="0"
              x2="0"
              y2="1"
            >
              <stop offset="5%" stopColor={strokeColor} stopOpacity={0.45} />
              <stop offset="95%" stopColor={strokeColor} stopOpacity={0.05} />
            </linearGradient>
          </defs>
          {!compact ? (
            <CartesianGrid
              stroke="var(--border-light)"
              strokeDasharray="4 4"
              vertical={false}
              opacity={0.6}
            />
          ) : null}
          <XAxis
            dataKey="label"
            hide={compact}
            tickLine={false}
            axisLine={false}
            tick={{ fill: "var(--text-tertiary)", fontSize: 11 }}
            minTickGap={28}
            interval={xTickInterval}
            tickMargin={10}
          />
          <YAxis
            hide={compact}
            domain={[Math.max(0, minValue - padding), maxValue + padding]}
            tickLine={false}
            axisLine={false}
            tick={{ fill: "var(--text-tertiary)", fontSize: 11 }}
            width={yAxisWidth}
            tickMargin={8}
            tickFormatter={(value) => formatAxisTick(value, unit)}
            width={compact ? 0 : 40}
            label={
              !compact && unit
                ? {
                    value: unit,
                    angle: -90,
                    position: "left",
                    offset: 10,
                    fill: "var(--text-tertiary)",
                    fontSize: 11,
                  }
                : undefined
            }
          />
          <Tooltip
            content={(props) => <ChartTooltip {...props} unit={unit} />}
            cursor={{
              stroke: strokeColor,
              strokeOpacity: 0.25,
              fill: strokeColor,
              fillOpacity: 0.08,
            }}
            wrapperStyle={{ outline: "none" }}
          />
          <Area
            type="monotone"
            dataKey="value"
            stroke={strokeColor}
            strokeWidth={compact ? 2.8 : 2.5}
            fill={`url(#gradient-${color})`}
            dot={{ r: compact ? 3 : 3.5, fill: strokeColor, strokeWidth: 0 }}
            activeDot={{
              r: compact ? 4.5 : 5,
              fill: strokeColor,
              strokeWidth: 1,
              stroke: "var(--bg-primary)",
            }}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
