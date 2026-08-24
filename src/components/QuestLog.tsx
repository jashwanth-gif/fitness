import React, { useState } from 'react';
import { Shield, CheckCircle2, Sparkles } from 'lucide-react';
import type { UserProgress, DailyQuest, WeeklyPlan } from '../types/system';
import { generateBonusQuests } from '../utils/statCalculator';

interface QuestLogProps {
  progress: UserProgress;
  todayDay: keyof WeeklyPlan;
  onChangeTodayDay: (day: keyof WeeklyPlan) => void;
  onToggleCheckpoint: (questId: string, checkpointId: string) => void;
  onCompleteBonusQuest: (bonusQuestId: string, statType: 'vitality' | 'stamina') => void;
  onUpdateWeeklyPlan: (newPlan: WeeklyPlan) => void;
}

export const QuestLog: React.FC<QuestLogProps> = ({
  progress,
  todayDay,
  onChangeTodayDay,
  onToggleCheckpoint,
  onCompleteBonusQuest,
  onUpdateWeeklyPlan
}) => {
  const days: (keyof WeeklyPlan)[] = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

  const [bonusQuests, setBonusQuests] = useState<DailyQuest[]>(generateBonusQuests());
  const [isEditingPlan, setIsEditingPlan] = useState<boolean>(false);
  const [planInput, setPlanInput] = useState<string>(progress.weeklyPlan[todayDay] || '');

  // Find quest for today
  const currentQuest = progress.quests.find(q => q.dayOfWeek.toLowerCase() === todayDay.toLowerCase());

  // Calculate Quest Meter Progress
  const totalCheckpoints = currentQuest?.checkpoints.length || 0;
  const completedCheckpoints = currentQuest?.checkpoints.filter(c => c.isCompleted).length || 0;
  const progressPercent = totalCheckpoints > 0 ? Math.round((completedCheckpoints / totalCheckpoints) * 100) : 0;

  const handleSavePlanEdit = () => {
    const updatedPlan: WeeklyPlan = {
      ...progress.weeklyPlan,
      [todayDay]: planInput
    };
    onUpdateWeeklyPlan(updatedPlan);
    setIsEditingPlan(false);
  };

  return (
    <div className="space-y-6">
      
      {/* Main Quest Tracker Card */}
      <div className="w-full glass-panel rounded-2xl p-5 sm:p-6 shadow-xl border border-cyan-500/20">
        
        {/* Header with Today Day configuration selector */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-cyan-500/20 pb-4 mb-5 gap-3">
          <div className="flex items-center space-x-2">
            <Shield className="w-5 h-5 text-cyan-400 animate-pulse" />
            <h2 className="text-lg font-bold text-slate-100 tracking-wider font-display">
              ACTIVE DAILY QUEST
            </h2>
          </div>

          <div className="flex items-center space-x-2">
            <span className="text-xs text-slate-400 font-mono">TODAY IS:</span>
            <select
              value={todayDay}
              onChange={(e) => {
                const nextDay = e.target.value as keyof WeeklyPlan;
                onChangeTodayDay(nextDay);
                setPlanInput(progress.weeklyPlan[nextDay] || '');
                setIsEditingPlan(false);
              }}
              className="bg-slate-950 border border-slate-800 rounded px-2.5 py-1 text-xs text-cyan-400 focus:outline-none font-mono"
            >
              {days.map((day) => (
                <option key={day} value={day}>
                  {day.toUpperCase()}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Quest Meter of that day */}
        <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-900 mb-6 space-y-2">
          <div className="flex justify-between items-center text-xs font-mono">
            <span className="text-slate-400 uppercase">QUEST PROGRESS METER</span>
            <span className="text-cyan-400 font-bold">{progressPercent}% ({completedCheckpoints}/{totalCheckpoints} Tasks Done)</span>
          </div>
          <div className="w-full bg-slate-900 h-2.5 rounded-full overflow-hidden border border-slate-800">
            <div
              className="bg-gradient-to-r from-cyan-400 to-cyan-500 h-full rounded-full transition-all duration-300"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>

        {/* Quest Card */}
        {currentQuest ? (
          <div className="p-4 sm:p-5 rounded-xl bg-slate-900/80 border border-slate-800 relative overflow-hidden mb-6">
            <div className="flex items-start justify-between mb-3">
              <div>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-cyan-950/80 border border-cyan-500/30 text-cyan-400">
                  {currentQuest.category.toUpperCase()}
                </span>
                <h3 className="text-base sm:text-lg font-bold text-slate-100 mt-1 font-display">
                  {currentQuest.title}
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  {currentQuest.description}
                </p>
              </div>

              <button
                onClick={() => setIsEditingPlan(!isEditingPlan)}
                className="text-xs text-cyan-400 hover:underline font-mono cursor-pointer"
              >
                {isEditingPlan ? 'Cancel' : 'Edit Plan'}
              </button>
            </div>

            {/* Quick Edit Weekly Plan for active weekday */}
            {isEditingPlan && (
              <div className="mb-4 p-3 rounded-lg bg-slate-950 border border-cyan-500/40">
                <label className="block text-xs font-mono text-cyan-400 mb-1">
                  UPDATE {todayDay.toUpperCase()} PLAN:
                </label>
                <input
                  type="text"
                  value={planInput}
                  onChange={(e) => setPlanInput(e.target.value)}
                  className="w-full px-3 py-1.5 rounded bg-slate-900 border border-slate-700 text-xs text-slate-100 mb-2 focus:border-cyan-400 focus:outline-none"
                />
                <button
                  onClick={handleSavePlanEdit}
                  className="px-3 py-1 rounded bg-cyan-500 text-slate-950 text-xs font-mono font-bold cursor-pointer"
                >
                  RE-GENERATE QUESTS
                </button>
              </div>
            )}

            {/* Checkpoints List */}
            <div className="space-y-2.5 mt-4">
              <span className="text-[11px] font-mono text-slate-400 uppercase tracking-wider">
                BITE-SIZED CHECKPOINTS
              </span>

              {currentQuest.checkpoints.map((chk) => (
                <div
                  key={chk.id}
                  onClick={() => onToggleCheckpoint(currentQuest.id, chk.id)}
                  className={`p-3 rounded-lg border transition cursor-pointer flex items-center justify-between ${
                    chk.isCompleted
                      ? 'bg-emerald-950/20 border-emerald-500/40 text-slate-300 line-through opacity-80'
                      : 'bg-slate-950 border-slate-800 hover:border-cyan-500/50 text-slate-100'
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    <input
                      type="checkbox"
                      checked={chk.isCompleted}
                      onChange={() => {}} // handled by parent onClick
                      className="accent-cyan-400"
                    />
                    <span className="text-xs sm:text-sm font-sans font-medium">
                      {chk.text}
                    </span>
                  </div>

                  <div className="flex items-center space-x-2 text-[10px] font-mono">
                    <span className="px-2 py-0.5 rounded bg-cyan-950 text-cyan-400 border border-cyan-500/30">
                      +{chk.statReward} {chk.statType.toUpperCase().substring(0, 3)}
                    </span>
                    <span className="px-2 py-0.5 rounded bg-purple-950 text-purple-400 border border-purple-500/30">
                      +{chk.xpReward} XP
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="p-6 text-center text-slate-400 text-xs font-mono">
            No quest loaded for today.
          </div>
        )}

        {/* Bonus Quests Section */}
        <div>
          <div className="flex items-center space-x-2 text-yellow-400 font-mono text-xs mb-3">
            <Sparkles className="w-4 h-4 text-yellow-400 animate-spin" />
            <span>BONUS QUESTS (EXTRA STAT BOOSTS)</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {bonusQuests.map((bq) => (
              <div
                key={bq.id}
                className={`p-3.5 rounded-xl border transition ${
                  bq.isCompleted
                    ? 'bg-emerald-950/20 border-emerald-500/40 opacity-70 border-solid'
                    : 'bg-yellow-950/10 border-yellow-500/20 hover:border-yellow-500/40'
                }`}
              >
                <div className="flex items-start justify-between">
                  <div>
                    <h4 className="text-xs font-bold text-yellow-300 font-display">
                      {bq.title}
                    </h4>
                    <p className="text-[11px] text-slate-300 mt-1">
                      {bq.description}
                    </p>
                  </div>

                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-yellow-500/20 text-yellow-400 border border-yellow-500/40">
                    +{bq.bonusStatPoints} BONUS
                  </span>
                </div>

                {!bq.isCompleted ? (
                  <button
                    onClick={() => {
                      const statType = bq.id === 'bonus-quest-1' ? 'stamina' : 'vitality';
                      onCompleteBonusQuest(bq.id, statType);
                      setBonusQuests(prev => prev.map(q => q.id === bq.id ? { ...q, isCompleted: true } : q));
                    }}
                    className="w-full mt-3 py-1.5 rounded bg-yellow-400 hover:bg-yellow-300 text-slate-950 font-mono font-bold text-xs shadow transition cursor-pointer"
                  >
                    CLAIM BONUS STAT BOOST
                  </button>
                ) : (
                  <div className="mt-3 text-center text-[10px] font-mono text-emerald-400 flex items-center justify-center space-x-1">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>BONUS REWARD CLAIMED</span>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
};
