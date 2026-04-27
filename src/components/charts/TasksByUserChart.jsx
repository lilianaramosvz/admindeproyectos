//frontend\src\components\charts\TasksByUserChart.jsx
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

function formatTasks(value) {
  const numericValue = Number(value);
  if (!Number.isFinite(numericValue)) return "0 tareas";
  return `${numericValue.toFixed(0)} tareas`;
}

function shortenLabel(value, maxLength = 18) {
  const text = String(value ?? "").trim();
  if (text.length <= maxLength) return text;
  return `${text.slice(0, maxLength - 1)}...`;
}

function TasksTooltip({ active, payload }) {
  if (!active || !payload || !payload.length) return null;

  const point = payload[0]?.payload;
  if (!point) return null;

  return (
    <div className={styles.tooltip}>
      <div className={styles.tooltipLabel}>{point.label}</div>
      <div className={styles.tooltipValue}>{formatTasks(point.value)}</div>
    </div>
  );
}

function ValueLabel({ x, y, width, value }) {
  return (
    <text
      x={x + width + 8}
      y={y + 10}
      textAnchor="start"
      fill="var(--text-secondary)"
      fontSize={11}
      fontWeight={600}
    >
      {Number.isFinite(Number(value)) ? Number(value).toFixed(0) : "0"}
    </text>
  );
}

export default function TasksByUserChart({ data = [], color = "green" }) {
  if (!Array.isArray(data) || data.length === 0) {
    return (
      <div className={styles.emptyState}>
        <p className={styles.emptyStateText}>
          Sin detalle de tareas por usuario
        </p>
      </div>
    );
  }

  const chartData = data
    .map((item) => {
      const completed = Number(item?.completed);

      return {
        key: item.userId ?? item.label,
        label: item.label,
        value: Number.isFinite(completed)
          ? Math.max(0, Math.round(completed))
          : 0,
      };
    })
    .sort((left, right) => right.value - left.value);

  if (chartData.length === 0) {
    return (
      <div className={styles.emptyState}>
        <p className={styles.emptyStateText}>
          Sin detalle de tareas por usuario
        </p>
      </div>
    );
  }

  const primaryColor = COLOR_MAP[color] || COLOR_MAP.green;
  const secondaryColor = SOFT_COLOR_MAP[color] || SOFT_COLOR_MAP.green;
  const longestLabel = chartData.reduce((max, item) => {
    return Math.max(max, String(item?.label ?? "").trim().length);
  }, 0);
  const dynamicHeight = Math.max(220, chartData.length * 42);
  const yAxisWidth = Math.min(240, Math.max(150, longestLabel * 7));

  return (
    <div className={styles.root}>
      <ResponsiveContainer width="100%" height={dynamicHeight}>
        <BarChart
          data={chartData}
          layout="vertical"
          margin={{ top: 8, right: 56, bottom: 12, left: 8 }}
          barCategoryGap={12}
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
            tickMargin={10}
            allowDecimals={false}
          />
          <YAxis
            type="category"
            dataKey="label"
            tickLine={false}
            axisLine={false}
            tick={{ fill: "var(--text-primary)", fontSize: 12 }}
            tickFormatter={(value) => shortenLabel(value)}
            tickMargin={8}
            width={yAxisWidth}
            interval={0}
          />
          <Tooltip
            content={(props) => <TasksTooltip {...props} />}
            cursor={{ fill: secondaryColor, fillOpacity: 0.2 }}
            wrapperStyle={{ outline: "none" }}
          />
          <Bar
            dataKey="value"
            radius={[0, 8, 8, 0]}
            maxBarSize={34}
            minPointSize={2}
          >
            {chartData.map((entry) => (
              <Cell key={entry.key} fill={primaryColor} />
            ))}
            <LabelList
              dataKey="value"
              position="right"
              content={(props) => <ValueLabel {...props} />}
            />
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
