import React from 'react';
import { Sparkles, Trophy } from 'lucide-react';

interface LevelUpModalProps {
  isOpen: boolean;
  level: number;
  onClose: () => void;
}

export const LevelUpModal: React.FC<LevelUpModalProps> = ({ isOpen, level, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/90 backdrop-blur-md animate-fade-in">
      <div className="w-full max-w-sm glass-panel rounded-2xl p-6 border-2 border-yellow-500/60 shadow-2xl relative text-center level-up-anim">
        
        {/* Glow effect */}
        <div className="absolute inset-0 bg-yellow-500/10 rounded-2xl blur-xl -z-10" />

        <div className="w-16 h-16 rounded-full bg-yellow-500/20 text-yellow-400 mx-auto flex items-center justify-center mb-4 border border-yellow-500/40">
          <Trophy className="w-8 h-8 animate-bounce" />
        </div>

        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full border border-yellow-500/30 bg-yellow-500/5 mb-3 font-mono">
          <Sparkles className="w-3.5 h-3.5 text-yellow-400" />
          <span className="text-[10px] uppercase tracking-wider text-yellow-400">System Awakening Alert</span>
        </div>

        <h3 className="text-3xl font-extrabold text-white font-display mb-1">LEVEL UP!</h3>
        <p className="text-slate-400 text-xs font-mono mb-4">You have broken your physical limitations.</p>

        <div className="bg-slate-950/60 border border-slate-800 rounded-xl p-3.5 mb-5">
          <span className="text-[10px] text-slate-500 block uppercase font-mono mb-1">New Peak Reached</span>
          <span className="text-3xl font-bold font-display text-yellow-400">LEVEL {level}</span>
          <div className="text-[11px] text-emerald-400 font-mono mt-1">
            +1 Free Stat Point Awarded to Allocate!
          </div>
        </div>

        <button
          onClick={onClose}
          className="w-full py-3 rounded-xl bg-yellow-400 hover:bg-yellow-300 text-slate-950 font-mono text-xs font-black tracking-wider cursor-pointer"
        >
          CONFIRM CHARACTER UPGRADE
        </button>

      </div>
    </div>
  );
};
