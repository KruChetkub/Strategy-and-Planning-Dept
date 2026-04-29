import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

const SESSION_KEY = 'kpi_visitor_session';
const SESSION_TTL = 30 * 60 * 1000; // 30 นาที

/**
 * useVisitorCount
 * - นับ Unique Visitor (กัน F5 ซ้ำด้วย Session 30 นาที)
 * - ดึงจำนวนผู้เข้าชมรวมทั้งหมด
 * - แสดงผลในหน้าเว็บได้เลย
 */
export function useVisitorCount() {
  const [totalVisitors, setTotalVisitors] = useState(null);
  const [todayVisitors, setTodayVisitors] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const run = async () => {
      try {
        // ── 1. ตรวจ session ใน localStorage ──
        const stored = JSON.parse(localStorage.getItem(SESSION_KEY) || 'null');
        const now    = Date.now();
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
            page:       window.location.pathname,
          });
        }

        // ── 2. ดึงจำนวนรวมทั้งหมด ──
        const { count: total } = await supabase
          .from('visitor_sessions')
          .select('*', { count: 'exact', head: true });

        // ── 3. ดึงจำนวนวันนี้ ──
        const todayStart = new Date();
        todayStart.setHours(0, 0, 0, 0);

        const { count: today } = await supabase
          .from('visitor_sessions')
          .select('*', { count: 'exact', head: true })
          .gte('visited_at', todayStart.toISOString());

        setTotalVisitors(total ?? 0);
        setTodayVisitors(today ?? 0);
      } catch (err) {
        console.warn('Visitor tracking error:', err.message);
      } finally {
        setIsLoading(false);
      }
    };

    run();
  }, []);

  return { totalVisitors, todayVisitors, isLoading };
}
