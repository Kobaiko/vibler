'use client'

import React from 'react'
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts'
import { Card, CardHeader, CardContent } from '@/components/ui'

// Common chart colors based on our design system
const chartColors = {
  primary: '#2563eb',
  secondary: '#64748b',
  accent: '#7c3aed',
  success: '#16a34a',
  warning: '#ea580c',
  error: '#dc2626',
}

const multiColors = [
  chartColors.primary,
  chartColors.accent,
  chartColors.success,
  chartColors.warning,
  chartColors.error,
  chartColors.secondary,
]

interface BaseChartProps {
  title?: string
  subtitle?: string
  height?: number
  className?: string
}

// Line Chart Component
interface LineChartProps extends BaseChartProps {
  data: Array<Record<string, unknown>>
  lines: Array<{
    dataKey: string
    name?: string
    color?: string
    strokeWidth?: number
  }>
}

export function CustomLineChart({ 
  data, 
  lines, 
  title, 
  subtitle, 
  height = 300,
  className 
}: LineChartProps) {
  return (
    <Card className={className}>
      {(title || subtitle) && (
        <CardHeader title={title} subtitle={subtitle} />
      )}
      <CardContent>
        <ResponsiveContainer width="100%" height={height}>
          <LineChart data={data} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
            <XAxis 
              dataKey="name" 
              tick={{ fontSize: 12 }}
              tickLine={{ stroke: '#e2e8f0' }}
            />
            <YAxis 
              tick={{ fontSize: 12 }}
              tickLine={{ stroke: '#e2e8f0' }}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: 'white',
                border: '1px solid #e2e8f0',
                borderRadius: '8px',
                boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
              }}
            />
            <Legend />
            {lines.map((line, index) => (
              <Line
                key={line.dataKey}
                type="monotone"
                dataKey={line.dataKey}
                name={line.name || line.dataKey}
                stroke={line.color || multiColors[index % multiColors.length]}
                strokeWidth={line.strokeWidth || 2}
                dot={{ r: 4 }}
                activeDot={{ r: 6 }}
              />
            ))}
          </LineChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  )
}

// Area Chart Component
interface AreaChartProps extends BaseChartProps {
  data: Array<Record<string, unknown>>
  areas: Array<{
    dataKey: string
    name?: string
    color?: string
  }>
}

export function CustomAreaChart({ 
  data, 
  areas, 
  title, 
  subtitle, 
  height = 300,
  className 
}: AreaChartProps) {
  return (
    <Card className={className}>
      {(title || subtitle) && (
        <CardHeader title={title} subtitle={subtitle} />
      )}
      <CardContent>
        <ResponsiveContainer width="100%" height={height}>
          <AreaChart data={data} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
            <XAxis 
              dataKey="name" 
              tick={{ fontSize: 12 }}
              tickLine={{ stroke: '#e2e8f0' }}
            />
            <YAxis 
              tick={{ fontSize: 12 }}
              tickLine={{ stroke: '#e2e8f0' }}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: 'white',
                border: '1px solid #e2e8f0',
                borderRadius: '8px',
                boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
              }}
            />
            <Legend />
            {areas.map((area, index) => (
              <Area
                key={area.dataKey}
                type="monotone"
                dataKey={area.dataKey}
                name={area.name || area.dataKey}
                stackId="1"
                stroke={area.color || multiColors[index % multiColors.length]}
                fill={area.color || multiColors[index % multiColors.length]}
                fillOpacity={0.6}
              />
            ))}
          </AreaChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  )
}

// Bar Chart Component
interface BarChartProps extends BaseChartProps {
  data: Array<Record<string, unknown>>
  bars: Array<{
    dataKey: string
    name?: string
    color?: string
  }>
}

export function CustomBarChart({ 
  data, 
  bars, 
  title, 
  subtitle, 
  height = 300,
  className 
}: BarChartProps) {
  return (
    <Card className={className}>
      {(title || subtitle) && (
        <CardHeader title={title} subtitle={subtitle} />
      )}
      <CardContent>
        <ResponsiveContainer width="100%" height={height}>
          <BarChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
            <XAxis 
              dataKey="name" 
              tick={{ fontSize: 12 }}
              tickLine={{ stroke: '#e2e8f0' }}
            />
            <YAxis 
              tick={{ fontSize: 12 }}
              tickLine={{ stroke: '#e2e8f0' }}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: 'white',
                border: '1px solid #e2e8f0',
                borderRadius: '8px',
                boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
              }}
            />
            <Legend />
            {bars.map((bar, index) => (
              <Bar
                key={bar.dataKey}
                dataKey={bar.dataKey}
                name={bar.name || bar.dataKey}
                fill={bar.color || multiColors[index % multiColors.length]}
                radius={[4, 4, 0, 0]}
              />
            ))}
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  )
}

// Pie Chart Component
interface PieChartProps extends BaseChartProps {
  data: Array<{
    name: string
    value: number
    color?: string
  }>
}

export function CustomPieChart({ 
  data, 
  title, 
  subtitle, 
  height = 300,
  className 
}: PieChartProps) {
  const dataWithColors = data.map((item, index) => ({
    ...item,
    color: item.color || multiColors[index % multiColors.length]
  }))

  return (
    <Card className={className}>
      {(title || subtitle) && (
        <CardHeader title={title} subtitle={subtitle} />
      )}
      <CardContent>
        <ResponsiveContainer width="100%" height={height}>
          <PieChart>
            <Pie
              data={dataWithColors}
              cx="50%"
              cy="50%"
              labelLine={false}
              label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
              outerRadius={80}
              fill="#8884d8"
              dataKey="value"
            >
              {dataWithColors.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Pie>
            <Tooltip
              contentStyle={{
                backgroundColor: 'white',
                border: '1px solid #e2e8f0',
                borderRadius: '8px',
                boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
              }}
            />
            <Legend />
          </PieChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  )
} 