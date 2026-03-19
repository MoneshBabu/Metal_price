import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { MetalCard } from '../components/MetalCard';
import { METALS } from '../types';
import { Coins, RefreshCcw, Clock, Search, X } from 'lucide-react';

export const HomeScreen: React.FC = () => {
  const [currentTime, setCurrentTime] = useState(new Date());
  const [searchQuery, setSearchQuery] = useState('');
  const [refreshKey, setRefreshKey] = useState(0);
  const [isRefreshing, setIsRefreshing] = useState(false);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const handleRefresh = () => {
    setIsRefreshing(true);
    setRefreshKey(prev => prev + 1);
    // Simulate a brief loading state for the button itself
    setTimeout(() => setIsRefreshing(false), 800);
  };

  const formattedTime = currentTime.toLocaleTimeString([], { 
    hour: '2-digit', 
    minute: '2-digit',
    second: '2-digit'
  });

  const formattedDate = currentTime.toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric'
  });

  return (
    <div className="max-w-md mx-auto px-6 py-8">
      <header className="flex justify-between items-center mb-8">
        <div className="flex items-center gap-3">
          <div className="bg-zinc-900 p-2.5 rounded-2xl">
            <Coins className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-zinc-900">MetalPrice</h1>
            <div className="flex items-center gap-1.5 text-[10px] text-zinc-500 font-bold uppercase tracking-wider">
              <Clock className="w-3 h-3" />
              <span>{formattedTime}</span>
              <span className="text-zinc-300">•</span>
              <span>{formattedDate}</span>
            </div>
          </div>
        </div>
        <button 
          onClick={handleRefresh}
          disabled={isRefreshing}
          className="p-2.5 bg-white border border-zinc-100 rounded-2xl shadow-sm hover:bg-zinc-50 transition-all active:scale-95 disabled:opacity-50"
        >
          <RefreshCcw className={`w-5 h-5 text-zinc-600 ${isRefreshing ? 'animate-spin' : ''}`} />
        </button>
      </header>

      <div className="relative mb-6">
        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
          <Search className="h-4 w-4 text-zinc-400" />
        </div>
        <input
          type="text"
          placeholder="Search metals..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="block w-full pl-11 pr-10 py-3.5 bg-white border border-zinc-100 rounded-2xl shadow-sm focus:ring-2 focus:ring-zinc-900 focus:border-transparent transition-all text-sm font-medium placeholder:text-zinc-400"
        />
        {searchQuery && (
          <button
            onClick={() => setSearchQuery('')}
            className="absolute inset-y-0 right-0 pr-4 flex items-center"
          >
            <X className="h-4 w-4 text-zinc-400 hover:text-zinc-900 transition-colors" />
          </button>
        )}
      </div>

      <motion.div 
        key={refreshKey}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="grid grid-cols-1 gap-4"
      >
        {METALS.filter(metal => 
          metal.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
          metal.symbol.toLowerCase().includes(searchQuery.toLowerCase())
        ).map((metal) => (
          <MetalCard key={`${metal.id}-${refreshKey}`} id={metal.id} name={metal.name} />
        ))}
      </motion.div>

      <footer className="mt-12 text-center">
        <p className="text-[10px] text-zinc-400 font-bold uppercase tracking-widest leading-relaxed mb-4">
          Data provided by GoldAPI.io
        </p>
        <p className="text-[10px] text-zinc-300 font-medium uppercase tracking-widest leading-relaxed">
          Prices are indicative and for reference only.<br />
          Market data may be delayed.
        </p>
      </footer>
    </div>
  );
};
