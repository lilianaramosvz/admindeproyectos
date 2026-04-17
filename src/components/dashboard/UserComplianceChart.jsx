//frontend\src\components\dashboard\UserComplianceChart.jsx
import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import styles from "../../styles/components/dashboard/UserComplianceChart.module.css";

const MAX_PERCENT = 100;

function formatPercent(value) {
  const numericValue = Number(value);
  if (!Number.isFinite(numericValue)) {
    return "0.0%";
  }

  return `${numericValue.toFixed(1)}%`;
}

function shortenLabel(value, maxLength = 24) {
  const text = String(value ?? "").trim();
  if (text.length <= maxLength) {
    return text;
  }

  return `${text.slice(0, maxLength - 1)}…`;
}

function ComplianceTooltip({ active, payload, label }) {
  if (!active || !payload || !payload.length) {
    return null;
  }

  return (
    <div className={styles.tooltip}>
      <div className={styles.tooltipLabel}>{label}</div>
      <div className={styles.tooltipValue}>
        {formatPercent(payload[0].value)}
      </div>
    </div>
  );
}

export default function UserComplianceChart({ data = [] }) {
  if (!Array.isArray(data) || data.length === 0) {
    return <div className={styles.emptyState}>Sin datos por usuario</div>;
  }

  const longestLabel = data.reduce((max, item) => {
    const length = String(item?.label ?? "").trim().length;
    return Math.max(max, length);
  }, 0);
  const yAxisWidth = Math.min(260, Math.max(170, longestLabel * 7));
  const dynamicHeight = Math.max(280, data.length * 64);

  return (
    <div className={styles.root} style={{ height: `${dynamicHeight}px` }}>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={data}
          layout="vertical"
          margin={{ top: 8, right: 20, bottom: 20, left: 20 }}
          barCategoryGap={18}
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
            tickFormatter={(value) => `${value}%`}
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
            tickFormatter={(value) => shortenLabel(value)}
            tickMargin={10}
          />
          <Tooltip
            content={(props) => <ComplianceTooltip {...props} />}
            cursor={{ fill: "var(--chart-cursor-orange)" }}
            wrapperStyle={{ outline: "none" }}
          />
          <Bar
            dataKey="value"
            fill="var(--orange)"
            radius={[0, 8, 8, 0]}
            maxBarSize={28}
            minPointSize={4}
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
