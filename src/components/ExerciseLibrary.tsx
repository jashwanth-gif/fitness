import React, { useState } from 'react';
import { X, Search, Dumbbell } from 'lucide-react';

interface Exercise {
  name: string;
  stat: string;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  target: string;
  setup: string;
  hostelEquipment: string;
}

const EXERCISE_LIBRARY: Exercise[] = [
  { name: "Archer Pushups", stat: "Strength", difficulty: "Medium", target: "Chest & Shoulders", setup: "Wide hand stance, slide body to one side bending one arm, keeping the other straight.", hostelEquipment: "Floor space" },
  { name: "Bucket Bicep Curls", stat: "Strength", difficulty: "Easy", target: "Arms (Biceps)", setup: "Fill a hostel bucket with water or books. Grip the handle and curl upwards.", hostelEquipment: "Hostel bucket + water/books" },
  { name: "Chair Dips", stat: "Strength", difficulty: "Easy", target: "Triceps & Chest", setup: "Place hands on the edge of a stable study chair, extend legs, lower hips.", hostelEquipment: "Study chair" },
  { name: "Staircase Sprints", stat: "Agility", difficulty: "Hard", target: "Legs & Cardio", setup: "Run up the hostel block stairs double-step, walk down for active recovery.", hostelEquipment: "Hostel stairs" },
  { name: "Shuttle Runs (5x5m)", stat: "Agility", difficulty: "Medium", target: "Footwork & Speed", setup: "Clear a small corridor space. Run 5 meters, touch floor, sprint back.", hostelEquipment: "Hostel corridor" },
  { name: "Burpees", stat: "Stamina", difficulty: "Hard", target: "Full Body Endurance", setup: "Drop to squat, kick feet back, pushup, return to squat, stand up/jump.", hostelEquipment: "Floor space" },
  { name: "Plank Hold", stat: "Strength", difficulty: "Easy", target: "Core Stability", setup: "Keep elbows under shoulders, back flat, glutes engaged. Do not let hips sag.", hostelEquipment: "Floor space" },
  { name: "Wall Sit", stat: "Vitality", difficulty: "Easy", target: "Quadriceps & Durability", setup: "Press back flat against hostel wall, bend knees to 90 degrees, hold.", hostelEquipment: "Hostel wall" }
];

interface ExerciseLibraryProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ExerciseLibrary: React.FC<ExerciseLibraryProps> = ({ isOpen, onClose }) => {
  const [searchTerm, setSearchTerm] = useState<string>('');

  if (!isOpen) return null;

  const filtered = EXERCISE_LIBRARY.filter(ex => 
    ex.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    ex.target.toLowerCase().includes(searchTerm.toLowerCase()) ||
    ex.stat.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
      <div className="w-full max-w-xl h-[80vh] glass-panel rounded-2xl p-6 border border-cyan-500/30 shadow-2xl flex flex-col relative animate-fade-in">
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-slate-100 p-1 cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="flex items-center space-x-3 mb-4">
          <div className="p-3 rounded-xl bg-cyan-950 border border-cyan-500/40 text-cyan-400">
            <Dumbbell className="w-6 h-6" />
          </div>
          <div>
            <h3 className="font-bold text-base text-slate-100 font-display">
              HOSTEL TRAINING LIBRARY
            </h3>
            <p className="text-xs text-slate-400">Zero-equipment calisthenics database adapted for small rooms</p>
          </div>
        </div>

        {/* Search Input */}
        <div className="relative mb-4">
          <Search className="absolute left-3.5 top-3 w-4 h-4 text-slate-500" />
          <input
            type="text"
            placeholder="Search exercises (e.g. pushup, chest, agility, strength)..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="w-full bg-slate-950 border border-slate-800 focus:border-cyan-500 focus:outline-none rounded-xl pl-10 pr-4 py-2.5 text-xs text-white"
          />
        </div>

        {/* Exercises list */}
        <div className="flex-1 overflow-y-auto space-y-3 pr-1">
          {filtered.length > 0 ? (
            filtered.map((ex, idx) => (
              <div
                key={idx}
                className="p-4 rounded-xl bg-slate-900/60 border border-slate-800/80 hover:border-slate-700 transition"
              >
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <h4 className="font-bold text-slate-100 text-xs font-display">{ex.name}</h4>
                    <p className="text-[10px] text-cyan-400 font-mono">{ex.target} • {ex.hostelEquipment}</p>
                  </div>
                  <div className="flex space-x-1.5">
                    <span className="text-[9px] font-mono px-2 py-0.5 rounded bg-slate-950 border border-slate-800 text-slate-400 uppercase">
                      {ex.stat}
                    </span>
                    <span className={`text-[9px] font-mono px-2 py-0.5 rounded border uppercase ${
                      ex.difficulty === 'Easy'
                        ? 'bg-emerald-950/40 border-emerald-500/20 text-emerald-400'
                        : ex.difficulty === 'Medium'
                        ? 'bg-yellow-950/40 border-yellow-500/20 text-yellow-400'
                        : 'bg-red-950/40 border-red-500/20 text-red-400'
                    }`}>
                      {ex.difficulty}
                    </span>
                  </div>
                </div>
                <p className="text-[11px] text-slate-400 leading-relaxed">{ex.setup}</p>
              </div>
            ))
          ) : (
            <div className="text-center py-10 text-slate-500 text-xs font-mono">
              No specific hostel exercises found matching your search.
            </div>
          )}
        </div>

      </div>
    </div>
  );
};
