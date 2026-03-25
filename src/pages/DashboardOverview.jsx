import React, { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Loader2, Activity, Target, CheckCircle2, AlertOctagon, TrendingUp, PieChart as PieIcon, XCircle } from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, BarChart, Bar, XAxis, YAxis, CartesianGrid, Legend } from 'recharts';

const getApiUrl = (query = '') => import.meta.env.PROD ? `/api/kpi${query}` : `${import.meta.env.VITE_GOOGLE_SCRIPT_URL}${query}`;

const fetchAllDashboards = async () => {
  const [resSdgs, resHealth] = await Promise.all([
    fetch(getApiUrl('?sheet=SDGs')),
    fetch(getApiUrl('?sheet=Health_KPI'))
  ]);
  
  if (!resSdgs.ok || !resHealth.ok) throw new Error('Failed to fetch data');
  
  return Promise.all([resSdgs.json(), resHealth.json()]);
};

// --- Helpers ---
const evaluateSDGStatus = (current, target) => {
  if (current === '' || current === null || current === undefined) return { color: 'text-slate-400', raw: 'pending' };
  const curVal = parseFloat(current);
  const tStr = String(target).toLowerCase();
  const match = tStr.match(/([\d.]+)/);
  if (!match) return { color: 'text-slate-400', raw: 'pending' };
  const targetVal = parseFloat(match[1]);
  if (isNaN(curVal) || isNaN(targetVal) || targetVal === 0) return { color: 'text-slate-400', raw: 'pending' };
  const isLowerBetter = tStr.includes('<') || tStr.includes('≤') || tStr.includes('ลด');
  let percentage = isLowerBetter ? (curVal === 0 ? 100 : (targetVal / curVal) * 100) : (curVal / targetVal) * 100;
  
  if (percentage >= 100) return { color: 'text-emerald-400', raw: 'passed_100' };
  if (percentage >= 75) return { color: 'text-yellow-400', raw: 'failed_75' };
  if (percentage >= 50) return { color: 'text-orange-400', raw: 'failed_50' };
  return { color: 'text-rose-500', raw: 'failed_0' };
};

const getCurrentQuarter = () => {
  const month = new Date().getMonth() + 1;
  if (month >= 10 && month <= 12) return { targetKey: 'targetQ1' };
  if (month >= 1 && month <= 3) return { targetKey: 'targetQ2' };
  if (month >= 4 && month <= 6) return { targetKey: 'targetQ3' };
  return { targetKey: 'targetQ4' };
};

const evaluateHealthStatus = (current, targetString) => {
  if (!current) return { color: 'text-slate-400', raw: 'pending' };
  const curVal = parseFloat(current);
  const tStr = String(targetString || '').toLowerCase();
  const match = tStr.match(/([\d.]+)/);
  if (!match) return { color: 'text-slate-400', raw: 'pending' };
  const targetVal = parseFloat(match[1]);
  if (isNaN(curVal) || isNaN(targetVal) || targetVal === 0) return { color: 'text-slate-400', raw: 'pending' };
  
  const isLowerBetter = tStr.includes('<') || tStr.includes('≤') || tStr.includes('ลด');
  let percentage = isLowerBetter ? (curVal === 0 ? 100 : (targetVal / curVal) * 100) : (curVal / targetVal) * 100;
  
  if (percentage >= 100) return { color: 'text-emerald-400', raw: 'passed_100' };
  if (percentage >= 75) return { color: 'text-yellow-400', raw: 'failed_75' };
  if (percentage >= 50) return { color: 'text-orange-400', raw: 'failed_50' };
  return { color: 'text-rose-500', raw: 'failed_0' };
};

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white/95 border border-slate-200 p-3 rounded-xl shadow-lg text-sm backdrop-blur-md">
        <p className="font-bold text-slate-800 mb-2">{label}</p>
        <div className="space-y-1">
          {payload.map((entry, index) => (
            <div key={index} className="flex justify-between gap-4">
              <span style={{ color: entry.color }} className="font-medium">{entry.name}:</span>
              <span className="text-slate-800 font-bold">{entry.value}</span>
            </div>
          ))}
        </div>
      </div>
    );
  }
  return null;
};

export default function DashboardOverview() {
  const { data, isLoading, error } = useQuery({
    queryKey: ['overviewData'],
    queryFn: fetchAllDashboards,
    refetchOnWindowFocus: false,
    staleTime: 5 * 60 * 1000
  });

  const { stats, barData } = useMemo(() => {
    if (!data) return { stats: null, barData: [] };
    const [sdgsRaw, healthRaw] = data;

    const allIndicators = [];

    // Process SDGs (Grouped by title to prevent duplicates)
    const sdgsGrouped = new Map();
    sdgsRaw.forEach(row => {
      const title = row.indicatorName ?? row['ชื่อตัวชี้วัด'];
      if (!title || title === 'ไม่ระบุ') return;
      if (!sdgsGrouped.has(title)) sdgsGrouped.set(title, row);
    });

    const sdgsStats = { passed: 0, warning: 0, critical: 0, pending: 0, total: sdgsGrouped.size };
    
    sdgsGrouped.forEach((row, title) => {
      const perf = row.currentPerformance ?? row['ผลการดำเนินงานปัจจุบัน (68)'] ?? row['ผลการดำเนินงานปัจจุบัน'] ?? '';
      const tar = row.target2030 ?? row['เป้าหมาย SDG ปี 2573'] ?? row['เป้าหมายปี 2573'] ?? '';
      const status = evaluateSDGStatus(perf, tar);
      
      allIndicators.push({
         id: `sdg-${title}`,
         system: 'SDGs',
         title: title,
         category: row.category ?? row['หมวดหมู่ตัวชี้วัดหลัก'] ?? 'ไม่ระบุ',
         target: tar,
         performance: perf,
         status: status.raw
      });

      if (status.raw === 'passed_100') sdgsStats.passed++;
      else if (status.raw === 'failed_75') sdgsStats.warning++;
      else if (status.raw === 'failed_50' || status.raw === 'failed_0') sdgsStats.critical++;
      else sdgsStats.pending++;
    });

    // Process Health KPI (Grouped by Main Indicator to ignore regions and sub-indicators)
    const currentQ = getCurrentQuarter();
    const healthGrouped = new Map();
    
    healthRaw.forEach(row => {
      let title = row.indicatorName ?? row['ชื่อตัวชี้วัด'];
      if (!title || title === 'ไม่ระบุ') return;
      if (row.KPI_Type_A) title = `[Health] ${title}`;
      
      if (!healthGrouped.has(title)) {
        healthGrouped.set(title, {
          title,
          category: row.kpi_group ?? row['กลุ่มตัวชี้วัด'] ?? 'ไม่ระบุ',
          rows: []
        });
      }
      healthGrouped.get(title).rows.push(row);
    });

    const healthStats = { passed: 0, warning: 0, critical: 0, pending: 0, total: healthGrouped.size };

    healthGrouped.forEach((group, title) => {
       let finalPerf = '';
       let finalTarget = '';
       let finalStatus = 'pending';
       
       // Try to find the "Overall" report row first
       const overallRow = group.rows.find(r => {
           const reg = r.region ?? r['เขตฯ'] ?? r['เขต'] ?? r['เขตสุขภาพ'] ?? '';
           return reg.includes('รวม') || reg.includes('ประเทศ') || reg === 'ภาพรวม';
       });

       if (overallRow) {
          const targetMap = { 
            targetQ1: overallRow.targetQ1 ?? overallRow['เป้าหมาย Q1'], 
            targetQ2: overallRow.targetQ2 ?? overallRow['เป้าหมาย Q2'], 
            targetQ3: overallRow.targetQ3 ?? overallRow['เป้าหมาย Q3'], 
            targetQ4: overallRow.targetQ4 ?? overallRow['เป้าหมาย Q4'] 
          };
          finalTarget = targetMap[currentQ.targetKey] ?? '';
          finalPerf = overallRow.performance ?? overallRow['ผลงาน'] ?? overallRow['ผลการดำเนินงาน'] ?? '';
          if (finalPerf !== '') finalStatus = evaluateHealthStatus(finalPerf, finalTarget).raw;
       } else {
          // Fallback: take the first row's target
          const firstValid = group.rows.find(r => r.targetQ1 || r['เป้าหมาย Q1']);
          if (firstValid) {
             const targetMap = { 
                targetQ1: firstValid.targetQ1 ?? firstValid['เป้าหมาย Q1'], 
                targetQ2: firstValid.targetQ2 ?? firstValid['เป้าหมาย Q2'], 
                targetQ3: firstValid.targetQ3 ?? firstValid['เป้าหมาย Q3'], 
                targetQ4: firstValid.targetQ4 ?? firstValid['เป้าหมาย Q4'] 
             };
             finalTarget = targetMap[currentQ.targetKey] ?? '';
          }
          
          // Average the performance
          let totalPerf = 0;
          let count = 0;
          group.rows.forEach(r => {
             const p = parseFloat(r.performance ?? r['ผลงาน'] ?? r['ผลการดำเนินงาน'] ?? '');
             if (!isNaN(p)) { totalPerf += p; count++; }
          });
          
          if (count > 0) {
             finalPerf = (totalPerf / count).toFixed(2);
             finalStatus = evaluateHealthStatus(finalPerf, finalTarget).raw;
          }
       }

      allIndicators.push({
         id: `health-${title}`,
         system: 'Health KPI',
         title: title,
         category: group.category,
         target: finalTarget,
         performance: finalPerf,
         status: finalStatus
      });

      if (finalStatus === 'passed_100') healthStats.passed++;
      else if (finalStatus === 'failed_75') healthStats.warning++;
      else if (finalStatus === 'failed_50' || finalStatus === 'failed_0') healthStats.critical++;
      else healthStats.pending++;
    });

    const totalKPIs = sdgsStats.total + healthStats.total;
    const totalPassed = sdgsStats.passed + healthStats.passed;
    const totalWarning = sdgsStats.warning + healthStats.warning;
    const totalCritical = sdgsStats.critical + healthStats.critical;
    
    // Bar Data
    const bData = [
      {
        name: 'ตัวชี้วัด SDGs',
        'บรรลุเป้าหมาย': sdgsStats.passed,
        'เฝ้าระวัง': sdgsStats.warning,
        'วิกฤติลดหลั่น': sdgsStats.critical,
      },
      {
        name: 'Health KPI',
        'บรรลุเป้าหมาย': healthStats.passed,
        'เฝ้าระวัง': healthStats.warning,
        'วิกฤติลดหลั่น': healthStats.critical,
      }
    ];

    return { 
      stats: { totalKPIs, totalPassed, totalWarning, totalCritical, sdgsStats, healthStats, allIndicators },
      barData: bData
    };
  }, [data]);

  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <Loader2 className="animate-spin text-sky-500" size={48} />
        <p className="text-slate-500 font-bold">กำลังรวบรวมข้อมูลองค์รวมกองยุทธศาสตร์และแผนงาน...</p>
      </div>
    );
  }

  if (error || !stats) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-rose-500 gap-4">
        <AlertOctagon size={48} />
        <p className="font-bold text-slate-700 mt-2">เกิดข้อผิดพลาดในการโหลดข้อมูล</p>
      </div>
    );
  }

  const passedPercent = stats.totalKPIs > 0 ? Math.round((stats.totalPassed / stats.totalKPIs) * 100) : 0;

  return (
    <div className="max-w-7xl mx-auto space-y-10 pb-12">
      
      {/* MISSION CONTROL HEADER: Professional & Balanced */}
      <div className="relative overflow-hidden bg-white border border-slate-200 rounded-[2.5rem] p-10 shadow-xl">
        <div className="absolute top-0 right-0 w-80 h-80 bg-sky-100/30 rounded-full blur-[100px] -mr-20 -mt-20" />
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-emerald-100/20 rounded-full blur-[80px] -ml-20 -mb-20" />
        
        <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-10">
          
          {/* Left: Branding & Summary */}
          <div className="flex-1 flex flex-col md:flex-row items-center gap-8">
             <div className="p-6 bg-gradient-to-br from-sky-500 to-blue-600 rounded-3xl shadow-xl ring-8 ring-sky-50 transition-transform hover:scale-105 duration-500">
                <Target className="text-white" size={40} />
             </div>
             <div className="text-center md:text-left">
                <h1 className="text-5xl font-black text-slate-800 tracking-tight leading-none mb-3">ตัวชี้วัดสำคัญ</h1>
                <p className="text-sky-600 font-black uppercase tracking-[0.25em] text-xs">กองยุทธศาสตร์และแผนงาน</p>
                <div className="mt-4 flex flex-wrap justify-center md:justify-start gap-4">
                   <div className="px-4 py-2 bg-slate-50 border border-slate-100 rounded-xl text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                      Year: <span className="text-slate-800">2026</span>
                   </div>
                   <div className="px-4 py-2 bg-sky-50 border border-sky-100 rounded-xl text-[10px] font-bold text-sky-600 uppercase tracking-widest">
                      Total Monitors: <span className="text-sky-800">{stats.totalKPIs}</span>
                   </div>
                </div>
             </div>
          </div>

          {/* Right: Master Gauge (Integrated) */}
          <div className="bg-slate-50/70 backdrop-blur-md border border-slate-200 p-8 rounded-[3rem] shadow-inner flex items-center gap-8 group">
             <div className="relative w-32 h-32 flex-shrink-0">
                <svg className="w-full h-full -rotate-90 transform" viewBox="0 0 100 100">
                   <circle cx="50" cy="50" r="45" fill="transparent" stroke="#e2e8f0" strokeWidth="10"/>
                   <circle 
                     cx="50" cy="50" r="45" 
                     fill="transparent" 
                     stroke="url(#globalGradient)" 
                     strokeWidth="10"
                     strokeDasharray={`${(stats.totalPassed/stats.totalKPIs) * 282.7} 282.7`}
                     strokeLinecap="round"
                     className="transition-all duration-1000 ease-out"
                   />
                   <defs>
                     <linearGradient id="globalGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                       <stop offset="0%" stopColor="#10b981" />
                       <stop offset="100%" stopColor="#0ea5e9" />
                     </linearGradient>
                   </defs>
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="text-3xl font-black text-slate-800">{passedPercent}%</span>
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-tighter">SUCCESS</p>
                </div>
             </div>
             <div className="pr-4">
                <p className="text-sm font-black text-sky-600 uppercase tracking-widest mb-1">System Health</p>
                <div className="h-1.5 w-24 bg-slate-200 rounded-full overflow-hidden mb-2">
                   <div className="h-full bg-emerald-500 rounded-full" style={{width: `${passedPercent}%`}}></div>
                </div>
                <p className="text-xs text-slate-400 font-bold italic">
                   ผ่านเป้าหมาย {stats.totalPassed} จาก {stats.totalKPIs}
                </p>
             </div>
          </div>
        </div>
      </div>

      {/* GLOBAL STATUS DISTRIBUTION: 4 Symmetrical Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 px-2">
        
        {/* Success Card */}
        <div className="bg-white border border-emerald-100 rounded-[2rem] p-6 shadow-sm hover:shadow-xl transition-all group relative overflow-hidden">
          <div className="absolute -right-4 -bottom-4 opacity-5 group-hover:scale-110 group-hover:rotate-12 transition-transform duration-500">
             <CheckCircle2 className="text-emerald-500" size={100} />
          </div>
          <div className="w-12 h-12 bg-emerald-50 rounded-2xl flex items-center justify-center border border-emerald-100 mb-4 shadow-inner">
             <CheckCircle2 className="text-emerald-500" size={24} />
          </div>
          <p className="text-4xl font-black text-slate-800 tracking-tighter">{stats.totalPassed}</p>
          <p className="text-sm font-black text-emerald-600 uppercase tracking-widest mt-1">บรรลุเป้าหมาย</p>
          <p className="text-xs text-slate-400 font-medium mt-1 uppercase tracking-wider">Status: Normal (100%)</p>
        </div>

        {/* Warning Card */}
        <div className="bg-white border border-yellow-100 rounded-[2rem] p-6 shadow-sm hover:shadow-xl transition-all group relative overflow-hidden">
          <div className="absolute -right-4 -bottom-4 opacity-5 group-hover:scale-110 group-hover:rotate-12 transition-transform duration-500">
             <Activity className="text-yellow-500" size={100} />
          </div>
          <div className="w-12 h-12 bg-yellow-50 rounded-2xl flex items-center justify-center border border-yellow-100 mb-4 shadow-inner">
             <Activity className="text-yellow-500" size={24} />
          </div>
          <p className="text-4xl font-black text-slate-800 tracking-tighter">{stats.totalWarning}</p>
          <p className="text-sm font-black text-yellow-600 uppercase tracking-widest mt-1">เฝ้าระวัง / ต่ำกว่าเป้า</p>
          <p className="text-xs text-slate-400 font-medium mt-1 uppercase tracking-wider">Status: Warning (75-99%)</p>
        </div>

        {/* Risk Card */}
        <div className="bg-white border border-orange-100 rounded-[2rem] p-6 shadow-sm hover:shadow-xl transition-all group relative overflow-hidden">
          <div className="absolute -right-4 -bottom-4 opacity-5 group-hover:scale-110 group-hover:rotate-12 transition-transform duration-500 text-orange-500">
             <AlertOctagon size={100} />
          </div>
          <div className="w-12 h-12 bg-orange-50 rounded-2xl flex items-center justify-center border border-orange-100 mb-4 shadow-inner text-orange-500">
             <AlertOctagon size={24} />
          </div>
          <p className="text-4xl font-black text-slate-800 tracking-tighter">
            {stats.allIndicators.filter(k => k.status === 'failed_50').length}
          </p>
          <p className="text-sm font-black text-orange-600 uppercase tracking-widest mt-1">ระดับเสี่ยง</p>
          <p className="text-xs text-slate-400 font-medium mt-1 uppercase tracking-wider">Status: At Risk (50-74%)</p>
        </div>

        {/* Critical Card */}
        <div className="bg-white border border-rose-100 rounded-[2rem] p-6 shadow-sm hover:shadow-xl transition-all group relative overflow-hidden">
          <div className="absolute -right-4 -bottom-4 opacity-5 group-hover:scale-110 group-hover:rotate-12 transition-transform duration-500 text-rose-500">
             <XCircle size={100} />
          </div>
          <div className="w-12 h-12 bg-rose-50 rounded-2xl flex items-center justify-center border border-rose-100 mb-4 shadow-inner text-rose-500">
             <XCircle size={24} />
          </div>
          <p className="text-4xl font-black text-slate-800 tracking-tighter">
            {stats.allIndicators.filter(k => k.status === 'failed_0').length}
          </p>
          <p className="text-sm font-black text-rose-600 uppercase tracking-widest mt-1">ขั้นวิกฤติ</p>
          <p className="text-xs text-slate-400 font-medium mt-1 uppercase tracking-wider">Status: Critical ({"<"}50%)</p>
        </div>

      </div>

      {/* SYSTEM COMPARISON TILES */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* SDGs Tile */}
        <div className="bg-white border border-slate-200 rounded-[2.5rem] p-10 shadow-sm relative overflow-hidden group hover:border-sky-300 transition-all flex flex-col md:flex-row items-center gap-10">
          <div className="relative w-32 h-32 flex-shrink-0">
             <svg className="w-full h-full -rotate-90 transform" viewBox="0 0 100 100">
                <circle cx="50" cy="50" r="45" fill="transparent" stroke="#f1f5f9" strokeWidth="10"/>
                <circle 
                  cx="50" cy="50" r="45" 
                  fill="transparent" 
                  stroke="#0ea5e9" 
                  strokeWidth="10"
                  strokeDasharray={`${(stats.sdgsStats.passed/stats.sdgsStats.total) * 282.7} 282.7`}
                  strokeLinecap="round"
                />
             </svg>
             <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-2xl font-black text-slate-800">{Math.round((stats.sdgsStats.passed/stats.sdgsStats.total)*100)}%</span>
             </div>
          </div>
          <div className="flex-1 text-center md:text-left">
             <div className="flex items-center justify-center md:justify-start gap-2 mb-2">
                <PieIcon className="text-sky-500" size={20} />
                <h3 className="text-2xl font-black text-slate-800 tracking-tight">เป้าหมายสากล SDGs</h3>
             </div>
             <p className="text-slate-500 font-medium mb-6">ความคืบหน้าของโครงการย่อยภายใต้วาระการพัฒนาที่ยั่งยืน</p>
             <div className="flex justify-center md:justify-start gap-8 border-t border-slate-100 pt-6">
                <div>
                   <p className="text-3xl font-black text-slate-800">{stats.sdgsStats.total}</p>
                   <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-1">Total KPIs</p>
                </div>
                <div>
                   <p className="text-3xl font-black text-emerald-500">{stats.sdgsStats.passed}</p>
                   <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-1">Success</p>
                 </div>
                 <button 
                  onClick={() => navigate('/sdgs')}
                  className="bg-sky-50 text-sky-600 font-bold text-xs px-4 py-2 rounded-xl border border-sky-100 hover:bg-sky-500 hover:text-white transition-all ml-auto self-end"
                >
                  View More
                </button>
             </div>
          </div>
        </div>

        {/* Health KPI Tile */}
        <div className="bg-white border border-slate-200 rounded-[2.5rem] p-10 shadow-sm relative overflow-hidden group hover:border-emerald-300 transition-all flex flex-col md:flex-row items-center gap-10">
          <div className="relative w-32 h-32 flex-shrink-0">
             <svg className="w-full h-full -rotate-90 transform" viewBox="0 0 100 100">
                <circle cx="50" cy="50" r="45" fill="transparent" stroke="#f1f5f9" strokeWidth="10"/>
                <circle 
                  cx="50" cy="50" r="45" 
                  fill="transparent" 
                  stroke="#10b981" 
                  strokeWidth="10"
                  strokeDasharray={`${(stats.healthStats.passed/stats.healthStats.total) * 282.7} 282.7`}
                  strokeLinecap="round"
                />
             </svg>
             <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-2xl font-black text-slate-800">{Math.round((stats.healthStats.passed/stats.healthStats.total)*100)}%</span>
             </div>
          </div>
          <div className="flex-1 text-center md:text-left">
             <div className="flex items-center justify-center md:justify-start gap-2 mb-2">
                <Activity className="text-emerald-500" size={20} />
                <h3 className="text-2xl font-black text-slate-800 tracking-tight">เป้าหมายสาธารณสุข</h3>
             </div>
             <p className="text-slate-500 font-medium mb-6">ความคืบหน้าของตัวชี้วัดสำคัญระดับกระทรวง (Health KPI)</p>
             <div className="flex justify-center md:justify-start gap-8 border-t border-slate-100 pt-6">
                <div>
                   <p className="text-3xl font-black text-slate-800">{stats.healthStats.total}</p>
                   <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-1">Total KPIs</p>
                </div>
                <div>
                   <p className="text-3xl font-black text-emerald-500">{stats.healthStats.passed}</p>
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-1">Success</p>
                 </div>
                 <button 
                  onClick={() => navigate('/healthkpi')}
                  className="bg-emerald-50 text-emerald-600 font-bold text-xs px-4 py-2 rounded-xl border border-emerald-100 hover:bg-emerald-500 hover:text-white transition-all ml-auto self-end"
                >
                  View More
                </button>
             </div>
          </div>
        </div>

      </div>

      {/* MASTER KPI TABLE: Professional Design */}
      <div className="bg-white rounded-[3rem] shadow-xl border border-slate-200 overflow-hidden relative">
        <div className="p-8 border-b border-slate-100 bg-slate-50/50 backdrop-blur-md sticky top-0 z-30 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
           <div>
              <h3 className="text-2xl font-black text-slate-800 flex items-center gap-3">
                <TrendingUp size={24} className="text-sky-500"/> Executive Master Table
              </h3>
              <p className="text-slate-400 font-bold uppercase tracking-widest text-xs mt-1">Total Consolidated Database ({stats.totalKPIs} Measures)</p>
           </div>
           <div className="flex items-center gap-3">
              <span className="text-sm font-bold text-slate-400 uppercase">Search KPI:</span>
              <input 
                type="text"
                placeholder="ค้นหาชื่อตัวชี้วัด..."
                className="h-12 w-72 bg-white border border-slate-200 rounded-2xl px-4 py-2 text-base font-bold text-slate-700 outline-none focus:ring-4 focus:ring-sky-500/10 focus:border-sky-500 transition-all shadow-inner shadow-slate-50 placeholder:text-slate-300"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
           </div>
        </div>

        <div className="overflow-x-auto max-h-[800px]">
          <table className="w-full text-left border-collapse border-spacing-0">
            <thead>
              <tr className="bg-white border-b border-slate-100">
                <th className="py-5 px-8 text-slate-400 font-black text-xs uppercase tracking-[0.2em]">System</th>
                <th className="py-5 px-8 text-slate-400 font-black text-xs uppercase tracking-[0.2em] w-1/3">Indicator Name</th>
                <th className="py-5 px-8 text-slate-400 font-black text-xs uppercase tracking-[0.2em] text-right">Target</th>
                <th className="py-5 px-8 text-slate-400 font-black text-xs uppercase tracking-[0.2em] text-right">Perform.</th>
                <th className="py-5 px-8 text-slate-400 font-black text-xs uppercase tracking-[0.2em] text-center">Executive Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50 bg-white">
              {stats.allIndicators
                .filter(kpi => kpi.title.toLowerCase().includes(searchTerm.toLowerCase()))
                .map((kpi, index) => {
                
                let statusBg, statusText, statusLabel, statusDot, StatusIcon;
                
                if (kpi.status === 'passed_100') { 
                  statusBg = 'bg-emerald-50/50'; statusText = 'text-emerald-700'; statusLabel = 'Passed'; statusDot = 'bg-emerald-500'; StatusIcon = CheckCircle2;
                } else if (kpi.status === 'failed_75') { 
                  statusBg = 'bg-amber-50/50'; statusText = 'text-amber-700'; statusLabel = 'Warning'; statusDot = 'bg-amber-500'; StatusIcon = Activity;
                } else if (kpi.status === 'failed_50') { 
                  statusBg = 'bg-orange-50/50'; statusText = 'text-orange-700'; statusLabel = 'At Risk'; statusDot = 'bg-orange-500'; StatusIcon = AlertOctagon;
                } else if (kpi.status === 'failed_0') { 
                  statusBg = 'bg-rose-50/50'; statusText = 'text-rose-700'; statusLabel = 'Critical'; statusDot = 'bg-rose-500'; StatusIcon = XCircle;
                } else {
                  statusBg = 'bg-slate-50/50'; statusText = 'text-slate-400'; statusLabel = 'Pending'; statusDot = 'bg-slate-300'; StatusIcon = Loader2;
                }

                return (
                <tr key={index} className="hover:bg-slate-50/50 transition-all group">
                  <td className="py-6 px-8 align-middle">
                    <span className={`text-[10px] sm:text-xs font-black px-4 py-2 rounded-xl uppercase tracking-widest ${kpi.system === 'SDGs' ? 'bg-sky-100/50 text-sky-700' : 'bg-emerald-100/50 text-emerald-700'} border border-transparent group-hover:border-current transition-colors`}>
                      {kpi.system}
                    </span>
                  </td>
                  
                  <td className="py-6 px-8 align-middle">
                    <p className="text-base font-black text-slate-700 group-hover:text-slate-900 transition-colors cursor-default leading-tight" title={kpi.title}>{kpi.title}</p>
                    <p className="text-xs text-slate-400 font-bold uppercase tracking-wider mt-1.5 flex items-center gap-2 italic">
                       {kpi.category}
                    </p>
                  </td>

                  <td className="py-6 px-8 align-middle text-right border-none">
                    <span className="font-bold text-slate-500 text-sm">{kpi.target || 'N/A'}</span>
                  </td>

                  <td className="py-6 px-8 align-middle text-right border-none">
                    <span className={`font-black text-2xl tabular-nums tracking-tighter ${kpi.performance ? 'text-slate-800' : 'text-slate-300'}`}>
                      {kpi.performance || '--'}
                    </span>
                  </td>

                  <td className="py-6 px-8 align-middle border-none">
                    <div className={`flex items-center justify-center gap-3 px-5 py-3 rounded-2xl ${statusBg} border border-white group-hover:shadow-sm transition-all`}>
                      <StatusIcon size={20} className={statusText} />
                      <span className={`text-xs font-black uppercase tracking-[0.15em] ${statusText}`}>{statusLabel}</span>
                    </div>
                  </td>
                </tr>
              )})}
            </tbody>
          </table>
        </div>
        
        {/* Table Footer / Info */}
        <div className="p-6 bg-slate-50 border-t border-slate-100 text-center">
           <p className="text-xs font-black text-slate-400 uppercase tracking-[0.3em]">© 2026 Strategy and Planning Department Dashboard System</p>
        </div>
      </div>
    </div>
  );
}
