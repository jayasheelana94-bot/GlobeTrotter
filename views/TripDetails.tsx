
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Trip, CityStop, Activity, Currency } from '../types';
import { getCitySuggestions, getActivitySuggestions } from '../services/geminiService';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';

interface TripDetailsProps {
  trips: Trip[];
  onUpdate: (trip: Trip) => void;
  onDelete: (id: string) => void;
  currency: Currency;
}

const TripDetails: React.FC<TripDetailsProps> = ({ trips, onUpdate, onDelete, currency }) => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [trip, setTrip] = useState<Trip | null>(null);
  const [activeTab, setActiveTab] = useState<'itinerary' | 'budget' | 'timeline'>('itinerary');
  const [isAddingCity, setIsAddingCity] = useState(false);
  const [isAddingActivity, setIsAddingActivity] = useState<{cityId: string} | null>(null);
  const [isLoggingSpend, setIsLoggingSpend] = useState<{cityId: string, activity: Activity} | null>(null);
  const [citySearch, setCitySearch] = useState('');
  const [searchResult, setSearchResult] = useState<any>(null);
  const [isLoadingSearch, setIsLoadingSearch] = useState(false);
  const [suggestedActivities, setSuggestedActivities] = useState<Activity[]>([]);
  const [showShareModal, setShowShareModal] = useState(false);

  // New activity form state
  const [newActName, setNewActName] = useState('');
  const [newActType, setNewActType] = useState<Activity['type']>('Sightseeing');
  const [newActCost, setNewActCost] = useState('0');
  const [spendAmount, setSpendAmount] = useState('0');

  useEffect(() => {
    const found = trips.find(t => t.id === id);
    if (found) {
      setTrip(found);
    } else {
      navigate('/dashboard');
    }
  }, [id, trips, navigate]);

  if (!trip) return null;

  const handleAddCity = async () => {
    if (!citySearch) return;
    setIsLoadingSearch(true);
    const result = await getCitySuggestions(citySearch, currency.code);
    setSearchResult(result);
    if (result) {
      const activities = await getActivitySuggestions(result.cityName, currency.code);
      setSuggestedActivities(activities);
    }
    setIsLoadingSearch(false);
  };

  const confirmAddCity = () => {
    if (!searchResult) return;
    const newCity: CityStop = {
      id: Math.random().toString(36).substr(2, 9),
      cityName: searchResult.cityName,
      country: searchResult.country,
      startDate: trip.startDate,
      endDate: trip.endDate,
      activities: suggestedActivities.map(a => ({...a, id: Math.random().toString(36).substr(2, 9)})),
      image: `https://picsum.photos/seed/${searchResult.imageKeyword || searchResult.cityName}/800/400`
    };

    const updatedTrip = { ...trip, cities: [...trip.cities, newCity] };
    onUpdate(updatedTrip);
    setIsAddingCity(false);
    setCitySearch('');
    setSearchResult(null);
  };

  const addCustomActivity = (cityId: string) => {
    if (!newActName) return;
    const activity: Activity = {
      id: Math.random().toString(36).substr(2, 9),
      name: newActName,
      type: newActType,
      cost: parseFloat(newActCost),
      duration: 'Custom',
      time: '12:00 PM'
    };

    const updatedTrip = {
      ...trip,
      cities: trip.cities.map(c => c.id === cityId ? { ...c, activities: [...c.activities, activity] } : c)
    };
    onUpdate(updatedTrip);
    setIsAddingActivity(null);
    setNewActName('');
    setNewActCost('0');
  };

  const updateActivitySpend = () => {
    if (!isLoggingSpend) return;
    const { cityId, activity } = isLoggingSpend;
    const updatedTrip = {
      ...trip,
      cities: trip.cities.map(c => c.id === cityId ? {
        ...c,
        activities: c.activities.map(a => a.id === activity.id ? { ...a, actualCost: parseFloat(spendAmount) } : a)
      } : c)
    };
    onUpdate(updatedTrip);
    setIsLoggingSpend(null);
  };

  const removeActivity = (cityId: string, activityId: string) => {
    const updatedTrip = {
      ...trip,
      cities: trip.cities.map(c => c.id === cityId ? { ...c, activities: c.activities.filter(a => a.id !== activityId) } : c)
    };
    onUpdate(updatedTrip);
  };

  const removeCity = (cityId: string) => {
    const updatedTrip = { ...trip, cities: trip.cities.filter(c => c.id !== cityId) };
    onUpdate(updatedTrip);
  };

  const calculateBudget = () => {
    const breakdown = {
      Transport: 0,
      Stay: 0,
      Activities: 0,
      Food: 0
    };

    trip.cities.forEach(city => {
      city.activities.forEach(activity => {
        const amount = activity.actualCost !== undefined ? activity.actualCost : 0;
        if (activity.type === 'Sightseeing' || activity.type === 'Other') breakdown.Activities += amount;
        else if (activity.type === 'Food') breakdown.Food += amount;
        else if (activity.type === 'Transport') breakdown.Transport += amount;
        else if (activity.type === 'Stay') breakdown.Stay += amount;
      });
    });

    return Object.entries(breakdown).map(([name, value]) => ({ name, value }));
  };

  const totalPlanned = trip.cities.reduce((acc, city) => 
    acc + city.activities.reduce((cityAcc, act) => cityAcc + act.cost, 0), 0
  );

  const totalActualSpent = trip.cities.reduce((acc, city) => 
    acc + city.activities.reduce((cityAcc, act) => cityAcc + (act.actualCost || 0), 0), 0
  );

  const costPerPerson = totalActualSpent / ((trip.adultsCount + trip.childrenCount) || 1);
  const isOverBudget = totalActualSpent > trip.totalBudget;

  const COLORS = ['#6366f1', '#10b981', '#f59e0b', '#ef4444'];

  const handleShare = () => {
    const shareLink = `https://globetrotter.io/share/${trip.id}`;
    navigator.clipboard.writeText(shareLink);
    setShowShareModal(true);
    setTimeout(() => setShowShareModal(false), 2000);
  };

  return (
    <div className="flex-1 flex flex-col bg-slate-50 overflow-hidden relative">
      {/* Header */}
      <div className="bg-white p-6 pb-2 shadow-sm border-b border-slate-100 flex flex-col space-y-4 safe-top">
        <div className="flex items-center justify-between">
          <button onClick={() => navigate('/dashboard')} className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center text-slate-600 btn-active">
            <i className="fa-solid fa-arrow-left"></i>
          </button>
          <div className="flex-1 px-4 overflow-hidden">
            <h2 className="text-lg font-black text-slate-800 truncate text-center">{trip.name}</h2>
            <div className="flex items-center justify-center space-x-2 text-[9px] font-black text-slate-400 uppercase tracking-widest mt-0.5">
              <span>{trip.category}</span>
              <span>•</span>
              <span className="flex items-center"><i className="fa-solid fa-person mr-1"></i>{trip.adultsCount}</span>
              {trip.childrenCount > 0 && <span className="flex items-center"><i className="fa-solid fa-child mr-1 ml-1"></i>{trip.childrenCount}</span>}
            </div>
          </div>
          <div className="flex space-x-2">
            <button onClick={handleShare} className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center text-indigo-600 btn-active">
              <i className="fa-solid fa-share-nodes"></i>
            </button>
            <button onClick={() => { if(confirm('Delete trip?')) onDelete(trip.id); }} className="w-10 h-10 rounded-xl bg-red-50 flex items-center justify-center text-red-400 btn-active">
              <i className="fa-solid fa-trash-can text-sm"></i>
            </button>
          </div>
        </div>
        
        <div className="flex bg-slate-100 p-1 rounded-2xl">
          {['itinerary', 'timeline', 'budget'].map((tab) => (
            <button 
              key={tab}
              onClick={() => setActiveTab(tab as any)}
              className={`flex-1 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider transition-all ${activeTab === tab ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-400'}`}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-6 no-scrollbar pb-24 scroll-container">
        {activeTab === 'itinerary' && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h3 className="text-xl font-black text-slate-800">Your Stops</h3>
              <button 
                onClick={() => setIsAddingCity(true)}
                className="bg-indigo-600 text-white px-4 py-2 rounded-xl text-xs font-black flex items-center shadow-lg shadow-indigo-100 btn-active"
              >
                <i className="fa-solid fa-plus mr-1.5"></i> Add City
              </button>
            </div>

            {trip.cities.length === 0 ? (
              <div className="bg-white p-12 rounded-[2.5rem] border-2 border-dashed border-slate-200 text-center shadow-sm">
                <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-6 text-slate-300">
                  <i className="fa-solid fa-map-location text-4xl"></i>
                </div>
                <h4 className="text-lg font-bold text-slate-800 mb-2">No destinations yet</h4>
                <p className="text-slate-400 text-sm mb-6">Start building your adventure by adding your first stop.</p>
                <button 
                  onClick={() => setIsAddingCity(true)}
                  className="bg-indigo-600 text-white px-8 py-3 rounded-2xl font-bold shadow-md btn-active"
                >
                  Find a City
                </button>
              </div>
            ) : (
              <div className="space-y-8 relative">
                <div className="absolute left-6 top-20 bottom-10 w-0.5 bg-indigo-100 z-0 opacity-50"></div>
                
                {trip.cities.map((city, idx) => (
                  <div key={city.id} className="relative z-10">
                    <div className="flex space-x-4 mb-4">
                      <div className="w-12 h-12 rounded-2xl bg-indigo-600 text-white flex items-center justify-center font-black text-xl shadow-lg shadow-indigo-100 flex-shrink-0 mt-2">
                        {idx + 1}
                      </div>
                      <div className="flex-1 bg-white rounded-[2rem] shadow-sm border border-slate-100 overflow-hidden">
                        {/* City Stop Auto-Image Header */}
                        <div className="h-32 relative">
                          <img 
                            src={city.image || `https://picsum.photos/seed/${city.cityName}/800/400`} 
                            className="w-full h-full object-cover" 
                            alt={city.cityName}
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent"></div>
                          <div className="absolute bottom-4 left-5 right-5 flex justify-between items-end">
                            <div>
                              <h4 className="font-black text-white text-xl tracking-tight leading-none mb-1">{city.cityName}</h4>
                              <p className="text-white/80 text-[10px] font-bold uppercase tracking-widest flex items-center">
                                <i className="fa-solid fa-location-dot mr-1 text-indigo-400"></i> {city.country}
                              </p>
                            </div>
                            <div className="flex space-x-1 mb-0.5">
                               <button onClick={() => setIsAddingActivity({cityId: city.id})} className="w-8 h-8 rounded-lg bg-white/20 backdrop-blur-md text-white flex items-center justify-center btn-active">
                                 <i className="fa-solid fa-calendar-plus text-xs"></i>
                               </button>
                               <button onClick={() => removeCity(city.id)} className="w-8 h-8 rounded-lg bg-white/20 backdrop-blur-md text-white flex items-center justify-center btn-active">
                                 <i className="fa-solid fa-xmark text-xs"></i>
                               </button>
                            </div>
                          </div>
                        </div>

                        <div className="p-4 space-y-3">
                          {city.activities.map(act => (
                            <div key={act.id} className="group flex items-center justify-between p-3 rounded-2xl bg-slate-50 border border-slate-100/50 hover:bg-white hover:border-indigo-100 hover:shadow-md transition-all">
                              <div className="flex items-center space-x-4">
                                <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-sm ${
                                  act.type === 'Food' ? 'bg-orange-100 text-orange-500' : 
                                  act.type === 'Stay' ? 'bg-blue-100 text-blue-500' :
                                  act.type === 'Transport' ? 'bg-green-100 text-green-500' : 'bg-indigo-100 text-indigo-500'
                                }`}>
                                  <i className={`fa-solid ${
                                    act.type === 'Food' ? 'fa-utensils' : 
                                    act.type === 'Stay' ? 'fa-hotel' :
                                    act.type === 'Transport' ? 'fa-car' : 'fa-camera'
                                  }`}></i>
                                </div>
                                <div className="max-w-[120px]">
                                  <p className="text-xs font-black text-slate-800 truncate">{act.name}</p>
                                  <p className="text-[9px] text-slate-400 font-bold uppercase tracking-tighter">Plan: {currency.symbol}{act.cost.toLocaleString()}</p>
                                </div>
                              </div>
                              <div className="flex flex-col items-end">
                                {act.actualCost !== undefined ? (
                                  <button 
                                    onClick={() => { setIsLoggingSpend({cityId: city.id, activity: act}); setSpendAmount(act.actualCost!.toString()); }}
                                    className="bg-green-100 text-green-700 px-2 py-1 rounded-lg text-[9px] font-black uppercase tracking-tight btn-active"
                                  >
                                    Spent {currency.symbol}{act.actualCost.toLocaleString()}
                                  </button>
                                ) : (
                                  <button 
                                    onClick={() => { setIsLoggingSpend({cityId: city.id, activity: act}); setSpendAmount(act.cost.toString()); }}
                                    className="bg-indigo-50 text-indigo-600 px-2 py-1 rounded-lg text-[9px] font-black uppercase tracking-tight btn-active"
                                  >
                                    Log Spend
                                  </button>
                                )}
                              </div>
                            </div>
                          ))}
                          
                          {city.activities.length === 0 && (
                            <button 
                              onClick={() => setIsAddingActivity({cityId: city.id})}
                              className="w-full py-4 rounded-2xl border-2 border-dashed border-slate-100 text-slate-400 text-[10px] font-black uppercase tracking-widest hover:bg-slate-50 transition-all"
                            >
                              + Add Activity
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === 'budget' && (
          <div className="space-y-8 animate-in fade-in duration-500">
            {/* Spending Overview */}
            <div className={`p-8 rounded-[3rem] text-white shadow-2xl relative overflow-hidden ${isOverBudget ? 'bg-gradient-to-br from-red-600 to-rose-700' : 'bg-gradient-to-br from-indigo-700 to-violet-700'}`}>
              <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16 blur-2xl"></div>
              <div className="relative z-10">
                <div className="flex justify-between items-start mb-6">
                  <div>
                    <p className="text-white/70 text-[10px] uppercase font-black tracking-[0.2em] mb-1">Total Spent</p>
                    <h4 className="text-4xl font-black">{currency.symbol}{totalActualSpent.toLocaleString()}</h4>
                  </div>
                  <div className="text-right">
                    <p className="text-white/70 text-[10px] uppercase font-black tracking-[0.2em] mb-1">Budget</p>
                    <h4 className="text-xl font-black">{currency.symbol}{trip.totalBudget.toLocaleString()}</h4>
                  </div>
                </div>
                <div className="w-full bg-white/20 h-4 rounded-full overflow-hidden mb-4 p-1">
                  <div 
                    className={`h-full bg-white rounded-full transition-all duration-1000 ease-out`} 
                    style={{ width: `${Math.min((totalActualSpent / trip.totalBudget) * 100, 100)}%` }}
                  ></div>
                </div>
                <div className="flex justify-between text-[10px] font-black uppercase tracking-widest mb-6">
                  <span>{((totalActualSpent/trip.totalBudget)*100).toFixed(1)}% Consumed</span>
                  <span className="text-indigo-100">{currency.symbol}{Math.max(0, trip.totalBudget - totalActualSpent).toLocaleString()} Remaining</span>
                </div>

                <div className="bg-black/10 backdrop-blur-md rounded-2xl p-4 flex justify-around border border-white/10">
                  <div className="text-center">
                    <p className="text-[9px] uppercase font-black opacity-60 mb-0.5">Planned</p>
                    <p className="text-lg font-black">{currency.symbol}{totalPlanned.toLocaleString()}</p>
                  </div>
                  <div className="w-px h-8 bg-white/20"></div>
                  <div className="text-center">
                    <p className="text-[9px] uppercase font-black opacity-60 mb-0.5">Per Person</p>
                    <p className="text-lg font-black">{currency.symbol}{Math.round(costPerPerson).toLocaleString()}</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-slate-100">
              <h4 className="text-xl font-black text-slate-800 mb-8 flex items-center justify-between">
                <span>Expense Trends</span>
                <i className="fa-solid fa-chart-line text-indigo-200"></i>
              </h4>
              <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={calculateBudget()}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 10, fontWeight: 700}} />
                    <YAxis axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 10, fontWeight: 700}} />
                    <Tooltip 
                      cursor={{fill: '#f8fafc'}} 
                      formatter={(value: any) => [`${currency.symbol}${value.toLocaleString()}`, 'Spent']}
                      contentStyle={{borderRadius: '20px', border: 'none', boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1)', fontWeight: 'bold'}} 
                    />
                    <Bar dataKey="value" radius={[12, 12, 0, 0]} barSize={44}>
                      {calculateBudget().map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'timeline' && (
           <div className="space-y-10 py-4 animate-in slide-in-from-right-10 duration-500">
              {trip.cities.map((city, cIdx) => (
                <div key={city.id} className="space-y-6">
                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 rounded-2xl bg-slate-100 flex items-center justify-center text-slate-400">
                      <i className="fa-solid fa-calendar-day"></i>
                    </div>
                    <div>
                      <h4 className="font-black text-indigo-600 text-xl tracking-tight leading-none">{city.cityName}</h4>
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Leg {cIdx + 1}</p>
                    </div>
                  </div>
                  
                  <div className="border-l-2 border-indigo-50 ml-6 pl-10 space-y-8 relative">
                    {city.activities.map((act) => (
                      <div key={act.id} className="relative">
                        <div className="absolute -left-[49px] top-2 w-4 h-4 rounded-full border-4 border-slate-50 bg-indigo-500 z-10"></div>
                        <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100 group">
                          <div className="flex justify-between items-center mb-2">
                            <span className="bg-indigo-50 text-indigo-600 px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest">{act.time || 'Scheduled'}</span>
                            <span className="text-[9px] font-bold text-slate-400 uppercase tracking-tighter">{act.duration}</span>
                          </div>
                          <h5 className="font-black text-slate-800 text-lg leading-tight mb-1">{act.name}</h5>
                          <div className="flex items-center justify-between mt-4 pt-4 border-t border-slate-50">
                             <span className="text-[10px] font-black text-slate-400">Plan: {currency.symbol}{act.cost.toLocaleString()}</span>
                             <button 
                               onClick={() => { setIsLoggingSpend({cityId: city.id, activity: act}); setSpendAmount((act.actualCost || act.cost).toString()); }}
                               className={`text-[10px] font-black px-3 py-1.5 rounded-xl btn-active ${act.actualCost !== undefined ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-600'}`}
                             >
                               {act.actualCost !== undefined ? `Spent ${currency.symbol}${act.actualCost.toLocaleString()}` : 'Update Spend'}
                             </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
           </div>
        )}
      </div>

      {/* Log Spend Modal */}
      {isLoggingSpend && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md z-[100] flex items-end justify-center p-4">
          <div className="bg-white w-full max-w-md rounded-[3rem] p-8 shadow-2xl animate-in slide-in-from-bottom-full duration-500">
            <div className="flex justify-between items-center mb-8">
              <div>
                <h3 className="text-2xl font-black text-slate-800 tracking-tight">Log Spending</h3>
                <p className="text-slate-400 text-xs font-bold uppercase tracking-widest mt-1">{isLoggingSpend.activity.name}</p>
              </div>
              <button onClick={() => setIsLoggingSpend(null)} className="w-12 h-12 rounded-2xl bg-slate-50 flex items-center justify-center text-slate-400 btn-active">
                <i className="fa-solid fa-xmark"></i>
              </button>
            </div>

            <div className="space-y-6">
              <div className="bg-slate-50 p-6 rounded-3xl text-center">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">How much did you spend?</p>
                <div className="flex items-center justify-center text-4xl font-black text-indigo-600">
                  <span className="mr-2">{currency.symbol}</span>
                  <input 
                    type="number" 
                    inputMode="numeric"
                    value={spendAmount}
                    onChange={(e) => setSpendAmount(e.target.value)}
                    className="w-40 bg-transparent text-center outline-none border-b-2 border-indigo-200 focus:border-indigo-600 transition-colors"
                    autoFocus
                  />
                </div>
                <p className="text-[10px] font-bold text-slate-400 mt-4 uppercase tracking-widest">Planned: {currency.symbol}{isLoggingSpend.activity.cost.toLocaleString()}</p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <button onClick={() => { setSpendAmount(isLoggingSpend.activity.cost.toString()); }} className="py-4 rounded-2xl bg-slate-100 text-slate-600 font-bold text-xs btn-active uppercase">Reset to Plan</button>
                <button onClick={() => { setSpendAmount('0'); }} className="py-4 rounded-2xl bg-slate-100 text-slate-600 font-bold text-xs btn-active uppercase">Clear</button>
              </div>

              <button 
                onClick={updateActivitySpend}
                className="w-full bg-indigo-600 text-white py-5 rounded-[1.5rem] font-black text-lg shadow-xl shadow-indigo-100 btn-active"
              >
                Update Spend
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add City Modal */}
      {isAddingCity && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md z-[100] flex items-end justify-center p-4">
          <div className="bg-white w-full max-w-md rounded-[3rem] p-8 shadow-2xl animate-in slide-in-from-bottom-full duration-500">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-2xl font-black text-slate-800 tracking-tight">Add Destination</h3>
              <button onClick={() => { setIsAddingCity(false); setSearchResult(null); setCitySearch(''); }} className="w-12 h-12 rounded-2xl bg-slate-50 flex items-center justify-center text-slate-400 btn-active">
                <i className="fa-solid fa-xmark"></i>
              </button>
            </div>

            <div className="relative mb-6">
              <i className="fa-solid fa-magnifying-glass absolute left-5 top-5 text-slate-400"></i>
              <input 
                type="text"
                value={citySearch}
                onChange={(e) => setCitySearch(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleAddCity()}
                className="w-full pl-14 pr-24 py-5 bg-slate-50 border border-slate-200 rounded-[1.5rem] outline-none font-semibold text-slate-900"
                placeholder={`Search global cities...`}
              />
              <button 
                onClick={handleAddCity}
                disabled={isLoadingSearch}
                className="absolute right-3 top-2.5 bg-indigo-600 text-white px-6 py-2.5 rounded-2xl font-black text-xs disabled:opacity-50 btn-active shadow-lg shadow-indigo-100"
              >
                {isLoadingSearch ? <i className="fa-solid fa-spinner animate-spin"></i> : 'SEARCH'}
              </button>
            </div>

            {searchResult && (
              <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                <div className="relative rounded-[2rem] overflow-hidden bg-slate-100 h-40 border border-slate-200">
                  <img src={`https://picsum.photos/seed/${searchResult.imageKeyword || searchResult.cityName}/800/400`} className="w-full h-full object-cover" alt="preview" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent"></div>
                  <div className="absolute bottom-4 left-5 right-5">
                    <h4 className="font-black text-white text-2xl mb-1">{searchResult.cityName}</h4>
                    <p className="text-white/70 text-xs font-bold uppercase tracking-widest">{searchResult.country}</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 text-center">
                    <p className="text-[10px] font-black text-slate-400 uppercase mb-1">Cost Index</p>
                    <p className="text-sm font-black text-slate-800">{searchResult.costIndex}</p>
                  </div>
                  <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 text-center">
                    <p className="text-[10px] font-black text-slate-400 uppercase mb-1">Popularity</p>
                    <p className="text-sm font-black text-slate-800">{searchResult.popularityScore}/100</p>
                  </div>
                </div>

                <button 
                  onClick={confirmAddCity}
                  className="w-full bg-indigo-600 text-white py-5 rounded-[1.5rem] font-black text-lg shadow-2xl shadow-indigo-100 btn-active"
                >
                  Confirm Destination
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {isAddingActivity && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md z-[100] flex items-end justify-center p-4">
          <div className="bg-white w-full max-w-md rounded-[3rem] p-8 shadow-2xl animate-in slide-in-from-bottom-full duration-500">
            <div className="flex justify-between items-center mb-8">
              <h3 className="text-2xl font-black text-slate-800 tracking-tight">Add Activity</h3>
              <button onClick={() => setIsAddingActivity(null)} className="w-12 h-12 rounded-2xl bg-slate-50 flex items-center justify-center text-slate-400 btn-active">
                <i className="fa-solid fa-xmark"></i>
              </button>
            </div>

            <div className="space-y-6">
              <div>
                <label className="block text-xs font-black text-slate-400 uppercase tracking-[0.2em] mb-3">Activity Name</label>
                <input 
                  type="text" 
                  value={newActName}
                  onChange={(e) => setNewActName(e.target.value)}
                  className="w-full px-6 py-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none font-bold text-slate-900"
                  placeholder="e.g. Scuba Diving"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-black text-slate-400 uppercase tracking-[0.2em] mb-3">Type</label>
                  <select 
                    value={newActType}
                    onChange={(e) => setNewActType(e.target.value as any)}
                    className="w-full px-4 py-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none font-bold appearance-none text-slate-800"
                  >
                    <option value="Sightseeing">Sightseeing</option>
                    <option value="Food">Food & Drinks</option>
                    <option value="Stay">Accommodation</option>
                    <option value="Transport">Transport</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-black text-slate-400 uppercase tracking-[0.2em] mb-3">Cost ({currency.symbol})</label>
                  <input 
                    type="number" 
                    value={newActCost}
                    onChange={(e) => setNewActCost(e.target.value)}
                    className="w-full px-4 py-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none font-bold text-slate-900"
                  />
                </div>
              </div>

              <button 
                onClick={() => addCustomActivity(isAddingActivity.cityId)}
                className="w-full bg-indigo-600 text-white py-5 rounded-[1.5rem] font-black text-lg shadow-xl shadow-indigo-100 btn-active mt-4"
              >
                Add to Itinerary
              </button>
            </div>
          </div>
        </div>
      )}

      {showShareModal && (
        <div className="fixed top-12 left-1/2 -translate-x-1/2 z-[200] bg-slate-800 text-white px-6 py-3 rounded-2xl shadow-2xl flex items-center space-x-3 animate-in fade-in slide-in-from-top-10 duration-300">
          <i className="fa-solid fa-circle-check text-green-400"></i>
          <span className="font-bold text-sm">Link copied to clipboard!</span>
        </div>
      )}
    </div>
  );
};

export default TripDetails;
