import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from "recharts";

const COLOR_MAP = {
  Inspired: "#f59e0b", // Amber/Orange
  Good: "#10b981",     // Green/Emerald
  Neutral: "#3b82f6",  // Blue/Indigo
  Tired: "#8b5cf6",    // Violet/Purple
  Exhausted: "#f43f5e", // Rose/Red
};

export default function MoodChart({ data }) {
  const getColor = (name) => COLOR_MAP[name] || "#94a3b8";

  return (
    <div className="h-[200px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          layout="vertical"
          data={data}
          margin={{ left: 10, right: 10 }}
          isAnimationActive={true}
        >
          <XAxis type="number" hide />
          <YAxis
            dataKey="name"
            type="category"
            width={75}
            tickLine={false}
            axisLine={false}
            fontSize={12}
            className="text-muted-foreground"
          />
          <Tooltip
            cursor={{ fill: "transparent" }}
            contentStyle={{
              borderRadius: "8px",
              border: "none",
              boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)",
            }}
          />
          <Bar dataKey="value" radius={[0, 4, 4, 0]} barSize={20}>
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={getColor(entry.name)} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
