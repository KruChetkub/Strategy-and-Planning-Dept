# 📑 KPI Monitoring System - Project Status & Documentation

ฉบับอัปเดตล่าสุด: **2026-04-30**

---

## 🎯 ภาพรวมโปรเจกต์ (Project Overview)

ระบบ Dashboard ติดตามผลตัวชี้วัด (KPI) สำหรับกองยุทธศาสตร์และแผนงาน กรมควบคุมโรค  
เชื่อมต่อข้อมูลจาก **Supabase PostgreSQL** และแสดงผลผ่าน React บน Vercel  
เน้น Executive-focused UI/UX แบบ **Bento Box Layout** ระดับพรีเมียม

---

## 📌 อัปเดตล่าสุด (2026-04-30) — Dashboard UI/UX Polish & Typography Refinement

> **เป้าหมาย**: ปรับปรุงหน้าตาของระบบ (UI/UX) ให้ดูพรีเมียม เป็นทางการ อ่านง่ายสบายตา และสอดคล้องกับมาตรฐานสีการรายงานผลของระบบราชการ

### ✅ Global Typography (ระบบฟอนต์)
- เปลี่ยนฟอนต์หลักของทั้งระบบจาก "Kanit" เป็น **"Sarabun" (สารบรรณ)** เพื่อความคุ้นเคย อ่านง่าย และเป็นทางการที่สุดสำหรับผู้บริหาร
- อัปเดต `index.html` เพื่อดึงฟอนต์ Sarabun จาก Google Fonts
- อัปเดต `tailwind.config.js` ให้ใช้ Sarabun เป็น `font-sans` พื้นฐาน
- ลบการตั้งค่า `tracking-[0.015em]` และ `font-light` ใน `index.css` ออก เพื่อปล่อยให้ฟอนต์ Sarabun แสดงผลระยะห่าง (Kerning) และน้ำหนักตามธรรมชาติ ซึ่งออกแบบมาเพื่อการอ่านเอกสารยาวๆ ได้อย่างสบายตาที่สุด

### ✅ DashboardOverview.jsx (`/`)
- **Header Layout Restructure**: ปรับโครงสร้างกล่องด้านบนสุดใหม่ทั้งหมด โดยแยกออกเป็น 2 แถวหลัก (Title อยู่บนสุด ไม่ถูกบีบ, Metrics อยู่ด้านล่าง)
- **Centered Target Text**: ย้ายข้อความ "บรรลุเป้าหมาย X จาก Y ตัวชี้วัดทั้งหมด" มาไว้ตรงกลางเลย์เอาต์ พร้อมใส่พื้นหลังโปร่งแสงและกรอบแบบ Inner Shadow ให้ดูมีมิติ
- **Premium Background Color**: เปลี่ยนเงื่อนไขสีพื้นหลังของกล่องบนสุด (กรณีคะแนนรวมภาพรวมต่ำกว่า 50%) จากสีเทาดำ-แดง เป็น **การไล่เฉดสีฟ้า-น้ำเงินพรีเมียม** (`from-sky-800 via-blue-700 to-blue-900`) แบบปุ่ม Modern UI
- **Standardized RAG Status Colors**: ปรับสีของ "กล่องสรุปสถานะทั้ง 4" (Status Pills) ด้านขวา ให้ตรงตามมาตรฐานสีสากล (RAG Status Table) แบบทึบ 100%:
  - ✅ **บรรลุเป้าหมาย**: สีเขียวสด (`bg-green-600`)
  - ⚠️ **เฝ้าระวัง**: สีเหลืองสด (`bg-yellow-400`) — *ปรับตัวอักษรเป็นสีเข้มเพื่อให้ตัดกับพื้นเหลืองและอ่านง่าย*
  - 🛑 **ระดับเสี่ยง**: สีส้มสด (`bg-orange-500`)
  - ❌ **ขั้นวิกฤติ**: สีแดงสด (`bg-red-600`)
- **Micro-interactions**: เพิ่มเงา (`shadow-lg`) และเอฟเฟกต์เด้งเมื่อชี้เมาส์ (`hover:scale-105`) ให้กับกล่องสถานะ เพื่อยกระดับประสบการณ์ผู้ใช้ให้รู้สึกเหมือนแอปพลิเคชันพรีเมียม

---

## 📌 อัปเดตล่าสุด (2026-04-30) — Reference Link Feature สำหรับ Health KPI

> **เป้าหมาย**: ให้ผู้ใช้สามารถแนบลิ้งอ้างอิงเอกสารประกอบตัวชี้วัด Health KPI (1 ลิ้ง ต่อ 1 ตัวชี้วัด) และเข้าถึงได้โดยตรงจาก Dashboard

### 🗄️ Database Migration (ต้องรันก่อนใช้งาน)
```sql
ALTER TABLE health_indicators ADD COLUMN IF NOT EXISTS reference_url TEXT;
```
> ⚠️ **สำคัญ**: ต้องรันใน Supabase → SQL Editor ก่อน มิฉะนั้นการบันทึก/แสดงลิ้งจะไม่ทำงาน

### ✅ DataEntryHealth.jsx (`/entry-health`)
- เพิ่มฟิลด์ **"ลิ้งอ้างอิง / เอกสารประกอบตัวชี้วัด"** (type=url) ต่อจากช่อง "ผลงาน" ในฟอร์ม
- มี URL validation — ต้องเริ่มต้นด้วย `https://` และรูปแบบ URL ถูกต้อง
- มี **Live URL Preview** + ปุ่มคลิกทดสอบลิ้งก่อนบันทึก
- **โหมด "Save & Next" (กดเขตถัดไป)** → คงค่า `referenceUrl` ไว้ (ตัวชี้วัดเดิม ใช้ลิ้งร่วมกัน)
- **โหมด "เริ่มตัวชี้วัดใหม่"** → ล้าง `referenceUrl` พร้อมกับฟิลด์อื่น
- บันทึกลง column `reference_url` ใน `health_indicators`

### ✅ DashboardHealth.jsx (`/healthkpi`)
- ดึง `reference_url` จาก `rawMappedData` พร้อม logic `useMemo` → `indicatorReferenceUrl`
- กฎ **1 ลิ้ง ต่อ 1 ตัวชี้วัด** = ดึงลิ้งแรกที่ไม่ null ของตัวชี้วัดที่เลือก
- แสดงปุ่ม **"ดูเอกสาร / ลิ้งอ้างอิง"** (Sky Blue) ใน **KPI Template box** ด้านขวา — Conditional Rendering (ไม่แสดงถ้าไม่มีลิ้ง)
- โค้ดถูก reformat เป็น Prettier style (double quotes, multi-line JSX) โดย user

### ✅ ManageHealth.jsx (`/manage/health`)
- เพิ่ม **"Link Bar"** ใต้แถบชื่อตัวชี้วัดหลัก (MasterHeader) ทุกตัว
- มี 3 สถานะ:
  - **ยังไม่มีลิ้ง** → แสดง `+ เพิ่มลิ้งอ้างอิง` (สีดำ ขนาด 11px)
  - **มีลิ้งอยู่แล้ว** → แสดง URL คลิกได้ + ปุ่ม `✏️ แก้ไขลิ้ง`
  - **กำลังแก้ไข** → แสดง Input + ปุ่มบันทึก/ยกเลิก พร้อม URL Validation
- Logic: `handleSaveLink()` → update **ทุกแถวที่มี indicator_name เดียวกัน** ใน Supabase (รับประกัน 1 ลิ้งต่อตัวชี้วัดโดยอัตโนมัติ)
- เพิ่ม icons: `Link2`, `ExternalLink` จาก `lucide-react`
- เพิ่ม state: `editingLinkFor`, `linkInput`, `isSavingLink`

---

## 🛡️ อัปเดตก่อนหน้า (2026-04-29) - Visitor Analytics & Data Sorting
- **Visitor Analytics Implementation**:
  - ติดตั้ง Vercel Analytics (\`@vercel/analytics\`) สำหรับการเก็บสถิติพื้นฐาน
  - สร้าง Custom Hook \`useVisitorCount.js\` สำหรับดึงและนับผู้เข้าชมจาก Supabase (\`visitor_sessions\`)
  - ใช้ \`localStorage\` (Session-based) ป้องกันการนับซ้ำเมื่อ Refresh (F5) 
- **UI Enhancement (ดูสถิติเว็บไซต์)**:
  - เพิ่มคอมโพเนนต์ \`VisitorBadge\` แสดงยอดผู้เข้าชมรวมและของวันนี้แบบ Pro-style
  - ฝังคอมโพเนนต์เข้าเป็นส่วนหนึ่งของ Footer ในหน้า \`DashboardOverview.jsx\` ให้ดูกลมกลืนและเป็นมืออาชีพ
- **Bug Fix & Data Sorting**:
  - แก้ไขปัญหาตาราง "สมุดบันทึกผลการดำเนินงานรายเขตฯ" ใน \`DashboardHealth.jsx\` ให้เรียงลำดับเขตสุขภาพตามหมายเลข (1-13) อัตโนมัติเสมอ ป้องกันปัญหาการแสดงผลเพี้ยนเมื่อบันทึกข้อมูลสลับลำดับกัน
  - ตั้งค่าให้ "รายงานภาพรวม" แสดงอยู่แถวบนสุดเสมอเพื่อความรวดเร็วในการดูสรุปยอด

---

## 🛡️ อัปเดตก่อนหน้า (2026-04-28) - Historical Data Snapshots & UI Polish
- **ระบบตัวกรองข้อมูลย้อนหลัง (Global Temporal Filtering / Phase 4)**: 
  - เพิ่มตัวกรอง "ปีงบประมาณ" (Fiscal Year) และ "ไตรมาส" (Period) ในหน้าแดชบอร์ดทั้งหมด (`DashboardOverview`, `Dashboard` (SDGs), `DashboardHealth`)
  - ซิงค์สถานะตัวกรองผ่าน URL Parameters (`?year=...&period=...`) ทำให้สามารถแชร์ลิงก์หรือรีเฟรชหน้าแล้วค่าไม่หาย
  - ปรับ Default เป็น "ทุกปี/ทุกไตรมาส" (All) เพื่อรองรับข้อมูลเก่าที่ยังไม่มีปี/ไตรมาส
  - อัปเดต `useQuery` hooks และ `kpiApi.js` ให้ดึงข้อมูลตาม Filter ที่เลือก
- **UI/UX Polish**:
  - จัดเรียงตำแหน่งตัวกรอง ปีงบประมาณ และ ไตรมาส ให้เป็นระเบียบ ไม่ซ้อนทับกับหัวข้อ และปรับแก้ Syntax Error ( JSX Unicode Escape ) 
  - ปรับขนาดตัวอักษรของตัวกรองให้ใหญ่ขึ้น (`11px` เป็น `13px`) และเปลี่ยนสีให้เป็นสีดำเข้ม (`text-slate-900`, `font-black`) เพื่อการมองเห็นที่ชัดเจนขึ้นตามมาตรฐานผู้บริหาร

---

## 📌 อัปเดตก่อนหน้า (2026-04-27) - Security & UX Polish
- **ระบบ Login และ Auth Routing**: 
  - แก้ไข `AuthContext.jsx` ให้ยอมรับ Role พื้นฐาน (`authenticated`) สามารถเข้าใช้งานหน้า Admin ได้ เพื่อแก้ปัญหาถูกบล็อกหลังล็อกอิน
  - ปรับปรุง `AdminLogin.jsx` ให้บังคับ Redirect ไปที่แดชบอร์ดหลัก (`/`) ทุกครั้งหลังล็อกอินสำเร็จ
  - ถอดข้อความที่ไม่จำเป็นในหน้า `ProtectedAdminRoute` และหน้าล็อกอินออก เพื่อให้ดูสะอาดตา
  - แปลงข้อความแจ้งเตือนรหัสผิดจาก Supabase ให้เป็นภาษาไทย ("อีเมลไม่ถูกต้อง หรือรหัสผ่านผิด")
  - ปรับ Sidebar ให้แสดงข้อมูล User และปุ่มเข้าสู่ระบบ/ออกจากระบบตามสถานะจริงอย่างสมบูรณ์แบบ
- **Database Protection (Anti-Spam)**:
  - ติดตั้งระบบ **Cache Persistence** (`sessionStorage`) ผ่าน `React Query`
  - ปกป้องฐานข้อมูล Supabase จากพฤติกรรมการกด F5 รัวๆ (ลดโควตาการอ่าน DB 100% ภายในเวลา staleTime 5 นาที)

---

## 🛠️ โครงสร้างทางเทคนิค (Technical Stack)

| ชั้น | เทคโนโลยี |
|---|---|
| **Frontend** | React + Vite + Tailwind CSS |
| **Data Fetching** | TanStack React Query (stale 5 min, no refetch on focus + **SessionStorage Persister**) |
| **Database** | Supabase PostgreSQL (`sdg_indicators`, `health_indicators`) |
| **Visualization** | Recharts (BarChart, PieChart, AreaChart) + SVG Donut inline |
| **Routing** | React Router v6 |
| **Deployment** | GitHub + Vercel |

---

## 🗄️ Database Schema (Supabase)

### ตาราง `sdg_indicators`
| คอลัมน์ | ประเภท | คำอธิบาย |
|---|---|---|
| `id` | int8 | Primary Key |
| `category` | text | เป้าหมายย่อย (เช่น 3.3) |
| `indicator_name` | text | ชื่อตัวชี้วัด |
| `target_2030` | text | เป้าหมายปี 2573 |
| `current_performance` | numeric | ผลงานปัจจุบัน |
| `description` | text | หมายเหตุ |
| `is_deleted` | boolean | สำหรับ Soft Delete |

### ตาราง `health_indicators`
| คอลัมน์ | ประเภท | คำอธิบาย |
|---|---|---|
| `id` | int8 | Primary Key |
| `indicator_name` | text | ชื่อตัวชี้วัดหลัก |
| `kpi_group` | text | ตัวชี้วัดย่อย / กลุ่ม |
| `region` | text | เขตสุขภาพ (เช่น เขตฯ 1) |
| `a_value` | numeric | ประชากร A (ตัวตั้ง) |
| `b_value` | numeric | ประชากร B (ตัวหาร) |
| `performance` | numeric | ผลงาน (%) |
| `target_q1–q4` | text | เป้าหมายรายไตรมาส |
| `reference_url` | text | ลิ้งอ้างอิงเอกสารประกอบตัวชี้วัด **(เพิ่ม 2026-04-30)** |
| `is_type_a` | bool | ตัวชี้วัด Type A |
| `is_deleted` | boolean | สำหรับ Soft Delete |

---

## ✅ ฟีเจอร์ที่ทำเสร็จแล้ว (Completed Features)

### 🏠 1. DashboardOverview (`/`)
- **Hero Section** แสดง % ภาพรวมสำเร็จพร้อม Gradient สีตามสถานะ
- **Bento Box Layout**: Urgent Action Panel + System Health Donut
- **SDGs vs Health KPI Side-by-Side** พร้อม Donut Ring + Progress Bar
- **Summary Table** แสดงเฉพาะรายการที่ต้องติดตาม (toggle ดูทั้งหมดได้)
- เชื่อมต่อ Supabase ทั้งสองตาราง ประมวลผล status แบบ real-time

### 📊 2. Dashboard SDGs (`/sdgs`)
- Circular Gauge แสดง % บรรลุเป้าหมาย
- 4 Status Cards (บรรลุ / ใกล้เป้า / เสี่ยง / วิกฤติ)
- ตารางสรุปจัดกลุ่มตาม "เป้าหมายย่อย" (Row Grouping)
- Logic ตีความเป้าหมาย: รองรับ "ยิ่งน้อยยิ่งดี", "ลดลงร้อยละ", ">= %"

### 🏥 3. DashboardHealth (`/healthkpi`)
- **Drill-down Filter**: เลือกตัวชี้วัดหลัก → ตัวชี้วัดย่อย
- **Thailand Map Component**: แสดงสถานะรายเขตแบบ choropleth
- **Bar Chart**: เปรียบเทียบผลงาน 13 เขตสุขภาพ พร้อม Reference Line
- **Pie Chart**: สัดส่วน Pass/Fail/Pending
- **Overview Mode**: เมื่อยังไม่เลือก KPI แสดง Top 5 ที่ควรเร่งรัด
- รองรับ "รายงานภาพรวม" (Overall fallback) และ Aggregated regional avg
- ✅ **(2026-04-30)** แสดงปุ่ม **"ดูเอกสาร / ลิ้งอ้างอิง"** ใน KPI Template box — Conditional (แสดงเฉพาะเมื่อมีลิ้ง)

### 📝 4. DataEntry SDGs (`/entry`)
- ฟอร์มบันทึกตัวชี้วัด SDGs → `sdg_indicators`
- Success/Error Modal แบบ Premium
- ล้างฟอร์มอัตโนมัติหลังบันทึก (เก็บ category ไว้)
- ✅ **แนบลิ้งอ้างอิง** ต่อจากหมายเหตุ + แสดงในตาราง Dashboard SDGs

### 🏥 5. DataEntryHealth (`/entry-health`)
- ฟอร์มบันทึก Health KPI รายเขตสุขภาพ → `health_indicators`
- Dropdown 13 เขต + รายงานภาพรวม
- **Live Preview Status**: ประเมินผลทันทีขณะกรอก เทียบกับเป้าหมาย Q ปัจจุบัน
- 2 โหมด: "บันทึก & กรอกเขตถัดไป" และ "บันทึก & เริ่มตัวชี้วัดใหม่"
- ✅ **(2026-04-30)** แนบ **ลิ้งอ้างอิง** ต่อจากผลงาน + บันทึกลง `reference_url`

### 📦 6. ManageKPIs (Bulk Import SDGs)
- วาง (Ctrl+V) ข้อมูลจาก Excel → Parse → Preview Table
- **Bulk Insert** เข้า `sdg_indicators` ผ่าน Supabase โดยตรง
- Preview ตรวจสอบ 6 คอลัมน์ก่อน Import จริง
- ✅ **Migration สำเร็จ**: เปลี่ยนจาก Google Sheets API → Supabase (2026-04-08)

### 🔍 7. KPIGroup (`/group/:groupId`)
- รองรับ `groupId = 'sdg'` และ `'health'` พร้อม theme สีแยกกัน
- **Header Card** + Gradient Banner + % ภาพรวม
- **4 Stat Cards**: บรรลุ / เฝ้าระวัง / เสี่ยง+วิกฤติ / รอข้อมูล
- **Search + Filter + Sort**: ค้นชื่อ, กรองสถานะ, เรียงผลงานสูง-ต่ำ
- **Group by Category** + **Progress Bar** รายตัวชี้วัด
- ✅ **Redesign สำเร็จ**: เปลี่ยนจาก stub → Full UI (2026-04-08)

---

## 🗺️ โครงสร้าง Routing

```
/                    → DashboardOverview  (ภาพรวม Executive)
/sdgs                → Dashboard          (SDGs Detail)
/healthkpi           → DashboardHealth    (Health KPI + Map)
/entry               → DataEntry          (บันทึก SDGs)
/entry-health        → DataEntryHealth    (บันทึก Health KPI)
/group/sdg           → KPIGroup           (รายการ SDGs ทั้งหมด)
/group/health        → KPIGroup           (รายการ Health KPI ทั้งหมด)
/settings            → Settings           (placeholder)
/manage/sdgs         → ManageSDGs         (แก้ไข/ลบ ข้อมูล SDGs)
/manage/health       → ManageHealth       (แก้ไข/ลบ ข้อมูล Health KPI)
/admin/login         → AdminLogin         (หน้าล็อกอิน)
```

---

## 🚀 คำสั่งปฏิบัติการ (Operation Commands)

```bash
# รัน Dev Server
npm run dev

# Push งานขึ้น GitHub → Vercel (Auto Deploy)
git add .
git commit -m "Update Project"
git push origin main
```

---

## ⚠️ สิ่งที่ต้องระวัง (Important Notes)

- การแก้ไขข้อมูลใน Google Sheets ต้องระวังเรื่องชื่อ "รหัส/เป้าหมาย" ให้เหมือนกันเป๊ะเพื่อให้ระบบ Row Grouping ทำงานถูกต้อง
- การเพิ่มตัวชี้วัดใหม่ที่มีหน่วยเป็น "ติดลบ" ระบบรองรับแกน Y และตารางเรียบร้อยแล้ว
- **`evaluateKPIStatus()`** อยู่ใน `src/api/kpiApi.js` — ใช้ร่วมกันทุก page ไม่ duplicate
- **Logic "ยิ่งน้อยยิ่งดี"**: ระบบตรวจจาก keyword `<`, `≤`, `ลด`, `ไม่เกิน` ในช่อง target
- **Performance = 0**: ถือว่า "รอข้อมูล" ไม่ใช่ "บรรลุเป้า" (กรณี division)
- **Thailand Map**: import จาก `src/components/charts/ThailandMap`

---

## 💡 วิธีการเริ่มคุยใหม่กับ AI

เมื่อเริ่มแชทใหม่ ให้สั่งว่า:

```
ช่วยอ่านไฟล์ PROJECT_STATUS.md ในโฟลเดอร์นี้ แล้วสรุปงานที่เราทำค้างไว้ล่าสุดให้หน่อย เพื่อความรวดเร็วและประหยัดโควตาความจำ
เพื่อใช้ในการพัฒนา
```

---

## 🔮 Roadmap ถัดไป — calc_type Architecture (ยังไม่ได้ทำ)

> 💡 แนวทางระดับมืออาชีพ (WHO / DHIS2 / HDC ของไทย)
> บันทึกไว้เพื่อพัฒนาในรอบถัดไป

### ปัญหาของระบบปัจจุบัน
ระบบ "เดา" ประเภทการคำนวณจากข้อมูลที่มี ซึ่งอาจทำให้สับสนได้

### แนวทางแก้: กำหนด `calc_type` ต่อตัวชี้วัด

```
calc_type = "ratio"   → ต้องกรอก A และ B เท่านั้น
                         ระบบคำนวณ (A/B)×100 เองอัตโนมัติ
                         ชัดเจน ไม่ต้องเดา

calc_type = "direct"  → กรอกแค่ performance (%) ตรงๆ
                         ใช้กับตัวชี้วัดที่ได้ค่าจากภายนอก
                         หรือเป็นดัชนีสรุป ไม่มี A,B
```

---

## 🔮 Next Steps ที่แนะนำ (Priority Order)

| ลำดับ | งาน | ความสำคัญ |
|---|---|---|
| 1 | พัฒนา `calc_type` Architecture สำหรับ Health KPI | 🟢 ต่ำ (Future) |
| 2 | Export Reports (PDF / Excel) | 🟢 ต่ำ (Future) |

---

*จัดทำโดย: Pichet & AI Assistant | อัปเดตล่าสุด: 2026-04-30*
