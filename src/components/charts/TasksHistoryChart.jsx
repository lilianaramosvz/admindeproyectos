import React from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { useSprintHistoryByUser } from "../../hooks/useSprintHistoryByUser";
import styles from "../../styles/components/charts/TasksHistoryChart.module.css";

const USER_COLORS = [
  "color-mix(in srgb, var(--green) 75%, white 25%)",
  "color-mix(in srgb, var(--purple) 75%, white 25%)",
  "color-mix(in srgb, var(--blue) 75%, white 25%)",
  "color-mix(in srgb, var(--orange) 75%, white 25%)",
  "color-mix(in srgb, var(--pink) 75%, white 25%)",
  "color-mix(in srgb, var(--aqua) 75%, white 25%)",
];

const VISIBLE_SPRINTS = ["Sprint 0", "Sprint 1", "Sprint 2"];

function HistoryTooltip({ active, payload, label }) {
  if (!active || !payload || !payload.length) return null;

  return (
    <div className={styles.tooltip}>
      <div className={styles.tooltipLabel}>{label}</div>
      {payload.map((item) => (
        <div key={item.dataKey} className={styles.tooltipValue}>
          <span
            className={styles.tooltipDot}
            style={{ background: item.fill }}
          />
          {item.dataKey}: {Number(item.value ?? 0).toFixed(0)} tareas
        </div>
      ))}
    </div>
  );
}

export default function TasksHistoryChart() {
  const { sprints, users, loading, error } = useSprintHistoryByUser("tasks");

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

  if (!sprints.length || !users.length) {
    return (
      <div className={styles.emptyState}>
        <p className={styles.emptyStateText}>Sin datos disponibles</p>
      </div>
    );
  }

  // ✅ Filtrar solo Sprint 0-2
  const filteredSprints = sprints.filter((s) =>
    VISIBLE_SPRINTS.includes(s.sprintName)
  );

  const totalTasks = filteredSprints.reduce((acc, sprintRow) => {
    return (
      acc +
      users.reduce((userAcc, userName) => {
        const value = Number(sprintRow[userName]);
        return userAcc + (Number.isFinite(value) ? value : 0);
      }, 0)
    );
  }, 0);

  return (
    <div className={styles.root}>
      <div className={styles.totalLabel}>{Math.round(totalTasks)} tareas totales</div>

      <div className={styles.chartWrapper}>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={filteredSprints}
            margin={{ top: 6, right: 12, bottom: 26, left: 8 }}
            barCategoryGap={8}
          >
            <CartesianGrid stroke="var(--border-light)" strokeDasharray="4 4" />
            <XAxis
              type="category"
              dataKey="sprintName"
              tickLine={false}
              axisLine={false}
              tick={{ fill: "var(--text-tertiary)", fontSize: 11 }}
              interval={0}
              height={52}
              tickMargin={6}
            />
            <YAxis
              type="number"
              tickLine={false}
              axisLine={false}
              tick={{ fill: "var(--text-primary)", fontSize: 12 }}
              tickMargin={10}
              width={44}
            />
            <Tooltip
              content={(props) => <HistoryTooltip {...props} />}
              wrapperStyle={{ outline: "none" }}
            />
            {users.map((userName, index) => (
              <Bar
                key={userName}
                dataKey={userName}
                fill={USER_COLORS[index % USER_COLORS.length]}
                maxBarSize={30}
                radius={[6, 6, 0, 0]}
              />
            ))}
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/*  Leyenda con círculo de color + nombre */}
      <div className={styles.legend}>
        {users.map((userName, index) => (
          <div key={userName} className={styles.legendItem}>
            <span
              className={styles.legendDot}
              style={{ background: USER_COLORS[index % USER_COLORS.length] }}
            />
            <span className={styles.legendName}>{userName}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
