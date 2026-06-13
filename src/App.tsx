/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { GameStats, Achievement, SoundSettings } from './types';
import { audioEngine } from './audioEngine';
import { INITIAL_ACHIEVEMENTS } from './achievementsData';

// Component Imports
import BubblePopper from './components/BubblePopper';
import SmashLab from './components/SmashLab';
import FidgetSpinner from './components/FidgetSpinner';
import RageButton from './components/RageButton';
import AchievementsPanel from './components/AchievementsPanel';

// Icon Imports
import {
  Volume2,
  VolumeX,
  Trophy,
  Award,
  Sparkles,
  Flame,
  Zap,
  Hammer,
  RotateCw,
  Sliders,
  Smile,
  ShieldAlert,
  Play,
  Heart
} from 'lucide-react';

const DEFAULT_STATS: GameStats = {
  totalPops: 0,
  totalSmashes: 0,
  totalSpins: 0,
  totalRageClicks: 0,
  bestBubbleCombo: 0,
  highestRpm: 0,
  longestSpinSeconds: 0,
};

export default function App() {
  const [activeTab, setActiveTab] = useState<'home' | 'bubble' | 'smash' | 'spinner' | 'rage' | 'achievements'>('home');
  const [stats, setStats] = useState<GameStats>(DEFAULT_STATS);
  const [achievements, setAchievements] = useState<Achievement[]>(INITIAL_ACHIEVEMENTS);
  const [sound, setSound] = useState<SoundSettings>({ volume: 0.5, muted: false });
  const [notifications, setNotifications] = useState<Array<{ id: string; title: string; desc: string }>>([]);

  // 1. Initial State Loading from LocalStorage on Component mount
  useEffect(() => {
    try {
      // Stats load
      const savedStats = localStorage.getItem('poplab_stats');
      if (savedStats) {
        setStats({ ...DEFAULT_STATS, ...JSON.parse(savedStats) });
      }

      // Sound settings load
      const savedSound = localStorage.getItem('poplab_sound');
      if (savedSound) {
        const soundConfig = JSON.parse(savedSound);
        setSound(soundConfig);
        audioEngine.setVolume(soundConfig.volume);
        audioEngine.setMute(soundConfig.muted);
      }

      // Achievements load
      const savedAchievements = localStorage.getItem('poplab_achievements');
      if (savedAchievements) {
        const parsed: Achievement[] = JSON.parse(savedAchievements);
        // Map saved unlock states relative to initial configurations to safely protect schema updates
        const merged = INITIAL_ACHIEVEMENTS.map((initial) => {
          const match = parsed.find((item) => item.id === initial.id);
          if (match) {
            return {
              ...initial,
              unlocked: match.unlocked,
              unlockedAt: match.unlockedAt,
            };
          }
          return initial;
        });
        setAchievements(merged);
      }
    } catch (e) {
      console.error('Error loading LocalStorage state in PopLab:', e);
    }
  }, []);

  // 2. State Mutation Trigger Updates Coord
  const updateStats = (updates: Partial<GameStats>) => {
    setStats((prev) => {
      const next = { ...prev, ...updates };
      localStorage.setItem('poplab_stats', JSON.stringify(next));
      
      // Dynamic internal achievement verification run on every statistics increments!
      recheckAchievements(next);
      return next;
    });
  };

  const updateSoundSettings = (updates: Partial<SoundSettings>) => {
    setSound((prev) => {
      const next = { ...prev, ...updates };
      localStorage.setItem('poplab_sound', JSON.stringify(next));
      if (updates.volume !== undefined) {
        audioEngine.setVolume(updates.volume);
      }
      if (updates.muted !== undefined) {
        audioEngine.setMute(updates.muted);
      }
      return next;
    });
  };

  // 3. Real-time Achievement state machine checker
  const recheckAchievements = (currStats: GameStats) => {
    setAchievements((prevAchievements) => {
      let changed = false;
      const next = prevAchievements.map((ach) => {
        if (ach.unlocked) return ach; // already achieved

        const currentValue = currStats[ach.targetField] as number;
        if (currentValue >= ach.targetValue) {
          changed = true;
          triggerNotification(`🏆 Achievement: ${ach.title}`, ach.description);
          return {
            ...ach,
            unlocked: true,
            unlockedAt: Date.now(),
          };
        }
        return ach;
      });

      if (changed) {
        localStorage.setItem('poplab_achievements', JSON.stringify(next));
      }
      return next;
    });
  };

  // 4. Real-time Slide Toast Notifications
  const triggerNotification = (title: string, desc: string) => {
    audioEngine.playChime();
    const id = Date.now().toString() + Math.random().toString();
    setNotifications((prev) => [...prev, { id, title, desc }]);

    // auto cleanup in 4.5 seconds
    setTimeout(() => {
      setNotifications((prev) => prev.filter((item) => item.id !== id));
    }, 4500);
  };

  const handleResetData = () => {
    localStorage.removeItem('poplab_stats');
    localStorage.removeItem('poplab_achievements');
    setStats(DEFAULT_STATS);
    setAchievements(INITIAL_ACHIEVEMENTS.map((a) => ({ ...a, unlocked: false, unlockedAt: null })));
    triggerNotification('🧹 Cache Purged!', 'Your statistics, scores, and accomplishments have been reset.');
  };

  const unlockedGoalsCount = achievements.filter((a) => a.unlocked).length;

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans antialiased overflow-x-hidden selection:bg-rose-500/30 selection:text-white">
      
      {/* Real-time Slide Toast Overlay Alerts Panel */}
      <div className="fixed top-5 left-1/2 transform -translate-x-1/2 z-50 flex flex-col space-y-2 w-full max-w-sm px-4 pointer-events-none">
        {notifications.map((toast) => (
          <div
            key={toast.id}
            className="pointer-events-auto bg-slate-900/90 backdrop-blur-md border border-amber-500/40 px-4 py-3 rounded-2xl shadow-[0_8px_32px_rgba(245,158,11,0.2)] flex items-start space-x-3 text-left animate-slide-down transform transition-all duration-300"
          >
            <div className="p-2 bg-amber-500/15 rounded-xl border border-amber-500/25 text-amber-400">
              <Award className="w-5 h-5" />
            </div>
            <div className="flex-1 min-w-0">
              <h4 className="text-white text-xs font-black tracking-wide uppercase">{toast.title}</h4>
              <p className="text-[11px] text-slate-350 mt-1 leading-normal">{toast.desc}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Modern Glassmorphic Top Header */}
      <nav className="sticky top-0 z-40 bg-slate-950/75 backdrop-blur-lg border-b border-slate-900/80 px-4 md:px-8 py-4.5 flex items-center justify-between">
        <button
          onClick={() => {
            setActiveTab('home');
            audioEngine.playPop(1.0);
          }}
          className="flex items-center space-x-2 bg-transparent border-0 cursor-pointer text-left focus:outline-none"
        >
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-rose-500 to-orange-500 flex items-center justify-center shadow-lg shadow-rose-500/20">
            <span className="text-xl font-black text-white">P</span>
          </div>
          <div>
            <h1 className="text-lg font-black text-white tracking-tight leading-none">PopLab</h1>
            <p className="text-[9px] text-slate-400 tracking-wider uppercase font-bold mt-0.5">Stress Relief Hub</p>
          </div>
        </button>

        {/* Global Sound Synthesizer controls header */}
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2 bg-slate-900/50 px-3 py-1.5 rounded-xl border border-slate-800/80">
            <button
              onClick={() => {
                updateSoundSettings({ muted: !sound.muted });
                audioEngine.playPop(1.1);
              }}
              className="text-slate-400 hover:text-white transition-all focus:outline-none cursor-pointer"
              title={sound.muted ? 'Unmute sound effects' : 'Mute sound effects'}
            >
              {sound.muted ? <VolumeX className="w-4 h-4 text-red-400" /> : <Volume2 className="w-4 h-4 text-emerald-400" />}
            </button>
            <div className="flex items-center space-x-1.5 h-full">
              <Sliders className="w-3 h-3 text-slate-500" />
              <input
                type="range"
                min="0"
                max="1"
                step="0.05"
                value={sound.volume}
                onChange={(e) => updateSoundSettings({ volume: parseFloat(e.target.value) })}
                className="w-16 h-1 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-emerald-450 focus:outline-none"
                title="Master Volume Level"
              />
            </div>
          </div>
          
          <button
            onClick={() => {
              setActiveTab('achievements');
              audioEngine.playPop(1.0);
            }}
            className={`
              relative p-2.5 rounded-xl border transition-all cursor-pointer focus:outline-none flex items-center justify-center
              ${
                activeTab === 'achievements'
                  ? 'bg-amber-500/10 border-amber-500/40 text-amber-400'
                  : 'bg-slate-900/40 border-slate-800/80 text-slate-400 hover:text-white'
              }
            `}
            title="View Achievements Locker"
          >
            <Trophy className="w-4.5 h-4.5" />
            {unlockedGoalsCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-amber-500 text-slate-950 font-black text-[9px] w-4.5 h-4.5 rounded-full flex items-center justify-center border-2 border-slate-950">
                {unlockedGoalsCount}
              </span>
            )}
          </button>
        </div>
      </nav>

      {/* Main Container Content */}
      <main className="flex-1 overflow-y-auto pb-24">
        
        {/* HOMEPAGE VIEW */}
        {activeTab === 'home' && (
          <div className="w-full max-w-5xl mx-auto px-4 md:px-8 py-8 animate-fade-in">
            {/* Ambient visual glowing particles */}
            <div className="absolute top-[30%] left-[20%] w-72 h-72 bg-rose-500/5 rounded-full filter blur-3xl z-0 pointer-events-none" />
            <div className="absolute top-[60%] right-[10%] w-80 h-80 bg-blue-500/5 rounded-full filter blur-3xl z-0 pointer-events-none" />

            {/* Giant Hero Banner Section */}
            <div className="relative text-center max-w-2xl mx-auto py-12 md:py-16 flex flex-col items-center z-10 select-none">
              <div className="inline-flex items-center space-x-2 bg-gradient-to-r from-rose-500/15 via-orange-500/15 to-amber-500/15 border border-rose-500/20 rounded-full px-4 py-1.5 mb-6 text-rose-400 text-xs font-bold tracking-wider animate-pulse">
                <Smile className="w-4 h-4 animate-spin-slow" />
                <span>ANTI-ANXIETY MICRO LAB IS ONLINE</span>
              </div>

              <h2 className="text-4xl md:text-6xl font-black text-white tracking-tight leading-none font-sans">
                Pop. Smash. <br className="md:hidden" /> Spin. Relax.
              </h2>
              
              <p className="text-slate-400 text-sm md:text-base mt-4.5 font-light leading-relaxed max-w-lg">
                Enter <strong className="text-slate-200">PopLab</strong>, an exquisite selection of high-fidelity, satisfying micro-games crafted specifically for instantaneous stress relief, sensory comfort, and boredom venting.
              </p>

              <button
                id="play-now-main-btn"
                onClick={() => {
                  setActiveTab('bubble');
                  audioEngine.initContext();
                  audioEngine.playPop(1.1);
                }}
                className="mt-8 px-8 py-3.5 bg-gradient-to-r from-rose-500 via-orange-500 to-amber-500 text-white rounded-2xl font-black text-sm tracking-widest cursor-pointer hover:shadow-[0_12px_28px_rgba(239,68,68,0.35)] transition-all hover:scale-102 uppercase flex items-center space-x-2.5 shadow-lg border-b-4 border-rose-600 active:translate-y-0.5 active:border-b-0"
              >
                <Play className="w-4 h-4 fill-current text-white" />
                <span>Enter Stress Relief Lab</span>
              </button>
            </div>

            {/* Quick Metrics Statistics Overview bar */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 max-w-4xl mx-auto mb-12 select-none relative z-10">
              <div className="bg-slate-900/60 backdrop-blur-md rounded-2xl p-4.5 border border-slate-900 flex items-center space-x-3.5 shadow-md">
                <div className="p-2 bg-blue-500/15 text-blue-400 rounded-xl border border-blue-500/20">
                  <Sparkles className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-[10px] text-slate-500 uppercase tracking-wider font-extrabold">Bubble Pops</h4>
                  <p className="text-base font-black text-white mt-0.5 tracking-wide">{stats.totalPops}</p>
                </div>
              </div>

              <div className="bg-slate-900/60 backdrop-blur-md rounded-2xl p-4.5 border border-slate-900 flex items-center space-x-3.5 shadow-md">
                <div className="p-2 bg-rose-500/15 text-rose-400 rounded-xl border border-rose-500/20">
                  <Hammer className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-[10px] text-slate-500 uppercase tracking-wider font-extrabold">Lab Smashes</h4>
                  <p className="text-base font-black text-white mt-0.5 tracking-wide">{stats.totalSmashes}</p>
                </div>
              </div>

              <div className="bg-slate-900/60 backdrop-blur-md rounded-2xl p-4.5 border border-slate-900 flex items-center space-x-3.5 shadow-md">
                <div className="p-2 bg-cyan-500/15 text-cyan-400 rounded-xl border border-cyan-500/20">
                  <RotateCw className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-[10px] text-slate-500 uppercase tracking-wider font-extrabold">Spinner Spins</h4>
                  <p className="text-base font-black text-white mt-0.5 tracking-wide">{stats.totalSpins}</p>
                </div>
              </div>

              <div className="bg-slate-900/60 backdrop-blur-md rounded-2xl p-4.5 border border-slate-900 flex items-center space-x-3.5 shadow-md">
                <div className="p-2 bg-pink-500/15 text-pink-400 rounded-xl border border-pink-500/20">
                  <Flame className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-[10px] text-slate-500 uppercase tracking-wider font-extrabold font-black">Rage Pressure</h4>
                  <p className="text-base font-black text-white mt-0.5 tracking-wide">{stats.totalRageClicks}</p>
                </div>
              </div>
            </div>

            {/* Micro-Chamber Selection Portal Card grid */}
            <div className="max-w-4xl mx-auto">
              <h3 className="text-xs text-slate-400 uppercase tracking-widest font-black mb-6 text-center select-none">
                SELECT A SPECIALIZED EXPERIMENTAL STAGE
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5.5 select-none relative z-10">
                
                {/* Stage 1 Card */}
                <button
                  id="home-stage-select-bubble"
                  onClick={() => {
                    setActiveTab('bubble');
                    audioEngine.playPop(1.1);
                  }}
                  className="group bg-slate-900/40 hover:bg-slate-900/80 border border-slate-900 hover:border-blue-500/30 p-5 rounded-3xl text-left transition-all cursor-pointer hover:shadow-[0_8px_24px_rgba(59,130,246,0.1)] flex flex-col justify-between h-48 focus:outline-none"
                >
                  <div className="flex items-start justify-between w-full">
                    <div className="p-3 bg-blue-500/10 text-blue-400 rounded-xl border border-blue-500/15">
                      <Sparkles className="w-5 h-5" />
                    </div>
                    <span className="text-[9px] bg-blue-500/10 text-blue-400 font-extrabold tracking-wider px-2.5 py-1 rounded-full uppercase border border-blue-500/15">
                      GAME #1
                    </span>
                  </div>
                  <div>
                    <h4 className="text-white font-black text-base tracking-wide group-hover:text-blue-450 transition-all">
                      Bubble Wrap Popper
                    </h4>
                    <p className="text-xs text-slate-400 mt-1 lines-clamp opacity-85 leading-normal font-light">
                      Sensory physical pops on an infinite modular bubble sheet. Accumulate combos and enjoy clean high pitch sweeps.
                    </p>
                  </div>
                </button>

                {/* Stage 2 Card */}
                <button
                  id="home-stage-select-smash"
                  onClick={() => {
                    setActiveTab('smash');
                    audioEngine.playPop(1.1);
                  }}
                  className="group bg-slate-900/40 hover:bg-slate-900/80 border border-slate-900 hover:border-rose-500/30 p-5 rounded-3xl text-left transition-all cursor-pointer hover:shadow-[0_8px_24px_rgba(239,68,68,0.1)] flex flex-col justify-between h-48 focus:outline-none"
                >
                  <div className="flex items-start justify-between w-full">
                    <div className="p-3 bg-rose-500/10 text-rose-450 rounded-xl border border-rose-500/15">
                      <Hammer className="w-5 h-5" />
                    </div>
                    <span className="text-[9px] bg-rose-500/10 text-rose-450 font-extrabold tracking-wider px-2.5 py-1 rounded-full uppercase border border-rose-500/15">
                      GAME #2
                    </span>
                  </div>
                  <div>
                    <h4 className="text-white font-black text-base tracking-wide group-hover:text-rose-450 transition-all">
                      Destruction Smash Lab
                    </h4>
                    <p className="text-xs text-slate-400 mt-1 lines-clamp opacity-85 leading-normal font-light">
                      Choose heavy hammers or bats and shatter plates, clay brick, watermelons, and glass panes with true mechanical fragments.
                    </p>
                  </div>
                </button>

                {/* Stage 3 Card */}
                <button
                  id="home-stage-select-spinner"
                  onClick={() => {
                    setActiveTab('spinner');
                    audioEngine.playPop(1.1);
                  }}
                  className="group bg-slate-900/40 hover:bg-slate-900/80 border border-slate-900 hover:border-cyan-500/30 p-5 rounded-3xl text-left transition-all cursor-pointer hover:shadow-[0_8px_24px_rgba(6,182,212,0.1)] flex flex-col justify-between h-48 focus:outline-none"
                >
                  <div className="flex items-start justify-between w-full">
                    <div className="p-3 bg-cyan-500/10 text-cyan-400 rounded-xl border border-cyan-500/15">
                      <RotateCw className="w-5 h-5" />
                    </div>
                    <span className="text-[9px] bg-cyan-500/10 text-cyan-400 font-extrabold tracking-wider px-2.5 py-1 rounded-full uppercase border border-cyan-500/15">
                      GAME #3
                    </span>
                  </div>
                  <div>
                    <h4 className="text-white font-black text-base tracking-wide group-hover:text-cyan-400 transition-all">
                      Fidget Spinner Simulator
                    </h4>
                    <p className="text-xs text-slate-400 mt-1 lines-clamp opacity-85 leading-normal font-light">
                      Tactical spinner design selection with ceramic speed hums, swipe frictional momentum calculations, and fluid blur rates.
                    </p>
                  </div>
                </button>

                {/* Stage 4 Card */}
                <button
                  id="home-stage-select-rage"
                  onClick={() => {
                    setActiveTab('rage');
                    audioEngine.playPop(1.1);
                  }}
                  className="group bg-slate-900/40 hover:bg-slate-900/80 border border-slate-900 hover:border-pink-500/30 p-5 rounded-3xl text-left transition-all cursor-pointer hover:shadow-[0_8px_24px_rgba(236,72,153,0.1)] flex flex-col justify-between h-48 focus:outline-none"
                >
                  <div className="flex items-start justify-between w-full">
                    <div className="p-3 bg-pink-500/10 text-pink-400 rounded-xl border border-pink-500/15">
                      <Flame className="w-5 h-5" />
                    </div>
                    <span className="text-[9px] bg-pink-500/10 text-pink-400 font-extrabold tracking-wider px-2.5 py-1 rounded-full uppercase border border-pink-500/15">
                      GAME #4
                    </span>
                  </div>
                  <div>
                    <h4 className="text-white font-black text-base tracking-wide group-hover:text-pink-400 transition-all">
                      The Rage Button
                    </h4>
                    <p className="text-xs text-slate-400 mt-1 lines-clamp opacity-85 leading-normal font-light">
                      Vent aggressive energy over a colossal red button that heats up based on click frequencies. Earn sarcastic commentary.
                    </p>
                  </div>
                </button>

              </div>
            </div>

            {/* Footer with warm developer signatures */}
            <div className="mt-16 border-t border-slate-900 pt-8 text-center text-slate-500 text-xs flex flex-row items-center justify-center space-x-1.5 select-none pr-3">
              <Heart className="w-3.5 h-3.5 text-rose-500 fill-current animate-pulse" />
              <span>Created with high-polish sensory design on PopLab. Safe. Sound. Relaxing.</span>
            </div>
          </div>
        )}

        {/* BUBBLE WRAP GAME VIEW */}
        {activeTab === 'bubble' && (
          <div className="w-full py-4 animate-fade-in">
            <BubblePopper
              stats={stats}
              updateStats={updateStats}
              triggerNotification={triggerNotification}
            />
          </div>
        )}

        {/* SMASH LAB VIEW */}
        {activeTab === 'smash' && (
          <div className="w-full py-4 animate-fade-in">
            <SmashLab
              stats={stats}
              updateStats={updateStats}
              triggerNotification={triggerNotification}
            />
          </div>
        )}

        {/* FIDGET SPINNER VIEW */}
        {activeTab === 'spinner' && (
          <div className="w-full py-4 animate-fade-in">
            <FidgetSpinner
              stats={stats}
              updateStats={updateStats}
              triggerNotification={triggerNotification}
            />
          </div>
        )}

        {/* RAGE BUTTON VIEW */}
        {activeTab === 'rage' && (
          <div className="w-full py-4 animate-fade-in">
            <RageButton
              stats={stats}
              updateStats={updateStats}
              triggerNotification={triggerNotification}
            />
          </div>
        )}

        {/* ACHIEVEMENTS VIEW */}
        {activeTab === 'achievements' && (
          <div className="w-full py-4 animate-fade-in">
            <AchievementsPanel
              achievements={achievements}
              stats={stats}
              onResetAchievements={handleResetData}
            />
          </div>
        )}

      </main>

      {/* Global Bottom Navigation Bar for flawless mobile-first triggers */}
      <nav className="fixed bottom-0 left-0 right-0 z-40 bg-slate-950/70 backdrop-blur-md border-t border-slate-900/90 py-1.5 px-3 md:px-12 flex justify-around select-none">
        <button
          id="nav-tab-home"
          onClick={() => {
            setActiveTab('home');
            audioEngine.playPop(1.0);
          }}
          className={`
            flex flex-col items-center justify-center py-1 px-3.5 rounded-xl cursor-pointer transition-all
            ${activeTab === 'home' ? 'text-rose-400' : 'text-slate-400 hover:text-white'}
          `}
        >
          <Smile className="w-5 h-5 mb-0.5" />
          <span className="text-[9px] font-bold uppercase tracking-wider">Lobby</span>
        </button>

        <button
          id="nav-tab-bubble"
          onClick={() => {
            setActiveTab('bubble');
            audioEngine.playPop(1.0);
          }}
          className={`
            flex flex-col items-center justify-center py-1 px-3.5 rounded-xl cursor-pointer transition-all
            ${activeTab === 'bubble' ? 'text-blue-450' : 'text-slate-400 hover:text-white'}
          `}
        >
          <Sparkles className="w-5 h-5 mb-0.5" />
          <span className="text-[9px] font-bold uppercase tracking-wider">Popper</span>
        </button>

        <button
          id="nav-tab-smash"
          onClick={() => {
            setActiveTab('smash');
            audioEngine.playPop(1.0);
          }}
          className={`
            flex flex-col items-center justify-center py-1 px-3.5 rounded-xl cursor-pointer transition-all
            ${activeTab === 'smash' ? 'text-rose-455' : 'text-slate-400 hover:text-white'}
          `}
        >
          <Hammer className="w-5 h-5 mb-0.5" />
          <span className="text-[9px] font-bold uppercase tracking-wider">Smash</span>
        </button>

        <button
          id="nav-tab-spinner"
          onClick={() => {
            setActiveTab('spinner');
            audioEngine.playPop(1.0);
          }}
          className={`
            flex flex-col items-center justify-center py-1 px-3.5 rounded-xl cursor-pointer transition-all
            ${activeTab === 'spinner' ? 'text-cyan-400' : 'text-slate-400 hover:text-white'}
          `}
        >
          <RotateCw className="w-5 h-5 mb-0.5" />
          <span className="text-[9px] font-bold uppercase tracking-wider">Spinner</span>
        </button>

        <button
          id="nav-tab-rage"
          onClick={() => {
            setActiveTab('rage');
            audioEngine.playPop(1.0);
          }}
          className={`
            flex flex-col items-center justify-center py-1 px-3.5 rounded-xl cursor-pointer transition-all
            ${activeTab === 'rage' ? 'text-pink-400' : 'text-slate-400 hover:text-white'}
          `}
        >
          <Flame className="w-5 h-5 mb-0.5" />
          <span className="text-[9px] font-bold uppercase tracking-wider">Rage</span>
        </button>
      </nav>

    </div>
  );
}
