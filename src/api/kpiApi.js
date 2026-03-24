import { supabase } from '../lib/supabase';

// Fetch all KPIs with their latest targets
export async function fetchKPIs(year) {
  const { data, error } = await supabase
    .from('kpis')
    .select(`
      *,
      kpi_targets(target_value, target_type, note)
    `)
    .eq('is_active', true);
  
  if (error) throw error;
  
  // Clean up data structure
  return data.map(kpi => {
    const targetInfo = kpi.kpi_targets?.find(t => true) || {}; // Take first target
    return {
      ...kpi,
      target_value: targetInfo.target_value,
      target_type: targetInfo.target_type,
      target_note: targetInfo.note
    };
  });
}

// Fetch KPI Results for a specific year and quarter
export async function fetchKPIResults(year, quarter) {
  let query = supabase
    .from('kpi_results')
    .select('*')
    .eq('fiscal_year', year);
    
  if (quarter !== 'YEAR') {
    query = query.eq('quarter', quarter);
  }

  const { data, error } = await query;
  if (error) throw error;
  return data;
}

// Helper to determine status color based on direction
export function getStatusColor(value, target, direction = 'higher_is_better') {
  if (value === null || value === undefined || target === null || target === undefined) {
    return { color: 'bg-slate-100 text-slate-500 border-slate-200', text: 'N/A' };
  }

  const ratio = (value / target) * 100;
  
  if (direction === 'lower_is_better') {
    if (value <= target) return { color: 'bg-emerald-100 text-emerald-700 border-emerald-200', text: 'ผ่าน' };
    if (ratio <= 120) return { color: 'bg-amber-100 text-amber-700 border-amber-200', text: 'เสี่ยง' }; // Within 20% over target
    return { color: 'bg-rose-100 text-rose-700 border-rose-200', text: 'ไม่ผ่าน' };
  } else {
    if (ratio >= 100) return { color: 'bg-emerald-100 text-emerald-700 border-emerald-200', text: 'ผ่าน' };
    if (ratio >= 80) return { color: 'bg-amber-100 text-amber-700 border-amber-200', text: 'เสี่ยง' };
    return { color: 'bg-rose-100 text-rose-700 border-rose-200', text: 'ไม่ผ่าน' };
  }
}
