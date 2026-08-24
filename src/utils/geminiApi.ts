import type { UserProgress } from '../types/system';

export async function askGeminiAICoach(
  userQuery: string,
  userProgress: UserProgress,
  apiKey?: string
): Promise<string> {
  const { profile, stats, level, rank, bmi } = userProgress;

  const systemContextPrompt = `
You are "THE SYSTEM" — a mysterious, highly encouraging AI fitness coach and status monitor inspired by Solo Leveling.
You talk in a clean, futuristic, authoritative yet supportive tone.

USER CHARACTER DATA:
- Name: ${profile.name}
- Level: ${level} (Rank: ${rank})
- Height: ${profile.heightCm} cm | Weight: ${profile.weightKg} kg | BMI: ${bmi}
- Physical Stats:
  * Strength (STR): ${stats.strength}
  * Agility (AGI): ${stats.agility}
  * Vitality (VIT): ${stats.vitality}
  * Stamina (STM): ${stats.stamina}
  * Flexibility (FLX): ${stats.flexibility}
  * Discipline (DIS): ${stats.discipline}
- Streak Goal: ${profile.streakGoal} days (Current Streak: ${userProgress.streakDays} days)

INSTRUCTIONS:
1. Provide actionable advice for bodyweight calisthenics, hostel mess food hacks (eggs, sprouts, curd, peanuts), exercise form, or workout motivation.
2. Address the user directly as "Player ${profile.name}".
3. Keep responses concise, impactful, and formatted with bullet points or bold text where appropriate.
4. Never give medical prescriptions or dangerous advice.
`;

  // If user provided a Gemini API Key, use direct Gemini API endpoint
  const activeKey = apiKey || userProgress.geminiApiKey || (import.meta as any).env?.VITE_GEMINI_API_KEY;

  if (activeKey && activeKey.trim().length > 10) {
    try {
      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${activeKey}`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            contents: [
              {
                role: 'user',
                parts: [
                  { text: systemContextPrompt },
                  { text: `Player Question: ${userQuery}` }
                ]
              }
            ],
            generationConfig: {
              maxOutputTokens: 500,
              temperature: 0.7
            }
          })
        }
      );

      if (response.ok) {
        const data = await response.json();
        const replyText = data?.candidates?.[0]?.content?.parts?.[0]?.text;
        if (replyText) return replyText;
      }
    } catch (err) {
      console.warn('Gemini API call failed, using fallback coach response:', err);
    }
  }

  // Fallback System AI Coach Logic when API key is pending or network is offline
  return generateFallbackCoachResponse(userQuery, userProgress);
}

function generateFallbackCoachResponse(query: string, progress: UserProgress): string {
  const q = query.toLowerCase();
  const name = progress.profile.name;
  const str = progress.stats.strength;
  const vit = progress.stats.vitality;

  if (q.includes('pushup') || q.includes('chest') || q.includes('arms')) {
    return `[SYSTEM NOTICE] Player ${name}, your Strength stat is currently at ${str}.\n\nTo increase pushup volume in a hostel room:\n• **Decline Pushups**: Put feet on your hostel bed/chair for upper chest focus.\n• **Pike Pushups**: Focus on shoulder development.\n• **Tempo Control**: 3 seconds down, 1 second up for maximum muscle fiber recruitment.\n\nCompleting your daily quest checkpoints will add +0.1 to your STR stat per set!`;
  }

  if (q.includes('food') || q.includes('diet') || q.includes('mess') || q.includes('protein')) {
    return `[SYSTEM NUTRITION HACK]\n\nPlayer ${name}, training in a hostel mess requires strategic food selection:\n1. **Mess Eggs & Sprout Bowl**: Request double eggs or extra chana/sprouts during breakfast.\n2. **Curd / Dahi**: Excellent for gut health and post-workout protein.\n3. **Peanut & Jaggery (Chikki)**: Budget-friendly calorie & stamina booster.\n\nKeep your Vitality stat high (${vit} VIT) by staying hydrated with 3L+ water daily.`;
  }

  if (q.includes('level') || q.includes('stat') || q.includes('rank') || q.includes('xp')) {
    return `[SYSTEM STAT OVERVIEW]\n\nPlayer ${name}:\n• **Current Level**: ${progress.level}\n• **Rank**: ${progress.rank} (${progress.title})\n• **XP Progress**: ${progress.currentXp} / ${progress.requiredXp} XP\n\nEach completed checkpoint grants +0.1 stat point and +10 XP. Upon leveling up, you receive +1 Stat Point to freely distribute!`;
  }

  return `[SYSTEM ASSISTANT]\n\nGreetings, Player ${name}. I am analyzing your physical parameters:\n• Strength: ${progress.stats.strength} | Agility: ${progress.stats.agility} | Vitality: ${progress.stats.vitality}\n\nMaintain your weekly weekday quest schedule without missing days to keep your streak bonus alive. You can also configure your custom Gemini API key in settings for real-time deep AI analysis!`;
}
