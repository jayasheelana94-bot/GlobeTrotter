
import React, { useState } from 'react';
import { User, Currency } from '../types';

interface ProfileProps {
  user: User;
  onLogout: () => void;
  currency: Currency;
  onCurrencyChange: (currency: Currency) => void;
}

type ProfileSection = 'edit' | 'notifications' | 'security' | 'help' | null;

const Profile: React.FC<ProfileProps> = ({ user, onLogout, currency, onCurrencyChange }) => {
  const [activeSection, setActiveSection] = useState<ProfileSection>(null);
  const [notifications, setNotifications] = useState({ trips: true, news: false, budget: true });

  const currencies: Currency[] = [
    { code: 'INR', symbol: '₹', rate: 1 },
    { code: 'USD', symbol: '$', rate: 0.012 },
    { code: 'EUR', symbol: '€', rate: 0.011 }
  ];

  const menuItems = [
    { id: 'edit' as const, icon: 'fa-user-pen', label: 'Edit Profile', color: 'text-blue-500', bg: 'bg-blue-50' },
    { id: 'notifications' as const, icon: 'fa-bell', label: 'Notifications', color: 'text-amber-500', bg: 'bg-amber-50' },
    { id: 'security' as const, icon: 'fa-shield-halved', label: 'Security', color: 'text-green-500', bg: 'bg-green-50' },
    { id: 'help' as const, icon: 'fa-circle-question', label: 'Help & Support', color: 'text-indigo-500', bg: 'bg-indigo-50' }
  ];

  const renderOverlay = () => {
    if (!activeSection) return null;

    const close = () => setActiveSection(null);

    return (
      <div className="fixed inset-0 z-[100] bg-white animate-in slide-in-from-right duration-300 safe-top safe-bottom flex flex-col">
        <header className="px-6 py-4 flex items-center border-b border-slate-100">
          <button onClick={close} className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center text-slate-800 btn-active">
            <i className="fa-solid fa-arrow-left"></i>
          </button>
          <h2 className="flex-1 text-center font-black text-slate-900 mr-10">
            {menuItems.find(m => m.id === activeSection)?.label}
          </h2>
        </header>

        <div className="flex-1 overflow-y-auto p-6">
          {activeSection === 'edit' && (
            <div className="space-y-6">
              <div className="flex flex-col items-center mb-8">
                <div className="w-24 h-24 rounded-full bg-slate-100 overflow-hidden relative border-4 border-indigo-50">
                  <img src={`https://picsum.photos/seed/${user.id}/200`} className="w-full h-full object-cover" />
                  <div className="absolute inset-0 bg-black/20 flex items-center justify-center">
                    <i className="fa-solid fa-camera text-white"></i>
                  </div>
                </div>
              </div>
              <div className="space-y-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Full Name</label>
                  <input type="text" defaultValue={user.name} className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-5 py-4 font-bold outline-none focus:ring-4 focus:ring-indigo-50 transition-all" />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Email Address</label>
                  <input type="email" defaultValue={user.email} className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-5 py-4 font-bold outline-none focus:ring-4 focus:ring-indigo-50 transition-all" />
                </div>
              </div>
              <button onClick={close} className="w-full bg-indigo-600 text-white py-5 rounded-[1.5rem] font-black shadow-lg shadow-indigo-100 btn-active mt-6">
                Save Changes
              </button>
            </div>
          )}

          {activeSection === 'notifications' && (
            <div className="space-y-6">
              {[
                { id: 'trips', title: 'Trip Reminders', desc: 'Get notified 24h before your flight' },
                { id: 'news', title: 'Travel Trends', desc: 'Personalized recommendations for you' },
                { id: 'budget', title: 'Budget Alerts', desc: 'Alerts when you exceed city budget' }
              ].map((item) => (
                <div key={item.id} className="flex items-center justify-between p-5 bg-slate-50 rounded-3xl border border-slate-100">
                  <div className="flex-1 pr-4">
                    <h4 className="font-bold text-slate-800">{item.title}</h4>
                    <p className="text-[10px] text-slate-400 font-medium uppercase tracking-tight">{item.desc}</p>
                  </div>
                  <button 
                    onClick={() => setNotifications(prev => ({ ...prev, [item.id]: !prev[item.id as keyof typeof notifications] }))}
                    className={`w-14 h-8 rounded-full transition-all relative ${notifications[item.id as keyof typeof notifications] ? 'bg-indigo-600' : 'bg-slate-200'}`}
                  >
                    <div className={`absolute top-1 w-6 h-6 bg-white rounded-full transition-all shadow-sm ${notifications[item.id as keyof typeof notifications] ? 'right-1' : 'left-1'}`}></div>
                  </button>
                </div>
              ))}
            </div>
          )}

          {activeSection === 'security' && (
            <div className="space-y-4">
              <button className="w-full flex items-center justify-between p-5 bg-slate-50 rounded-3xl border border-slate-100 btn-active">
                <span className="font-bold text-slate-700">Change Password</span>
                <i className="fa-solid fa-chevron-right text-slate-300"></i>
              </button>
              <button className="w-full flex items-center justify-between p-5 bg-slate-50 rounded-3xl border border-slate-100 btn-active">
                <span className="font-bold text-slate-700">Two-Factor Auth</span>
                <span className="text-[10px] font-black text-indigo-600 bg-indigo-50 px-2 py-1 rounded-lg">OFF</span>
              </button>
              <button className="w-full flex items-center justify-between p-5 bg-slate-50 rounded-3xl border border-slate-100 btn-active">
                <span className="font-bold text-slate-700">Biometric Login</span>
                <span className="text-[10px] font-black text-green-600 bg-green-50 px-2 py-1 rounded-lg">ENABLED</span>
              </button>
            </div>
          )}

          {activeSection === 'help' && (
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-indigo-50 p-6 rounded-[2rem] text-center">
                  <i className="fa-solid fa-book text-2xl text-indigo-600 mb-2"></i>
                  <p className="text-xs font-black text-indigo-900 uppercase">Guides</p>
                </div>
                <div className="bg-green-50 p-6 rounded-[2rem] text-center">
                  <i className="fa-solid fa-headset text-2xl text-green-600 mb-2"></i>
                  <p className="text-xs font-black text-green-900 uppercase">Support</p>
                </div>
              </div>
              <div className="space-y-4">
                <h4 className="font-black text-slate-800 uppercase text-[10px] tracking-widest ml-1">Popular Topics</h4>
                {['How to plan multi-city?', 'Budgeting for India', 'Invite friends to trip'].map((q, i) => (
                  <button key={i} className="w-full text-left p-4 bg-slate-50 rounded-2xl border border-slate-100 font-bold text-slate-700 text-sm">
                    {q}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="flex-1 flex flex-col bg-slate-50 overflow-y-auto no-scrollbar pb-24 safe-top">
      {renderOverlay()}
      
      <div className="p-8 pt-10 text-center">
        <div className="relative inline-block mb-4">
          <div className="w-32 h-32 rounded-[2.5rem] border-4 border-white shadow-2xl overflow-hidden bg-slate-200 rotate-6 transform transition-transform hover:rotate-0">
            <img src={`https://picsum.photos/seed/${user.id}/400`} alt="avatar" className="w-full h-full object-cover" />
          </div>
          <button 
            onClick={() => setActiveSection('edit')}
            className="absolute -bottom-2 -right-2 w-11 h-11 bg-indigo-600 text-white rounded-2xl border-4 border-white flex items-center justify-center shadow-lg btn-active"
          >
            <i className="fa-solid fa-pen-to-square text-sm"></i>
          </button>
        </div>
        <h2 className="text-2xl font-black text-slate-900 tracking-tight">{user.name}</h2>
        <p className="text-slate-400 text-xs font-bold uppercase tracking-widest mt-1">{user.email}</p>
      </div>

      <div className="px-6 space-y-6">
        {/* Currency Selector Section */}
        <div className="bg-white rounded-[2.5rem] p-6 shadow-sm border border-slate-100">
          <div className="flex items-center space-x-3 mb-6">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-indigo-50 text-indigo-600">
              <i className="fa-solid fa-coins"></i>
            </div>
            <h3 className="font-black text-slate-900 text-sm uppercase tracking-wider">Display Currency</h3>
          </div>
          <div className="grid grid-cols-3 gap-3">
            {currencies.map((cur) => (
              <button
                key={cur.code}
                onClick={() => onCurrencyChange(cur)}
                className={`py-3.5 rounded-2xl font-black text-xs transition-all border-2 ${
                  currency.code === cur.code 
                  ? 'bg-indigo-600 text-white border-indigo-600 shadow-lg shadow-indigo-100' 
                  : 'bg-slate-50 text-slate-500 border-slate-50 hover:border-indigo-100'
                }`}
              >
                {cur.symbol} {cur.code}
              </button>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-[2.5rem] p-2 shadow-sm border border-slate-100 overflow-hidden">
           <div className="divide-y divide-slate-50">
              {menuItems.map((item) => (
                <button 
                  key={item.id} 
                  onClick={() => setActiveSection(item.id)}
                  className="w-full flex items-center justify-between p-4 btn-active group"
                >
                  <div className="flex items-center space-x-4">
                    <div className={`w-11 h-11 rounded-2xl flex items-center justify-center ${item.bg} ${item.color} shadow-sm transition-transform group-hover:scale-110`}>
                      <i className={`fa-solid ${item.icon} text-lg`}></i>
                    </div>
                    <span className="font-black text-slate-800 tracking-tight">{item.label}</span>
                  </div>
                  <i className="fa-solid fa-chevron-right text-slate-300 text-[10px]"></i>
                </button>
              ))}
           </div>
        </div>

        <div className="bg-white rounded-[2.5rem] p-2 shadow-sm border border-slate-100">
          <button 
            onClick={onLogout}
            className="w-full flex items-center justify-between p-4 text-red-600 btn-active rounded-[1.75rem]"
          >
            <div className="flex items-center space-x-4">
              <div className="w-11 h-11 rounded-2xl flex items-center justify-center bg-red-50">
                <i className="fa-solid fa-right-from-bracket text-lg"></i>
              </div>
              <span className="font-black tracking-tight">Logout</span>
            </div>
            <i className="fa-solid fa-chevron-right text-red-200 text-[10px]"></i>
          </button>
        </div>

        <div className="text-center py-6">
          <p className="text-[9px] uppercase font-black text-slate-300 tracking-[0.4em]">GlobeTrotter v1.2.0</p>
        </div>
      </div>
    </div>
  );
};

export default Profile;
