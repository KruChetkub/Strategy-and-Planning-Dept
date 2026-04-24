import React, { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import {
  Loader2, Activity, Target, CheckCircle2, AlertOctagon,
  TrendingUp, XCircle, ArrowRight, AlertTriangle, ShieldCheck,
  BarChart2, Layers
} from 'lucide-react';
import { supabase } from '../lib/supabase';

/* ─────────────────────────────────────────────────────────────────────────────
   DATA FETCHING & HELPERS — ไม่มีการแก้ไข logic ใดๆ ทั้งสิ้น
───────────────────────────────────────────────────────────────────────────── */
const fetchAllDashboards = async () => {
  const [resSdgs, resHealth] = await Promise.all([
    supabase.from('sdg_indicators').select('*'),
    supabase.from('health_indicators').select('*')
  ]);
  if (resSdgs.error) throw resSdgs.error;
  if (resHealth.error) throw resHealth.error;
  return [resSdgs.data, resHealth.data];
};

const evaluateSDGStatus = (current, target) => {
  if (current === '' || current === null || current === undefined) return { raw: 'pending' };
  const curVal = parseFloat(current);
  const tStr = String(target).toLowerCase();
  const match = tStr.match(/([\d.]+)/);
  if (!match) return { raw: 'pending' };
  const targetVal = parseFloat(match[1]);
  if (isNaN(curVal) || isNaN(targetVal) || targetVal === 0) return { raw: 'pending' };
  const isLowerBetter = tStr.includes('<') || tStr.includes('≤') || tStr.includes('ลด');
  let pct = isLowerBetter ? (curVal === 0 ? 100 : (targetVal / curVal) * 100) : (curVal / targetVal) * 100;
  if (pct >= 100) return { raw: 'passed_100' };
  if (pct >= 75)  return { raw: 'failed_75' };
  if (pct >= 50)  return { raw: 'failed_50' };
  return { raw: 'failed_0' };
};

const getCurrentQuarter = () => {
  const m = new Date().getMonth() + 1;
  if (m >= 10) return { targetKey: 'targetQ1' };
  if (m <= 3)  return { targetKey: 'targetQ2' };
  if (m <= 6)  return { targetKey: 'targetQ3' };
  return { targetKey: 'targetQ4' };
};

const evaluateHealthStatus = (current, targetString) => {
  if (!current) return { raw: 'pending' };
  const curVal = parseFloat(current);
  const tStr = String(targetString || '').toLowerCase();
  const match = tStr.match(/([\d.]+)/);
  if (!match) return { raw: 'pending' };
  const targetVal = parseFloat(match[1]);
  if (isNaN(curVal) || isNaN(targetVal) || targetVal === 0) return { raw: 'pending' };
  const isLowerBetter = tStr.includes('<') || tStr.includes('≤') || tStr.includes('ลด');
  let pct = isLowerBetter ? (curVal === 0 ? 100 : (targetVal / curVal) * 100) : (curVal / targetVal) * 100;
  if (pct >= 100) return { raw: 'passed_100' };
  if (pct >= 75)  return { raw: 'failed_75' };
  if (pct >= 50)  return { raw: 'failed_50' };
  return { raw: 'failed_0' };
};

/* ─────────────────────────────────────────────────────────────────────────────
   STATUS CONFIG — maps status code → visual tokens
───────────────────────────────────────────────────────────────────────────── */
const STATUS = {
  passed_100: { label: 'บรรลุเป้าหมาย', short: 'Passed',  bg: 'bg-emerald-50', text: 'text-emerald-700', border: 'border-emerald-200', dot: 'bg-emerald-500', Icon: CheckCircle2 },
  failed_75:  { label: 'เฝ้าระวัง',      short: 'Warning', bg: 'bg-amber-50',   text: 'text-amber-700',   border: 'border-amber-200',   dot: 'bg-amber-500',   Icon: AlertTriangle },
  failed_50:  { label: 'ระดับเสี่ยง',    short: 'At Risk', bg: 'bg-orange-50',  text: 'text-orange-700',  border: 'border-orange-200',  dot: 'bg-orange-500',  Icon: AlertOctagon },
  failed_0:   { label: 'ขั้นวิกฤติ',     short: 'Critical',bg: 'bg-rose-50',    text: 'text-rose-700',    border: 'border-rose-200',    dot: 'bg-rose-500',    Icon: XCircle },
  pending:    { label: 'รอข้อมูล',        short: 'Pending', bg: 'bg-slate-50',   text: 'text-slate-400',   border: 'border-slate-200',   dot: 'bg-slate-300',   Icon: Loader2 },
};

/* ─────────────────────────────────────────────────────────────────────────────
   DONUT CHART — SVG inline, ใช้ข้อมูลจริง
───────────────────────────────────────────────────────────────────────────── */
function DonutRing({ percent, color = '#10b981', size = 120, stroke = 11 }) {
  const r = (size - stroke) / 2;
  const circ = 2 * Math.PI * r;
  const dash = (percent / 100) * circ;
  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="-rotate-90">
      <circle cx={size/2} cy={size/2} r={r} fill="none" stroke="#f1f5f9" strokeWidth={stroke} />
      <circle
        cx={size/2} cy={size/2} r={r}
        fill="none"
        stroke={color}
        strokeWidth={stroke}
        strokeDasharray={`${dash} ${circ}`}
        strokeLinecap="round"
        className="transition-all duration-1000 ease-out"
      />
    </svg>
  );
}

/* ═════════════════════════════════════════════════════════════════════════════
   MAIN COMPONENT
═════════════════════════════════════════════════════════════════════════════ */
export default function DashboardOverview() {
  const { data, isLoading, error } = useQuery({
    queryKey: ['overviewData'],
    queryFn: fetchAllDashboards,
    refetchOnWindowFocus: false,
    staleTime: 5 * 60 * 1000
  });

  /* ── Data Processing (ไม่เปลี่ยน logic) ── */
  const { stats } = useMemo(() => {
    if (!data) return { stats: null };
    const [sdgsRaw, healthRaw] = data;
    const allIndicators = [];
    const sdgsStats = { passed: 0, warning: 0, atRisk: 0, critical: 0, pending: 0, total: sdgsRaw.length };

    sdgsRaw.forEach((row) => {
      const status = evaluateSDGStatus(row.current_performance, row.target_2030);
      allIndicators.push({
        id: `sdg-${row.id}`, system: 'SDGs',
        title: row.indicator_name,
        category: row.category || 'ไม่ระบุ',
        target: row.target_2030,
        performance: row.current_performance,
        status: status.raw
      });
      if (status.raw === 'passed_100') sdgsStats.passed++;
      else if (status.raw === 'failed_75') sdgsStats.warning++;
      else if (status.raw === 'failed_50') sdgsStats.atRisk++;
      else if (status.raw === 'failed_0')  sdgsStats.critical++;
      else sdgsStats.pending++;
    });

    const currentQ = getCurrentQuarter();
    const healthGrouped = new Map();
    healthRaw.forEach(row => {
      let title = row.indicator_name;
      if (!title || title === 'ไม่ระบุ') return;
      if (row.is_type_a) title = `[Health] ${title}`;
      if (!healthGrouped.has(title)) healthGrouped.set(title, { title, category: row.kpi_group || 'ไม่ระบุ', rows: [] });
      healthGrouped.get(title).rows.push(row);
    });

    const healthStats = { passed: 0, warning: 0, atRisk: 0, critical: 0, pending: 0, total: healthGrouped.size };
    healthGrouped.forEach((group, title) => {
      let finalPerf = '', finalTarget = '', finalStatus = 'pending';
      const overallRow = group.rows.find(r => {
        const reg = r.region ?? r['เขตฯ'] ?? r['เขต'] ?? r['เขตสุขภาพ'] ?? '';
        return reg.includes('รวม') || reg.includes('ประเทศ') || reg === 'ภาพรวม';
      });
      if (overallRow) {
        const tm = { targetQ1: overallRow.target_q1, targetQ2: overallRow.target_q2, targetQ3: overallRow.target_q3, targetQ4: overallRow.target_q4 };
        finalTarget = tm[currentQ.targetKey] ?? '';
        finalPerf = overallRow.performance ?? '';
        if (finalPerf !== '') finalStatus = evaluateHealthStatus(finalPerf, finalTarget).raw;
      } else {
        const fv = group.rows.find(r => r.target_q1);
        if (fv) {
          const tm = { targetQ1: fv.target_q1, targetQ2: fv.target_q2, targetQ3: fv.target_q3, targetQ4: fv.target_q4 };
          finalTarget = tm[currentQ.targetKey] ?? '';
        }
        let tot = 0, cnt = 0;
        group.rows.forEach(r => { const p = parseFloat(r.performance); if (!isNaN(p)) { tot += p; cnt++; } });
        if (cnt > 0) { finalPerf = (tot / cnt).toFixed(2); finalStatus = evaluateHealthStatus(finalPerf, finalTarget).raw; }
      }
      allIndicators.push({ id: `health-${title}`, system: 'Health KPI', title, category: group.category, target: finalTarget, performance: finalPerf, status: finalStatus });
      if (finalStatus === 'passed_100') healthStats.passed++;
      else if (finalStatus === 'failed_75') healthStats.warning++;
      else if (finalStatus === 'failed_50') healthStats.atRisk++;
      else if (finalStatus === 'failed_0')  healthStats.critical++;
      else healthStats.pending++;
    });

    const totalKPIs    = sdgsStats.total + healthStats.total;
    const totalPassed  = sdgsStats.passed + healthStats.passed;
    const totalWarning = sdgsStats.warning + healthStats.warning;
    const totalAtRisk  = sdgsStats.atRisk + healthStats.atRisk;
    const totalCritical= sdgsStats.critical + healthStats.critical;

    return { stats: { totalKPIs, totalPassed, totalWarning, totalAtRisk, totalCritical, sdgsStats, healthStats, allIndicators } };
  }, [data]);

  const navigate = useNavigate();
  const [showAll, setShowAll] = useState(false);

  /* ── Loading Skeleton ── */
  if (isLoading) {
    return (
      <div className="max-w-7xl mx-auto space-y-6 pb-12 animate-pulse">
        <div className="skeleton h-44 w-full rounded-3xl" />
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 skeleton h-52 rounded-3xl" />
          <div className="skeleton h-52 rounded-3xl" />
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="skeleton h-40 rounded-3xl" />
          <div className="skeleton h-40 rounded-3xl" />
        </div>
        <div className="skeleton h-72 w-full rounded-3xl" />
      </div>
    );
  }

  if (error || !stats) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4 text-rose-500">
        <AlertOctagon size={48} />
        <p className="font-bold text-slate-700">เกิดข้อผิดพลาดในการโหลดข้อมูล</p>
      </div>
    );
  }

  /* ── Derived values (ใช้ข้อมูลจริง) ── */
  const passedPct  = stats.totalKPIs > 0 ? Math.round((stats.totalPassed  / stats.totalKPIs) * 100) : 0;
  const sdgPct     = stats.sdgsStats.total   > 0 ? Math.round((stats.sdgsStats.passed   / stats.sdgsStats.total)   * 100) : 0;
  const healthPct  = stats.healthStats.total  > 0 ? Math.round((stats.healthStats.passed  / stats.healthStats.total)  * 100) : 0;

  const urgentItems   = stats.allIndicators.filter(k => k.status === 'failed_0');
  const warningItems  = stats.allIndicators.filter(k => k.status === 'failed_75' || k.status === 'failed_50');
  const actionItems   = [...urgentItems, ...warningItems];

  const tableItems = showAll
    ? stats.allIndicators
    : stats.allIndicators.filter(k => k.status === 'failed_0' || k.status === 'failed_50' || k.status === 'failed_75');

  /* ── Hero gradient based on overall health ── */
  const heroGradient = passedPct >= 75
    ? 'from-slate-800 via-slate-700 to-slate-900'
    : passedPct >= 50
    ? 'from-slate-800 via-slate-800 to-orange-900'
    : 'from-slate-900 via-rose-950 to-slate-900';

  return (
    <div className="max-w-7xl mx-auto space-y-6 pb-12 fade-in-up">

      {/* ════════════════════════════════════════════════════════════════════
          HERO SECTION — Big number, status summary
      ════════════════════════════════════════════════════════════════════ */}
      <div className={`relative overflow-hidden bg-gradient-to-r ${heroGradient} rounded-3xl p-8 md:p-10 text-white shadow-2xl`}>
        {/* Background texture */}
        <div className="absolute inset-0 opacity-5">
          <div className="absolute inset-0" style={{backgroundImage: 'radial-gradient(circle at 1px 1px, white 1px, transparent 0)', backgroundSize: '32px 32px'}} />
        </div>
        <div className="absolute -right-16 -top-16 w-72 h-72 bg-white/5 rounded-full blur-2xl" />
        <div className="absolute -left-8 -bottom-8 w-48 h-48 bg-white/5 rounded-full blur-2xl" />

        <div className="relative z-10 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-8">
          {/* Left: Main Metric */}
          <div>
            <p className="text-white/50 font-bold uppercase tracking-[0.3em] text-xs mb-2 flex items-center gap-2">
              <Target size={12} /> กองยุทธศาสตร์และแผนงาน กรมควบคุมโรค — ปี 2569
            </p>
            <div className="flex items-end gap-4 mb-3">
              <span className="text-7xl md:text-8xl font-black tracking-tighter tabular-nums leading-none">{passedPct}</span>
              <div className="pb-2">
                <span className="text-3xl font-black text-white/70">%</span>
                <p className="text-white/60 text-sm font-bold uppercase tracking-wider">ภาพรวมการดำเนินงาน</p>
              </div>
            </div>
            <p className="text-white/40 text-sm font-medium">
              บรรลุเป้าหมาย <span className="text-white font-black">{stats.totalPassed}</span> จาก <span className="text-white font-black">{stats.totalKPIs}</span> ตัวชี้วัดทั้งหมด
            </p>
          </div>

          {/* Right: Status Pill Summary */}
          <div className="flex flex-wrap gap-3">
            <div className="flex items-center gap-2.5 bg-emerald-500/20 border border-emerald-400/30 backdrop-blur-sm px-5 py-3 rounded-2xl">
              <CheckCircle2 size={18} className="text-emerald-400" />
              <div>
                <p className="text-2xl font-black text-white tabular-nums leading-none">{stats.totalPassed}</p>
                <p className="text-emerald-300 text-[10px] font-bold uppercase tracking-wider">บรรลุเป้าหมาย</p>
              </div>
            </div>
            <div className="flex items-center gap-2.5 bg-amber-500/20 border border-amber-400/30 backdrop-blur-sm px-5 py-3 rounded-2xl">
              <AlertTriangle size={18} className="text-amber-400" />
              <div>
                <p className="text-2xl font-black text-white tabular-nums leading-none">{stats.totalWarning}</p>
                <p className="text-amber-300 text-[10px] font-bold uppercase tracking-wider">เฝ้าระวัง</p>
              </div>
            </div>
            <div className="flex items-center gap-2.5 bg-orange-500/20 border border-orange-400/30 backdrop-blur-sm px-5 py-3 rounded-2xl">
              <AlertOctagon size={18} className="text-orange-400" />
              <div>
                <p className="text-2xl font-black text-white tabular-nums leading-none">{stats.totalAtRisk}</p>
                <p className="text-orange-300 text-[10px] font-bold uppercase tracking-wider">ระดับเสี่ยง</p>
              </div>
            </div>
            <div className={`flex items-center gap-2.5 border backdrop-blur-sm px-5 py-3 rounded-2xl ${stats.totalCritical > 0 ? 'bg-rose-500/30 border-rose-400/50 pulse-ring-rose' : 'bg-rose-500/10 border-rose-400/20'}`}>
              <XCircle size={18} className="text-rose-400" />
              <div>
                <p className="text-2xl font-black text-white tabular-nums leading-none">{stats.totalCritical}</p>
                <p className="text-rose-300 text-[10px] font-bold uppercase tracking-wider">ขั้นวิกฤติ</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ════════════════════════════════════════════════════════════════════
          BENTO ROW 1 — Urgent Panel + System Health Donut
      ════════════════════════════════════════════════════════════════════ */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* Urgent Action Panel (2/3 width) */}
        <div className="lg:col-span-2 bg-white rounded-3xl border border-rose-100 shadow-md overflow-hidden">
          <div className="flex items-center justify-between px-6 py-4 border-b border-rose-50 bg-rose-50/50">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-rose-100 flex items-center justify-center">
                <AlertOctagon size={18} className="text-rose-600" />
              </div>
              <div>
                <h2 className="font-black text-slate-800 text-sm">รายการที่ต้องเร่งดำเนินการ</h2>
                <p className="text-xs text-slate-400 font-medium">ตัวชี้วัดที่ยังต่ำกว่าเป้าหมาย ({actionItems.length} รายการ)</p>
              </div>
            </div>
          </div>
          <div className="divide-y divide-slate-50">
            {actionItems.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-10 gap-2 text-slate-300">
                <ShieldCheck size={36} />
                <p className="font-bold text-sm">ทุกตัวชี้วัดผ่านเป้าหมาย</p>
              </div>
            ) : (
              actionItems.slice(0, 5).map((kpi, i) => {
                const s = STATUS[kpi.status] || STATUS.pending;
                const rank = i + 1;
                const rankColor = rank === 1 ? 'bg-rose-500' : rank === 2 ? 'bg-orange-500' : rank === 3 ? 'bg-amber-500' : 'bg-slate-300';
                return (
                  <div key={kpi.id} className="flex items-center gap-4 px-6 py-4 hover:bg-slate-50/70 transition-colors group">
                    <span className={`w-7 h-7 rounded-lg ${rankColor} text-white text-xs font-black flex items-center justify-center flex-shrink-0`}>{rank}</span>
                    <div className="flex-1 min-w-0">
                      <p className="font-bold text-slate-700 text-sm truncate group-hover:text-slate-900 transition-colors">{kpi.title}</p>
                      <div className="flex items-center gap-3 mt-0.5">
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{kpi.system}</span>
                        {kpi.target && <span className="text-[10px] text-slate-300">เป้า: {kpi.target}</span>}
                      </div>
                    </div>
                    <div className="flex items-center gap-3 flex-shrink-0">
                      {kpi.performance && (
                        <span className="text-xl font-black text-slate-700 tabular-nums">{kpi.performance}</span>
                      )}
                      <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-xl text-[10px] font-black uppercase tracking-wider border ${s.bg} ${s.text} ${s.border}`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${s.dot}`} />
                        {s.short}
                      </span>
                    </div>
                  </div>
                );
              })
            )}
          </div>
          {actionItems.length > 5 && (
            <div className="px-6 py-3 bg-slate-50 border-t border-slate-100 text-center">
              <p className="text-xs font-bold text-slate-400">และอีก {actionItems.length - 5} รายการ — ดูในตารางสรุปด้านล่าง</p>
            </div>
          )}
        </div>

        {/* System Health Donut (1/3 width) */}
        <div className="bg-white rounded-3xl border border-slate-200 shadow-md p-6 flex flex-col items-center justify-center gap-4">
          <p className="text-xs font-black text-slate-400 uppercase tracking-[0.2em]">System Health</p>
          <div className="relative">
            <DonutRing
              percent={passedPct}
              color={passedPct >= 75 ? '#10b981' : passedPct >= 50 ? '#f97316' : '#f43f5e'}
              size={140}
              stroke={14}
            />
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-4xl font-black text-slate-800 tabular-nums leading-none">{passedPct}</span>
              <span className="text-lg font-black text-slate-400">%</span>
            </div>
          </div>
          <div className="w-full space-y-2">
            {[
              { label: 'บรรลุเป้าหมาย', val: stats.totalPassed,   color: 'bg-emerald-500' },
              { label: 'เฝ้าระวัง',      val: stats.totalWarning,  color: 'bg-amber-400' },
              { label: 'ระดับเสี่ยง',    val: stats.totalAtRisk,   color: 'bg-orange-500' },
              { label: 'ขั้นวิกฤติ',     val: stats.totalCritical, color: 'bg-rose-500' },
            ].map(item => (
              <div key={item.label} className="flex items-center gap-2">
                <span className={`w-2.5 h-2.5 rounded-full flex-shrink-0 ${item.color}`} />
                <span className="text-xs text-slate-500 flex-1">{item.label}</span>
                <span className="text-xs font-black text-slate-700 tabular-nums">{item.val}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ════════════════════════════════════════════════════════════════════
          BENTO ROW 2 — SDGs vs Health KPI Side-by-Side
      ════════════════════════════════════════════════════════════════════ */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

        {/* SDGs Card */}
        <div className="bg-white rounded-3xl border border-slate-200 shadow-md p-6 hover:shadow-lg transition-all hover:border-sky-200 group">
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-sky-100 flex items-center justify-center">
                <Layers size={18} className="text-sky-600" />
              </div>
              <div>
                <h3 className="font-black text-slate-800">เป้าหมายสากล SDGs</h3>
                <p className="text-xs text-slate-400 font-medium">Sustainable Development Goals</p>
              </div>
            </div>
            <button onClick={() => navigate('/sdgs')} className="flex items-center gap-1 text-xs font-bold text-sky-500 hover:text-sky-700 transition-colors mt-1 flex-shrink-0">
              ดูรายละเอียด <ArrowRight size={12} />
            </button>
          </div>

          <div className="flex items-center gap-6 mt-6">
            <div className="relative flex-shrink-0">
              <DonutRing percent={sdgPct} color="#0ea5e9" size={100} stroke={10} />
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-2xl font-black text-slate-800 tabular-nums leading-none">{sdgPct}</span>
                <span className="text-xs font-bold text-slate-400">%</span>
              </div>
            </div>
            <div className="flex-1 grid grid-cols-2 gap-3">
              {[
                { label: 'ทั้งหมด',   val: stats.sdgsStats.total,    color: 'text-slate-700' },
                { label: 'บรรลุเป้า', val: stats.sdgsStats.passed,   color: 'text-emerald-600' },
                { label: 'เฝ้าระวัง', val: stats.sdgsStats.warning,  color: 'text-amber-600' },
                { label: 'วิกฤติ',    val: stats.sdgsStats.critical, color: 'text-rose-600' },
              ].map(item => (
                <div key={item.label} className="bg-slate-50 rounded-2xl p-3 text-center">
                  <p className={`text-2xl font-black tabular-nums ${item.color}`}>{item.val}</p>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mt-0.5">{item.label}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Mini progress bar */}
          <div className="mt-4 h-1.5 bg-slate-100 rounded-full overflow-hidden">
            <div className="h-full bg-sky-500 rounded-full transition-all duration-1000" style={{ width: `${sdgPct}%` }} />
          </div>
        </div>

        {/* Health KPI Card */}
        <div className="bg-white rounded-3xl border border-slate-200 shadow-md p-6 hover:shadow-lg transition-all hover:border-emerald-200 group">
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-100 flex items-center justify-center">
                <BarChart2 size={18} className="text-emerald-600" />
              </div>
              <div>
                <h3 className="font-black text-slate-800">ตัวชี้วัดสาธารณสุข</h3>
                <p className="text-xs text-slate-400 font-medium">Health KPI — ระดับกระทรวง</p>
              </div>
            </div>
            <button onClick={() => navigate('/healthkpi')} className="flex items-center gap-1 text-xs font-bold text-emerald-500 hover:text-emerald-700 transition-colors mt-1 flex-shrink-0">
              ดูรายละเอียด <ArrowRight size={12} />
            </button>
          </div>

          <div className="flex items-center gap-6 mt-6">
            <div className="relative flex-shrink-0">
              <DonutRing percent={healthPct} color="#10b981" size={100} stroke={10} />
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-2xl font-black text-slate-800 tabular-nums leading-none">{healthPct}</span>
                <span className="text-xs font-bold text-slate-400">%</span>
              </div>
            </div>
            <div className="flex-1 grid grid-cols-2 gap-3">
              {[
                { label: 'ทั้งหมด',   val: stats.healthStats.total,    color: 'text-slate-700' },
                { label: 'บรรลุเป้า', val: stats.healthStats.passed,   color: 'text-emerald-600' },
                { label: 'เฝ้าระวัง', val: stats.healthStats.warning,  color: 'text-amber-600' },
                { label: 'วิกฤติ',    val: stats.healthStats.critical, color: 'text-rose-600' },
              ].map(item => (
                <div key={item.label} className="bg-slate-50 rounded-2xl p-3 text-center">
                  <p className={`text-2xl font-black tabular-nums ${item.color}`}>{item.val}</p>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mt-0.5">{item.label}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Mini progress bar */}
          <div className="mt-4 h-1.5 bg-slate-100 rounded-full overflow-hidden">
            <div className="h-full bg-emerald-500 rounded-full transition-all duration-1000" style={{ width: `${healthPct}%` }} />
          </div>
        </div>
      </div>

      {/* ════════════════════════════════════════════════════════════════════
          COMPACT TABLE — Default: Critical/Warning เท่านั้น
      ════════════════════════════════════════════════════════════════════ */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-md overflow-hidden">
        <div className="px-6 py-5 border-b border-slate-100 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-slate-100 flex items-center justify-center">
              <TrendingUp size={16} className="text-slate-600" />
            </div>
            <div>
              <h2 className="font-black text-slate-800 text-sm">สรุปผลตัวชี้วัดทั้งหมด</h2>
              <p className="text-xs text-slate-400 font-medium">
                {showAll ? `แสดงทั้งหมด ${stats.allIndicators.length} รายการ` : `แสดงเฉพาะรายการที่ต้องติดตาม ${tableItems.length} รายการ`}
              </p>
            </div>
          </div>
          <button
            onClick={() => setShowAll(v => !v)}
            className="text-xs font-bold px-4 py-2 rounded-xl border border-slate-200 text-slate-500 hover:bg-slate-50 hover:border-slate-300 transition-all flex items-center gap-1.5"
          >
            {showAll ? 'แสดงเฉพาะรายการสำคัญ' : 'แสดงทั้งหมด'}
            <ArrowRight size={12} className={`transition-transform ${showAll ? 'rotate-180' : ''}`} />
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50/60">
                <th className="px-6 py-3 text-[10px] font-black text-slate-400 uppercase tracking-widest w-24">ระบบ</th>
                <th className="px-6 py-3 text-[10px] font-black text-slate-400 uppercase tracking-widest">ตัวชี้วัด</th>
                <th className="px-6 py-3 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right w-28">ผลงาน</th>
                <th className="px-6 py-3 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right w-28">เป้าหมาย</th>
                <th className="px-6 py-3 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center w-32">สถานะ</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {tableItems.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center">
                    <div className="flex flex-col items-center gap-2 text-slate-300">
                      <ShieldCheck size={32} />
                      <p className="font-bold text-sm">ทุกตัวชี้วัดบรรลุเป้าหมาย</p>
                    </div>
                  </td>
                </tr>
              ) : (
                tableItems.map((kpi, idx) => {
                  const s = STATUS[kpi.status] || STATUS.pending;
                  const Icon = s.Icon;
                  return (
                    <tr key={`${kpi.id}-${idx}`} className="hover:bg-slate-50/60 transition-colors group">
                      <td className="px-6 py-4">
                        <span className={`text-[10px] font-black px-2.5 py-1 rounded-lg uppercase tracking-wide ${kpi.system === 'SDGs' ? 'bg-sky-50 text-sky-600 border border-sky-100' : 'bg-emerald-50 text-emerald-600 border border-emerald-100'}`}>
                          {kpi.system === 'SDGs' ? 'SDGs' : 'Health'}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <p className="font-bold text-slate-700 text-sm leading-tight group-hover:text-slate-900 transition-colors line-clamp-2">{kpi.title}</p>
                        <p className="text-[10px] text-slate-400 mt-0.5 italic">{kpi.category}</p>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <span className={`text-lg font-black tabular-nums ${kpi.performance ? 'text-slate-800' : 'text-slate-300'}`}>
                          {kpi.performance || '—'}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <span className="text-sm font-bold text-slate-400">{kpi.target || '—'}</span>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-wider border ${s.bg} ${s.text} ${s.border}`}>
                          <Icon size={11} />
                          {s.short}
                        </span>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        <div className="px-6 py-3 bg-slate-50 border-t border-slate-100">
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] text-center">
            © 2026 KPI Monitoring System — กองยุทธศาสตร์และแผนงาน กรมควบคุมโรค
          </p>
        </div>
      </div>

    </div>
  );
}
