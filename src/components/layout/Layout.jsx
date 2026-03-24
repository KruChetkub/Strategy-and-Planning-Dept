import React, { useState, useEffect } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { Menu, X } from 'lucide-react';
import Sidebar from './Sidebar';

export default function Layout() {
  // เริ่มต้นให้เปิดบนหน้าจอใหญ่ และปิดบนจอมือถือ
  const [isOpen, setIsOpen] = useState(window.innerWidth >= 1024);
  const location = useLocation();

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

      {/* Mobile Overlay สำหรับกดคลิกเพื่อปิดแถบด้านนอก */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-40 lg:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* แถบ Sidebar ที่พับเข้า/ออก ได้ (Collapsible / Off-canvas) */}
      <div className={`
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
        <div className="flex items-center px-4 h-16 bg-white/50 backdrop-blur-md border-b border-slate-200 z-30 shrink-0">
          <button 
            onClick={() => setIsOpen(!isOpen)} 
            className="p-2.5 rounded-xl bg-slate-100 border border-slate-200 hover:bg-slate-200 hover:border-cyan-300 text-slate-500 hover:text-cyan-700 transition-all shadow-sm group"
            title="พับ/กาง แถบเมนูด้านข้าง (Hamburger Menu)"
          >
            {isOpen && window.innerWidth < 1024 ? (
              <X size={20} className="group-hover:rotate-90 transition-transform duration-300" />
            ) : (
              <Menu size={20} className="group-hover:scale-110 transition-transform" />
            )}
          </button>
          
          <div className="ml-4 truncate">
             <h1 className="text-xl font-black text-transparent bg-clip-text bg-gradient-to-r from-emerald-600 to-cyan-600 tracking-wider">KPI System</h1>
          </div>
        </div>

        {/* หน้าจอแดชบอร์ดที่ Render ภายใน Outlet */}
        <main className="flex-1 overflow-y-auto p-4 md:p-8 custom-scrollbar relative">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
