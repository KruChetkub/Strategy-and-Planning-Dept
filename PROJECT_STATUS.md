# 📑 KPI Monitoring System - Project Status & Documentation

ฉบับอัปเดตล่าสุด: 2026-04-02

## 🎯 ภาพรวมโปรเจกต์ (Project Overview)
ระบบ Dashbord ติดตามผลตัวชี้วัด (KPI) ที่เชื่อมต่อข้อมูลจาก Google Sheets (ผ่าน Google Apps Script) และแสดงผลผ่าน React บน Vercel โดยเน้นความสวยงามระดับพรีเมียม (Premium UX/UI) และความปลอดภัยของข้อมูล

---

## 🛠️ โครงสร้างทางเทคนิค (Technical Stack)
- **Frontend:** React + Vite + Tailwind CSS
- **Visualization:** Recharts (กราฟแท่ง, กราฟโดนัท)
- **Data Source:** Google Sheets (CSV Fetch)
- **Security:** Vercel Serverless Function Proxy (`/api/kpi.js`) เพื่อซ่อน Script URL
- **Deployment:** GitHub + Vercel

---

## ✅ ฟีเจอร์ที่ทำเสร็จแล้ว (Key Features Implemented)

### 1. Dashboard สรุปผล (รวม)
- ปรับขนาดตัวอักษร (Typography) ให้ใหญ่ขึ้นระดับผู้บริหารอ่านง่าย
- ระบบค้นหาตัวชี้วัดแบบ Real-time
- เชื่อมต่อปุ่ม "View More" ไปยังหน้า SDGs และ Health KPI

### 2. แดชบอร์ด Health KPI (กรมควบคุมโรค)
- **Regional Performance:** แสดงผลงาน 13 เขตสุขภาพ
- **Bug Fix (KPI 007):** แก้ไข Logic ให้แสดงค่าติดลบ (กรณีเป้าหมายลดลง) ได้ถูกต้อง
- **Dynamic Y-Axis:** กราฟปรับสเกลอัตโนมัติ (Auto-scale) และปัดเศษทีละ 20 เพื่อความสวยงาม (เช่น 0, -20, -40)
- **UI visibility:** ปรับสีตัวเลขกลางกราฟโดนัทให้อ่านง่ายบนพื้นหลังขาว

### 3. แดชบอร์ดตัวชี้วัด SDGs
- **Row Grouping:** จัดกลุ่มตารางตาม "เป้าหมายหลัก" (เช่น เป้าหมาย 3.3) เพื่อลดความซ้ำซ้อน
- **Smart Truncation:** ย่อรหัสยาวๆ ให้เหลือแค่ "เป้าหมาย X.X" และใช้ Tooltip เพื่อดูข้อความเต็มเมื่อเอาเมาส์ชี้
- **Typography Scale:** ปรับขนาดตัวอักษรในตารางและ Card ให้ใหญ่ขึ้นและเป็นระดับ (Hierarchy)

### 4. ระบบการทำงาน (System)
- **vercel.json:** ตั้งค่า Routing เพื่อป้องกัน 404 เมื่อกด Refresh หรือเข้าหน้าย่อยตรงๆ

---

## 🚀 คำสั่งปฎิบัติการ (Operation Commands)

### การอัปเดตงานขึ้นระบบ (Git Combo)
ใช้คำสั่งนี้บรรทัดเดียวเพื่อส่งงานขึ้น GitHub และ Vercel:
```bash
git add . && git commit -m "Update Project" && git push
```

---

## ⚠️ สิ่งที่ต้องระวัง (Important Notes)
- การแก้ไขข้อมูลใน Google Sheets ต้องระวังเรื่องชื่อ "รหัส/เป้าหมาย" ให้เหมือนกันเป๊ะเพื่อให้ระบบ Row Grouping ทำงานถูกต้อง
- การเพิ่มตัวชี้วัดใหม่ที่มีหน่วยเป็น "ติดลบ" ระบบรองรับแกน Y และตารางเรียบร้อยแล้ว

---

## 💡 วิธีการเริ่มคุยใหม่กับ AI
เมื่อเริ่มแชทใหม่ ให้สั่งว่า:
**"ช่วยอ่านไฟล์ PROJECT_STATUS.md ในโฟลเดอร์นี้ แล้วสรุปงานที่เราทำค้างไว้ล่าสุดให้หน่อย เพื่อความรวดเร็วและประหยัดโควตาความจำ"**

"ช่วยอ่านไฟล์ PROJECT_STATUS.md ในโฟลเดอร์นี้ แล้วสรุปงานที่เราทำค้างไว้ล่าสุดให้หน่อย เพื่อความรวดเร็วและประหยัดโควตาความจำ"
---
*จัดทำโดย: Antigravity AI Coding Assistant*
