
import React, { useState } from 'react';

const InfoMaintenance: React.FC = () => {
  const [images, setImages] = useState([
    { url: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&q=80&w=800', label: '酒店外观' },
    { url: 'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&q=80&w=800', label: '行政大堂' },
    { url: 'https://images.unsplash.com/photo-1540518614846-7eded433c457?auto=format&fit=crop&q=80&w=800', label: '套房全景' },
    { url: 'https://images.unsplash.com/photo-1571896349842-33c89424de2d?auto=format&fit=crop&q=80&w=800', label: '游泳池' },
  ]);

  const hotelServicesList = [
    '免费停车场', '行李寄存', '同城行李寄送', '叫醒服务', '客衣送洗服务', '自助洗衣'
  ];

  const roomFacilitiesList = [
    '免费洗漱用品', '客房Wifi覆盖', '电吹风', '有线/卫星电视接收', '独立卫生间', 
    '电视', '24小时热水', '免费瓶装水', '电水壶', '分体式（中央）空调', '拖鞋', '免费茶包'
  ];

  // 状态管理
  const [selectedServices, setSelectedServices] = useState<string[]>(hotelServicesList);
  const [selectedFacilities, setSelectedFacilities] = useState<string[]>(roomFacilitiesList);

  const handleUpload = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.onchange = (e: any) => {
      const file = e.target.files[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = (readerEvent) => {
          const url = readerEvent.target?.result as string;
          setImages([...images, { url, label: '未命名图片' }]);
        };
        reader.readAsDataURL(file);
      }
    };
    input.click();
  };

  const removeImage = (index: number) => {
    setImages(images.filter((_, i) => i !== index));
  };

  const toggleService = (service: string) => {
    setSelectedServices(prev => 
      prev.includes(service) ? prev.filter(s => s !== service) : [...prev, service]
    );
  };

  const toggleFacility = (facility: string) => {
    setSelectedFacilities(prev => 
      prev.includes(facility) ? prev.filter(f => f !== facility) : [...prev, facility]
    );
  };

  const selectAllServices = (select: boolean) => {
    setSelectedServices(select ? [...hotelServicesList] : []);
  };

  const selectAllFacilities = (select: boolean) => {
    setSelectedFacilities(select ? [...roomFacilitiesList] : []);
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500 pb-20">
      {/* 1. 顶部基础信息 - 核心展示区 */}
      <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-blue-50/40 rounded-full -mr-32 -mt-32 blur-3xl"></div>
        <div className="relative">
          <h3 className="text-xl font-black text-slate-900 mb-6 flex items-center gap-2">
            <span className="w-1.5 h-6 bg-blue-600 rounded-full"></span>
            基础经营档案
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1">酒店官方全称</label>
              <input type="text" defaultValue="云栖精品酒店" className="w-full px-5 py-4 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-bold outline-none focus:border-blue-500 focus:bg-white transition-all shadow-inner-sm" />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1">对外联系电话</label>
              <input type="text" defaultValue="0571-88889999" className="w-full px-5 py-4 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-bold outline-none focus:border-blue-500 focus:bg-white transition-all shadow-inner-sm" />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1">详细经营地址</label>
              <input type="text" defaultValue="浙江省杭州市西湖区灵隐路 88 号" className="w-full px-5 py-4 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-bold outline-none focus:border-blue-500 focus:bg-white transition-all shadow-inner-sm" />
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
        <div className="xl:col-span-2 space-y-8">
          {/* 2. 图片库 */}
          <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm">
            <div className="flex justify-between items-center mb-6">
              <div>
                <h3 className="text-lg font-bold text-slate-900">形象图集</h3>
                <p className="text-slate-400 text-[10px] font-medium mt-0.5 uppercase tracking-wider">Hotel Gallery & Visuals</p>
              </div>
              <button 
                onClick={handleUpload}
                className="px-4 py-2 bg-blue-600 text-white rounded-xl text-xs font-bold hover:bg-blue-700 transition-all shadow-lg shadow-blue-600/10"
              >
                上传图片
              </button>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {images.map((img, i) => (
                <div key={i} className="group relative aspect-square rounded-2xl overflow-hidden bg-slate-100 border border-slate-100">
                  <img src={img.url} alt="" className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                  <div className="absolute inset-0 bg-slate-900/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2 backdrop-blur-[2px]">
                    <button 
                      onClick={() => removeImage(i)}
                      className="p-2.5 bg-white rounded-xl text-rose-500 hover:bg-rose-500 hover:text-white transition-all transform translate-y-2 group-hover:translate-y-0 shadow-xl"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                    </button>
                  </div>
                  <div className="absolute bottom-2 left-2 right-2 px-2 py-1 bg-white/90 backdrop-blur-md rounded-lg text-[10px] font-bold text-slate-800 text-center truncate shadow-sm">
                    {img.label}
                  </div>
                </div>
              ))}
              <button 
                onClick={handleUpload}
                className="aspect-square border-2 border-dashed border-slate-200 rounded-2xl flex flex-col items-center justify-center text-slate-400 hover:border-blue-400 hover:text-blue-400 hover:bg-blue-50/30 transition-all group"
              >
                <div className="w-10 h-10 rounded-full bg-slate-50 flex items-center justify-center mb-2 group-hover:bg-blue-50 transition-colors">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" /></svg>
                </div>
                <span className="text-[10px] font-black uppercase tracking-widest">添加图片</span>
              </button>
            </div>
          </div>

          {/* 3. 酒店设施模块 */}
          <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm space-y-8">
            <div>
              <h3 className="text-lg font-bold text-slate-900">酒店设施与服务</h3>
              <p className="text-slate-400 text-[10px] font-medium mt-0.5 uppercase tracking-wider">Facilities & Guest Services</p>
            </div>

            {/* 公共服务 */}
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-blue-500"></span>
                  公共设施与服务
                </h4>
                <div className="flex gap-2">
                  <button 
                    onClick={() => selectAllServices(true)}
                    className="text-[9px] font-bold text-blue-600 hover:text-blue-700 bg-blue-50 px-2 py-1 rounded-md transition-colors"
                  >
                    全选
                  </button>
                  <button 
                    onClick={() => selectAllServices(false)}
                    className="text-[9px] font-bold text-slate-400 hover:text-slate-600 bg-slate-50 px-2 py-1 rounded-md transition-colors"
                  >
                    取消全选
                  </button>
                </div>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {hotelServicesList.map((service) => (
                  <label key={service} className={`group flex items-center gap-3 p-4 border rounded-2xl cursor-pointer transition-all ${
                    selectedServices.includes(service) 
                      ? 'bg-blue-50/50 border-blue-200' 
                      : 'bg-slate-50 border-slate-100 hover:bg-white hover:border-slate-200'
                  }`}>
                    <input 
                      type="checkbox" 
                      checked={selectedServices.includes(service)}
                      onChange={() => toggleService(service)}
                      className="w-4 h-4 rounded-md border-slate-300 text-blue-600 focus:ring-blue-500" 
                    />
                    <span className={`text-xs font-bold transition-colors ${
                      selectedServices.includes(service) ? 'text-blue-700' : 'text-slate-700 group-hover:text-slate-900'
                    }`}>
                      {service}
                    </span>
                  </label>
                ))}
              </div>
            </div>

            {/* 客房设施 */}
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                  客房设施 (In-room)
                </h4>
                <div className="flex gap-2">
                  <button 
                    onClick={() => selectAllFacilities(true)}
                    className="text-[9px] font-bold text-emerald-600 hover:text-emerald-700 bg-emerald-50 px-2 py-1 rounded-md transition-colors"
                  >
                    全选
                  </button>
                  <button 
                    onClick={() => selectAllFacilities(false)}
                    className="text-[9px] font-bold text-slate-400 hover:text-slate-600 bg-slate-50 px-2 py-1 rounded-md transition-colors"
                  >
                    取消全选
                  </button>
                </div>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                {roomFacilitiesList.map((facility) => (
                  <label key={facility} className={`group flex items-center gap-2.5 p-3 border rounded-xl cursor-pointer transition-all ${
                    selectedFacilities.includes(facility)
                      ? 'bg-emerald-50/50 border-emerald-200'
                      : 'bg-slate-50 border-slate-100 hover:bg-white hover:border-slate-200'
                  }`}>
                    <input 
                      type="checkbox" 
                      checked={selectedFacilities.includes(facility)}
                      onChange={() => toggleFacility(facility)}
                      className="w-3.5 h-3.5 rounded-md border-slate-300 text-emerald-600 focus:ring-emerald-500" 
                    />
                    <span className={`text-[11px] font-bold transition-colors ${
                      selectedFacilities.includes(facility) ? 'text-emerald-700' : 'text-slate-600 group-hover:text-slate-800'
                    }`}>
                      {facility}
                    </span>
                  </label>
                ))}
              </div>
            </div>

            <div className="pt-8 border-t border-slate-50">
              <button className="w-full md:w-auto px-10 py-4 bg-slate-900 text-white rounded-2xl text-xs font-bold shadow-xl hover:bg-slate-800 transition-all transform active:scale-95">
                保存所有信息更改
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default InfoMaintenance;
