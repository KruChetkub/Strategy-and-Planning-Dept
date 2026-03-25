import React, { useState } from 'react';
import { FileSpreadsheet, Loader2, CheckCircle, AlertCircle } from 'lucide-react';

export default function DataEntry() {
  const [loading, setLoading] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [error, setError] = useState(null);

  const [formData, setFormData] = useState({
    category: 'SDGs',         // หมวดหมู่ (ล็อคค่าคงที่)
    orderNo: '',              // ลำดับ
    subTarget: '',            // เป้าหมายย่อยที่
    indicatorName: '',        // ชื่อตัวชี้วัด
    target2030: '',           // เป้าหมาย SDG ปี 2573
    unit: '',                 // หน่วยวัด
    currentPerformance: '',   // ผลการดำเนินงานปัจจุบัน (68)
    agency: '',               // หน่วยงานที่รับผิดชอบ
    year: '2568',             // ปีที่รายงาน (Default is current year)
    note: ''                  // หมายเหตุ
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setLoading(true);

    try {
      const isProd = import.meta.env.PROD;
      const targetUrl = isProd ? '/api/kpi' : import.meta.env.VITE_GOOGLE_SCRIPT_URL;
      
      const fetchOptions = {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ ...formData, sheetName: 'SDGs' }) 
      };
      
      if (!isProd) fetchOptions.mode = 'no-cors';
      
      const response = await fetch(targetUrl, fetchOptions);

      setShowSuccessModal(true);
      
      // ล้างฟอร์ม (เก็บ Category, Agency, Year ไว้ใช้บันทึกซ้ำ)
      setFormData({
        ...formData, subTarget: '', indicatorName: '', target2030: '', 
        unit: '', currentPerformance: '', note: ''
      });

    } catch (error) {
      console.error(error);
      setError('เกิดข้อผิดพลาดในการเชื่อมต่อกรุณาลองใหม่อีกครั้ง');
    } finally {
      setLoading(false);
    }
  };

  const inputClass = "w-full bg-slate-50 border border-slate-200 rounded-lg px-4 py-2.5 outline-none text-slate-800 focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 transition-all placeholder:text-slate-400 font-medium";
  const labelClass = "block text-sm font-bold text-slate-700";

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-10">
      <div className="flex items-center gap-4">
        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-cyan-500/20 to-blue-600/20 border border-cyan-500/30 flex items-center justify-center">
          <FileSpreadsheet className="text-cyan-400" size={24} />
        </div>
        <div>
          <h1 className="text-3xl font-black text-slate-800 tracking-tight">
            ตัวชี้วัดการขับเคลื่อนการพัฒนาที่ยั่งยืน (SDGs)
          </h1>
          <p className="text-slate-500 font-medium text-sm mt-1">ฟอร์มบันทึกผลการดำเนินงานตัวชี้วัด SDGs กองยุทธศาสตร์และแผนงาน</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="bg-white border border-slate-200 rounded-2xl p-8 shadow-sm relative overflow-hidden space-y-8">
        
        {/* Decorative glow inside form */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-sky-100/50 rounded-full blur-[80px] pointer-events-none" />


        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-6 relative z-10">
          
          <div className="space-y-2">
            <label className={labelClass}>เป้าหมายย่อยที่</label>
            <input type="text" name="subTarget" required value={formData.subTarget} onChange={handleChange} placeholder="เช่น 3.3" className={inputClass}/>
          </div>

          <div className="space-y-2 md:col-span-2">
            <label className={labelClass}>ชื่อตัวชี้วัด</label>
            <textarea name="indicatorName" required value={formData.indicatorName} onChange={handleChange} rows="2" placeholder="ชื่อตัวชี้วัดฉบับเต็ม" className={inputClass} />
          </div>

          <div className="space-y-2">
            <label className={labelClass}>เป้าหมาย SDG ปี 2573</label>
            <input type="text" name="target2030" required value={formData.target2030} onChange={handleChange} placeholder="เช่น ≤ 0.2, ลดลงร้อยละ 10" className={inputClass}/>
          </div>

          <div className="space-y-2">
            <label className={labelClass}>หน่วยวัด</label>
            <input type="text" name="unit" required value={formData.unit} onChange={handleChange} placeholder="เช่น คน" className={inputClass}/>
          </div>

          <div className="space-y-2">
            <label className={labelClass}>ผลการดำเนินงานปัจจุบัน</label>
            <input type="text" name="currentPerformance" value={formData.currentPerformance} onChange={handleChange} placeholder="ตัวเลขผลการดำเนินงาน" className={inputClass}/>
          </div>

          <div className="space-y-2">
            <label className={labelClass}>หน่วยงานที่รับผิดชอบ</label>
            <input type="text" name="agency" required value={formData.agency} onChange={handleChange} placeholder="ชื่อกอง หรือ ศูนย์" className={inputClass}/>
          </div>

          <div className="space-y-2">
            <label className={labelClass}>ปีที่รายงาน (พ.ศ.)</label>
            <input type="text" name="year" required value={formData.year} onChange={handleChange} placeholder="เช่น 2568" className={inputClass}/>
          </div>


          <div className="space-y-2">
            <label className={labelClass}>หมายเหตุ</label>
            <input type="text" name="note" value={formData.note} onChange={handleChange} placeholder="คำอธิบายเพิ่มเติม" className={inputClass}/>
          </div>
        </div>

        <div className="pt-6 border-t border-slate-100 flex justify-end gap-3 relative z-10">
          <button 
            type="button" 
            onClick={() => setFormData({...formData, orderNo: '', subTarget: '', indicatorName: '', target2030: '', unit: '', currentPerformance: '', note: ''})}
            className="px-6 py-2.5 rounded-lg text-sm font-bold text-slate-500 hover:text-slate-800 hover:bg-slate-100 transition-all border border-transparent hover:border-slate-200"
          >
            ล้างข้อมูล
          </button>
          <button 
            type="submit" 
            disabled={loading}
            className="px-8 py-2.5 rounded-lg text-sm font-bold text-white bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-400 hover:to-blue-500 shadow-md hover:shadow-lg transition-all flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? <Loader2 className="animate-spin" size={18} /> : 'บันทึกข้อมูล (Save)'}
          </button>
        </div>
      </form>

      {/* SUCCESS MODAL (Premium UI) */}
      {showSuccessModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-300" onClick={() => setShowSuccessModal(false)} />
          <div className="bg-white rounded-3xl p-8 shadow-2xl max-w-sm w-full relative z-10 border border-slate-100 animate-in zoom-in-95 duration-300 flex flex-col items-center text-center">
            <div className="w-20 h-20 bg-emerald-50 rounded-full flex items-center justify-center mb-6 border border-emerald-100 shadow-inner">
               <CheckCircle className="text-emerald-500 animate-bounce" size={42} />
            </div>
            <h2 className="text-2xl font-black text-slate-800 mb-2 tracking-tight">บันทึกสำเร็จ!</h2>
            <p className="text-slate-500 font-medium mb-8 leading-relaxed">
              เราได้บันทึกข้อมูลตัวชี้วัดเข้าสู่ฐานข้อมูลเรียบร้อยแล้ว <br/> 
              <span className="text-emerald-600 font-bold">พร้อมสำหรับการกรอกข้อต่อไป</span>
            </p>
            <button 
              onClick={() => setShowSuccessModal(false)}
              className="w-full py-3.5 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-2xl transition-all shadow-lg hover:shadow-xl active:scale-95"
            >
              ตกลง (เข้าใจแล้ว)
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
               <AlertCircle className="text-rose-500" size={42} />
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
