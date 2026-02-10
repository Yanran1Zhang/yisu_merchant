
import React, { useState } from 'react';
import { MOCK_ROOMS } from '../constants';
import { Room } from '../types';

interface RoomHistory {
  id: string;
  guest: string;
  checkIn: string;
  checkOut: string;
  amount: number;
}

const RoomManagement: React.FC = () => {
  const [rooms, setRooms] = useState<Room[]>(MOCK_ROOMS);
  const [filter, setFilter] = useState<string>('全部');
  const [selectedRoom, setSelectedRoom] = useState<Room | null>(null);
  const [statusPickingRoom, setStatusPickingRoom] = useState<Room | null>(null);
  const [newPrice, setNewPrice] = useState<number>(0);

  const filterMap: Record<string, string> = {
    '全部': 'All',
    '空闲': 'Available',
    '入住': 'Occupied',
    '打扫中': 'Cleaning',
    '维修中': 'Maintenance'
  };

  const reverseFilterMap: Record<string, string> = {
    'All': '全部',
    'Available': '空闲',
    'Occupied': '入住',
    'Cleaning': '打扫中',
    'Maintenance': '维修中'
  };

  const roomTypeMap: Record<string, string> = {
    'Single': '基础单人间',
    'Double': '标准双人间',
    'Suite': '商务套房',
    'Deluxe': '行政豪华间'
  };

  const mockHistory: RoomHistory[] = [
    { id: 'H001', guest: '张三', checkIn: '2024-04-12', checkOut: '2024-04-14', amount: 240 },
    { id: 'H002', guest: '王小华', checkIn: '2024-04-20', checkOut: '2024-04-21', amount: 120 },
    { id: 'H003', guest: '李雷', checkIn: '2024-05-01', checkOut: '2024-05-05', amount: 480 },
  ];

  const filteredRooms = filter === '全部' ? rooms : rooms.filter(r => r.status === filterMap[filter]);

  const getStatusStyle = (status: Room['status']) => {
    switch (status) {
      case 'Available': return 'bg-emerald-50 text-emerald-600 border-emerald-100 hover:bg-emerald-100';
      case 'Occupied': return 'bg-rose-50 text-rose-600 border-rose-100 hover:bg-rose-100';
      case 'Cleaning': return 'bg-amber-50 text-amber-600 border-amber-100 hover:bg-amber-100';
      case 'Maintenance': return 'bg-slate-100 text-slate-500 border-slate-200 hover:bg-slate-200';
      default: return 'bg-slate-50 text-slate-400 border-slate-100';
    }
  };

  const handleStatusUpdate = (roomId: string, newStatus: Room['status']) => {
    setRooms(prev => prev.map(r => r.id === roomId ? { ...r, status: newStatus } : r));
    setStatusPickingRoom(null);
  };

  const openDetails = (room: Room) => {
    setSelectedRoom(room);
    setNewPrice(room.price);
  };

  const handleUpdatePrice = () => {
    if (selectedRoom) {
      setRooms(prev => prev.map(r => r.id === selectedRoom.id ? { ...r, price: newPrice } : r));
      setSelectedRoom(null);
    }
  };

  return (
    <div className="space-y-6 animate-in slide-in-from-bottom-4 duration-500">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-100 pb-6">
        <h2 className="text-xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
        <p className="text-slate-500 text-sm mt-1">客房总数: <span className="font-bold text-slate-900">{rooms.length}</span> 间</p>
        </h2>
        <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-xl">
          {Object.keys(filterMap).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-4 py-2 rounded-lg text-xs font-bold transition-all whitespace-nowrap ${
                filter === f ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              {f}
            </button>
          ))}
        </div>
      </header>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {filteredRooms.map((room) => (
          <div key={room.id} className="bg-white rounded-3xl shadow-sm border border-slate-100 p-5 group hover:shadow-lg transition-all duration-300">
            <div className="flex justify-between items-start mb-5">
              <div>
                <span className="text-[10px] font-black text-blue-500 uppercase tracking-widest">UNIT {room.number}</span>
                <h3 className="text-sm font-bold text-slate-900 mt-0.5">{roomTypeMap[room.type] || room.type}</h3>
              </div>
              <button 
                onClick={() => setStatusPickingRoom(room)}
                className={`px-2.5 py-1 rounded-lg text-[10px] font-black border uppercase tracking-widest transition-all active:scale-95 cursor-pointer ${getStatusStyle(room.status)}`}
              >
                {reverseFilterMap[room.status] || room.status}
              </button>
            </div>
            
            <div className="flex flex-col gap-4">
              <div className="flex justify-between items-end">
                <div className="flex flex-col">
                  <span className="text-[10px] font-bold text-slate-400 uppercase">当前房价</span>
                  <span className="text-xl font-black text-slate-900 tracking-tighter">¥{room.price}</span>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-2">
                <button 
                  onClick={() => openDetails(room)}
                  className="py-2.5 bg-slate-50 text-slate-900 rounded-xl text-[10px] font-bold hover:bg-slate-100 transition-colors"
                >
                  详情与价格
                </button>
                <button 
                  onClick={() => setStatusPickingRoom(room)}
                  className="py-2.5 bg-blue-50 text-blue-600 rounded-xl text-[10px] font-bold hover:bg-blue-100 transition-colors"
                >
                  更改状态
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* 快捷状态切换模态框 */}
      {statusPickingRoom && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={() => setStatusPickingRoom(null)}></div>
          <div className="relative bg-white w-full max-w-xs rounded-3xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="p-6">
              <h3 className="text-sm font-black text-slate-900 uppercase tracking-widest mb-4 text-center">修改 {statusPickingRoom.number} 房态</h3>
              <div className="grid grid-cols-1 gap-2">
                {(['Available', 'Occupied', 'Cleaning', 'Maintenance'] as Room['status'][]).map((status) => (
                  <button
                    key={status}
                    onClick={() => handleStatusUpdate(statusPickingRoom.id, status)}
                    className={`w-full py-4 px-6 rounded-2xl text-xs font-bold border transition-all flex items-center justify-between group ${
                      statusPickingRoom.status === status 
                        ? 'bg-blue-600 text-white border-blue-600' 
                        : 'bg-white text-slate-600 border-slate-100 hover:border-blue-200'
                    }`}
                  >
                    {reverseFilterMap[status]}
                    {statusPickingRoom.status === status && (
                      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" /></svg>
                    )}
                  </button>
                ))}
              </div>
              <button 
                onClick={() => setStatusPickingRoom(null)}
                className="mt-4 w-full py-3 text-slate-400 text-[10px] font-black uppercase tracking-widest hover:text-slate-600"
              >
                取消
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 房间详情模态框 */}
      {selectedRoom && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={() => setSelectedRoom(null)}></div>
          <div className="relative bg-white w-full max-w-2xl rounded-[2.5rem] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="p-8">
              <div className="flex justify-between items-start mb-8">
                <div>
                  <div className="flex items-center gap-3">
                    <h2 className="text-2xl font-black text-slate-900 tracking-tighter">{selectedRoom.number} 房详细设置</h2>
                    <button 
                      onClick={() => {
                        setStatusPickingRoom(selectedRoom);
                        setSelectedRoom(null);
                      }}
                      className={`px-3 py-1 rounded-lg text-[10px] font-black border uppercase tracking-widest cursor-pointer ${getStatusStyle(selectedRoom.status)}`}
                    >
                      {reverseFilterMap[selectedRoom.status]}
                    </button>
                  </div>
                  <p className="text-slate-400 text-xs mt-1 font-medium">{roomTypeMap[selectedRoom.type]} • UID: {selectedRoom.id}</p>
                </div>
                <button onClick={() => setSelectedRoom(null)} className="p-2 text-slate-300 hover:text-slate-900 transition-colors">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
                </button>
              </div>

              <div className="space-y-8">
                <div className="bg-slate-50 p-6 rounded-3xl">
                  <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">实时房价管理</h4>
                  <div className="flex items-center gap-3">
                    <div className="relative flex-1">
                      <span className="absolute left-4 top-3 text-slate-400 font-bold">¥</span>
                      <input 
                        type="number" 
                        value={newPrice}
                        onChange={(e) => setNewPrice(Number(e.target.value))}
                        className="w-full pl-8 pr-4 py-3 bg-white border border-slate-200 rounded-2xl text-lg font-black outline-none focus:border-blue-500 transition-all"
                      />
                    </div>
                    <button 
                      onClick={handleUpdatePrice}
                      className="px-6 py-3 bg-slate-900 text-white rounded-2xl text-[11px] font-bold hover:bg-slate-800 transition-all shadow-lg"
                    >
                      保存调价
                    </button>
                  </div>
                </div>

                <div>
                  <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">历史入住简报</h4>
                  <div className="bg-white border border-slate-100 rounded-3xl overflow-hidden">
                    <table className="w-full text-left">
                      <thead>
                        <tr className="bg-slate-50/50 border-b border-slate-100">
                          <th className="px-5 py-3 text-[9px] font-black text-slate-400 uppercase tracking-widest">住客</th>
                          <th className="px-5 py-3 text-[9px] font-black text-slate-400 uppercase tracking-widest">周期</th>
                          <th className="px-5 py-3 text-[9px] font-black text-slate-400 uppercase tracking-widest text-right">金额</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-50">
                        {mockHistory.map((h) => (
                          <tr key={h.id} className="text-xs">
                            <td className="px-5 py-3 font-bold text-slate-900">{h.guest}</td>
                            <td className="px-5 py-3 text-slate-500">{h.checkIn.slice(5)} ~ {h.checkOut.slice(5)}</td>
                            <td className="px-5 py-3 text-right font-black text-slate-900">¥{h.amount}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default RoomManagement;
