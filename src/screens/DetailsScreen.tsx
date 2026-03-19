import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { motion } from 'motion/react';
import { ChevronLeft, Calendar, Clock, ArrowUpRight, ArrowDownRight, Info, TrendingUp, Loader2, AlertCircle, RefreshCcw } from 'lucide-react';
import { MetalData } from '../types';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { fetchMetalPrice } from '../services/api';

export const DetailsScreen: React.FC = () => {
  const { id } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const [metalData, setMetalData] = useState<MetalData | null>(location.state?.metalData || null);
  const [loading, setLoading] = useState(!location.state?.metalData);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [calcAmount, setCalcAmount] = useState<string>('428901');
  const [calcGrams, setCalcGrams] = useState<string>('');

  const loadData = async (isManual = false) => {
    if (!id) return;
    if (isManual) setIsRefreshing(true);
    else setLoading(true);
    
    setError(null);
    try {
      const result = await fetchMetalPrice(id);
      setMetalData(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch metal details');
    } finally {
      setLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    if (metalData && calcAmount) {
      const grams = parseFloat(calcAmount) / metalData.price;
      setCalcGrams(grams.toFixed(4));
    } else {
      setCalcGrams('');
    }
  }, [calcAmount, metalData]);

  const handleGramsChange = (val: string) => {
    setCalcGrams(val);
    if (metalData && val) {
      const amount = parseFloat(val) * metalData.price;
      setCalcAmount(amount.toFixed(2));
    } else {
      setCalcAmount('');
    }
  };

  useEffect(() => {
    if (!metalData && id) {
      loadData();
    }
  }, [id]);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const formattedTime = currentTime.toLocaleTimeString([], { 
    hour: '2-digit', 
    minute: '2-digit',
    second: '2-digit'
  });

  if (loading) {
    return (
      <div className="max-w-md mx-auto min-h-screen bg-zinc-50 flex flex-col items-center justify-center p-6">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
          className="mb-4"
        >
          <Loader2 className="w-10 h-10 text-zinc-900" />
        </motion.div>
        <h2 className="text-lg font-bold text-zinc-900 mb-1">Fetching Details</h2>
        <p className="text-sm text-zinc-400 font-medium">Please wait a moment...</p>
      </div>
    );
  }

  if (error || !metalData) {
    return (
      <div className="max-w-md mx-auto min-h-screen bg-zinc-50 flex flex-col items-center justify-center p-6 text-center">
        <div className="bg-red-50 p-4 rounded-3xl mb-6">
          <AlertCircle className="w-12 h-12 text-red-500" />
        </div>
        <h2 className="text-xl font-bold text-zinc-900 mb-2">Something went wrong</h2>
        <p className="text-sm text-zinc-500 font-medium mb-8 max-w-[240px] mx-auto">
          {error || "We couldn't find the data for this metal."}
        </p>
        <div className="flex flex-col w-full gap-3">
          <button 
            onClick={() => loadData(true)}
            className="w-full bg-zinc-900 text-white px-6 py-4 rounded-2xl font-bold flex items-center justify-center gap-2 hover:bg-zinc-800 transition-colors"
          >
            <RefreshCcw className={`w-5 h-5 ${isRefreshing ? 'animate-spin' : ''}`} />
            {isRefreshing ? 'Refreshing...' : 'Try Again'}
          </button>
          <button 
            onClick={() => navigate('/')}
            className="w-full bg-white border border-zinc-200 text-zinc-600 px-6 py-4 rounded-2xl font-bold hover:bg-zinc-50 transition-colors"
          >
            Back to Home
          </button>
        </div>
      </div>
    );
  }

  const isUp = metalData.price >= metalData.prevClose;
  const change = metalData.price - metalData.prevClose;
  const changePercent = (change / metalData.prevClose) * 100;

  return (
    <div className="max-w-md mx-auto min-h-screen bg-zinc-50">
      <header className="px-6 py-6 flex items-center justify-between sticky top-0 bg-zinc-50/80 backdrop-blur-md z-10">
        <button 
          onClick={() => navigate(-1)}
          className="p-2.5 bg-white border border-zinc-100 rounded-2xl shadow-sm hover:bg-zinc-50 transition-colors"
        >
          <ChevronLeft className="w-6 h-6 text-zinc-900" />
        </button>
        <h1 className="text-lg font-bold text-zinc-900">{metalData.name} Details</h1>
        <div className="flex items-center gap-3">
          <button 
            onClick={() => loadData(true)}
            disabled={isRefreshing}
            className="p-2.5 bg-white border border-zinc-100 rounded-2xl shadow-sm hover:bg-zinc-50 transition-all active:scale-95 disabled:opacity-50"
          >
            <RefreshCcw className={`w-5 h-5 text-zinc-600 ${isRefreshing ? 'animate-spin' : ''}`} />
          </button>
          <div className="text-right">
            <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest leading-none">Live Time</p>
            <p className="text-xs font-black text-zinc-900 tabular-nums">{formattedTime}</p>
          </div>
        </div>
      </header>

      <main className="px-6 pb-12">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-3xl p-8 shadow-sm border border-zinc-100 mb-6"
        >
          <div className="flex justify-between items-center mb-6">
            <span className="bg-zinc-900 text-white text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-widest">
              {metalData.symbol} / {metalData.currency} {metalData.purity && <span className="text-zinc-400 ml-1">• {metalData.purity}</span>}
            </span>
            <div className={`flex items-center gap-1 text-sm font-bold ${isUp ? 'text-emerald-600' : 'text-rose-600'}`}>
              {isUp ? <ArrowUpRight className="w-4 h-4" /> : <ArrowDownRight className="w-4 h-4" />}
              {Math.abs(changePercent).toFixed(2)}%
            </div>
          </div>

          <div className="mb-8">
            <p className="text-zinc-400 text-sm font-medium mb-1">Current Price</p>
            <h2 className="text-5xl font-black text-zinc-900 tracking-tight">
              ₹{metalData.price.toLocaleString()}
            </h2>
          </div>

          <div className="grid grid-cols-2 gap-4 mb-8">
            <div className="bg-zinc-50 p-4 rounded-2xl">
              <p className="text-[10px] text-zinc-400 font-bold uppercase mb-1">Prev Open</p>
              <p className="text-lg font-bold text-zinc-900">₹{metalData.prevOpen.toLocaleString()}</p>
            </div>
            <div className="bg-zinc-50 p-4 rounded-2xl">
              <p className="text-[10px] text-zinc-400 font-bold uppercase mb-1">Prev Close</p>
              <p className="text-lg font-bold text-zinc-900">₹{metalData.prevClose.toLocaleString()}</p>
            </div>
          </div>

          <div className="h-48 w-full">
            <div className="flex items-center gap-2 mb-4">
              <TrendingUp className="w-4 h-4 text-zinc-400" />
              <h3 className="text-[10px] font-bold uppercase tracking-widest text-zinc-400">24H Price History</h3>
            </div>
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={metalData.history}>
                <defs>
                  <linearGradient id="colorPrice" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={isUp ? "#10b981" : "#f43f5e"} stopOpacity={0.1}/>
                    <stop offset="95%" stopColor={isUp ? "#10b981" : "#f43f5e"} stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f4f4f5" />
                <XAxis 
                  dataKey="time" 
                  hide 
                />
                <YAxis 
                  hide 
                  domain={['dataMin - 10', 'dataMax + 10']}
                />
                <Tooltip 
                  contentStyle={{ 
                    borderRadius: '12px', 
                    border: 'none', 
                    boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
                    fontSize: '12px',
                    fontWeight: 'bold'
                  }}
                  formatter={(value: number) => [`₹${value.toLocaleString()}`, 'Price']}
                />
                <Area 
                  type="monotone" 
                  dataKey="price" 
                  stroke={isUp ? "#10b981" : "#f43f5e"} 
                  strokeWidth={2}
                  fillOpacity={1} 
                  fill="url(#colorPrice)" 
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="space-y-4"
        >
          <div className="bg-white rounded-2xl p-5 shadow-sm border border-zinc-100 flex items-center gap-4">
            <div className="bg-zinc-50 p-3 rounded-xl">
              <Calendar className="w-5 h-5 text-zinc-500" />
            </div>
            <div>
              <p className="text-[10px] text-zinc-400 font-bold uppercase">Market Date</p>
              <p className="text-sm font-bold text-zinc-900">{metalData.date}</p>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-5 shadow-sm border border-zinc-100 flex items-center gap-4">
            <div className="bg-zinc-50 p-3 rounded-xl">
              <Clock className="w-5 h-5 text-zinc-500" />
            </div>
            <div>
              <p className="text-[10px] text-zinc-400 font-bold uppercase">Last Updated</p>
              <p className="text-sm font-bold text-zinc-900">{metalData.timestamp}</p>
            </div>
          </div>

          <div className="bg-zinc-900 rounded-3xl p-6 text-white overflow-hidden relative">
            <div className="relative z-10">
              <div className="flex items-center gap-2 mb-3">
                <Info className="w-4 h-4 text-zinc-400" />
                <h3 className="text-xs font-bold uppercase tracking-widest text-zinc-400">Market Insight</h3>
              </div>
              <p className="text-sm leading-relaxed font-medium">
                {metalData.name} is currently trading at ₹{metalData.price.toLocaleString()}. 
                The market shows {isUp ? 'positive' : 'negative'} momentum compared to the previous close of ₹{metalData.prevClose.toLocaleString()}.
              </p>
            </div>
            {/* Decorative background element */}
            <div className="absolute -right-8 -bottom-8 w-32 h-32 bg-white/5 rounded-full blur-2xl" />
          </div>

          <div className="bg-white rounded-3xl p-6 shadow-sm border border-zinc-100">
            <div className="flex items-center gap-2 mb-4">
              <TrendingUp className="w-4 h-4 text-zinc-900" />
              <h3 className="text-xs font-bold uppercase tracking-widest text-zinc-900">Price Calculator</h3>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-[10px] text-zinc-400 font-bold uppercase mb-1.5 ml-1">Total Amount (₹)</label>
                <input 
                  type="number"
                  value={calcAmount}
                  onChange={(e) => setCalcAmount(e.target.value)}
                  className="w-full bg-zinc-50 border border-zinc-100 rounded-2xl px-4 py-3 text-sm font-bold focus:ring-2 focus:ring-zinc-900 outline-none transition-all"
                  placeholder="Enter amount in ₹"
                />
              </div>
              <div className="flex justify-center">
                <div className="bg-zinc-100 p-2 rounded-full">
                  <RefreshCcw className="w-4 h-4 text-zinc-400" />
                </div>
              </div>
              <div>
                <label className="block text-[10px] text-zinc-400 font-bold uppercase mb-1.5 ml-1">Weight ({metalData.unit})</label>
                <input 
                  type="number"
                  value={calcGrams}
                  onChange={(e) => handleGramsChange(e.target.value)}
                  className="w-full bg-zinc-50 border border-zinc-100 rounded-2xl px-4 py-3 text-sm font-bold focus:ring-2 focus:ring-zinc-900 outline-none transition-all"
                  placeholder={`Enter weight in ${metalData.unit}`}
                />
              </div>
              
              {calcAmount && calcGrams && (
                <div className="bg-zinc-900 rounded-2xl p-4 mt-2">
                  <p className="text-xs font-bold text-zinc-400 uppercase tracking-widest mb-1 text-center">Conversion Result</p>
                  <p className="text-lg font-black text-white text-center tracking-tight">
                    ₹{parseFloat(calcAmount).toLocaleString()} = {calcGrams} {metalData.unit}
                  </p>
                </div>
              )}

              <div className="pt-2">
                <p className="text-[10px] text-zinc-400 font-medium text-center italic">
                  * Calculated based on current live price of ₹{metalData.price.toLocaleString()}/g
                </p>
              </div>
            </div>
          </div>
        </motion.div>
      </main>
    </div>
  );
};
