import React from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  CartesianGrid,
  ResponsiveContainer,
} from "recharts";

/**
 * AttendanceParticipationChart displays total attendance vs feedback submissions.
 * @param {{ attendance: number, feedback: number }} props
 */
export default function AttendanceParticipationChart({ attendance, feedback }) {
  const data = [
    { name: "Attendance", value: attendance },
    { name: "Feedback", value: feedback },
  ];

  return (
    <ResponsiveContainer width="100%" height={300}>
      <BarChart data={data} margin={{ top: 20, right: 30, left: 0, bottom: 5 }}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="name" />
        <YAxis />
        <Tooltip />
        <Legend />
        <Bar dataKey="value" name="Count" fill="var(--tw-gradient-stops)" />
      </BarChart>
    </ResponsiveContainer>
  );
}
