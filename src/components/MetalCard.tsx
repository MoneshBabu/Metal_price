import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'motion/react';
import { TrendingUp, TrendingDown, AlertCircle, Loader2, ChevronRight } from 'lucide-react';
import { MetalData } from '../types';
import { fetchMetalPrice } from '../services/api';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

interface MetalCardProps {
  id: string;
  name: string;
}

export const MetalCard: React.FC<MetalCardProps> = ({ id, name }) => {
  const [data, setData] = useState<MetalData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentTime, setCurrentTime] = useState(new Date());
  const navigate = useNavigate();

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const formattedLiveTime = currentTime.toLocaleTimeString([], { 
    hour: '2-digit', 
    minute: '2-digit',
    second: '2-digit'
  });

  const loadData = async (isManual = false) => {
    if (isManual) setLoading(true); // Re-show loading for manual refresh if preferred, or just use a local state
    // Actually, let's just use the existing loading state for simplicity
    setLoading(true);
    setError(null);
    try {
      const result = await fetchMetalPrice(id);
      setData(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [id]);

  if (loading) {
    return (
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-zinc-100 flex flex-col items-center justify-center min-h-[160px] animate-pulse">
        <Loader2 className="w-6 h-6 text-zinc-400 animate-spin mb-2" />
        <p className="text-sm text-zinc-400 font-medium">Loading {name}...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-red-100 flex flex-col items-center justify-center min-h-[160px]">
        <AlertCircle className="w-8 h-8 text-red-500 mb-2" />
        <p className="text-sm text-red-600 font-medium text-center mb-3">{error}</p>
        <button
          onClick={() => loadData(true)}
          className="text-xs bg-red-50 text-red-600 px-3 py-1.5 rounded-full font-semibold hover:bg-red-100 transition-colors"
        >
          Retry
        </button>
      </div>
    );
  }

  if (!data) return null;

  const isUp = data.price >= data.prevClose;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      onClick={() => navigate(`/details/${id}`, { state: { metalData: data } })}
      className="bg-white p-6 rounded-2xl shadow-sm border border-zinc-100 cursor-pointer hover:shadow-md transition-all group"
    >
      <div className="flex justify-between items-start mb-4">
        <div>
          <h3 className="text-zinc-500 text-xs font-bold uppercase tracking-wider mb-1">
            {data.symbol} {data.purity && <span className="text-zinc-300 ml-1">• {data.purity}</span>}
          </h3>
          <h2 className="text-xl font-bold text-zinc-900">{data.name}</h2>
        </div>
        <div className={cn(
          "p-2 rounded-xl",
          isUp ? "bg-emerald-50 text-emerald-600" : "bg-rose-50 text-rose-600"
        )}>
          {isUp ? <TrendingUp className="w-5 h-5" /> : <TrendingDown className="w-5 h-5" />}
        </div>
      </div>

      <div className="flex items-baseline gap-1 mb-4">
        <span className="text-2xl font-bold text-zinc-900">₹{data.price.toLocaleString()}</span>
        <span className="text-xs text-zinc-400 font-medium">/{data.unit}</span>
      </div>

      <div className="flex justify-between items-center pt-4 border-t border-zinc-50">
        <div className="flex flex-col">
          <span className="text-[10px] text-zinc-400 font-medium uppercase tracking-tight">
            Updated: {data.timestamp}
          </span>
          <span className="text-[10px] text-emerald-500 font-bold uppercase tracking-tight flex items-center gap-1">
            <span className="w-1 h-1 bg-emerald-500 rounded-full animate-pulse" />
            Live: {formattedLiveTime}
          </span>
        </div>
        <div className="flex items-center text-zinc-400 group-hover:text-zinc-900 transition-colors">
          <span className="text-xs font-semibold mr-1">Details</span>
          <ChevronRight className="w-4 h-4" />
        </div>
      </div>
    </motion.div>
  );
};
