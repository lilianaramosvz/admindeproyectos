import React from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from 'recharts';
import { useRealHoursByUser } from '../../hooks/useRealHoursByUser';
import styles from '../../styles/components/charts/RealHoursByUser.module.css';

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

function RealHoursTooltip({ active, payload }) {
  if (!active || !payload || !payload.length) return null;

  const point = payload[0]?.payload;
  if (!point) return null;

  const realValue = payload.find((item) => item.dataKey === "realHours");
  const unit = point.unit || "hrs";

  return (
    <div className={styles.tooltip}>
      <div className={styles.tooltipLabel}>{point.label}</div>
      <div className={styles.tooltipValue}>
        Horas reales: {formatHours(realValue?.value, unit)}
      </div>
    </div>
  );
}

const RealHoursByUser = ({ sprintId, color = "green" }) => {
  const { data: apiData, loading, error } = useRealHoursByUser(sprintId);

  const primaryColor = COLOR_MAP[color] || COLOR_MAP.green;

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
    const realHours = Number(entry?.realHours);

    return {
      userId: entry.userId,
      label: String(entry?.label ?? ""),
      realHours: Number.isFinite(realHours) ? realHours : 0,
      unit: "hrs",
    };
  });

  const dynamicHeight = Math.max(280, Math.min(340, chartData.length * 64));

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
              content={(props) => <RealHoursTooltip {...props} />}
              cursor={{ fill: primaryColor, fillOpacity: 0.2 }}
              wrapperStyle={{ outline: "none" }}
            />
            <Bar
              dataKey="realHours"
              name="Horas reales"
              fill={primaryColor}
              radius={[6, 6, 0, 0]}
              maxBarSize={36}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default RealHoursByUser;
