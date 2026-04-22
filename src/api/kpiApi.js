import { supabase } from '../lib/supabase';

// Fetch all SDG indicators
export async function fetchSDGIndicators() {
  const { data, error } = await supabase
    .from('sdg_indicators')
    .select('*')
    .order('indicator_name', { ascending: true });
  
  if (error) throw error;
  return data;
}

// Fetch all Health KPI indicators (aggregated or specific)
export async function fetchHealthIndicators() {
  const { data, error } = await supabase
    .from('health_indicators')
    .select('*')
    .order('indicator_name', { ascending: true });
  
  if (error) throw error;
  return data;
}

// Helper: Evaluate status based on performance and target string
export function evaluateKPIStatus(current, targetString) {
  if (current === '' || current === null || current === undefined) {
    return { color: 'text-slate-400', raw: 'pending', text: 'N/A' };
  }
  
  const curVal = parseFloat(current);
  const tStr = String(targetString || '').toLowerCase();
  
  const match = tStr.match(/([\d.]+)/);
  if (!match) return { color: 'text-slate-400', raw: 'pending', text: 'N/A' };
  
  const targetVal = parseFloat(match[1]);
  if (isNaN(curVal) || isNaN(targetVal) || targetVal === 0) {
    return { color: 'text-slate-400', raw: 'pending', text: 'N/A' };
  }
  
  const isLowerBetter = tStr.includes('<') || tStr.includes('≤') || tStr.includes('ลด');
  let percentage = isLowerBetter ? (curVal === 0 ? 100 : (targetVal / curVal) * 100) : (curVal / targetVal) * 100;
  
  if (percentage >= 100) return { color: 'text-emerald-400', raw: 'passed_100', text: 'บรรลุเป้าหมาย' };
  if (percentage >= 75) return { color: 'text-yellow-400', raw: 'failed_75', text: 'เฝ้าระวัง' };
  if (percentage >= 50) return { color: 'text-orange-400', raw: 'failed_50', text: 'เสี่ยง' };
  return { color: 'text-rose-500', raw: 'failed_0', text: 'วิกฤติ' };
}
