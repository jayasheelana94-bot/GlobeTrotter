
import React, { useState, useEffect } from 'react';
import { Routes, Route, useNavigate, Navigate, useLocation } from 'react-router-dom';
import { User, Trip, Currency } from './types';
import Splash from './views/Splash';
import Auth from './views/Auth';
import Dashboard from './views/Dashboard';
import CreateTrip from './views/CreateTrip';
import TripDetails from './views/TripDetails';
import Profile from './views/Profile';

const App: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [trips, setTrips] = useState<Trip[]>([]);
  const [currency, setCurrency] = useState<Currency>({ code: 'INR', symbol: '₹', rate: 1 });
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const storedUser = localStorage.getItem('gt_user');
    const storedTrips = localStorage.getItem('gt_trips');
    const storedCurrency = localStorage.getItem('gt_currency');
    
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
    if (storedTrips) {
      setTrips(JSON.parse(storedTrips));
    }
    if (storedCurrency) {
      setCurrency(JSON.parse(storedCurrency));
    }

    setTimeout(() => {
      setIsLoading(false);
    }, 2000);
  }, []);

  const handleLogin = (userData: User) => {
    setUser(userData);
    localStorage.setItem('gt_user', JSON.stringify(userData));
    navigate('/dashboard');
  };

  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem('gt_user');
    navigate('/login');
  };

  const handleCurrencyChange = (newCurrency: Currency) => {
    setCurrency(newCurrency);
    localStorage.setItem('gt_currency', JSON.stringify(newCurrency));
  };

  const addTrip = (trip: Trip) => {
    const newTrips = [...trips, trip];
    setTrips(newTrips);
    localStorage.setItem('gt_trips', JSON.stringify(newTrips));
  };

  const updateTrip = (updatedTrip: Trip) => {
    const newTrips = trips.map(t => t.id === updatedTrip.id ? updatedTrip : t);
    setTrips(newTrips);
    localStorage.setItem('gt_trips', JSON.stringify(newTrips));
  };

  const deleteTrip = (id: string) => {
    const newTrips = trips.filter(t => t.id !== id);
    setTrips(newTrips);
    localStorage.setItem('gt_trips', JSON.stringify(newTrips));
    navigate('/dashboard');
  };

  if (isLoading) return <Splash />;

  const isAuthPage = location.pathname === '/login';

  return (
    <div className="w-full max-w-md mx-auto h-[100dvh] bg-white flex flex-col overflow-hidden relative sm:shadow-2xl">
      <main className="flex-1 overflow-hidden relative flex flex-col bg-slate-50">
        <Routes>
          <Route path="/login" element={!user ? <Auth onLogin={handleLogin} /> : <Navigate to="/dashboard" />} />
          <Route path="/dashboard" element={user ? <Dashboard user={user} trips={trips} currency={currency} /> : <Navigate to="/login" />} />
          <Route path="/create-trip" element={user ? <CreateTrip onSave={addTrip} currency={currency} /> : <Navigate to="/login" />} />
          <Route path="/trip/:id" element={user ? <TripDetails trips={trips} onUpdate={updateTrip} onDelete={deleteTrip} currency={currency} /> : <Navigate to="/login" />} />
          <Route path="/profile" element={user ? <Profile user={user} onLogout={handleLogout} currency={currency} onCurrencyChange={handleCurrencyChange} /> : <Navigate to="/login" />} />
          <Route path="/" element={<Navigate to={user ? "/dashboard" : "/login"} />} />
        </Routes>
      </main>

      {/* Optimized Native Bottom Navigation */}
      {user && !isAuthPage && (
        <nav className="flex-shrink-0 bg-white border-t border-slate-200/50 safe-bottom">
          <div className="flex justify-between items-center h-[64px] px-8">
            <button 
              onClick={() => navigate('/dashboard')} 
              className="flex flex-col items-center justify-center space-y-1 btn-active"
            >
              <div className={`w-12 h-8 rounded-full flex items-center justify-center transition-all ${location.pathname === '/dashboard' ? 'bg-indigo-600 text-white' : 'text-slate-400'}`}>
                <i className="fa-solid fa-house text-lg"></i>
              </div>
              <span className={`text-[10px] font-bold ${location.pathname === '/dashboard' ? 'text-indigo-600' : 'text-slate-400'}`}>Home</span>
            </button>
            
            <button 
              onClick={() => navigate('/create-trip')} 
              className="btn-active transform -translate-y-4"
            >
              <div className="bg-indigo-600 text-white w-14 h-14 rounded-2xl flex items-center justify-center shadow-lg shadow-indigo-300 ring-4 ring-white">
                <i className="fa-solid fa-plus text-2xl"></i>
              </div>
            </button>
            
            <button 
              onClick={() => navigate('/profile')} 
              className="flex flex-col items-center justify-center space-y-1 btn-active"
            >
              <div className={`w-12 h-8 rounded-full flex items-center justify-center transition-all ${location.pathname === '/profile' ? 'bg-indigo-600 text-white' : 'text-slate-400'}`}>
                <i className="fa-solid fa-user text-lg"></i>
              </div>
              <span className={`text-[10px] font-bold ${location.pathname === '/profile' ? 'text-indigo-600' : 'text-slate-400'}`}>Profile</span>
            </button>
          </div>
        </nav>
      )}
    </div>
  );
};

export default App;
