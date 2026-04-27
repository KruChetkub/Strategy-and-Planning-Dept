import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { LayoutDashboard, Activity, Settings, Edit, Target, X, Table2, HeartPulse, LogIn, LogOut } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export default function Sidebar({ onClose, isMobile }) {
  const { isAdmin, isAuthenticated, user, office, signOut } = useAuth();
  const navigate = useNavigate();

  const menuGroups = [
    {
      title: 'Main',
      items: [
        { label: 'แดชบอร์ดสรุปผล (รวม)', icon: LayoutDashboard, path: '/' },
        { label: 'แดชบอร์ดตัวชี้วัด SDGs', icon: Activity, path: '/sdgs' },
        { label: 'แดชบอร์ด Health KPI', icon: Target, path: '/healthkpi' },
      ],
    },
    isAdmin && {
      title: 'Admin',
      items: [
        { label: 'บันทึกข้อมูล SDGs',          icon: Edit,       path: '/entry' },
        { label: 'บันทึกข้อมูล Health KPI',     icon: Edit,       path: '/entry-health' },
        { label: 'จัดการข้อมูล SDGs',           icon: Table2,     path: '/manage/sdgs' },
        { label: 'จัดการข้อมูล Health KPI',     icon: HeartPulse, path: '/manage/health' },
        { label: 'ตั้งค่าระบบ',                 icon: Settings,   path: '/settings' },
      ],
    },
  ].filter(Boolean);

  return (
    <aside className="w-64 min-h-screen flex flex-col text-slate-700 relative h-full">
      <div className="h-16 flex items-center justify-between px-6 border-b border-slate-200">
        <h1 className="text-xl font-black tracking-widest text-transparent bg-clip-text bg-gradient-to-r from-cyan-600 to-blue-600 flex items-center gap-3">
          <Activity className="text-cyan-600" size={24} />
          เมนูหลัก
        </h1>
        {isMobile && (
          <button onClick={onClose} className="p-2 rounded-lg bg-slate-100 hover:bg-rose-100 text-slate-500 hover:text-rose-600 transition-colors">
            <X size={20} />
          </button>
        )}
      </div>
      
      <nav className="flex-1 overflow-y-auto py-8">
        {menuGroups.map((group, idx) => (
          <div key={idx} className="mb-8">
            <h2 className="px-8 text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-4">
              {group.title}
            </h2>
            <ul className="space-y-2 px-4">
              {menuGroups[idx].items.map((item, itemIdx) => (
                <li key={itemIdx}>
                  <NavLink
                    to={item.path}
                    className={({ isActive }) =>
                      `flex items-center gap-4 px-4 py-3 rounded-xl transition-all duration-300 ${
                        isActive
                          ? 'bg-gradient-to-r from-cyan-50 to-blue-50 text-cyan-700 shadow-[inset_3px_0_0_0_rgba(14,165,233,1)]'
                          : 'text-slate-600 hover:bg-slate-50 hover:text-cyan-700 hover:translate-x-1'
                      }`
                    }
                  >
                    <item.icon size={20} />
                    <span className="text-sm font-bold tracking-wide">{item.label}</span>
                  </NavLink>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </nav>
      
      {isAuthenticated ? (
        <div className="p-4 border-t border-slate-200 m-4 bg-slate-50 rounded-2xl flex flex-col gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center text-sm font-bold text-white shadow-md ring-2 ring-white shrink-0">
              {user?.email?.charAt(0).toUpperCase() || 'A'}
            </div>
            <div className="overflow-hidden">
              <p className="text-sm font-bold text-slate-800 tracking-wide truncate">{user?.email?.split('@')[0] || 'Admin User'}</p>
              <p className="text-xs text-slate-500 truncate">{office || 'Central Office'}</p>
            </div>
          </div>
          <button
            onClick={() => signOut()}
            className="w-full flex items-center justify-center gap-2 py-2 px-3 bg-white border border-slate-200 rounded-xl text-sm font-bold text-rose-600 hover:bg-rose-50 hover:border-rose-200 transition-colors"
          >
            <LogOut size={16} />
            <span>ออกจากระบบ</span>
          </button>
        </div>
      ) : (
        <div className="p-4 mt-auto mb-4 mx-4 border-t border-slate-200 pt-6">
          <button
            onClick={() => navigate('/admin/login')}
            className="w-full flex items-center justify-center gap-2 py-3 px-4 bg-gradient-to-r from-cyan-600 to-blue-600 rounded-2xl text-sm font-bold text-white shadow-md hover:shadow-lg hover:-translate-y-0.5 transition-all"
          >
            <LogIn size={18} />
            <span>เข้าสู่ระบบ Admin</span>
          </button>
        </div>
      )}
    </aside>
  );
}
