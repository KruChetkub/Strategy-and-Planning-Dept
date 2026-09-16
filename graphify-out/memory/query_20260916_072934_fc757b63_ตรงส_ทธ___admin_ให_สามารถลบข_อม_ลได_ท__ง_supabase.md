---
type: "query"
date: "2026-09-16T07:29:34.504011+00:00"
question: "ตรงสิทธิ์ admin ให้สามารถลบข้อมูลได้ทั้ง Supabase และหน้า frontend และไม่นำรายการที่ลบไปแสดงหน้าเว็บ"
contributor: "graphify"
outcome: "useful"
source_nodes: ["ManageSDGs", "ManageHealth", "ProtectedAdminRoute", "AuthProvider"]
---

# Q: ตรงสิทธิ์ admin ให้สามารถลบข้อมูลได้ทั้ง Supabase และหน้า frontend และไม่นำรายการที่ลบไปแสดงหน้าเว็บ

## Answer

Expanded from original query via graph vocab: [admin, manage, kpis, sdgs, health, data, entry, protected, auth]. Graph traversal identified ManageSDGs, ManageHealth, ProtectedAdminRoute, and AuthProvider. Verified in source that admin management pages own deletion and public dashboards consume sdg_indicators/health_indicators; implemented hard delete plus cache invalidation and active-row filters.

## Outcome

- Signal: useful

## Source Nodes

- ManageSDGs
- ManageHealth
- ProtectedAdminRoute
- AuthProvider