/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import { GameStats } from '../types';
import { audioEngine } from '../audioEngine';
import { Hammer as HammerIcon, Sword as BatIcon, Hand as FistIcon, Award, Zap, RefreshCw } from 'lucide-react';

interface SmashLabProps {
  stats: GameStats;
  updateStats: (statUpdates: Partial<GameStats>) => void;
  triggerNotification: (title: string, desc: string) => void;
}

interface SmashObject {
  id: 'glass' | 'brick' | 'plate' | 'box' | 'watermelon';
  name: string;
  maxHp: number;
  hp: number;
  color: string;
  shatterType: 'glass' | 'brick' | 'plate' | 'box' | 'watermelon';
  particleColors: string[];
}

interface DebrisParticle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  angle: number;
  va: number; // angular velocity
  color: string;
  size: number;
  type: 'shard' | 'chunk' | 'circle' | 'splat';
  points?: { x: number; y: number }[]; // custom polygon shape
  alpha: number;
  life: number;
  maxLife: number;
}

interface CrackLine {
  startX: number;
  startY: number;
  segments: { x: number; y: number }[];
}

const SMASH_OBJECTS: SmashObject[] = [
  {
    id: 'glass',
    name: 'Tempered Glass Pane',
    maxHp: 100,
    hp: 100,
    color: '#93c5fd', // Soft blue
    shatterType: 'glass',
    particleColors: ['#e2e8f0', '#93c5fd', '#3b82f6', '#cbd5e1'],
  },
  {
    id: 'brick',
    name: 'Structural Red Brick',
    maxHp: 180,
    hp: 180,
    color: '#ef4444', // Red
    shatterType: 'brick',
    particleColors: ['#7c2d12', '#b91c1c', '#f87171', '#ea580c'],
  },
  {
    id: 'plate',
    name: 'Porcelain Dinner Plate',
    maxHp: 80,
    hp: 80,
    color: '#f8fafc', // Slate 50
    shatterType: 'plate',
    particleColors: ['#ffffff', '#e2e8f0', '#cbd5e1', '#f1f5f9'],
  },
  {
    id: 'box',
    name: 'Heavy Cardboard Box',
    maxHp: 130,
    hp: 130,
    color: '#d97706', // Brown/Amber
    shatterType: 'box',
    particleColors: ['#78350f', '#b45309', '#f59e0b', '#d97706'],
  },
  {
    id: 'watermelon',
    name: 'Ripe Juicy Watermelon',
    maxHp: 150,
    hp: 150,
    color: '#22c55e', // Green
    shatterType: 'watermelon',
    particleColors: ['#ef4444', '#f1f5f9', '#22c55e', '#b91c1c', '#15803d'],
  },
];

const TOOLS = [
  { id: 'hammer', name: 'Sledge Hammer', damage: 60, icon: HammerIcon, multiplier: 1.0, costText: 'Heavy Strike' },
  { id: 'bat', name: 'Baseball Bat', damage: 40, icon: BatIcon, multiplier: 1.0, costText: 'Wide Swing' },
  { id: 'fist', name: 'Iron Fist', damage: 20, icon: FistIcon, multiplier: 1.0, costText: 'Rapid Punch' },
] as const;

export default function SmashLab({ stats, updateStats, triggerNotification }: SmashLabProps) {
  const [activeTool, setActiveTool] = useState<'hammer' | 'bat' | 'fist'>('hammer');
  const [currentIdx, setCurrentIdx] = useState(0);
  const [objectHp, setObjectHp] = useState(SMASH_OBJECTS[0].maxHp);
  const [isBroken, setIsBroken] = useState(false);
  const [shakeIntensity, setShakeIntensity] = useState(0);
  const [strikeAnimate, setStrikeAnimate] = useState(false);
  const [strikePos, setStrikePos] = useState({ x: 0, y: 0 });

  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const debrisRef = useRef<DebrisParticle[]>([]);
  const cracksRef = useRef<CrackLine[]>([]);

  const activeObj = SMASH_OBJECTS[currentIdx];

  // Canvas update/render loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId: number;

    const render = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Render Active Object if not fully broken
      if (!isBroken) {
        ctx.save();
        
        // 1. Hammer Shake Effect
        let sx = 0;
        let sy = 0;
        if (shakeIntensity > 0) {
          sx = (Math.random() * 2 - 1) * shakeIntensity;
          sy = (Math.random() * 2 - 1) * shakeIntensity;
        }
        ctx.translate(canvas.width / 2 + sx, canvas.height / 2 + sy);

        // Draw structural object shape
        drawTargetObject(ctx, activeObj.id, objectHp, activeObj.maxHp);

        // Render fracture overlay cracks on damaged objects in real time!
        ctx.strokeStyle = activeObj.id === 'glass' ? 'rgba(255, 255, 255, 0.75)' : 'rgba(0,0,0,0.4)';
        ctx.lineWidth = 2.5;
        cracksRef.current.forEach((crack) => {
          ctx.beginPath();
          ctx.moveTo(crack.startX - canvas.width / 2, crack.startY - canvas.height / 2);
          crack.segments.forEach((seg) => {
            ctx.lineTo(seg.x - canvas.width / 2, seg.y - canvas.height / 2);
          });
          ctx.stroke();
        });

        ctx.restore();
      }

      // 2. Physics-based particle debris animation
      debrisRef.current = debrisRef.current.filter((dp) => {
        dp.x += dp.vx;
        dp.y += dp.vy;
        dp.vy += 0.35; // smooth gravity physics
        dp.angle += dp.va;
        dp.life -= 15;
        dp.alpha = Math.max(0, dp.life / dp.maxLife);

        ctx.save();
        ctx.globalAlpha = dp.alpha;
        ctx.translate(dp.x, dp.y);
        ctx.rotate(dp.angle);
        ctx.fillStyle = dp.color;

        if (dp.type === 'shard') {
          // Draw sharp polygonal crystal shards
          ctx.beginPath();
          if (dp.points) {
            ctx.moveTo(dp.points[0].x, dp.points[0].y);
            for (let i = 1; i < dp.points.length; i++) {
              ctx.lineTo(dp.points[i].x, dp.points[i].y);
            }
          }
          ctx.closePath();
          ctx.fill();
        } else if (dp.type === 'chunk') {
          // Draw rect blocks
          ctx.fillRect(-dp.size, -dp.size, dp.size * 2, dp.size * 2);
        } else if (dp.type === 'splat') {
          // Watermelon pulp drops
          ctx.beginPath();
          ctx.ellipse(0, 0, dp.size * 1.5, dp.size, 0, 0, Math.PI * 2);
          ctx.fill();
        } else {
          // standard circle
          ctx.beginPath();
          ctx.arc(0, 0, dp.size, 0, Math.PI * 2);
          ctx.fill();
        }

        ctx.restore();
        return dp.life > 0;
      });

      // Maintain shake cooling decay rate
      if (shakeIntensity > 0) {
        setShakeIntensity((prev) => Math.max(0, prev - 0.75));
      }

      animId = requestAnimationFrame(render);
    };

    animId = requestAnimationFrame(render);
    return () => cancelAnimationFrame(animId);
  }, [currentIdx, objectHp, isBroken, shakeIntensity]);

  // Handle canvas sizing constraints based on container width
  useEffect(() => {
    const handleResize = () => {
      const canvas = canvasRef.current;
      const container = containerRef.current;
      if (canvas && container) {
        canvas.width = container.clientWidth;
        canvas.height = container.clientHeight;
      }
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const drawTargetObject = (ctx: CanvasRenderingContext2D, id: string, hp: number, maxHp: number) => {
    const hpRatio = hp / maxHp;

    if (id === 'glass') {
      // 3D Glass pane card
      const w = 220;
      const h = 180;
      // Glass gradient fill
      const grad = ctx.createLinearGradient(-w / 2, -h / 2, w / 2, h / 2);
      grad.addColorStop(0, 'rgba(147, 197, 253, 0.35)');
      grad.addColorStop(1, 'rgba(59, 130, 246, 0.15)');
      
      ctx.fillStyle = grad;
      ctx.strokeStyle = 'rgba(147, 197, 253, 0.7)';
      ctx.lineWidth = 3;
      
      // Shadow
      ctx.shadowColor = 'rgba(59, 130, 246, 0.3)';
      ctx.shadowBlur = 18;
      
      ctx.beginPath();
      ctx.roundRect(-w / 2, -h / 2, w, h, 16);
      ctx.fill();
      ctx.stroke();
      ctx.shadowBlur = 0; // reset

      // Glass shine reflex stripes
      ctx.fillStyle = 'rgba(255, 255, 255, 0.18)';
      ctx.beginPath();
      ctx.moveTo(-w / 3, -h / 2);
      ctx.lineTo(-w / 6, -h / 2);
      ctx.lineTo(-w / 2, -h / 8);
      ctx.lineTo(-w / 2, -h / 4);
      ctx.closePath();
      ctx.fill();
    } else if (id === 'brick') {
      // Stacked Red Brick design
      const w = 200;
      const h = 90;
      ctx.fillStyle = '#b91c1c'; // master red base
      ctx.strokeStyle = '#7c2d12';
      ctx.lineWidth = 4;
      
      ctx.beginPath();
      ctx.roundRect(-w / 2, -h / 2, w, h, 6);
      ctx.fill();
      ctx.stroke();

      // Brick horizontal mortar lines
      ctx.fillStyle = '#7c2d12';
      ctx.fillRect(-w / 2, -10, w, 6);
      // Vertical cuts
      ctx.fillRect(-w / 4, -h / 2, 4, h / 2 - 10);
      ctx.fillRect(w / 4, -h / 2, 4, h / 2 - 10);
      ctx.fillRect(-w * 0.35, -5, 4, h / 2 - 1);
      ctx.fillRect(w * 0.15, -5, 4, h / 2 - 1);
    } else if (id === 'plate') {
      // fine glazed circular porcelain plate
      const rad = 95;
      
      // Outer plate lip edge shading
      const grad = ctx.createRadialGradient(0, 0, rad * 0.6, 0, 0, rad);
      grad.addColorStop(0, '#ffffff');
      grad.addColorStop(0.7, '#f1f5f9');
      grad.addColorStop(1, '#cbd5e1');

      ctx.fillStyle = grad;
      ctx.strokeStyle = '#e2e8f0';
      ctx.lineWidth = 5;

      ctx.shadowColor = 'rgba(15, 23, 42, 0.15)';
      ctx.shadowBlur = 12;

      ctx.beginPath();
      ctx.arc(0, 0, rad, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
      ctx.shadowBlur = 0;

      // Inner plate ring pattern
      ctx.strokeStyle = 'rgba(51, 65, 85, 0.08)';
      ctx.lineWidth = 2.5;
      ctx.beginPath();
      ctx.arc(0, 0, rad * 0.65, 0, Math.PI * 2);
      ctx.stroke();
    } else if (id === 'box') {
      // Isometric shipping corrugated container
      const s = 140;
      ctx.fillStyle = '#b45309'; // standard deep tan box
      ctx.strokeStyle = '#78350f';
      ctx.lineWidth = 4;

      ctx.beginPath();
      ctx.roundRect(-s / 2, -s / 2, s, s, 10);
      ctx.fill();
      ctx.stroke();

      // Industrial packaging tape across centerline
      ctx.fillStyle = '#fabf2c'; // bright yellow shipping tape of box
      ctx.fillRect(-s / 2, -18, s, 36);
      ctx.fillStyle = '#22252a';
      ctx.font = '8px monospace';
      ctx.fillText('FRAGILE', -22, 5);
    } else if (id === 'watermelon') {
      // Glossy high volume sweet water melon
      const rx = 110;
      const ry = 80;

      // Striped outer rind green gradient
      const grad = ctx.createLinearGradient(-rx, 0, rx, 0);
      grad.addColorStop(0, '#15803d');
      grad.addColorStop(0.5, '#22c55e');
      grad.addColorStop(1, '#166534');

      ctx.fillStyle = grad;
      ctx.strokeStyle = '#052e16';
      ctx.lineWidth = 5;

      ctx.beginPath();
      ctx.ellipse(0, 0, rx, ry, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();

      // Watermelon rind stripes
      ctx.strokeStyle = '#052e16';
      ctx.lineWidth = 5;
      for (let i = -3; i <= 3; i++) {
        const offset = i * 25;
        ctx.beginPath();
        ctx.ellipse(0, 0, rx, ry, 0, 0, Math.PI);
        ctx.strokeStyle = 'rgba(10, 60, 20, 0.4)';
        ctx.stroke();
      }
    }
  };

  const executeSmash = (e: React.MouseEvent<HTMLDivElement> | React.TouchEvent<HTMLDivElement>) => {
    if (isBroken) return;
    audioEngine.initContext();

    setStrikeAnimate(true);
    setTimeout(() => setStrikeAnimate(false), 150);

    // Get click location relative to canvas bounding clientrect box
    let clientX = 0;
    let clientY = 0;
    if ('touches' in e && e.touches.length > 0) {
      clientX = e.touches[0].clientX;
      clientY = e.touches[0].clientY;
    } else if ('clientX' in e) {
      clientX = (e as React.MouseEvent).clientX;
      clientY = (e as React.MouseEvent).clientY;
    }

    let localX = 0;
    let localY = 0;
    if (canvasRef.current) {
      const rect = canvasRef.current.getBoundingClientRect();
      localX = clientX - rect.left;
      localY = clientY - rect.top;
      setStrikePos({ x: localX, y: localY });
    }

    const tool = TOOLS.find((t) => t.id === activeTool) || TOOLS[0];
    const newHp = Math.max(0, objectHp - tool.damage);
    setObjectHp(newHp);

    // Trigger hit sound with active pitch variation based on object structure
    playHitSound(activeObj.shatterType);

    // Haptics vibration triggers
    if (navigator.vibrate) {
      navigator.vibrate(22);
    }

    // Produce realistic structural fractures/cracks paths!
    if (newHp > 0) {
      setShakeIntensity(15);
      // Spawn procedural crack
      const segments: { x: number; y: number }[] = [];
      let cx = localX;
      let cy = localY;
      const steps = 3 + Math.floor(Math.random() * 4);
      for (let s = 0; s < steps; s++) {
        // move radially outwards
        const angle = Math.random() * Math.PI * 2;
        const len = 15 + Math.random() * 25;
        cx += Math.cos(angle) * len;
        cy += Math.sin(angle) * len;
        segments.push({ x: cx, y: cy });
      }
      cracksRef.current.push({
        startX: localX,
        startY: localY,
        segments,
      });

      // Sparkle impact chips
      triggerDebrisBurst(localX, localY, 5, activeObj.particleColors);
    } else {
      // OBJECT DESTROYED! Fully shatter container object.
      setIsBroken(true);
      setShakeIntensity(40);
      
      // Play heavy destruction sound
      playShatterSound(activeObj.shatterType);

      // Trigger heavy phone shake vibration
      if (navigator.vibrate) {
        navigator.vibrate([20, 15, 45]);
      }

      const canvas = canvasRef.current;
      const xCenter = canvas ? canvas.width / 2 : localX;
      const yCenter = canvas ? canvas.height / 2 : localY;

      // Trigger absolute massive debris burst
      triggerDebrisBurst(xCenter, yCenter, 30, activeObj.particleColors, true);

      // Save global scores/achievements
      const nextSmashesValue = stats.totalSmashes + 1;
      updateStats({ totalSmashes: nextSmashesValue });

      if (nextSmashesValue === 1) {
        triggerNotification('🔨 First Smash Unlocked!', 'You dismantled your very first item in the lab!');
      } else if (nextSmashesValue === 100) {
        triggerNotification('🔥 Smash Guru Unlocked!', '100 items demolished. Pure stress relief!');
      }

      // Schedule new material slide-in
      setTimeout(() => {
        spawnNextMaterial();
      }, 1400);
    }
  };

  const playHitSound = (type: string) => {
    // Slight lighter sound before destruction
    if (type === 'glass') audioEngine.playPop(1.5);
    else if (type === 'brick') audioEngine.playPop(0.6);
    else if (type === 'plate') audioEngine.playPop(1.2);
    else if (type === 'box') audioEngine.playPop(0.85);
    else if (type === 'watermelon') audioEngine.playPop(0.7);
  };

  const playShatterSound = (type: string) => {
    if (type === 'glass') audioEngine.playShatterGlass();
    else if (type === 'brick') audioEngine.playShatterBrick();
    else if (type === 'plate') audioEngine.playShatterPlate();
    else if (type === 'box') audioEngine.playShatterBox();
    else if (type === 'watermelon') audioEngine.playShatterWatermelon();
  };

  const spawnNextMaterial = () => {
    // Move to next random item or sequential
    const nextIdx = (currentIdx + 1) % SMASH_OBJECTS.length;
    setCurrentIdx(nextIdx);
    setObjectHp(SMASH_OBJECTS[nextIdx].maxHp);
    setIsBroken(false);
    cracksRef.current = [];
    debrisRef.current = [];
  };

  const triggerDebrisBurst = (x: number, y: number, count: number, colors: string[], heavy: boolean = false) => {
    for (let i = 0; i < count; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = heavy ? (3 + Math.random() * 12) : (2 + Math.random() * 5);
      
      const pSize = heavy ? (4 + Math.random() * 14) : (2 + Math.random() * 5);
      const color = colors[Math.floor(Math.random() * colors.length)];

      const tDecide = Math.random();
      let type: 'shard' | 'chunk' | 'circle' | 'splat' = 'circle';
      let points: { x: number; y: number }[] = [];

      if (activeObj.id === 'glass') {
        type = 'shard';
        // Generate sharp triangle/quad shard vertices
        points = [
          { x: -pSize, y: Math.random() * pSize },
          { x: pSize, y: -Math.random() * pSize },
          { x: Math.random() * pSize - pSize/2, y: pSize },
        ];
      } else if (activeObj.id === 'brick') {
        type = 'chunk';
      } else if (activeObj.id === 'watermelon') {
        type = tDecide > 0.45 ? 'splat' : 'circle';
      }

      debrisRef.current.push({
        x,
        y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed - 2.5, // vertical bias upwards
        angle: Math.random() * Math.PI,
        va: (Math.random() * 2 - 1) * 0.15,
        color,
        size: pSize,
        type,
        points: points.length > 0 ? points : undefined,
        alpha: 1.0,
        life: 500 + Math.floor(Math.random() * 600), // life decays
        maxLife: 1100,
      });
    }
  };

  return (
    <div id="smash-lab-game" className="flex flex-col items-center w-full max-w-4xl mx-auto px-4 py-3 select-none">
      
      {/* Interactive Tool Selection Rail */}
      <div className="flex flex-col md:flex-row items-center justify-between w-full bg-slate-900/60 backdrop-blur-md rounded-2xl p-4 mb-4 border border-slate-800 gap-4 shadow-xl">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-rose-500/15 rounded-xl border border-rose-500/20 text-rose-400">
            <Award className="w-5 h-5 animate-pulse" />
          </div>
          <div>
            <h3 className="text-sm text-slate-400 font-medium">Smash Laboratory</h3>
            <p className="text-lg font-bold text-white tracking-wide">
              {stats.totalSmashes} <span className="text-xs text-slate-500 font-normal">demolished items</span>
            </p>
          </div>
        </div>

        {/* Selected Weapon / Tool Bar */}
        <div className="flex flex-wrap items-center justify-center gap-2">
          {TOOLS.map((t) => {
            const IconComponent = t.icon;
            const isSelected = activeTool === t.id;
            return (
              <button
                id={`smash-tool-select-${t.id}`}
                key={t.id}
                onClick={() => {
                  setActiveTool(t.id);
                  audioEngine.playPop(1.2);
                }}
                className={`
                  flex items-center space-x-2 px-4 py-2 rounded-xl border transition-all cursor-pointer select-none
                  ${
                    isSelected
                      ? 'bg-rose-500 text-white border-rose-600 shadow-[0_4px_12px_rgba(239,68,68,0.3)] scale-102 font-bold'
                      : 'bg-slate-800/80 text-slate-300 border-slate-700/80 hover:bg-slate-700 hover:text-white'
                  }
                `}
              >
                <IconComponent className="w-4 h-4" />
                <span className="text-xs tracking-wider">{t.name}</span>
              </button>
            );
          })}

          <button
            id="smash-skip-btn"
            onClick={spawnNextMaterial}
            className="flex items-center justify-center p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-all cursor-pointer border border-slate-700"
            title="Next Object"
          >
            <RefreshCw className="w-4.5 h-4.5" />
          </button>
        </div>
      </div>

      {/* Main Destruction Arena */}
      <div
        ref={containerRef}
        onMouseDown={executeSmash}
        onTouchStart={executeSmash}
        className={`
          relative w-full aspect-square md:aspect-video flex flex-col items-center justify-center bg-radial from-slate-900 via-slate-950 to-black rounded-3xl border border-slate-800/80 shadow-2xl overflow-hidden cursor-crosshair select-none touch-none
        `}
      >
        {/* Floating Physics Canvas */}
        <canvas
          ref={canvasRef}
          className="absolute inset-0 z-0 pointer-events-none"
        />

        {/* Damage HP HUD Bar */}
        {!isBroken && (
          <div className="absolute top-5 left-1/2 transform -translate-x-1/2 z-10 w-64 bg-slate-900/80 backdrop-blur-md px-4 py-2.5 rounded-full border border-slate-800 text-center shadow-lg">
            <p className="text-xs font-bold text-slate-300 tracking-wider mb-1 uppercase">
              {activeObj.name}
            </p>
            <div className="relative w-full h-2 bg-slate-800 rounded-full overflow-hidden">
              <div
                className="absolute top-0 left-0 h-full bg-gradient-to-r from-rose-500 to-orange-500 rounded-full transition-all duration-75"
                style={{ width: `${(objectHp / activeObj.maxHp) * 100}%` }}
              />
            </div>
            <p className="text-[10px] text-slate-500 font-semibold mt-1">
              HP: {objectHp} / {activeObj.maxHp}
            </p>
          </div>
        )}

        {/* Success Splash Indicator state */}
        {isBroken && (
          <div className="absolute z-10 flex flex-col items-center animate-bounce text-center">
            <span className="text-4xl">💥</span>
            <span className="text-sm font-bold text-rose-400 bg-rose-950/80 border border-rose-900/50 px-4 py-1.5 rounded-full backdrop-blur-md shadow-lg tracking-wider mt-2">
              DESTROYED!
            </span>
          </div>
        )}

        {/* Strike Weapon Animation Hammer Overlay */}
        {strikeAnimate && (
          <div
            className="absolute z-30 pointer-events-none"
            style={{
              left: `${strikePos.x}px`,
              top: `${strikePos.y}px`,
              transform: 'translate(-50%, -50%) rotate(-30deg) scale(1.3)',
              transformOrigin: 'bottom right',
            }}
          >
            {activeTool === 'hammer' && (
              <HammerIcon className="w-14 h-14 text-rose-400 fill-rose-500 opacity-90 drop-shadow-[0_0_8px_rgba(239,68,68,0.7)]" />
            )}
            {activeTool === 'bat' && (
              <BatIcon className="w-14 h-14 text-rose-400 fill-rose-500 opacity-90 drop-shadow-[0_0_8px_rgba(239,68,68,0.7)]" />
            )}
            {activeTool === 'fist' && (
              <FistIcon className="w-14 h-14 text-rose-400 fill-rose-500 opacity-90 drop-shadow-[0_0_8px_rgba(239,68,68,0.7)]" />
            )}
          </div>
        )}
      </div>

      <p className="text-slate-400 text-xs text-center mt-4 tracking-wide font-light max-w-md">
        Choose different tools (Sledge is strongest, Iron Fist is fastest) and tap the object repeatedly to stress-vent and watch beautiful material physics shatters!
      </p>
    </div>
  );
}
