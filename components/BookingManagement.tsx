
import React, { useState } from 'react';
import { MOCK_BOOKINGS } from '../constants';
import { Booking } from '../types';

const BookingManagement: React.FC = () => {
  const [bookings, setBookings] = useState<Booking[]>(MOCK_BOOKINGS);
  const [filter, setFilter] = useState<string>('全部');
  const [searchTerm, setSearchTerm] = useState('');

  const statusMap: Record<string, string> = {
    '全部': 'All',
    '待确认': 'Pending',
    '已确认': 'Confirmed',
    '已入住': 'Checked-in',
    '已离店': 'Checked-out',
    '已取消': 'Cancelled'
  };

  const getStatusConfig = (status: Booking['status']) => {
    switch (status) {
      case 'Pending': return { label: '待确认', color: 'bg-orange-50 text-orange-600 border-orange-100' };
      case 'Confirmed': return { label: '已确认', color: 'bg-blue-50 text-blue-600 border-blue-100' };
      case 'Checked-in': return { label: '已入住', color: 'bg-emerald-50 text-emerald-600 border-emerald-100' };
      case 'Checked-out': return { label: '已离店', color: 'bg-slate-100 text-slate-500 border-slate-200' };
      case 'Cancelled': return { label: '已取消', color: 'bg-rose-50 text-rose-600 border-rose-100' };
      default: return { label: status, color: 'bg-slate-50 text-slate-400' };
    }
  };

  const filteredBookings = bookings.filter(b => {
    const matchStatus = filter === '全部' || b.status === statusMap[filter];
    const matchSearch = b.guestName.includes(searchTerm) || b.id.includes(searchTerm);
    return matchStatus && matchSearch;
  });

  const updateStatus = (id: string, newStatus: Booking['status']) => {
    setBookings(prev => prev.map(b => b.id === id ? { ...b, status: newStatus } : b));
  };

  return (
    <div className="space-y-8 animate-in slide-in-from-bottom-4 duration-500">
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-slate-100 pb-8">
        <div className="flex gap-4">
           <div className="relative">
             <input 
               type="text" 
               placeholder="搜索住客姓名 / 订单号" 
               className="pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 w-64 transition-all"
               value={searchTerm}
               onChange={(e) => setSearchTerm(e.target.value)}
             />
             <svg className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
           </div>
        </div>
      </header>

      <div className="flex items-center gap-1.5 p-1.5 bg-slate-100 rounded-2xl w-fit">
        {Object.keys(statusMap).map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-5 py-2 rounded-xl text-xs font-bold transition-all ${
              filter === f ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-500 hover:text-slate-900'
            }`}
          >
            {f}
          </button>
        ))}
      </div>

      <div className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/50 border-b border-slate-100">
                <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">订单信息</th>
                <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">房型房号</th>
                <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">预订日期</th>
                <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">支付金额</th>
                <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">状态</th>
                <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">操作</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {filteredBookings.length > 0 ? filteredBookings.map((booking) => {
                const config = getStatusConfig(booking.status);
                return (
                  <tr key={booking.id} className="hover:bg-slate-50/50 transition-colors group">
                    <td className="px-8 py-6">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center font-bold text-slate-500 border border-slate-200">
                          {booking.guestName[0]}
                        </div>
                        <div>
                          <div className="text-sm font-bold text-slate-900">{booking.guestName}</div>
                          <div className="text-[10px] text-slate-400 font-medium mt-0.5">ID: {booking.id}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-8 py-6">
                      <div className="text-sm font-bold text-slate-700">{booking.roomNumber}</div>
                      <div className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold">标准客房</div>
                    </td>
                    <td className="px-8 py-6">
                      <div className="text-sm font-medium text-slate-600">{booking.checkIn}</div>
                      <div className="text-[10px] text-slate-400 font-medium mt-1">至 {booking.checkOut}</div>
                    </td>
                    <td className="px-8 py-6">
                      <div className="text-sm font-black text-slate-900">¥{booking.amount}</div>
                      <div className="text-[10px] text-emerald-500 font-bold uppercase">已支付</div>
                    </td>
                    <td className="px-8 py-6">
                      <span className={`px-3 py-1 rounded-lg text-[10px] font-black border uppercase tracking-widest ${config.color}`}>
                        {config.label}
                      </span>
                    </td>
                    <td className="px-8 py-6 text-right">
                      <div className="flex justify-end gap-2">
                        {booking.status === 'Pending' && (
                          <>
                            <button onClick={() => updateStatus(booking.id, 'Confirmed')} className="px-4 py-2 bg-blue-600 text-white rounded-lg text-[11px] font-bold hover:bg-blue-700 transition-all">确认</button>
                            <button onClick={() => updateStatus(booking.id, 'Cancelled')} className="px-4 py-2 border border-slate-200 text-slate-600 rounded-lg text-[11px] font-bold hover:bg-white hover:border-slate-300 transition-all">拒绝</button>
                          </>
                        )}
                        {booking.status === 'Confirmed' && (
                          <button onClick={() => updateStatus(booking.id, 'Checked-in')} className="px-4 py-2 bg-emerald-600 text-white rounded-lg text-[11px] font-bold hover:bg-emerald-700 transition-all">入住</button>
                        )}
                        {booking.status === 'Checked-in' && (
                          <button onClick={() => updateStatus(booking.id, 'Checked-out')} className="px-4 py-2 bg-slate-900 text-white rounded-lg text-[11px] font-bold hover:bg-slate-800 transition-all">退房</button>
                        )}
                        <button className="p-2 text-slate-400 hover:text-slate-600 transition-colors">
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" /></svg>
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              }) : (
                <tr>
                  <td colSpan={6} className="px-8 py-20 text-center text-slate-400">
                    <div className="flex flex-col items-center">
                       <div className="w-16 h-16 bg-slate-50 rounded-2xl flex items-center justify-center mb-4">
                         <svg className="w-8 h-8 text-slate-200" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                       </div>
                       <p className="text-sm font-medium">未查询到相关订单</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default BookingManagement;
