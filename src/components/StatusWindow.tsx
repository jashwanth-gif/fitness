import React, { useRef, useEffect, useState } from 'react';
import { Shield, Flame, Activity, Zap, Compass, TrendingUp, Plus, Sparkles } from 'lucide-react';
import type { UserProgress, StatType } from '../types/system';

interface StatusWindowProps {
  progress: UserProgress;
  onAllocateStatPoint: (stat: StatType) => void;
}

export const StatusWindow: React.FC<StatusWindowProps> = ({ progress, onAllocateStatPoint }) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // Imagine.io 3D Crystal Settings
  const [crystalType, setCrystalType] = useState<'octahedron' | 'dodecahedron' | 'stellar' | 'prism'>('octahedron');
  const [crystalColor, setCrystalColor] = useState<'aqua' | 'purple' | 'crimson' | 'emerald' | 'amber'>('aqua');
  const [crystalStyle, setCrystalStyle] = useState<'wireframe' | 'solid' | 'glass' | 'pulse'>('glass');
  const [rotationSpeed, setRotationSpeed] = useState<number>(0.8);
  const [glowIntensity, setGlowIntensity] = useState<number>(0.7);

  // Stats description mapping
  const statConfig = [
    { key: 'strength' as StatType, label: 'Strength (STR)', icon: Flame, color: 'text-rose-500', barColor: 'bg-rose-500', desc: 'Calisthenics, pushups, rows, squats' },
    { key: 'agility' as StatType, label: 'Agility (AGI)', icon: Zap, color: 'text-cyan-400', barColor: 'bg-cyan-400', desc: 'Stair climbing, corridor sprints, rope work' },
    { key: 'vitality' as StatType, label: 'Vitality (VIT)', icon: Activity, color: 'text-emerald-400', barColor: 'bg-emerald-400', desc: 'Durability, long-duration wall sits, stairs' },
    { key: 'stamina' as StatType, label: 'Stamina (STM)', icon: TrendingUp, color: 'text-amber-500', barColor: 'bg-amber-500', desc: 'HIIT circuits, short-rest calisthenics density' },
    { key: 'flexibility' as StatType, label: 'Flexibility (FLX)', icon: Compass, color: 'text-fuchsia-500', barColor: 'bg-fuchsia-500', desc: 'Stretching, range of motion, yoga' },
    { key: 'discipline' as StatType, label: 'Discipline (DIS)', icon: Shield, color: 'text-slate-400', barColor: 'bg-slate-400', desc: 'Consistency, streak conservation, quests finished' },
  ];

  // 3D Geometry Loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationId: number;
    let angleX = 0;
    let angleY = 0;

    interface Point3D { x: number; y: number; z: number }
    let vertices: Point3D[] = [];
    let faces: number[][] = [];

    const updateGeometry = () => {
      if (crystalType === 'octahedron') {
        vertices = [
          { x: 0, y: -1, z: 0 },
          { x: 1, y: 0, z: 0 },
          { x: 0, y: 0, z: 1 },
          { x: -1, y: 0, z: 0 },
          { x: 0, y: 0, z: -1 },
          { x: 0, y: 1, z: 0 }
        ];
        faces = [
          [0, 1, 2], [0, 2, 3], [0, 3, 4], [0, 4, 1],
          [5, 2, 1], [5, 3, 2], [5, 4, 3], [5, 1, 4]
        ];
      } else if (crystalType === 'dodecahedron') {
        vertices = [
          { x: 0, y: -1.2, z: 0 },
          { x: 0.8, y: -0.4, z: 0.8 },
          { x: -0.8, y: -0.4, z: 0.8 },
          { x: -0.8, y: -0.4, z: -0.8 },
          { x: 0.8, y: -0.4, z: -0.8 },
          { x: 1.1, y: 0.4, z: 0 },
          { x: 0, y: 0.4, z: 1.1 },
          { x: -1.1, y: 0.4, z: 0 },
          { x: 0, y: 0.4, z: -1.1 },
          { x: 0, y: 1.2, z: 0 }
        ];
        faces = [
          [0, 1, 2], [0, 2, 3], [0, 3, 4], [0, 4, 1],
          [1, 5, 6], [2, 6, 7], [3, 7, 8], [4, 8, 5],
          [1, 6, 2], [2, 7, 3], [3, 8, 4], [4, 5, 1],
          [9, 6, 5], [9, 7, 6], [9, 8, 7], [9, 5, 8]
        ];
      } else if (crystalType === 'stellar') {
        vertices = [
          { x: 0, y: -1.5, z: 0 },
          { x: 0, y: 1.5, z: 0 },
          { x: 1.2, y: 0, z: 0 },
          { x: -1.2, y: 0, z: 0 },
          { x: 0, y: 0, z: 1.2 },
          { x: 0, y: 0, z: -1.2 },
          { x: 0.6, y: -0.6, z: 0.6 },
          { x: -0.6, y: -0.6, z: 0.6 },
          { x: -0.6, y: -0.6, z: -0.6 },
          { x: 0.6, y: -0.6, z: -0.6 }
        ];
        faces = [
          [0, 6, 4], [0, 4, 7], [0, 7, 3], [0, 3, 8],
          [0, 8, 5], [0, 5, 9], [0, 9, 2], [0, 2, 6],
          [1, 4, 6], [1, 7, 4], [1, 3, 7], [1, 8, 3],
          [1, 5, 8], [1, 9, 5], [1, 2, 9], [1, 6, 2]
        ];
      } else {
        vertices = [
          { x: 0, y: -1.2, z: 0 },
          { x: 0.7, y: 0, z: 0.7 },
          { x: -0.7, y: 0, z: 0.7 },
          { x: 0, y: 0, z: -1.0 },
          { x: 0, y: 1.2, z: 0 }
        ];
        faces = [
          [0, 1, 2], [0, 2, 3], [0, 3, 1],
          [4, 2, 1], [4, 3, 2], [4, 1, 3]
        ];
      }
    };

    updateGeometry();

    const resizeCanvas = () => {
      canvas.width = canvas.parentElement?.clientWidth || 250;
      canvas.height = canvas.width;
    };
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    const colors = {
      aqua: { primary: '0, 240, 255', hex: '#00f0ff' },
      purple: { primary: '189, 0, 255', hex: '#bd00ff' },
      crimson: { primary: '255, 0, 122', hex: '#ff007a' },
      emerald: { primary: '57, 255, 20', hex: '#39ff14' },
      amber: { primary: '255, 94, 0', hex: '#ff5e00' },
    };

    const render = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      // Grid pattern matching design rules
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.015)';
      ctx.lineWidth = 1;
      const gridSize = 15;
      for (let x = 0; x < canvas.width; x += gridSize) {
        ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, canvas.height); ctx.stroke();
      }
      for (let y = 0; y < canvas.height; y += gridSize) {
        ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(canvas.width, y); ctx.stroke();
      }

      const activeColor = colors[crystalColor];
      const scale = canvas.width * 0.28;
      const centerX = canvas.width / 2;
      const centerY = canvas.height / 2;

      const radX = angleX * Math.PI / 180;
      const radY = angleY * Math.PI / 180;

      const cosX = Math.cos(radX);
      const sinX = Math.sin(radX);
      const cosY = Math.cos(radY);
      const sinY = Math.sin(radY);

      const projected = vertices.map(v => {
        let x1 = v.x * cosY - v.z * sinY;
        let z1 = v.z * cosY + v.x * sinY;
        let y2 = v.y * cosX - z1 * sinX;
        let z2 = z1 * cosX + v.y * sinX;

        const distance = 3.5;
        const depth = 1 / (distance - z2);
        
        return {
          x: centerX + x1 * scale * depth * 2,
          y: centerY + y2 * scale * depth * 2,
          z: z2
        };
      });

      const sortedFaces = faces.map((face, index) => {
        const avgZ = (projected[face[0]].z + projected[face[1]].z + projected[face[2]].z) / 3;
        return { face, avgZ, index };
      }).sort((a, b) => a.avgZ - b.avgZ);

      // Backglow
      const glowGrad = ctx.createRadialGradient(centerX, centerY, 10, centerX, centerY, scale * 1.2);
      glowGrad.addColorStop(0, `rgba(${activeColor.primary}, ${0.12 * glowIntensity})`);
      glowGrad.addColorStop(1, 'rgba(0,0,0,0)');
      ctx.fillStyle = glowGrad;
      ctx.beginPath();
      ctx.arc(centerX, centerY, scale * 1.2, 0, Math.PI * 2);
      ctx.fill();

      sortedFaces.forEach(({ face }) => {
        const p1 = projected[face[0]];
        const p2 = projected[face[1]];
        const p3 = projected[face[2]];

        const v1x = p2.x - p1.x;
        const v1y = p2.y - p1.y;
        const v2x = p3.x - p1.x;
        const v2y = p3.y - p1.y;
        const isFront = (v1x * v2y - v1y * v2x) < 0;

        ctx.beginPath();
        ctx.moveTo(p1.x, p1.y);
        ctx.lineTo(p2.x, p2.y);
        ctx.lineTo(p3.x, p3.y);
        ctx.closePath();

        if (crystalStyle === 'wireframe') {
          ctx.strokeStyle = `rgba(${activeColor.primary}, ${isFront ? 0.8 : 0.25})`;
          ctx.lineWidth = isFront ? 1.5 : 0.8;
          ctx.stroke();
        } else if (crystalStyle === 'solid') {
          const dot = 0.5;
          const brightness = Math.max(0.1, (dot + 1) / 2);
          ctx.fillStyle = `rgba(${activeColor.primary}, ${brightness * 0.7 * glowIntensity})`;
          ctx.fill();
          ctx.strokeStyle = `rgba(${activeColor.primary}, 0.3)`;
          ctx.lineWidth = 0.5;
          ctx.stroke();
        } else if (crystalStyle === 'glass') {
          const gradient = ctx.createLinearGradient(p1.x, p1.y, p3.x, p3.y);
          gradient.addColorStop(0, `rgba(${activeColor.primary}, ${isFront ? 0.35 : 0.1})`);
          gradient.addColorStop(1, 'rgba(255, 255, 255, 0.15)');
          ctx.fillStyle = gradient;
          ctx.fill();
          ctx.strokeStyle = `rgba(${activeColor.primary}, ${isFront ? 0.7 : 0.25})`;
          ctx.lineWidth = isFront ? 1.2 : 0.6;
          ctx.stroke();
        } else {
          const pulse = (Math.sin(Date.now() / 200) + 1) / 2;
          ctx.fillStyle = `rgba(${activeColor.primary}, ${isFront ? (0.1 + pulse * 0.25) : 0.05})`;
          ctx.fill();
          ctx.strokeStyle = `rgba(${activeColor.primary}, ${isFront ? (0.4 + pulse * 0.5) : 0.15})`;
          ctx.lineWidth = isFront ? 1.5 : 0.5;
          ctx.stroke();
        }
      });

      // Core particle
      ctx.beginPath();
      ctx.arc(centerX, centerY, 8 + progress.level * 0.15, 0, Math.PI * 2);
      ctx.fillStyle = '#ffffff';
      ctx.shadowColor = activeColor.hex;
      ctx.shadowBlur = 15;
      ctx.fill();
      ctx.shadowBlur = 0;

      angleX += rotationSpeed * 0.5;
      angleY += rotationSpeed * 0.8;

      animationId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animationId);
      window.removeEventListener('resize', resizeCanvas);
    };
  }, [crystalType, crystalColor, crystalStyle, rotationSpeed, glowIntensity, progress.level]);

  const xpPercent = Math.min(100, Math.max(0, (progress.currentXp / progress.requiredXp) * 100));

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      
      {/* 3D Crystal Panel */}
      <div className="lg:col-span-1 glass-panel rounded-2xl p-5 border border-white/5 flex flex-col items-center">
        <h3 className="w-full text-xs font-mono uppercase tracking-wider text-slate-400 mb-2 flex items-center gap-1.5">
          <Sparkles className="w-4 h-4 text-cyan-400" />
          SYSTEM CORE VISUALIZER
        </h3>
        
        <div className="w-full relative flex justify-center bg-slate-950/40 rounded-xl overflow-hidden border border-slate-800/80 mb-4">
          <canvas ref={canvasRef} className="max-w-[250px]" />
        </div>

        {/* Imagine.io Config Controls */}
        <div className="w-full space-y-3">
          <div className="grid grid-cols-3 gap-2">
            <div>
              <span className="block text-[9px] text-slate-500 uppercase font-mono mb-1">TYPE</span>
              <select
                value={crystalType}
                onChange={e => setCrystalType(e.target.value as any)}
                className="w-full bg-slate-900 border border-slate-800 rounded px-2 py-1 text-[10px] text-slate-200 focus:outline-none"
              >
                <option value="octahedron">Octa</option>
                <option value="dodecahedron">Dodeca</option>
                <option value="stellar">Stellar</option>
                <option value="prism">Prism</option>
              </select>
            </div>

            <div>
              <span className="block text-[9px] text-slate-500 uppercase font-mono mb-1">THEME</span>
              <select
                value={crystalColor}
                onChange={e => setCrystalColor(e.target.value as any)}
                className="w-full bg-slate-900 border border-slate-800 rounded px-2 py-1 text-[10px] text-slate-200 focus:outline-none"
              >
                <option value="aqua">Aqua</option>
                <option value="purple">Purple</option>
                <option value="crimson">Crimson</option>
                <option value="emerald">Emerald</option>
                <option value="amber">Amber</option>
              </select>
            </div>

            <div>
              <span className="block text-[9px] text-slate-500 uppercase font-mono mb-1">STYLE</span>
              <select
                value={crystalStyle}
                onChange={e => setCrystalStyle(e.target.value as any)}
                className="w-full bg-slate-900 border border-slate-800 rounded px-2 py-1 text-[10px] text-slate-200 focus:outline-none"
              >
                <option value="wireframe">Wire</option>
                <option value="solid">Solid</option>
                <option value="glass">Glass</option>
                <option value="pulse">Pulse</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 pt-1">
            <div>
              <label className="block text-[9px] text-slate-500 uppercase font-mono mb-0.5">ROTATION</label>
              <input
                type="range"
                min="0.1"
                max="2.5"
                step="0.1"
                value={rotationSpeed}
                onChange={e => setRotationSpeed(parseFloat(e.target.value))}
                className="w-full accent-cyan-400 h-1 bg-slate-950 rounded cursor-pointer"
              />
            </div>
            <div>
              <label className="block text-[9px] text-slate-500 uppercase font-mono mb-0.5">GLOW</label>
              <input
                type="range"
                min="0.1"
                max="1.5"
                step="0.1"
                value={glowIntensity}
                onChange={e => setGlowIntensity(parseFloat(e.target.value))}
                className="w-full accent-cyan-400 h-1 bg-slate-950 rounded cursor-pointer"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Level, XP & Physical Metrics Status Card */}
      <div className="lg:col-span-2 space-y-6">
        
        {/* Profile Card */}
        <div className="glass-panel rounded-2xl p-5 border border-white/5 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-bl from-cyan-500/10 to-transparent pointer-events-none" />
          
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <span className="text-[10px] font-mono text-cyan-400 uppercase tracking-widest">CHARACTER PROFILE</span>
              <h2 className="text-2xl font-bold font-display text-white mt-0.5">{progress.profile.name}</h2>
              <p className="text-xs text-slate-400 font-mono mt-0.5 uppercase tracking-wide">
                Title: <span className="text-slate-200">{progress.title}</span>
              </p>
            </div>

            <div className="flex items-center gap-3">
              <div 
                className="text-center bg-slate-950/60 rounded-xl px-4 py-2.5 min-w-[70px]"
                style={{ 
                  border: '1px solid #e8b93f', 
                  boxShadow: '0 0 12px rgba(232, 185, 63, 0.4)' 
                }}
              >
                <span className="block text-[9px] text-[#e8b93f] uppercase font-mono">RANK</span>
                <span className="text-xl font-black text-[#e8b93f] font-display">{progress.rank}</span>
              </div>
              <div className="text-center bg-slate-950/60 border border-slate-800 rounded-xl px-4 py-2.5 min-w-[70px]">
                <span className="block text-[9px] text-slate-500 uppercase font-mono">LEVEL</span>
                <span className="text-xl font-black text-cyan-400 font-display">{progress.level}</span>
              </div>
            </div>
          </div>

          {/* XP Bar */}
          <div className="mt-5 space-y-2">
            <div className="flex justify-between text-xs font-mono">
              <span className="text-slate-400">XP Progress</span>
              <span className="text-cyan-400">{progress.currentXp} / {progress.requiredXp} XP</span>
            </div>
            <div className="w-full bg-slate-950 h-2.5 rounded-full overflow-hidden border border-slate-800">
              <div
                className="bg-gradient-to-r from-cyan-400 to-purple-500 h-full rounded-full transition-all duration-300"
                style={{ width: `${xpPercent}%` }}
              />
            </div>
          </div>

          {/* Metrics */}
          <div className="mt-5 grid grid-cols-2 sm:grid-cols-4 gap-3 pt-4 border-t border-slate-800/80">
            <div>
              <span className="block text-[9px] text-slate-500 uppercase font-mono">HEIGHT</span>
              <span className="text-xs font-bold text-slate-200">{progress.profile.heightCm} cm</span>
            </div>
            <div>
              <span className="block text-[9px] text-slate-500 uppercase font-mono">WEIGHT</span>
              <span className="text-xs font-bold text-slate-200">{progress.profile.weightKg} kg</span>
            </div>
            <div>
              <span className="block text-[9px] text-slate-500 uppercase font-mono">BMI SCORE</span>
              <span className="text-xs font-bold text-slate-200">{progress.bmi}</span>
            </div>
            <div>
              <span className="block text-[9px] text-slate-500 uppercase font-mono">STREAK GOAL</span>
              <span className="text-xs font-bold text-cyan-400 uppercase">{progress.profile.streakGoal} DAYS</span>
            </div>
          </div>
        </div>

        {/* Stats Allocator Section */}
        <div className="glass-panel rounded-2xl p-5 border border-white/5">
          <div className="flex justify-between items-center mb-4">
            <div>
              <h3 className="text-xs font-mono uppercase tracking-wider text-slate-400">PHYSICAL CAPABILITIES</h3>
              <p className="text-[10px] text-slate-500">Upgrade physical stats to rise through the hunter rank hierarchy.</p>
            </div>
            {progress.statPointsToAllocate > 0 && (
              <div className="px-2.5 py-1 rounded bg-yellow-500/20 text-yellow-400 border border-yellow-500/40 text-[10px] font-mono font-bold animate-pulse">
                {progress.statPointsToAllocate} STAT POINTS TO DISTRIBUTE
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {statConfig.map((stat) => {
              const IconComponent = stat.icon;
              const val = progress.stats[stat.key];
              const displayVal = typeof val === 'number' ? val.toFixed(1) : parseFloat(String(val || 10)).toFixed(1);

              return (
                <div
                  key={stat.key}
                  className="p-3 bg-slate-950/40 border border-slate-900 rounded-xl flex items-center justify-between gap-3"
                >
                  <div className="flex items-center space-x-3 min-w-0">
                    <div className={`p-2 rounded-lg bg-slate-900 border border-slate-800 ${stat.color}`}>
                      <IconComponent className="w-4 h-4" />
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center space-x-2">
                        <span className="font-bold text-slate-200 text-xs truncate">{stat.label}</span>
                        <span className={`text-xs font-mono font-bold ${stat.color}`}>{displayVal}</span>
                      </div>
                      <p className="text-[9px] text-slate-500 truncate">{stat.desc}</p>
                    </div>
                  </div>

                  {progress.statPointsToAllocate > 0 && (
                    <button
                      onClick={() => onAllocateStatPoint(stat.key)}
                      className="p-1.5 rounded-lg bg-yellow-500 hover:bg-yellow-400 text-slate-950 transition cursor-pointer"
                      title={`Allocate 1 point to ${stat.label}`}
                    >
                      <Plus className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        </div>

      </div>
    </div>
  );
};
