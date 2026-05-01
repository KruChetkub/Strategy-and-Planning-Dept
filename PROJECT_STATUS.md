# KPI Monitoring System - PROJECT STATUS

อัปเดตล่าสุด: **2026-05-01**

> โครงสร้างแบบ production สำหรับใช้เป็นเอกสารกลางในการพัฒนาต่อ และสำหรับเริ่มแชทใหม่โดยไม่เสีย context

---

## 1) CORE_CONTEXT

### 1.1 Project Scope
- ระบบ Dashboard สำหรับติดตามผลตัวชี้วัด KPI ของกองยุทธศาสตร์และแผนงาน กรมควบคุมโรค
- แสดงผลข้อมูลจาก Supabase PostgreSQL ผ่าน React + Vite + Tailwind CSS
- เป้าหมายหลักคือทำให้ผู้บริหารใช้ดูภาพรวม, ติดตามสถานะ, และตัดสินใจได้เร็วขึ้น

### 1.2 Stable Tech Stack
- Frontend: React + Vite + Tailwind CSS
- Data fetching: TanStack React Query
- Database: Supabase PostgreSQL
- Charting: Recharts + SVG inline
- Routing: React Router v6
- Deployment: GitHub + Vercel

### 1.3 Canonical Data Rules
- `null` = ไม่มีข้อมูลในระบบจริง
- `0` = มีข้อมูลจริง
- `""` = ยังไม่ได้กรอก / ระหว่างกรอก
- KPI ต้องนับจากทะเบียนกลาง ไม่ใช่นับเฉพาะรายการที่มีผล
- KPI ที่ยังไม่มีผลต้องยังแสดงในระบบเสมอ

### 1.4 KPI Counting Standard
- `Total KPIs` = ตัวชี้วัดทั้งหมดของกอง
- `Reported KPIs` = ตัวชี้วัดที่มีข้อมูลเข้ามาแล้ว
- `Assessed KPIs` = ตัวชี้วัดที่มีข้อมูลพอประเมินได้
- `Pending KPIs` = ตัวชี้วัดที่ยังไม่มีข้อมูล / ยังประเมินไม่ได้
- รายงานผู้บริหารต้องแยก 4 ค่านี้ให้ชัด

### 1.5 Status Logic
- สีสถานะหลักคงเดิมทั้งระบบ
  - เขียว = บรรลุเป้าหมาย
  - เหลือง = เฝ้าระวัง
  - ส้ม = ระดับเสี่ยง
  - แดง = ขั้นวิกฤติ
- การคำนวณ % ผ่านเป้าหมายควรยึดเฉพาะ KPI ที่ `Assessed` ได้แล้ว
- KPI ที่ `Pending` ต้องไม่ทำให้คะแนนรวมเพี้ยน

### 1.6 Core Files
- `src/api/kpiApi.js`
  - helper กลางสำหรับประเมินสถานะ KPI
- `src/utils/kpiForm.js`
  - `trimToNull()`
  - `parseOptionalNumber()`
- `src/utils/kpiMetrics.js`
  - helper สำหรับสรุป pipeline status
- `src/components/KpiDataPolicyNotice.jsx`
  - กล่องอธิบาย policy การกรอกข้อมูล

### 1.7 Main Routes
- `/` → `DashboardOverview`
- `/sdgs` → `Dashboard`
- `/healthkpi` → `DashboardHealth`
- `/entry` → `DataEntry`
- `/entry-health` → `DataEntryHealth`
- `/group/sdg` → `KPIGroup`
- `/group/health` → `KPIGroup`
- `/manage/sdgs` → `ManageSDGs`
- `/manage/health` → `ManageHealth`
- `/manage/kpis` → `ManageKPIs`
- `/admin/login` → `AdminLogin`

---

## 2) CURRENT_STATE

### 2.1 Last Delivered Changes
- ปรับต้นน้ำข้อมูลให้รองรับ `null / 0 / ""` อย่างสม่ำเสมอ
- เพิ่ม helper กลางใน `src/utils/kpiForm.js`
- เพิ่ม policy notice ในหน้ากรอกและหน้าจัดการข้อมูล
- ปรับ dashboard หลักให้เริ่มแยก `Total / Reported / Assessed / Pending`
- ปรับ `DashboardOverview` ให้พื้นหลัง hero ใกล้ภาพแนบของผู้ใช้

### 2.2 Current UI State
- หน้า `DashboardOverview` ใช้พื้นหลังแบบสว่างโทนเขียวอ่อน → ฟ้าอ่อน → น้ำเงินอ่อน
- หัวข้อใน hero เป็นภาษาไทยและอ่านชัด
- สี status pills เดิมยังคงอยู่
- มีแถบสรุปข้อมูล:
  - ตัวชี้วัดทั้งหมด
  - มีข้อมูลแล้ว
  - ประเมินผลได้
  - รอข้อมูล

### 2.3 Current Logic State
- ฟอร์มบันทึกข้อมูลหลักใช้กติกาเดียวกันแล้ว
- Bulk import เริ่มใช้ helper เดียวกับฟอร์มปกติ
- Dashboard หลักเริ่มใช้ `Assessed` เป็นฐานของ % ผ่านเป้าหมาย
- ยังมี logic บางส่วนใน dashboard เดิมที่ควรตรวจความสอดคล้องต่ออีก

### 2.4 Known Risks / Notes
- Build validation ใน environment นี้เคยติด `spawn EPERM` ตอนรัน Vite/esbuild
- ต้องระวังให้ `pending` กับ `assessed` ใช้ความหมายเดียวกันทั้งระบบ
- ถ้าจะเพิ่ม KPI ชนิดพิเศษ ควรเพิ่ม metadata เช่น `calc_type`

### 2.5 Recent Files Touched
- `src/pages/DataEntry.jsx`
- `src/pages/DataEntryHealth.jsx`
- `src/pages/ManageSDGs.jsx`
- `src/pages/ManageHealth.jsx`
- `src/pages/ManageKPIs.jsx`
- `src/pages/DashboardOverview.jsx`
- `src/pages/DashboardHealth.jsx`
- `src/pages/KPIGroup.jsx`
- `PROJECT_STATUS.md`

---

## 3) TASK

### 3.1 In Progress
- ตรวจให้ logic การนับ `Reported / Assessed / Pending` ใช้คำจำกัดความเดียวกันทั้งระบบ
- ทำให้หน้ารายงานผู้บริหารอธิบายตัวเลขได้แบบคนอ่านเร็วเข้าใจทันที

### 3.2 Next Priority
1. ปรับ `DashboardHealth` และ `KPIGroup` ให้สอดคล้องกับ standard ใหม่ทั้งชื่อและตัวเลข
2. ตรวจว่า dashboard ทุกหน้าไม่ตี `0` เป็นค่าว่าง
3. ปรับข้อความบนหน้า UI ให้เป็นภาษาไทยทั้งหมดเท่าที่เหมาะสม
4. เพิ่ม `calc_type` หรือ metadata อื่น ๆ ถ้าพบ KPI ที่ rule ซับซ้อน
5. เตรียม export/report layer สำหรับผู้บริหารในรอบถัดไป

### 3.3 Validation Checklist
- KPI ทั้งหมดถูกนับจากทะเบียนกลาง
- รายการที่ไม่มีข้อมูลยังแสดงอยู่
- `0` ยังเป็นค่าจริงและไม่หาย
- ช่องว่างถูกบันทึกเป็น `null`
- ภาพรวมผู้บริหารแสดง Total / Reported / Assessed / Pending ชัดเจน
- สีสถานะเดิมไม่ถูกเปลี่ยนโดยไม่ตั้งใจ

### 3.4 Start-New-Chat Prompt
ใช้ข้อความนี้เมื่อเริ่มคุยใหม่:

```text
ช่วยอ่านไฟล์ PROJECT_STATUS.md ในโฟลเดอร์นี้ แล้วสรุป CORE_CONTEXT, CURRENT_STATE และ TASK ให้หน่อย เพื่อใช้พัฒนาต่อโดยไม่เสีย context
```

---

## Update Rule

- `CORE_CONTEXT` = คงที่เป็นหลักฐานกลางของโปรเจกต์
- `CURRENT_STATE` = เปลี่ยนทุกครั้งที่มีงานใหม่
- `TASK` = ใช้เป็นรายการงานถัดไป
- ถ้าทำงานใหม่ ให้แก้เฉพาะ `CURRENT_STATE` และ `TASK` ก่อน
- ถ้ากติกาหลักเปลี่ยนจริง ค่อยแก้ `CORE_CONTEXT`

---

## 4) GitHub + Vercel Deploy Commands

### 4.1 Push ขึ้น GitHub (ทุกครั้งที่อัปเดตงาน)

```powershell
git status
git add .
git commit -m "update: <สรุปงานสั้นๆ>"
git push origin main
```

### 4.2 ผูกโปรเจกต์กับ Vercel (ครั้งแรกเท่านั้น)

```powershell
npm install
npm run build
npm i -g vercel
vercel login
vercel link
```

### 4.3 Deploy ขึ้น Vercel

```powershell
# Preview deploy
vercel

# Production deploy
vercel --prod
```

### 4.4 Flow ที่แนะนำสำหรับโปรเจกต์นี้

1. แก้โค้ด + ทดสอบในเครื่อง (`npm run dev`)
2. เช็ก build (`npm run build`)
3. push ขึ้น GitHub (`git add/commit/push`)
4. ให้ Vercel auto-deploy จาก branch `main` (หรือสั่ง `vercel --prod`)
