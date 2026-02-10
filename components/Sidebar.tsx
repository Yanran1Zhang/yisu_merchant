
import React from 'react';
import { ViewType } from '../types';
import { IconDashboard, IconRooms, IconBookings, IconRevenue, IconInfo } from './Icons';

interface SidebarProps {
  currentView: ViewType;
  onViewChange: (view: ViewType) => void;
}

const Sidebar: React.FC<SidebarProps> = ({ currentView, onViewChange }) => {
  const menuItems: { id: ViewType; label: string; icon: React.ReactNode }[] = [
    { id: 'dashboard', label: '首页', icon: <IconDashboard /> },
    { id: 'bookings', label: '订单管理', icon: <IconBookings /> },
    { id: 'rooms', label: '房价房态', icon: <IconRooms /> },
    { id: 'analytics', label: '数据中心', icon: <IconRevenue /> },
    { id: 'info', label: '信息维护', icon: <IconInfo /> },
  ];

  return (
    <div className="w-64 h-screen bg-slate-50 text-slate-600 flex flex-col fixed left-0 top-0 border-r border-slate-200 z-50 transition-all">
      <div className="p-8 border-b border-slate-200/60">
        <div className="flex items-center gap-3">
          <div className="bg-blue-600 text-white w-10 h-10 rounded-xl flex items-center justify-center font-bold text-xl shadow-lg shadow-blue-600/20">
            易
          </div>
          <div className="flex flex-col">
            <span className="text-slate-900 font-bold text-lg tracking-tight">易宿</span>
            <span className="text-[10px] text-slate-400 uppercase tracking-widest font-bold">Merchant Hub</span>
          </div>
        </div>
      </div>
      
      <nav className="flex-1 mt-8 px-4 space-y-1.5 overflow-y-auto">
        {menuItems.map((item) => (
          <button
            key={item.id}
            onClick={() => onViewChange(item.id)}
            className={`w-full text-left px-5 py-3.5 rounded-2xl flex items-center gap-4 transition-all duration-300 group ${
              currentView === item.id 
                ? 'bg-white text-blue-600 shadow-sm ring-1 ring-slate-200 font-bold' 
                : 'hover:bg-slate-200/50 hover:text-slate-900'
            }`}
          >
            <div className={`transition-colors ${currentView === item.id ? 'text-blue-600' : 'text-slate-400 group-hover:text-slate-600'}`}>
              {item.icon}
            </div>
            <span className="text-sm">{item.label}</span>
            {currentView === item.id && (
              <div className="ml-auto w-1.5 h-1.5 rounded-full bg-blue-600"></div>
            )}
          </button>
        ))}
      </nav>

      <div className="p-6 mt-auto">
        <button 
          onClick={() => onViewChange('settings')}
          className="w-full bg-white p-4 rounded-2xl border border-slate-200/60 shadow-sm hover:border-blue-200 transition-colors text-left group"
        >
          <div className="text-[10px] text-slate-400 mb-2 uppercase font-black tracking-widest group-hover:text-blue-400 transition-colors">用户中心</div>
          <div className="flex items-center gap-3">
             <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center group-hover:bg-blue-50 transition-colors">
               <svg className="w-4 h-4 text-slate-400 group-hover:text-blue-500 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
             </div>
             <span className="text-xs font-bold text-slate-600 group-hover:text-blue-600 transition-colors">账户与设置</span>
          </div>
        </button>
      </div>
    </div>
  );
};

export default Sidebar;
