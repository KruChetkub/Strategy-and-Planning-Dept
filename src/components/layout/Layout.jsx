import React, { useState, useEffect } from 'react';
import { Outlet, useLocation, NavLink, useNavigate } from 'react-router-dom';
import { Menu, X } from 'lucide-react';
import Sidebar from './Sidebar';
import { useAuth } from '../../context/AuthContext';
import kpiSystemLogo from '../../assets/logoCopyDsp.png';

export default function Layout() {
  const { isAuthenticated, isAdmin, signOut } = useAuth();
  const navigate = useNavigate();
  // เริ่มต้นให้เปิดบนหน้าจอใหญ่ และปิดบนจอมือถือ
  const [isOpen, setIsOpen] = useState(window.innerWidth >= 1024);
  const location = useLocation();
  const currentView = new URLSearchParams(location.search).get('view') || 'redesign';
  const isOverviewRedesign = location.pathname === '/' && currentView !== 'classic';

  const sectionTabs = [
    ['goals', 'เป้าหมาย SDGs'],
    ['summary', 'ผลการดำเนินงาน'],
    ['coverage', 'สัดส่วนข้อมูล'],
    ['distribution', 'ความน่าเชื่อถือ'],
    ['province', 'แผนที่จังหวัด'],
    ['insights', 'บทประชาสัมพันธ์'],
    ['timeline', 'เส้นทาง 2573'],
  ];
  const mainTopTabs = [
    { label: 'สรุปผล (รวม)', path: '/' },
    { label: 'ตัวชี้วัด SDGs', path: '/sdgs' },
    { label: 'Health KPI', path: '/healthkpi' },
  ];
  const adminTopTabs = [
    { label: 'บันทึก SDGs', path: '/entry' },
    { label: 'บันทึก Health', path: '/entry-health' },
    { label: 'จัดการ SDGs', path: '/manage/sdgs' },
    { label: 'จัดการ Health', path: '/manage/health' },
  ];

  const scrollToSection = (id) => {
    const el = document.getElementById(id);
    const mainEl = document.querySelector('main');
    if (!el || !mainEl) return;
    const targetTop = Math.max(0, el.offsetTop - 20);
    mainEl.scrollTo({ top: targetTop, behavior: 'smooth' });
  };

  // ปิดเมนูอัติโนมัติบนมือถือเวลากดเปลี่ยนหน้าเพจ
  useEffect(() => {
    if (window.innerWidth < 1024) {
      setIsOpen(false);
    }
  }, [location.pathname]);

  // ซิงค์การเปิด/ปิด เมื่อย่อขยายหน้าจอ
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 1024) {
        setIsOpen(true);
      } else {
        setIsOpen(false);
      }
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return (
    <div className="flex h-screen bg-slate-50 text-slate-900 font-sans relative overflow-hidden">
      {/* Background glowing blobs */}
      <div className="absolute top-[-10%] left-[20%] w-[40%] h-[40%] rounded-full bg-blue-200/50 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[10%] w-[30%] h-[40%] rounded-full bg-cyan-200/50 blur-[100px] pointer-events-none" />
      <div className="absolute top-[40%] left-[-10%] w-[20%] h-[30%] rounded-full bg-emerald-200/50 blur-[100px] pointer-events-none" />

      {/* Mobile Overlay (ซ่อนไว้ - โครงเดิมยังอยู่เพื่อไม่กระทบการเชื่อมโยง) */}
      {false && isOpen && (
        <div 
          className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-40 lg:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Sidebar เดิม (ซ่อนไว้ชั่วคราวตามคำสั่ง แต่ไม่ลบโค้ด) */}
      <div className={`
        hidden
        fixed inset-y-0 left-0 z-50 lg:static
        transform transition-all duration-300 ease-in-out
        ${isOpen ? 'translate-x-0 w-64' : '-translate-x-full lg:translate-x-0 lg:w-0 overflow-hidden'}
        bg-white/95 lg:bg-white/80 border-r border-slate-200 backdrop-blur-xl shadow-[10px_0_30px_rgba(0,0,0,0.05)] lg:shadow-none
      `}>
        {/* ส่ง prop เพื่อให้ Sidebar มีปุ่มวงกลมกากบาท ปิดตัวมันเองได้บนมือถือ */}
        <div className="min-w-[16rem] h-full">
           <Sidebar onClose={() => setIsOpen(false)} isMobile={window.innerWidth < 1024} />
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col h-screen overflow-hidden z-10 relative w-full transition-all duration-300">
        
        {/* แถบขอบด้านบนคล้าย Topbar เพื่อใส่ปุ่มแฮมเบอร์เกอร์ */}
        <div className="sticky top-0 h-16 border-b border-slate-700/60 z-50 shrink-0 overflow-hidden">
          <div
            className="absolute inset-0"
            style={{
              background:
                "linear-gradient(120deg, #031434 0%, #0b2a5a 55%, #134173 100%)",
            }}
          />
          <div
            className="absolute inset-0 opacity-25"
            style={{
              backgroundImage:
                "radial-gradient(circle at 1px 1px, rgba(255,255,255,0.45) 1px, transparent 0)",
              backgroundSize: "22px 22px",
            }}
          />
          <div className="relative h-full grid grid-cols-[auto_1fr_auto] items-center gap-3 px-4">
          {/* ปุ่มเดิมซ่อนไว้เพื่อคงโครง */}
          <button 
            onClick={() => setIsOpen(!isOpen)} 
            className="hidden p-2.5 rounded-xl bg-slate-100 border border-slate-200 hover:bg-slate-200 hover:border-cyan-300 text-slate-500 hover:text-cyan-700 transition-all shadow-sm group"
            title="พับ/กาง แถบเมนูด้านข้าง (Hamburger Menu)"
          >
            {isOpen && window.innerWidth < 1024 ? (
              <X size={20} className="group-hover:rotate-90 transition-transform duration-300" />
            ) : (
              <Menu size={20} className="group-hover:scale-110 transition-transform" />
            )}
          </button>

          <NavLink to="/" className="truncate shrink-0" title="กลับหน้าแรก">
            <img
              src={kpiSystemLogo}
              alt="KPI System"
              className="h-12 w-auto rounded-md"
            />
          </NavLink>

          <div className="flex justify-center overflow-x-auto">
            <div className="flex items-center gap-2 min-w-max whitespace-nowrap">
              {mainTopTabs.map((tab) => (
                <NavLink
                  key={tab.path}
                  to={tab.path}
                  className={({ isActive }) =>
                    `px-3 py-1.5 text-xs font-black rounded-lg whitespace-nowrap transition-colors ${
                      isActive
                        ? 'bg-cyan-100 text-cyan-900 border border-cyan-200'
                        : 'bg-white/15 text-slate-100 border border-white/15 hover:bg-white/25'
                    }`
                  }
                >
                  {tab.label}
                </NavLink>
              ))}
              {isAdmin && (
                <div className="mx-1 h-6 w-px bg-white/25" />
              )}
              {isAdmin &&
                adminTopTabs.map((tab) => (
                  <NavLink
                    key={tab.path}
                    to={tab.path}
                    className={({ isActive }) =>
                      `px-3 py-1.5 text-xs font-black rounded-lg whitespace-nowrap transition-colors ${
                        isActive
                          ? 'bg-amber-100 text-amber-900 border border-amber-200'
                          : 'bg-white/10 text-amber-100 border border-white/15 hover:bg-white/25'
                      }`
                    }
                  >
                    {tab.label}
                  </NavLink>
                ))}
              {false && isOverviewRedesign && (
                <div className="mx-1 h-6 w-px bg-slate-200" />
              )}
              {false && isOverviewRedesign &&
                sectionTabs.map(([id, label]) => (
                  <button
                    key={id}
                    type="button"
                    onClick={() => scrollToSection(id)}
                    className="px-3 py-1.5 text-xs font-black text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg whitespace-nowrap transition-colors"
                  >
                    {label}
                  </button>
                ))}
            </div>
          </div>

          <div className="shrink-0">
            {isAuthenticated ? (
              <button
                onClick={() => signOut()}
                className="px-3 py-1.5 text-xs font-black rounded-lg border border-rose-300/70 text-rose-100 bg-rose-500/20 hover:bg-rose-500/30 transition-colors"
              >
                ออกจากระบบ
              </button>
            ) : (
              <button
                onClick={() => navigate('/admin/login')}
                className="px-3 py-1.5 text-xs font-black rounded-lg border border-cyan-300/70 text-cyan-50 bg-cyan-500/25 hover:bg-cyan-500/35 transition-colors"
              >
                เข้าสู่ระบบ Admin
              </button>
            )}
          </div>
          </div>
        </div>

        {/* หน้าจอแดชบอร์ดที่ Render ภายใน Outlet */}
        <main className="flex-1 overflow-y-auto px-4 pb-4 pt-0 md:px-8 md:pb-8 md:pt-0 custom-scrollbar relative">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
