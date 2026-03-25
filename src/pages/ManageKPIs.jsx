import React, { useState } from 'react';
import { UploadCloud, Loader2, Table, CheckCircle } from 'lucide-react';

export default function ManageKPIs() {
  const [loading, setLoading] = useState(false);
  const [successCount, setSuccessCount] = useState(0);
  const [pastedData, setPastedData] = useState('');
  
  // แปลงเนื้อหาที่ก๊อปปี้จาก Excel (Tab-separated) มาเป็น Array of Objects 7 คอลัมน์
  const handleImport = async () => {
    if (!pastedData.trim()) {
      alert("กรุณาวางข้อมูลจาก Excel ก่อนครับ");
      return;
    }
    
    // ตัดบรรทัดว่างออก และแบ่งด้วยการขึ้นบรรทัดใหม่
    const rows = pastedData.trim().split('\n');
    const parsedData = rows.map(row => {
      // Excel เวลา Copy มาวางจะคั่นแต่ละคอลัมน์ด้วย Tab (\t)
      const cols = row.split('\t'); 
      return {
        orderNo: cols[0] || '',
        subTarget: cols[1] || '',
        indicatorName: cols[2] || '',
        target2030: cols[3] || '',
        unit: cols[4] || '',
        currentPerformance: cols[5] || '',
        note: cols[6] || ''
      };
    }).filter(item => item.indicatorName?.trim() !== ''); // ป้องกันแถวขยะที่ไม่มีชื่อตัวชี้วัด

    if (parsedData.length === 0) {
       alert("ไม่พบข้อมูลที่อ่านได้ กรุณาตรวจสอบการคัดลอกอีกครั้ง");
       return;
    }

    setLoading(true);
    setSuccessCount(0);

    try {
      const isProd = import.meta.env.PROD;
      const targetUrl = isProd ? '/api/kpi' : import.meta.env.VITE_GOOGLE_SCRIPT_URL;
      
      const fetchOptions = {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(parsedData)
      };
      
      if (!isProd) fetchOptions.mode = 'no-cors';

      // ส่งข้อมูลทั้ง Array ไปทีเดียว
      await fetch(targetUrl, fetchOptions);

      setSuccessCount(parsedData.length);
      setPastedData(''); // ล้างหน้าจอ
      alert(`นำเข้าข้อมูล 7 หัวข้อ สำเร็จจำนวน ${parsedData.length} แถว สู่ Google Sheets เรียบร้อยแล้ว!`);

    } catch (error) {
      console.error(error);
      alert('เกิดข้อผิดพลาดในการเชื่อมต่อ กรุณาลองใหม่');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-10">
      <div>
        <h1 className="text-2xl font-bold text-slate-800 tracking-tight flex items-center gap-2">
          <Table className="text-blue-500" />
          นำเข้าข้อมูลจำนวนมากจาก Excel
        </h1>
        <p className="text-slate-500 text-sm mt-1">
          เนื่องจากเราเปลี่ยนมาใช้ตาราง Google Sheets คุณสามารถจัดการนำเข้าตัวชี้วัดจำนวนหลายสิบข้อ ได้โดยแค่ก๊อปปี้จากตาราง Excel มาวางที่นี่
        </p>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden p-6 space-y-4">
        
        {successCount > 0 && (
           <div className="bg-emerald-50 text-emerald-700 p-4 rounded-lg flex items-center gap-2 font-medium">
             <CheckCircle size={20}/> นำเข้าข้อมูลรอบล่าสุดสำเร็จ {successCount} แถว
           </div>
        )}

        <div className="bg-blue-50 border border-blue-100 rounded-lg p-4 text-sm text-blue-800 space-y-2">
          <p className="font-bold">✨ ขั้นตอนการนำเข้าข้อมูล (Copy & Paste):</p>
          <ul className="list-decimal list-inside space-y-1 ml-2 text-slate-700">
            <li>เปิดไฟล์ Excel หรือ Google Sheets ต้นฉบับของคุณ</li>
            <li>ลากคุมตารางเฉพาะข้อมูล <b>7 คอลัมน์ที่กำหนดเป๊ะๆ</b> (ลำดับ, เป้าหมายย่อย, ชื่อตัวชี้วัด, เป้าหมายปี 73, หน่วย, ผลงาน, หมายเหตุ) *ไม่เอาแถวหัวข้อ Header</li>
            <li>กดสั่ง Copy (Ctrl+C) จากตารางนั้นเลย</li>
            <li>คลิกที่กล่องสี่เหลี่ยมด้านล่าง แล้วกด Paste (Ctrl+V) ยัดลงไปตรงๆ</li>
          </ul>
        </div>

        <div className="pt-2">
          <label className="block text-sm font-bold text-slate-700 mb-2">Ctrl+V วางข้อมูลจาก Excel ตรงนี้ 👇</label>
          <textarea 
            className="w-full border-slate-300 rounded-lg shadow-inner bg-slate-50 px-4 py-3 outline-none border focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all font-mono text-xs whitespace-pre whitespace-nowrap overflow-x-auto" 
            rows="12"
            value={pastedData}
            onChange={(e) => setPastedData(e.target.value)}
            placeholder="ตัวอย่างการวางข้อมูล:&#10;1&#9;3.3&#9;จำนวนผู้ติดเชื้อ HIV...&#9;≤ 0.2&#9;คน (ต่อ 1,000 คน)&#9;0.13&#9;ข้อมูล ณ 67&#10;2&#9;3.3&#9;อุบัติการณ์ของวัณโรค...&#9;≤ 20&#9;อัตราต่อแสนคน&#9;146&#9;ข้อมูล ณ 67"
          ></textarea>
        </div>

        <div className="pt-4 flex justify-end">
          <button 
            onClick={handleImport}
            disabled={loading || !pastedData.trim()} 
            className="flex items-center gap-2 px-8 py-3 text-sm font-bold text-white bg-blue-600 rounded-lg shadow-sm hover:bg-blue-700 disabled:opacity-50 transition-colors"
          >
            {loading ? <Loader2 className="animate-spin" size={18} /> : <UploadCloud size={18} />}
            กดเริ่มส่งข้อมูลทั้งหมดไปที่ Google Sheets (Bulk Import)
          </button>
        </div>
      </div>
    </div>
  );
}
