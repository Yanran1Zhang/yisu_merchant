
import React, { useState } from 'react';
import { IconKey } from './Icons';

const SettingsManagement: React.FC = () => {
  const [isSendingCode, setIsSendingCode] = useState(false);

  const handleSendCode = () => {
    setIsSendingCode(true);
    setTimeout(() => setIsSendingCode(false), 3000);
  };

  const handleLogout = () => {
    if (window.confirm('确定要退出当前账号吗？未保存的更改可能会丢失。')) {
      window.location.reload(); // 模拟退出登录
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* 1. 顶部个人名片 - 身份信息 */}
      <div className="relative bg-white rounded-[2rem] p-8 shadow-sm border border-slate-100 overflow-hidden">
        <div className="absolute top-0 right-0 w-48 h-48 bg-blue-50/50 rounded-full -mr-24 -mt-24 blur-3xl"></div>
        
        <div className="relative flex flex-col md:flex-row items-center gap-6">
          <div className="relative">
            <div className="w-24 h-24 rounded-[1.5rem] bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center text-3xl font-black text-white border-4 border-white shadow-xl shadow-blue-200">
              张
            </div>
            <div className="absolute -bottom-1 -right-1 w-8 h-8 bg-emerald-500 border-4 border-white rounded-xl flex items-center justify-center shadow-lg">
              <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
            </div>
          </div>
          
          <div className="text-center md:text-left space-y-1">
            <div className="flex flex-col md:flex-row items-center gap-2">
              <h2 className="text-2xl font-black text-slate-900 tracking-tighter">张经理</h2>
              <span className="px-2 py-0.5 bg-blue-50 text-blue-600 text-[9px] font-black uppercase tracking-widest rounded-md border border-blue-100">门店主管</span>
            </div>
            <p className="text-slate-400 text-xs font-medium tracking-wide">云栖精品酒店 (杭州灵隐店)</p>
            <div className="flex items-center justify-center md:justify-start gap-3 pt-1">
               <div className="flex flex-col">
                 <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest">账号 ID</span>
                 <span className="text-[10px] font-bold text-slate-700">YISU-88294401</span>
               </div>
               <div className="w-px h-6 bg-slate-100"></div>
               <div className="flex flex-col">
                 <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest">注册日期</span>
                 <span className="text-[10px] font-bold text-slate-700">2024-01-12</span>
               </div>
            </div>
          </div>
        </div>
      </div>

      {/* 2. 账号安全设置区域 - 垂直排列 */}
      <div className="space-y-6">
        {/* 手机号修改 */}
        <div className="bg-white rounded-[2rem] p-7 shadow-sm border border-slate-100">
          <div className="flex items-center gap-4 mb-6">
            <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center text-blue-600">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" /></svg>
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">修改绑定手机</h3>
              <p className="text-slate-400 text-[10px] font-medium">当前绑定：138****8888</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">新手机号码</label>
              <input type="tel" placeholder="请输入新手机号" className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-xl text-xs outline-none focus:border-blue-500 focus:bg-white transition-all" />
            </div>
            <div className="space-y-1.5">
              <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">验证码</label>
              <div className="flex gap-2">
                <input type="text" placeholder="6位数字" className="flex-1 px-4 py-3 bg-slate-50 border border-slate-100 rounded-xl text-xs outline-none focus:border-blue-500 focus:bg-white transition-all" />
                <button 
                  onClick={handleSendCode}
                  disabled={isSendingCode}
                  className="px-4 bg-white border border-slate-200 text-slate-600 rounded-xl text-[10px] font-bold hover:bg-slate-50 disabled:opacity-50 transition-all shadow-sm"
                >
                  {isSendingCode ? '发送中...' : '获取验证码'}
                </button>
              </div>
            </div>
          </div>

          <button className="mt-6 w-full py-3 bg-blue-600 text-white rounded-xl text-[11px] font-bold shadow-lg shadow-blue-600/20 hover:bg-blue-700 transition-all active:scale-95">
            确认更换手机号
          </button>
        </div>

        {/* 密码修改 */}
        <div className="bg-white rounded-[2rem] p-7 shadow-sm border border-slate-100">
          <div className="flex items-center gap-4 mb-6">
            <div className="w-10 h-10 bg-slate-900 rounded-xl flex items-center justify-center text-white">
              <IconKey />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">登录密码重置</h3>
              <p className="text-slate-400 text-[10px] font-medium">建议定期更换密码</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">当前密码</label>
              <input type="password" placeholder="••••••••" className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-xl text-xs outline-none focus:border-blue-500 focus:bg-white transition-all" />
            </div>
            <div className="space-y-1.5">
              <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">设置新密码</label>
              <input type="password" placeholder="建议包含字母与数字" className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-xl text-xs outline-none focus:border-blue-500 focus:bg-white transition-all" />
            </div>
          </div>

          <button className="mt-6 w-full py-3 bg-slate-900 text-white rounded-xl text-[11px] font-bold hover:bg-slate-800 transition-all shadow-xl active:scale-95">
            保存新密码
          </button>
        </div>
      </div>

      {/* 3. 退出登录操作 */}
      <div className="pt-4">
        <button 
          onClick={handleLogout}
          className="w-full group flex items-center justify-center gap-2 py-4 bg-white border border-slate-100 rounded-[1.5rem] text-slate-400 hover:text-rose-600 hover:border-rose-100 hover:bg-rose-50/30 transition-all duration-300"
        >
          <svg className="w-4 h-4 group-hover:rotate-12 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" /></svg>
          <span className="text-[11px] font-black uppercase tracking-widest">退出登录</span>
        </button>
      </div>
    </div>
  );
};

export default SettingsManagement;
