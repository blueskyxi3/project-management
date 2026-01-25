
import React from 'react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  PieChart, Pie, Cell, Legend 
} from 'recharts';

const spendingData = [
  { name: 'Jan', planned: 4000, actual: 2400 },
  { name: 'Feb', planned: 3000, actual: 1398 },
  { name: 'Mar', planned: 2000, actual: 9800 },
  { name: 'Apr', planned: 2780, actual: 3908 },
  { name: 'May', planned: 1890, actual: 4800 },
  { name: 'Jun', planned: 2390, actual: 3800 },
];

const allocationData = [
  { name: 'Labor', value: 45, color: '#137fec' },
  { name: 'Software', value: 25, color: '#10b981' },
  { name: 'Hardware', value: 20, color: '#fbbf24' },
  { name: 'Marketing', value: 10, color: '#a855f7' },
];

export const SpendingChart: React.FC = () => (
  <div className="h-[250px] w-full">
    <ResponsiveContainer width="100%" height="100%">
      <BarChart data={spendingData}>
        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
        <XAxis dataKey="name" fontSize={10} axisLine={false} tickLine={false} />
        <YAxis fontSize={10} axisLine={false} tickLine={false} />
        <Tooltip cursor={{fill: 'transparent'}} />
        <Bar dataKey="planned" fill="#e2e8f0" radius={[4, 4, 0, 0]} />
        <Bar dataKey="actual" fill="#137fec" radius={[4, 4, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  </div>
);

export const AllocationPie: React.FC = () => (
  <div className="h-[250px] w-full relative">
    <ResponsiveContainer width="100%" height="100%">
      <PieChart>
        <Pie
          data={allocationData}
          cx="50%"
          cy="50%"
          innerRadius={60}
          outerRadius={80}
          paddingAngle={5}
          dataKey="value"
        >
          {allocationData.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={entry.color} />
          ))}
        </Pie>
        <Tooltip />
      </PieChart>
    </ResponsiveContainer>
    <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
      <span className="text-[10px] uppercase font-bold text-slate-400">Total</span>
      <span className="text-lg font-bold">100%</span>
    </div>
  </div>
);
