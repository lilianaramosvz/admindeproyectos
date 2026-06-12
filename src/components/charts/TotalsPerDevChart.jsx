import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  LabelList,
  ResponsiveContainer,
  Cell,
} from "recharts";

const COLORS = ["#6ee7b7", "#c4b5fd", "#93c5fd", "#fdba74"];

export default function TotalsPerDevChart({ data = [], valueKey = "total" }) {
  return (
    <ResponsiveContainer width="100%" height={220}>
      <BarChart data={data} margin={{ top: 24, right: 16, left: 0, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="var(--border-light)" />
        <XAxis
          dataKey="userName"
          tick={{ fontSize: 12, fill: "var(--text-secondary)" }}
          tickFormatter={(name) => name.split(" ")[0]}
          axisLine={false}
          tickLine={false}
        />
        <YAxis
          tick={{ fontSize: 12, fill: "var(--text-secondary)" }}
          axisLine={false}
          tickLine={false}
        />
        <Bar dataKey={valueKey} radius={[6, 6, 0, 0]}>
          <LabelList
            dataKey={valueKey}
            position="top"
            formatter={(value) => `${value}`}
            style={{ fontSize: 12, fontWeight: 600, fill: "#9ca3af" }}
          />
          {data.map((_, index) => (
            <Cell key={index} fill={COLORS[index % COLORS.length]} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}