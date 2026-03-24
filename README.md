# KPI Monitoring System 🚀💎

ระบบบริหารจัดการและติดตามตัวชี้วัด (SDG & Health KPI) สำหรับกองยุทธศาสตร์และแผนงาน พัฒนาด้วย React, Tailwind CSS และ Google Apps Script

## ✨ Features
- **Executive Dashboard:** ระบบ Dashboard ภาพรวมที่สวยงาม (Mission Control) และกราฟเข็มวัด (Success Gauge)
- **SDG Monitoring:** ติดตามตัวชี้วัดเป้าหมายการพัฒนาที่ยั่งยืน
- **Health KPI Monitoring:** ติดตามตัวชี้วัดสาธารณสุขรายเขตและรายพื้นที่
- **Google Sheets Backend:** ใช้ Google Sheets เป็นฐานข้อมูลหลัก ทำให้ง่ายต่อการจัดการข้อมูล
- **Bulk Import:** ระบบนำเข้าข้อมูลจำนวนมากโดยตรงจาก Excel

## 🛠️ Tech Stack
- **Frontend:** React (Vite), Tailwind CSS, Lucide Icons, Recharts
- **Backend:** Google Apps Script (Web App)
- **Data Source:** Google Sheets

## 🚀 Setup & Installation
1. Clone repository
2. ติดตั้ง dependencies:
   ```bash
   npm install
   ```
3. สร้างไฟล์ `.env` และกำหนดค่าดังนี้:
   ```env
   VITE_GOOGLE_SCRIPT_URL=your_google_script_exec_url
   ```
4. รันระบบในโหมดพัฒนา:
   ```bash
   npm run dev
   ```

## 📦 Deployment (Vercel)
1. Push code ขึ้น GitHub
2. เชื่อมต่อ Repository กับ Vercel
3. **สำคัญ:** ในหน้าตั้งค่า Vercel ให้กำหนด **Environment Variable**:
   - `VITE_GOOGLE_SCRIPT_URL`: ใส่ URL ของ Google Apps Script (ตัวเดียวกับใน .env)
4. กด Deploy และระบบจะรันให้ทันทีครับ!

---
© 2026 Strategy and Planning Department Dashboard System
