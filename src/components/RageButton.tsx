/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import { GameStats } from '../types';
import { audioEngine } from '../audioEngine';
import { Flame, Star, Award, Sparkles } from 'lucide-react';

interface RageButtonProps {
  stats: GameStats;
  updateStats: (statUpdates: Partial<GameStats>) => void;
  triggerNotification: (title: string, desc: string) => void;
}

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  color: string;
  size: number;
  type: 'spark' | 'smoke' | 'firework' | 'ring';
  alpha: number;
  life: number;
  maxLife: number;
  gravity?: number;
}

export default function RageButton({ stats, updateStats, triggerNotification }: RageButtonProps) {
  const [clickCount, setClickCount] = useState(() => stats.totalRageClicks || 0);
  const [funnyMessage, setFunnyMessage] = useState('Press it. Direct instant venting.');
  const [heatLevel, setHeatLevel] = useState(0); // 0 to 100 rolling click thermometer
  const [buttonScale, setButtonScale] = useState(1.0);
  const [shakeRange, setShakeRange] = useState(0);

  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const clickCountRef = useRef(clickCount);
  const particlesRef = useRef<Particle[]>([]);
  const nextParticleId = useRef(0);
  const rapidClickTracker = useRef<number[]>([]);

  // Keep ref up to date for canvas particle systems
  useEffect(() => {
    clickCountRef.current = clickCount;
  }, [clickCount]);

  // Decelerate heat level and screen shake values
  useEffect(() => {
    const timer = setInterval(() => {
      setHeatLevel((prev) => Math.max(0, prev - 1.5));
      setShakeRange((prev) => Math.max(0, prev - 0.4));
    }, 80);
    return () => clearInterval(timer);
  }, []);

  // Canvas render loop for high-fidelity fire sparks and explosion particles
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId: number;

    const render = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      particlesRef.current = particlesRef.current.filter((p) => {
        // Apply velocity physics
        p.x += p.vx;
        p.y += p.vy;
        if (p.gravity) {
          p.vy += p.gravity;
        }

        p.life -= 1;
        p.alpha = Math.max(0, p.life / p.maxLife);

        ctx.save();
        ctx.globalAlpha = p.alpha;
        ctx.fillStyle = p.color;

        if (p.type === 'spark') {
          // Draw thin spark streaks
          ctx.beginPath();
          ctx.strokeStyle = p.color;
          ctx.lineWidth = p.size;
          ctx.moveTo(p.x, p.y);
          ctx.lineTo(p.x - p.vx * 1.5, p.y - p.vy * 1.5);
          ctx.stroke();
        } else if (p.type === 'smoke') {
          // Rounded drifting soft clouds
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
          ctx.fill();
        } else if (p.type === 'firework') {
          // Glowing star shards
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
          ctx.fill();
        } else if (p.type === 'ring') {
          // Expansion shockwave
          ctx.beginPath();
          ctx.strokeStyle = p.color;
          ctx.lineWidth = 4;
          ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
          ctx.stroke();
          p.size += 4.5; // expand
        }

        ctx.restore();
        return p.life > 0;
      });

      animId = requestAnimationFrame(render);
    };

    animId = requestAnimationFrame(render);
    return () => cancelAnimationFrame(animId);
  }, []);

  // Update canvas boundaries to fit bounding outer containers
  useEffect(() => {
    const handleResize = () => {
      const canvas = canvasRef.current;
      const parent = canvas?.parentElement;
      if (canvas && parent) {
        canvas.width = parent.clientWidth;
        canvas.height = parent.clientHeight;
      }
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const triggerParticlesClick = (x: number, y: number, colorTheme: string[]) => {
    // 1. White click ring shockwave
    particlesRef.current.push({
      x,
      y,
      vx: 0,
      vy: 0,
      color: 'rgba(255, 255, 255, 0.4)',
      size: 15,
      type: 'ring',
      alpha: 1.0,
      life: 15,
      maxLife: 15,
    });

    // 2. Rising heat sparks
    const sparkCount = 8 + Math.floor(Math.random() * 8);
    for (let i = 0; i < sparkCount; i++) {
      const angle = -Math.PI / 2 + (Math.random() * 0.8 - 0.4); // directional upwards
      const speed = 2 + Math.random() * 5.5;
      const color = colorTheme[Math.floor(Math.random() * colorTheme.length)];
      particlesRef.current.push({
        x,
        y: y - 10,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        color,
        size: 1.5 + Math.random() * 2.5,
        type: 'spark',
        alpha: 1.0,
        life: 25 + Math.floor(Math.random() * 20),
        maxLife: 45,
      });
    }

    // 3. Gray dust puff puffs
    const smokeCount = 3 + Math.floor(Math.random() * 3);
    for (let i = 0; i < smokeCount; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = 0.5 + Math.random() * 1.2;
      particlesRef.current.push({
        x,
        y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed - 0.5,
        color: 'rgba(100, 116, 139, 0.2)', // soft grey slate
        size: 8 + Math.random() * 14,
        type: 'smoke',
        alpha: 0.6,
        life: 40 + Math.floor(Math.random() * 30),
        maxLife: 70,
      });
    }
  };

  const triggerMassiveMilestoneExplosion = (x: number, y: number, colors: string[]) => {
    audioEngine.playExplosion();

    // Spawn 50 high-impulse colorful firework shards
    for (let i = 0; i < 60; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = 3 + Math.random() * 9;
      const color = colors[Math.floor(Math.random() * colors.length)];
      particlesRef.current.push({
        x,
        y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed - 1.5,
        color,
        size: 3 + Math.random() * 5,
        type: 'firework',
        alpha: 1.0,
        life: 60 + Math.floor(Math.random() * 40),
        maxLife: 100,
        gravity: 0.12, // gravity fallout
      });
    }
  };

  const handlePress = (e: React.MouseEvent<HTMLButtonElement> | React.TouchEvent<HTMLButtonElement>) => {
    audioEngine.initContext();

    // Prevent virtual double pops
    if (e.cancelable) {
      e.preventDefault();
    }

    // Spring button click down
    setButtonScale(0.88);
    setTimeout(() => {
      setButtonScale(1.0);
    }, 100);

    const nextCount = clickCount + 1;
    setClickCount(nextCount);
    updateStats({ totalRageClicks: nextCount });

    // Track rapid clicks for thermal thermometer
    const nowStamp = Date.now();
    rapidClickTracker.current = [...rapidClickTracker.current, nowStamp].filter(
      (stamp) => nowStamp - stamp < 2000
    );
    const rollingHeat = Math.min(100, rapidClickTracker.current.length * 8);
    setHeatLevel(rollingHeat);

    // Dynamic screen shake magnitude trigger
    setShakeRange(Math.min(18, rollingHeat * 0.18));

    // Determine visual style theme
    const activeTier = getTier(nextCount);
    triggerParticlesClick(
      canvasRef.current ? canvasRef.current.width / 2 : 150,
      canvasRef.current ? canvasRef.current.height / 2 + 15 : 150,
      activeTier.particleColors
    );

    // Play click sound with rage modifier speed
    audioEngine.playRageStrike(rapidClickTracker.current.length);

    // Haptics vibration click feel
    if (navigator.vibrate) {
      const vibrationWeight = 5 + Math.floor(rollingHeat * 0.15);
      navigator.vibrate(vibrationWeight);
    }

    // Real-time achievement triggers
    checkUnlocks(nextCount);

    // Live comedy dynamic commentary generator
    updateLiveComment(nextCount);
  };

  const checkUnlocks = (count: number) => {
    const canvas = canvasRef.current;
    const px = canvas ? canvas.width / 2 : 150;
    const py = canvas ? canvas.height / 2 : 150;

    const rainbowColors = ['#f43f5e', '#ec4899', '#3b82f6', '#10b981', '#fbbf24', '#a855f7'];

    if (count === 1) {
      triggerNotification('😡 Angry Tap Unlocked!', 'Vent accumulated rage inside the laboratory!');
    } else if (count === 100) {
      triggerMassiveMilestoneExplosion(px, py, ['#f43f5e', '#f97316', '#fbbf24']);
      triggerNotification('🔥 Overheated Core unlocked!', '100 clicks achieved! Thermal combustion activated.');
    } else if (count === 500) {
      triggerMassiveMilestoneExplosion(px, py, ['#06b6d4', '#3b82f6', '#ec4899']);
      triggerNotification('⚡ Plasma Overload unlocked!', '500 clicks achieved! Electric volts surging!');
    } else if (count === 1000) {
      triggerMassiveMilestoneExplosion(px, py, ['#7c3aed', '#ec4899', '#0f172a']);
      triggerNotification('🌀 Quantum Singularity unlocked!', '1,000 clicks! Universal gravity warped!');
    } else if (count === 5000) {
      triggerMassiveMilestoneExplosion(px, py, rainbowColors);
      triggerNotification('☀️ Deified Aura unlocked!', '5000 clicks achieved! You are a stress relief deity.');
    }
  };

  const getTier = (count: number) => {
    if (count < 100) {
      return {
        label: 'Level 1: Office Red Bell',
        classNames: 'from-rose-600 to-red-700 hover:from-rose-500 hover:to-red-600 border-red-800 shadow-[0_12px_24px_rgba(239,68,68,0.4)] shadow-inner',
        particleColors: ['#f43f5e', '#ef4444', '#f87171'],
        icon: '😡',
        accentColor: 'text-rose-500',
      };
    } else if (count < 500) {
      return {
        label: 'Level 2: Thermal Magma',
        classNames: 'from-orange-600 to-amber-700 hover:from-orange-500 hover:to-amber-600 border-amber-900 shadow-[0_12px_24px_rgba(249,115,22,0.5)] border-2 border-dashed animate-pulse',
        particleColors: ['#f97316', '#fbbf24', '#ea580c', '#ef4444'],
        icon: '🔥',
        accentColor: 'text-orange-400',
      };
    } else if (count < 1000) {
      return {
        label: 'Level 3: Plasma Volts',
        classNames: 'from-cyan-500 to-indigo-600 hover:from-cyan-400 hover:to-indigo-500 border-cyan-400 shadow-[0_12px_28px_rgba(6,182,212,0.6)] border-2',
        particleColors: ['#06b6d4', '#6366f1', '#22d3ee', '#818cf8'],
        icon: '⚡',
        accentColor: 'text-cyan-400',
      };
    } else if (count < 5000) {
      return {
        label: 'Level 4: Cosmic Void',
        classNames: 'from-slate-900 via-purple-950 to-indigo-950 border-indigo-500 shadow-[0_16px_32px_rgba(168,85,247,0.4)] border-3 border-double',
        particleColors: ['#a855f7', '#6366f1', '#1e1b4b', '#d946ef'],
        icon: '🌀',
        accentColor: 'text-purple-400',
      };
    } else {
      return {
        label: 'Level 5: Solar Deity',
        classNames: 'from-amber-400 via-yellow-400 to-orange-500 border-white shadow-[0_20px_40px_rgba(251,191,36,0.85)] border-3 animate-bounce',
        particleColors: ['#fbbf24', '#facc15', '#f97316', '#ffffff'],
        icon: '☀️',
        accentColor: 'text-yellow-400 font-black',
      };
    }
  };

  const updateLiveComment = (count: number) => {
    if (count === 1) setFunnyMessage('Okay, first tap of anger complete. Felt clean.');
    else if (count === 5) setFunnyMessage('Again. Tap out those annoying emails.');
    else if (count === 15) setFunnyMessage('That is it. Tell that server timeout who is boss!');
    else if (count === 30) setFunnyMessage('Button is perfectly spring-loaded. Feels premium.');
    else if (count === 60) setFunnyMessage('Tapping speed is increasing! Let the steam release!');
    else if (count === 99) setFunnyMessage('Wait. Clicks are hitting 99... Brace yourself!');
    else if (count === 100) setFunnyMessage('100 Clicks achieved! Button is heated! Magma Core Unlocked! 🔥');
    else if (count === 150) setFunnyMessage('The red color evolved to molten orange. Satisfying.');
    else if (count === 240) setFunnyMessage('Tell your index finger that you appreciate its service.');
    else if (count === 320) setFunnyMessage('Are you sure you do not have work to do? No? Excellent! Keep clicking.');
    else if (count === 499) setFunnyMessage('Almost 500! Sparks are accumulating in the air!');
    else if (count === 500) setFunnyMessage('500 Clacks! Ultimate high voltage induction! Plasma button unlocked! ⚡');
    else if (count === 700) setFunnyMessage('Your screen coordinates are shifting! High seismic tremors!');
    else if (count === 999) setFunnyMessage('Almost 1,000 clicks! The space-time continuum is tearing apart!');
    else if (count === 1000) setFunnyMessage('1,000 CLICKS! Quantum Singularity core unlocked! Cosmos loading... 🌀');
    else if (count === 1500) setFunnyMessage('Gravity is bending inside your browser. Do not let your coffee float!');
    else if (count === 2500) setFunnyMessage('We called the Guinness book of records. They hung up on us, but we believe in you.');
    else if (count === 4000) setFunnyMessage('Almost 5,000! Unbelievable tapping stamina. Are we typing code or what?');
    else if (count === 5000) setFunnyMessage('☀️ 5,000 CLICKS! DEIFIED SOLAR SYSTEM AURAS. ZEN ASCENSION EMBODIED!');
  };

  const activeTier = getTier(clickCount);

  // Outer container screen shake style
  const shakeTranslation = shakeRange > 0
    ? `translate(${(Math.random() * 2 - 1) * shakeRange}px, ${(Math.random() * 2 - 1) * shakeRange}px)`
    : 'none';

  return (
    <div id="rage-button-game" className="flex flex-col items-center w-full max-w-4xl mx-auto px-4 py-3 select-none">
      
      {/* Rage Dashboard Metrics Tracker */}
      <div className="flex flex-col md:flex-row items-center justify-between w-full bg-slate-900/60 backdrop-blur-md rounded-2xl p-4 mb-4 border border-slate-800 gap-4 shadow-xl">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-pink-500/15 rounded-xl border border-pink-500/20 text-pink-400">
            <Flame className="w-5 h-5 animate-pulse" />
          </div>
          <div>
            <h3 className="text-sm text-slate-400 font-medium">Pressure Vents</h3>
            <p className="text-lg font-bold text-white tracking-wide">
              {clickCount} <span className="text-xs text-slate-500 font-normal">rage clicks</span>
            </p>
          </div>
        </div>

        {/* Level Indicator Tiers HUD */}
        <div className="flex items-center space-x-4">
          <div className="flex items-center bg-slate-950/40 border border-slate-800/80 px-3.5 py-1.5 rounded-full">
            <span className="text-base mr-2">{activeTier.icon}</span>
            <span className={`text-xs font-bold ${activeTier.accentColor} tracking-wider`}>
              {activeTier.label}
            </span>
          </div>

          {/* Core Thermometer Level */}
          <div className="flex items-center space-x-2">
            <span className="text-[10px] text-slate-500 uppercase font-black tracking-wider">Speed Meter</span>
            <div className="w-24 h-2 bg-slate-800 rounded-full overflow-hidden border border-slate-900/50">
              <div
                className="h-full bg-gradient-to-r from-red-500 via-orange-500 to-yellow-400 rounded-full transition-all duration-100"
                style={{ width: `${heatLevel}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Main Giant Button Arena with screen-shake translation overlay */}
      <div
        className="relative w-full aspect-square md:aspect-video flex flex-col items-center justify-center bg-radial from-slate-950 to-black rounded-3xl border border-slate-800 shadow-3xl overflow-hidden select-none"
        style={{ transform: shakeTranslation, transition: 'transform 0.05s ease-out' }}
      >
        {/* Floating graphics sparks canvas */}
        <canvas
          ref={canvasRef}
          className="absolute inset-0 pointer-events-none z-0"
        />

        {/* Absolute Glowing Button Ring Overlay */}
        <div className="absolute w-80 h-80 bg-red-600/5 rounded-full filter blur-3xl z-0 pointer-events-none animate-pulse" />

        {/* 3D Giant Tactile Push Button */}
        <div className="relative z-10 flex flex-col items-center justify-center">
          
          {/* Button thick plastic ring collar base */}
          <div className="relative w-48 h-48 rounded-full bg-slate-900 border border-slate-800 flex items-center justify-center shadow-[0_12px_24px_rgba(0,0,0,0.85)] z-0">
            <div className="absolute inset-2 rounded-full bg-black shadow-inner" />
            
            {/* The active interactable button */}
            <button
              id="the-rage-button"
              onMouseDown={handlePress}
              onTouchStart={handlePress}
              className={`
                absolute rounded-full w-38 h-38 bg-gradient-to-b border-b-8 shadow-inner select-none transition-all outline-none cursor-pointer focus:outline-none flex items-center justify-center text-white
                ${activeTier.classNames}
              `}
              style={{
                transform: `scale(${buttonScale})`,
                transition: 'transform 0.08s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
              }}
            >
              {/* Inner Glossy circular reflections detail */}
              <div className="absolute top-[8%] left-[10%] w-[80%] h-[35%] bg-gradient-to-b from-white/20 to-transparent rounded-full pointer-events-none" />
              
              <div className="flex flex-col items-center text-center drop-shadow-[0_2px_4px_rgba(0,0,0,0.5)]">
                <span className="text-3xl font-black tracking-wider uppercase mb-0.5 select-none touch-none">PUSH</span>
                <span className="text-[10px] uppercase tracking-widest font-bold opacity-80 select-none touch-none">VENT</span>
              </div>
            </button>
          </div>
        </div>

        {/* Lock target states notification */}
        <div className="absolute bottom-6 bg-slate-950/80 backdrop-blur-md px-4 py-1.5 rounded-full border border-slate-800 text-center text-[10px] text-slate-500 font-semibold tracking-wide">
          Unlocks at: 100 • 500 • 1,000 • 5,000 clicks
        </div>
      </div>

      {/* Dynamic baselline Comedy messaging channel */}
      <div className="flex items-center space-x-2 bg-slate-900/40 p-4 rounded-xl border border-slate-800/50 w-full mt-4 justify-center">
        <Sparkles className="w-4 h-4 text-rose-400 animate-pulse" />
        <p className="text-slate-200 text-xs text-center font-bold tracking-wide italic">
          "{funnyMessage}"
        </p>
      </div>
    </div>
  );
}
