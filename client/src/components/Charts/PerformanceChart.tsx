import React from "react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, ResponsiveContainer, Tooltip } from "recharts";

interface PerformanceChartProps {
  data: any[];
  height?: number;
}

export function PerformanceChart({ data, height = 200 }: PerformanceChartProps) {
  // Generate sample data if none provided
  const chartData = data.length > 0 ? data : [
    { game: "Game 1", performance: 85, expected: 75 },
    { game: "Game 2", performance: 92, expected: 80 },
    { game: "Game 3", performance: 78, expected: 82 },
    { game: "Game 4", performance: 95, expected: 85 },
    { game: "Game 5", performance: 88, expected: 83 },
    { game: "Game 6", performance: 91, expected: 87 },
    { game: "Game 7", performance: 82, expected: 79 },
    { game: "Game 8", performance: 96, expected: 88 },
    { game: "Game 9", performance: 89, expected: 86 },
    { game: "Game 10", performance: 93, expected: 90 },
  ];

  return (
    <div style={{ width: '100%', height }} data-testid="performance-chart">
      <ResponsiveContainer>
        <LineChart data={chartData} margin={{ top: 5, right: 5, left: 5, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
          <XAxis 
            dataKey="game" 
            stroke="#9CA3AF"
            fontSize={12}
            tick={{ fill: '#9CA3AF' }}
          />
          <YAxis 
            stroke="#9CA3AF"
            fontSize={12}
            tick={{ fill: '#9CA3AF' }}
            domain={[60, 100]}
          />
          <Tooltip 
            contentStyle={{
              backgroundColor: '#1F2937',
              border: '1px solid #374151',
              borderRadius: '8px',
              color: '#F9FAFB'
            }}
            labelStyle={{ color: '#9CA3AF' }}
          />
          <Line 
            type="monotone" 
            dataKey="performance" 
            stroke="#3B82F6" 
            strokeWidth={2}
            dot={{ fill: '#3B82F6', strokeWidth: 2, r: 4 }}
            name="Actual Performance"
          />
          <Line 
            type="monotone" 
            dataKey="expected" 
            stroke="#6B7280" 
            strokeWidth={2}
            strokeDasharray="5 5"
            dot={{ fill: '#6B7280', strokeWidth: 2, r: 3 }}
            name="Expected Performance"
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
