# KPI Monitoring System

ระบบบริหารจัดการและติดตามตัวชี้วัด (SDG & Health KPI) สำหรับกองยุทธศาสตร์และแผนงาน พัฒนาด้วย React, Vite, Tailwind CSS และ Supabase

## Features
- Executive dashboard สำหรับดูภาพรวมตัวชี้วัด
- SDG monitoring สำหรับติดตามตัวชี้วัดเป้าหมายการพัฒนาที่ยั่งยืน
- Health KPI monitoring สำหรับติดตามตัวชี้วัดสาธารณสุขรายเขตและรายพื้นที่
- จัดการข้อมูลตัวชี้วัดและบันทึกผลผ่านหน้าแอป
- รองรับการย้ายข้อมูลผ่านสคริปต์ในโฟลเดอร์ `scripts/`

## Tech Stack
- Frontend: React, Vite, Tailwind CSS, Recharts, Zustand
- Backend/Data: Supabase
- Deployment: Vercel

## Local Setup
1. Clone repository
2. ติดตั้ง dependencies
   ```bash
   npm install
   ```
3. สร้างไฟล์ `.env` โดยคัดลอกจาก `.env.example`
4. กำหนดค่าดังนี้
   ```env
   VITE_SUPABASE_URL=your_supabase_project_url
   VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
   ```
5. รันโปรเจ็กต์
   ```bash
   npm run dev
   ```

## GitHub + Vercel Deployment
1. Commit งานล่าสุดในเครื่อง
2. Push ขึ้น branch `main` ของ GitHub repository
3. Import repository นี้เข้า Vercel
4. ตรวจสอบค่า Build Settings
   - Framework Preset: `Vite`
   - Build Command: `npm run build`
   - Output Directory: `dist`
5. เพิ่ม Environment Variables ใน Vercel
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`
6. Deploy

หมายเหตุ:
- ค่า `VITE_SUPABASE_ANON_KEY` เป็น client key สำหรับฝั่ง frontend แต่ควรจัดการผ่าน Environment Variables ของ Vercel ไม่ควร commit ไฟล์ `.env`
- มีไฟล์ `vercel.json` สำหรับรองรับ client-side routing ของ React Router แล้ว

## Useful Scripts
- `npm run dev`
- `npm run build`
- `npm run preview`
- `npm run migrate`

---
© 2026 Strategy and Planning Department Dashboard System
