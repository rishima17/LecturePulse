import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';

const AttentionChart = ({ data }) => {
  const getColor = (name) => {
      if (name === 'High') return '#22c55e'; // Green
      if (name === 'Medium') return '#eab308'; // Yellow
      return '#ef4444'; // Red
  };

  return (
    <div className="h-[200px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart layout="vertical" data={data} margin={{ left: 10, right: 10 }}>
          <XAxis type="number" hide />
          <YAxis 
            dataKey="name" 
            type="category" 
            width={50} 
            tickLine={false} 
            axisLine={false} 
            fontSize={12}
            className="text-muted-foreground"
          />
          <Tooltip 
             cursor={{ fill: 'transparent' }}
             contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
          />
          <Bar dataKey="value" radius={[0, 4, 4, 0]} barSize={24}>
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={getColor(entry.name)} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

export default AttentionChart;
