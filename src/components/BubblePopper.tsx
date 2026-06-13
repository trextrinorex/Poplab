/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import { GameStats } from '../types';
import { audioEngine } from '../audioEngine';
import { Sparkles, RefreshCw, Trophy, Flame } from 'lucide-react';

interface BubblePopperProps {
  stats: GameStats;
  updateStats: (statUpdates: Partial<GameStats>) => void;
  triggerNotification: (title: string, desc: string) => void;
}

interface Particle {
  id: number;
  x: number;
  y: number;
  vx: number;
  vy: number;
  color: string;
  size: number;
  alpha: number;
  life: number;
  maxLife: number;
}

interface Ring {
  id: number;
  x: number;
  y: number;
  radius: number;
  maxRadius: number;
  alpha: number;
}

export default function BubblePopper({ stats, updateStats, triggerNotification }: BubblePopperProps) {
  const [rows, setRows] = useState(8);
  const [cols, setCols] = useState(6);
  const [grid, setGrid] = useState<boolean[]>([]);
  const [combo, setCombo] = useState(0);
  const [maxCombo, setMaxCombo] = useState(() => stats.bestBubbleCombo || 0);
  const [sheetScore, setSheetScore] = useState(0);
  
  const containerRef = useRef<HTMLDivElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const comboTimerRef = useRef<NodeJS.Timeout | null>(null);
  const particlesRef = useRef<Particle[]>([]);
  const ringsRef = useRef<Ring[]>([]);
  const nextParticleId = useRef(0);

  // Initialize bubble wrap sheet
  useEffect(() => {
    generateNewSheet();
  }, [rows, cols]);

  // Adjust grid based on screen width/height to look stunning on mobile
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 480) {
        setCols(5);
        setRows(7);
      } else if (window.innerWidth < 768) {
        setCols(6);
        setRows(8);
      } else {
        setCols(8);
        setRows(10);
      }
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const generateNewSheet = () => {
    setGrid(new Array(rows * cols).fill(false));
    setSheetScore(0);
    // Add visual splash particle on page load
    if (canvasRef.current && containerRef.current) {
      const rect = containerRef.current.getBoundingClientRect();
      createBurst(rect.width / 2, rect.height / 2, '#4ade80');
    }
  };

  // Canvas drawing loop for high-fidelity particles (60fps optimized)
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId: number;

    const render = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Update and draw rings
      ringsRef.current = ringsRef.current.filter((ring) => {
        ring.radius += (ring.maxRadius - ring.radius) * 0.15;
        ring.alpha -= 0.05;
        if (ring.alpha <= 0) return false;

        ctx.strokeStyle = `rgba(147, 197, 253, ${ring.alpha})`; // Light blue
        ctx.lineWidth = 2.5;
        ctx.beginPath();
        ctx.arc(ring.x, ring.y, ring.radius, 0, Math.PI * 2);
        ctx.stroke();
        return true;
      });

      // Update and draw micro particles
      particlesRef.current = particlesRef.current.filter((p) => {
        p.x += p.vx;
        p.y += p.vy;
        p.vy += 0.22; // gravity simulation
        p.life -= 1;
        p.alpha = Math.max(0, p.life / p.maxLife);

        ctx.fillStyle = p.color;
        ctx.globalAlpha = p.alpha;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fill();
        return p.life > 0;
      });
      ctx.globalAlpha = 1.0;

      animId = requestAnimationFrame(render);
    };

    animId = requestAnimationFrame(render);
    return () => cancelAnimationFrame(animId);
  }, []);

  // Sync canvas size to outer bounding box
  useEffect(() => {
    const resizeCanvas = () => {
      const canvas = canvasRef.current;
      const container = containerRef.current;
      if (canvas && container) {
        canvas.width = container.clientWidth;
        canvas.height = container.clientHeight;
      }
    };
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);
    return () => window.removeEventListener('resize', resizeCanvas);
  }, [grid]);

  const createBurst = (x: number, y: number, color: string) => {
    // Generate rings
    const ringId = nextParticleId.current++;
    ringsRef.current.push({
      id: ringId,
      x,
      y,
      radius: 5,
      maxRadius: 40 + Math.random() * 20,
      alpha: 1.0,
    });

    // Generate splashing micro drops
    const numParticles = 12 + Math.floor(Math.random() * 8);
    for (let i = 0; i < numParticles; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = 2 + Math.random() * 4.5;
      const pId = nextParticleId.current++;
      particlesRef.current.push({
        id: pId,
        x,
        y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed - 1.5, // initial upward punch
        color,
        size: 1.5 + Math.random() * 2.5,
        life: 25 + Math.floor(Math.random() * 20),
        maxLife: 45,
        alpha: 1.0,
      });
    }
  };

  const popBubble = (index: number, e: React.MouseEvent | React.TouchEvent) => {
    if (grid[index]) return; // already popped!

    audioEngine.initContext();

    // Prevent scrolling when holding down bubble grid on mobile
    if (e.cancelable) {
      e.preventDefault();
    }

    const newGrid = [...grid];
    newGrid[index] = true;
    setGrid(newGrid);

    // Get click location relative to canvas coordinate system
    let clientX = 0;
    let clientY = 0;
    if ('touches' in e && e.touches.length > 0) {
      clientX = e.touches[0].clientX;
      clientY = e.touches[0].clientY;
    } else if ('clientX' in e) {
      clientX = e.clientX;
      clientY = e.clientY;
    }

    let popX = 0;
    let popY = 0;
    if (containerRef.current) {
      const rect = containerRef.current.getBoundingClientRect();
      popX = clientX - rect.left;
      popY = clientY - rect.top;
    }

    // Refresh combo timer window (1200ms space)
    setCombo((prevCombo) => {
      const nextCombo = prevCombo + 1;
      if (nextCombo > maxCombo) {
        setMaxCombo(nextCombo);
        updateStats({ bestBubbleCombo: nextCombo });
      }
      return nextCombo;
    });

    if (comboTimerRef.current) {
      clearTimeout(comboTimerRef.current);
    }
    comboTimerRef.current = setTimeout(() => {
      setCombo(0);
    }, 1200);

    // Dynamic pitch modifier: high combo = high pitch squeak!
    const activeCombo = combo + 1;
    const pitchModifier = 0.85 + Math.min(activeCombo * 0.05, 0.8);
    audioEngine.playPop(pitchModifier);

    // Trigger phone vibration API
    if (navigator.vibrate) {
      navigator.vibrate(10);
    }

    // Trigger splash canvas particles
    // Alternating vibrant stress-free neon colors!
    const colors = ['#60a5fa', '#34d399', '#f472b6', '#fbbf24', '#a78bfa', '#2dd4bf'];
    const burstColor = colors[index % colors.length];
    createBurst(popX, popY, burstColor);

    // State stats
    const nextPopsValue = stats.totalPops + 1;
    setSheetScore((prev) => prev + 1);

    updateStats({ totalPops: nextPopsValue });

    // Check achievement metrics immediately for pop satisfaction
    if (nextPopsValue === 1) {
      triggerNotification('💥 First Pop Unlocked!', 'You popped your very first bubble!');
    } else if (nextPopsValue === 100) {
      triggerNotification('🏆 Bubble Enthusiast Unlocked!', '100 pops complete. Sensory heaven!');
    } else if (nextPopsValue === 1000) {
      triggerNotification('👑 Bubble Legend Unlocked!', '1,000 pops! The plastic wrap sovereign!');
    }

    // Check sheet completion
    const allPopped = newGrid.every((bubble) => bubble === true);
    if (allPopped) {
      setTimeout(() => {
        triggerNotification('🎉 Sheet Complete!', 'Ready for another round of pristine plastic wraps?');
        generateNewSheet();
      }, 400);
    }
  };

  const getUnpoppedCount = () => {
    return grid.filter((b) => !b).length;
  };

  return (
    <div id="bubble-wrap-game" className="flex flex-col items-center w-full max-w-4xl mx-auto px-4 py-3">
      {/* Game Head Metrics Header */}
      <div className="flex flex-wrap items-center justify-between w-full bg-slate-900/60 backdrop-blur-md rounded-2xl p-4 mb-4 border border-slate-800 shadow-xl gap-3">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-blue-500/15 rounded-xl border border-blue-500/20 text-blue-400">
            <Sparkles className="w-5 h-5 animate-pulse" />
          </div>
          <div>
            <h3 className="text-sm text-slate-400 font-medium">Popper Score</h3>
            <p className="text-lg font-bold text-white tracking-wide">
              {stats.totalPops} <span className="text-xs text-slate-500 font-normal">total pops</span>
            </p>
          </div>
        </div>

        {/* Combo Multiplier Meter */}
        <div className="flex items-center space-x-6">
          {combo > 1 && (
            <div className="flex items-center bg-gradient-to-r from-pink-500/20 to-purple-500/20 border border-pink-500/30 px-3 py-1 rounded-full animate-bounce">
              <Flame className="w-4 h-4 text-pink-400 mr-1 fill-current" />
              <span className="text-xs font-bold text-pink-300 tracking-wider">
                {combo}X COMBO
              </span>
            </div>
          )}

          <div className="flex items-center bg-slate-800/50 px-3 py-1.5 rounded-xl border border-slate-700/50">
            <Trophy className="w-4 h-4 text-amber-400 mr-2" />
            <div className="text-right">
              <p className="text-[10px] text-slate-500 uppercase font-bold tracking-wider">Best Combo</p>
              <p className="text-xs font-bold text-slate-300">{maxCombo} pops</p>
            </div>
          </div>
          
          <button
            id="bubble-reset-btn"
            onClick={generateNewSheet}
            className="flex items-center justify-center p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-all cursor-pointer border border-slate-700"
            title="Generate New Bubble Sheet"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Main Bubble Grid Workspace */}
      <div className="relative w-full aspect-square md:aspect-video flex items-center justify-center bg-slate-950/80 rounded-3xl border border-slate-800 overflow-hidden shadow-inner p-6 select-none">
        
        {/* Decorative Grid Mesh Background */}
        <div className="absolute inset-0 bg-[radial-gradient(#1e293b_1.2px,transparent_1.2px)] [background-size:16px_16px] opacity-35" />

        {/* Floating Interactive Canvas for splats and rings */}
        <canvas
          ref={canvasRef}
          className="absolute inset-0 pointer-events-none z-10"
        />

        {/* Bubble Wrap sheet Container */}
        <div
          ref={containerRef}
          className="relative grid gap-3 max-w-full max-h-full items-center justify-center bg-slate-900/30 p-5 rounded-2xl border border-slate-800/40 shadow-inner z-0"
          style={{
            gridTemplateColumns: `repeat(${cols}, minmax(0, 1fr))`,
            aspectRatio: `${cols} / ${rows}`,
            width: '100%',
          }}
        >
          {grid.map((popped, idx) => (
            <button
              id={`bubble-wrap-cell-${idx}`}
              key={idx}
              onMouseDown={(e) => popBubble(idx, e)}
              onTouchStart={(e) => popBubble(idx, e)}
              className={`
                relative rounded-full aspect-square w-full shadow-md select-none touch-none cursor-pointer outline-none transition-all duration-150
                ${
                  popped
                    ? 'bg-slate-900 border border-slate-800/40 inner-shadow-popped scale-95 opacity-55'
                    : 'bg-gradient-to-b from-blue-400/30 to-blue-600/10 border-2 border-blue-400/40 hover:border-blue-400/70 shadow-[0_4px_12px_rgba(59,130,246,0.25)] hover:scale-102 hover:shadow-[0_6px_16px_rgba(59,130,246,0.4)] active:scale-95'
                }
              `}
              style={{
                // Shine highlighting effect for unpopped bubble wrap
                backgroundImage: popped
                  ? 'none'
                  : 'radial-gradient(circle at 30% 30%, rgba(255, 255, 255, 0.4) 0%, rgba(255, 255, 255, 0) 65%)',
              }}
            >
              {/* Internal 3D Pop Bubble Reflection Detail */}
              {!popped && (
                <div className="absolute top-[20%] left-[20%] w-[25%] h-[25%] bg-white rounded-full opacity-35 blur-[0.6px]" />
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Helpful Instructions */}
      <p className="text-slate-400 text-xs text-center mt-4 tracking-wide font-light max-w-md">
        Tip: Tap or swipe over the bubbles quickly to unlock high multipliers and hear satisfying pitch modifications! Only {getUnpoppedCount()} bubbles remaining.
      </p>
    </div>
  );
}
