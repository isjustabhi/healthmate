'use client';

import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { ChartDataPoint, ChartType } from '@/lib/types';

interface HealthChartProps {
  data: ChartDataPoint[];
  type: ChartType;
  dataKey?: string;
  color?: string;
  title?: string;
  yAxisLabel?: string;
  height?: number;
}

const DEFAULT_COLOR = '#3B82F6';

export default function HealthChart({
  data,
  type,
  dataKey = 'value',
  color = DEFAULT_COLOR,
  title,
  yAxisLabel,
  height = 280,
}: HealthChartProps) {
  const commonProps = {
    data,
    margin: { top: 10, right: 10, left: 0, bottom: 0 },
  };

  const tooltipStyle = {
    backgroundColor: '#fff',
    border: '1px solid #e5e7eb',
    borderRadius: '8px',
    boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
  };

  const renderChart = () => {
    if (type === 'line') {
      return (
        <LineChart {...commonProps}>
          <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
          <XAxis dataKey="name" tick={{ fontSize: 12 }} stroke="#9ca3af" />
          <YAxis tick={{ fontSize: 12 }} stroke="#9ca3af" />
          <Tooltip contentStyle={tooltipStyle} />
          <Legend />
          <Line type="monotone" dataKey={dataKey} stroke={color} strokeWidth={2} dot={{ fill: color, r: 4 }} activeDot={{ r: 6 }} name={yAxisLabel || 'Value'} />
        </LineChart>
      );
    }
    if (type === 'bar') {
      return (
        <BarChart {...commonProps}>
          <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
          <XAxis dataKey="name" tick={{ fontSize: 12 }} stroke="#9ca3af" />
          <YAxis tick={{ fontSize: 12 }} stroke="#9ca3af" />
          <Tooltip contentStyle={tooltipStyle} />
          <Legend />
          <Bar dataKey={dataKey} fill={color} radius={[4, 4, 0, 0]} name={yAxisLabel || 'Value'} />
        </BarChart>
      );
    }
    return (
      <AreaChart {...commonProps}>
        <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
        <XAxis dataKey="name" tick={{ fontSize: 12 }} stroke="#9ca3af" />
        <YAxis tick={{ fontSize: 12 }} stroke="#9ca3af" />
        <Tooltip contentStyle={tooltipStyle} />
        <Legend />
        <Area type="monotone" dataKey={dataKey} stroke={color} fill={color} fillOpacity={0.2} name={yAxisLabel || 'Value'} />
      </AreaChart>
    );
  };

  return (
    <div className="w-full">
      {title && <h3 className="mb-4 text-sm font-semibold text-gray-700">{title}</h3>}
      <ResponsiveContainer width="100%" height={height}>
        {renderChart()}
      </ResponsiveContainer>
    </div>
  );
}
