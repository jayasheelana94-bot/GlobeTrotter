
import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { User, Trip, Currency } from '../types';

interface DashboardProps {
  user: User;
  trips: Trip[];
  currency: Currency;
}

const Dashboard: React.FC<DashboardProps> = ({ user, trips, currency }) => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [filter, setFilter] = useState<'upcoming' | 'past' | 'all'>('upcoming');

  const trendingPlaces = [
    { city: 'Jaipur', country: 'India', price: 25000, rating: 4.9, img: 'jaipur' },
    { city: 'Munnar', country: 'India', price: 18000, rating: 4.8, img: 'munnar' },
    { city: 'Leh', country: 'India', price: 45000, rating: 4.9, img: 'ladakh' },
    { city: 'Goa', country: 'India', price: 15000, rating: 4.7, img: 'goa' },
    { city: 'Varanasi', country: 'India', price: 12000, rating: 4.6, img: 'varanasi' }
  ];

  const handleTrendingClick = (cityName: string) => {
    navigate('/create-trip', { state: { prefilledCity: cityName } });
  };

  const filteredTrips = useMemo(() => {
    const now = new Date();
    let list = [...trips];

    if (filter === 'upcoming') {
      list = list.filter(t => new Date(t.startDate) >= now);
    } else if (filter === 'past') {
      list = list.filter(t => new Date(t.endDate) < now);
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      list = list.filter(t => 
        t.name.toLowerCase().includes(q) || 
        t.cities.some(c => c.cityName.toLowerCase().includes(q))
      );
    }

    return list.sort((a, b) => new Date(a.startDate).getTime() - new Date(b.startDate).getTime());
  }, [trips, filter, searchQuery]);

  return (
    <div className="flex-1 flex flex-col bg-slate-50 overflow-hidden">
      {/* Native-feeling Header */}
      <div className="bg-white px-6 pb-6 pt-[calc(1.5rem+var(--sat))] border-b border-slate-100 flex flex-col space-y-4">
        <div className="flex justify-between items-center">
          <div>
            <p className="text-indigo-600 text-[10px] font-bold uppercase tracking-[0.2em]">Welcome back</p>
            <h1 className="text-2xl font-black text-slate-900 tracking-tight">{user.name.split(' ')[0]}</h1>
          </div>
          <button 
            onClick={() => navigate('/profile')}
            className="w-12 h-12 rounded-2xl bg-slate-50 overflow-hidden btn-active border border-slate-200/50"
          >
            <img src={`https://picsum.photos/seed/${user.id}/100`} alt="profile" className="w-full h-full object-cover" />
          </button>
        </div>

        <div className="relative group">
          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
            <i className="fa-solid fa-magnifying-glass text-slate-400 group-focus-within:text-indigo-600 transition-colors"></i>
          </div>
          <input 
            type="text" 
            placeholder="Search your adventures..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-slate-50 pl-11 pr-4 py-3.5 rounded-2xl text-slate-800 placeholder-slate-400 font-bold border border-slate-100 focus:bg-white focus:ring-4 focus:ring-indigo-50 transition-all outline-none"
          />
        </div>
      </div>

      <div className="flex-1 overflow-y-auto no-scrollbar scroll-container pb-12">
        <div className="px-6 mt-6">
          {/* Quick Stats Grid */}
          <div className="grid grid-cols-3 gap-3 mb-8">
            <div className="bg-indigo-600 p-4 rounded-3xl text-white shadow-lg shadow-indigo-100">
              <p className="text-[9px] font-bold opacity-70 uppercase mb-1">Trips</p>
              <p className="text-xl font-black">{trips.length}</p>
            </div>
            <div className="bg-white p-4 rounded-3xl border border-slate-100 shadow-sm">
              <p className="text-[9px] font-bold text-slate-400 uppercase mb-1">Stops</p>
              <p className="text-xl font-black text-slate-800">{trips.reduce((acc, t) => acc + t.cities.length, 0)}</p>
            </div>
            <div className="bg-white p-4 rounded-3xl border border-slate-100 shadow-sm">
              <p className="text-[9px] font-bold text-slate-400 uppercase mb-1">Spent</p>
              <p className="text-xl font-black text-slate-800">{currency.symbol}{(trips.reduce((acc, t) => acc + (t.totalBudget || 0), 0) / 1000).toFixed(0)}k</p>
            </div>
          </div>

          <div className="flex space-x-2 mb-6 overflow-x-auto no-scrollbar py-1">
            {['upcoming', 'past', 'all'].map((id) => (
              <button
                key={id}
                onClick={() => setFilter(id as any)}
                className={`px-6 py-2.5 rounded-2xl text-xs font-black transition-all whitespace-nowrap btn-active ${
                  filter === id 
                  ? 'bg-indigo-600 text-white shadow-md' 
                  : 'bg-white text-slate-500 border border-slate-200'
                }`}
              >
                {id.charAt(0).toUpperCase() + id.slice(1)}
              </button>
            ))}
          </div>

          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-black text-slate-900 tracking-tight">Your Journey</h2>
          </div>

          {filteredTrips.length === 0 ? (
            <div className="bg-white rounded-[2.5rem] p-10 flex flex-col items-center justify-center text-center shadow-sm border border-slate-100">
              <div className="w-20 h-20 bg-indigo-50 rounded-3xl flex items-center justify-center mb-6 text-indigo-400">
                <i className="fa-solid fa-map-location-dot text-3xl"></i>
              </div>
              <h3 className="text-lg font-black text-slate-900 mb-1">No {filter} trips</h3>
              <p className="text-slate-500 text-xs font-medium mb-6">Plan your first Indian journey now!</p>
              <button 
                onClick={() => navigate('/create-trip')}
                className="bg-indigo-600 text-white px-8 py-3.5 rounded-2xl font-black shadow-lg shadow-indigo-100 btn-active"
              >
                Plan New Trip
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredTrips.map((trip) => (
                <div 
                  key={trip.id}
                  onClick={() => navigate(`/trip/${trip.id}`)}
                  className="group bg-white rounded-[2rem] overflow-hidden shadow-sm border border-slate-100 btn-active flex flex-col"
                >
                  <div className="h-32 relative">
                    <img src={trip.image || `https://picsum.photos/seed/${trip.id}/500/300`} className="w-full h-full object-cover" />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent"></div>
                    <div className="absolute top-4 left-5 right-5 flex justify-between items-center">
                       <div className="bg-white/90 backdrop-blur-md px-3 py-1.5 rounded-xl text-[10px] font-black text-slate-800 uppercase tracking-widest">
                        {new Date(trip.startDate).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                      </div>
                      <div className="bg-indigo-600 text-white px-2 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest">
                        {trip.category}
                      </div>
                    </div>
                    <div className="absolute bottom-4 left-5 right-5 text-white">
                      <h3 className="text-lg font-black truncate leading-tight">{trip.name}</h3>
                    </div>
                  </div>
                  <div className="p-4 flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <span className="text-sm font-black text-slate-800">{currency.symbol}{trip.totalBudget?.toLocaleString()}</span>
                    </div>
                    <div className="flex items-center space-x-2 text-indigo-600 font-black text-xs">
                      <div className="flex items-center bg-indigo-50 px-2 py-1 rounded-lg">
                        <i className="fa-solid fa-person text-[10px] mr-1.5"></i>
                        <span>{trip.adultsCount}</span>
                      </div>
                      {trip.childrenCount > 0 && (
                        <div className="flex items-center bg-indigo-50 px-2 py-1 rounded-lg">
                          <i className="fa-solid fa-child text-[10px] mr-1.5"></i>
                          <span>{trip.childrenCount}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          <div className="mt-10 mb-6 flex justify-between items-end">
            <div>
              <p className="text-indigo-600 text-[10px] font-black uppercase tracking-widest mb-1">Trending now</p>
              <h2 className="text-xl font-black text-slate-900 tracking-tight">Best of India</h2>
            </div>
          </div>
          <div className="snap-x-mandatory no-scrollbar -mx-6 px-6 pb-4 space-x-4">
            {trendingPlaces.map((city) => (
              <div 
                key={city.city} 
                onClick={() => handleTrendingClick(city.city)}
                className="w-48 snap-start flex-shrink-0 bg-white rounded-[2rem] overflow-hidden border border-slate-100 btn-active shadow-sm"
              >
                <div className="h-32 relative">
                  <img src={`https://picsum.photos/seed/${city.img}/400/300`} className="w-full h-full object-cover" />
                  <div className="absolute top-3 right-3 bg-white/90 backdrop-blur-md px-2 py-1 rounded-full text-[9px] font-black flex items-center border border-white">
                    <i className="fa-solid fa-star text-amber-500 mr-1"></i>{city.rating}
                  </div>
                </div>
                <div className="p-4">
                  <h4 className="font-black text-slate-800 text-base leading-tight truncate">{city.city}</h4>
                  <p className="text-slate-400 text-[10px] font-bold uppercase tracking-widest mb-3">India</p>
                  <p className="text-indigo-600 font-black text-sm">{currency.symbol}{city.price.toLocaleString()}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
