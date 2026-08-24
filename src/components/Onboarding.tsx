import React, { useState } from 'react';
import { User, Flame, Calendar, ArrowRight } from 'lucide-react';
import type { UserProgress, UserProfile, WeeklyPlan } from '../types/system';
import { calculateBMI, calculateBaselineStats, calculateRankAndTitle, generateDailyQuestsFromPlan } from '../utils/statCalculator';

interface OnboardingProps {
  onComplete: (progress: UserProgress) => void;
}

export const Onboarding: React.FC<OnboardingProps> = ({ onComplete }) => {
  const [profile, setProfile] = useState<Omit<UserProfile, 'weeklyPlan'>>({
    name: '',
    age: 0,
    heightCm: 0,
    weightKg: 0,
    streakGoal: 0
  });

  const [weeklyPlan, setWeeklyPlan] = useState<WeeklyPlan>({
    Monday: '',
    Tuesday: '',
    Wednesday: '',
    Thursday: '',
    Friday: '',
    Saturday: '',
    Sunday: ''
  });

  const [errorMsg, setErrorMsg] = useState<string>('');

  const handleProfileChange = (key: keyof Omit<UserProfile, 'weeklyPlan'>, val: any) => {
    setProfile(prev => ({ ...prev, [key]: val }));
  };

  const handlePlanChange = (day: keyof WeeklyPlan, val: string) => {
    setWeeklyPlan(prev => ({ ...prev, [day]: val }));
  };

  // Client-side check: Are all fields filled?
  const isFormValid =
    profile.name.trim() !== '' &&
    profile.age > 0 &&
    profile.heightCm > 0 &&
    profile.weightKg > 0 &&
    profile.streakGoal > 0 &&
    Object.values(weeklyPlan).every(plan => plan.trim() !== '');

  // Simulated server-side validation function to enforce data integrity before state calculation
  const validateOnboardingServerSide = (
    prof: Omit<UserProfile, 'weeklyPlan'>,
    plan: WeeklyPlan
  ): boolean => {
    if (!prof.name || prof.name.trim() === '') return false;
    if (!prof.age || Number(prof.age) <= 0) return false;
    if (!prof.heightCm || Number(prof.heightCm) <= 0) return false;
    if (!prof.weightKg || Number(prof.weightKg) <= 0) return false;
    if (!prof.streakGoal || Number(prof.streakGoal) <= 0) return false;
    
    const days: (keyof WeeklyPlan)[] = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
    for (const day of days) {
      if (!plan[day] || plan[day].trim() === '') {
        return false;
      }
    }
    return true;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Enforce server-side check
    const isServerValid = validateOnboardingServerSide(profile, weeklyPlan);
    if (!isServerValid) {
      setErrorMsg('Server-Side Security Validation Failed: All metric fields and daily plans are strictly required.');
      return;
    }

    const fullProfile: UserProfile = {
      ...profile,
      weeklyPlan
    };

    const bmi = calculateBMI(fullProfile.heightCm, fullProfile.weightKg);
    const initialStats = calculateBaselineStats(fullProfile);
    const { rank, title } = calculateRankAndTitle(initialStats);
    const quests = generateDailyQuestsFromPlan(weeklyPlan);

    const initialProgress: UserProgress = {
      profile: fullProfile,
      stats: initialStats,
      bmi,
      level: 1,
      currentXp: 0,
      requiredXp: 100,
      statPointsToAllocate: 0,
      rank,
      title,
      streakDays: 0,
      lastActiveDate: new Date().toLocaleDateString(),
      weeklyPlan,
      quests,
      sickTokens: 2,
      caloriesLog: {}
    };

    onComplete(initialProgress);
  };

  return (
    <div className="min-h-screen bg-[#15121b] text-[#e8dfee] min-h-screen font-sans antialiased relative overflow-hidden pb-24">
      {/* Background waves */}
      <div className="bg-waves">
        <div className="wave"></div>
        <div className="wave"></div>
      </div>

      <header className="w-full flex justify-center items-center py-8 z-10 relative">
        <h1 className="font-display text-4xl md:text-5xl font-bold text-[#d4bbff] italic uppercase tracking-widest drop-shadow-[0_0_15px_rgba(212,187,255,0.4)]">
          HUNTERFIT
        </h1>
      </header>

      <main className="container mx-auto px-6 md:px-20 pb-24 max-w-4xl relative z-10">
        <div className="mb-12 text-center">
          <h2 className="font-display text-2xl md:text-3xl text-[#e8dfee] mb-2 uppercase tracking-wide">
            Initialize Hunter Profile
          </h2>
          <p className="font-sans text-[#cdc2d8] text-sm md:text-base">
            Calibrate your physical vessel parameters to begin progression.
          </p>
        </div>

        {errorMsg && (
          <div className="mb-6 p-4 bg-red-950/60 border border-red-500/50 rounded-lg text-red-300 text-xs font-mono">
            {errorMsg}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-12">
          {/* Core Parameters Section */}
          <section className="glass-panel rounded-xl p-6 md:p-8 relative overflow-hidden group">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-[#8a3ffc] to-[#a600af]"></div>
            <div className="absolute top-0 left-0 w-full h-12 bg-[#8a3ffc]/10 -z-10"></div>
            <h3 className="font-display text-xl md:text-2xl text-[#d4bbff] mb-8 flex items-center gap-2">
              <User className="w-6 h-6 text-[#d4bbff]" />
              Core Parameters
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
              <div className="form-group">
                <label className="font-display text-xs tracking-wider text-[#cdc2d8] flex items-center gap-1 mb-1" htmlFor="name">
                  Hunter Designation <span className="text-[#ffb4ab]">*</span>
                </label>
                <input
                  className="input-technical text-base"
                  id="name"
                  placeholder="Enter true name"
                  required
                  type="text"
                  value={profile.name}
                  onChange={e => handleProfileChange('name', e.target.value)}
                />
              </div>

              <div className="form-group">
                <label className="font-display text-xs tracking-wider text-[#cdc2d8] flex items-center gap-1 mb-1" htmlFor="age">
                  Cycles Survived (Age) <span className="text-[#ffb4ab]">*</span>
                </label>
                <input
                  className="input-technical text-base"
                  id="age"
                  max="120"
                  min="13"
                  placeholder="e.g. 24"
                  required
                  type="number"
                  value={profile.age || ''}
                  onChange={e => handleProfileChange('age', e.target.value === '' ? 0 : Math.max(1, parseInt(e.target.value) || 0))}
                />
              </div>

              <div className="form-group">
                <label className="font-display text-xs tracking-wider text-[#cdc2d8] flex items-center gap-1 mb-1" htmlFor="height">
                  Vertical Span (cm) <span className="text-[#ffb4ab]">*</span>
                </label>
                <input
                  className="input-technical text-base"
                  id="height"
                  max="300"
                  min="50"
                  placeholder="e.g. 180"
                  required
                  type="number"
                  value={profile.heightCm || ''}
                  onChange={e => handleProfileChange('heightCm', e.target.value === '' ? 0 : Math.max(1, parseInt(e.target.value) || 0))}
                />
              </div>

              <div className="form-group">
                <label className="font-display text-xs tracking-wider text-[#cdc2d8] flex items-center gap-1 mb-1" htmlFor="weight">
                  Mass (kg) <span className="text-[#ffb4ab]">*</span>
                </label>
                <input
                  className="input-technical text-base"
                  id="weight"
                  max="300"
                  min="20"
                  placeholder="e.g. 75"
                  required
                  type="number"
                  value={profile.weightKg || ''}
                  onChange={e => handleProfileChange('weightKg', e.target.value === '' ? 0 : Math.max(1, parseInt(e.target.value) || 0))}
                />
              </div>

              <div className="form-group md:col-span-2 mt-4">
                <label className="font-display text-xs tracking-wider text-[#cdc2d8] flex items-center gap-1 mb-1" htmlFor="streak">
                  Target Streak Integrity (Days) <span className="text-[#ffb4ab]">*</span>
                </label>
                <div className="relative">
                  <input
                    className="input-technical text-base pl-8"
                    id="streak"
                    max="365"
                    min="1"
                    placeholder="Set your commitment"
                    required
                    type="number"
                    value={profile.streakGoal || ''}
                    onChange={e => handleProfileChange('streakGoal', e.target.value === '' ? 0 : Math.max(1, parseInt(e.target.value) || 0))}
                  />
                  <Flame className="w-4 h-4 text-[#ffaaf9] absolute left-0 top-1/2 -translate-y-1/2" />
                </div>
              </div>
            </div>
          </section>

          {/* Weekly Plan Section */}
          <section className="glass-panel rounded-xl p-6 md:p-8 relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-[#4c61ea] to-[#8a3ffc]"></div>
            <div className="absolute top-0 left-0 w-full h-12 bg-[#4c61ea]/10 -z-10"></div>
            <h3 className="font-display text-xl md:text-2xl text-[#bbc3ff] mb-2 flex items-center gap-2">
              <Calendar className="w-6 h-6 text-[#bbc3ff]" />
              Weekly Directive
            </h3>
            <p className="font-sans text-sm text-[#cdc2d8] mb-8">Establish your combat and conditioning schedule.</p>
            
            <div className="space-y-4">
              {(['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'] as (keyof WeeklyPlan)[]).map((day, idx) => {
                const labelColor = idx >= 5 ? 'text-[#ffaaf9]' : 'text-[#d4bbff]';
                const dayNum = String(idx + 1).padStart(2, '0');
                const dayAbbr = day.toUpperCase().substring(0, 3);
                
                return (
                  <div key={day} className="bg-[#1e1a24]/50 p-4 rounded-lg border border-[#4b4455]/30 flex flex-col md:flex-row md:items-center gap-4 hover:bg-[#1e1a24] transition-colors">
                    <div className={`w-32 font-display text-xs tracking-widest ${labelColor}`}>
                      DAY_{dayNum} // {dayAbbr} <span className="text-[#ffb4ab]">*</span>
                    </div>
                    <div className="flex-grow">
                      <input
                        className="input-technical w-full text-[#e8dfee]"
                        placeholder={idx === 2 || idx === 6 ? 'e.g. Rest & Recovery' : 'e.g. 30 pushups, 20 squats, 60s plank'}
                        required
                        type="text"
                        value={weeklyPlan[day]}
                        onChange={e => handlePlanChange(day, e.target.value)}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </section>

          <div className="flex justify-center mt-12">
            <button
              className={`btn-technical font-display text-sm w-full md:w-auto min-w-[240px] flex items-center justify-center gap-2 ${
                isFormValid ? 'opacity-100 cursor-pointer shadow-[0_0_24px_rgba(138,63,252,0.4)] hover:shadow-[0_0_32px_rgba(138,63,252,0.6)] hover:-translate-y-0.5' : 'opacity-40 cursor-not-allowed pointer-events-none'
              }`}
              type="submit"
              disabled={!isFormValid}
            >
              <span className="btn-technical-inner"></span>
              <span className="relative z-10 flex items-center justify-center gap-2">
                Initialize Protocol
                <ArrowRight className="w-4 h-4" />
              </span>
            </button>
          </div>
        </form>
      </main>
    </div>
  );
};
