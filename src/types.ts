/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface GameStats {
  totalPops: number;
  totalSmashes: number;
  totalSpins: number; // Swipe counts
  totalRageClicks: number;
  bestBubbleCombo: number;
  highestRpm: number;
  longestSpinSeconds: number;
}

export interface Achievement {
  id: string;
  title: string;
  description: string;
  iconName: 'Sparkles' | 'Flame' | 'Hammer' | 'RotateCw' | 'Volume2' | 'Award' | 'Zap' | 'TrendingUp';
  category: 'bubble' | 'smash' | 'spinner' | 'rage' | 'general';
  targetField: keyof GameStats;
  targetValue: number;
  unlocked: boolean;
  unlockedAt: number | null;
}

export interface SoundSettings {
  volume: number; // 0.0 to 1.0
  muted: boolean;
}
