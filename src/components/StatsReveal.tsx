import React, { useEffect, useState } from 'react';
import { Shield, Flame, Activity, Zap, Compass, TrendingUp, CheckCircle } from 'lucide-react';
import type { PhysicalStats } from '../types/system';

interface StatsRevealProps {
  stats: PhysicalStats;
  onAccept: () => void;
}

export const StatsReveal: React.FC<StatsRevealProps> = ({ stats, onAccept }) => {
  const [animatedProgress, setAnimatedProgress] = useState<number>(0);

  useEffect(() => {
    const timer = setTimeout(() => {
      setAnimatedProgress(100);
    }, 100);
    return () => clearTimeout(timer);
  }, []);

  const statConfigs = [
    { key: 'strength', label: 'Strength', icon: Flame, color: 'text-rose-500', barColor: 'bg-rose-500' },
    { key: 'agility', label: 'Agility', icon: Zap, color: 'text-cyan-400', barColor: 'bg-cyan-400' },
    { key: 'vitality', label: 'Vitality', icon: Activity, color: 'text-emerald-400', barColor: 'bg-emerald-400' },
    { key: 'stamina', label: 'Stamina', icon: TrendingUp, color: 'text-amber-500', barColor: 'bg-amber-500' },
    { key: 'flexibility', label: 'Flexibility', icon: Compass, color: 'text-fuchsia-500', barColor: 'bg-fuchsia-500' },
    { key: 'discipline', label: 'Discipline', icon: Shield, color: 'text-slate-400', barColor: 'bg-slate-400' },
  ];

  return (
    <div className="min-h-screen bg-[#15121b] text-[#e8dfee] flex items-center justify-center p-6 relative overflow-hidden font-sans">
      {/* Background waves */}
      <div className="bg-waves">
        <div className="wave"></div>
        <div className="wave"></div>
      </div>

      <main className="relative z-10 w-full max-w-2xl">
        <div 
          className="rounded-xl p-8 flex flex-col gap-6"
          style={{
            backgroundColor: 'rgba(19, 13, 31, 0.85)',
            backdropFilter: 'blur(12px)',
            border: '1px solid rgba(205, 194, 216, 0.2)',
            boxShadow: '0 0 40px rgba(138, 63, 252, 0.15)'
          }}
        >
          {/* Header */}
          <div className="text-center relative">
            <div className="absolute inset-0 bg-[#8a3ffc]/10 blur-xl -z-10 rounded-full"></div>
            <h1 className="font-display text-4xl text-[#d4bbff] uppercase italic tracking-widest drop-shadow-[0_0_16px_rgba(138,63,252,0.4)]">
              System Initialized
            </h1>
            <p className="font-sans text-sm text-[#cdc2d8] mt-1">
              Physical attributes synchronized.
            </p>
          </div>

          {/* Stats Grid */}
          <div className="flex flex-col gap-5 my-4">
            {statConfigs.map((cfg) => {
              const IconComponent = cfg.icon;
              const value = stats[cfg.key as keyof PhysicalStats] || 20;
              const percent = Math.min(100, Math.max(10, (value / 100) * 100));

              return (
                <div key={cfg.key} className="flex flex-col gap-1 group">
                  <div className="flex justify-between items-end border-b border-[#4b4455]/30 pb-1">
                    <div className="flex items-center gap-3">
                      <IconComponent className={`w-5 h-5 ${cfg.color}`} />
                      <span className="font-display text-base text-[#e8dfee] uppercase tracking-widest">
                        {cfg.label}
                      </span>
                    </div>
                    <span className={`font-display text-2xl font-bold ${cfg.color}`}>
                      {value}
                    </span>
                  </div>
                  
                  <div className="h-2 w-full bg-[#100d16] rounded-full overflow-hidden mt-1">
                    <div 
                      className={`h-full bg-gradient-to-r from-[#8a3ffc] to-[#d13fd6] transition-all duration-1000 ease-out relative`}
                      style={{ 
                        width: animatedProgress ? `${percent}%` : '0%',
                        boxShadow: '0 0 8px #e8b93f'
                      }}
                    >
                      {/* Gold Spark on leading edge */}
                      <div className="absolute right-0 top-0 bottom-0 w-1 bg-[#e8b93f] shadow-[0_0_6px_#e8b93f]" />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Bottom Accept CTA */}
          <div className="flex justify-center mt-4">
            <button
              onClick={onAccept}
              className="btn-technical font-display text-sm w-full md:w-auto min-w-[240px] flex items-center justify-center gap-2 cursor-pointer shadow-[0_0_24px_rgba(138,63,252,0.4)]"
            >
              <span className="btn-technical-inner"></span>
              <span className="relative z-10 flex items-center justify-center gap-2 tracking-widest">
                Accept Protocol
                <CheckCircle className="w-4 h-4" />
              </span>
            </button>
          </div>
        </div>
      </main>
    </div>
  );
};
