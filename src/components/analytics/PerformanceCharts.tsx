
import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

const responseTimeData = [
  { name: 'Day 1', ms: 410 },
  { name: 'Day 2', ms: 380 },
  { name: 'Day 3', ms: 390 },
  { name: 'Day 4', ms: 350 },
  { name: 'Day 5', ms: 345 },
  { name: 'Day 6', ms: 340 },
  { name: 'Day 7', ms: 330 },
];

const uptimeData = [
    { name: 'Jan', uptime: 99.95 },
    { name: 'Feb', uptime: 99.98 },
    { name: 'Mar', uptime: 99.97 },
    { name: 'Apr', uptime: 99.99 },
    { name: 'May', uptime: 100 },
    { name: 'Jun', uptime: 99.98 },
];

export const PerformanceCharts: React.FC = () => (
  <div className="space-y-6">
    <Card className="bg-black/80 border-blue-500/30">
      <CardHeader>
        <CardTitle className="text-blue-200">Average Response Time (Last 7 Days)</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={responseTimeData}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255, 255, 255, 0.1)" />
            <XAxis dataKey="name" stroke="#60a5fa" />
            <YAxis stroke="#60a5fa" domain={['dataMin - 20', 'dataMax + 20']} unit="ms" />
            <Tooltip contentStyle={{ backgroundColor: '#1e1b4b', border: '1px solid #60a5fa' }} itemStyle={{ color: '#ddd' }} labelStyle={{ color: '#fff' }} />
            <Legend wrapperStyle={{ color: '#ddd' }} />
            <Line type="monotone" dataKey="ms" name="Response Time" stroke="#38bdf8" activeDot={{ r: 8 }} />
          </LineChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
    <Card className="bg-black/80 border-green-500/30">
      <CardHeader>
        <CardTitle className="text-green-200">System Uptime (%)</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={uptimeData}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255, 255, 255, 0.1)" />
            <XAxis dataKey="name" stroke="#4ade80" />
            <YAxis stroke="#4ade80" domain={[99.9, 100]} unit="%" />
            <Tooltip contentStyle={{ backgroundColor: '#1e1b4b', border: '1px solid #4ade80' }} itemStyle={{ color: '#ddd' }} labelStyle={{ color: '#fff' }}/>
            <Legend wrapperStyle={{ color: '#ddd' }} />
            <Line type="monotone" dataKey="uptime" name="Uptime" stroke="#22c55e" />
          </LineChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  </div>
);
