
import React, { useState } from 'react';
import Sidebar from './components/Sidebar';
import Dashboard from './components/Dashboard';
import RoomManagement from './components/RoomManagement';
import BookingManagement from './components/BookingManagement';
import SettingsManagement from './components/SettingsManagement';
import Analytics from './components/Analytics';
import InfoMaintenance from './components/InfoMaintenance';
import { ViewType } from './types';

const App: React.FC = () => {
  const [currentView, setCurrentView] = useState<ViewType>('dashboard');

  const renderView = () => {
    switch (currentView) {
      case 'dashboard': return <Dashboard />;
      case 'rooms': return <RoomManagement />;
      case 'bookings': return <BookingManagement />;
      case 'analytics': return <Analytics />;
      case 'info': return <InfoMaintenance />;
      case 'settings': return <SettingsManagement />;
      default: return <Dashboard />;
    }
  };

  return (
    <div className="min-h-screen bg-white flex">
      <Sidebar currentView={currentView} onViewChange={setCurrentView} />
      
      <main className="flex-1 ml-64 p-12 overflow-y-auto bg-slate-50/30 min-h-screen">
        <div className="max-w-7xl mx-auto">
          {renderView()}
        </div>
      </main>
    </div>
  );
};

export default App;
