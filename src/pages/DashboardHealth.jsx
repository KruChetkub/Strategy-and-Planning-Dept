import React, { useMemo, useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Loader2, Activity, Target, CheckCircle2, XCircle, AlertTriangle, Users, Calendar, Filter, Download, FileText, MapPin, PieChart } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, ReferenceLine, Cell, PieChart as RePieChart, Pie } from 'recharts';
import ThailandMap from '../components/charts/ThailandMap';

const getApiUrl = (query = '') => import.meta.env.PROD ? `/api/kpi${query}` : `${import.meta.env.VITE_GOOGLE_SCRIPT_URL}${query}`;

const fetchHealthData = async () => {
  const res = await fetch(getApiUrl('?sheet=Health_KPI'));
  if (!res.ok) throw new Error('Failed to fetch data');
  return res.json();
};

const getCurrentQuarter = () => {
  const month = new Date().getMonth() + 1; // 1-12
  if (month >= 10 && month <= 12) return { id: 'Q1', targetKey: 'targetQ1', name: 'ไตรมาส 1 (ต.ค. - ธ.ค.)' };
  if (month >= 1 && month <= 3) return { id: 'Q2', targetKey: 'targetQ2', name: 'ไตรมาส 2 (ม.ค. - มี.ค.)' };
  if (month >= 4 && month <= 6) return { id: 'Q3', targetKey: 'targetQ3', name: 'ไตรมาส 3 (เม.ย. - มิ.ย.)' };
  return { id: 'Q4', targetKey: 'targetQ4', name: 'ไตรมาส 4 (ก.ค. - ก.ย.)' };
};

const evaluateStatus = (current, target) => {
  if (current === '' || current === null || current === undefined) {
    return { color: 'text-slate-400', border: 'border-slate-500/30', bg: 'bg-slate-500', shadow: 'shadow-none', text: 'รอประเมินหลักเกณฑ์', raw: 'pending', percentage: 0 };
  }
  
  const curVal = parseFloat(current);
  const targetStr = String(target).toLowerCase();
  
  const match = targetStr.match(/([\d.]+)/);
  if (!match) return { color: 'text-slate-400', border: 'border-slate-500/30', bg: 'bg-slate-500', shadow: 'shadow-none', text: 'รอประเมินหลักเกณฑ์', raw: 'pending', percentage: 0 };
  
  const targetVal = parseFloat(match[1]);
  if (isNaN(curVal) || isNaN(targetVal) || targetVal === 0 || curVal === 0) {
    return { color: 'text-slate-400', border: 'border-slate-500/30', bg: 'bg-slate-500', shadow: 'shadow-none', text: 'รอดำเนินการ', raw: 'pending', percentage: 0 };
  }
  
  const isLowerBetter = targetStr.includes('<') || targetStr.includes('≤') || targetStr.includes('ลด') || targetStr.includes('ไม่เกิน') || targetStr.includes('น้อยกว่า');
  
  let percentage = 0;
  if (isLowerBetter) {
     percentage = curVal === 0 ? 100 : (targetVal / curVal) * 100;
  } else {
     percentage = (curVal / targetVal) * 100;
  }
  
  if (percentage >= 100) {
    return { color: 'text-emerald-400', border: 'border-emerald-400/50', bg: 'bg-emerald-400', shadow: 'shadow-[0_0_10px_rgba(52,211,153,0.5)]', text: 'บรรลุค่าเป้าหมาย', raw: 'passed_100', percentage };
  } else if (percentage >= 75) {
    return { color: 'text-yellow-400', border: 'border-yellow-400/50', bg: 'bg-yellow-400', shadow: 'shadow-[0_0_10px_rgba(250,204,21,0.5)]', text: 'ต่ำกว่าเป้าหมาย', raw: 'failed_75', percentage };
  } else if (percentage >= 50) {
    return { color: 'text-orange-400', border: 'border-orange-400/50', bg: 'bg-orange-500', shadow: 'shadow-[0_0_10px_rgba(249,115,22,0.5)]', text: 'ระดับเสี่ยง', raw: 'failed_50', percentage };
  } else {
    return { color: 'text-rose-500', border: 'border-rose-500/50', bg: 'bg-rose-500', shadow: 'shadow-[0_0_10px_rgba(244,63,94,0.5)]', text: 'ระดับวิกฤติ', raw: 'failed_0', percentage };
  }
};

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white/95 border border-slate-200 p-3 rounded-xl backdrop-blur-md shadow-lg text-sm">
        <p className="font-bold text-slate-800 mb-2">{label}</p>
        <div className="space-y-1">
          {payload.map((entry, index) => (
            <div key={index} className="flex justify-between gap-6">
              <span style={{ color: entry.color }} className="font-semibold">{entry.name}:</span>
              <span className="text-slate-800 font-bold">{entry.value}</span>
            </div>
          ))}
        </div>
      </div>
    );
  }
  return null;
};

export default function DashboardHealth() {
  const { data, isLoading, error } = useQuery({
    queryKey: ['healthData'],
    queryFn: fetchHealthData,
    refetchOnWindowFocus: false,
    staleTime: 5 * 60 * 1000
  });

  const currentQ = useMemo(() => getCurrentQuarter(), []);

  // 1. Map raw data
  const rawMappedData = useMemo(() => {
    if (!data) return [];
    
    let mapped = data.map((row, idx) => {
      const indicatorName = row.indicatorName ?? row['ชื่อตัวชี้วัด'] ?? 'ไม่ระบุ';
      const subIndicatorName = row.subIndicatorName ?? row['ชื่อตัวชี้วัดย่อย'] ?? '';
      const region = row.region ?? row['เขตฯ'] ?? row['เขต'] ?? row['เขตสุขภาพ'] ?? 'ไม่ได้ระบุเขต';
      
      const targetMap = { 
        targetQ1: row.targetQ1 ?? row['เป้าหมาย Q1'] ?? '', 
        targetQ2: row.targetQ2 ?? row['เป้าหมาย Q2'] ?? '', 
        targetQ3: row.targetQ3 ?? row['เป้าหมาย Q3'] ?? '', 
        targetQ4: row.targetQ4 ?? row['เป้าหมาย Q4'] ?? '' 
      };
      const currentQuarterTarget = targetMap[currentQ.targetKey];
      const valA = row.A ?? row['A'] ?? undefined;
      const valB = row.B ?? row['B'] ?? undefined;
      const valRawPerf = row.performance ?? row['ผลงาน'] ?? row['ผลงาน (ร้อยละ)'] ?? undefined;
      
      const cleanA = parseFloat(String(valA || 0).replace(/,/g, '')) || 0;
      const cleanB = parseFloat(String(valB || 0).replace(/,/g, '')) || 0;
      
      let calcPerf = null;
      if (valRawPerf !== undefined && valRawPerf !== '' && !isNaN(parseFloat(valRawPerf))) {
         calcPerf = parseFloat(valRawPerf).toFixed(2);
      } else if (valB !== undefined && cleanB > 0) {
         calcPerf = ((cleanA / cleanB) * 100).toFixed(2);
      } else if (valA !== undefined || valB !== undefined || valRawPerf !== undefined) {
         // User explicitly entered something (like A=0, B=0)
         if (valRawPerf === '0' || valRawPerf === 0) calcPerf = '0.00';
         else if (valA !== undefined && valB !== undefined) calcPerf = '0.00'; 
      }

      const status = evaluateStatus(calcPerf !== null ? calcPerf : '', currentQuarterTarget);
      
      return {
        id: idx,
        region: region,
        title: indicatorName,
        subtitle: subIndicatorName,
        targets: targetMap,
        target_value: currentQuarterTarget || 'ไม่มีการกำหนดเป้า',
        current_value: calcPerf,
        pop_b: cleanB,
        pop_35: cleanA,
        status_info: status,
      };
    });

    return mapped;
  }, [data, currentQ]);

  // 2. Extract Unique Indicators
  const uniqueMainIndicators = useMemo(() => {
    const mains = new Set();
    rawMappedData.forEach(d => {
      if (d.title !== 'ไม่ระบุ') mains.add(d.title);
    });
    return Array.from(mains);
  }, [rawMappedData]);

  const [selectedMain, setSelectedMain] = useState('');
  
  // 3. Extract Unique Sub-Indicators
  const uniqueSubIndicators = useMemo(() => {
    if (!selectedMain) return [];
    const subs = new Set();
    rawMappedData.forEach(d => {
      if (d.title === selectedMain && d.subtitle) {
        subs.add(d.subtitle);
      }
    });
    return Array.from(subs);
  }, [rawMappedData, selectedMain]);

  const [selectedSub, setSelectedSub] = useState('ALL');

  useEffect(() => {
    setSelectedSub('ALL');
  }, [selectedMain]);

  // 4. Apply Filters
  const dashboardData = useMemo(() => {
    if (!selectedMain) return [];
    return rawMappedData.filter(d => {
      const matchMain = d.title === selectedMain;
      const matchSub = selectedSub === 'ALL' ? true : d.subtitle === selectedSub;
      return matchMain && matchSub;
    });
  }, [rawMappedData, selectedMain, selectedSub]);

  // 5. Calculate Stats for the Filtered Data (aggregated by region)
  const { summary, barData, aggregatedMapData, targetLine, allTargets } = useMemo(() => {
    let totals = { passed_100: 0, failed_75: 0, failed_50: 0, failed_0: 0, pending: 0 };
    let totalA = 0;
    let totalB = 0;
    let totalPerfGlobal = 0;
    let regionsWithPerfGlobal = 0;
    
    let qTargets = { q1: '-', q2: '-', q3: '-', q4: '-' };
    if (dashboardData.length > 0) {
       qTargets = {
          q1: dashboardData[0].targets.targetQ1 || '-',
          q2: dashboardData[0].targets.targetQ2 || '-',
          q3: dashboardData[0].targets.targetQ3 || '-',
          q4: dashboardData[0].targets.targetQ4 || '-',
       };
    }

    // Aggregate by Region
    const regionAgg = {};
    for (let i = 1; i <= 13; i++) {
       regionAgg[i] = { totalA: 0, totalB: 0, totalPerf: 0, count: 0, target: qTargets ? qTargets[currentQ.id.toLowerCase()] || 'N/A' : 'N/A', rawRegion: `เขต ${i}` };
    }
    let overallReport = null;

    dashboardData.forEach(d => {
       const isOverall = d.region === 'รายงานภาพรวม';
       if (isOverall) {
          overallReport = d;
          return;
       }

       const rnum = parseInt((d.region || '').replace(/\D/g, '')) || 0;
       if (rnum === 0 || rnum > 13) return;

       regionAgg[rnum].target = d.target_value;
       regionAgg[rnum].rawRegion = d.region;
       
       const curA = parseFloat(d.pop_35 || 0);
       const curB = parseFloat(d.pop_b || 0);
       const perf = parseFloat(d.current_value);
       
       // Include if performance is legitimately defined (either > 0, or curB > 0 so a calculation was made)
       if (!isNaN(perf) && (perf > 0 || curB > 0 || (d.current_value !== '' && d.current_value !== null))) {
         regionAgg[rnum].totalA += curA;
         regionAgg[rnum].totalB += curB;
         regionAgg[rnum].totalPerf += perf;
         regionAgg[rnum].count += 1;
         
         totalA += curA;
         totalB += curB;
         totalPerfGlobal += perf;
         regionsWithPerfGlobal++;
       }
    });

    const bData = [];
    const mapDataList = [];

    // If there is ONLY overall report and NO region data, use overall for everything
    const useOverallOnly = regionsWithPerfGlobal === 0 && overallReport !== null;
    let ovPerf = 0;
    let ovStatus = { raw: 'pending' };
    
    if (useOverallOnly) {
       ovPerf = parseFloat(overallReport.current_value);
       if (isNaN(ovPerf)) ovPerf = 0;
       ovStatus = evaluateStatus(ovPerf > 0 ? ovPerf : '', overallReport.target_value);
    }

    Object.keys(regionAgg).sort((a,b) => parseInt(a) - parseInt(b)).forEach(rnum => {
       const reg = regionAgg[rnum];
       let calcPerf = 0;
       
       if (useOverallOnly) {
          calcPerf = ovPerf;
       } else if (reg.count > 0) {
          if (reg.totalB > 0) {
             calcPerf = parseFloat(((reg.totalA / reg.totalB) * 100).toFixed(2));
          } else {
             calcPerf = parseFloat((reg.totalPerf / reg.count).toFixed(2));
          }
       }

       // If not useOverallOnly and count is 0, it means blank data
       const finalPerfStr = useOverallOnly || reg.count > 0 ? calcPerf : '';
       const status = useOverallOnly ? ovStatus : evaluateStatus(finalPerfStr, reg.target);
       
       if (!useOverallOnly) {
           totals[status.raw] = (totals[status.raw] || 0) + 1;
       }

       if (!useOverallOnly) {
           bData.push({
             name: `เขต ${rnum}`,
             performance: calcPerf,
             color: status.raw === 'passed_100' ? '#10b981' :
                    status.raw === 'failed_75' ? '#eab308' :
                    status.raw === 'failed_50' ? '#f97316' :
                    status.raw === 'failed_0' ? '#f43f5e' : '#cbd5e1'
           });
       }
       
       mapDataList.push({
         region: reg.rawRegion,
         current_value: finalPerfStr !== '' ? calcPerf.toFixed(2) : '-',
         target_value: useOverallOnly ? overallReport.target_value : reg.target,
         status_info: status
       });
    });

    if (useOverallOnly) {
        totals[ovStatus.raw] = (totals[ovStatus.raw] || 0) + 1;
        bData.push({
             name: `ภาพรวมประเทศ`,
             performance: ovPerf,
             color: ovStatus.raw === 'passed_100' ? '#10b981' :
                    ovStatus.raw === 'failed_75' ? '#eab308' :
                    ovStatus.raw === 'failed_50' ? '#f97316' :
                    ovStatus.raw === 'failed_0' ? '#f43f5e' : '#cbd5e1'
        });
    }

    let avgPerf = '-';
    if (regionsWithPerfGlobal > 0) {
      if (totalB > 0) {
        avgPerf = ((totalA / totalB) * 100).toFixed(2);
      } else {
        avgPerf = (totalPerfGlobal / regionsWithPerfGlobal).toFixed(2);
      }
    } else if (overallReport) {
      const ovCur = parseFloat(overallReport.current_value);
      avgPerf = !isNaN(ovCur) ? ovCur.toFixed(2) : '-';
      totals[overallReport.status_info.raw] = (totals[overallReport.status_info.raw] || 0) + 1;
    }

    let targetNum = 0;
    if (dashboardData.length > 0) {
      const targetStr = String(dashboardData[0].target_value);
      const match = targetStr.match(/([\d.]+)/);
      if (match) targetNum = parseFloat(match[1]);
    }
    
    let passedCount = totals.passed_100 || 0;
    let failedCount = (totals.failed_75 || 0) + (totals.failed_50 || 0) + (totals.failed_0 || 0);
    let totalAssessed = passedCount + failedCount;
    let passedPercent = totalAssessed > 0 ? ((passedCount / totalAssessed)*100).toFixed(2) : 0;
    let failedPercent = totalAssessed > 0 ? ((failedCount / totalAssessed)*100).toFixed(2) : 0;

    return { 
       summary: { avgPerf, passedCount, failedCount, passedPercent, failedPercent }, 
       barData: bData, 
       aggregatedMapData: mapDataList,
       targetLine: targetNum,
       allTargets: qTargets
    };
  }, [dashboardData, currentQ]);

  // 6. Calculate Summaries for ALL Indicators (for Overview Mode)
  const allSummaries = useMemo(() => {
    const reports = [];
    uniqueMainIndicators.forEach(title => {
       const kpisForTitle = rawMappedData.filter(d => d.title === title && d.subtitle === 'ALL');
       const relevantData = kpisForTitle.length > 0 ? kpisForTitle : rawMappedData.filter(d => d.title === title);
       
       if (relevantData.length === 0) return;

       let totalA = 0; let totalB = 0; let regionsWithPerf = 0;
       let overallReport = null;
       let totals = { passed_100: 0, failed_75: 0, failed_50: 0, failed_0: 0, pending: 0 };

       relevantData.forEach(d => {
          const isOverall = d.region === 'รายงานภาพรวม';
          if (isOverall) overallReport = d;
          const cur = parseFloat(d.current_value);
          if (!isOverall) {
             totals[d.status_info.raw] = (totals[d.status_info.raw] || 0) + 1;
             if (!isNaN(cur) && cur > 0) {
                totalA += parseFloat(d.pop_35 || 0); totalB += parseFloat(d.pop_b || 0); regionsWithPerf++;
             }
          }
       });

       let avgPerf = '-';
       if (regionsWithPerf > 0) {
          avgPerf = totalB > 0 ? ((totalA / totalB) * 100).toFixed(2) : '-';
       } else if (overallReport) {
          avgPerf = parseFloat(overallReport.current_value).toFixed(2);
       }

       reports.push({ 
          title, 
          avgPerf, 
          status: evaluateStatus(avgPerf, relevantData[0].targets[currentQ.targetKey]),
          passed: totals.passed_100, 
          failed: totals.failed_75 + totals.failed_50 + totals.failed_0 
       });
    });
    return reports;
  }, [rawMappedData, uniqueMainIndicators, currentQ]);

  // 7. Calculate Regional Averages & Status Breakdown (for Category Overview)
  const categoryStats = useMemo(() => {
    const statusCounts = { passed: 0, failed: 0, pending: 0 };
    allSummaries.forEach(s => {
      if (s.status.raw === 'passed_100') statusCounts.passed++;
      else if (s.status.raw === 'pending') statusCounts.pending++;
      else statusCounts.failed++;
    });

    const statusData = [
      { name: 'ผ่านเกณฑ์', value: statusCounts.passed, color: '#10b981' },
      { name: 'ไม่ผ่านเกณฑ์', value: statusCounts.failed, color: '#f43f5e' },
      { name: 'รอดำเนินการ', value: statusCounts.pending, color: '#64748b' }
    ];

    const regions = {};
    rawMappedData.forEach(d => {
      if (d.region === 'รายงานภาพรวม') return;
      if (!regions[d.region]) regions[d.region] = { totalPerf: 0, count: 0 };
      const perf = parseFloat(d.current_value);
      if (!isNaN(perf) && perf > 0) {
        regions[d.region].totalPerf += perf;
        regions[d.region].count += 1;
      }
    });

    const regData = Object.keys(regions).map(r => ({
      name: r.replace('เขตสุขภาพที่ ', 'เขต ').replace('เขตฯ ', 'เขต '),
      avg: regions[r].count > 0 ? parseFloat((regions[r].totalPerf / regions[r].count).toFixed(2)) : 0
    })).sort((a, b) => {
      const numA = parseInt(a.name.replace(/\D/g, '')) || 0;
      const numB = parseInt(b.name.replace(/\D/g, '')) || 0;
      return numA - numB;
    });

    return { statusData, regData, totalKPIs: allSummaries.length, statusCounts };
  }, [allSummaries, rawMappedData]);

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <Loader2 className="animate-spin text-emerald-500" size={48} />
        <p className="text-slate-400 font-medium">กำลังโหลดข้อมูล Health KPI รายเขตฯ...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-rose-500 gap-4">
        <AlertTriangle size={48} />
        <p className="font-bold">เกิดข้อผิดพลาดในการโหลดข้อมูล</p>
        <p className="text-sm opacity-80">{error.message}</p>
      </div>
    );
  }

  return (
    <div className="max-w-[1700px] w-full mx-auto space-y-6 pb-10">
      
      {/* 1. Dynamic Drill-down Filter Header */}
      <div className="bg-white p-6 rounded-3xl border border-slate-200 relative z-20 shadow-md overflow-hidden flex flex-col xl:flex-row justify-between xl:items-center gap-6">
        <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/10 rounded-full blur-[80px] pointer-events-none" />
        
        <div className="flex-1 max-w-2xl">
           <h1 className="text-2xl lg:text-3xl font-black text-slate-800 tracking-tight break-words flex items-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-100 to-teal-100 border border-emerald-200 flex items-center justify-center shrink-0">
                 <Activity className="text-emerald-600" size={20} />
              </div>
              {(selectedMain || <span className="text-slate-400">แดชบอร์ด Health KPI</span>)}
           </h1>
           {selectedSub !== 'ALL' && <p className="text-cyan-600 font-bold ml-14">(เจาะจงเฉพาะ: {selectedSub})</p>}
        </div>

        <div className="flex flex-col md:flex-row gap-4 relative z-10 w-full xl:w-auto shrink-0 items-center">
           <div className="space-y-1">
              <label className="text-emerald-700 text-[11px] uppercase tracking-wider font-bold ml-1">เลือกตัวชี้วัดหลัก</label>
              <select 
                 value={selectedMain} 
                 onChange={(e) => setSelectedMain(e.target.value)}
                 className="w-full xl:w-[350px] bg-white border border-slate-300 text-emerald-800 font-bold px-4 py-2.5 rounded-xl outline-none focus:border-emerald-500 transition-colors cursor-pointer text-sm shadow-sm truncate"
              >
                 <option value="" disabled className="text-slate-400">กรุณาเลือกตัวชี้วัด</option>
                 {uniqueMainIndicators.map(m => <option key={m} value={m}>{m}</option>)}
              </select>
           </div>
           
           {uniqueSubIndicators.length > 0 && (
              <div className="space-y-1">
                 <label className="text-cyan-700 text-[11px] uppercase tracking-wider font-bold ml-1">เลือกตัวชี้วัดย่อย (ถ้ามี)</label>
                 <select 
                    value={selectedSub} 
                    onChange={(e) => setSelectedSub(e.target.value)}
                    className="w-full xl:w-[250px] bg-white border border-slate-300 text-cyan-800 font-bold px-4 py-2.5 rounded-xl outline-none focus:border-cyan-500 transition-colors cursor-pointer text-sm shadow-sm truncate"
                 >
                    <option value="ALL">-- รวมตัวชี้วัดย่อยทั้งหมด --</option>
                    {uniqueSubIndicators.map(s => <option key={s} value={s}>{s}</option>)}
                 </select>
              </div>
           )}
        </div>
      </div>

      {!selectedMain ? (
        <div className="flex flex-col gap-6 animate-in fade-in zoom-in duration-500">
            {/* Top Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white border border-emerald-100 rounded-3xl p-6 shadow-sm flex items-center justify-between relative overflow-hidden group">
                   <div className="absolute inset-0 bg-emerald-50 group-hover:bg-emerald-100/50 transition-colors" />
                   <div className="z-10">
                      <p className="text-sm text-slate-500 font-bold mb-1">จำนวนตัวชี้วัดทั้งหมด</p>
                      <p className="text-4xl font-black text-slate-800">{categoryStats.totalKPIs}</p>
                   </div>
                   <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-emerald-400 to-emerald-600 text-white flex items-center justify-center shrink-0 z-10 shadow-md shadow-emerald-500/20">
                      <Target size={28} />
                   </div>
                </div>

                <div className="bg-white border border-cyan-100 rounded-3xl p-6 shadow-sm flex items-center justify-between relative overflow-hidden group">
                   <div className="absolute inset-0 bg-cyan-50 group-hover:bg-cyan-100/50 transition-colors" />
                   <div className="z-10">
                      <p className="text-sm text-slate-500 font-bold mb-1">ตัวชี้วัดที่สำเร็จ 100%</p>
                      <div className="flex items-baseline gap-2">
                        <p className="text-4xl font-black text-slate-800">{categoryStats.statusCounts.passed}</p>
                        <p className="text-sm font-bold text-cyan-700 tracking-wide bg-cyan-100 px-2 py-0.5 rounded-md">
                           {categoryStats.totalKPIs > 0 ? ((categoryStats.statusCounts.passed / categoryStats.totalKPIs) * 100).toFixed(1) : 0}%
                        </p>
                      </div>
                   </div>
                   <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-cyan-400 to-cyan-600 text-white flex items-center justify-center shrink-0 z-10 shadow-md shadow-cyan-500/20">
                      <CheckCircle2 size={28} />
                   </div>
                </div>

                <div className="bg-white border border-purple-100 rounded-3xl p-6 shadow-sm flex items-center justify-between relative overflow-hidden group">
                   <div className="absolute inset-0 bg-purple-50 group-hover:bg-purple-100/50 transition-colors" />
                   <div className="z-10">
                      <p className="text-sm text-slate-500 font-bold mb-1">เขตฯ คะแนนเฉลี่ยสูงสุด</p>
                      <p className="text-2xl font-black text-slate-800 truncate max-w-[200px]">
                         {categoryStats.regData.length > 0 ? [...categoryStats.regData].sort((a,b) => b.avg - a.avg)[0].name : '-'}
                      </p>
                      <p className="text-sm font-bold text-purple-600 mt-1">
                         {categoryStats.regData.length > 0 ? [...categoryStats.regData].sort((a,b) => b.avg - a.avg)[0].avg.toFixed(2) : '-'}%
                      </p>
                   </div>
                   <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-purple-400 to-purple-600 text-white flex items-center justify-center shrink-0 z-10 shadow-md shadow-purple-500/20">
                      <MapPin size={28} />
                   </div>
                </div>
            </div>

            {/* Overview Master Visuals */}
            <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 items-start">
               {/* 1. National Map Overview */}
               <div className="xl:col-span-4 bg-white border border-slate-200 rounded-3xl p-1.5 shadow-sm relative overflow-hidden group">
                  <h3 className="absolute top-4 left-5 z-20 text-xs font-bold text-slate-800 flex items-center gap-2 bg-white/90 backdrop-blur-md px-3 py-1.5 rounded-xl border border-slate-200 shadow-sm">
                     <MapPin size={14} className="text-emerald-600" /> แผนที่ภาพรวมระดับประเทศ
                  </h3>
                  <div className="h-[350px] bg-slate-50 rounded-2xl overflow-hidden">
                     <ThailandMap dashboardData={categoryStats.regData.map(r => {
                        const rnum = parseInt(r.name.replace(/\D/g, '')) || 0;
                        let colorStr = 'pending';
                        if(r.avg >= 100) colorStr = 'passed_100';
                        else if(r.avg >= 75) colorStr = 'failed_75';
                        else if(r.avg >= 50) colorStr = 'failed_50';
                        else if(r.avg > 0) colorStr = 'failed_0';
                        return { 
                           region: `เขตที่ ${rnum}`, 
                           current_value: r.avg.toFixed(2),
                           target_value: 'ภาพรวม', 
                           status_info: { 
                              raw: colorStr, 
                              text: 'คะแนนเฉลี่ย', 
                              percentage: r.avg,
                              color: colorStr === 'passed_100' ? 'text-emerald-600' : colorStr === 'failed_75' ? 'text-yellow-600' : colorStr === 'failed_50' ? 'text-orange-500' : 'text-rose-500'
                           } 
                        };
                     })} />
                  </div>
               </div>

               {/* 2. Bar Chart */}
               <div className="xl:col-span-5 bg-white border border-slate-200 rounded-3xl p-6 shadow-sm h-full flex flex-col">
                  <div className="flex justify-between items-center mb-4">
                     <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2">
                        <Activity size={16} className="text-cyan-600" /> เปรียบเทียบคะแนนเฉลี่ย 13 เขตฯ
                     </h3>
                  </div>
                  <div className="flex-1 min-h-[250px] w-full relative">
                     <div className="absolute inset-0">
                        <ResponsiveContainer width="100%" height="100%">
                          <BarChart data={categoryStats.regData} margin={{ top: 10, right: 0, left: -25, bottom: 0 }}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
                            <XAxis dataKey="name" stroke="#64748b" axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 10}} />
                            <YAxis stroke="#64748b" axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 11}} domain={[dataMin => Math.min(0, dataMin), dataMax => Math.max(100, dataMax)]} />
                            <Tooltip 
                              cursor={{fill: '#f1f5f9'}} 
                              contentStyle={{ backgroundColor: '#ffffff', borderColor: '#e2e8f0', borderRadius: '0.5rem', color: '#1e293b', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }}
                              itemStyle={{ fontWeight: 'bold' }}
                            />
                            <Bar dataKey="avg" name="คะแนนเฉลี่ย (%)" radius={[4, 4, 0, 0]} barSize={25}>
                               {categoryStats.regData.map((entry, index) => (
                                 <Cell key={`cell-${index}`} fill="#3b82f6" />
                               ))}
                            </Bar>
                          </BarChart>
                        </ResponsiveContainer>
                     </div>
                  </div>
               </div>

               {/* 3. Pie Chart */}
               <div className="xl:col-span-3 bg-white border border-slate-200 rounded-3xl p-6 shadow-md flex flex-col items-center justify-center h-full">
                  <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2 mb-2 self-start w-full">
                     <PieChart size={16} className="text-orange-400" /> สัดส่วนสถานะการดำเนินงาน
                  </h3>
                  <div className="h-[180px] w-full relative">
                     <ResponsiveContainer width="100%" height="100%">
                       <RePieChart>
                         <Pie
                           data={categoryStats.statusData}
                           cx="50%"
                           cy="50%"
                           innerRadius={50}
                           outerRadius={75}
                           paddingAngle={5}
                           dataKey="value"
                           stroke="none"
                         >
                           {categoryStats.statusData.map((entry, index) => (
                             <Cell key={`cell-${index}`} fill={entry.color} />
                           ))}
                          </Pie>
                          <Tooltip 
                            contentStyle={{ backgroundColor: '#ffffff', borderColor: '#e2e8f0', borderRadius: '0.5rem', color: '#1e293b' }}
                            itemStyle={{ fontWeight: 'bold' }}
                          />
                        </RePieChart>
                      </ResponsiveContainer>
                      <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                         <p className="text-4xl font-black text-slate-800">{categoryStats.totalKPIs}</p>
                         <p className="text-xs text-slate-400 font-bold uppercase tracking-widest mt-1">Total KPIs</p>
                      </div>
                   </div>
                   <div className="flex gap-4 mt-4 flex-wrap justify-center w-full">
                      {categoryStats.statusData.map((s, idx) => (
                         <div key={idx} className="flex items-center gap-2 bg-slate-900/50 px-3 py-1.5 rounded-lg border border-white/5">
                            <span className="w-2.5 h-2.5 rounded-full shadow-sm" style={{ backgroundColor: s.color, boxShadow: `0 0 8px ${s.color}` }}></span>
                            <span className="text-xs font-bold text-slate-300">{s.name} ({s.value})</span>
                         </div>
                      ))}
                   </div>
                </div>
            </div>

            {/* Bottom Table: 5 indicators for improvement */}
            <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-md overflow-hidden flex flex-col">
               <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
                   <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                      <AlertTriangle size={18} className="text-rose-500" /> 5 อันดับตัวชี้วัดที่ควรเร่งรัด (คะแนนเฉลี่ยระดับประเทศต่ำสุด)
                   </h3>
               </div>
               <div className="overflow-x-auto custom-scrollbar pb-4 flex-1">
                  <table className="w-full text-left border-collapse min-w-[800px]">
                    <thead>
                      <tr className="border-b border-slate-200 text-slate-500 text-xs uppercase tracking-wider bg-slate-50">
                        <th className="p-4 font-bold rounded-tl-xl w-16 text-center">อันดับ</th>
                        <th className="p-4 font-bold max-w-md">ชื่อตัวชี้วัด</th>
                        <th className="p-4 font-bold text-center w-36">ผ่านกี่หมวด/เขต</th>
                        <th className="p-4 font-bold text-center w-36 bg-slate-100">คะแนนเฉลี่ย (%)</th>
                        <th className="p-4 font-bold text-center rounded-tr-xl w-36">สถานะภาพรวม</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {[...allSummaries]
                        .filter(s => s.avgPerf !== '-')
                        .sort((a,b) => parseFloat(a.avgPerf) - parseFloat(b.avgPerf))
                        .slice(0, 5)
                        .map((kpi, idx) => (
                        <tr key={idx} className="hover:bg-slate-50 transition-colors group">
                          <td className="p-4 text-center">
                            <span className="inline-flex w-7 h-7 rounded-lg bg-rose-50 border border-rose-100 text-rose-500 text-sm font-black shadow-inner items-center justify-center">
                              {idx + 1}
                            </span>
                          </td>
                          <td className="p-4 text-slate-700 font-medium truncate max-w-md" title={kpi.title}>
                            {kpi.title}
                          </td>
                          <td className="p-4 text-center">
                             <div className="flex items-center justify-center gap-2 bg-slate-50 px-3 py-1.5 rounded-xl border border-slate-200 w-max mx-auto">
                                <span className="text-emerald-600 font-bold">{kpi.passed}</span>
                                <span className="text-slate-400 text-xs mt-0.5">/</span>
                                <span className="text-rose-500 font-bold">{kpi.failed}</span>
                             </div>
                          </td>
                          <td className="p-4 text-center bg-slate-50 font-black text-rose-500 text-lg rounded-md">
                            {kpi.avgPerf}
                          </td>
                          <td className="p-4 text-center">
                            <div className={`inline-flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-lg border ${kpi.status.border} bg-white whitespace-nowrap shadow-sm`}>
                              <span className={`w-2 h-2 rounded-full ${kpi.status.bg} ${kpi.status.shadow}`}></span>
                              <span className={`text-[11px] font-bold ${kpi.status.color} uppercase tracking-wide`}>{kpi.status.text}</span>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
               </div>
            </div>
        </div>
      ) : dashboardData.length === 0 ? (
        <div className="bg-white border border-slate-200 rounded-3xl p-16 text-center shadow-md">
          <Activity size={48} className="mx-auto text-slate-300 mb-4" />
          <h2 className="text-xl font-bold text-slate-800 mb-2">ไม่พบข้อมูลสำหรับตัวชี้วัดที่เลือก</h2>
          <p className="text-slate-500 max-w-md mx-auto">ยังไม่มีการเพิ่มข้อมูลของตัวชี้วัดนี้ในระบบ</p>
        </div>
      ) : (
        <div className="flex flex-col gap-6">
           
           {/* TWO COLUMN MASTER GRID */}
           <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 items-start">
              
              {/* LEFT COLUMN: Map & Targets */}
              <div className="xl:col-span-4 space-y-6">
                 {/* Map Component Container */}
                 <div className="bg-white border border-slate-200 rounded-3xl p-1.5 shadow-md relative overflow-hidden group">
                    <h3 className="absolute top-4 left-5 z-20 text-sm font-bold text-slate-800 flex items-center gap-2 bg-white/90 backdrop-blur-md px-3 py-1.5 rounded-xl border border-slate-200 shadow-sm">
                       <MapPin size={16} className="text-emerald-600" /> แผนที่ผลการดำเนินงาน
                    </h3>
                    <div className="h-[400px] xl:h-[420px] bg-slate-50 rounded-2xl overflow-hidden">
                       <ThailandMap dashboardData={aggregatedMapData} />
                    </div>
                 </div>

                 {/* Huge Score & Quarterly Targets */}
                 <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-md relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-48 h-48 bg-emerald-500/5 rounded-full blur-3xl pointer-events-none" />
                    
                    <div className="flex flex-col items-center justify-center text-center mb-8 relative z-10">
                       <p className="text-slate-500 font-bold mb-1 uppercase tracking-widest text-xs">ผลงานเฉลี่ยรวมระดับประเทศ</p>
                       <div className="flex items-end justify-center gap-1">
                          <p className="text-6xl font-black text-transparent bg-clip-text bg-gradient-to-r from-emerald-500 to-cyan-500 drop-shadow-sm">
                             {summary.avgPerf}
                          </p>
                          <p className="text-emerald-500 font-bold pb-2">%</p>
                       </div>
                    </div>
                    
                    <div>
                       <p className="text-slate-500 font-bold mb-3 flex items-center gap-2 text-sm"><Target size={14}/> เกณฑ์เป้าหมายแยกไตรมาส</p>
                       <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                          <div className={`rounded-xl p-3 border transition-colors flex flex-col items-center justify-center ${currentQ.id === 'Q1' ? 'bg-emerald-50 border-emerald-200 shadow-sm' : 'bg-slate-50 border-slate-200'}`}>
                             <p className={`text-[11px] font-bold mb-1 ${currentQ.id === 'Q1' ? 'text-emerald-600' : 'text-slate-500'}`}>ไตรมาส 1</p>
                             <p className={`text-sm font-bold ${currentQ.id === 'Q1' ? 'text-slate-800' : 'text-slate-600'}`}>{allTargets.q1}</p>
                          </div>
                          <div className={`rounded-xl p-3 border transition-colors flex flex-col items-center justify-center ${currentQ.id === 'Q2' ? 'bg-emerald-50 border-emerald-200 shadow-sm' : 'bg-slate-50 border-slate-200'}`}>
                             <p className={`text-[11px] font-bold mb-1 ${currentQ.id === 'Q2' ? 'text-emerald-600' : 'text-slate-500'}`}>ไตรมาส 2</p>
                             <p className={`text-sm font-bold ${currentQ.id === 'Q2' ? 'text-slate-800' : 'text-slate-600'}`}>{allTargets.q2}</p>
                          </div>
                          <div className={`rounded-xl p-3 border transition-colors flex flex-col items-center justify-center ${currentQ.id === 'Q3' ? 'bg-emerald-50 border-emerald-200 shadow-sm' : 'bg-slate-50 border-slate-200'}`}>
                             <p className={`text-[11px] font-bold mb-1 ${currentQ.id === 'Q3' ? 'text-emerald-600' : 'text-slate-500'}`}>ไตรมาส 3</p>
                             <p className={`text-sm font-bold ${currentQ.id === 'Q3' ? 'text-slate-800' : 'text-slate-600'}`}>{allTargets.q3}</p>
                          </div>
                          <div className={`rounded-xl p-3 border transition-colors flex flex-col items-center justify-center ${currentQ.id === 'Q4' ? 'bg-emerald-50 border-emerald-200 shadow-sm' : 'bg-slate-50 border-slate-200'}`}>
                             <p className={`text-[11px] font-bold mb-1 ${currentQ.id === 'Q4' ? 'text-emerald-600' : 'text-slate-500'}`}>ไตรมาส 4</p>
                             <p className={`text-sm font-bold ${currentQ.id === 'Q4' ? 'text-slate-800' : 'text-slate-600'}`}>{allTargets.q4}</p>
                          </div>
                       </div>
                    </div>
                 </div>
              </div>

              {/* RIGHT COLUMN: Summary Cards & Bar Chart */}
              <div className="xl:col-span-8 space-y-6">
                 
                 {/* 3 Summary Cards Row */}
                 <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {/* Card 1: Passed */}
                    <div className="bg-white border border-emerald-100 rounded-3xl p-6 shadow-sm flex items-center justify-between relative overflow-hidden group">
                       <div className="absolute inset-0 bg-emerald-50 group-hover:bg-emerald-100/50 transition-colors" />
                       <div className="z-10">
                          <p className="text-sm text-slate-500 font-bold mb-1">จำนวนที่ผ่านเกณฑ์</p>
                          <div className="flex items-baseline gap-2">
                             <p className="text-4xl font-black text-slate-800">{summary.passedCount}</p>
                             <p className="text-sm font-bold text-emerald-700 tracking-wide bg-emerald-100 px-2 py-0.5 rounded-md">{summary.passedPercent}%</p>
                          </div>
                       </div>
                       <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-emerald-400 to-emerald-600 text-white flex items-center justify-center shrink-0 z-10 shadow-md shadow-emerald-500/20">
                          <CheckCircle2 size={28} />
                       </div>
                    </div>

                    {/* Card 2: Failed */}
                    <div className="bg-white border border-rose-100 rounded-3xl p-6 shadow-sm flex items-center justify-between relative overflow-hidden group">
                       <div className="absolute inset-0 bg-rose-50 group-hover:bg-rose-100/50 transition-colors" />
                       <div className="z-10">
                          <p className="text-sm text-slate-500 font-bold mb-1">จำนวนที่ไม่ผ่าน</p>
                          <div className="flex items-baseline gap-2">
                             <p className="text-4xl font-black text-slate-800">{summary.failedCount}</p>
                             <p className="text-sm font-bold text-rose-600 tracking-wide bg-rose-100 px-2 py-0.5 rounded-md">{summary.failedPercent}%</p>
                          </div>
                       </div>
                       <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-rose-400 to-rose-600 text-white flex items-center justify-center shrink-0 z-10 shadow-md shadow-rose-500/20">
                          <XCircle size={28} />
                       </div>
                    </div>

                    {/* Card 3: Period Info */}
                    <div className="bg-white border border-orange-100 rounded-3xl p-6 shadow-sm flex items-center justify-between relative overflow-hidden group sm:col-span-2 lg:col-span-1">
                       <div className="absolute inset-0 bg-orange-50 group-hover:bg-orange-100/50 transition-colors" />
                       <div className="z-10">
                          <p className="text-sm text-slate-500 font-bold mb-1">ระยะเวลา</p>
                          <div className="flex flex-col">
                             <p className="text-lg font-black text-slate-800">รายงาน {currentQ.name}</p>
                             <p className="text-xs font-bold text-orange-500 mt-1">อัปเดตล่าสุด: {new Date().toLocaleDateString('th-TH')}</p>
                          </div>
                       </div>
                       <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-orange-400 to-orange-600 text-white flex items-center justify-center shrink-0 z-10 shadow-md shadow-orange-500/20">
                          <Calendar size={28} />
                       </div>
                    </div>
                 </div>

                 {/* Bar Chart */}
                 <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-md">
                    <div className="flex justify-between items-center mb-6">
                       <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                          <Activity size={18} className="text-cyan-600" /> เจาะลึกผลการดำเนินงาน 13 เขตสุขภาพ
                       </h3>
                    </div>
                    
                    <div className="h-[320px] xl:h-[350px]">
                       <ResponsiveContainer width="100%" height="100%">
                         <BarChart data={barData} margin={{ top: 20, right: 0, left: -20, bottom: 0 }}>
                           <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
                           <XAxis dataKey="name" stroke="#64748b" axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 11}} />
                           <YAxis stroke="#64748b" axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12}} domain={[dataMin => Math.min(0, dataMin), dataMax => Math.max(100, dataMax)]} />
                           <Tooltip 
                             cursor={{fill: '#f1f5f9'}} 
                             contentStyle={{ backgroundColor: '#ffffff', borderColor: '#e2e8f0', borderRadius: '0.5rem', color: '#1e293b', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }}
                             itemStyle={{ fontWeight: 'bold' }}
                           />
                           {targetLine > 0 && (
                             <ReferenceLine y={targetLine} stroke="#ef4444" strokeDasharray="5 5" strokeWidth={2} label={{ position: 'top', value: `เป้าหมาย ${targetLine}`, fill: '#ef4444', fontSize: 12, fontWeight: 'bold' }} />
                           )}
                           <Bar dataKey="performance" name="ผลงาน (ร้อยละ)" radius={[4, 4, 0, 0]} barSize={40} minPointSize={3}>
                              {barData.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={entry.color} />
                              ))}
                           </Bar>
                         </BarChart>
                       </ResponsiveContainer>
                    </div>
                 </div>
              </div>
           </div>

           {/* BOTTOM: Data Table & Template panel */}
           <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 mt-2">
              <div className="xl:col-span-8 bg-white border border-slate-200 rounded-3xl p-6 shadow-md overflow-hidden flex flex-col">
                 <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
                     <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                        <FileText size={18} className="text-emerald-600" /> สมุดบันทึกผลการดำเนินงานรายเขตฯ
                     </h3>
                 </div>
                 
                 <div className="overflow-x-auto custom-scrollbar pb-4 flex-1">
                    <table className="w-full text-left border-collapse min-w-[1000px]">
                      <thead>
                        <tr className="border-b border-slate-200 text-slate-500 text-xs uppercase tracking-wider bg-slate-50">
                          <th className="p-4 font-bold rounded-tl-xl w-32">เขตสุขภาพ</th>
                          <th className="p-4 font-bold text-center w-36 text-blue-600">ประชากร A (ผลงาน)</th>
                          <th className="p-4 font-bold text-center w-36 text-teal-600">ประชากร B (เป้า)</th>
                          <th className="p-4 font-bold text-center w-32 bg-slate-100">ผลงาน (ร้อยละ)</th>
                          <th className="p-4 font-bold text-center rounded-tr-xl w-36">สถานะไตรมาส</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {dashboardData.map((kpi) => (
                          <tr key={kpi.id} className="hover:bg-slate-50 transition-colors group">
                            <td className="p-4">
                              <span className="inline-block px-3 py-1 rounded-full bg-slate-100 border border-slate-200 text-slate-600 text-xs font-bold tracking-wider whitespace-nowrap">
                                {kpi.region}
                              </span>
                            </td>
                            <td className="p-4 text-blue-700 font-bold text-center bg-blue-50">
                              {kpi.pop_35 ? Number(kpi.pop_35).toLocaleString() : '-'}
                            </td>
                            <td className="p-4 text-teal-700 font-bold text-center bg-teal-50">
                              {kpi.pop_b ? Number(kpi.pop_b).toLocaleString() : '-'}
                            </td>
                            <td className="p-4 text-center bg-slate-50 font-black text-slate-800 text-lg rounded-md">
                              {!isNaN(parseFloat(kpi.current_value)) ? kpi.current_value : '-'}
                            </td>
                            <td className="p-4 text-center">
                              <div className={`inline-flex items-center justify-center gap-1.5 px-3 py-1 pb-1.5 rounded-lg border ${kpi.status_info.border} bg-white whitespace-nowrap shadow-sm`}>
                                <span className={`w-2 h-2 rounded-full ${kpi.status_info.bg} ${kpi.status_info.shadow}`}></span>
                                <span className={`text-xs font-bold ${kpi.status_info.color}`}>{kpi.status_info.text}</span>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                 </div>
              </div>

              {/* KPI Template Information Box */}
              <div className="xl:col-span-4 bg-white border border-slate-200 rounded-3xl p-6 shadow-md h-full max-h-[600px] overflow-y-auto custom-scrollbar">
                 <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2 mb-6 border-b border-slate-200 pb-4 sticky top-0 bg-white/95 py-2 backdrop-blur-xl z-10">
                    <Target size={18} className="text-blue-500" /> KPI Template
                 </h3>
                 <div className="space-y-6">
                    <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 shadow-inner">
                       <p className="text-xs font-bold text-slate-500 mb-2 uppercase tracking-wider">สูตรคำนวณที่ใช้</p>
                       <p className="text-xl font-mono text-center text-blue-600 font-black bg-white py-3 rounded-lg border border-blue-100 shadow-sm">
                         ( A / B ) × 100
                       </p>
                    </div>
                    
                    <div className="space-y-4">
                       <div className="bg-slate-50 p-4 rounded-xl border-l-4 border-blue-500">
                          <div className="flex gap-3 items-center mb-2">
                             <span className="w-8 h-8 rounded-lg bg-blue-100 text-blue-600 flex items-center justify-center font-black text-lg shadow-sm">A</span>
                             <p className="font-bold text-slate-800 text-sm">ประชากรกลุ่มเป้าหมาย (ผลงาน)</p>
                          </div>
                          <p className="text-sm text-slate-500 leading-relaxed pl-11">
                             จำนวนประชากรที่ได้รับการคัดกรอง (คอลัมน์ A)
                          </p>
                       </div>
                       
                       <div className="bg-slate-50 p-4 rounded-xl border-l-4 border-teal-500">
                          <div className="flex gap-3 items-center mb-2">
                             <span className="w-8 h-8 rounded-lg bg-teal-100 text-teal-600 flex items-center justify-center font-black text-lg shadow-sm">B</span>
                             <p className="font-bold text-slate-800 text-sm">ประชากรรวมทั้งหมด (เป้าฐาน)</p>
                          </div>
                          <p className="text-sm text-slate-500 leading-relaxed pl-11">
                             จำนวนประชากรทั้งหมดในกลุ่มเป้าหมาย (คอลัมน์ B)
                          </p>
                       </div>
                    </div>
                 </div>
              </div>
           </div>
        </div>
      )}
    </div>
  );
}
