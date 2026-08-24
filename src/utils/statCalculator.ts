import type { PhysicalStats, UserProfile, RankTier, WeeklyPlan, DailyQuest, Checkpoint, StatType } from '../types/system';

/**
 * Calculates BMI based on user height (cm) and weight (kg).
 */
export function calculateBMI(heightCm: number, weightKg: number): number {
  if (heightCm <= 0 || weightKg <= 0) return 0;
  const heightM = heightCm / 100;
  return parseFloat((weightKg / (heightM * heightM)).toFixed(1));
}

/**
 * Calculates initial baseline stats based on BMI band + age as a gamified seed.
 */
export function calculateBaselineStats(profile: UserProfile): PhysicalStats {
  const { heightCm, weightKg, age } = profile;
  const bmi = calculateBMI(heightCm, weightKg);

  // BMI band multipliers (e.g. neutral band 18.5 - 25 is 1.0x, others adjust +/- 10-15%)
  let bmiMultiplier = 1.0;
  if (bmi < 18.5) {
    bmiMultiplier = 0.9; // -10%
  } else if (bmi >= 18.5 && bmi < 25) {
    bmiMultiplier = 1.0; // neutral
  } else if (bmi >= 25 && bmi < 30) {
    bmiMultiplier = 0.9; // -10%
  } else {
    bmiMultiplier = 0.85; // -15%
  }

  // Age adjustment (subtle +/- 10% for granularity)
  let ageAdjustment = 0;
  if (age < 20) {
    ageAdjustment = 1.5;
  } else if (age >= 20 && age < 30) {
    ageAdjustment = 0.5;
  } else if (age >= 30 && age < 40) {
    ageAdjustment = -0.5;
  } else {
    ageAdjustment = -1.5;
  }

  // Baseline of 20 applied across all six stats
  const baseValue = Math.max(5, Math.round(20 * bmiMultiplier + ageAdjustment));

  return {
    strength: baseValue,
    agility: baseValue,
    vitality: baseValue,
    stamina: baseValue,
    flexibility: baseValue,
    discipline: baseValue
  };
}

/**
 * Determines Rank and Title based on total stat points (front-loaded curve).
 */
export function calculateRankAndTitle(stats: PhysicalStats): { rank: RankTier; title: string } {
  const total = stats.strength + stats.agility + stats.vitality + stats.stamina + stats.flexibility + stats.discipline;

  if (total >= 400) return { rank: 'SSS', title: 'Monarch of Shadows' };
  if (total >= 300) return { rank: 'SS', title: 'Shadow Commander' };
  if (total >= 220) return { rank: 'S', title: 'National Rank Hunter' };
  if (total >= 180) return { rank: 'A', title: 'Guild Master' };
  if (total >= 150) return { rank: 'B', title: 'High-Grade Raider' };
  if (total >= 135) return { rank: 'C', title: 'Dungeon Crawler' };
  if (total >= 120) return { rank: 'D', title: 'Awakened Novice' };
  return { rank: 'E', title: 'E-Rank Civilian' };
}

/**
 * Official Compendium of Physical Activities MET values reference table
 */
export const MET_TABLE = {
  running: 9.8,               // running, general
  walking: 4.0,               // walking, 3.0 mph
  stairs: 8.0,                // climbing stairs
  pushups: 8.0,               // calisthenics, vigorous (pushups, pullups, etc.)
  calisthenics: 8.0,          // calisthenics, vigorous
  hiit: 8.0,                  // circuit training, vigorous
  cycling: 7.5,               // bicycling, general
  stretching: 2.3,            // stretching, mild
  yoga: 2.5,                  // Hatha yoga
  general: 4.5                // default general physical activity
};

/**
 * Determines the MET value for an exercise description string
 */
export function getMETForExercise(text: string): number {
  const lower = text.toLowerCase();
  if (lower.includes('run')) return MET_TABLE.running;
  if (lower.includes('stair') || lower.includes('climb')) return MET_TABLE.stairs;
  if (lower.includes('pushup') || lower.includes('push-up') || lower.includes('pullup') || lower.includes('pull-up') || lower.includes('dip') || lower.includes('calisthenics')) return MET_TABLE.calisthenics;
  if (lower.includes('hiit') || lower.includes('circuit') || lower.includes('burpee') || lower.includes('squat')) return MET_TABLE.hiit;
  if (lower.includes('cycle') || lower.includes('bike')) return MET_TABLE.cycling;
  if (lower.includes('stretch') || lower.includes('mobility')) return MET_TABLE.stretching;
  if (lower.includes('yoga')) return MET_TABLE.yoga;
  if (lower.includes('walk')) return MET_TABLE.walking;
  return MET_TABLE.general;
}

/**
 * Parses user text weekday inputs into daily quests with bite-sized checkpoints.
 */
export function generateDailyQuestsFromPlan(weeklyPlan: WeeklyPlan): DailyQuest[] {
  const days: (keyof WeeklyPlan)[] = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

  return days.map((day) => {
    const planText = weeklyPlan[day] || 'Rest & Recovery Day';
    const isRest = planText.toLowerCase().includes('rest') || planText.trim().length === 0;

    let category: DailyQuest['category'] = 'Calisthenics';
    if (planText.toLowerCase().includes('run') || planText.toLowerCase().includes('cardio') || planText.toLowerCase().includes('stairs')) {
      category = 'Cardio';
    } else if (planText.toLowerCase().includes('plank') || planText.toLowerCase().includes('abs') || planText.toLowerCase().includes('core')) {
      category = 'Core';
    } else if (planText.toLowerCase().includes('stretch') || planText.toLowerCase().includes('yoga')) {
      category = 'Mobility';
    } else if (isRest) {
      category = 'Hostel Bonus';
    }

    const checkpoints: Checkpoint[] = [];

    if (isRest) {
      checkpoints.push({
        id: `${day}-chk-1`,
        text: 'Active Recovery: 10 mins Light Stretch or Room Walk',
        statType: 'flexibility',
        statReward: 0.1,
        xpReward: 10,
        isCompleted: false,
        durationMinutes: 10
      });
      checkpoints.push({
        id: `${day}-chk-2`,
        text: 'Hydration & Mess Nutrition: 3L Water + Protein Meal',
        statType: 'vitality',
        statReward: 0.1,
        xpReward: 10,
        isCompleted: false,
        durationMinutes: 10
      });
      checkpoints.push({
        id: `${day}-chk-3`,
        text: 'Mind Discipline: 5 mins Deep Breathing / Meditation',
        statType: 'discipline',
        statReward: 0.1,
        xpReward: 10,
        isCompleted: false,
        durationMinutes: 5
      });
    } else {
      // Split user plan by commas, ands, or newlines
      const rawTasks = planText.split(/(?:and|then|,|\n)+/).map(t => t.trim()).filter(t => t.length > 0);
      let checkpointIdIndex = 1;

      rawTasks.forEach((part) => {
        const numMatch = part.match(/(\d+)\s*(pushup|push\-up|push\s*up|pullup|pull\-up|pull\s*up|squat|dip|situp|sit\-up|sit\s*up|plank|run|stair|climb|stretch|yoga)/i);
        const setMatch = part.match(/in\s*(\d+)\s*set/i);

        if (numMatch) {
          const totalReps = parseInt(numMatch[1]);
          const exercise = numMatch[2].toLowerCase();
          const sets = setMatch ? parseInt(setMatch[1]) : 3;

          let statType: StatType = 'strength';
          let estDurationMinutesPerSet = 2; // default 2 minutes per set
          if (exercise.includes('run') || exercise.includes('stair') || exercise.includes('climb')) {
            statType = 'agility';
            estDurationMinutesPerSet = Math.max(5, Math.round(totalReps / sets)); // e.g. run mins
          } else if (exercise.includes('plank')) {
            statType = 'vitality';
            estDurationMinutesPerSet = 1;
          } else if (exercise.includes('stretch') || exercise.includes('yoga')) {
            statType = 'flexibility';
            estDurationMinutesPerSet = 3;
          }

          const baseReps = Math.floor(totalReps / sets);
          const remainder = totalReps % sets;

          for (let s = 1; s <= sets; s++) {
            const repsForSet = baseReps + (s <= remainder ? 1 : 0);
            const text = repsForSet > 0
              ? `Set ${s}: Perform ${repsForSet} ${numMatch[2]}s`
              : `Set ${s}: Perform ${numMatch[2]}`;

            checkpoints.push({
              id: `${day}-chk-${checkpointIdIndex++}`,
              text,
              statType,
              statReward: 0.1,
              xpReward: 10,
              isCompleted: false,
              durationMinutes: estDurationMinutesPerSet
            });
          }
        } else {
          let statType: StatType = 'strength';
          let durationMinutes = 10;
          const lower = part.toLowerCase();
          if (lower.includes('run') || lower.includes('stair') || lower.includes('climb')) {
            statType = 'agility';
            durationMinutes = 20;
          } else if (lower.includes('plank')) {
            statType = 'vitality';
            durationMinutes = 5;
          } else if (lower.includes('stretch') || lower.includes('yoga')) {
            statType = 'flexibility';
            durationMinutes = 15;
          }

          checkpoints.push({
            id: `${day}-chk-${checkpointIdIndex++}`,
            text: part,
            statType,
            statReward: 0.1,
            xpReward: 10,
            isCompleted: false,
            durationMinutes
          });
        }
      });

      // Default fallback checkpoints if user gave short text
      if (checkpoints.length === 0) {
        checkpoints.push({
          id: `${day}-chk-1`,
          text: 'Set 1: 15 Pushups / Chair Dips',
          statType: 'strength',
          statReward: 0.1,
          xpReward: 10,
          isCompleted: false,
          durationMinutes: 5
        });
        checkpoints.push({
          id: `${day}-chk-2`,
          text: 'Set 2: 20 Bodyweight Squats',
          statType: 'agility',
          statReward: 0.1,
          xpReward: 10,
          isCompleted: false,
          durationMinutes: 5
        });
        checkpoints.push({
          id: `${day}-chk-3`,
          text: 'Set 3: 45s Plank Hold',
          statType: 'vitality',
          statReward: 0.1,
          xpReward: 10,
          isCompleted: false,
          durationMinutes: 2
        });
      }
    }

    return {
      id: `quest-${day.toLowerCase()}`,
      dayOfWeek: day,
      title: `${day.toUpperCase()} SYSTEM QUEST`,
      description: isRest ? 'Recovery & System Energy Regeneration' : planText,
      category,
      checkpoints,
      isCompleted: false
    };
  });
}

/**
 * Creates bonus quests for additional stat gains.
 */
export function generateBonusQuests(): DailyQuest[] {
  return [
    {
      id: 'bonus-quest-1',
      dayOfWeek: 'Daily',
      title: 'BONUS QUEST: STAIR MASTER',
      description: 'Climb 4 flights of hostel stairs without stopping',
      category: 'Cardio',
      isBonus: true,
      bonusStatPoints: 0.5,
      isCompleted: false,
      checkpoints: [
        {
          id: 'bonus-chk-1',
          text: 'Ascend 4 flights of hostel stairs',
          statType: 'stamina',
          statReward: 0.5,
          xpReward: 25,
          isCompleted: false,
          durationMinutes: 5
        }
      ]
    },
    {
      id: 'bonus-quest-2',
      dayOfWeek: 'Daily',
      title: 'BONUS QUEST: MESS FOOD HACK',
      description: 'Consume 3 eggs / boiled sprouts before 8 PM',
      category: 'Hostel Bonus',
      isBonus: true,
      bonusStatPoints: 0.5,
      isCompleted: false,
      checkpoints: [
        {
          id: 'bonus-chk-2',
          text: 'High-protein mess food choice logged',
          statType: 'vitality',
          statReward: 0.5,
          xpReward: 25,
          isCompleted: false,
          durationMinutes: 10
        }
      ]
    }
  ];
}
