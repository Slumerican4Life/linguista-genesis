
import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

const wordsData = [
  { name: 'Jan', words: 4000 },
  { name: 'Feb', words: 3000 },
  { name: 'Mar', words: 5000 },
  { name: 'Apr', words: 4500 },
  { name: 'May', words: 6000 },
  { name: 'Jun', words: 5200 },
];

const languageData = [
  { name: 'Spanish', value: 400 },
  { name: 'French', value: 300 },
  { name: 'German', value: 300 },
  { name: 'Japanese', value: 200 },
];
const COLORS = ['#8884d8', '#82ca9d', '#ffc658', '#ff8042'];

export const AnalyticsCharts: React.FC = () => (
  <div className="space-y-6">
    <Card className="bg-black/80 border-purple-500/30">
      <CardHeader>
        <CardTitle className="text-purple-200">Words Translated Per Month</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={wordsData}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255, 255, 255, 0.1)" />
            <XAxis dataKey="name" stroke="#a78bfa" />
            <YAxis stroke="#a78bfa" />
            <Tooltip contentStyle={{ backgroundColor: '#1e1b4b', border: '1px solid #a78bfa' }} itemStyle={{ color: '#ddd' }} labelStyle={{ color: '#fff' }}/>
            <Legend wrapperStyle={{ color: '#ddd' }} />
            <Bar dataKey="words" fill="#8b5cf6" />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
    <Card className="bg-black/80 border-blue-500/30">
      <CardHeader>
        <CardTitle className="text-blue-200">Language Distribution</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <PieChart>
            <Pie
              data={languageData}
              cx="50%"
              cy="50%"
              labelLine={false}
              outerRadius={100}
              fill="#8884d8"
              dataKey="value"
              label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
              stroke="#000"
            >
              {languageData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip contentStyle={{ backgroundColor: '#1e1b4b', border: '1px solid #60a5fa' }} itemStyle={{ color: '#ddd' }} labelStyle={{ color: '#fff' }}/>
          </PieChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  </div>
);
