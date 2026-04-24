# 📑 KPI Monitoring System - Project Status & Documentation

<<<<<<< HEAD
ฉบับอัปเดตล่าสุด: 2026-04-02

## 🎯 ภาพรวมโปรเจกต์ (Project Overview)
ระบบ Dashbord ติดตามผลตัวชี้วัด (KPI) ที่เชื่อมต่อข้อมูลจาก Google Sheets (ผ่าน Google Apps Script) และแสดงผลผ่าน React บน Vercel โดยเน้นความสวยงามระดับพรีเมียม (Premium UX/UI) และความปลอดภัยของข้อมูล
=======
ฉบับอัปเดตล่าสุด: **2026-04-08**

---

## 🎯 ภาพรวมโปรเจกต์ (Project Overview)

ระบบ Dashboard ติดตามผลตัวชี้วัด (KPI) สำหรับกองยุทธศาสตร์และแผนงาน กรมควบคุมโรค  
เชื่อมต่อข้อมูลจาก **Supabase PostgreSQL** และแสดงผลผ่าน React บน Vercel  
เน้น Executive-focused UI/UX แบบ **Bento Box Layout** ระดับพรีเมียม
>>>>>>> vercel-ready

---

## 🛠️ โครงสร้างทางเทคนิค (Technical Stack)
<<<<<<< HEAD
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
=======

| ชั้น | เทคโนโลยี |
|---|---|
| **Frontend** | React + Vite + Tailwind CSS |
| **Data Fetching** | TanStack React Query (stale 5 min, no refetch on focus) |
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
| `is_type_a` | bool | ตัวชี้วัด Type A |

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

### 📝 4. DataEntry SDGs (`/entry`)
- ฟอร์มบันทึกตัวชี้วัด SDGs → `sdg_indicators`
- Success/Error Modal แบบ Premium
- ล้างฟอร์มอัตโนมัติหลังบันทึก (เก็บ category ไว้)

### 🏥 5. DataEntryHealth (`/entry-health`)
- ฟอร์มบันทึก Health KPI รายเขตสุขภาพ → `health_indicators`
- Dropdown 13 เขต + รายงานภาพรวม
- **Live Preview Status**: ประเมินผลทันทีขณะกรอก เทียบกับเป้าหมาย Q ปัจจุบัน
- 2 โหมด: "บันทึก & กรอกเขตถัดไป" และ "บันทึก & เริ่มตัวชี้วัดใหม่"

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
```

---

## 🚀 คำสั่งปฏิบัติการ (Operation Commands)

```bash
# รัน Dev Server
npm run dev

# Push งานขึ้น GitHub → Vercel (Auto Deploy)
>>>>>>> vercel-ready
git add . && git commit -m "Update Project" && git push
```

---

## ⚠️ สิ่งที่ต้องระวัง (Important Notes)
<<<<<<< HEAD
- การแก้ไขข้อมูลใน Google Sheets ต้องระวังเรื่องชื่อ "รหัส/เป้าหมาย" ให้เหมือนกันเป๊ะเพื่อให้ระบบ Row Grouping ทำงานถูกต้อง
- การเพิ่มตัวชี้วัดใหม่ที่มีหน่วยเป็น "ติดลบ" ระบบรองรับแกน Y และตารางเรียบร้อยแล้ว
=======

- **`evaluateKPIStatus()`** อยู่ใน `src/api/kpiApi.js` — ใช้ร่วมกันทุก page ไม่ duplicate
- **Logic "ยิ่งน้อยยิ่งดี"**: ระบบตรวจจาก keyword `<`, `≤`, `ลด`, `ไม่เกิน` ในช่อง target
- **Performance = 0**: ถือว่า "รอข้อมูล" ไม่ใช่ "บรรลุเป้า" (กรณี division)
- **Thailand Map**: import จาก `src/components/charts/ThailandMap`
>>>>>>> vercel-ready

---

## 💡 วิธีการเริ่มคุยใหม่กับ AI
<<<<<<< HEAD
เมื่อเริ่มแชทใหม่ ให้สั่งว่า:
**"ช่วยอ่านไฟล์ PROJECT_STATUS.md ในโฟลเดอร์นี้ แล้วสรุปงานที่เราทำค้างไว้ล่าสุดให้หน่อย เพื่อความรวดเร็วและประหยัดโควตาความจำ"**

"ช่วยอ่านไฟล์ PROJECT_STATUS.md ในโฟลเดอร์นี้ แล้วสรุปงานที่เราทำค้างไว้ล่าสุดให้หน่อย เพื่อความรวดเร็วและประหยัดโควตาความจำ"
---
*จัดทำโดย: Antigravity AI Coding Assistant*
=======

เมื่อเริ่มแชทใหม่ ให้สั่งว่า:

```
ช่วยอ่านไฟล์
PROJECT_STATUS.md
Dashboard.jsx
DashboardHealth.jsx
DashboardOverview.jsx
DataEntry.jsx
DataEntryHealth.jsx
KPIGroup.jsx
ManageKPIs.jsx
App.jsx
main.jsx
supabase.js
ในโฟลเดอร์นี้ แล้วสรุปงานที่เราทำค้างไว้ล่าสุดให้หน่อย เพื่อความรวดเร็วและประหยัดโควตาความจำ
เพื่อใช้ในการพัฒนา
```

---

## 🗺️ แผนพัฒนาต่อยอด (Development Roadmap)

### 🔴 มิติที่ 1 — ฟีเจอร์หลักที่ยังขาด (Core Features)

#### 1.1 ระบบแก้ไขและลบข้อมูล (CRUD Complete)
> ⚠️ ตอนนี้ระบบทำได้แค่ **Create** — ยังขาด **Edit** และ **Delete**

| ฟีเจอร์ | แนวทาง | ความยาก |
|---|---|---|
| แก้ไข SDG indicator | Modal form + `supabase.update()` | ⭐⭐ |
| แก้ไข Health KPI | Modal form ต่อแถว | ⭐⭐ |
| ลบรายการ (Soft Delete) | เพิ่ม `is_deleted` column แทนลบจริง | ⭐ |
| Undo ลบ | Toast + 5 วิก่อน commit จริง | ⭐⭐ |

#### 1.2 ระบบ Export รายงาน
| รูปแบบ | Library |
|---|---|
| **Excel (.xlsx)** | `xlsx` (SheetJS) — Export ตาราง KPI พร้อม Conditional Color |
| **PDF** | `jspdf` + `html2canvas` — Screenshot Dashboard |
| **CSV** | Native JS |

#### 1.3 ระบบแจ้งเตือน (Alerts & Notifications)
- **Email Alert**: KPI ตกวิกฤติ → แจ้ง Email (Supabase Edge Functions + Resend)
- **In-app Notification Bell**: icon 🔔 ใน Layout + unread count
- **Deadline Reminder**: แจ้งเตือนก่อนสิ้นไตรมาส X วัน

---

### 🟡 มิติที่ 2 — ข้อมูลและการวิเคราะห์ (Data & Analytics)

#### 2.1 Historical Trend (ข้อมูลรายปี)
> ⚠️ ปัญหาปัจจุบัน: ตารางเก็บแค่ "ผลงานล่าสุด" — ไม่มี historical data

**Schema ที่แนะนำ: เพิ่มตาราง `kpi_snapshots`**
```sql
CREATE TABLE kpi_snapshots (
  id           bigserial PRIMARY KEY,
  source_table text NOT NULL,       -- 'sdg_indicators' | 'health_indicators'
  source_id    bigint NOT NULL,
  year         int NOT NULL,
  quarter      int,                  -- 1-4 หรือ NULL (annual)
  performance  numeric,
  created_at   timestamptz DEFAULT now()
);
```
UI ที่จะได้: Line Chart trend รายปี/ไตรมาส + Year-over-Year comparison

#### 2.2 ระบบเปรียบเทียบ (Benchmark)
- เปรียบเทียบเขตสุขภาพ vs ค่าเฉลี่ยประเทศ (outperform / underperform)
- Ranking Table จัดอันดับเขตสุขภาพ 1–13 รายตัวชี้วัด

#### 2.3 Predictive Status
- คำนวณ "ถ้าโตในอัตราเดิม จะถึงเป้าปี 2573 ไหม"
- แสดง **Projected Line** (เส้นประ) ใน Trend Chart

---

### 🔵 มิติที่ 3 — UX/UI & Accessibility

#### 3.1 หน้าใหม่ที่ควรเพิ่ม
| หน้า | Route | จุดประสงค์ |
|---|---|---|
| **Executive Summary** | `/exec` | Print-ready 1 หน้า A4 สำหรับผู้บริหาร |
| **Compare View** | `/compare` | เปรียบเทียบ 2 ตัวชี้วัด/เขต เคียงข้างกัน |
| **Timeline View** | `/timeline` | KPI trend รายไตรมาส (ต้องมี snapshots) |
| **Watchlist** | `/watchlist` | Pin ตัวชี้วัดที่สนใจส่วนตัว |

#### 3.2 อื่นๆ
- **Dark Mode**: Toggle + `localStorage` เก็บ preference
- **Mobile Responsive**: Bottom Navigation + Table → Card view บนจอเล็ก
- **Count-up Animation**: hook `useCountUp` มีอยู่แล้ว → ต่อเข้ากับตัวเลขใน Hero

---

### 🟢 มิติที่ 4 — ความปลอดภัย (Auth & Security)

> ⚠️ **ด่วน: ตอนนี้ไม่มี Login — ใครก็เข้า DataEntry ได้!**

#### ระดับสิทธิ์ที่แนะนำ
| Role | สิทธิ์ |
|---|---|
| `viewer` | ดู Dashboard อย่างเดียว |
| `editor` | ดู + บันทึกข้อมูล |
| `admin` | ทุกอย่าง รวม Bulk Import + Delete |

#### Schema: Audit Log
```sql
CREATE TABLE audit_log (
  id         bigserial PRIMARY KEY,
  user_email text,
  action     text,   -- 'INSERT' | 'UPDATE' | 'DELETE'
  table_name text,
  record_id  bigint,
  old_data   jsonb,
  new_data   jsonb,
  created_at timestamptz DEFAULT now()
);
```

---

### ⚡ มิติที่ 5 — Performance & Scalability

- **Supabase Realtime**: Dashboard auto-refresh เมื่อคนอื่น update ข้อมูล
- **เพิ่ม Index**: บน `indicator_name`, `region`, `category` ที่ filter บ่อย
- **Select เฉพาะคอลัมน์**: แทน `select('*')` เมื่อตารางใหญ่ขึ้น
- **Virtual List** (`@tanstack/react-virtual`): กรณี KPI เกิน 500 แถว

---

### 🏗️ มิติที่ 6 — Architecture & Code Quality

> ⚠️ `evaluateStatus()` มีโค้ดซ้ำกันใน **3 ไฟล์** — ควร Extract ออกมา

```
src/
  utils/
    statusConfig.js      ← STATUS_CONFIG + evaluateStatus ร่วมกันทุก page
    quarterHelper.js     ← getCurrentQuarter() ร่วมกัน
  components/ui/
    StatusBadge.jsx      ← Badge สถานะ (ใช้ทุก page)
    DonutRing.jsx        ← แยกออกจาก DashboardOverview
    ProgressBar.jsx      ← ใช้ใน KPIGroup + Dashboard
    StatCard.jsx         ← ใช้ใน KPIGroup + DashboardHealth
    ConfirmModal.jsx     ← Modal ยืนยันลบ
```

---

### 🌐 มิติที่ 7 — DevOps & Deployment

- **GitHub Actions**: CI build check ทุก push
- **Sentry**: Error tracking (`npm install @sentry/react`)
- **Vercel Analytics**: Core Web Vitals
- **Database Backup**: `supabase db dump` รายวัน

---

### 📱 มิติที่ 8 — External Integration

- **LINE Notify / LINE OA**: ส่งสรุปรายสัปดาห์ + แจ้ง KPI วิกฤติทันที
- **Supabase Edge Functions**: Serverless trigger เมื่อมี status = `failed_0`
- **Looker Studio**: ต่อ Supabase → BI Tool เพยแพร่สาธารณะ

---

## 🎯 ลำดับความสำคัญ (Priority)

| # | ฟีเจอร์ | ประโยชน์ | เวลาโดยประมาณ |
|---|---|---|---|
| 🔴 P0 | Edit / Delete KPI | ความสมบูรณ์ CRUD | 1–2 วัน |
| 🔴 P0 | Supabase Auth + Login + RLS | ความปลอดภัย | 2–3 วัน |
| 🟡 P1 | Export Excel / PDF | ใช้งานจริงในองค์กร | 1 วัน |
| 🟡 P1 | Historical Snapshots + Trend Chart | วิเคราะห์ข้อมูลย้อนหลัง | 3–5 วัน |
| 🔵 P2 | Supabase Realtime | Multi-user UX | 1 วัน |
| 🔵 P2 | Extract Shared Components | Code quality | 2 วัน |
| 🔵 P2 | Count-up Animation (hook มีอยู่แล้ว) | Visual polish | ครึ่งวัน |
| 🟢 P3 | Dark Mode | Nice to have | 1–2 วัน |
| 🟢 P3 | Mobile Responsive | Nice to have | 3 วัน |
| 🟢 P3 | Notification System | Advanced | 3–5 วัน |

---

## 💬 คำสั่งเริ่มพัฒนาฟีเจอร์ถัดไป (Quick Start Prompts)

**P0 — Edit/Delete KPI:**
```
ช่วยเพิ่มฟีเจอร์ Edit และ Delete ใน DashboardHealth.jsx
ให้มีปุ่ม Edit ต่อแถวใน KPI List เมื่อกดให้เปิด Modal Form (pre-filled)
และบันทึกผ่าน supabase.update() พร้อม Confirm Modal ก่อน delete
```

**P0 — Auth & Login:**
```
ช่วยเพิ่มระบบ Login ด้วย Supabase Auth แบบ Email/Password
ให้มีหน้า /login และทำ Protected Route ครอบทุก page ยกเว้น /login
```

**P1 — Export Excel:**
```
ช่วยเพิ่มปุ่ม Export Excel ในหน้า Dashboard.jsx (SDGs)
ใช้ library xlsx (SheetJS) export ข้อมูลตาราง KPI พร้อม header ภาษาไทย
```

**P1 — Historical Snapshots:**
```
ช่วยสร้างตาราง kpi_snapshots ใน Supabase และเพิ่มปุ่ม "บันทึก Snapshot"
ในหน้า DataEntry.jsx พร้อม Trend Line Chart ในหน้า Dashboard.jsx
```

---

## 🛑 Decision Checklist — ก่อนเริ่มพัฒนา Edit / Delete

> ✅ **ตัดสินใจแล้ว 2026-04-09** — พร้อมพัฒนา

### ✅ Q1 — ขอบเขต
- [x] `sdg_indicators` (SDGs) **เท่านั้น** — Health KPI ทำภายหลัง

### ✅ Q2 — UI: หน้าใหม่แยกต่างหาก
- [x] **สร้างหน้าใหม่ `/manage/sdgs`** (ManageSDGs.jsx) — Separation of Concerns
- [ ] ~~DataEntry, KPIGroup, ManageKPIs~~ ไม่แตะ

### ✅ Q3 — Health KPI
- ยังไม่ทำ Health KPI ในรอบนี้

### ✅ Q4 — Delete แบบ Soft Delete
- [x] **Soft Delete** — เพิ่ม column `is_deleted boolean DEFAULT false` ใน `sdg_indicators`
- [x] Toast Undo 5 วิก่อน commit จริง

### ✅ Q5 — สิทธิ์
- [x] ทำ Edit/Delete เลย (ใช้ภายในองค์กร) — เพิ่ม Auth ทีหลัง

### ✅ Q6 — Fields ที่แก้ได้ (ทุก field ยกเว้น `id`)
- [x] `current_performance` — ผลงานปัจจุบัน
- [x] `target_2030` — เป้าหมายปี 2573
- [x] `indicator_name` — ชื่อตัวชี้วัด
- [x] `category` — เป้าหมายย่อย
- [x] `description` — หมายเหตุ

---

### 🗂️ สิ่งที่ต้องทำก่อนเขียนโค้ด (Pre-Development Steps)

#### Step 1 — Supabase: เพิ่ม Column `is_deleted`
```sql
ALTER TABLE sdg_indicators
ADD COLUMN is_deleted boolean NOT NULL DEFAULT false;
```
> รัน SQL นี้ใน Supabase Dashboard → SQL Editor ก่อน

#### Step 2 — สร้างไฟล์ใหม่
```
src/pages/ManageSDGs.jsx     ← หน้าจัดการ SDGs (ใหม่)
```

#### Step 3 — เพิ่ม Route ใน App.jsx
```jsx
<Route path="manage/sdgs" element={<ManageSDGs />} />
```

#### Step 4 — เพิ่มเมนูใน Layout (Sidebar/Nav)
```
🔧 จัดการข้อมูล SDGs  →  /manage/sdgs
```

---

### 🎨 UI Design ของหน้า `/manage/sdgs`

```
┌─────────────────────────────────────────────────────┐
│  🗂️ จัดการตัวชี้วัด SDGs          [+ เพิ่มใหม่]  │
│  จำนวน N รายการ  |  [🔍 ค้นหา...]               │
├──────┬──────────────────┬──────────┬────────┬───────┤
│ เป้า │ ชื่อตัวชี้วัด   │ เป้าหมาย│ผลงาน  │ Action│
├──────┼──────────────────┼──────────┼────────┼───────┤
│ 3.3  │ [ชื่อ..........] │ [≤ 0.2] │ [0.13] │ ✏️ 🗑️│
│ 3.3  │ [ชื่อ..........] │ [≤ 20]  │ [146]  │ ✏️ 🗑️│
└──────┴──────────────────┴──────────┴────────┴───────┘
         ↓ กด ✏️                    ↓ กด 🗑️
    [Row เปลี่ยนเป็น               [Toast แจ้งเตือน
     Input แก้ไข inline]            พร้อมปุ่ม Undo 5 วิ]
    [💾 Save] [✕ Cancel]           [ยืนยันลบ / Cancel]
```

---

> **Prompt สำหรับเริ่มเขียนโค้ด:**
> ```
> ดู PROJECT_STATUS.md หัวข้อ "Decision Checklist"
> และ "UI Design ของหน้า /manage/sdgs"
> แล้วช่วยเริ่มพัฒนา:
> 1. เพิ่ม column is_deleted ใน Supabase (แสดง SQL)
> 2. สร้าง ManageSDGs.jsx ตาม design ที่กำหนด
> 3. เพิ่ม Route ใน App.jsx
> ```


---

## 🏥 Decision Checklist — Health KPI Edit/Delete (2026-04-09)

> ✅ **ตัดสินใจแล้ว — พัฒนาเสร็จแล้ว**

### ✅ สิ่งที่ทำเสร็จแล้ว

| รายการ | สถานะ |
|---|---|
| เพิ่ม `is_deleted` ใน `health_indicators` | ✅ รัน SQL แล้ว |
| สร้างหน้า `/manage/health` (ManageHealth.jsx) | ✅ สร้างแล้ว |
| Master-Detail Pattern (indicator → region) | ✅ ใช้งานได้ |
| เรียงเขตแบบ Numeric (1→2→...→13) | ✅ แก้แล้ว |
| Soft Delete + Undo 5 วิ | ✅ ใช้งานได้ |
| เพิ่ม Route + Sidebar menu | ✅ เพิ่มแล้ว |
| DashboardHealth: เพิ่ม `is_deleted` filter | ✅ แก้แล้ว |
| DashboardHealth: แก้ staleTime เป็น 0 | ✅ แก้แล้ว |

### ✅ ความเข้าใจเรื่องการคำนวณ

```
ระบบใช้ Priority ในการแสดงผล:
  1. ถ้ามี A และ B (B > 0)  → คำนวณ (A/B)×100 อัตโนมัติ
  2. ถ้าไม่มี A,B แต่มี performance → ใช้ performance โดยตรง
  3. ถ้าเขตมีแค่ "รายงานภาพรวม" 1 แถว → ใช้ performance เทียบเกณฑ์

ดังนั้น:
  - กรอบ A, B → ระบบคำนวณเอง (ไม่ต้องกรอก performance)
  - ถ้าอยากกรอก performance ตรงๆ → ต้องล้าง A, B ออก (ให้ B = 0)
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

### ตัวอย่างตัวชี้วัดแต่ละประเภท

| ตัวชี้วัด | calc_type | กรอก | ระบบแสดง |
|---|---|---|---|
| อัตราผู้ป่วย TB ต่อแสนประชากร | `ratio` | A=120, B=200,000 | 0.06% |
| ความครอบคลุมวัคซีน | `ratio` | A=850, B=1,000 | 85.0% |
| คะแนน ITA | `direct` | performance=87.5 | 87.5 |
| ดัชนีภาพรวมจากกระทรวง | `direct` | performance=72.3 | 72.3 |

### SQL ที่ต้องรัน (เมื่อพร้อมพัฒนา)

```sql
-- Option A: เพิ่มใน health_indicators โดยตรง
ALTER TABLE health_indicators
ADD COLUMN calc_type text NOT NULL DEFAULT 'ratio'
CHECK (calc_type IN ('ratio', 'direct'));

-- Option B (แนะนำ): ตารางแม่แยกต่างหาก
CREATE TABLE health_kpi_definitions (
  indicator_name  text PRIMARY KEY,
  calc_type       text DEFAULT 'ratio' CHECK (calc_type IN ('ratio','direct')),
  multiplier      numeric DEFAULT 100, -- ×100 หรือ ×1,000 (ต่อแสน)
  description     text,
  created_at      timestamptz DEFAULT now()
);
```

### ไฟล์ที่ต้องแก้เมื่อพัฒนา calc_type

```
1. DataEntryHealth.jsx  → แสดง/ซ่อน field A,B ตาม calc_type
2. ManageHealth.jsx     → แสดง/ซ่อน field A,B ตาม calc_type
3. DashboardHealth.jsx  → เลือกสูตรตาม calc_type (ไม่ต้อง "เดา")
```

---

## 🔮 Next Steps ที่แนะนำ (Priority Order)

| ลำดับ | งาน | ความสำคัญ |
|---|---|---|
| 1 | ทดสอบ ManageHealth กับข้อมูลจริงครบทุกตัวชี้วัด | 🔴 สูง |
| 2 | เพิ่มฟีเจอร์ Auth / Login ป้องกัน `/manage/*` | 🟡 กลาง |
| 3 | พัฒนา `calc_type` Architecture | 🟢 ต่ำ (Future) |
| 4 | Historical Snapshots (บันทึกข้อมูลย้อนหลัง) | 🟢 ต่ำ (Future) |
| 5 | ManageHealth สำหรับ health_indicators Health KPI | ✅ เสร็จแล้ว |

---

*จัดทำโดย: Pichet | อัปเดตล่าสุด: 2026-04-09*
>>>>>>> vercel-ready
