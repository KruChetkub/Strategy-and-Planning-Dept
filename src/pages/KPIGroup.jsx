import React from 'react';
import { useParams } from 'react-router-dom';
import { useStore } from '../store/useStore';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { useQuery } from '@tanstack/react-query';
import { fetchSDGIndicators, fetchHealthIndicators } from '../api/kpiApi';
import { Loader2 } from 'lucide-react';

export default function KPIGroup() {
  const { groupId } = useParams();
  const { selectedYear } = useStore();

  const { data: kpis, isLoading } = useQuery({ 
    queryKey: ['kpis', groupId], 
    queryFn: async () => {
       if (groupId === 'sdg') return fetchSDGIndicators();
       if (groupId === 'health') return fetchHealthIndicators();
       // Fallback: fetch both and merge or return empty
       const [sdgs, health] = await Promise.all([fetchSDGIndicators(), fetchHealthIndicators()]);
       return [...sdgs, ...health];
    } 
  });

  if (isLoading) return <div className="flex h-64 items-center justify-center"><Loader2 className="animate-spin text-blue-500" size={32}/></div>;

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <div>
        <h1 className="text-2xl font-bold text-slate-800 tracking-tight capitalize">
          {groupId} Indicators
        </h1>
        <p className="text-slate-500 text-sm mt-1">โมดูล Drilldown แบบละเอียดเตรียมพร้อมสำหรับการ Query ของ Supabase</p>
      </div>

      {/* For demonstration, we simply list KPIs under this group. 
          Real implementation would fetch aggregated data via a Postgres View/RPC function */}
      <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
         <h2 className="text-lg font-bold text-slate-800 mb-4">ตัวชี้วัดที่เชื่อมต่อฐานข้อมูลในกลุ่มนี้</h2>
         <ul className="divide-y divide-slate-100">
            {kpis?.map((kpi) => (
               <li key={kpi.id} className="py-4">
                  <div className="flex justify-between">
                     <div>
                        <p className="text-sm font-bold text-emerald-800">[{kpi.category || kpi.kpi_group}] {kpi.indicator_name}</p>
                        <p className="text-xs text-slate-500">{kpi.region || 'ภาพรวม'}</p>
                     </div>
                     <span className="text-xs bg-emerald-50 text-emerald-600 px-2 py-1 rounded-sm font-bold">
                       {kpi.target_2030 || kpi.target_q1 ? `เป้า: ${kpi.target_2030 || kpi.target_q1}` : 'ไม่มีเป้า'}
                     </span>
                  </div>
               </li>
            ))}
         </ul>
      </div>
    </div>
  );
}
