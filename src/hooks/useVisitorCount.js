import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

const SESSION_KEY = 'kpi_visitor_session';
const SESSION_TTL = 30 * 60 * 1000; // 30 นาที
const VISITOR_KEY = 'kpi_visitor_id';

function getOrCreateVisitorId() {
  const stored = localStorage.getItem(VISITOR_KEY);
  if (stored) return stored;
  const id = crypto.randomUUID();
  localStorage.setItem(VISITOR_KEY, id);
  return id;
}

function getBangkokDayRangeISO(now = new Date()) {
  // คำนวณวันตามเขตเวลาไทย (UTC+7) แล้วแปลงเป็น UTC ISO สำหรับ query
  const utcMs = now.getTime() + now.getTimezoneOffset() * 60 * 1000;
  const bangkokNow = new Date(utcMs + 7 * 60 * 60 * 1000);
  const y = bangkokNow.getUTCFullYear();
  const m = bangkokNow.getUTCMonth();
  const d = bangkokNow.getUTCDate();

  const bangkokStartUtcMs = Date.UTC(y, m, d, 0, 0, 0) - 7 * 60 * 60 * 1000;
  const bangkokEndUtcMs = bangkokStartUtcMs + 24 * 60 * 60 * 1000;

  return {
    startIso: new Date(bangkokStartUtcMs).toISOString(),
    endIso: new Date(bangkokEndUtcMs).toISOString(),
  };
}

/**
 * useVisitorCount
 * - นับ Unique Visitor (กัน F5 ซ้ำด้วย Session 30 นาที)
 * - ดึงจำนวน session รวม/วันนี้
 * - แสดงผลในหน้าเว็บได้เลย
 */
export function useVisitorCount() {
  const [totalVisitors, setTotalVisitors] = useState(null);
  const [todayVisitors, setTodayVisitors] = useState(null);
  const [metrics, setMetrics] = useState({
    totalSessions: 0,
    todaySessions: 0,
    visitorId: null,
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const run = async () => {
      try {
        const visitorId = getOrCreateVisitorId();

        // ── 1. ตรวจ session ใน localStorage ──
        const stored = JSON.parse(localStorage.getItem(SESSION_KEY) || 'null');
        const now = Date.now();
        const isNewSession = !stored || (now - stored.ts) >= SESSION_TTL;

        if (isNewSession) {
          // สร้าง session ใหม่
          const sessionId = crypto.randomUUID();
          localStorage.setItem(SESSION_KEY, JSON.stringify({
            id: sessionId,
            ts: now,
          }));

          // บันทึกลง Supabase (1 แถว = 1 unique visit)
          await supabase.from('visitor_sessions').insert({
            session_id: sessionId,
            page: window.location.pathname,
          });
        }

        // ── 2. ดึงจำนวนรวมทั้งหมด ──
        const { count: total } = await supabase
          .from('visitor_sessions')
          .select('*', { count: 'exact', head: true });

        // ── 3. ดึงจำนวนวันนี้ ──
        const { startIso, endIso } = getBangkokDayRangeISO();

        const { count: today } = await supabase
          .from('visitor_sessions')
          .select('*', { count: 'exact', head: true })
          .gte('visited_at', startIso)
          .lt('visited_at', endIso);

        setTotalVisitors(total ?? 0);
        setTodayVisitors(today ?? 0);
        setMetrics({
          totalSessions: total ?? 0,
          todaySessions: today ?? 0,
          visitorId,
        });
      } catch (err) {
        console.warn('Visitor tracking error:', err.message);
      } finally {
        setIsLoading(false);
      }
    };

    run();
  }, []);

  return {
    totalVisitors, // backward compatible key
    todayVisitors, // backward compatible key
    isLoading,
    metrics,
  };
}
