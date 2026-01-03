
import React, { useState, useRef, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Trip, Currency, TripCategory } from '../types';
import { generateFullTrip } from '../services/geminiService';

interface CreateTripProps {
  onSave: (trip: Trip) => void;
  currency: Currency;
}

const CreateTrip: React.FC<CreateTripProps> = ({ onSave, currency }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [name, setName] = useState('');
  const [desc, setDesc] = useState('');
  const [start, setStart] = useState('');
  const [end, setEnd] = useState('');
  const [budget, setBudget] = useState('100000');
  const [adults, setAdults] = useState(1);
  const [children, setChildren] = useState(0);
  const [category, setCategory] = useState<TripCategory>('Solo');
  const [bannerImage, setBannerImage] = useState<string | undefined>(undefined);
  const [isGenerating, setIsGenerating] = useState(false);

  useEffect(() => {
    const state = location.state as { prefilledCity?: string };
    if (state?.prefilledCity) {
      setName(`Exploring ${state.prefilledCity}`);
      setDesc(`A wonderful journey to discover the beauty of ${state.prefilledCity}.`);
    }
  }, [location.state]);

  const handleImageClick = () => {
    fileInputRef.current?.click();
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setBannerImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const categories: { id: TripCategory; icon: string }[] = [
    { id: 'Solo', icon: 'fa-user' },
    { id: 'Couple', icon: 'fa-heart' },
    { id: 'Family', icon: 'fa-house-user' },
    { id: 'Friends', icon: 'fa-user-group' }
  ];

  const handleSubmit = async (e: React.FormEvent, useAI: boolean = false) => {
    e.preventDefault();
    if (!name || !start || !end) return;

    if (useAI) {
      setIsGenerating(true);
      const days = Math.ceil((new Date(end).getTime() - new Date(start).getTime()) / (1000 * 60 * 60 * 24)) || 1;
      const aiTrip = await generateFullTrip(name, days, parseFloat(budget), currency.code, adults, children, category);
      
      if (aiTrip) {
        const newTrip: Trip = {
          id: Math.random().toString(36).substr(2, 9),
          name,
          description: aiTrip.description || desc,
          startDate: start,
          endDate: end,
          totalBudget: parseFloat(budget),
          currencyCode: currency.code,
          adultsCount: adults,
          childrenCount: children,
          category: category,
          image: bannerImage,
          cities: aiTrip.cities.map((c: any) => ({
            ...c,
            id: Math.random().toString(36).substr(2, 9),
            startDate: start,
            endDate: end,
            activities: c.activities.map((a: any) => ({ ...a, id: Math.random().toString(36).substr(2, 9) }))
          }))
        };
        onSave(newTrip);
        setIsGenerating(false);
        navigate(`/trip/${newTrip.id}`);
        return;
      }
      setIsGenerating(false);
    }

    const newTrip: Trip = {
      id: Math.random().toString(36).substr(2, 9),
      name,
      description: desc,
      startDate: start,
      endDate: end,
      totalBudget: parseFloat(budget),
      currencyCode: currency.code,
      adultsCount: adults,
      childrenCount: children,
      category: category,
      image: bannerImage,
      cities: []
    };

    onSave(newTrip);
    navigate(`/trip/${newTrip.id}`);
  };

  return (
    <div className="flex-1 flex flex-col bg-white overflow-hidden relative">
      <header className="px-6 py-4 flex items-center justify-between sticky top-0 bg-white z-20 border-b border-slate-100 safe-top">
        <button 
          type="button"
          onClick={() => navigate(-1)} 
          className="w-10 h-10 rounded-full flex items-center justify-center bg-slate-50 text-slate-800 btn-active"
        >
          <i className="fa-solid fa-arrow-left"></i>
        </button>
        <h2 className="text-lg font-black text-slate-900">Plan Adventure</h2>
        <div className="w-10"></div>
      </header>

      <div className="flex-1 overflow-y-auto no-scrollbar scroll-container pb-24">
        {isGenerating ? (
          <div className="flex flex-col items-center justify-center p-12 text-center space-y-8 h-full">
            <div className="relative">
              <div className="w-32 h-32 bg-indigo-600 rounded-full animate-pulse blur-xl absolute opacity-20"></div>
              <div className="w-32 h-32 bg-indigo-600 rounded-[2.5rem] flex items-center justify-center relative shadow-2xl shadow-indigo-100 animate-bounce">
                <i className="fa-solid fa-wand-magic-sparkles text-white text-5xl"></i>
              </div>
            </div>
            <div>
              <h3 className="text-2xl font-black text-slate-800 mb-2">AI is Crafting...</h3>
              <p className="text-slate-500 font-medium px-4">Creating a {category} trip for {adults + children} travelers.</p>
            </div>
            <div className="w-full max-w-xs bg-slate-100 h-2.5 rounded-full overflow-hidden">
              <div className="h-full bg-indigo-600 animate-[loading_2s_infinite]"></div>
            </div>
          </div>
        ) : (
          <div className="p-6 space-y-8">
            <div className="flex justify-center">
              <input 
                type="file" 
                ref={fileInputRef} 
                className="hidden" 
                accept="image/*" 
                onChange={handleImageChange}
              />
              <div 
                onClick={handleImageClick}
                className={`w-full aspect-[16/9] rounded-[2.5rem] flex flex-col items-center justify-center text-indigo-400 border-2 border-dashed border-indigo-200 group transition-all cursor-pointer overflow-hidden relative ${bannerImage ? 'border-none ring-4 ring-indigo-50' : 'bg-indigo-50/50'}`}
              >
                {bannerImage ? (
                  <>
                    <img src={bannerImage} alt="banner" className="w-full h-full object-cover" />
                    <div className="absolute inset-0 bg-black/30 flex items-center justify-center">
                      <i className="fa-solid fa-camera text-white text-2xl"></i>
                    </div>
                  </>
                ) : (
                  <>
                    <i className="fa-solid fa-image text-4xl mb-2"></i>
                    <span className="text-[10px] font-black uppercase tracking-widest text-center px-4">Tap to upload trip cover</span>
                  </>
                )}
              </div>
            </div>

            <form onSubmit={(e) => handleSubmit(e)} className="space-y-6">
              <div className="space-y-6">
                <div className="bg-slate-50 p-4 rounded-3xl border border-slate-100 focus-within:bg-white focus-within:ring-4 focus-within:ring-indigo-50 transition-all">
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1 ml-1">Trip Title</label>
                  <input 
                    type="text" 
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full bg-transparent font-black text-slate-900 text-lg placeholder-slate-300"
                    placeholder="Adventure Name..."
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-slate-50 p-4 rounded-3xl border border-slate-100">
                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1 ml-1">Starts</label>
                    <input 
                      type="date" 
                      value={start}
                      onChange={(e) => setStart(e.target.value)}
                      className="w-full bg-transparent font-bold text-slate-900 text-sm"
                      required
                    />
                  </div>
                  <div className="bg-slate-50 p-4 rounded-3xl border border-slate-100">
                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1 ml-1">Ends</label>
                    <input 
                      type="date" 
                      value={end}
                      onChange={(e) => setEnd(e.target.value)}
                      className="w-full bg-transparent font-bold text-slate-900 text-sm"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-3">
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Trip Category</label>
                  <div className="flex space-x-3 overflow-x-auto no-scrollbar py-1">
                    {categories.map((cat) => (
                      <button
                        key={cat.id}
                        type="button"
                        onClick={() => setCategory(cat.id)}
                        className={`flex-shrink-0 flex items-center space-x-2 px-5 py-3 rounded-2xl font-black text-xs transition-all btn-active border ${
                          category === cat.id 
                          ? 'bg-indigo-600 text-white border-indigo-600 shadow-md shadow-indigo-100' 
                          : 'bg-white text-slate-500 border-slate-100'
                        }`}
                      >
                        <i className={`fa-solid ${cat.icon}`}></i>
                        <span>{cat.id}</span>
                      </button>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-white border border-slate-100 p-4 rounded-3xl shadow-sm">
                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 ml-1 text-center">Adults</label>
                    <div className="flex items-center justify-between">
                      <button 
                        type="button"
                        onClick={() => setAdults(Math.max(1, adults - 1))}
                        className="w-8 h-8 rounded-xl bg-slate-50 text-indigo-600 flex items-center justify-center btn-active"
                      >
                        <i className="fa-solid fa-minus text-xs"></i>
                      </button>
                      <span className="font-black text-lg text-slate-800">{adults}</span>
                      <button 
                        type="button"
                        onClick={() => setAdults(adults + 1)}
                        className="w-8 h-8 rounded-xl bg-slate-50 text-indigo-600 flex items-center justify-center btn-active"
                      >
                        <i className="fa-solid fa-plus text-xs"></i>
                      </button>
                    </div>
                  </div>
                  <div className="bg-white border border-slate-100 p-4 rounded-3xl shadow-sm">
                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 ml-1 text-center">Children</label>
                    <div className="flex items-center justify-between">
                      <button 
                        type="button"
                        onClick={() => setChildren(Math.max(0, children - 1))}
                        className="w-8 h-8 rounded-xl bg-slate-50 text-indigo-600 flex items-center justify-center btn-active"
                      >
                        <i className="fa-solid fa-minus text-xs"></i>
                      </button>
                      <span className="font-black text-lg text-slate-800">{children}</span>
                      <button 
                        type="button"
                        onClick={() => setChildren(children + 1)}
                        className="w-8 h-8 rounded-xl bg-slate-50 text-indigo-600 flex items-center justify-center btn-active"
                      >
                        <i className="fa-solid fa-plus text-xs"></i>
                      </button>
                    </div>
                  </div>
                </div>

                <div className="bg-white border border-slate-100 p-4 rounded-3xl shadow-sm">
                   <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1 ml-1 text-center">Budget ({currency.symbol})</label>
                   <div className="flex items-center justify-center">
                      <span className="text-slate-400 font-black mr-2">{currency.symbol}</span>
                      <input 
                        type="number" 
                        inputMode="numeric"
                        value={budget}
                        onChange={(e) => setBudget(e.target.value)}
                        className="w-full bg-transparent font-black text-slate-900 text-lg text-center"
                        placeholder="100000"
                        required
                      />
                   </div>
                </div>

                <div className="bg-slate-50 p-4 rounded-3xl border border-slate-100">
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1 ml-1">Vibe & Notes</label>
                  <textarea 
                    value={desc}
                    onChange={(e) => setDesc(e.target.value)}
                    className="w-full bg-transparent font-medium text-slate-700 text-sm resize-none h-20"
                    placeholder="Historical, food tour, chill vibez..."
                  />
                </div>
              </div>

              <div className="flex flex-col gap-3 pt-2">
                <button 
                  type="button"
                  onClick={(e) => handleSubmit(e as any, true)}
                  className="w-full bg-indigo-600 text-white py-4.5 rounded-[1.5rem] font-black text-lg shadow-xl shadow-indigo-100 flex items-center justify-center space-x-3 btn-active"
                >
                  <i className="fa-solid fa-wand-magic-sparkles"></i>
                  <span>Create Plan with AI</span>
                </button>
                
                <button 
                  type="submit"
                  className="w-full bg-white text-slate-800 border-2 border-slate-100 py-4.5 rounded-[1.5rem] font-black text-lg btn-active"
                >
                  Create Manual Trip
                </button>
              </div>
            </form>
          </div>
        )}
      </div>
    </div>
  );
};

export default CreateTrip;
