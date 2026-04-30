import React, { useMemo, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import {
  Loader2,
  Activity,
  Target,
  CheckCircle2,
  AlertOctagon,
  TrendingUp,
  XCircle,
  ArrowRight,
  AlertTriangle,
  ShieldCheck,
  BarChart2,
  Layers,
  Users,
} from "lucide-react";
import { useVisitorCount } from "../hooks/useVisitorCount";
import { supabase, withSupabaseTimeout } from "../lib/supabase";

/* ─────────────────────────────────────────────────────────────────────────────
   DATA FETCHING & HELPERS — ไม่มีการแก้ไข logic ใดๆ ทั้งสิ้น
───────────────────────────────────────────────────────────────────────────── */
const fetchAllDashboards = async (year, period) => {
  let sdgQuery = supabase
    .from("sdg_indicators")
    .select("*")
    .eq("is_deleted", false);
  let healthQuery = supabase
    .from("health_indicators")
    .select("*")
    .eq("is_deleted", false);

  if (year && year !== "All") {
    sdgQuery = sdgQuery.eq("fiscal_year", year);
    healthQuery = healthQuery.eq("fiscal_year", year);
  }
  if (period && period !== "All") {
    sdgQuery = sdgQuery.eq("period", period);
    healthQuery = healthQuery.eq("period", period);
  }

  const [resSdgs, resHealth] = await Promise.all([
    withSupabaseTimeout(sdgQuery, "SDG dashboard query"),
    withSupabaseTimeout(healthQuery, "Health dashboard query"),
  ]);
  if (resSdgs.error) throw resSdgs.error;
  if (resHealth.error) throw resHealth.error;
  return [resSdgs.data, resHealth.data];
};

const evaluateSDGStatus = (current, target) => {
  if (current === "" || current === null || current === undefined) {
    return { raw: "pending" };
  }

  const curStr = String(current ?? "");
  const curMatch = curStr.match(/([\d.]+)/);
  if (!curMatch && curStr !== "0") return { raw: "pending" };

  const curVal = curMatch ? parseFloat(curMatch[1]) : 0;
  let targetStr = String(target ?? "").toLowerCase();

  if (targetStr.includes("ครึ่งหนึ่ง")) {
    targetStr = targetStr.replace("ครึ่งหนึ่ง", "50");
  }

  const matches = [...targetStr.matchAll(/([\d.]+)(%|ร้อยละ)?/g)];
  let targetVal = 0;

  const percentMatch = matches.find((m) => m[2]);
  if (percentMatch) {
    targetVal = parseFloat(percentMatch[1]);
  } else {
    for (const m of matches) {
      const val = parseFloat(m[1]);
      if ((val >= 2500 && val <= 2600) || (val >= 2000 && val <= 2100))
        continue;
      if (targetStr.startsWith(m[1]) && targetStr.includes(" ")) continue;
      targetVal = val;
    }
  }

  if (isNaN(curVal) || isNaN(targetVal) || targetVal === 0) {
    return { raw: "pending" };
  }

  const hasReductionKeyword =
    targetStr.includes("ลด") || targetStr.includes("ลดลง");
  const hasPercentageKeyword =
    targetStr.includes("ร้อยละ") ||
    targetStr.includes("%") ||
    targetStr.includes("50");

  const isReductionTarget =
    hasReductionKeyword &&
    (hasPercentageKeyword || targetStr.includes("ลงครึ่งหนึ่ง"));
  const isLowerBetter =
    !isReductionTarget &&
    (targetStr.includes("<") ||
      targetStr.includes("≤") ||
      targetStr.includes("ไม่เกิน") ||
      targetStr.includes("น้อยกว่า"));

  let percentage = 0;
  if (isLowerBetter) {
    percentage = curVal === 0 ? 100 : (targetVal / curVal) * 100;
  } else {
    percentage = (curVal / targetVal) * 100;
  }

  if (percentage >= 100) return { raw: "passed_100" };
  if (percentage >= 75) return { raw: "failed_75" };
  if (percentage >= 50) return { raw: "failed_50" };
  return { raw: "failed_0" };
};

const getCurrentQuarter = () => {
  const m = new Date().getMonth() + 1;
  if (m >= 10) return { targetKey: "targetQ1" };
  if (m <= 3) return { targetKey: "targetQ2" };
  if (m <= 6) return { targetKey: "targetQ3" };
  return { targetKey: "targetQ4" };
};

const evaluateHealthStatus = (current, targetString) => {
  if (!current) return { raw: "pending" };
  const curVal = parseFloat(current);
  const tStr = String(targetString || "").toLowerCase();
  const match = tStr.match(/([\d.]+)/);
  if (!match) return { raw: "pending" };
  const targetVal = parseFloat(match[1]);
  if (isNaN(curVal) || isNaN(targetVal) || targetVal === 0)
    return { raw: "pending" };
  const isLowerBetter =
    tStr.includes("<") || tStr.includes("≤") || tStr.includes("ลด");
  let pct = isLowerBetter
    ? curVal === 0
      ? 100
      : (targetVal / curVal) * 100
    : (curVal / targetVal) * 100;
  if (pct >= 100) return { raw: "passed_100" };
  if (pct >= 75) return { raw: "failed_75" };
  if (pct >= 50) return { raw: "failed_50" };
  return { raw: "failed_0" };
};

/* ─────────────────────────────────────────────────────────────────────────────
   STATUS CONFIG — maps status code → visual tokens
───────────────────────────────────────────────────────────────────────────── */
const STATUS = {
  passed_100: {
    label: "บรรลุเป้าหมาย",
    short: "Passed",
    bg: "bg-emerald-50",
    text: "text-emerald-700",
    border: "border-emerald-200",
    dot: "bg-emerald-500",
    Icon: CheckCircle2,
  },
  failed_75: {
    label: "เฝ้าระวัง",
    short: "Warning",
    bg: "bg-amber-50",
    text: "text-amber-700",
    border: "border-amber-200",
    dot: "bg-amber-500",
    Icon: AlertTriangle,
  },
  failed_50: {
    label: "ระดับเสี่ยง",
    short: "At Risk",
    bg: "bg-orange-50",
    text: "text-orange-700",
    border: "border-orange-200",
    dot: "bg-orange-500",
    Icon: AlertOctagon,
  },
  failed_0: {
    label: "ขั้นวิกฤติ",
    short: "Critical",
    bg: "bg-rose-50",
    text: "text-rose-700",
    border: "border-rose-200",
    dot: "bg-rose-500",
    Icon: XCircle,
  },
  pending: {
    label: "รอข้อมูล",
    short: "Pending",
    bg: "bg-slate-50",
    text: "text-slate-400",
    border: "border-slate-200",
    dot: "bg-slate-300",
    Icon: Loader2,
  },
};

/* ─────────────────────────────────────────────────────────────────────────────
   DONUT CHART — SVG inline, ใช้ข้อมูลจริง
───────────────────────────────────────────────────────────────────────────── */
function DonutRing({ percent, color = "#10b981", size = 120, stroke = 11 }) {
  const r = (size - stroke) / 2;
  const circ = 2 * Math.PI * r;
  const dash = (percent / 100) * circ;
  return (
    <svg
      width={size}
      height={size}
      viewBox={`0 0 ${size} ${size}`}
      className="-rotate-90"
    >
      <circle
        cx={size / 2}
        cy={size / 2}
        r={r}
        fill="none"
        stroke="#f1f5f9"
        strokeWidth={stroke}
      />
      <circle
        cx={size / 2}
        cy={size / 2}
        r={r}
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
  const [searchParams, setSearchParams] = useSearchParams();
  const fiscalYear = searchParams.get("year") || "All";
  const period = searchParams.get("period") || "All";

  const setGlobalFilter = (y, p) => {
    setSearchParams({ year: y, period: p });
  };

  const { data, isLoading, error } = useQuery({
    queryKey: ["overviewData", fiscalYear, period],
    queryFn: () => fetchAllDashboards(fiscalYear, period),
    refetchOnWindowFocus: false,
    staleTime: 5 * 60 * 1000,
    retry: 0,
  });

  /* ── Data Processing (ไม่เปลี่ยน logic) ── */
  const { stats } = useMemo(() => {
    if (!data) return { stats: null };
    const [sdgsRaw, healthRaw] = data;
    const allIndicators = [];
    const sdgsStats = {
      passed: 0,
      warning: 0,
      atRisk: 0,
      critical: 0,
      pending: 0,
      total: 0,
      absoluteTotal: sdgsRaw.length,
      reported: 0,
    };

    sdgsRaw.forEach((row) => {
      const hasData =
        row.current_performance !== null &&
        row.current_performance !== undefined &&
        String(row.current_performance).trim() !== "";

      if (hasData) {
        sdgsStats.reported++;
      }

      // Do not skip from calculation, so the total matches the SDGs dashboard (21 total).
      // They will just be evaluated as 'pending' and won't affect the Passed/Warning/Critical counts.

      sdgsStats.total++;

      const status = evaluateSDGStatus(
        row.current_performance,
        row.target_2030,
      );

      allIndicators.push({
        id: `sdg-${row.id}`,
        system: "SDGs",
        title: row.indicator_name,
        originalTitle: row.indicator_name,
        category: row.category || "ไม่ระบุ",
        target: row.target_2030,
        performance: row.current_performance,
        status: status.raw,
      });
      if (status.raw === "passed_100") sdgsStats.passed++;
      else if (status.raw === "failed_75") sdgsStats.warning++;
      else if (status.raw === "failed_50") sdgsStats.atRisk++;
      else if (status.raw === "failed_0") sdgsStats.critical++;
      else sdgsStats.pending++;
    });

    const currentQ = getCurrentQuarter();
    const healthGrouped = new Map();
    healthRaw.forEach((row) => {
      let title = row.indicator_name;
      if (!title || title === "ไม่ระบุ") return;

      const originalTitle = title;
      const subIndicator =
        row.kpi_group && row.kpi_group !== "ALL" && row.kpi_group !== "ไม่ระบุ"
          ? row.kpi_group
          : "";

      let displayTitle = subIndicator ? `${title} — ${subIndicator}` : title;
      let mapKey = displayTitle;

      if (row.is_type_a) {
        displayTitle = `[Health] ${displayTitle}`;
        mapKey = displayTitle;
      }

      if (!healthGrouped.has(mapKey)) {
        healthGrouped.set(mapKey, {
          title: displayTitle,
          originalTitle: originalTitle,
          category: row.kpi_group || "ไม่ระบุ",
          rows: [],
        });
      }
      healthGrouped.get(mapKey).rows.push(row);
    });

    const healthMainIndicators = new Set();
    healthRaw.forEach((row) => {
      if (row.indicator_name && row.indicator_name !== "ไม่ระบุ") {
        healthMainIndicators.add(row.indicator_name);
      }
    });

    const healthMainWithData = new Set();
    const healthStats = {
      passed: 0,
      warning: 0,
      atRisk: 0,
      critical: 0,
      pending: 0,
      total: 0,
      absoluteTotal: healthMainIndicators.size,
      reported: 0,
    };

    healthGrouped.forEach((group, title) => {
      let finalPerf = "",
        finalTarget = "",
        finalStatus = "pending";
      const overallRow = group.rows.find((r) => {
        const reg = r.region ?? r["เขตฯ"] ?? r["เขต"] ?? r["เขตสุขภาพ"] ?? "";
        return (
          reg.includes("รวม") || reg.includes("ประเทศ") || reg === "ภาพรวม"
        );
      });
      if (overallRow) {
        const tm = {
          targetQ1: overallRow.target_q1,
          targetQ2: overallRow.target_q2,
          targetQ3: overallRow.target_q3,
          targetQ4: overallRow.target_q4,
        };
        finalTarget = tm[currentQ.targetKey] ?? "";
        finalPerf = overallRow.performance ?? "";
        if (finalPerf !== "")
          finalStatus = evaluateHealthStatus(finalPerf, finalTarget).raw;
      } else {
        const fv = group.rows.find((r) => r.target_q1);
        if (fv) {
          const tm = {
            targetQ1: fv.target_q1,
            targetQ2: fv.target_q2,
            targetQ3: fv.target_q3,
            targetQ4: fv.target_q4,
          };
          finalTarget = tm[currentQ.targetKey] ?? "";
        }
        let tot = 0,
          cnt = 0;
        group.rows.forEach((r) => {
          const pStr = String(r.performance ?? "").trim();
          const isValidVal =
            pStr !== "" &&
            pStr !== "-" &&
            pStr !== "0" &&
            pStr !== "0.00" &&
            pStr !== "0.0";
          if (isValidVal) {
            const p = parseFloat(r.performance);
            if (!isNaN(p)) {
              tot += p;
              cnt++;
            }
          }
        });
        if (cnt > 0) {
          finalPerf = (tot / cnt).toFixed(2);
          finalStatus = evaluateHealthStatus(finalPerf, finalTarget).raw;
        }
      }

      let groupHasData = false;
      group.rows.forEach((r) => {
        const pStr = String(r.performance ?? "").trim();
        const aStr = String(r.a_value ?? "").trim();
        const bStr = String(r.b_value ?? "").trim();

        // ข้ามค่าว่าง, เครื่องหมาย -, และเลข 0 (เพราะฟอร์มบันทึกค่า default เป็น 0 เมื่อไม่ได้กรอก)
        const isValid = (val) =>
          val !== "" &&
          val !== "-" &&
          val !== "0" &&
          val !== "0.00" &&
          val !== "0.0";

        if (isValid(pStr) || isValid(aStr) || isValid(bStr)) {
          groupHasData = true;
        }
      });

      const hasData = groupHasData;

      if (hasData) {
        healthMainWithData.add(group.originalTitle);
        healthStats.reported = healthMainWithData.size;
      }

      // Do not skip from calculation, so the total matches the Health KPI dashboard.
      // They will just be evaluated as 'pending' and won't affect the Passed/Warning/Critical counts.

      healthStats.total++; // Increment total only for indicators with data

      allIndicators.push({
        id: `health-${title}`,
        system: "Health KPI",
        title,
        originalTitle: group.originalTitle,
        category: group.category,
        target: finalTarget,
        performance: finalPerf,
        status: finalStatus,
      });
      if (finalStatus === "passed_100") healthStats.passed++;
      else if (finalStatus === "failed_75") healthStats.warning++;
      else if (finalStatus === "failed_50") healthStats.atRisk++;
      else if (finalStatus === "failed_0") healthStats.critical++;
      else healthStats.pending++;
    });

    const totalKPIs = sdgsStats.total + healthStats.total;
    const totalPassed = sdgsStats.passed + healthStats.passed;
    const totalWarning = sdgsStats.warning + healthStats.warning;
    const totalAtRisk = sdgsStats.atRisk + healthStats.atRisk;
    const totalCritical = sdgsStats.critical + healthStats.critical;

    return {
      stats: {
        totalKPIs,
        totalPassed,
        totalWarning,
        totalAtRisk,
        totalCritical,
        sdgsStats,
        healthStats,
        allIndicators,
      },
    };
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
        <p className="font-bold text-slate-700">
          เกิดข้อผิดพลาดในการโหลดข้อมูล
        </p>
        {error?.message && (
          <p className="text-sm text-slate-500 text-center max-w-xl">
            {error.message}
          </p>
        )}
      </div>
    );
  }

  /* ── Derived values (ใช้ข้อมูลจริง) ── */
  const passedPct =
    stats.totalKPIs > 0
      ? Math.round((stats.totalPassed / stats.totalKPIs) * 100)
      : 0;
  const sdgPct =
    stats.sdgsStats.total > 0
      ? Math.round((stats.sdgsStats.passed / stats.sdgsStats.total) * 100)
      : 0;
  const healthPct =
    stats.healthStats.total > 0
      ? Math.round((stats.healthStats.passed / stats.healthStats.total) * 100)
      : 0;

  const urgentItems = stats.allIndicators.filter(
    (k) => k.status === "failed_0",
  );
  const warningItems = stats.allIndicators.filter(
    (k) => k.status === "failed_75" || k.status === "failed_50",
  );
  const actionItems = [...urgentItems, ...warningItems];

  const tableItems = showAll
    ? stats.allIndicators
    : stats.allIndicators.filter(
        (k) =>
          k.status === "failed_0" ||
          k.status === "failed_50" ||
          k.status === "failed_75",
      );

  /* ── Hero gradient based on overall health ── */
  const heroGradient =
    passedPct >= 75
      ? "from-slate-800 via-slate-700 to-slate-900"
      : passedPct >= 50
        ? "from-slate-800 via-slate-800 to-orange-900"
        : "from-slate-900 via-rose-950 to-slate-900";

  return (
    <div className="max-w-7xl mx-auto space-y-6 pb-12 fade-in-up">
      {/* ════════════════════════════════════════════════════════════════════
          HERO SECTION — Big number, status summary
      ════════════════════════════════════════════════════════════════════ */}
      <div
        className={`relative overflow-hidden bg-gradient-to-r ${heroGradient} rounded-3xl p-8 md:p-10 text-white shadow-2xl`}
      >
        {/* Background texture */}
        <div className="absolute inset-0 opacity-5">
          <div
            className="absolute inset-0"
            style={{
              backgroundImage:
                "radial-gradient(circle at 1px 1px, white 1px, transparent 0)",
              backgroundSize: "32px 32px",
            }}
          />
        </div>
        <div className="absolute -right-16 -top-16 w-72 h-72 bg-white/5 rounded-full blur-2xl" />
        <div className="absolute -left-8 -bottom-8 w-48 h-48 bg-white/5 rounded-full blur-2xl" />

        <div className="relative z-10 flex flex-col gap-6 w-full">
          {/* Top Row: Title & Filters */}
          <div className="flex flex-wrap items-center gap-4">
            <p className="text-white font-black uppercase tracking-widest text-2xl md:text-3xl flex items-center gap-3">
              <Target size={32} /> กองยุทธศาสตร์และแผนงาน กรมควบคุมโรค
            </p>
            <div className="hidden md:block h-5 w-px bg-white/20"></div>
            <div className="flex items-center gap-2">
              <select
                value={fiscalYear}
                onChange={(e) => setGlobalFilter(e.target.value, period)}
                className="bg-white/10 hover:bg-white/20 transition-colors border border-white/20 text-white rounded-lg px-3 py-1.5 text-xs font-bold outline-none focus:ring-2 focus:ring-white/50 appearance-none cursor-pointer"
              >
                <option value="All" className="text-slate-800">
                  ทุกปีงบประมาณ
                </option>
                {["2567", "2568", "2569", "2570"].map((y) => (
                  <option key={y} value={y} className="text-slate-800">
                    ปี {y}
                  </option>
                ))}
              </select>
              <select
                value={period}
                onChange={(e) => setGlobalFilter(fiscalYear, e.target.value)}
                className="bg-white/10 hover:bg-white/20 transition-colors border border-white/20 text-white rounded-lg px-3 py-1.5 text-xs font-bold outline-none focus:ring-2 focus:ring-white/50 appearance-none cursor-pointer"
              >
                <option value="All" className="text-slate-800">
                  ทุกไตรมาส
                </option>
                <option value="Q1" className="text-slate-800">
                  Q1
                </option>
                <option value="Q2" className="text-slate-800">
                  Q2
                </option>
                <option value="Q3" className="text-slate-800">
                  Q3
                </option>
                <option value="Q4" className="text-slate-800">
                  Q4
                </option>
                <option value="Year-End" className="text-slate-800">
                  Year-End
                </option>
              </select>
            </div>
          </div>

          {/* Bottom Row: Metrics & Pills */}
          <div className="flex flex-col lg:flex-row items-center justify-between gap-6 lg:gap-8 w-full">
            {/* Left: Big Number */}
            <div className="flex items-end gap-4 min-w-max">
              <span className="text-[5.25rem] md:text-[6rem] font-black tracking-wider tabular-nums leading-none">
                {passedPct}
              </span>
              <div className="pb-2">
                <span className="text-[2.1rem] font-black text-white">%</span>
                <p className="text-white text-base font-bold uppercase tracking-wider">
                  ภาพรวมการดำเนินงาน
                </p>
              </div>
            </div>

            {/* Middle: Target Text */}
            <div className="flex-1 flex justify-center text-center">
              <div className="bg-white/5 border border-white/10 px-4 py-3 rounded-2xl backdrop-blur-sm">
                <p className="text-white text-base md:text-lg font-medium tracking-wide">
                  บรรลุเป้าหมาย{" "}
                  <span className="text-white font-black text-lg">
                    {stats.totalPassed}
                  </span>{" "}
                  จาก{" "}
                  <span className="text-white font-black text-lg">
                    {stats.totalKPIs}
                  </span>{" "}
                  ตัวชี้วัดทั้งหมด
                </p>
              </div>
            </div>

            {/* Right: Status Pill Summary */}
            <div className="flex flex-wrap justify-end gap-3 min-w-max">
              <div className="flex items-center gap-2.5 bg-emerald-500/20 border border-emerald-400/30 backdrop-blur-sm px-5 py-3 rounded-2xl">
                <CheckCircle2 size={18} className="text-emerald-400" />
                <div>
                  <p className="text-[1.7rem] font-black text-white tabular-nums leading-none">
                    {stats.totalPassed}
                  </p>
                  <p className="text-white text-xs font-bold uppercase tracking-wider">
                    บรรลุเป้าหมาย
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2.5 bg-amber-500/20 border border-amber-400/30 backdrop-blur-sm px-5 py-3 rounded-2xl">
                <AlertTriangle size={18} className="text-amber-400" />
                <div>
                  <p className="text-[1.7rem] font-black text-white tabular-nums leading-none">
                    {stats.totalWarning}
                  </p>
                  <p className="text-white text-xs font-bold uppercase tracking-wider">
                    เฝ้าระวัง
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2.5 bg-orange-500/20 border border-orange-400/30 backdrop-blur-sm px-5 py-3 rounded-2xl">
                <AlertOctagon size={18} className="text-orange-400" />
                <div>
                  <p className="text-[1.7rem] font-black text-white tabular-nums leading-none">
                    {stats.totalAtRisk}
                  </p>
                  <p className="text-white text-xs font-bold uppercase tracking-wider">
                    ระดับเสี่ยง
                  </p>
                </div>
              </div>
              <div
                className={`flex items-center gap-2.5 border backdrop-blur-sm px-5 py-3 rounded-2xl ${stats.totalCritical > 0 ? "bg-rose-500/30 border-rose-400/50 pulse-ring-rose" : "bg-rose-500/10 border-rose-400/20"}`}
              >
                <XCircle size={18} className="text-rose-400" />
                <div>
                  <p className="text-[1.7rem] font-black text-white tabular-nums leading-none">
                    {stats.totalCritical}
                  </p>
                  <p className="text-white text-xs font-bold uppercase tracking-wider">
                    ขั้นวิกฤติ
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ════════════════════════════════════════════════════════════════════
          BENTO ROW 1 — Urgent Panel
      ════════════════════════════════════════════════════════════════════ */}
      <div className="grid grid-cols-1 gap-6">
        {/* Urgent Action Panel (Full width) */}
        <div className="bg-white rounded-3xl border border-rose-500 shadow-md overflow-hidden">
          <div className="flex items-center justify-between px-6 py-4 border-b border-rose-50 bg-rose-50/50">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-rose-100 flex items-center justify-center">
                <AlertOctagon size={18} className="text-rose-600" />
              </div>
              <div>
                <h2 className="font-black text-slate-950 text-base">
                  รายการที่ต้องเร่งดำเนินการ
                </h2>
                <p className="text-sm text-slate-950 font-medium">
                  ตัวชี้วัดที่ยังต่ำกว่าเป้าหมาย ({actionItems.length} รายการ)
                </p>
              </div>
            </div>
          </div>
          <div className="divide-y divide-slate-50">
            {actionItems.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-10 gap-2 text-slate-300">
                <ShieldCheck size={36} />
                <p className="font-bold text-base text-slate-950">
                  ทุกตัวชี้วัดผ่านเป้าหมาย
                </p>
              </div>
            ) : (
              actionItems.slice(0, 5).map((kpi, i) => {
                const s = STATUS[kpi.status] || STATUS.pending;
                const rank = i + 1;
                const rankColor =
                  rank === 1
                    ? "bg-rose-500"
                    : rank === 2
                      ? "bg-orange-500"
                      : rank === 3
                        ? "bg-amber-500"
                        : "bg-slate-300";
                return (
                  <div
                    key={kpi.id}
                    onClick={() =>
                      navigate(
                        `/${kpi.system === "SDGs" ? "sdgs" : "healthkpi"}?indicator=${encodeURIComponent(kpi.originalTitle)}`,
                      )
                    }
                    className="flex items-center gap-4 px-6 py-4 hover:bg-slate-50/70 transition-colors group cursor-pointer"
                  >
                    <span
                      className={`w-7 h-7 rounded-lg ${rankColor} text-white text-xs font-black flex items-center justify-center flex-shrink-0`}
                    >
                      {rank}
                    </span>
                    <div className="flex-1 min-w-0">
                      <p className="font-bold text-slate-950 text-base truncate group-hover:text-slate-950 transition-colors">
                        {kpi.title}
                      </p>
                      <div className="flex items-center gap-3 mt-0.5">
                        <span className="text-xs font-bold text-slate-950 uppercase tracking-wider">
                          {kpi.system}
                        </span>
                        {kpi.target && (
                          <span className="text-xs text-slate-950">
                            เป้า: {kpi.target}
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-3 flex-shrink-0">
                      {kpi.performance && (
                        <span className="text-[1.4rem] font-black text-slate-950 tabular-nums">
                          {kpi.performance}
                        </span>
                      )}
                      <span
                        className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-xl text-[10px] font-black uppercase tracking-wider border ${s.bg} ${s.text} ${s.border}`}
                      >
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
              <p className="text-xs font-bold text-slate-400">
                และอีก {actionItems.length - 5} รายการ — ดูในตารางสรุปด้านล่าง
              </p>
            </div>
          )}
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
                <h3 className="text-[1.1rem] font-black text-slate-950">
                  ตัวชี้วัดภายใต้แผนการขับเคลื่อนการพัฒนาที่ยั่งยืน
                </h3>
                <h3 className="text-[1.1rem] font-black text-slate-950">
                  SDGs เป้าหมายที่ 3 ในส่วนที่เกี่ยวข้องกับกรมควบคุมโรค
                </h3>
                <p className="text-sm text-slate-950 font-medium">
                  Sustainable Development Goals
                </p>
              </div>
            </div>
            <button
              onClick={() => navigate("/sdgs")}
              className="flex items-center gap-1 text-sm font-bold text-sky-700 hover:text-sky-900 transition-colors mt-1 flex-shrink-0"
            >
              ดูรายละเอียด <ArrowRight size={12} />
            </button>
          </div>

          <div className="flex items-center gap-6 mt-6">
            <div className="relative flex-shrink-0">
              <DonutRing
                percent={sdgPct}
                color="#0ea5e9"
                size={100}
                stroke={10}
              />
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-[1.7rem] font-black text-slate-950 tabular-nums leading-none">
                  {sdgPct}
                </span>
                <span className="text-sm font-bold text-slate-950">%</span>
              </div>
            </div>
            <div className="flex-1 grid grid-cols-2 gap-3">
              {[
                {
                  label: "ทั้งหมด",
                  val: stats.sdgsStats.total,
                  color: "text-slate-700",
                },
                {
                  label: "บรรลุเป้า",
                  val: stats.sdgsStats.passed,
                  color: "text-emerald-600",
                },
                {
                  label: "เฝ้าระวัง",
                  val: stats.sdgsStats.warning,
                  color: "text-amber-600",
                },
                {
                  label: "วิกฤติ",
                  val: stats.sdgsStats.critical,
                  color: "text-rose-600",
                },
              ].map((item) => (
                <div
                  key={item.label}
                  className="bg-slate-50 rounded-2xl p-3 text-center"
                >
                  <p
                    className={`text-[1.7rem] font-black tabular-nums ${item.color}`}
                  >
                    {item.val}
                  </p>
                  <p className="text-xs font-bold text-slate-950 uppercase tracking-wider mt-0.5">
                    {item.label}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Mini progress bar */}
          <div className="mt-4 h-1.5 bg-slate-100 rounded-full overflow-hidden">
            <div
              className="h-full bg-sky-500 rounded-full transition-all duration-1000"
              style={{ width: `${sdgPct}%` }}
            />
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
                <h3 className="text-[1.1rem] font-black text-slate-950">
                  ตัวชี้วัดกระทรวงสาธารณสุข ในส่วนที่เกี่ยวข้อง
                </h3>
                <h3 className="text-[1.1rem] font-black text-slate-950">
                  กับกรมควบคุมโรค
                </h3>

                <p className="text-sm text-slate-950 font-medium">Health KPI</p>
              </div>
            </div>
            <button
              onClick={() => navigate("/healthkpi")}
              className="flex items-center gap-1 text-sm font-bold text-emerald-700 hover:text-emerald-900 transition-colors mt-1 flex-shrink-0"
            >
              ดูรายละเอียด <ArrowRight size={12} />
            </button>
          </div>

          <div className="flex items-center gap-6 mt-6">
            <div className="relative flex-shrink-0">
              <DonutRing
                percent={healthPct}
                color="#10b981"
                size={100}
                stroke={10}
              />
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-[1.7rem] font-black text-slate-950 tabular-nums leading-none">
                  {healthPct}
                </span>
                <span className="text-sm font-bold text-slate-950">%</span>
              </div>
            </div>
            <div className="flex-1 grid grid-cols-2 gap-3">
              {[
                {
                  label: "ทั้งหมด",
                  val: stats.healthStats.total,
                  color: "text-slate-700",
                },
                {
                  label: "บรรลุเป้า",
                  val: stats.healthStats.passed,
                  color: "text-emerald-600",
                },
                {
                  label: "เฝ้าระวัง",
                  val: stats.healthStats.warning,
                  color: "text-amber-600",
                },
                {
                  label: "วิกฤติ",
                  val: stats.healthStats.critical,
                  color: "text-rose-600",
                },
              ].map((item) => (
                <div
                  key={item.label}
                  className="bg-slate-50 rounded-2xl p-3 text-center"
                >
                  <p
                    className={`text-[1.7rem] font-black tabular-nums ${item.color}`}
                  >
                    {item.val}
                  </p>
                  <p className="text-xs font-bold text-slate-950 uppercase tracking-wider mt-0.5">
                    {item.label}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Mini progress bar */}
          <div className="mt-4 h-1.5 bg-slate-100 rounded-full overflow-hidden">
            <div
              className="h-full bg-emerald-500 rounded-full transition-all duration-1000"
              style={{ width: `${healthPct}%` }}
            />
          </div>
        </div>
      </div>

      {/* ════════════════════════════════════════════════════════════════════
          DATA ENTRY COMPLETENESS — Progress Bars
      ════════════════════════════════════════════════════════════════════ */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-2">
        {/* SDGs Progress */}
        <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-200 flex flex-col justify-center relative overflow-hidden group">
          <div className="absolute right-0 top-0 w-32 h-32 bg-sky-50 rounded-bl-full -z-10 group-hover:scale-110 transition-transform duration-500"></div>

          <div className="flex justify-between items-end mb-4">
            <div className="pr-2">
              <p className="text-slate-600 text-[14px] font-bold uppercase tracking-widest mb-1.5 flex items-center gap-1.5">
                <Activity size={11} className="text-sky-500" />{" "}
                สถานะการรายงานตัวชี้วัด SDGs
              </p>
              <h3 className="text-[14px] leading-tight font-black text-slate-800 tracking-tight whitespace-nowrap">
                ความคืบหน้า (SDGs)
              </h3>
            </div>
            <div className="text-right shrink-0">
              <span className="text-3xl font-black text-sky-600">
                {stats.sdgsStats.reported}
              </span>
              <span className="text-sm font-bold text-slate-400 mx-1">/</span>
              <span className="text-lg font-bold text-slate-600">
                {stats.sdgsStats.absoluteTotal}
              </span>
            </div>
          </div>

          <div className="w-full bg-slate-100 rounded-full h-3.5 mb-2 overflow-hidden border border-slate-200/60 shadow-inner">
            <div
              className="bg-gradient-to-r from-sky-400 to-blue-500 h-full rounded-full transition-all duration-1000 ease-out"
              style={{
                width: `${stats.sdgsStats.absoluteTotal > 0 ? (stats.sdgsStats.reported / stats.sdgsStats.absoluteTotal) * 100 : 0}%`,
              }}
            ></div>
          </div>
          <p className="text-right text-[11px] font-black text-slate-500 uppercase tracking-widest">
            {stats.sdgsStats.absoluteTotal > 0
              ? Math.round(
                  (stats.sdgsStats.reported / stats.sdgsStats.absoluteTotal) *
                    100,
                )
              : 0}
            % รายงานผลแล้ว
          </p>
        </div>

        {/* Health KPI Progress */}
        <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-200 flex flex-col justify-center relative overflow-hidden group">
          <div className="absolute right-0 top-0 w-32 h-32 bg-emerald-50 rounded-bl-full -z-10 group-hover:scale-110 transition-transform duration-500"></div>

          <div className="flex justify-between items-end mb-4">
            <div className="pr-2">
              <p className="text-slate-500 text-[14px] font-bold uppercase tracking-widest mb-1.5 flex items-center gap-1.5">
                <Target size={11} className="text-emerald-500" />{" "}
                สถานะการรายงานตัวชี้วัด Health
              </p>
              <h3 className="text-[14px] leading-tight font-black text-slate-800 tracking-tight whitespace-nowrap">
                ความคืบหน้า (Health)
              </h3>
            </div>
            <div className="text-right shrink-0">
              <span className="text-3xl font-black text-emerald-600">
                {stats.healthStats.reported}
              </span>
              <span className="text-sm font-bold text-slate-400 mx-1">/</span>
              <span className="text-lg font-bold text-slate-600">
                {stats.healthStats.absoluteTotal}
              </span>
            </div>
          </div>

          <div className="w-full bg-slate-100 rounded-full h-3.5 mb-2 overflow-hidden border border-slate-200/60 shadow-inner">
            <div
              className="bg-gradient-to-r from-emerald-400 to-teal-500 h-full rounded-full transition-all duration-1000 ease-out"
              style={{
                width: `${stats.healthStats.absoluteTotal > 0 ? (stats.healthStats.reported / stats.healthStats.absoluteTotal) * 100 : 0}%`,
              }}
            ></div>
          </div>
          <p className="text-right text-[11px] font-black text-slate-500 uppercase tracking-widest">
            {stats.healthStats.absoluteTotal > 0
              ? Math.round(
                  (stats.healthStats.reported /
                    stats.healthStats.absoluteTotal) *
                    100,
                )
              : 0}
            % รายงานผลแล้ว
          </p>
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
              <h2 className="font-black text-slate-950 text-base">
                สรุปผลตัวชี้วัดทั้งหมด
              </h2>
              <p className="text-sm text-slate-950 font-medium">
                {showAll
                  ? `แสดงทั้งหมด ${stats.allIndicators.length} รายการ`
                  : `แสดงเฉพาะรายการที่ต้องติดตาม ${tableItems.length} รายการ`}
              </p>
            </div>
          </div>
          <button
            onClick={() => setShowAll((v) => !v)}
            className="text-sm font-bold px-4 py-2 rounded-xl border border-slate-200 text-slate-950 hover:bg-slate-50 hover:border-slate-300 transition-all flex items-center gap-1.5"
          >
            {showAll ? "แสดงเฉพาะรายการสำคัญ" : "แสดงทั้งหมด"}
            <ArrowRight
              size={12}
              className={`transition-transform ${showAll ? "rotate-180" : ""}`}
            />
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50/60">
                <th className="px-6 py-3 text-xs font-black text-slate-950 uppercase tracking-widest w-24">
                  ระบบ
                </th>
                <th className="px-6 py-3 text-xs font-black text-slate-950 uppercase tracking-widest">
                  ตัวชี้วัด
                </th>
                <th className="px-6 py-3 text-xs font-black text-slate-950 uppercase tracking-widest text-right w-28">
                  ผลงาน
                </th>
                <th className="px-6 py-3 text-xs font-black text-slate-950 uppercase tracking-widest text-right w-28">
                  เป้าหมาย
                </th>
                <th className="px-6 py-3 text-xs font-black text-slate-950 uppercase tracking-widest text-center w-32">
                  สถานะ
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {tableItems.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center">
                    <div className="flex flex-col items-center gap-2 text-slate-300">
                      <ShieldCheck size={32} />
                      <p className="font-bold text-base text-slate-950">
                        ทุกตัวชี้วัดบรรลุเป้าหมาย
                      </p>
                    </div>
                  </td>
                </tr>
              ) : (
                tableItems.map((kpi, idx) => {
                  const s = STATUS[kpi.status] || STATUS.pending;
                  const Icon = s.Icon;
                  return (
                    <tr
                      key={`${kpi.id}-${idx}`}
                      onClick={() =>
                        navigate(
                          `/${kpi.system === "SDGs" ? "sdgs" : "healthkpi"}?indicator=${encodeURIComponent(kpi.originalTitle)}`,
                        )
                      }
                      className="hover:bg-slate-50/60 transition-colors group cursor-pointer"
                    >
                      <td className="px-6 py-4">
                        <span
                          className={`text-[10px] font-black px-2.5 py-1 rounded-lg uppercase tracking-wide ${kpi.system === "SDGs" ? "bg-sky-50 text-sky-600 border border-sky-100" : "bg-emerald-50 text-emerald-600 border border-emerald-100"}`}
                        >
                          {kpi.system === "SDGs" ? "SDGs" : "Health"}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <p className="font-bold text-slate-950 text-base leading-tight group-hover:text-slate-950 transition-colors line-clamp-2">
                          {kpi.title}
                        </p>
                        <p className="text-xs text-slate-950 mt-0.5 italic">
                          {kpi.category}
                        </p>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <span
                          className={`text-[1.2rem] font-black tabular-nums ${kpi.performance ? "text-slate-950" : "text-slate-400"}`}
                        >
                          {kpi.performance || "—"}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <span className="text-base font-bold text-slate-950">
                          {kpi.target || "—"}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <span
                          className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-wider border ${s.bg} ${s.text} ${s.border}`}
                        >
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

        <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 flex flex-col md:flex-row items-center justify-between gap-4 rounded-b-3xl">
          <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] text-center md:text-left">
            © 2026 KPI Monitoring System — กองยุทธศาสตร์และแผนงาน กรมควบคุมโรค
          </p>
          <VisitorBadge />
        </div>
      </div>
    </div>
  );
}

function VisitorBadge() {
  const { totalVisitors, todayVisitors, isLoading } = useVisitorCount();
  if (isLoading) return null;
  return (
    <div className="flex items-center gap-3 bg-white border border-slate-200 rounded-xl px-3 py-2 shadow-sm transition-all hover:shadow-md hover:border-violet-200 group cursor-default">
      <div className="w-8 h-8 rounded-lg bg-slate-50 flex items-center justify-center flex-shrink-0 group-hover:bg-violet-50 transition-colors">
        <Users
          size={14}
          className="text-slate-400 group-hover:text-violet-600 transition-colors"
        />
      </div>
      <div className="leading-tight text-left">
        <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest group-hover:text-violet-500 transition-colors">
          ดูสถิติเว็บไซต์
        </p>
        <div className="flex items-baseline gap-2 mt-0.5">
          <span className="text-base font-black text-slate-800 tabular-nums">
            {totalVisitors?.toLocaleString() ?? "—"}
          </span>
          <span className="text-[10px] font-bold text-slate-500 bg-slate-100 border border-slate-200 px-1.5 py-0.5 rounded-md whitespace-nowrap group-hover:bg-violet-50 group-hover:text-violet-600 group-hover:border-violet-100 transition-colors">
            วันนี้ {todayVisitors ?? 0}
          </span>
        </div>
      </div>
    </div>
  );
}
