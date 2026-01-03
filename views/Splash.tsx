
import React from 'react';

const Splash: React.FC = () => {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-indigo-600 text-white p-6">
      <div className="relative">
        <div className="w-24 h-24 bg-white/20 rounded-full animate-ping absolute"></div>
        <div className="w-24 h-24 bg-white rounded-3xl flex items-center justify-center relative shadow-xl transform rotate-12">
          <i className="fa-solid fa-earth-americas text-indigo-600 text-5xl"></i>
        </div>
      </div>
      <h1 className="mt-8 text-4xl font-bold tracking-tight">GlobeTrotter</h1>
      <p className="mt-2 text-indigo-100 font-medium">Your World, Well Planned</p>
      
      <div className="absolute bottom-12 flex space-x-2">
        <div className="w-2 h-2 bg-white/40 rounded-full animate-bounce"></div>
        <div className="w-2 h-2 bg-white/40 rounded-full animate-bounce delay-75"></div>
        <div className="w-2 h-2 bg-white/40 rounded-full animate-bounce delay-150"></div>
      </div>
    </div>
  );
};

export default Splash;
