
import React, { useState } from 'react';
import { User } from '../types';

interface AuthProps {
  onLogin: (user: User) => void;
}

const Auth: React.FC<AuthProps> = ({ onLogin }) => {
  const [isLogin, setIsLogin] = useState(true);
  // Set default values as requested
  const [email, setEmail] = useState('user@gmail.com');
  const [password, setPassword] = useState('user123');
  const [name, setName] = useState('');
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!email || !password || (!isLogin && !name)) {
      setError('Please fill in all fields');
      return;
    }

    if (!email.includes('@')) {
      setError('Please enter a valid email');
      return;
    }

    // Updated validation for requested credentials
    if (isLogin && (email !== 'user@gmail.com' || password !== 'user123')) {
      setError('Invalid email or password.');
      return;
    }

    // Mock Authentication logic
    const mockUser: User = {
      id: Math.random().toString(36).substr(2, 9),
      name: isLogin ? 'Explorer' : name,
      email: email,
      token: 'mock_jwt_token_' + Date.now()
    };

    onLogin(mockUser);
  };

  return (
    <div className="flex-1 flex flex-col p-8 bg-white min-h-screen">
      <div className="flex justify-center mb-8 mt-12">
        <div className="w-20 h-20 bg-indigo-600 rounded-[2rem] flex items-center justify-center shadow-2xl shadow-indigo-200 transform rotate-12 transition-transform hover:rotate-0">
          <i className="fa-solid fa-earth-americas text-white text-4xl"></i>
        </div>
      </div>

      <div className="text-center mb-10">
        <h2 className="text-4xl font-black text-slate-900 mb-2 tracking-tight">
          {isLogin ? 'Welcome Back' : 'Join the Club'}
        </h2>
        <p className="text-slate-500 font-medium">
          {isLogin ? 'Sign in to access your trips' : 'Start planning your next escape'}
        </p>
      </div>

      {error && (
        <div className="bg-red-50 text-red-600 px-5 py-4 rounded-2xl text-sm font-bold mb-6 flex items-center border border-red-100 animate-in fade-in slide-in-from-top-2">
          <i className="fa-solid fa-circle-exclamation mr-3 text-base"></i>
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-5">
        {!isLogin && (
          <div>
            <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">Full Name</label>
            <div className="relative">
              <i className="fa-solid fa-user absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"></i>
              <input 
                type="text" 
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full pl-12 pr-4 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-4 focus:ring-indigo-50 focus:border-indigo-500 outline-none transition-all font-bold text-slate-900 placeholder-slate-300"
                placeholder="John Doe"
              />
            </div>
          </div>
        )}

        <div>
          <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">Email Address</label>
          <div className="relative">
            <i className="fa-solid fa-envelope absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"></i>
            <input 
              type="email" 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full pl-12 pr-4 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-4 focus:ring-indigo-50 focus:border-indigo-500 outline-none transition-all font-bold text-slate-900 placeholder-slate-300"
              placeholder="user@gmail.com"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">Password</label>
          <div className="relative">
            <i className="fa-solid fa-lock absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"></i>
            <input 
              type={showPassword ? "text" : "password"} 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full pl-12 pr-12 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-4 focus:ring-indigo-50 focus:border-indigo-500 outline-none transition-all font-bold text-slate-900 placeholder-slate-300"
              placeholder="••••••••"
            />
            <button 
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-indigo-600 transition-colors"
            >
              <i className={`fa-solid ${showPassword ? 'fa-eye-slash' : 'fa-eye'}`}></i>
            </button>
          </div>
        </div>

        {isLogin && (
          <div className="flex justify-end">
            <button type="button" className="text-xs font-black text-indigo-600 uppercase tracking-wider hover:underline">Forgot Password?</button>
          </div>
        )}

        <button 
          type="submit"
          className="w-full bg-indigo-600 text-white py-5 rounded-[1.5rem] font-black text-lg shadow-xl shadow-indigo-100 active:scale-[0.98] hover:shadow-2xl hover:bg-indigo-700 transition-all mt-4"
        >
          {isLogin ? 'Login' : 'Create Account'}
        </button>
      </form>

      <div className="mt-10 text-center">
        <p className="text-slate-500 font-bold">
          {isLogin ? "Don't have an account? " : "Already have an account? "}
          <button 
            onClick={() => {
              setIsLogin(!isLogin);
              setError('');
            }}
            className="text-indigo-600 font-black hover:underline underline-offset-4 decoration-2"
          >
            {isLogin ? 'Sign Up' : 'Login'}
          </button>
        </p>
      </div>

      <div className="mt-auto pt-10 flex items-center justify-center space-x-4 opacity-40">
        <div className="h-px bg-slate-300 w-16"></div>
        <span className="text-[10px] uppercase font-black text-slate-500 tracking-[0.3em]">Or connect with</span>
        <div className="h-px bg-slate-300 w-16"></div>
      </div>

      <div className="flex space-x-4 mt-8">
        <button className="flex-1 flex items-center justify-center py-4 border border-slate-100 rounded-2xl hover:bg-slate-50 transition-all shadow-sm">
          <i className="fa-brands fa-google text-red-500 text-xl"></i>
        </button>
        <button className="flex-1 flex items-center justify-center py-4 border border-slate-100 rounded-2xl hover:bg-slate-50 transition-all shadow-sm">
          <i className="fa-brands fa-apple text-slate-900 text-xl"></i>
        </button>
      </div>
    </div>
  );
};

export default Auth;
