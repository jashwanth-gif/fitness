import { useState, useEffect } from 'react';
import { Cloud, Bot, Dumbbell, LogOut, Grid, Award, Settings, CheckSquare, Flame, Activity } from 'lucide-react';
import { Navbar } from './components/Navbar';
import { Onboarding } from './components/Onboarding';
import { StatusWindow } from './components/StatusWindow';
import { QuestLog } from './components/QuestLog';
import { AICoach } from './components/AICoach';
import { DriveBackupModal } from './components/DriveBackupModal';
import { ExerciseLibrary } from './components/ExerciseLibrary';
import { LevelUpModal } from './components/LevelUpModal';
import { Welcome } from './components/Welcome';
import { StatsReveal } from './components/StatsReveal';
import type { UserProgress, StatType, WeeklyPlan } from './types/system';
import { loadUserProgress, saveUserProgress, clearUserProgress } from './utils/storage';
import { calculateRankAndTitle, generateDailyQuestsFromPlan, getMETForExercise } from './utils/statCalculator';

export default function App() {
  const [progress, setProgress] = useState<UserProgress | null>(() => loadUserProgress());
  const [currentScreen, setCurrentScreen] = useState<'welcome' | 'onboarding' | 'stats_reveal' | 'main'>(() => {
    const saved = loadUserProgress();
    return saved ? 'main' : 'welcome';
  });
  const [currentTab, setCurrentTab] = useState<'dashboard' | 'quests' | 'status' | 'settings'>('dashboard');
  
  // Modals visibility state
  const [isDriveModalOpen, setIsDriveModalOpen] = useState<boolean>(false);
  const [isAiCoachOpen, setIsAiCoachOpen] = useState<boolean>(false);
  const [isExerciseLibraryOpen, setIsExerciseLibraryOpen] = useState<boolean>(false);
  const [isLevelUpModalOpen, setIsLevelUpModalOpen] = useState<boolean>(false);

  // Track today's day selection
  const [todayDay, setTodayDay] = useState<keyof WeeklyPlan>(() => {
    const savedDay = localStorage.getItem('ascend_today_day') as keyof WeeklyPlan;
    if (savedDay) return savedDay;

    const days: (keyof WeeklyPlan)[] = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
    const systemDay = new Date().toLocaleDateString('en-US', { weekday: 'long' }) as keyof WeeklyPlan;
    return days.includes(systemDay) ? systemDay : 'Monday';
  });

  // Sync state to local storage whenever progress updates
  useEffect(() => {
    if (progress) {
      saveUserProgress(progress);
    }
  }, [progress]);

  // Sync today's day to local storage
  useEffect(() => {
    localStorage.setItem('ascend_today_day', todayDay);
  }, [todayDay]);

  const handleOnboardingComplete = (initialProgress: UserProgress) => {
    setProgress(initialProgress);
    setCurrentScreen('stats_reveal');
  };

  const handleResetData = () => {
    if (window.confirm("Are you sure you want to reset your System character data? This action cannot be undone.")) {
      clearUserProgress();
      localStorage.removeItem('ascend_today_day');
      setProgress(null);
      setCurrentScreen('welcome');
      setCurrentTab('dashboard');
      
      const days: (keyof WeeklyPlan)[] = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
      const systemDay = new Date().toLocaleDateString('en-US', { weekday: 'long' }) as keyof WeeklyPlan;
      setTodayDay(days.includes(systemDay) ? systemDay : 'Monday');
    }
  };

  // Toggle checkpoint completion & process stat/XP progression, streak updates, and calorie calculations
  const handleToggleCheckpoint = (questId: string, checkpointId: string) => {
    if (!progress) return;

    let statGained = 0;
    let statTypeGained: StatType = 'strength';
    let xpGained = 0;
    let calorieChange = 0;

    const todayStr = new Date().toISOString().split('T')[0];
    const weightKg = progress.profile.weightKg || 70;

    let nextStreak = progress.streakDays;
    let nextCompletedDate = progress.lastCompletedDate;

    const updatedQuests = progress.quests.map((q) => {
      if (q.id !== questId) return q;

      const wasCompletedBefore = q.checkpoints.every(c => c.isCompleted);

      const updatedCheckpoints = q.checkpoints.map((chk) => {
        if (chk.id !== checkpointId) return chk;
        const newStatus = !chk.isCompleted;

        // Calculate MET calorie change
        const met = getMETForExercise(chk.text);
        const durationHours = (chk.durationMinutes || 10) / 60;
        const kcal = parseFloat((met * weightKg * durationHours).toFixed(1));

        if (newStatus) {
          statGained = chk.statReward; // 0.1
          statTypeGained = chk.statType;
          xpGained = chk.xpReward; // 10
          calorieChange = kcal;
        } else {
          statGained = -chk.statReward; // -0.1
          statTypeGained = chk.statType;
          xpGained = -chk.xpReward; // -10
          calorieChange = -kcal;
        }
        return { ...chk, isCompleted: newStatus };
      });

      const isCompletedNow = updatedCheckpoints.every(c => c.isCompleted);

      // Streak logic
      if (!wasCompletedBefore && isCompletedNow) {
        if (nextCompletedDate !== todayStr) {
          nextStreak += 1;
          nextCompletedDate = todayStr;
        }
      } else if (wasCompletedBefore && !isCompletedNow) {
        if (nextCompletedDate === todayStr) {
          nextStreak = Math.max(0, nextStreak - 1);
          nextCompletedDate = undefined;
        }
      }

      return { ...q, checkpoints: updatedCheckpoints, isCompleted: isCompletedNow };
    });

    // Apply stat gain (+0.1 or -0.1) and XP (+10 or -10)
    const currentStatVal = progress.stats[statTypeGained];
    const newStatVal = parseFloat((currentStatVal + statGained).toFixed(1));
    const newStats = { ...progress.stats, [statTypeGained]: newStatVal };

    let newXp = progress.currentXp + xpGained;
    let newLevel = progress.level;
    let newRequiredXp = progress.requiredXp;
    let newPointsToAllocate = progress.statPointsToAllocate;
    let levelUpOccurred = false;

    // Handle Level Up progression (needs 100 XP per level, or flat 100 XP)
    if (newXp >= newRequiredXp) {
      newXp = newXp - newRequiredXp;
      newLevel += 1;
      newRequiredXp = 100; // Flat 100 XP for hard progression
      newPointsToAllocate += 1;
      levelUpOccurred = true;
    } else if (newXp < 0) {
      if (newLevel > 1) {
        newLevel -= 1;
        newXp = 100 + newXp;
      } else {
        newXp = 0;
      }
    }

    const { rank, title } = calculateRankAndTitle(newStats);

    // Update caloriesLog
    const updatedCaloriesLog = { ...progress.caloriesLog };
    const currentTodayCalories = updatedCaloriesLog[todayStr] || 0;
    updatedCaloriesLog[todayStr] = Math.max(0, parseFloat((currentTodayCalories + calorieChange).toFixed(1)));

    const newProgressState: UserProgress = {
      ...progress,
      stats: newStats,
      currentXp: newXp,
      level: newLevel,
      requiredXp: newRequiredXp,
      statPointsToAllocate: newPointsToAllocate,
      rank,
      title,
      streakDays: nextStreak,
      lastCompletedDate: nextCompletedDate,
      quests: updatedQuests,
      caloriesLog: updatedCaloriesLog
    };

    setProgress(newProgressState);

    if (levelUpOccurred) {
      setIsLevelUpModalOpen(true);
    }
  };

  // Complete bonus quest
  const handleCompleteBonusQuest = (bonusQuestId: string, statType: 'vitality' | 'stamina') => {
    if (!progress) return;

    const todayStr = new Date().toISOString().split('T')[0];
    const weightKg = progress.profile.weightKg || 70;

    // Calculate MET calorie change for bonus quest
    // Stair Master (bonus-quest-1): 5 mins, stairs MET (8.0). Mess food (bonus-quest-2): 10 mins, general MET (1.5)
    const isStairs = bonusQuestId === 'bonus-quest-1';
    const met = isStairs ? 8.0 : 1.5;
    const durationHours = (isStairs ? 5 : 10) / 60;
    const calorieChange = parseFloat((met * weightKg * durationHours).toFixed(1));

    // Grant +0.5 to target stat
    const currentVal = progress.stats[statType];
    const newVal = parseFloat((currentVal + 0.5).toFixed(1));
    const newStats = { ...progress.stats, [statType]: newVal };
    const { rank, title } = calculateRankAndTitle(newStats);

    let newXp = progress.currentXp + 25;
    let newLevel = progress.level;
    let newRequiredXp = progress.requiredXp;
    let newPointsToAllocate = progress.statPointsToAllocate;
    let levelUpOccurred = false;

    if (newXp >= newRequiredXp) {
      newXp = newXp - newRequiredXp;
      newLevel += 1;
      newPointsToAllocate += 1;
      levelUpOccurred = true;
    }

    const updatedCaloriesLog = { ...progress.caloriesLog };
    const currentTodayCalories = updatedCaloriesLog[todayStr] || 0;
    updatedCaloriesLog[todayStr] = parseFloat((currentTodayCalories + calorieChange).toFixed(1));

    setProgress({
      ...progress,
      stats: newStats,
      currentXp: newXp,
      level: newLevel,
      statPointsToAllocate: newPointsToAllocate,
      rank,
      title,
      caloriesLog: updatedCaloriesLog
    });

    if (levelUpOccurred) {
      setIsLevelUpModalOpen(true);
    }
  };

  // Allocate +1 free stat point manually
  const handleAllocateStatPoint = (stat: StatType) => {
    if (!progress || progress.statPointsToAllocate <= 0) return;

    const newStats = {
      ...progress.stats,
      [stat]: progress.stats[stat] + 1
    };

    const { rank, title } = calculateRankAndTitle(newStats);

    setProgress({
      ...progress,
      stats: newStats,
      statPointsToAllocate: progress.statPointsToAllocate - 1,
      rank,
      title
    });
  };

  // Update Weekly Plan & Re-generate Quests
  const handleUpdateWeeklyPlan = (newPlan: WeeklyPlan) => {
    if (!progress) return;
    const newQuests = generateDailyQuestsFromPlan(newPlan);
    setProgress({
      ...progress,
      weeklyPlan: newPlan,
      quests: newQuests
    });
  };

  const handleUpdateApiKey = (key: string) => {
    if (!progress) return;
    setProgress({
      ...progress,
      geminiApiKey: key
    });
  };

  const handleUpdateProgressFromBackup = (updated: UserProgress) => {
    setProgress(updated);
  };

  // Screen Router
  if (currentScreen === 'welcome') {
    return <Welcome onEnter={() => setCurrentScreen(progress ? 'stats_reveal' : 'onboarding')} />;
  }

  if (currentScreen === 'onboarding') {
    return <Onboarding onComplete={handleOnboardingComplete} />;
  }

  if (currentScreen === 'stats_reveal') {
    if (!progress) return <Welcome onEnter={() => setCurrentScreen('onboarding')} />;
    return <StatsReveal stats={progress.stats} onAccept={() => setCurrentScreen('main')} />;
  }

  if (!progress) {
    return <Welcome onEnter={() => setCurrentScreen('onboarding')} />;
  }

  const currentQuest = progress.quests.find(q => q.dayOfWeek.toLowerCase() === todayDay.toLowerCase());
  const totalCheckpoints = currentQuest?.checkpoints.length || 0;
  const completedCheckpoints = currentQuest?.checkpoints.filter(c => c.isCompleted).length || 0;

  const todayStr = new Date().toISOString().split('T')[0];
  const todayCalories = progress.caloriesLog?.[todayStr] || 0;
  const xpPercent = Math.min(100, Math.max(0, (progress.currentXp / progress.requiredXp) * 100));

  return (
    <div className="min-h-screen bg-[#15121b] text-slate-300 flex flex-col relative overflow-hidden font-sans pb-32">
      {/* Background waves */}
      <div className="bg-waves">
        <div className="wave"></div>
        <div className="wave"></div>
      </div>

      {/* Top Navigation */}
      <Navbar
        progress={progress}
        onOpenDriveModal={() => setIsDriveModalOpen(true)}
        onToggleAiCoach={() => setIsAiCoachOpen(true)}
        onOpenExerciseLibrary={() => setIsExerciseLibraryOpen(true)}
        onResetData={handleResetData}
      />

      <main className="max-w-7xl mx-auto px-4 py-8 w-full space-y-8 z-10 relative">
        {currentTab === 'dashboard' && (
          <div className="space-y-8">
            {/* Player Overview Header (Rank & Level) */}
            <section className="flex flex-col md:flex-row items-center md:items-start gap-6 mb-8">
              {/* Hexagonal Rank Badge */}
              <div className="relative group">
                <div 
                  className="absolute inset-0 rounded-full opacity-50 blur-lg group-hover:opacity-100 transition-opacity duration-500"
                  style={{
                    backgroundColor: '#e8b93f',
                    filter: 'blur(16px)'
                  }}
                ></div>
                <div 
                  className="w-32 h-32 md:w-40 md:h-40 z-10 relative flex items-center justify-center"
                  style={{
                    clipPath: 'polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%)',
                    background: 'linear-gradient(135deg, #2a2210 0%, #1a1508 100%)',
                    border: '2px solid #e8b93f'
                  }}
                >
                  <div 
                    className="w-[90%] h-[90%] flex items-center justify-center"
                    style={{
                      clipPath: 'polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%)',
                      background: 'linear-gradient(135deg, #3d3015 0%, #000000 100%)'
                    }}
                  >
                    <span 
                      className="font-display text-[64px] font-bold text-[#e8b93f] leading-none" 
                      style={{ textShadow: '0 0 10px rgba(232,185,63,0.5)' }}
                    >
                      {progress.rank}
                    </span>
                  </div>
                </div>
              </div>

              {/* Player Stats */}
              <div className="flex-1 flex flex-col justify-center space-y-3 text-center md:text-left">
                <div>
                  <h1 className="font-display text-3xl font-bold text-slate-100 tracking-widest uppercase">
                    {progress.profile.name}
                  </h1>
                  <p className="font-display text-[#968da1] text-xs uppercase tracking-widest mt-1">
                    Title: {progress.title}
                  </p>
                </div>
                <div className="w-full max-w-md bg-[#100d16] h-4 rounded-full border border-[#4b4455]/30 relative overflow-hidden">
                  <div 
                    className="h-full bg-gradient-to-r from-[#8a3ffc] to-[#a600af] rounded-full relative transition-all duration-300"
                    style={{ width: `${xpPercent}%` }}
                  >
                    {/* Spark Effect */}
                    <div className="absolute right-0 top-0 bottom-0 w-2 bg-[#e8b93f] shadow-[0_0_10px_#e8b93f]"></div>
                  </div>
                </div>
                <div className="flex justify-between w-full max-w-md font-display text-xs text-[#cdc2d8]">
                  <span>Lv. {progress.level}</span>
                  <span>{progress.currentXp} / {progress.requiredXp} EXP</span>
                </div>
              </div>
            </section>

            {/* Dashboard Overview Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Daily Quests Card */}
              <div 
                onClick={() => setCurrentTab('quests')}
                className="glass-panel rounded-xl p-6 flex flex-col group h-44 relative overflow-hidden transition-all hover:bg-[#1c1430] hover:border-[#d4bbff]/40 hover:shadow-[0_0_16px_rgba(138,63,252,0.3)] cursor-pointer"
              >
                <div className="absolute top-4 right-4 text-[#968da1] group-hover:text-[#d4bbff] opacity-30 group-hover:opacity-100 transition-opacity">
                  <CheckSquare className="w-8 h-8" />
                </div>
                <h2 className="font-display text-lg font-semibold text-[#e8dfee] mb-1">
                  Daily Quests
                </h2>
                <div className="h-[1px] w-full bg-[#4b4455]/30 mb-auto"></div>
                <div className="flex items-end justify-between">
                  <div className="flex flex-col">
                    <span className="font-display text-3xl font-bold text-[#d4bbff]">{completedCheckpoints}/{totalCheckpoints}</span>
                    <span className="text-xs text-[#968da1] uppercase tracking-wider">Completed Tasks</span>
                  </div>
                  <div className={`px-2 py-0.5 rounded text-xs font-display border uppercase ${
                    completedCheckpoints === totalCheckpoints && totalCheckpoints > 0
                      ? 'bg-emerald-950/40 text-emerald-400 border-emerald-500/20'
                      : 'bg-[#37333e] text-[#ffaaf9] border-[#ffaaf9]/20'
                  }`}>
                    {completedCheckpoints === totalCheckpoints && totalCheckpoints > 0 ? 'Completed' : 'In Progress'}
                  </div>
                </div>
              </div>

              {/* Day Streak Card */}
              <div className="glass-panel rounded-xl p-6 flex flex-col group h-44 relative overflow-hidden transition-all hover:bg-[#1c1430] hover:border-[#d4bbff]/40 hover:shadow-[0_0_16px_rgba(138,63,252,0.3)]">
                <div className="absolute top-4 right-4 text-[#ffb4ab] opacity-30 group-hover:opacity-100 transition-opacity">
                  <Flame className="w-8 h-8" />
                </div>
                <h2 className="font-display text-lg font-semibold text-[#e8dfee] mb-1">
                  Day Streak
                </h2>
                <div className="h-[1px] w-full bg-[#4b4455]/30 mb-auto"></div>
                <div className="flex items-end justify-between">
                  <div className="flex flex-col">
                    <span className="font-display text-3xl font-bold text-[#ffb4ab]">{progress.streakDays}</span>
                    <span className="text-xs text-[#968da1] uppercase tracking-wider">Consecutive Days</span>
                  </div>
                  <div className="bg-[#93000a]/20 px-2 py-0.5 rounded text-[#ffb4ab] text-xs font-display border border-[#ffb4ab]/30 uppercase">
                    Active (Goal: {progress.profile.streakGoal})
                  </div>
                </div>
              </div>

              {/* Calories Burnt Card */}
              <div className="glass-panel rounded-xl p-6 flex flex-col group h-44 relative overflow-hidden transition-all hover:bg-[#1c1430] hover:border-[#d4bbff]/40 hover:shadow-[0_0_16px_rgba(138,63,252,0.3)]">
                <div className="absolute top-4 right-4 text-[#968da1] group-hover:text-[#ffaaf9] opacity-30 group-hover:opacity-100 transition-opacity">
                  <Activity className="w-8 h-8" />
                </div>
                <h2 className="font-display text-lg font-semibold text-[#e8dfee] mb-1">
                  Calories Burnt
                </h2>
                <div className="h-[1px] w-full bg-[#4b4455]/30 mb-auto"></div>
                <div className="flex items-end justify-between">
                  <div className="flex flex-col">
                    <span className="font-display text-3xl font-bold text-[#ffaaf9]">{todayCalories}</span>
                    <span className="text-xs text-[#968da1] uppercase tracking-wider">Today's Total kcal</span>
                  </div>
                </div>
                <div className="w-full bg-[#100d16] h-1 rounded-full mt-3 relative overflow-hidden">
                  <div 
                    className="absolute left-0 top-0 h-full bg-[#ffaaf9] transition-all duration-300"
                    style={{ width: `${Math.min(100, todayCalories > 0 ? (todayCalories / 500) * 100 : 0)}%` }}
                  ></div>
                </div>
              </div>
            </div>
          </div>
        )}

        {currentTab === 'status' && (
          <StatusWindow
            progress={progress}
            onAllocateStatPoint={handleAllocateStatPoint}
          />
        )}

        {currentTab === 'quests' && (
          <QuestLog
            progress={progress}
            todayDay={todayDay}
            onChangeTodayDay={setTodayDay}
            onToggleCheckpoint={handleToggleCheckpoint}
            onCompleteBonusQuest={handleCompleteBonusQuest}
            onUpdateWeeklyPlan={handleUpdateWeeklyPlan}
          />
        )}

        {currentTab === 'settings' && (
          <section className="glass-panel rounded-xl p-6 md:p-8 relative overflow-hidden max-w-2xl mx-auto">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-[#4c61ea] to-[#8a3ffc]"></div>
            <h3 className="font-display text-2xl text-[#d4bbff] mb-6 flex items-center gap-2">
              <Settings className="w-6 h-6 text-[#d4bbff]" />
              System Configuration
            </h3>
            <div className="space-y-4">
              <button 
                onClick={() => setIsDriveModalOpen(true)}
                className="w-full bg-[#1e1a24] border border-[#4b4455]/30 p-4 rounded-lg flex items-center justify-between text-left hover:bg-[#2c2833] transition"
              >
                <div>
                  <h4 className="font-display text-base font-semibold text-slate-100">Google Drive Sync</h4>
                  <p className="text-xs text-[#cdc2d8] mt-0.5">Securely backup or restore character progression</p>
                </div>
                <Cloud className="w-6 h-6 text-[#d4bbff]" />
              </button>

              <button 
                onClick={() => setIsAiCoachOpen(true)}
                className="w-full bg-[#1e1a24] border border-[#4b4455]/30 p-4 rounded-lg flex items-center justify-between text-left hover:bg-[#2c2833] transition"
              >
                <div>
                  <h4 className="font-display text-base font-semibold text-slate-100">System AI Coach</h4>
                  <p className="text-xs text-[#cdc2d8] mt-0.5">Configure Gemini API keys and chat preferences</p>
                </div>
                <Bot className="w-6 h-6 text-[#d4bbff]" />
              </button>

              <button 
                onClick={() => setIsExerciseLibraryOpen(true)}
                className="w-full bg-[#1e1a24] border border-[#4b4455]/30 p-4 rounded-lg flex items-center justify-between text-left hover:bg-[#2c2833] transition"
              >
                <div>
                  <h4 className="font-display text-base font-semibold text-slate-100">Workout Guide</h4>
                  <p className="text-xs text-[#cdc2d8] mt-0.5">Learn proper form for bodyweight movements</p>
                </div>
                <Dumbbell className="w-6 h-6 text-[#d4bbff]" />
              </button>

              <button 
                onClick={handleResetData}
                className="w-full bg-red-950/20 border border-red-500/30 p-4 rounded-lg flex items-center justify-between text-left hover:bg-red-950/40 hover:border-red-500/50 transition text-red-300"
              >
                <div>
                  <h4 className="font-display text-base font-semibold text-red-200">Log Out & Reset</h4>
                  <p className="text-xs text-red-400/80 mt-0.5">Permanently clear local data and profile</p>
                </div>
                <LogOut className="w-6 h-6 text-red-400" />
              </button>
            </div>
          </section>
        )}
      </main>

      {/* Bottom Tab Navigation Bar */}
      <nav className="fixed bottom-0 left-0 right-0 z-50 bg-[#100d16]/95 backdrop-blur-md border-t border-[#4b4455]/30 h-20 flex justify-around items-center px-6 pb-4">
        {/* Dashboard tab */}
        <button 
          onClick={() => setCurrentTab('dashboard')} 
          className={`p-2 flex flex-col items-center justify-center transition cursor-pointer ${
            currentTab === 'dashboard' 
              ? 'text-[#d4bbff] bg-[#8a3ffc]/20 rounded-full scale-110 shadow-[0_0_15px_rgba(212,187,255,0.4)]' 
              : 'text-[#cdc2d8] hover:text-[#ffaaf9]'
          }`}
        >
          <Grid className="w-6 h-6" />
          <span className="text-[10px] font-display uppercase tracking-widest mt-0.5">Dash</span>
        </button>

        {/* Quests tab */}
        <button 
          onClick={() => setCurrentTab('quests')} 
          className={`p-2 flex flex-col items-center justify-center transition cursor-pointer ${
            currentTab === 'quests' 
              ? 'text-[#d4bbff] bg-[#8a3ffc]/20 rounded-full scale-110 shadow-[0_0_15px_rgba(212,187,255,0.4)]' 
              : 'text-[#cdc2d8] hover:text-[#ffaaf9]'
          }`}
        >
          <Dumbbell className="w-6 h-6" />
          <span className="text-[10px] font-display uppercase tracking-widest mt-0.5">Quests</span>
        </button>

        {/* Status tab */}
        <button 
          onClick={() => setCurrentTab('status')} 
          className={`p-2 flex flex-col items-center justify-center transition cursor-pointer ${
            currentTab === 'status' 
              ? 'text-[#d4bbff] bg-[#8a3ffc]/20 rounded-full scale-110 shadow-[0_0_15px_rgba(212,187,255,0.4)]' 
              : 'text-[#cdc2d8] hover:text-[#ffaaf9]'
          }`}
        >
          <Award className="w-6 h-6" />
          <span className="text-[10px] font-display uppercase tracking-widest mt-0.5">Stats</span>
        </button>

        {/* Settings tab */}
        <button 
          onClick={() => setCurrentTab('settings')} 
          className={`p-2 flex flex-col items-center justify-center transition cursor-pointer ${
            currentTab === 'settings' 
              ? 'text-[#d4bbff] bg-[#8a3ffc]/20 rounded-full scale-110 shadow-[0_0_15px_rgba(212,187,255,0.4)]' 
              : 'text-[#cdc2d8] hover:text-[#ffaaf9]'
          }`}
        >
          <Settings className="w-6 h-6" />
          <span className="text-[10px] font-display uppercase tracking-widest mt-0.5">Config</span>
        </button>
      </nav>

      {/* Modals & Dialogs */}
      <DriveBackupModal
        isOpen={isDriveModalOpen}
        progress={progress}
        onClose={() => setIsDriveModalOpen(false)}
        onUpdateProgress={handleUpdateProgressFromBackup}
      />

      <AICoach
        isOpen={isAiCoachOpen}
        progress={progress}
        onClose={() => setIsAiCoachOpen(false)}
        onUpdateApiKey={handleUpdateApiKey}
      />

      <ExerciseLibrary
        isOpen={isExerciseLibraryOpen}
        onClose={() => setIsExerciseLibraryOpen(false)}
      />

      <LevelUpModal
        isOpen={isLevelUpModalOpen}
        level={progress.level}
        onClose={() => setIsLevelUpModalOpen(false)}
      />
    </div>
  );
}
