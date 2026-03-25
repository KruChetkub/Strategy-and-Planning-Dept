import React, { useState } from 'react';
import { Activity, Loader2, Target, CheckCircle2, XCircle, Save } from 'lucide-react';

export default function DataEntryHealth() {
  const [loading, setLoading] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [error, setError] = useState(null);
  const [saveMode, setSaveMode] = useState('next'); // 'next' or 'new'

  const [formData, setFormData] = useState({
    indicatorName: '',       // ชื่อตัวชี้วัด
    subIndicatorName: '',    // ชื่อตัวชี้วัดย่อย
    region: '',              // เขตฯ
    A: '',                   // ประชากร A (ตัวตั้ง)
    B: '',                   // ประชากร B (ตัวหาร)
    performance: '',         // ผลงาน
    targetQ1: '>= 50.00',    // เป้าหมาย Q1
    targetQ2: '>= 50.00',    // เป้าหมาย Q2
    targetQ3: '>= 60.00',    // เป้าหมาย Q3
    targetQ4: '>= 70.00'     // เป้าหมาย Q4
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    const isProd = import.meta.env.PROD;
    const targetUrl = isProd ? '/api/kpi' : import.meta.env.VITE_GOOGLE_SCRIPT_URL;

    try {
      const fetchOptions = {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...formData, sheetName: 'Health_KPI' })
      };
      
      if (!isProd) fetchOptions.mode = 'no-cors';

      await fetch(targetUrl, fetchOptions);

      setShowSuccessModal(true);
      
      if (saveMode === 'new') {
        // ล้างทุกอย่าง เริ่มตัวชี้วัดใหม่หมดเลย
        setFormData({
          indicatorName: '', subIndicatorName: '', region: '',
          A: '', B: '', performance: '',
          targetQ1: '>= 50.00', targetQ2: '>= 50.00', targetQ3: '>= 60.00', targetQ4: '>= 70.00'
        });
      } else {
        // โหมด Save & Next: เก็บชื่อตัวชี้วัดและเป้าหมายไว้ แต่ล้าง "เขต" และ "ตัวเลขผลงาน" เพื่อให้ไปลุยเขตอื่นต่อ
        setFormData({
          ...formData, 
          region: '',
          A: '', 
          B: '', 
          performance: ''
        });
      }

    } catch (error) {
      console.error(error);
      setError('เกิดข้อผิดพลาดในการเชื่อมต่อกรุณาลองใหม่อีกครั้ง');
    } finally {
      setLoading(false);
    }
  };

  const inputClass = "w-full bg-white border border-slate-300 rounded-lg px-4 py-2.5 outline-none text-slate-800 focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500 transition-all placeholder:text-slate-400 shadow-sm";
  const labelClass = "block text-sm font-bold text-emerald-800 mb-1.5";

  // ฟังก์ชันคำนวณไตรมาสอิงตามปีงบประมาณไทยปัจจุบัน
  const getCurrentQuarter = () => {
    const month = new Date().getMonth() + 1; // 1-12
    if (month >= 10 && month <= 12) return { id: 'Q1', targetKey: 'targetQ1', name: 'ไตรมาส 1 (ต.ค. - ธ.ค.)' };
    if (month >= 1 && month <= 3) return { id: 'Q2', targetKey: 'targetQ2', name: 'ไตรมาส 2 (ม.ค. - มี.ค.)' };
    if (month >= 4 && month <= 6) return { id: 'Q3', targetKey: 'targetQ3', name: 'ไตรมาส 3 (เม.ย. - มิ.ย.)' };
    return { id: 'Q4', targetKey: 'targetQ4', name: 'ไตรมาส 4 (ก.ค. - ก.ย.)' };
  };

  // ฟังก์ชันช่วยคำนวณและพรีวิวสถานะเทียบกับเป้าหมาย Q ปัจจุบันอัตโนมัติ
  const evaluatePreview = () => {
    if (!formData.performance) return null;
    const perf = parseFloat(formData.performance);
    if (isNaN(perf)) return null;
    
    // ดึง Quarter ปัจจุบันอัตโนมัติ
    const currentQ = getCurrentQuarter();
    const targetString = String(formData[currentQ.targetKey] || '');
    
    // แยกเฉพาะตัวเลขจากช่อง Target
    const targetMatch = targetString.match(/([\d.]+)/); 
    if (!targetMatch) return null;
    
    const targetVal = parseFloat(targetMatch[1]);
    if (isNaN(targetVal)) return null;
    
    // เช็คว่าโลจิกคือ "ค่าน้อยยิ่งดี" หรือไม่
    const isLowerBetter = targetString.includes('<') || targetString.includes('≤') || targetString.includes('ลด') || targetString.includes('ไม่เกิน') || targetString.includes('น้อยกว่า');
  
    let passed = false;
    if (isLowerBetter) {
      passed = perf <= targetVal;
    } else {
      passed = perf >= targetVal;
    }
    
    return (
      <div className={`mt-3 flex flex-col gap-1.5`}>
        <div className="text-xs text-emerald-600 font-medium flex items-center gap-1">📍 ประเมินผลอัตโนมัติสำหรับ: <span className="text-slate-800 font-bold">{currentQ.name}</span></div>
        <div className={`flex items-center gap-2 text-sm font-bold px-3 py-1.5 rounded-lg w-fit border shadow-sm ${passed ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-rose-50 text-rose-600 border-rose-200'}`}>
          {passed ? <CheckCircle2 size={16} /> : <XCircle size={16} />}
          {passed ? `ยอดเยี่ยม: ผลงานผ่านเป้าหมาย ${currentQ.id} (${targetString})` : `ความเสี่ยง: ผลงานยังไม่ผ่านเป้าหมาย ${currentQ.id} (${targetString})`}
        </div>
      </div>
    );
  };

  return (
    <div className="max-w-5xl mx-auto space-y-8 pb-10">
      <div className="flex items-center gap-4">
        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-emerald-100 to-teal-100 border border-emerald-200 flex items-center justify-center shadow-md">
          <Activity className="text-emerald-600" size={24} />
        </div>
        <div>
          <h1 className="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-emerald-600 to-teal-600 tracking-tight">
            Health KPI Entry
          </h1>
          <p className="text-slate-500 text-sm mt-1 font-medium">บันทึกข้อมูลตัวชี้วัดรายเขตสุขภาพ (Health KPI) ฐานข้อมูลแยก</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="bg-white border border-slate-200 rounded-3xl p-8 shadow-xl relative overflow-hidden space-y-8">
        
        {/* Decorative background glow */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-500/5 rounded-full blur-[100px] pointer-events-none" />


        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 relative z-10">
          
          {/* ข้อมูลทั่วไป */}
          <div className="lg:col-span-3 pb-2 border-b border-slate-200">
             <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2"><Target size={18} className="text-emerald-600"/> General Information</h2>
          </div>

          <div className="space-y-2 lg:col-span-2">
            <label className={labelClass}>ชื่อตัวชี้วัดหลัก</label>
            <input type="text" name="indicatorName" required value={formData.indicatorName} onChange={handleChange} placeholder="เช่น อัตราความสำเร็จการรักษาวัณโรค..." className={inputClass}/>
          </div>

          <div className="space-y-2">
            <label className={labelClass}>เขตสุขภาพ (Region)</label>
            <select name="region" required value={formData.region} onChange={handleChange} className={`${inputClass} appearance-none cursor-pointer font-bold text-emerald-800`}>
              <option value="" className="bg-white">-- เลือกเขตฯ --</option>
              <option value="รายงานภาพรวม" className="bg-white text-emerald-600 font-black">- รายงานภาพรวม</option>
              {[...Array(13)].map((_, i) => (
                <option key={i} value={`เขตฯ ${i+1}`} className="bg-white">เขตสุขภาพที่ {i+1}</option>
              ))}
            </select>
          </div>

          <div className="space-y-2 lg:col-span-3">
            <label className={labelClass}>ชื่อตัวชี้วัดย่อย</label>
            <input type="text" name="subIndicatorName" value={formData.subIndicatorName} onChange={handleChange} placeholder="เช่น กลุ่มประชากรเสี่ยง หรือ กิจกรรมย่อย" className={inputClass}/>
          </div>
          
          {/* ส่วนเป้าหมายรายไตรมาส */}
          <div className="lg:col-span-3 pb-2 border-b border-slate-200 mt-4">
             <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2"><Activity size={18} className="text-amber-500"/> Quarterly Targets (ค่าเป้าหมาย)</h2>
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-bold text-amber-700 mb-1.5">ไตรมาส 1 (Q1)</label>
            <input type="text" name="targetQ1" required value={formData.targetQ1} onChange={handleChange} className="w-full bg-amber-50/50 border border-amber-200 rounded-lg px-4 py-2.5 outline-none text-amber-900 focus:ring-1 focus:ring-amber-500 transition-all shadow-sm"/>
          </div>
          
          <div className="space-y-2">
            <label className="block text-sm font-bold text-amber-700 mb-1.5">ไตรมาส 2 (Q2)</label>
            <input type="text" name="targetQ2" required value={formData.targetQ2} onChange={handleChange} className="w-full bg-amber-50/50 border border-amber-200 rounded-lg px-4 py-2.5 outline-none text-amber-900 focus:ring-1 focus:ring-amber-500 transition-all shadow-sm"/>
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-bold text-amber-700 mb-1.5">ไตรมาส 3 (Q3)</label>
            <input type="text" name="targetQ3" required value={formData.targetQ3} onChange={handleChange} className="w-full bg-amber-50/50 border border-amber-200 rounded-lg px-4 py-2.5 outline-none text-amber-900 focus:ring-1 focus:ring-amber-500 transition-all shadow-sm"/>
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-bold text-amber-700 mb-1.5">ไตรมาส 4 (Q4)</label>
            <input type="text" name="targetQ4" required value={formData.targetQ4} onChange={handleChange} className="w-full bg-amber-50/50 border border-amber-200 rounded-lg px-4 py-2.5 outline-none text-amber-900 focus:ring-1 focus:ring-amber-500 transition-all shadow-sm"/>
          </div>

          <div className="lg:col-span-2"></div>

          {/* ข้อมูลประชากร & ผลงาน */}
          <div className="lg:col-span-3 pb-2 border-b border-slate-200 mt-4">
             <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2"><CheckCircle2 size={18} className="text-blue-500"/> Results & Demographics (ผลงานและประชากร)</h2>
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-bold text-blue-700 mb-1.5">ประชากร A</label>
            <input type="number" name="A" value={formData.A} onChange={handleChange} placeholder="ระบุจำนวนคน" className="w-full bg-blue-50/50 border border-blue-200 rounded-lg px-4 py-2.5 outline-none text-blue-900 focus:ring-1 focus:ring-blue-500 transition-all shadow-sm"/>
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-bold text-blue-700 mb-1.5">ประชากร B</label>
            <input type="number" name="B" value={formData.B} onChange={handleChange} placeholder="ระบุจำนวนคน" className="w-full bg-blue-50/50 border border-blue-200 rounded-lg px-4 py-2.5 outline-none text-blue-900 focus:ring-1 focus:ring-blue-500 transition-all shadow-sm"/>
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-bold text-emerald-700 mb-1.5">ผลงาน (Performance)</label>
            <input type="number" step="0.01" name="performance" required value={formData.performance} onChange={handleChange} placeholder="ผลงานที่ทำได้" className="w-full bg-emerald-50/50 border border-emerald-300 rounded-lg px-4 py-2.5 outline-none text-slate-900 font-bold focus:ring-2 focus:ring-emerald-500 transition-all shadow-sm"/>
            {evaluatePreview()}
          </div>
          
        </div>

        <div className="pt-8 border-t border-slate-200 flex flex-col sm:flex-row justify-end gap-4 relative z-10 p-2">
          <button 
            type="submit" 
            disabled={loading}
            onClick={() => setSaveMode('new')}
            className="px-6 py-3.5 rounded-xl text-sm font-bold text-slate-600 bg-white hover:bg-slate-50 hover:text-slate-800 border border-slate-300 transition-all flex items-center justify-center gap-2 disabled:opacity-50 shadow-sm"
          >
            {loading && saveMode === 'new' ? <Loader2 className="animate-spin" size={18} /> : <Activity size={18} />}
            บันทึก & เริ่มตัวชี้วัดใหม่หมด
          </button>

          <button 
            type="submit" 
            disabled={loading}
            onClick={() => setSaveMode('next')}
            className="px-8 py-3.5 rounded-xl text-sm font-bold text-white bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 disabled:opacity-50 group flex-1 sm:max-w-xs"
          >
            {loading && saveMode === 'next' ? <Loader2 className="animate-spin" size={18} /> : <Save size={18} className="group-hover:scale-110 transition-transform" />}
            บันทึก & กรอกเขตถัดไปต่อเลย
          </button>
        </div>
      </form>

      {/* SUCCESS MODAL (Premium UI) */}
      {showSuccessModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-emerald-950/20 backdrop-blur-md animate-in fade-in duration-300" onClick={() => setShowSuccessModal(false)} />
          <div className="bg-white rounded-[2.5rem] p-10 shadow-2xl max-w-sm w-full relative z-10 border border-emerald-100 animate-in zoom-in-95 duration-300 flex flex-col items-center text-center">
            <div className="w-24 h-24 bg-emerald-50 rounded-full flex items-center justify-center mb-8 border border-emerald-100 shadow-inner relative">
               <div className="absolute inset-0 rounded-full animate-ping bg-emerald-100 opacity-20"></div>
               <CheckCircle2 className="text-emerald-500 relative z-10" size={56} />
            </div>
            <h2 className="text-3xl font-black text-slate-800 mb-3 tracking-tight">บันทึกสำเร็จ!</h2>
            <p className="text-slate-500 font-medium mb-10 leading-relaxed">
              อัปเดตข้อมูล <span className="text-emerald-600 font-bold">Health KPI</span> เรียบร้อยแล้วครับ ระบบพร้อมสำหรับการบันทึกข้อมูลลำดับถัดไป
            </p>
            <button 
              onClick={() => setShowSuccessModal(false)}
              className="w-full py-4 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-black rounded-2xl transition-all shadow-lg hover:shadow-xl active:scale-95 tracking-wide"
            >
              ตกลง (ลุยต่อ)
            </button>
          </div>
        </div>
      )}

      {/* ERROR MODAL */}
      {error && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-300" onClick={() => setError(null)} />
          <div className="bg-white rounded-3xl p-8 shadow-2xl max-w-sm w-full relative z-10 border border-slate-100 animate-in zoom-in-95 duration-300 flex flex-col items-center text-center">
            <div className="w-20 h-20 bg-rose-50 rounded-full flex items-center justify-center mb-6 border border-rose-100 shadow-inner">
               <XCircle className="text-rose-500" size={42} />
            </div>
            <h2 className="text-2xl font-black text-slate-800 mb-2 tracking-tight">เกิดข้อผิดพลาด!</h2>
            <p className="text-slate-500 font-medium mb-8 leading-relaxed">
              {error}
            </p>
            <button 
              onClick={() => setError(null)}
              className="w-full py-3.5 bg-rose-500 hover:bg-rose-600 text-white font-bold rounded-2xl transition-all shadow-lg hover:shadow-xl active:scale-95"
            >
              ลองใหม่อีกครั้ง
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
