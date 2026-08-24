import React from 'react';
import { Cloud, Bot, Flame, RotateCcw, Dumbbell } from 'lucide-react';
import type { UserProgress } from '../types/system';

interface NavbarProps {
  progress: UserProgress;
  onOpenDriveModal: () => void;
  onToggleAiCoach: () => void;
  onOpenExerciseLibrary: () => void;
  onResetData: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  progress,
  onOpenDriveModal,
  onToggleAiCoach,
  onOpenExerciseLibrary,
  onResetData
}) => {
  return (
    <header className="sticky top-0 z-40 w-full glass-panel border-b border-cyan-500/20 px-4 py-3 shadow-lg">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        
        {/* System Logo & Rank */}
        <div className="flex items-center space-x-3">
          <div className="relative">
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center font-bold text-slate-900 shadow-md shadow-cyan-500/30 font-display">
              A
            </div>
            <span 
              className="absolute -bottom-1 -right-1 text-[10px] px-1.5 py-0.2 text-slate-950 font-bold rounded"
              style={{
                backgroundColor: '#e8b93f',
                boxShadow: '0 0 10px rgba(232, 185, 63, 0.6)'
              }}
            >
              {progress.rank}
            </span>
          </div>

          <div>
            <div className="flex items-center space-x-2">
              <h1 className="font-bold text-lg tracking-wider text-[#d4bbff] font-display">
                HUNTERFIT
              </h1>
              <span className="text-xs px-2 py-0.5 rounded bg-[#8a3ffc]/20 border border-[#8a3ffc]/40 text-[#d4bbff] font-mono">
                LVL {progress.level}
              </span>
            </div>
            <p className="text-xs text-slate-400 font-sans truncate max-w-[140px] sm:max-w-xs">
              {progress.profile.name} • {progress.title}
            </p>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center space-x-2 sm:space-x-3">
          
          {/* Streak Indicator */}
          <div className="hidden sm:flex items-center space-x-1.5 px-2.5 py-1 rounded-md bg-orange-950/40 border border-orange-500/30 text-orange-400 text-xs font-mono">
            <Flame className="w-4 h-4 text-orange-500 animate-pulse" />
            <span>{progress.streakDays}D STREAK</span>
          </div>

          {/* Calisthenics Library */}
          <button
            onClick={onOpenExerciseLibrary}
            className="p-2 rounded-lg bg-slate-900/80 border border-slate-700/60 hover:border-cyan-500/50 text-slate-300 hover:text-cyan-400 transition"
            title="Zero-Equipment Exercise Guide"
          >
            <Dumbbell className="w-4 h-4" />
          </button>

          {/* Drive Cloud Backup */}
          <button
            onClick={onOpenDriveModal}
            className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg border text-xs font-mono transition ${
              progress.isDriveSynced
                ? 'bg-emerald-950/40 border-emerald-500/40 text-emerald-400 hover:border-emerald-400'
                : 'bg-cyan-950/40 border-cyan-500/40 text-cyan-400 hover:border-cyan-400'
            }`}
            title="Sync & Backup to Google Drive"
          >
            <Cloud className="w-4 h-4" />
            <span className="hidden md:inline">
              {progress.isDriveSynced ? 'DRIVE SYNCED' : 'DRIVE SAVE'}
            </span>
          </button>

          {/* Gemini AI Coach */}
          <button
            onClick={onToggleAiCoach}
            className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-purple-950/40 border border-purple-500/40 text-purple-300 hover:border-purple-400 text-xs font-mono transition"
            title="System AI Coach (Gemini)"
          >
            <Bot className="w-4 h-4 text-purple-400" />
            <span className="hidden sm:inline">AI COACH</span>
          </button>

          {/* Reset System Data */}
          <button
            onClick={onResetData}
            className="p-2 rounded-lg bg-slate-900/80 border border-slate-800 text-slate-400 hover:text-red-400 hover:border-red-500/40 transition"
            title="Reset System Data"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>

      </div>
    </header>
  );
};
