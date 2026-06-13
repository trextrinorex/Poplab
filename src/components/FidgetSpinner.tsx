/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import { GameStats } from '../types';
import { audioEngine } from '../audioEngine';
import { RotateCw, Award, Play, CircleDot, RefreshCw } from 'lucide-react';

interface FidgetSpinnerProps {
  stats: GameStats;
  updateStats: (statUpdates: Partial<GameStats>) => void;
  triggerNotification: (title: string, desc: string) => void;
}

interface SpinnerDesign {
  id: 'gold' | 'neon' | 'titanium' | 'void';
  name: string;
  color: string;
  desc: string;
  weightMultiplier: number; // effect on inertia and friction deceleration
}

const SPINNERS: SpinnerDesign[] = [
  {
    id: 'gold',
    name: 'Classic Gold Standard',
    color: '#fbbf24', // Yellow Gold
    desc: 'Pure polished brass with premium weighted steel bearings.',
    weightMultiplier: 1.0,
  },
  {
    id: 'neon',
    name: 'Cyber Neon Orbit',
    color: '#06b6d4', // Cyan
    desc: 'Futuristic ultraviolet light guides with minimal air friction.',
    weightMultiplier: 0.8,
  },
  {
    id: 'titanium',
    name: 'Titanium Tri-Wing',
    color: '#94a3b8', // Silver Slate
    desc: 'Tactical sandblasted grade-5 titanium. Heavy inertia.',
    weightMultiplier: 1.35,
  },
  {
    id: 'void',
    name: 'Void Dual-Blade Vortex',
    color: '#ec4899', // Pink
    desc: 'Aerodynamic carbon dual-blade with swirling optical illusions.',
    weightMultiplier: 0.9,
  },
];

export default function FidgetSpinner({ stats, updateStats, triggerNotification }: FidgetSpinnerProps) {
  const [activeSpinner, setActiveSpinner] = useState<SpinnerDesign>(SPINNERS[0]);
  const [rpm, setRpm] = useState(0);
  const [maxRpm, setMaxRpm] = useState(() => stats.highestRpm || 0);
  const [spinTime, setSpinTime] = useState(0);
  const [longestSpin, setLongestSpin] = useState(() => stats.longestSpinSeconds || 0);

  const containerRef = useRef<HTMLDivElement | null>(null);
  
  // Physics engine reference variables
  const angleRef = useRef(0); // Current degree rotation
  const omegaRef = useRef(0); // Rotational velocity (radians/frame)
  const isDraggingRef = useRef(false);
  const prevAngleRef = useRef(0);
  const lastTouchTimeRef = useRef(0);
  const isSpinningRef = useRef(false);
  const spinStartSecondsRef = useRef<number | null>(null);

  const requestRef = useRef<number | null>(null);

  // Initialize and run mechanical physics loop
  useEffect(() => {
    // Start continuous requestAnimationFrame physics loop
    const runPhysics = () => {
      // 1. Decelerate if not dragged
      if (!isDraggingRef.current) {
        // Friction base adjusted by spinner weight
        const decay = 0.988 - (activeSpinner.weightMultiplier - 1.0) * 0.003;
        omegaRef.current *= decay;

        // Apply a small cutoff to prevent endless micro rotation
        if (Math.abs(omegaRef.current) < 0.0005) {
          omegaRef.current = 0;
        }
      }

      // 2. Accumulate angle based on angular velocity
      angleRef.current += omegaRef.current;
      
      // Keep angle bounded
      if (angleRef.current >= Math.PI * 2) {
        angleRef.current -= Math.PI * 2;
      } else if (angleRef.current < 0) {
        angleRef.current += Math.PI * 2;
      }

      // 3. Convert angular velocity to RPM
      // 1 rad/frame at 60fps is 60 rad/s = 572.9 RPM
      const calculatedRpm = Math.floor(Math.abs(omegaRef.current) * 572.9);
      setRpm(calculatedRpm);

      // Track peak achievements
      if (calculatedRpm > maxRpm) {
        setMaxRpm(calculatedRpm);
        updateStats({ highestRpm: calculatedRpm });
      }

      // 4. Update the synthesized continuous hum sound engine
      audioEngine.updateHumVolume(calculatedRpm);

      // 5. Spin duration state tracker
      if (calculatedRpm > 10) {
        if (!isSpinningRef.current) {
          isSpinningRef.current = true;
          spinStartSecondsRef.current = Date.now();
        } else if (spinStartSecondsRef.current) {
          const currentDuration = Math.round((Date.now() - spinStartSecondsRef.current) / 1000);
          setSpinTime(currentDuration);

          if (currentDuration > longestSpin) {
            setLongestSpin(currentDuration);
            updateStats({ longestSpinSeconds: currentDuration });
          }
        }
      } else {
        if (isSpinningRef.current) {
          isSpinningRef.current = false;
          spinStartSecondsRef.current = null;
        }
      }

      // Draw spinner element dynamically in React DOM utilizing transform ref
      const spinnerElem = document.getElementById('fidget-spinner-blade');
      if (spinnerElem) {
        const degrees = (angleRef.current * 180) / Math.PI;
        // Motion Blur filter mapping based on speed (max 10px blur)
        const blurValue = Math.min(calculatedRpm / 90, 8.5);
        spinnerElem.style.transform = `rotate(${degrees}deg)`;
        spinnerElem.style.filter = blurValue > 0.8 ? `blur(${blurValue}px)` : 'none';
      }

      requestRef.current = requestAnimationFrame(runPhysics);
    };

    requestRef.current = requestAnimationFrame(runPhysics);

    // Audio hum initializer
    audioEngine.startSpinnerHum();

    return () => {
      if (requestRef.current) cancelAnimationFrame(requestRef.current);
      audioEngine.stopSpinnerHum();
    };
  }, [activeSpinner]);

  // Handle pointer drag gesture sweeps
  const getPointerAngle = (clientX: number, clientY: number): number => {
    const el = document.getElementById('fidget-spinner-center');
    if (!el) return 0;
    const rect = el.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    return Math.atan2(clientY - centerY, clientX - centerX);
  };

  const onDragStart = (e: React.MouseEvent | React.TouchEvent) => {
    audioEngine.initContext();
    audioEngine.startSpinnerHum();

    // Prevent scrolling when swiping spinner on mobile devices
    if (e.cancelable) {
      e.preventDefault();
    }

    isDraggingRef.current = true;
    
    let clientX = 0;
    let clientY = 0;
    if ('touches' in e) {
      clientX = e.touches[0].clientX;
      clientY = e.touches[0].clientY;
    } else {
      clientX = e.clientX;
      clientY = e.clientY;
    }

    prevAngleRef.current = getPointerAngle(clientX, clientY);
    lastTouchTimeRef.current = performance.now();
  };

  const onDragMove = (e: React.MouseEvent | React.TouchEvent) => {
    if (!isDraggingRef.current) return;

    if (e.cancelable) {
      e.preventDefault();
    }

    let clientX = 0;
    let clientY = 0;
    if ('touches' in e) {
      clientX = e.touches[0].clientX;
      clientY = e.touches[0].clientY;
    } else {
      clientX = e.clientX;
      clientY = e.clientY;
    }

    const currentAngle = getPointerAngle(clientX, clientY);
    const now = performance.now();
    const dT = Math.max(1, now - lastTouchTimeRef.current);

    // Calculate angular delta with rotation cross wrapping safety
    let deltaAngle = currentAngle - prevAngleRef.current;
    if (deltaAngle > Math.PI) deltaAngle -= Math.PI * 2;
    if (deltaAngle < -Math.PI) deltaAngle += Math.PI * 2;

    // Apply angular position displacement immediately
    angleRef.current += deltaAngle;

    // Calculate drag velocity (rads per micro frame)
    // Add smoothing to prevent heavy input jitter
    const dragVel = deltaAngle;
    omegaRef.current = omegaRef.current * 0.35 + dragVel * 0.65;

    prevAngleRef.current = currentAngle;
    lastTouchTimeRef.current = now;
  };

  const onDragEnd = () => {
    isDraggingRef.current = false;

    // Check high momentum swipe triggers to update totalSpins statistics
    if (Math.abs(omegaRef.current) > 0.08) {
      const nextSpinsValue = stats.totalSpins + 1;
      updateStats({ totalSpins: nextSpinsValue });

      if (nextSpinsValue === 1) {
        triggerNotification('🌀 First Spin Unlocked!', 'You set a customizable spinner in motion!');
      } else if (nextSpinsValue === 50) {
        triggerNotification('🏆 Master Spinner Unlocked!', '50 spins! Ultimate continuous momentum!');
      }
    }
  };

  // Immediate boost click to quickly test spinner physics on non-touch desktop
  const triggerImpulseBoost = () => {
    audioEngine.initContext();
    audioEngine.startSpinnerHum();
    omegaRef.current += 0.85; // boost speed forward!
    
    const nextSpinsValue = stats.totalSpins + 1;
    updateStats({ totalSpins: nextSpinsValue });
    
    if (navigator.vibrate) {
      navigator.vibrate(15);
    }
  };

  return (
    <div id="fidget-spinner-game" className="flex flex-col items-center w-full max-w-4xl mx-auto px-4 py-3 select-none">
      
      {/* Mechanical Spinning Metrics Panel */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 w-full bg-slate-900/60 backdrop-blur-md rounded-2xl p-4 mb-4 border border-slate-800 shadow-xl">
        <div className="flex items-center space-x-3 bg-slate-950/30 p-2.5 rounded-xl border border-slate-800/50">
          <CircleDot className="w-5 h-5 text-cyan-400 animate-spin" />
          <div>
            <h4 className="text-[10px] text-slate-500 uppercase font-bold tracking-wider">Current Speed</h4>
            <p className="text-sm font-bold text-white tracking-wide">
              {rpm} <span className="text-[10px] text-cyan-400 font-medium">RPM</span>
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-3 bg-slate-950/30 p-2.5 rounded-xl border border-slate-800/50">
          <Award className="w-5 h-5 text-amber-400" />
          <div>
            <h4 className="text-[10px] text-slate-500 uppercase font-bold tracking-wider">Top Velocity</h4>
            <p className="text-sm font-bold text-white tracking-wide">
              {maxRpm} <span className="text-[10px] text-amber-400 font-medium">RPM</span>
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-3 bg-slate-950/30 p-2.5 rounded-xl border border-slate-800/50">
          <Play className="w-5 h-5 text-green-400" />
          <div>
            <h4 className="text-[10px] text-slate-500 uppercase font-bold tracking-wider">Active Spin</h4>
            <p className="text-sm font-bold text-white tracking-wide">
              {spinTime} <span className="text-[10px] text-green-400 font-medium">secs</span>
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-3 bg-slate-950/30 p-2.5 rounded-xl border border-slate-800/50">
          <RotateCw className="w-5 h-5 text-purple-400" />
          <div>
            <h4 className="text-[10px] text-slate-500 uppercase font-bold tracking-wider">Longest Glide</h4>
            <p className="text-sm font-bold text-white tracking-wide">
              {longestSpin} <span className="text-[10px] text-purple-400 font-medium">secs</span>
            </p>
          </div>
        </div>
      </div>

      {/* Interactive Drag Canvas Arena */}
      <div
        ref={containerRef}
        onMouseDown={onDragStart}
        onMouseMove={onDragMove}
        onMouseUp={onDragEnd}
        onMouseLeave={onDragEnd}
        onTouchStart={onDragStart}
        onTouchMove={onDragMove}
        onTouchEnd={onDragEnd}
        className="relative w-full aspect-square md:aspect-video flex items-center justify-center bg-radial from-slate-900 via-slate-950 to-black rounded-3xl border border-slate-800/80 overflow-hidden cursor-grab active:cursor-grabbing shadow-2xl touch-none select-none"
      >
        {/* Background mechanical vector circles */}
        <div className="absolute inset-0 bg-[radial-gradient(#0891b2_0.8px,transparent_0.8px)] [background-size:24px_24px] opacity-20 z-0" />
        <div className="absolute w-72 h-72 border border-cyan-500/10 rounded-full animate-pulse z-0 pointer-events-none" />
        <div className="absolute w-96 h-96 border border-cyan-500/5 rounded-full z-0 pointer-events-none" />

        {/* Outer instructions hint inside arena */}
        {rpm === 0 && (
          <div className="absolute top-8 text-center bg-slate-900/60 backdrop-blur-sm border border-slate-800 px-4 py-2 rounded-full z-10 animate-pulse pointer-events-none">
            <p className="text-xs text-slate-400 font-medium tracking-wider uppercase">Swipe outwards or click boost to set spinning!</p>
          </div>
        )}

        {/* Mechanical Spinner Vector Render */}
        <div
          id="fidget-spinner-center"
          className="relative w-76 h-76 flex items-center justify-center pointer-events-none z-10 select-none"
        >
          {/* Main blades structure containing beautiful SVG */}
          <div
            id="fidget-spinner-blade"
            className="w-full h-full select-none"
            style={{ transformOrigin: 'center center' }}
          >
            {activeSpinner.id === 'gold' && (
              <svg viewBox="0 0 100 100" className="w-full h-full drop-shadow-[0_12px_24px_rgba(0,0,0,0.65)]">
                {/* Gold outer weights weights */}
                <circle cx="50" cy="18" r="13" fill="url(#goldGradient)" stroke="#b45309" strokeWidth="1" />
                <circle cx="22" cy="66" r="13" fill="url(#goldGradient)" stroke="#b45309" strokeWidth="1" />
                <circle cx="78" cy="66" r="13" fill="url(#goldGradient)" stroke="#b45309" strokeWidth="1" />
                
                {/* Heavy black steel inserts */}
                <circle cx="50" cy="18" r="6" fill="#1e293b" stroke="#0f172a" strokeWidth="1.5" />
                <circle cx="22" cy="66" r="6" fill="#1e293b" stroke="#0f172a" strokeWidth="1.5" />
                <circle cx="78" cy="66" r="6" fill="#1e293b" stroke="#0f172a" strokeWidth="1.5" />

                {/* Connection hub struts */}
                <path d="M50,18 Q50,50 22,66 Q50,50 78,66 Q50,50 50,18" fill="url(#goldGradient)" stroke="#b45309" strokeWidth="0.8" />
                
                {/* Polished bronze center cap */}
                <circle cx="50" cy="50" r="16" fill="url(#bronzeGradient)" stroke="#78350f" strokeWidth="1.5" />
                <circle cx="50" cy="50" r="11" fill="#1e293b" />
                <circle cx="50" cy="50" r="4" fill="#64748b" />

                <defs>
                  <linearGradient id="goldGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#fbbf24" />
                    <stop offset="45%" stopColor="#f59e0b" />
                    <stop offset="100%" stopColor="#b45309" />
                  </linearGradient>
                  <linearGradient id="bronzeGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#d97706" />
                    <stop offset="100%" stopColor="#78350f" />
                  </linearGradient>
                </defs>
              </svg>
            )}

            {activeSpinner.id === 'neon' && (
              <svg viewBox="0 0 100 100" className="w-full h-full drop-shadow-[0_0_20px_rgba(6,182,212,0.45)]">
                {/* Cyber ring outer guides */}
                <circle cx="50" cy="50" r="32" fill="none" stroke="#06b6d4" strokeWidth="8" strokeDasharray="30 10 20 10" opacity="0.85" />
                
                {/* 3 orbital light nodes */}
                <circle cx="50" cy="18" r="9" fill="#22d3ee" stroke="#0891b2" strokeWidth="1.5" />
                <circle cx="22" cy="66" r="9" fill="#22d3ee" stroke="#0891b2" strokeWidth="1.5" />
                <circle cx="78" cy="66" r="9" fill="#22d3ee" stroke="#0891b2" strokeWidth="1.5" />
                
                <path d="M50,18 L50,50 L22,66 L50,50 L78,66" fill="none" stroke="#0891b2" strokeWidth="4.5" />

                {/* Central Neon hub caps */}
                <circle cx="50" cy="50" r="15" fill="#0891b2" stroke="#06b6d4" strokeWidth="2" />
                <circle cx="50" cy="50" r="7" fill="#0f172a" />
              </svg>
            )}

            {activeSpinner.id === 'titanium' && (
              <svg viewBox="0 0 100 100" className="w-full h-full drop-shadow-[0_12px_24px_rgba(0,0,0,0.7)]">
                {/* Modern structural angular triangular blades */}
                <path d="M50,8 L58,40 L88,44 L64,62 L74,92 L50,74 L26,92 L36,62 L12,44 L42,40 Z" fill="url(#silverGradient)" stroke="#475569" strokeWidth="1.8" />
                
                {/* Core hollow slits on each branch */}
                <circle cx="50" cy="24" r="5.5" fill="#0f172a" stroke="#475569" strokeWidth="1" />
                <circle cx="28" cy="68" r="5.5" fill="#0f172a" stroke="#475569" strokeWidth="1" />
                <circle cx="72" cy="68" r="5.5" fill="#0f172a" stroke="#475569" strokeWidth="1" />

                {/* Central hub */}
                <circle cx="50" cy="50" r="14" fill="#475569" stroke="#1e293b" strokeWidth="1.5" />
                <circle cx="50" cy="50" r="9" fill="#1e293b" />

                <defs>
                  <linearGradient id="silverGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#e2e8f0" />
                    <stop offset="50%" stopColor="#94a3b8" />
                    <stop offset="100%" stopColor="#475569" />
                  </linearGradient>
                </defs>
              </svg>
            )}

            {activeSpinner.id === 'void' && (
              <svg viewBox="0 0 100 100" className="w-full h-full drop-shadow-[0_10px_20px_rgba(0,0,0,0.85)]">
                {/* Swirling double-blade vortex structure */}
                <path d="M50,15 C68,15 85,25 80,50 C75,75 55,65 50,85 C32,85 15,75 20,50 C25,25 45,35 50,15 Z" fill="url(#pinkGradient)" stroke="#1e1b4b" strokeWidth="2" />
                
                {/* Helical speed cuts */}
                <path d="M50,22 Q65,28 62,45" fill="none" stroke="#000" strokeWidth="2.5" strokeLinecap="round" />
                <path d="M50,78 Q35,72 38,55" fill="none" stroke="#000" strokeWidth="2.5" strokeLinecap="round" />

                {/* Custom glowing core center cap */}
                <circle cx="50" cy="50" r="16" fill="#1e1b4b" stroke="#db2777" strokeWidth="1.5" />
                <circle cx="50" cy="50" r="10" fill="url(#pinkGradient)" />
                <circle cx="50" cy="50" r="4" fill="#000" />

                <defs>
                  <linearGradient id="pinkGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#f472b6" />
                    <stop offset="50%" stopColor="#ec4899" />
                    <stop offset="100%" stopColor="#9d174d" />
                  </linearGradient>
                </defs>
              </svg>
            )}
          </div>
        </div>

        {/* Quick tap boost multiplier button at baseline quadrant */}
        <button
          id="fidget-boost-btn"
          onClick={(e) => {
            e.stopPropagation(); // prevent drag trigger
            triggerImpulseBoost();
          }}
          className="absolute bottom-6 bg-slate-900 border border-slate-800 hover:border-cyan-500/50 hover:bg-slate-800/80 px-4 py-2 rounded-xl text-xs font-bold text-cyan-400 cursor-pointer shadow-lg tracking-wider flex items-center space-x-1.5 active:scale-95 transition-all z-20"
        >
          <RotateCw className="w-4 h-4 animate-spin" />
          <span>BOOST SPIN (+RPM)</span>
        </button>
      </div>

      {/* Decorative Spinner Selection Bar */}
      <div className="flex flex-col items-center w-full mt-4 bg-slate-900/60 p-4 rounded-2xl border border-slate-800 gap-3">
        <h3 className="text-xs text-slate-400 capitalize font-bold tracking-wider self-start">Select Module Design</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2.5 w-full">
          {SPINNERS.map((spin) => {
            const isSelected = activeSpinner.id === spin.id;
            return (
              <button
                id={`spinner-design-select-${spin.id}`}
                key={spin.id}
                onClick={() => {
                  setActiveSpinner(spin);
                  audioEngine.playPop(1.15);
                  if (navigator.vibrate) {
                    navigator.vibrate(8);
                  }
                }}
                className={`
                  flex flex-col text-left p-3 rounded-xl border transition-all cursor-pointer h-24 justify-between select-none
                  ${
                    isSelected
                      ? 'bg-slate-800 text-white shadow-md'
                      : 'bg-slate-950/40 text-slate-400 border-slate-800/60 hover:bg-slate-900/50 hover:text-white'
                  }
                `}
                style={{ borderColor: isSelected ? spin.color : 'rgba(30, 41, 59, 1)' }}
              >
                <div className="flex items-center justify-between w-full">
                  <span className="text-xs font-bold text-white tracking-wide">{spin.name}</span>
                  <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: spin.color }} />
                </div>
                <p className="text-[9px] line-clamp-2 leading-relaxed text-slate-500">{spin.desc}</p>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
