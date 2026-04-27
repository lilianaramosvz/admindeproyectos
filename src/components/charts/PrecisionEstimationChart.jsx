//frontend\src\components\charts\PrecisionEstimationChart.jsx
import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import styles from "../../styles/components/dashboard/PrecisionEstimationChart.module.css";

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

function formatHours(value, unit = "hrs") {
  const numericValue = Number(value);
  if (!Number.isFinite(numericValue)) return `0 ${unit}`.trim();
  return `${numericValue.toFixed(1)} ${unit}`.trim();
}

function formatPercent(value) {
  const numericValue = Number(value);
  if (!Number.isFinite(numericValue)) return "Sin dato";
  return `${numericValue.toFixed(1)}%`;
}

function AxisTick({ x, y, payload }) {
  const fullName = String(payload?.value ?? "").trim();
  const firstName = fullName.split(/\s+/)[0] || fullName;

  return (
    <g transform={`translate(${x},${y})`}>
      <text textAnchor="middle" fill="var(--text-tertiary)" fontSize={11}>
        <tspan x={0} dy={0}>
          {firstName}
        </tspan>
      </text>
    </g>
  );
}

function getDeltaInfo(estimatedHours, realHours) {
  const estimated = Number(estimatedHours);
  const real = Number(realHours);

  if (!Number.isFinite(estimated) || !Number.isFinite(real)) {
    return { delta: 0, label: "Sin comparación" };
  }

  const delta = real - estimated;
  if (Math.abs(delta) < 0.01) {
    return { delta, label: "Estimación exacta" };
  }

  return delta > 0
    ? { delta, label: "Subestimó" }
    : { delta, label: "Sobreestimó" };
}

function EstimationTooltip({ active, payload }) {
  if (!active || !payload || !payload.length) return null;

  const point = payload[0]?.payload;
  if (!point) return null;

  const estimatedValue = payload.find(
    (item) => item.dataKey === "estimatedHours",
  );
  const realValue = payload.find((item) => item.dataKey === "realHours");
  const unit = point.unit || "hrs";
  const deltaInfo = getDeltaInfo(point.estimatedHours, point.realHours);

  return (
    <div className={styles.tooltip}>
      <div className={styles.tooltipLabel}>{point.label}</div>
      <div className={styles.tooltipValue}>
        Estimadas: {formatHours(estimatedValue?.value, unit)}
      </div>
      <div className={styles.tooltipValue}>
        Reales: {formatHours(realValue?.value, unit)}
      </div>
      <div className={styles.tooltipMeta}>
        {deltaInfo.label}: {formatHours(Math.abs(deltaInfo.delta), unit)}
      </div>
    </div>
  );
}

export default function PrecisionEstimationChart({
  data = [],
  color = "purple",
}) {
  const primaryColor = COLOR_MAP[color] || COLOR_MAP.purple;
  const secondaryColor = SOFT_COLOR_MAP[color] || SOFT_COLOR_MAP.purple;

  if (!Array.isArray(data) || data.length === 0) {
    return (
      <div className={styles.emptyState}>
        <p className={styles.emptyStateText}>
          Sin detalle de precisión de estimación por usuario
        </p>
      </div>
    );
  }

  const chartData = data
    .map((entry) => {
      const estimatedHours = Number(entry?.estimatedHours);
      const realHours = Number(entry?.realHours);

      if (!Number.isFinite(estimatedHours) || !Number.isFinite(realHours)) {
        return null;
      }

      const deltaInfo = getDeltaInfo(estimatedHours, realHours);
      return {
        userId: entry.userId,
        label: String(entry?.label ?? ""),
        estimatedHours,
        realHours,
        precision: Number.isFinite(Number(entry?.precision))
          ? Number(entry.precision)
          : null,
        delta: deltaInfo.delta,
        deltaLabel: deltaInfo.label,
        unit: "hrs",
      };
    })
    .filter(Boolean);

  if (chartData.length === 0) {
    return (
      <div className={styles.emptyState}>
        <p className={styles.emptyStateText}>
          No hay datos válidos de horas estimadas y reales por usuario.
        </p>
      </div>
    );
  }

  const totalEstimated = chartData.reduce(
    (acc, item) => acc + item.estimatedHours,
    0,
  );
  const totalReal = chartData.reduce((acc, item) => acc + item.realHours, 0);
  const totalDelta = totalReal - totalEstimated;

  const deltaLabel =
    Math.abs(totalDelta) < 0.01
      ? "Sin diferencia global entre horas estimadas y reales"
      : totalDelta > 0
        ? `Globalmente el equipo subestimó en ${formatHours(Math.abs(totalDelta), "hrs")}`
        : `Globalmente el equipo sobreestimó en ${formatHours(Math.abs(totalDelta), "hrs")}`;

  const dynamicHeight = Math.max(230, Math.min(280, chartData.length * 42));

  return (
    <div className={styles.root}>
      <div
        className={styles.chartWrapper}
        style={{ height: `${dynamicHeight}px` }}
      >
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={chartData}
            margin={{ top: 0, right: 12, bottom: 26, left: 12 }}
            barCategoryGap={8}
          >
            <CartesianGrid stroke="var(--border-light)" strokeDasharray="4 4" />
            <XAxis
              type="category"
              dataKey="label"
              tickLine={false}
              axisLine={false}
              tick={<AxisTick />}
              interval={0}
              height={52}
              tickMargin={6}
            />
            <YAxis
              type="number"
              tickLine={false}
              axisLine={false}
              tick={{ fill: "var(--text-primary)", fontSize: 12 }}
              tickFormatter={(value) => `${value}`}
              tickMargin={10}
              width={44}
            />
            <Tooltip
              content={(props) => <EstimationTooltip {...props} />}
              cursor={{ fill: secondaryColor, fillOpacity: 0.2 }}
              wrapperStyle={{ outline: "none" }}
            />
            <Bar
              dataKey="estimatedHours"
              name="Horas estimadas (actualValue)"
              fill={secondaryColor}
              radius={[6, 6, 0, 0]}
              maxBarSize={30}
            />
            <Bar
              dataKey="realHours"
              name="Horas reales (expectedValue)"
              fill={primaryColor}
              radius={[6, 6, 0, 0]}
              maxBarSize={30}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div className={styles.delta}>{deltaLabel}</div>
    </div>
  );
}
