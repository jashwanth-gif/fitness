export type RankTier = 'E' | 'D' | 'C' | 'B' | 'A' | 'S' | 'SS' | 'SSS';

export type StatType = 'strength' | 'agility' | 'vitality' | 'stamina' | 'flexibility' | 'discipline';

export interface PhysicalStats {
  strength: number;
  agility: number;
  vitality: number;
  stamina: number;
  flexibility: number;
  discipline: number;
}

export interface WeeklyPlan {
  Monday: string;
  Tuesday: string;
  Wednesday: string;
  Thursday: string;
  Friday: string;
  Saturday: string;
  Sunday: string;
}

export interface UserProfile {
  name: string;
  age: number;
  heightCm: number;
  weightKg: number;
  streakGoal: number;
  weeklyPlan: WeeklyPlan;
}

export interface Checkpoint {
  id: string;
  text: string;
  statType: StatType;
  statReward: number; // e.g. 0.1
  xpReward: number;   // e.g. 10
  isCompleted: boolean;
  durationMinutes: number; // Estimated duration for MET calorie calculations
}

export interface DailyQuest {
  id: string;
  dayOfWeek: string; // 'Monday', 'Tuesday', etc.
  title: string;
  description: string;
  category: 'Calisthenics' | 'Cardio' | 'Mobility' | 'Core' | 'Hostel Bonus';
  checkpoints: Checkpoint[];
  isCompleted: boolean;
  bonusStatPoints?: number;
  isBonus?: boolean;
}

export interface PenaltyQuest {
  id: string;
  title: string;
  description: string;
  requiredReps: number;
  isCompleted: boolean;
  missedDate: string;
}

export interface UserProgress {
  profile: UserProfile;
  stats: PhysicalStats;
  bmi: number;
  level: number;
  currentXp: number;
  requiredXp: number;
  statPointsToAllocate: number;
  rank: RankTier;
  title: string;
  streakDays: number;
  lastCompletedDate?: string;
  lastActiveDate: string;
  weeklyPlan: WeeklyPlan;
  quests: DailyQuest[];
  activePenalty?: PenaltyQuest;
  sickTokens: number;
  googleDriveEmail?: string;
  lastDriveBackupDate?: string;
  isDriveSynced?: boolean;
  geminiApiKey?: string;
  caloriesLog: { [date: string]: number }; // logs date (YYYY-MM-DD) -> totalKcal
}

export interface ChatMessage {
  id: string;
  sender: 'user' | 'system';
  text: string;
  timestamp: string;
}
