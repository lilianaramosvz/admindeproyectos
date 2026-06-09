//frontend\src\components\charts\SprintDurationChart.jsx
import React from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";
import { useSprintDurationByUser } from "../../hooks/useSprintDurationByUser";
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

function formatHours(value, unit = "hrs") {
  const numericValue = Number(value);
  if (!Number.isFinite(numericValue)) return `0 ${unit}`.trim();
  return `${numericValue.toFixed(1)} ${unit}`.trim();
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

function getDeltaInfo(plannedHours, realHours) {
  const planned = Number(plannedHours);
  const real = Number(realHours);

  if (!Number.isFinite(planned) || !Number.isFinite(real)) {
    return { delta: 0, label: "Sin comparación" };
  }

  const delta = real - planned;
  if (Math.abs(delta) < 0.01) {
    return { delta, label: "Duración exacta" };
  }

  return delta > 0
    ? { delta, label: "Se tardó más" }
    : { delta, label: "Se tardó menos" };
}

function DurationTooltip({ active, payload }) {
  if (!active || !payload || !payload.length) return null;

  const point = payload[0]?.payload;
  if (!point) return null;

  const plannedValue = payload.find((item) => item.dataKey === "plannedHours");
  const realValue = payload.find((item) => item.dataKey === "realHours");
  const unit = point.unit || "hrs";
  const deltaInfo = getDeltaInfo(point.plannedHours, point.realHours);

  return (
    <div className={styles.tooltip}>
      <div className={styles.tooltipLabel}>{point.label}</div>
      <div className={styles.tooltipValue}>
        Planificadas: {formatHours(plannedValue?.value, unit)}
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

const SprintDurationChart = ({ sprintId, color = "blue" }) => {
  const {
    data: apiData,
    loading,
    error,
  } = useSprintDurationByUser(
    sprintId !== null && sprintId !== undefined ? sprintId : null,
  );

  const primaryColor = COLOR_MAP[color] || COLOR_MAP.blue;
  const secondaryColor = SOFT_COLOR_MAP[color] || SOFT_COLOR_MAP.blue;

  if (loading) {
    return (
      <div className={styles.emptyState}>
        <p className={styles.emptyStateText}>Cargando...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className={styles.emptyState}>
        <p className={styles.emptyStateText}>{error}</p>
      </div>
    );
  }

  if (!apiData || apiData.length === 0) {
    return (
      <div className={styles.emptyState}>
        <p className={styles.emptyStateText}>Sin datos disponibles</p>
      </div>
    );
  }

  const chartData = apiData.map((entry) => {
    const plannedHours = Number(entry?.plannedHours);
    const realHours = Number(entry?.realHours);

    const deltaInfo = getDeltaInfo(plannedHours, realHours);
    return {
      userId: entry.userId,
      label: String(entry?.label ?? ""),
      plannedHours: Number.isFinite(plannedHours) ? plannedHours : 0,
      realHours: Number.isFinite(realHours) ? realHours : 0,
      delta: deltaInfo.delta,
      deltaLabel: deltaInfo.label,
      unit: "hrs",
    };
  });

  const totalPlanned = chartData.reduce(
    (acc, item) => acc + item.plannedHours,
    0,
  );
  const totalReal = chartData.reduce((acc, item) => acc + item.realHours, 0);
  const totalDelta = totalReal - totalPlanned;

  const deltaLabel =
    Math.abs(totalDelta) < 0.01
      ? "Sin diferencia global entre horas planificadas y reales"
      : totalDelta > 0
        ? `Globalmente el equipo tardó más: ${formatHours(Math.abs(totalDelta), "hrs")}`
        : `Globalmente el equipo tardó menos: ${formatHours(Math.abs(totalDelta), "hrs")}`;

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
              content={(props) => <DurationTooltip {...props} />}
              cursor={{ fill: secondaryColor, fillOpacity: 0.2 }}
              wrapperStyle={{ outline: "none" }}
            />
            <Bar
              dataKey="plannedHours"
              name="Horas planificadas"
              fill={secondaryColor}
              radius={[6, 6, 0, 0]}
              maxBarSize={30}
            />
            <Bar
              dataKey="realHours"
              name="Horas reales"
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
};

export default SprintDurationChart;
