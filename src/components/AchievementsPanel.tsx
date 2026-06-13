/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Achievement, GameStats } from '../types';
import * as LucideIcons from 'lucide-react';
import { Sparkles, Trophy, CheckCircle, Lock, Award, RotateCcw } from 'lucide-react';

interface AchievementsPanelProps {
  achievements: Achievement[];
  stats: GameStats;
  onResetAchievements: () => void;
}

export default function AchievementsPanel({ achievements, stats, onResetAchievements }: AchievementsPanelProps) {
  const [activeTab, setActiveTab] = useState<'all' | 'bubble' | 'smash' | 'spinner' | 'rage'>('all');

  const filteredAchievements = achievements.filter((ach) => {
    if (activeTab === 'all') return true;
    return ach.category === activeTab;
  });

  const getIcon = (iconName: string) => {
    const Icon = (LucideIcons as any)[iconName];
    if (Icon) {
      return <Icon className="w-5 h-5" />;
    }
    return <Award className="w-5 h-5" />;
  };

  const getProgressInfo = (ach: Achievement) => {
    const currentValue = stats[ach.targetField] as number;
    const progress = Math.min(ach.targetValue, currentValue || 0);
    const pct = Math.floor((progress / ach.targetValue) * 100);
    return {
      current: currentValue || 0,
      target: ach.targetValue,
      pct,
    };
  };

  const unlockedCount = achievements.filter((a) => a.unlocked).length;
  const totalCount = achievements.length;
  const totalCompletionPct = totalCount > 0 ? Math.round((unlockedCount / totalCount) * 100) : 0;

  return (
    <div id="achievements-section" className="flex flex-col w-full max-w-4xl mx-auto px-4 py-3">
      {/* Achievements Overall Progression Trophy Badge */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 bg-slate-900/60 backdrop-blur-md rounded-2xl p-5 mb-5 border border-slate-800 shadow-xl items-center">
        <div className="flex items-center space-x-3.5">
          <div className="p-3 bg-amber-500/15 rounded-2xl border border-amber-500/20 text-amber-400">
            <Trophy className="w-6 h-6 animate-pulse" />
          </div>
          <div>
            <h3 className="text-white font-bold text-base">Hall of Records</h3>
            <p className="text-xs text-slate-400 tracking-wide">
              {unlockedCount} of {totalCount} goals unlocked
            </p>
          </div>
        </div>

        {/* Global completion meter */}
        <div className="flex flex-col justify-center">
          <div className="flex items-center justify-between text-xs font-semibold mb-1.5">
            <span className="text-slate-400">Lab Completion</span>
            <span className="text-amber-400 font-extrabold">{totalCompletionPct}%</span>
          </div>
          <div className="w-full bg-slate-950/60 rounded-full h-2.5 border border-slate-800 overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-amber-500 via-orange-500 to-yellow-400 rounded-full transition-all duration-500"
              style={{ width: `${totalCompletionPct}%` }}
            />
          </div>
        </div>

        {/* Action item: Reset Data */}
        <div className="flex md:justify-end">
          <button
            id="reset-stats-btn"
            onClick={() => {
              if (
                window.confirm('Are you absolutely sure you want to reset all your stats, achievements, and combos? This cannot be undone!')
              ) {
                onResetAchievements();
              }
            }}
            className="flex items-center space-x-2 px-3.5 py-2 bg-slate-950/50 hover:bg-red-500/15 text-slate-400 hover:text-red-400 border border-slate-800 hover:border-red-500/20 rounded-xl transition-all text-xs cursor-pointer select-none"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span className="font-semibold tracking-wide uppercase text-[10px]">Purge Progress Cache</span>
          </button>
        </div>
      </div>

      {/* Categories Rails */}
      <div className="flex flex-wrap items-center gap-1.5 mb-5 bg-slate-950/35 p-1 rounded-xl border border-slate-900 justify-center">
        {(['all', 'bubble', 'smash', 'spinner', 'rage'] as const).map((tab) => (
          <button
            id={`achievements-tab-select-${tab}`}
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`
              px-4 py-2 rounded-lg text-xs font-bold tracking-wider capitalize transition-all cursor-pointer select-none
              ${
                activeTab === tab
                  ? 'bg-gradient-to-r from-amber-500 to-orange-500 text-white shadow-md font-extrabold'
                  : 'text-slate-400 hover:text-white hover:bg-slate-900/60'
              }
            `}
          >
            {tab === 'all' ? 'All Goals' : tab === 'bubble' ? 'Bubble Wrap' : tab === 'smash' ? 'Smash Lab' : tab === 'spinner' ? 'Fidget Spinner' : 'Rage Button'}
          </button>
        ))}
      </div>

      {/* Grid containing Achievements cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
        {filteredAchievements.map((ach) => {
          const { current, target, pct } = getProgressInfo(ach);
          return (
            <div
              id={`achievement-card-${ach.id}`}
              key={ach.id}
              className={`
                relative p-4 rounded-2xl border transition-all duration-300 flex items-start space-x-3.5 hover:scale-101
                ${
                  ach.unlocked
                    ? 'bg-slate-900/80 border-amber-500/45 shadow-[0_4px_16px_rgba(245,158,11,0.08)]'
                    : 'bg-slate-950/40 border-slate-900 text-slate-500'
                }
              `}
            >
              {/* Completed glow badge */}
              {ach.unlocked && (
                <div className="absolute top-3 right-3 bg-amber-500/10 text-amber-400 p-1 rounded-full border border-amber-500/25">
                  <CheckCircle className="w-3.5 h-3.5" />
                </div>
              )}

              {/* Locked/Unlocked Category Icon */}
              <div
                className={`
                  p-3 rounded-xl border transition-all duration-300 flex-shrink-0
                  ${
                    ach.unlocked
                      ? 'bg-amber-500/15 text-amber-400 border-amber-500/20'
                      : 'bg-slate-900/70 text-slate-500 border-slate-850'
                  }
                `}
              >
                {ach.unlocked ? getIcon(ach.iconName) : <Lock className="w-5 h-5 opacity-60" />}
              </div>

              {/* Achievement meta data */}
              <div className="flex-1 min-w-0 pr-4">
                <h4
                  className={`
                    text-sm font-bold tracking-wide truncate
                    ${ach.unlocked ? 'text-white' : 'text-slate-400'}
                  `}
                >
                  {ach.title}
                </h4>
                <p className="text-xs text-slate-400 mt-1 leading-normal line-clamp-2">
                  {ach.description}
                </p>

                {/* completion progress bar indicators */}
                <div className="mt-3">
                  <div className="flex items-center justify-between text-[10px] font-bold text-slate-450 mb-1">
                    <span className="uppercase text-[9px] tracking-wider text-slate-500">Progress</span>
                    <span>
                      {current} / {target} ({pct}%)
                    </span>
                  </div>
                  <div className="w-full bg-slate-950/60 rounded-full h-1.5 overflow-hidden border border-slate-900">
                    <div
                      className={`
                        h-full rounded-full transition-all duration-300
                        ${ach.unlocked ? 'bg-gradient-to-r from-amber-400 to-orange-400' : 'bg-slate-850'}
                      `}
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>

                {/* Unlocked date badge */}
                {ach.unlocked && ach.unlockedAt && (
                  <p className="text-[9px] text-slate-500 tracking-wider mt-2">
                    Unlocked: {new Date(ach.unlockedAt).toLocaleDateString()} at{' '}
                    {new Date(ach.unlockedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </p>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
