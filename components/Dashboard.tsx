
import React from 'react';
import { MOCK_ROOMS, MOCK_BOOKINGS } from '../constants';
import { IconRevenue, IconOccupancy, IconBookings, IconTrendingUp } from './Icons';

const Dashboard: React.FC = () => {
  const totalRooms = MOCK_ROOMS.length;
  const occupiedRooms = MOCK_ROOMS.filter(r => r.status === 'Occupied').length;
  const pendingBookings = MOCK_BOOKINGS.filter(b => b.status === 'Pending').length;
  
  // 模拟今日数据
  const todayBookings = 12; // 今日新订
  const todayCheckins = 8;   // 今日入住

  const stats = [
    { label: '今日预订', value: todayBookings.toString(), trend: '+4', color: 'text-blue-500', icon: <IconBookings /> },
    { label: '今日入住', value: todayCheckins.toString(), trend: '+2', color: 'text-sky-500', icon: <IconOccupancy /> },
    { label: '今日实时营收', value: '¥2,450', trend: '+12%', color: 'text-emerald-500', icon: <IconRevenue /> },
    { label: '待处理订单', value: pendingBookings.toString(), trend: '+1', color: 'text-orange-500', icon: <IconBookings /> },
  ];

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      {/* 数据概览卡片 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, i) => (
          <div key={i} className="bg-white p-5 rounded-2xl shadow-sm border border-slate-100 relative overflow-hidden group">
            <div className="relative z-10">
              <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest">{stat.label}</p>
              <div className="flex items-baseline gap-2 mt-1">
                <h3 className="text-2xl font-black text-slate-900 tracking-tighter">{stat.value}</h3>
                <span className={`text-[10px] font-bold ${stat.color} flex items-center gap-0.5`}>
                  <IconTrendingUp /> {stat.trend}
                </span>
              </div>
            </div>
            <div className={`absolute right-3 bottom-3 opacity-10 group-hover:opacity-20 transition-opacity text-slate-900 scale-90`}>
              {stat.icon}
            </div>
          </div>
        ))}
      </div>

      {/* 待处理订单列表 */}
      <div className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden">
        <div className="px-8 py-5 border-b border-slate-50 flex justify-between items-center bg-slate-50/30">
          <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
            <span className="w-1.5 h-4 bg-blue-600 rounded-full"></span>
            待处理订单
          </h3>
          <span className="bg-blue-600 text-white px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider">
            {pendingBookings} 个待确认
          </span>
        </div>
        
        <div className="px-4 py-2 divide-y divide-slate-50">
          {MOCK_BOOKINGS.filter(b => b.status === 'Pending').map((booking) => (
            <div key={booking.id} className="p-3 hover:bg-slate-50 flex items-center justify-between transition-all rounded-xl my-1 group">
              <div className="flex items-center gap-4">
                <div className="w-11 h-11 rounded-xl bg-slate-100 text-slate-400 flex items-center justify-center font-black text-lg border border-slate-200 group-hover:bg-white group-hover:border-blue-100 group-hover:text-blue-500 transition-colors">
                  {booking.guestName[0]}
                </div>
                <div>
                  <h4 className="font-bold text-slate-900 text-sm leading-tight">{booking.guestName}</h4>
                  <p className="text-[11px] text-slate-500 font-medium mt-0.5">
                    房号: <span className="text-slate-700 font-bold">{booking.roomNumber}</span> • 
                    入住: <span className="text-slate-700">{booking.checkIn}</span> • 
                    预付: <span className="text-emerald-600 font-bold">¥{booking.amount}</span>
                  </p>
                </div>
              </div>
              <div className="flex gap-2">
                <button className="px-5 py-2 bg-slate-900 text-white rounded-lg text-[11px] font-bold hover:bg-slate-800 transition-all shadow-sm">批准</button>
                <button className="px-5 py-2 border border-slate-200 text-slate-600 rounded-lg text-[11px] font-bold hover:bg-white hover:border-slate-300 transition-all">驳回</button>
              </div>
            </div>
          ))}
          {pendingBookings === 0 && (
            <div className="py-12 text-center">
              <p className="text-slate-400 text-sm font-medium">暂无待处理订单</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
