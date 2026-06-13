/**
 * PopLab Master Client Script - High-Performance Stress Relief Suite
 * Pure HTML5, CSS3, and Vanilla JavaScript with Web Audio API.
 * No React, No TypeScript, No compile steps. Run directly in any browser.
 */

// ============================================================================
// 1. GAME DATA & CONFIGURATIONS
// ============================================================================

const DEFAULT_STATS = {
  totalPops: 0,
  totalSmashes: 0,
  totalSpins: 0,
  totalRageClicks: 0,
  bestBubbleCombo: 0,
  highestRpm: 0,
  longestSpinSeconds: 0,
};

const INITIAL_ACHIEVEMENTS = [
  {
    id: 'first_pop',
    title: 'First Pop',
    description: 'Pop your very first bubble wrap bubble. Satisfying!',
    iconName: 'sparkles',
    category: 'bubble',
    targetField: 'totalPops',
    targetValue: 1,
    unlocked: false,
    unlockedAt: null,
  },
  {
    id: '100_pops',
    title: 'Bubble Enthusiast',
    description: 'Pop 100 bubbles. Feeling relaxed already.',
    iconName: 'award',
    category: 'bubble',
    targetField: 'totalPops',
    targetValue: 100,
    unlocked: false,
    unlockedAt: null,
  },
  {
    id: '1000_pops',
    title: 'Bubble Legend',
    description: 'Pop 1,000 bubbles. Absolute sensory perfection.',
    iconName: 'zap',
    category: 'bubble',
    targetField: 'totalPops',
    targetValue: 1000,
    unlocked: false,
    unlockedAt: null,
  },
  {
    id: 'first_smash',
    title: 'First Smash',
    description: 'Smash your first item in the destruction lab!',
    iconName: 'hammer',
    category: 'smash',
    targetField: 'totalSmashes',
    targetValue: 1,
    unlocked: false,
    unlockedAt: null,
  },
  {
    id: '100_smashes',
    title: 'Smash Master',
    description: 'Demolish 100 items. Ultimate stress venting complete.',
    iconName: 'flame',
    category: 'smash',
    targetField: 'totalSmashes',
    targetValue: 100,
    unlocked: false,
    unlockedAt: null,
  },
  {
    id: 'first_spin',
    title: 'First Spin',
    description: 'Swipe to rotate a modular fidget spinner.',
    iconName: 'rotate-cw',
    category: 'spinner',
    targetField: 'totalSpins',
    targetValue: 1,
    unlocked: false,
    unlockedAt: null,
  },
  {
    id: '50_spins',
    title: 'Master Spinner',
    description: 'Spin 50 times. Inertia is your best companion.',
    iconName: 'trending-up',
    category: 'spinner',
    targetField: 'totalSpins',
    targetValue: 50,
    unlocked: false,
    unlockedAt: null,
  },
  {
    id: 'rages_1',
    title: 'Furious Tap',
    description: 'Hit the rage button once to vent custom energy.',
    iconName: 'zap',
    category: 'rage',
    targetField: 'totalRageClicks',
    targetValue: 1,
    unlocked: false,
    unlockedAt: null,
  },
  {
    id: 'rages_100',
    title: 'Rage Monster',
    description: 'Hit the rage button 100 times. Getting warm...',
    iconName: 'flame',
    category: 'rage',
    targetField: 'totalRageClicks',
    targetValue: 100,
    unlocked: false,
    unlockedAt: null,
  },
  {
    id: 'rages_1000',
    title: 'Super Saiyan Tap',
    description: '1,000 rage clicks! Total combustion unlocked.',
    iconName: 'volume-2',
    category: 'rage',
    targetField: 'totalRageClicks',
    targetValue: 1000,
    unlocked: false,
    unlockedAt: null,
  },
  {
    id: 'rages_5000',
    title: 'Zen Ascension',
    description: 'Pressed 5,000 times. You have found ultimate inner peace.',
    iconName: 'sparkles',
    category: 'rage',
    targetField: 'totalRageClicks',
    targetValue: 5000,
    unlocked: false,
    unlockedAt: null,
  }
];

const SMASH_OBJECTS = [
  {
    id: 'glass',
    name: 'Tempered Glass Pane',
    maxHp: 100,
    hp: 100,
    color: '#93c5fd',
    shatterType: 'glass',
    particleColors: ['#e2e8f0', '#93c5fd', '#3b82f6', '#cbd5e1'],
  },
  {
    id: 'brick',
    name: 'Structural Red Brick',
    maxHp: 180,
    hp: 180,
    color: '#ef4444',
    shatterType: 'brick',
    particleColors: ['#7c2d12', '#b91c1c', '#f87171', '#ea580c'],
  },
  {
    id: 'plate',
    name: 'Porcelain Dinner Plate',
    maxHp: 80,
    hp: 80,
    color: '#f8fafc',
    shatterType: 'plate',
    particleColors: ['#ffffff', '#e2e8f0', '#cbd5e1', '#f1f5f9'],
  },
  {
    id: 'box',
    name: 'Heavy Cardboard Box',
    maxHp: 130,
    hp: 130,
    color: '#d97706',
    shatterType: 'box',
    particleColors: ['#78350f', '#b45309', '#f59e0b', '#d97706'],
  },
  {
    id: 'watermelon',
    name: 'Ripe Juicy Watermelon',
    maxHp: 150,
    hp: 150,
    color: '#22c55e',
    shatterType: 'watermelon',
    particleColors: ['#ef4444', '#f1f5f9', '#22c55e', '#b91c1c', '#15803d'],
  },
];

const SPIN_DESIGNS = [
  {
    id: 'gold',
    name: 'Classic Gold Standard',
    color: '#fbbf24',
    desc: 'Pure polished brass with premium weighted steel bearings.',
    weightMultiplier: 1.0,
  },
  {
    id: 'neon',
    name: 'Cyber Neon Orbit',
    color: '#06b6d4',
    desc: 'Futuristic ultraviolet light guides with minimal air airlocks.',
    weightMultiplier: 0.8,
  },
  {
    id: 'titanium',
    name: 'Titanium Tri-Wing',
    color: '#94a3b8',
    desc: 'Tactical sandblasted grade-5 titanium. Heavy inertia.',
    weightMultiplier: 1.35,
  },
  {
    id: 'void',
    name: 'Void Dual-Blade vortex',
    color: '#ec4899',
    desc: 'Aerodynamic carbon dual-blade with swirling effects.',
    weightMultiplier: 0.9,
  }
];

// ============================================================================
// 2. STAGE GLOBAL MANAGEMENT
// ============================================================================

let stats = { ...DEFAULT_STATS };
let achievements = INITIAL_ACHIEVEMENTS.map(ach => ({ ...ach }));
let soundConfig = { volume: 0.5, muted: false };
let currentTab = 'home';

// Initial startup loads
function loadLocalStorage() {
  try {
    const savedStats = localStorage.getItem('poplab_stats');
    if (savedStats) {
      stats = { ...DEFAULT_STATS, ...JSON.parse(savedStats) };
    }

    const savedSound = localStorage.getItem('poplab_sound');
    if (savedSound) {
      soundConfig = JSON.parse(savedSound);
      const volumeInput = document.getElementById('volume-slider');
      if (volumeInput) volumeInput.value = soundConfig.volume;
      audioEngine.setVolume(soundConfig.volume);
      audioEngine.setMute(soundConfig.muted);
    }

    const savedAchievements = localStorage.getItem('poplab_achievements');
    if (savedAchievements) {
      const parsed = JSON.parse(savedAchievements);
      achievements = achievements.map(original => {
        const match = parsed.find(item => item.id === original.id);
        if (match) {
          return {
            ...original,
            unlocked: match.unlocked,
            unlockedAt: match.unlockedAt
          };
        }
        return original;
      });
    }
  } catch (e) {
    console.error('Error loading LocalStorage state in PopLab:', e);
  }
}

function updateStatKey(key, value) {
  stats[key] = value;
  localStorage.setItem('poplab_stats', JSON.stringify(stats));
  
  // Real-time synchronization check on stats increments
  checkAchievementsUnlock(stats);
  syncStatsUI();
}

function checkAchievementsUnlock(currStats) {
  let changed = false;
  achievements = achievements.map(ach => {
    if (ach.unlocked) return ach;
    
    const value = currStats[ach.targetField] || 0;
    if (value >= ach.targetValue) {
      changed = true;
      triggerAchievementToast(`🏆 Achievement: ${ach.title}`, ach.description);
      return {
        ...ach,
        unlocked: true,
        unlockedAt: Date.now()
      };
    }
    return ach;
  });

  if (changed) {
    localStorage.setItem('poplab_achievements', JSON.stringify(achievements));
    syncAchievementsCount();
  }
}

// Global Sync statistics counters display across Lobbies
function syncStatsUI() {
  const popsText = document.getElementById('stat-pops');
  const smashesText = document.getElementById('stat-smashes');
  const spinsText = document.getElementById('stat-spins');
  const rageText = document.getElementById('stat-rage');

  if (popsText) popsText.textContent = stats.totalPops;
  if (smashesText) smashesText.textContent = stats.totalSmashes;
  if (spinsText) spinsText.textContent = stats.totalSpins;
  if (rageText) rageText.textContent = stats.totalRageClicks;

  // Sync sub game panels numerical counts
  const bubbleCountField = document.getElementById('bubble-count-field');
  if (bubbleCountField) bubbleCountField.textContent = stats.totalPops;

  const smashCountField = document.getElementById('smash-count-field');
  if (smashCountField) smashCountField.textContent = stats.totalSmashes;

  const spinsCountField = document.getElementById('spinner-spins-field');
  if (spinsCountField) spinsCountField.textContent = stats.totalSpins;

  const rageClicksField = document.getElementById('rage-clicks-field');
  if (rageClicksField) rageClicksField.textContent = stats.totalRageClicks;
}

function syncAchievementsCount() {
  const count = achievements.filter(a => a.unlocked).length;
  const badge = document.getElementById('achievement-badge');
  if (badge) {
    if (count > 0) {
      badge.textContent = count;
      badge.classList.remove('hidden');
    } else {
      badge.classList.add('hidden');
    }
  }
}

// ============================================================================
// 3. SATISFYING TOASTS NOTIFICATIONS
// ============================================================================

function triggerAchievementToast(title, desc) {
  audioEngine.playChime();
  const container = document.getElementById('notifications-container');
  if (!container) return;

  const toast = document.createElement('div');
  toast.className = 'pointer-events-auto bg-slate-900/90 backdrop-blur-md border border-amber-500/40 px-4 py-3 rounded-2xl shadow-[0_8px_32px_rgba(245,158,11,0.2)] flex items-start space-x-3 text-left animate-slide-down transform transition-all duration-300';
  
  toast.innerHTML = `
    <div class="p-2 bg-amber-500/15 rounded-xl border border-amber-500/25 text-amber-400">
      <i data-lucide="award" class="w-5 h-5"></i>
    </div>
    <div class="flex-1 min-w-0">
      <h4 class="text-white text-xs font-black tracking-wide uppercase">${title}</h4>
      <p class="text-[11px] text-slate-350 mt-1 leading-normal">${desc}</p>
    </div>
  `;

  container.appendChild(toast);
  lucide.createIcons();

  // Slide down entry and auto vanish loop
  setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transform = 'translateY(-15px) scale(0.95)';
    setTimeout(() => toast.remove(), 350);
  }, 4200);
}

// ============================================================================
// 4. MUSIC/SOUND SYNTHESIS MODULE (Web Audio API)
// ============================================================================

class AudioEngine {
  constructor() {
    this.ctx = null;
    this.masterVolume = 0.5;
    this.isMuted = false;
    
    this.humOsc = null;
    this.humGain = null;
    this.humFilter = null;
  }

  initContext() {
    if (!this.ctx) {
      const AudioContextClass = window.AudioContext || window.webkitAudioContext;
      if (AudioContextClass) {
        this.ctx = new AudioContextClass();
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  setMute(muted) {
    this.isMuted = muted;
    // Update top nav visual icon
    const muteBtn = document.getElementById('mute-btn');
    if (muteBtn) {
      muteBtn.innerHTML = this.isMuted 
        ? `<i data-lucide="volume-x" class="w-4 h-4 text-red-400"></i>` 
        : `<i data-lucide="volume-2" class="w-4 h-4 text-emerald-400"></i>`;
      lucide.createIcons();
    }
    if (this.ctx) {
      this.updateHumVolume(0);
    }
    localStorage.setItem('poplab_sound', JSON.stringify({ volume: this.masterVolume, muted: this.isMuted }));
  }

  setVolume(volume) {
    this.masterVolume = Math.max(0, Math.min(1, parseFloat(volume)));
    localStorage.setItem('poplab_sound', JSON.stringify({ volume: this.masterVolume, muted: this.isMuted }));
  }

  getEffectiveGain() {
    return this.isMuted ? 0 : this.masterVolume;
  }

  createNoiseBuffer() {
    if (!this.ctx) return null;
    const bufferSize = this.ctx.sampleRate * 1.5;
    const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = Math.random() * 2 - 1;
    }
    return buffer;
  }

  playPop(pitchModifier = 1.0) {
    this.initContext();
    if (!this.ctx) return;
    const volume = this.getEffectiveGain();
    if (volume <= 0) return;

    const now = this.ctx.currentTime;
    const out = this.ctx.createGain();
    out.gain.setValueAtTime(volume * 0.7, now);
    out.gain.exponentialRampToValueAtTime(0.0001, now + 0.08);
    out.connect(this.ctx.destination);

    // Sine Sweep click
    const osc = this.ctx.createOscillator();
    osc.type = 'sine';
    const startFreq = (900 + Math.random() * 200) * pitchModifier;
    const endFreq = (180 + Math.random() * 40) * pitchModifier;
    osc.frequency.setValueAtTime(startFreq, now);
    osc.frequency.exponentialRampToValueAtTime(endFreq, now + 0.04);
    osc.connect(out);

    // Highpass Click burst snap
    const clickGain = this.ctx.createGain();
    clickGain.gain.setValueAtTime(0.4, now);
    clickGain.gain.exponentialRampToValueAtTime(0.0001, now + 0.015);

    const filter = this.ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.setValueAtTime(4500, now);
    filter.Q.setValueAtTime(5, now);

    const noiseSource = this.ctx.createBufferSource();
    const noiseBuf = this.createNoiseBuffer();
    if (noiseBuf) {
      noiseSource.buffer = noiseBuf;
      noiseSource.connect(filter);
      filter.connect(clickGain);
      clickGain.connect(out);
      noiseSource.start(now);
      noiseSource.stop(now + 0.02);
    }

    osc.start(now);
    osc.stop(now + 0.1);
  }

  playShatterGlass() {
    this.initContext();
    if (!this.ctx) return;
    const volume = this.getEffectiveGain();
    if (volume <= 0) return;

    const now = this.ctx.currentTime;
    const duration = 0.5;

    const masterOut = this.ctx.createGain();
    masterOut.gain.setValueAtTime(volume * 0.8, now);
    masterOut.gain.exponentialRampToValueAtTime(0.0001, now + duration);
    masterOut.connect(this.ctx.destination);

    // Bottom Thud impact
    const baseOsc = this.ctx.createOscillator();
    baseOsc.type = 'triangle';
    baseOsc.frequency.setValueAtTime(120, now);
    baseOsc.frequency.linearRampToValueAtTime(40, now + 0.08);
    baseOsc.connect(masterOut);
    baseOsc.start(now);
    baseOsc.stop(now + 0.08);

    // High pitched crystal shards
    const ringFreqs = [1400, 2100, 3200, 4800];
    ringFreqs.forEach((freq, idx) => {
      const ringOsc = this.ctx.createOscillator();
      ringOsc.type = 'sine';
      ringOsc.frequency.setValueAtTime(freq + Math.random() * 100, now);
      
      const ringGain = this.ctx.createGain();
      ringGain.gain.setValueAtTime(0.2, now);
      const ringDecay = 0.15 + idx * 0.08;
      ringGain.gain.exponentialRampToValueAtTime(0.0001, now + ringDecay);

      ringOsc.connect(ringGain);
      ringGain.connect(masterOut);

      ringOsc.start(now);
      ringOsc.stop(now + ringDecay + 0.02);
    });

    // Glass friction snap buffer
    const noise = this.ctx.createBufferSource();
    const noiseBuf = this.createNoiseBuffer();
    if (noiseBuf) {
      noise.buffer = noiseBuf;
      const bFilter = this.ctx.createBiquadFilter();
      bFilter.type = 'highpass';
      bFilter.frequency.setValueAtTime(2000, now);

      const noiseGain = this.ctx.createGain();
      noiseGain.gain.setValueAtTime(0.4, now);
      noiseGain.gain.exponentialRampToValueAtTime(0.0001, now + 0.25);

      noise.connect(bFilter);
      bFilter.connect(noiseGain);
      noiseGain.connect(masterOut);

      noise.start(now);
      noise.stop(now + 0.3);
    }
  }

  playShatterBrick() {
    this.initContext();
    if (!this.ctx) return;
    const volume = this.getEffectiveGain();
    if (volume <= 0) return;

    const now = this.ctx.currentTime;
    const duration = 0.4;

    const masterOut = this.ctx.createGain();
    masterOut.gain.setValueAtTime(volume * 0.9, now);
    masterOut.gain.exponentialRampToValueAtTime(0.0001, now + duration);
    masterOut.connect(this.ctx.destination);

    // Heavy bass drop
    const thud = this.ctx.createOscillator();
    thud.type = 'triangle';
    thud.frequency.setValueAtTime(100, now);
    thud.frequency.exponentialRampToValueAtTime(30, now + 0.15);
    thud.connect(masterOut);
    thud.start(now);
    thud.stop(now + 0.2);

    // Gritty low crunch friction
    const crunch = this.ctx.createBufferSource();
    const cBuf = this.createNoiseBuffer();
    if (cBuf) {
      crunch.buffer = cBuf;
      const lp = this.ctx.createBiquadFilter();
      lp.type = 'bandpass';
      lp.frequency.setValueAtTime(350, now);
      lp.Q.setValueAtTime(3, now);

      const crunchGain = this.ctx.createGain();
      crunchGain.gain.setValueAtTime(0.6, now);
      crunchGain.gain.exponentialRampToValueAtTime(0.0001, now + 0.25);

      crunch.connect(lp);
      lp.connect(crunchGain);
      crunchGain.connect(masterOut);

      crunch.start(now);
      crunch.stop(now + 0.25);
    }
  }

  playShatterPlate() {
    this.initContext();
    if (!this.ctx) return;
    const volume = this.getEffectiveGain();
    if (volume <= 0) return;

    const now = this.ctx.currentTime;
    const duration = 0.6;

    const masterOut = this.ctx.createGain();
    masterOut.gain.setValueAtTime(volume * 0.8, now);
    masterOut.gain.exponentialRampToValueAtTime(0.0001, now + duration);
    masterOut.connect(this.ctx.destination);

    // High velocity clink impact
    const click = this.ctx.createOscillator();
    click.type = 'triangle';
    click.frequency.setValueAtTime(400, now);
    click.frequency.linearRampToValueAtTime(80, now + 0.05);
    click.connect(masterOut);
    click.start(now);
    click.stop(now + 0.06);

    const plateRings = [980, 1650, 2400];
    plateRings.forEach((freq, idx) => {
      const osc = this.ctx.createOscillator();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq + Math.random() * 40, now);

      const rGain = this.ctx.createGain();
      rGain.gain.setValueAtTime(0.25, now);
      const ringDuration = 0.25 + idx * 0.12;
      rGain.gain.exponentialRampToValueAtTime(0.0001, now + ringDuration);

      osc.connect(rGain);
      rGain.connect(masterOut);

      osc.start(now);
      osc.stop(now + ringDuration + 0.05);
    });

    const ringNoise = this.ctx.createBufferSource();
    const noiseBuf = this.createNoiseBuffer();
    if (noiseBuf) {
      ringNoise.buffer = noiseBuf;
      const bp = this.ctx.createBiquadFilter();
      bp.type = 'bandpass';
      bp.frequency.setValueAtTime(1800, now);
      bp.Q.setValueAtTime(8, now);

      const bpGain = this.ctx.createGain();
      bpGain.gain.setValueAtTime(0.3, now);
      bpGain.gain.exponentialRampToValueAtTime(0.0001, now + 0.15);

      ringNoise.connect(bp);
      bp.connect(bpGain);
      bpGain.connect(masterOut);

      ringNoise.start(now);
      ringNoise.stop(now + 0.2);
    }
  }

  playShatterBox() {
    this.initContext();
    if (!this.ctx) return;
    const volume = this.getEffectiveGain();
    if (volume <= 0) return;

    const now = this.ctx.currentTime;
    const duration = 0.35;

    const masterOut = this.ctx.createGain();
    masterOut.gain.setValueAtTime(volume * 0.85, now);
    masterOut.gain.exponentialRampToValueAtTime(0.0001, now + duration);
    masterOut.connect(this.ctx.destination);

    // Dull cardboard body hit
    const knock = this.ctx.createOscillator();
    knock.type = 'triangle';
    knock.frequency.setValueAtTime(140, now);
    knock.frequency.exponentialRampToValueAtTime(50, now + 0.12);
    knock.connect(masterOut);
    knock.start(now);
    knock.stop(now + 0.15);

    const tear = this.ctx.createBufferSource();
    const noiseBuf = this.createNoiseBuffer();
    if (noiseBuf) {
      tear.buffer = noiseBuf;
      const lp = this.ctx.createBiquadFilter();
      lp.type = 'lowpass';
      lp.frequency.setValueAtTime(600, now);

      const lpGain = this.ctx.createGain();
      lpGain.gain.setValueAtTime(0.5, now);
      lpGain.gain.exponentialRampToValueAtTime(0.0001, now + 0.18);

      tear.connect(lp);
      lp.connect(lpGain);
      lpGain.connect(masterOut);

      tear.start(now);
      tear.stop(now + 0.25);
    }
  }

  playShatterWatermelon() {
    this.initContext();
    if (!this.ctx) return;
    const volume = this.getEffectiveGain();
    if (volume <= 0) return;

    const now = this.ctx.currentTime;
    const duration = 0.45;

    const masterOut = this.ctx.createGain();
    masterOut.gain.setValueAtTime(volume * 0.9, now);
    masterOut.gain.exponentialRampToValueAtTime(0.0001, now + duration);
    masterOut.connect(this.ctx.destination);

    const squish = this.ctx.createOscillator();
    squish.type = 'sine';
    squish.frequency.setValueAtTime(80, now);
    squish.frequency.exponentialRampToValueAtTime(25, now + 0.2);
    squish.connect(masterOut);
    squish.start(now);
    squish.stop(now + 0.25);

    const splash = this.ctx.createBufferSource();
    const noiseBuf = this.createNoiseBuffer();
    if (noiseBuf) {
      splash.buffer = noiseBuf;
      const sweepFilter = this.ctx.createBiquadFilter();
      sweepFilter.type = 'lowpass';
      sweepFilter.frequency.setValueAtTime(1200, now);
      sweepFilter.frequency.exponentialRampToValueAtTime(200, now + 0.18);

      const splashGain = this.ctx.createGain();
      splashGain.gain.setValueAtTime(0.55, now);
      splashGain.gain.exponentialRampToValueAtTime(0.0001, now + 0.22);

      splash.connect(sweepFilter);
      sweepFilter.connect(splashGain);
      splashGain.connect(masterOut);

      splash.start(now);
      splash.stop(now + 0.3);
    }
  }

  startSpinnerHum() {
    this.initContext();
    if (!this.ctx) return;

    const now = this.ctx.currentTime;
    if (!this.humOsc) {
      this.humOsc = this.ctx.createOscillator();
      this.humOsc.type = 'triangle';
      this.humOsc.frequency.setValueAtTime(50, now);

      this.humFilter = this.ctx.createBiquadFilter();
      this.humFilter.type = 'lowpass';
      this.humFilter.frequency.setValueAtTime(150, now);

      this.humGain = this.ctx.createGain();
      this.humGain.gain.setValueAtTime(0, now);

      this.humOsc.connect(this.humFilter);
      this.humFilter.connect(this.humGain);
      this.humGain.connect(this.ctx.destination);

      this.humOsc.start(now);
    }
  }

  updateHumVolume(rpm) {
    if (!this.ctx || !this.humOsc || !this.humGain || !this.humFilter) return;
    const now = this.ctx.currentTime;
    const volume = this.getEffectiveGain();

    if (rpm <= 5 || volume <= 0) {
      this.humGain.gain.setTargetAtTime(0, now, 0.1);
      return;
    }

    const normalizedRpm = Math.min(rpm / 1500, 1.0);
    const targetFreq = 45 + normalizedRpm * 150;
    const targetGain = volume * (0.05 + normalizedRpm * 0.25);
    const targetCutoff = 100 + normalizedRpm * 350;

    this.humOsc.frequency.setTargetAtTime(targetFreq, now, 0.08);
    this.humFilter.frequency.setTargetAtTime(targetCutoff, now, 0.08);
    this.humGain.gain.setTargetAtTime(targetGain, now, 0.06);
  }

  stopSpinnerHum() {
    if (this.humOsc) {
      try {
        this.humOsc.stop();
        this.humOsc.disconnect();
      } catch (e) {}
      this.humOsc = null;
    }
    if (this.humGain) {
      try { this.humGain.disconnect(); } catch (e) {}
      this.humGain = null;
    }
    if (this.humFilter) {
      try { this.humFilter.disconnect(); } catch (e) {}
      this.humFilter = null;
    }
  }

  playRageStrike(clicksCount = 0) {
    this.initContext();
    if (!this.ctx) return;
    const volume = this.getEffectiveGain();
    if (volume <= 0) return;

    const now = this.ctx.currentTime;
    const duration = 0.25;

    const density = Math.min(clicksCount / 20, 1.0);
    const scale = 1.0 + density * 0.4;

    const masterOut = this.ctx.createGain();
    masterOut.gain.setValueAtTime(volume * 0.8 * scale, now);
    masterOut.gain.exponentialRampToValueAtTime(0.0001, now + duration);
    masterOut.connect(this.ctx.destination);

    // Sawtooth drops
    const punch = this.ctx.createOscillator();
    punch.type = 'sawtooth';
    const baseFreq = 95 - density * 15;
    punch.frequency.setValueAtTime(baseFreq * 2, now);
    punch.frequency.exponentialRampToValueAtTime(30, now + 0.15);
    punch.connect(masterOut);
    punch.start(now);
    punch.stop(now + 0.2);

    // Sparks sizzle noise
    const sparks = this.ctx.createBufferSource();
    const noiseBuf = this.createNoiseBuffer();
    if (noiseBuf) {
      sparks.buffer = noiseBuf;
      const hp = this.ctx.createBiquadFilter();
      hp.type = 'highpass';
      hp.frequency.setValueAtTime(1500 - density * 500, now);

      const sparksGain = this.ctx.createGain();
      sparksGain.gain.setValueAtTime(0.3 * scale, now);
      sparksGain.gain.exponentialRampToValueAtTime(0.0001, now + 0.08);

      sparks.connect(hp);
      hp.connect(sparksGain);
      sparksGain.connect(masterOut);

      sparks.start(now);
      sparks.stop(now + 0.1);
    }
  }

  playExplosion() {
    this.initContext();
    if (!this.ctx) return;
    const volume = this.getEffectiveGain();
    if (volume <= 0) return;

    const now = this.ctx.currentTime;
    const duration = 1.5;

    const master = this.ctx.createGain();
    master.gain.setValueAtTime(volume * 1.5, now);
    master.gain.exponentialRampToValueAtTime(0.0001, now + duration);
    master.connect(this.ctx.destination);

    // Heavy low rumble boom
    const boom = this.ctx.createOscillator();
    boom.type = 'triangle';
    boom.frequency.setValueAtTime(130, now);
    boom.frequency.linearRampToValueAtTime(20, now + 0.4);
    boom.connect(master);
    boom.start(now);
    boom.stop(now + 0.5);

    // Deep roar crackle noise
    const roar = this.ctx.createBufferSource();
    const noiseBuf = this.createNoiseBuffer();
    if (noiseBuf) {
      roar.buffer = noiseBuf;
      const lp = this.ctx.createBiquadFilter();
      lp.type = 'lowpass';
      lp.frequency.setValueAtTime(250, now);

      const roarGain = this.ctx.createGain();
      roarGain.gain.setValueAtTime(0.9, now);
      roarGain.gain.exponentialRampToValueAtTime(0.0001, now + 0.8);

      roar.connect(lp);
      lp.connect(roarGain);
      roarGain.connect(master);

      roar.start(now);
      roar.stop(now + 1.0);
    }

    // High crackling debris fallout
    const dust = this.ctx.createBufferSource();
    if (noiseBuf) {
      dust.buffer = noiseBuf;
      const hp = this.ctx.createBiquadFilter();
      hp.type = 'highpass';
      hp.frequency.setValueAtTime(4000, now);

      const dustGain = this.ctx.createGain();
      dustGain.gain.setValueAtTime(0.25, now);
      dustGain.gain.exponentialRampToValueAtTime(0.0001, now + 1.2);

      dust.connect(hp);
      hp.connect(dustGain);
      dustGain.connect(master);

      dust.start(now);
      dust.stop(now + 1.3);
    }
  }

  playChime() {
    this.initContext();
    if (!this.ctx) return;
    const volume = this.getEffectiveGain();
    if (volume <= 0) return;

    const now = this.ctx.currentTime;
    const notes = [523.25, 659.25, 783.99, 1046.50]; // Arpeggio C arpeggiations
    const delay = 0.085;

    notes.forEach((freq, idx) => {
      const startTime = now + idx * delay;
      
      const osc = this.ctx.createOscillator();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, startTime);

      const oscGain = this.ctx.createGain();
      oscGain.gain.setValueAtTime(volume * 0.35, startTime);
      oscGain.gain.exponentialRampToValueAtTime(0.0001, startTime + 0.45);

      osc.connect(oscGain);
      oscGain.connect(this.ctx.destination);

      osc.start(startTime);
      osc.stop(startTime + 0.5);
    });
  }
}

const audioEngine = new AudioEngine();

function toggleMute() {
  soundConfig.muted = !soundConfig.muted;
  audioEngine.setMute(soundConfig.muted);
  audioEngine.playPop(1.1);
}

function changeVolume(val) {
  soundConfig.volume = parseFloat(val);
  audioEngine.setVolume(soundConfig.volume);
}

// ============================================================================
// 5. GENERAL TABS & NAVIGATION SYSTEM
// ============================================================================

function switchTab(tabId) {
  audioEngine.initContext();
  audioEngine.playPop(1.0);

  // Toggle active views
  document.querySelectorAll('.view-panel').forEach(panel => {
    panel.classList.add('hidden');
  });

  const targetPanel = document.getElementById(`view-${tabId}`);
  if (targetPanel) {
    targetPanel.classList.remove('hidden');
  }

  // Update navigation buttons styling states
  document.querySelectorAll('.nav-btn').forEach(btn => {
    btn.className = 'nav-btn flex flex-col items-center justify-center py-1 px-3.5 rounded-xl cursor-pointer transition-all text-slate-400 hover:text-white';
  });

  const activeBtn = document.getElementById(`nav-btn-${tabId}`);
  if (activeBtn) {
    const themeColor = tabId === 'home' ? 'text-rose-400' 
                     : tabId === 'bubble' ? 'text-blue-400' 
                     : tabId === 'smash' ? 'text-rose-500' 
                     : tabId === 'spinner' ? 'text-cyan-400' 
                     : 'text-pink-500';
    activeBtn.className = `nav-btn flex flex-col items-center justify-center py-1 px-3.5 rounded-xl cursor-pointer transition-all ${themeColor}`;
  }

  // Header active button states highlights
  const headerBtn = document.getElementById('header-achievements-btn');
  if (headerBtn) {
    if (tabId === 'achievements') {
      headerBtn.className = 'relative p-2.5 rounded-xl border bg-amber-500/10 border-amber-500/40 text-amber-400 transition-all cursor-pointer focus:outline-none flex items-center justify-center';
    } else {
      headerBtn.className = 'relative p-2.5 rounded-xl border bg-slate-900/40 border-slate-800/80 text-slate-400 hover:text-white transition-all cursor-pointer focus:outline-none flex items-center justify-center';
    }
  }

  currentTab = tabId;

  // Active view init handlers
  if (tabId === 'bubble') {
    initBubbleGame();
  } else if (tabId === 'smash') {
    initSmashGame();
  } else if (tabId === 'spinner') {
    initSpinnerGame();
  } else if (tabId === 'rage') {
    initRageGame();
  } else if (tabId === 'achievements') {
    renderAchievements();
  }
}

function startApp() {
  switchTab('bubble');
}

// ============================================================================
// 6. STAGE #1: BUBBLE WRAP POPPER GAME ENGINE
// ============================================================================

let bubbleRows = 8;
let bubbleCols = 6;
let bubbleMatrix = [];
let bubbleCombo = 0;
let bubbleComboTimer = null;

let bubbleCanvas = null;
let bubbleCtx = null;
let bubbleParticles = [];
let bubbleRings = [];
let bubbleParticleId = 0;
let bubbleAnimFrame = null;

function initBubbleGame() {
  bubbleCanvas = document.getElementById('bubble-canvas');
  if (bubbleCanvas) {
    bubbleCtx = bubbleCanvas.getContext('2d');
    resizeBubbleCanvas();
  }

  // Adjust cols/rows based on screen size
  if (window.innerWidth < 480) {
    bubbleCols = 5;
    bubbleRows = 7;
  } else if (window.innerWidth < 768) {
    bubbleCols = 6;
    bubbleRows = 8;
  } else {
    bubbleCols = 8;
    bubbleRows = 10;
  }

  newBubbleSheet(false);
  startBubblePhysicsLoop();
}

function resizeBubbleCanvas() {
  const container = document.getElementById('bubble-workspace');
  if (bubbleCanvas && container) {
    bubbleCanvas.width = container.clientWidth;
    bubbleCanvas.height = container.clientHeight;
  }
}

window.addEventListener('resize', () => {
  if (currentTab === 'bubble') {
    resizeBubbleCanvas();
  }
});

function newBubbleSheet(triggerBurst = true) {
  bubbleMatrix = new Array(bubbleRows * bubbleCols).fill(false);
  bubbleCombo = 0;

  // Render Grid elements
  const gridContainer = document.getElementById('bubble-grid');
  if (!gridContainer) return;

  gridContainer.innerHTML = '';
  gridContainer.style.gridTemplateColumns = `repeat(${bubbleCols}, minmax(0, 1fr))`;
  gridContainer.style.aspectRatio = `${bubbleCols} / ${bubbleRows}`;
  gridContainer.style.width = '100%';

  bubbleMatrix.forEach((popped, idx) => {
    const bubbleBtn = document.createElement('button');
    bubbleBtn.id = `bubble-wrap-cell-${idx}`;
    bubbleBtn.className = 'relative rounded-full aspect-square w-full shadow-md select-none touch-none cursor-pointer outline-none transition-all duration-150 bg-gradient-to-b from-blue-400/30 to-blue-600/10 border-2 border-blue-400/40 hover:border-blue-400/70 shadow-[0_4px_12px_rgba(59,130,246,0.25)] hover:scale-102 hover:shadow-[0_6px_16px_rgba(59,130,246,0.4)] active:scale-95';
    bubbleBtn.style.backgroundImage = 'radial-gradient(circle at 30% 30%, rgba(255, 255, 255, 0.4) 0%, rgba(255, 255, 255, 0) 65%)';
    
    bubbleBtn.innerHTML = `<div class="bubble-reflection absolute top-[20%] left-[20%] w-[25%] h-[25%] bg-white rounded-full opacity-35 blur-[0.6px]"></div>`;
    
    const clickHandler = (e) => {
      e.stopPropagation();
      popBubbleAt(idx, e);
    };

    bubbleBtn.addEventListener('mousedown', clickHandler);
    bubbleBtn.addEventListener('touchstart', clickHandler);

    gridContainer.appendChild(bubbleBtn);
  });

  const bestComboText = document.getElementById('bubble-best-combo-text');
  if (bestComboText) bestComboText.textContent = `${stats.bestBubbleCombo || 0} pops`;

  updateBubbleRemainingMsg();

  if (triggerBurst && bubbleCanvas) {
    createBubbleBurst(bubbleCanvas.width / 2, bubbleCanvas.height / 2, '#4ade80');
  }
}

function popBubbleAt(index, e) {
  if (bubbleMatrix[index]) return;

  audioEngine.initContext();
  if (e.cancelable) e.preventDefault();

  bubbleMatrix[index] = true;

  // Toggle button styling
  const btn = document.getElementById(`bubble-wrap-cell-${index}`);
  if (btn) {
    btn.className = 'relative rounded-full aspect-square w-full shadow-md select-none touch-none cursor-pointer outline-none transition-all duration-150 bg-slate-900 border border-slate-800/40 inner-shadow-popped scale-95 opacity-55';
    btn.style.backgroundImage = 'none';
    const reflection = btn.querySelector('.bubble-reflection');
    if (reflection) reflection.remove();
  }

  // Coordinate click tracking
  let clientX = 0, clientY = 0;
  if (e.touches && e.touches.length > 0) {
    clientX = e.touches[0].clientX;
    clientY = e.touches[0].clientY;
  } else {
    clientX = e.clientX;
    clientY = e.clientY;
  }

  const workspace = document.getElementById('bubble-workspace');
  let x = bubbleCanvas.width / 2;
  let y = bubbleCanvas.height / 2;
  if (workspace) {
    const rect = workspace.getBoundingClientRect();
    x = clientX - rect.left;
    y = clientY - rect.top;
  }

  // Combo multiplier tracking
  bubbleCombo++;
  const comboWrapper = document.getElementById('bubble-combo-wrapper');
  const comboText = document.getElementById('bubble-combo-text');
  if (bubbleCombo > 1) {
    if (comboWrapper) comboWrapper.classList.remove('hidden');
    if (comboText) comboText.textContent = `${bubbleCombo}X COMBO`;
  }

  if (bubbleComboTimer) clearTimeout(bubbleComboTimer);
  bubbleComboTimer = setTimeout(() => {
    bubbleCombo = 0;
    if (comboWrapper) comboWrapper.classList.add('hidden');
  }, 1200);

  if (bubbleCombo > stats.bestBubbleCombo) {
    stats.bestBubbleCombo = bubbleCombo;
    localStorage.setItem('poplab_stats', JSON.stringify(stats));
    const bestComboText = document.getElementById('bubble-best-combo-text');
    if (bestComboText) bestComboText.textContent = `${bubbleCombo} pops`;
  }

  const pitch = 0.85 + Math.min(bubbleCombo * 0.05, 0.8);
  audioEngine.playPop(pitch);

  if (navigator.vibrate) navigator.vibrate(10);

  // Splash particle rings
  const colors = ['#60a5fa', '#34d399', '#f472b6', '#fbbf24', '#a78bfa', '#2dd4bf'];
  const burstColor = colors[index % colors.length];
  createBubbleBurst(x, y, burstColor);

  // Save Stats increment
  const updatedPops = stats.totalPops + 1;
  updateStatKey('totalPops', updatedPops);

  updateBubbleRemainingMsg();

  // Entire sheet completion state
  const isSheetFinished = bubbleMatrix.every(b => b === true);
  if (isSheetFinished) {
    setTimeout(() => {
      triggerAchievementToast('🎉 Sheet Complete!', 'Ready for another round of pristine plastic wraps?');
      newBubbleSheet(true);
    }, 400);
  }
}

function updateBubbleRemainingMsg() {
  const msgField = document.getElementById('bubble-instructions-msg');
  if (msgField) {
    const remaining = bubbleMatrix.filter(b => !b).length;
    msgField.textContent = `Tip: Tap or swipe over the bubbles quickly to unlock high multipliers and hear satisfying pitch modifications! Only ${remaining} bubbles remaining.`;
  }
}

function createBubbleBurst(x, y, color) {
  // Generate ring shockwave
  bubbleRings.push({
    id: bubbleParticleId++,
    x,
    y,
    radius: 5,
    maxRadius: 40 + Math.random() * 20,
    alpha: 1.0,
  });

  // Splash falling droplets
  const count = 12 + Math.floor(Math.random() * 8);
  for (let i = 0; i < count; i++) {
    const angle = Math.random() * Math.PI * 2;
    const speed = 2 + Math.random() * 4.5;
    bubbleParticles.push({
      id: bubbleParticleId++,
      x,
      y,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed - 1.5,
      color,
      size: 1.5 + Math.random() * 2.5,
      life: 25 + Math.floor(Math.random() * 20),
      maxLife: 45,
    });
  }
}

function startBubblePhysicsLoop() {
  if (bubbleAnimFrame) cancelAnimationFrame(bubbleAnimFrame);

  const loop = () => {
    if (currentTab !== 'bubble' || !bubbleCtx || !bubbleCanvas) return;

    bubbleCtx.clearRect(0, 0, bubbleCanvas.width, bubbleCanvas.height);

    // Update Rings
    bubbleRings = bubbleRings.filter(ring => {
      ring.radius += (ring.maxRadius - ring.radius) * 0.15;
      ring.alpha -= 0.05;
      if (ring.alpha <= 0) return false;

      bubbleCtx.strokeStyle = `rgba(147, 197, 253, ${ring.alpha})`;
      bubbleCtx.lineWidth = 2.5;
      bubbleCtx.beginPath();
      bubbleCtx.arc(ring.x, ring.y, ring.radius, 0, Math.PI * 2);
      bubbleCtx.stroke();
      return true;
    });

    // Update Particles
    bubbleParticles = bubbleParticles.filter(p => {
      p.x += p.vx;
      p.y += p.vy;
      p.vy += 0.22; // gravity fall
      p.life--;
      const alpha = Math.max(0, p.life / p.maxLife);

      bubbleCtx.fillStyle = p.color;
      bubbleCtx.globalAlpha = alpha;
      bubbleCtx.beginPath();
      bubbleCtx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
      bubbleCtx.fill();
      return p.life > 0;
    });

    bubbleCtx.globalAlpha = 1.0;
    bubbleAnimFrame = requestAnimationFrame(loop);
  };

  bubbleAnimFrame = requestAnimationFrame(loop);
}

// ============================================================================
// 7. STAGE #2: DESTRUCTION SMASH LAB ENGINE
// ============================================================================

let activeSmashTool = 'hammer';
let activeObjectIdx = 0;
let objectHp = SMASH_OBJECTS[0].maxHp;
let isBroken = false;
let shakeIntensity = 0;

let smashCanvas = null;
let smashCtx = null;
let debrisParticles = [];
let structuralCracks = [];
let debrisParticleId = 0;
let smashAnimFrame = null;

const SMASH_TOOLS_SPECS = {
  hammer: { damage: 60, name: 'Sledge Hammer' },
  bat: { damage: 40, name: 'Baseball Bat' },
  fist: { damage: 20, name: 'Iron Fist' }
};

function initSmashGame() {
  smashCanvas = document.getElementById('smash-canvas');
  if (smashCanvas) {
    smashCtx = smashCanvas.getContext('2d');
    resizeSmashCanvas();
  }

  // Attach arena click handlers
  const arena = document.getElementById('smash-arena');
  if (arena) {
    // Clear previous before re-binding to prevent duplicate taps
    const newArena = arena.cloneNode(true);
    arena.parentNode.replaceChild(newArena, arena);
    
    newArena.addEventListener('mousedown', executeSmashStrike);
    newArena.addEventListener('touchstart', executeSmashStrike);
  }

  resetSmashObject(activeObjectIdx);
  startSmashPhysicsLoop();
}

function resizeSmashCanvas() {
  const arena = document.getElementById('smash-arena');
  if (smashCanvas && arena) {
    smashCanvas.width = arena.clientWidth;
    smashCanvas.height = arena.clientHeight;
  }
}

function selectSmashTool(toolId) {
  audioEngine.initContext();
  audioEngine.playPop(1.2);
  activeSmashTool = toolId;

  // Toggle active styling
  ['hammer', 'bat', 'fist'].forEach(id => {
    const btn = document.getElementById(`tool-btn-${id}`);
    if (btn) {
      if (id === toolId) {
        btn.className = 'flex items-center space-x-2 px-4 py-2 rounded-xl border transition-all cursor-pointer font-bold bg-rose-500 text-white border-rose-600 shadow-[0_4px_12px_rgba(239,68,68,0.3)] scale-102';
      } else {
        btn.className = 'flex items-center space-x-2 px-4 py-2 rounded-xl border transition-all cursor-pointer bg-slate-800/80 text-slate-300 border-slate-700/80 hover:bg-slate-700 hover:text-white';
      }
    }
  });
}

function resetSmashObject(idx) {
  activeObjectIdx = idx;
  const obj = SMASH_OBJECTS[idx];
  objectHp = obj.maxHp;
  isBroken = false;
  shakeIntensity = 0;
  structuralCracks = [];
  debrisParticles = [];

  // Update DOM HUD elements
  const targetName = document.getElementById('smash-target-name');
  if (targetName) targetName.textContent = obj.name;

  const bIndicator = document.getElementById('smash-broken-indicator');
  if (bIndicator) bIndicator.classList.add('hidden');

  const hpHud = document.getElementById('smash-hp-hud');
  if (hpHud) hpHud.classList.remove('hidden');

  updateSmashHpUI();
}

function spawnNextSmashObject() {
  const nextIdx = (activeObjectIdx + 1) % SMASH_OBJECTS.length;
  resetSmashObject(nextIdx);
}

function updateSmashHpUI() {
  const obj = SMASH_OBJECTS[activeObjectIdx];
  const bar = document.getElementById('smash-hp-bar');
  const text = document.getElementById('smash-hp-text');

  const pct = Math.max(0, Math.min(100, (objectHp / obj.maxHp) * 100));
  if (bar) bar.style.width = `${pct}%`;
  if (text) text.textContent = `HP: ${objectHp} / ${obj.maxHp}`;
}

function executeSmashStrike(e) {
  if (isBroken) return;
  audioEngine.initContext();

  if (e.cancelable) e.preventDefault();

  // 1. Obtain coordinates inside Canvas frame
  let clientX = 0, clientY = 0;
  if (e.touches && e.touches.length > 0) {
    clientX = e.touches[0].clientX;
    clientY = e.touches[0].clientY;
  } else {
    clientX = e.clientX;
    clientY = e.clientY;
  }

  const arena = document.getElementById('smash-arena');
  let localX = smashCanvas.width / 2;
  let localY = smashCanvas.height / 2;
  if (arena) {
    const rect = arena.getBoundingClientRect();
    localX = clientX - rect.left;
    localY = clientY - rect.top;
  }

  // 2. Trigger strike swinging overlay animation
  showWeaponStrikeAnim(localX, localY);

  // 3. Deduct damage points
  const spec = SMASH_TOOLS_SPECS[activeSmashTool];
  objectHp = Math.max(0, objectHp - spec.damage);

  const obj = SMASH_OBJECTS[activeObjectIdx];
  triggerHitSound(obj.shatterType);

  if (navigator.vibrate) navigator.vibrate(22);

  if (objectHp > 0) {
    // Generate structural fracture crack nodes proceedingly
    shakeIntensity = 15;
    
    const segments = [];
    let cx = localX;
    let cy = localY;
    const steps = 3 + Math.floor(Math.random() * 4);
    for (let s = 0; s < steps; s++) {
      const angle = Math.random() * Math.PI * 2;
      const len = 15 + Math.random() * 25;
      cx += Math.cos(angle) * len;
      cy += Math.sin(angle) * len;
      segments.push({ x: cx, y: cy });
    }

    structuralCracks.push({
      startX: localX,
      startY: localY,
      segments
    });

    // Spawn tiny particles dust chips
    triggerDebrisBurst(localX, localY, 5, obj.particleColors, false);
    updateSmashHpUI();
  } else {
    // MATERIAL FULLY SHATTER COMPLETE!
    isBroken = true;
    shakeIntensity = 45;

    triggerShatterSound(obj.shatterType);

    if (navigator.vibrate) navigator.vibrate([25, 12, 50]);

    // Spawn massive clusters of debris fragments
    const xCenter = smashCanvas.width / 2;
    const yCenter = smashCanvas.height / 2;
    triggerDebrisBurst(xCenter, yCenter, 30, obj.particleColors, true);

    const bIndicator = document.getElementById('smash-broken-indicator');
    if (bIndicator) bIndicator.classList.remove('hidden');

    const hpHud = document.getElementById('smash-hp-hud');
    if (hpHud) hpHud.classList.add('hidden');

    // Stats updates
    const nextSmashes = stats.totalSmashes + 1;
    updateStatKey('totalSmashes', nextSmashes);

    // Schedule next material
    setTimeout(() => {
      spawnNextSmashObject();
    }, 1500);
  }
}

function showWeaponStrikeAnim(x, y) {
  const overlay = document.getElementById('strike-helper-overlay');
  const icon = document.getElementById('strike-tool-icon');
  if (!overlay || !icon) return;

  // Swap lucide weapon icon type inline
  icon.setAttribute('data-lucide', activeSmashTool === 'hammer' ? 'hammer' : activeSmashTool === 'bat' ? 'sword' : 'hand');
  lucide.createIcons();

  overlay.style.left = `${x}px`;
  overlay.style.top = `${y}px`;
  overlay.style.transform = 'translate(-50%, -50%) rotate(-30deg) scale(1.3)';
  overlay.classList.remove('hidden');

  setTimeout(() => {
    overlay.classList.add('hidden');
  }, 150);
}

function triggerHitSound(shatterType) {
  if (shatterType === 'glass') audioEngine.playPop(1.5);
  else if (shatterType === 'brick') audioEngine.playPop(0.6);
  else if (shatterType === 'plate') audioEngine.playPop(1.2);
  else if (shatterType === 'box') audioEngine.playPop(0.85);
  else if (shatterType === 'watermelon') audioEngine.playPop(0.7);
}

function triggerShatterSound(shatterType) {
  if (shatterType === 'glass') audioEngine.playShatterGlass();
  else if (shatterType === 'brick') audioEngine.playShatterBrick();
  else if (shatterType === 'plate') audioEngine.playShatterPlate();
  else if (shatterType === 'box') audioEngine.playShatterBox();
  else if (shatterType === 'watermelon') audioEngine.playShatterWatermelon();
}

function triggerDebrisBurst(x, y, count, colors, heavy = false) {
  const obj = SMASH_OBJECTS[activeObjectIdx];

  for (let i = 0; i < count; i++) {
    const angle = Math.random() * Math.PI * 2;
    const speed = heavy ? (3 + Math.random() * 12) : (2 + Math.random() * 5);
    const pSize = heavy ? (4 + Math.random() * 14) : (2 + Math.random() * 5);
    const color = colors[Math.floor(Math.random() * colors.length)];

    let type = 'circle';
    let points = [];

    if (obj.id === 'glass') {
      type = 'shard';
      points = [
        { x: -pSize, y: Math.random() * pSize },
        { x: pSize, y: -Math.random() * pSize },
        { x: Math.random() * pSize - pSize / 2, y: pSize }
      ];
    } else if (obj.id === 'brick') {
      type = 'chunk';
    } else if (obj.id === 'watermelon') {
      type = Math.random() > 0.45 ? 'splat' : 'circle';
    }

    debrisParticles.push({
      x,
      y,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed - 2.5,
      angle: Math.random() * Math.PI,
      va: (Math.random() * 2 - 1) * 0.15,
      color,
      size: pSize,
      type,
      points,
      alpha: 1.0,
      life: 500 + Math.floor(Math.random() * 600),
      maxLife: 1100,
    });
  }
}

function startSmashPhysicsLoop() {
  if (smashAnimFrame) cancelAnimationFrame(smashAnimFrame);

  const loop = () => {
    if (currentTab !== 'smash' || !smashCtx || !smashCanvas) return;

    smashCtx.clearRect(0, 0, smashCanvas.width, smashCanvas.height);

    // Draw intact objects
    if (!isBroken) {
      smashCtx.save();
      
      let sx = 0, sy = 0;
      if (shakeIntensity > 0) {
        sx = (Math.random() * 2 - 1) * shakeIntensity;
        sy = (Math.random() * 2 - 1) * shakeIntensity;
      }
      smashCtx.translate(smashCanvas.width / 2 + sx, smashCanvas.height / 2 + sy);

      // Draw material body layers
      drawArenaTargetObject(smashCtx, SMASH_OBJECTS[activeObjectIdx].id);

      // Draw fracture paths on top
      smashCtx.strokeStyle = SMASH_OBJECTS[activeObjectIdx].id === 'glass' ? 'rgba(255, 255, 255, 0.75)' : 'rgba(0,0,0,0.4)';
      smashCtx.lineWidth = 2.5;

      structuralCracks.forEach(crack => {
        smashCtx.beginPath();
        smashCtx.moveTo(crack.startX - smashCanvas.width / 2, crack.startY - smashCanvas.height / 2);
        crack.segments.forEach(seg => {
          smashCtx.lineTo(seg.x - smashCanvas.width / 2, seg.y - smashCanvas.height / 2);
        });
        smashCtx.stroke();
      });

      smashCtx.restore();
    }

    // Physics update debris shards falloffs
    debrisParticles = debrisParticles.filter(dp => {
      dp.x += dp.vx;
      dp.y += dp.vy;
      dp.vy += 0.35; // gravity fall
      dp.angle += dp.va;
      dp.life -= 15;
      dp.alpha = Math.max(0, dp.life / dp.maxLife);

      smashCtx.save();
      smashCtx.globalAlpha = dp.alpha;
      smashCtx.translate(dp.x, dp.y);
      smashCtx.rotate(dp.angle);
      smashCtx.fillStyle = dp.color;

      if (dp.type === 'shard') {
        smashCtx.beginPath();
        if (dp.points && dp.points.length > 0) {
          smashCtx.moveTo(dp.points[0].x, dp.points[0].y);
          for (let i = 1; i < dp.points.length; i++) {
            smashCtx.lineTo(dp.points[i].x, dp.points[i].y);
          }
        }
        smashCtx.closePath();
        smashCtx.fill();
      } else if (dp.type === 'chunk') {
        smashCtx.fillRect(-dp.size, -dp.size, dp.size * 2, dp.size * 2);
      } else if (dp.type === 'splat') {
        smashCtx.beginPath();
        smashCtx.ellipse(0, 0, dp.size * 1.5, dp.size, 0, 0, Math.PI * 2);
        smashCtx.fill();
      } else {
        smashCtx.beginPath();
        smashCtx.arc(0, 0, dp.size, 0, Math.PI * 2);
        smashCtx.fill();
      }

      smashCtx.restore();
      return dp.life > 0;
    });

    if (shakeIntensity > 0) {
      shakeIntensity = Math.max(0, shakeIntensity - 0.75);
    }

    smashAnimFrame = requestAnimationFrame(loop);
  };

  smashAnimFrame = requestAnimationFrame(loop);
}

function drawArenaTargetObject(ctx, id) {
  if (id === 'glass') {
    const w = 220, h = 180;
    const grad = ctx.createLinearGradient(-w / 2, -h / 2, w / 2, h / 2);
    grad.addColorStop(0, 'rgba(147, 197, 253, 0.35)');
    grad.addColorStop(1, 'rgba(59, 130, 246, 0.15)');

    ctx.fillStyle = grad;
    ctx.strokeStyle = 'rgba(147, 197, 253, 0.7)';
    ctx.lineWidth = 3;

    ctx.beginPath();
    ctx.roundRect(-w / 2, -h / 2, w, h, 16);
    ctx.fill();
    ctx.stroke();

    // Reflections Shine
    ctx.fillStyle = 'rgba(255, 255, 255, 0.18)';
    ctx.beginPath();
    ctx.moveTo(-w / 3, -h / 2);
    ctx.lineTo(-w / 6, -h / 2);
    ctx.lineTo(-w / 2, -h / 8);
    ctx.lineTo(-w / 2, -h / 4);
    ctx.closePath();
    ctx.fill();
  } else if (id === 'brick') {
    const w = 200, h = 90;
    ctx.fillStyle = '#b91c1c';
    ctx.strokeStyle = '#7c2d12';
    ctx.lineWidth = 4;

    ctx.beginPath();
    ctx.roundRect(-w / 2, -h / 2, w, h, 6);
    ctx.fill();
    ctx.stroke();

    // Horizontal cuts joint
    ctx.fillStyle = '#7c2d12';
    ctx.fillRect(-w / 2, -10, w, 6);
    ctx.fillRect(-w / 4, -h / 2, 4, h / 2 - 10);
    ctx.fillRect(w / 4, -h / 2, 4, h / 2 - 10);
    ctx.fillRect(-w * 0.35, -5, 4, h / 2 - 1);
    ctx.fillRect(w * 0.15, -5, 4, h / 2 - 1);
  } else if (id === 'plate') {
    const rad = 95;
    const grad = ctx.createRadialGradient(0, 0, rad * 0.6, 0, 0, rad);
    grad.addColorStop(0, '#ffffff');
    grad.addColorStop(0.7, '#f1f5f9');
    grad.addColorStop(1, '#cbd5e1');

    ctx.fillStyle = grad;
    ctx.strokeStyle = '#e2e8f0';
    ctx.lineWidth = 5;

    ctx.beginPath();
    ctx.arc(0, 0, rad, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    ctx.strokeStyle = 'rgba(51, 65, 85, 0.08)';
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.arc(0, 0, rad * 0.65, 0, Math.PI * 2);
    ctx.stroke();
  } else if (id === 'box') {
    const s = 140;
    ctx.fillStyle = '#b45309';
    ctx.strokeStyle = '#78350f';
    ctx.lineWidth = 4;

    ctx.beginPath();
    ctx.roundRect(-s / 2, -s / 2, s, s, 10);
    ctx.fill();
    ctx.stroke();

    // Packing Yellow tapes
    ctx.fillStyle = '#fabf2c';
    ctx.fillRect(-s / 2, -18, s, 36);
    ctx.fillStyle = '#22252a';
    ctx.font = '8px monospace';
    ctx.fillText('FRAGILE', -22, 5);
  } else if (id === 'watermelon') {
    const rx = 110, ry = 80;
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

    // Sub rinds
    ctx.strokeStyle = 'rgba(10, 60, 20, 0.4)';
    ctx.lineWidth = 5;
    [-2, 0, 2].forEach(off => {
      ctx.beginPath();
      ctx.ellipse(off * 5, 0, rx - Math.abs(off) * 10, ry, 0, 0, Math.PI * 2);
      ctx.stroke();
    });
  }
}

// ============================================================================
// 8. STAGE #3: FIDGET SPINNER SIMULATOR PHYS ENGINE
// ============================================================================

let activeSpinnerDesign = SPIN_DESIGNS[0];
let currentRpm = 0;
let maxRpmTracker = 0;
let spinTimeTracker = 0;
let spinTimerInterval = null;

// Pure Angular physical friction attributes
let spinnerAngle = 0;
let spinnerOmega = 0; // rot velocity
let isDraggingSpinner = false;
let prevPointerAngle = 0;
let lastDragTouchTime = 0;
let isSpinningActive = false;
let spinnerAnimFrame = null;

function initSpinnerGame() {
  const designsGrid = document.getElementById('spinner-designs-grid');
  if (designsGrid) {
    designsGrid.innerHTML = '';
    SPIN_DESIGNS.forEach(design => {
      const btn = document.createElement('button');
      btn.id = `spinner-design-select-${design.id}`;
      
      const isSel = design.id === activeSpinnerDesign.id;
      btn.className = `flex flex-col text-left p-3 rounded-xl border transition-all cursor-pointer h-24 justify-between select-none ${isSel ? 'bg-slate-800 text-white shadow-md' : 'bg-slate-950/40 text-slate-400 border-slate-800/60 hover:bg-slate-900/50 hover:text-white'}`;
      btn.style.borderColor = isSel ? design.color : 'rgba(30, 41, 59, 1)';
      
      btn.innerHTML = `
        <div class="flex items-center justify-between w-full">
          <span class="text-xs font-bold text-white tracking-wide">${design.name}</span>
          <div class="w-2.5 h-2.5 rounded-full" style="background-color: ${design.color}"></div>
        </div>
        <p class="text-[9px] line-clamp-2 leading-relaxed text-slate-500">${design.desc}</p>
      `;

      btn.onclick = () => selectSpinnerDesign(design.id);
      designsGrid.appendChild(btn);
    });
  }

  // Bind sliding dragging gesture sweeps
  const arena = document.getElementById('spinner-arena');
  if (arena) {
    arena.addEventListener('mousedown', startSpinnerDrag);
    arena.addEventListener('mousemove', moveSpinnerDrag);
    window.addEventListener('mouseup', endSpinnerDrag);

    arena.addEventListener('touchstart', startSpinnerDrag, { passive: false });
    arena.addEventListener('touchmove', moveSpinnerDrag, { passive: false });
    window.addEventListener('touchend', endSpinnerDrag);
  }

  maxRpmTracker = stats.highestRpm || 0;
  const maxRpmText = document.getElementById('spinner-max-rpm-text');
  if (maxRpmText) maxRpmText.textContent = maxRpmTracker;

  const longestText = document.getElementById('spinner-longest-text');
  if (longestText) longestText.textContent = stats.longestSpinSeconds || 0;

  renderSpinnerSvgMarkup();
  startSpinnerPhysicsLoop();
}

function selectSpinnerDesign(id) {
  audioEngine.initContext();
  audioEngine.playPop(1.15);
  if (navigator.vibrate) navigator.vibrate(8);

  activeSpinnerDesign = SPIN_DESIGNS.find(s => s.id === id) || SPIN_DESIGNS[0];
  initSpinnerGame();
}

function renderSpinnerSvgMarkup() {
  const blade = document.getElementById('fidget-spinner-blade');
  if (!blade) return;

  let svgContent = '';
  const id = activeSpinnerDesign.id;

  if (id === 'gold') {
    svgContent = `
      <svg viewBox="0 0 100 100" class="w-full h-full drop-shadow-[0_12px_24px_rgba(0,0,0,0.65)]">
        <circle cx="50" cy="18" r="13" fill="url(#goldGradient)" stroke="#b45309" strokeWidth="1" />
        <circle cx="22" cy="66" r="13" fill="url(#goldGradient)" stroke="#b45309" strokeWidth="1" />
        <circle cx="78" cy="66" r="13" fill="url(#goldGradient)" stroke="#b45309" strokeWidth="1" />
        
        <circle cx="50" cy="18" r="6" fill="#1e293b" stroke="#0f172a" strokeWidth="1.5" />
        <circle cx="22" cy="66" r="6" fill="#1e293b" stroke="#0f172a" strokeWidth="1.5" />
        <circle cx="78" cy="66" r="6" fill="#1e293b" stroke="#0f172a" strokeWidth="1.5" />

        <path d="M50,18 Q50,50 22,66 Q50,50 78,66 Q50,50 50,18" fill="url(#goldGradient)" stroke="#b45309" strokeWidth="0.8" />
        
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
    `;
  } else if (id === 'neon') {
    svgContent = `
      <svg viewBox="0 0 100 100" class="w-full h-full drop-shadow-[0_0_20px_rgba(6,182,212,0.45)]">
        <circle cx="50" cy="50" r="32" fill="none" stroke="#06b6d4" strokeWidth="8" strokeDasharray="30 10 20 10" opacity="0.85" />
        
        <circle cx="50" cy="18" r="9" fill="#22d3ee" stroke="#0891b2" strokeWidth="1.5" />
        <circle cx="22" cy="66" r="9" fill="#22d3ee" stroke="#0891b2" strokeWidth="1.5" />
        <circle cx="78" cy="66" r="9" fill="#22d3ee" stroke="#0891b2" strokeWidth="1.5" />
        
        <path d="M50,18 L50,50 L22,66 L50,50 L78,66" fill="none" stroke="#0891b2" strokeWidth="4.5" />

        <circle cx="50" cy="50" r="15" fill="#0891b2" stroke="#06b6d4" strokeWidth="2" />
        <circle cx="50" cy="50" r="7" fill="#0f172a" />
      </svg>
    `;
  } else if (id === 'titanium') {
    svgContent = `
      <svg viewBox="0 0 100 100" class="w-full h-full drop-shadow-[0_12px_24px_rgba(0,0,0,0.7)]">
        <path d="M50,8 L58,40 L88,44 L64,62 L74,92 L50,74 L26,92 L36,62 L12,44 L42,40 Z" fill="url(#silverGradient)" stroke="#475569" strokeWidth="1.8" />
        
        <circle cx="50" cy="24" r="5.5" fill="#0f172a" stroke="#475569" strokeWidth="1" />
        <circle cx="28" cy="68" r="5.5" fill="#0f172a" stroke="#475569" strokeWidth="1" />
        <circle cx="72" cy="68" r="5.5" fill="#0f172a" stroke="#475569" strokeWidth="1" />

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
    `;
  } else if (id === 'void') {
    svgContent = `
      <svg viewBox="0 0 100 100" class="w-full h-full drop-shadow-[0_10px_20px_rgba(0,0,0,0.85)]">
        <path d="M50,15 C68,15 85,25 80,50 C75,75 55,65 50,85 C32,85 15,75 20,50 C25,25 45,35 50,15 Z" fill="url(#pinkGradient)" stroke="#1e1b4b" strokeWidth="2" />
        
        <path d="M50,22 Q65,28 62,45" fill="none" stroke="#000" strokeWidth="2.5" strokeLinecap="round" />
        <path d="M50,78 Q35,72 38,55" fill="none" stroke="#000" strokeWidth="2.5" strokeLinecap="round" />

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
    `;
  }

  blade.innerHTML = svgContent;
}

function getPointerRotationAngle(clientX, clientY) {
  const el = document.getElementById('spinner-anchor');
  if (!el) return 0;
  const rect = el.getBoundingClientRect();
  const centerX = rect.left + rect.width / 2;
  const centerY = rect.top + rect.height / 2;
  return Math.atan2(clientY - centerY, clientX - centerX);
}

function startSpinnerDrag(e) {
  audioEngine.initContext();
  audioEngine.startSpinnerHum();

  if (e.cancelable) e.preventDefault();

  isDraggingSpinner = true;
  
  let x = 0, y = 0;
  if (e.touches && e.touches.length > 0) {
    x = e.touches[0].clientX;
    y = e.touches[0].clientY;
  } else {
    x = e.clientX;
    y = e.clientY;
  }

  prevPointerAngle = getPointerRotationAngle(x, y);
  lastDragTouchTime = performance.now();
}

function moveSpinnerDrag(e) {
  if (!isDraggingSpinner) return;
  if (e.cancelable) e.preventDefault();

  let x = 0, y = 0;
  if (e.touches && e.touches.length > 0) {
    x = e.touches[0].clientX;
    y = e.touches[0].clientY;
  } else {
    x = e.clientX;
    y = e.clientY;
  }

  const currentAngle = getPointerRotationAngle(x, y);
  const now = performance.now();

  let delta = currentAngle - prevPointerAngle;
  if (delta > Math.PI) delta -= Math.PI * 2;
  if (delta < -Math.PI) delta += Math.PI * 2;

  // Position displacement matches drag positioning
  spinnerAngle += delta;

  // Angular speed tracking
  spinnerOmega = spinnerOmega * 0.35 + delta * 0.65;

  prevPointerAngle = currentAngle;
  lastDragTouchTime = now;
}

function endSpinnerDrag() {
  if (!isDraggingSpinner) return;
  isDraggingSpinner = false;

  // Detect fast swipes increments
  if (Math.abs(spinnerOmega) > 0.08) {
    const updatedSpins = stats.totalSpins + 1;
    updateStatKey('totalSpins', updatedSpins);
  }
}

function boostFidgetSpinner(e) {
  e.stopPropagation();
  audioEngine.initContext();
  audioEngine.startSpinnerHum();

  spinnerOmega += 0.85; // accelerate rotational velocity

  const updatedSpins = stats.totalSpins + 1;
  updateStatKey('totalSpins', updatedSpins);

  if (navigator.vibrate) navigator.vibrate(15);
}

function startSpinnerPhysicsLoop() {
  if (spinnerAnimFrame) cancelAnimationFrame(spinnerAnimFrame);

  let runSessionStart = null;

  const loop = () => {
    if (currentTab !== 'spinner') {
      audioEngine.stopSpinnerHum();
      return;
    }

    // Decay speeds if dragging isn't present
    if (!isDraggingSpinner) {
      const decay = 0.988 - (activeSpinnerDesign.weightMultiplier - 1.0) * 0.003;
      spinnerOmega *= decay;

      if (Math.abs(spinnerOmega) < 0.0005) {
        spinnerOmega = 0;
      }
    }

    spinnerAngle += spinnerOmega;
    if (spinnerAngle >= Math.PI * 2) spinnerAngle -= Math.PI * 2;
    if (spinnerAngle < 0) spinnerAngle += Math.PI * 2;

    currentRpm = Math.floor(Math.abs(spinnerOmega) * 572.9);
    
    // UI tracking
    const rpmText = document.getElementById('spinner-rpm-text');
    if (rpmText) rpmText.textContent = currentRpm;

    if (currentRpm > maxRpmTracker) {
      maxRpmTracker = currentRpm;
      updateStatKey('highestRpm', maxRpmTracker);
      const maxText = document.getElementById('spinner-max-rpm-text');
      if (maxText) maxText.textContent = maxRpmTracker;
    }

    audioEngine.updateHumVolume(currentRpm);

    // Active spin duration tracking
    if (currentRpm > 10) {
      if (!isSpinningActive) {
        isSpinningActive = true;
        runSessionStart = Date.now();
      } else if (runSessionStart) {
        const secs = Math.round((Date.now() - runSessionStart) / 1000);
        spinTimeTracker = secs;
        const timeText = document.getElementById('spinner-time-text');
        if (timeText) timeText.textContent = secs;

        if (secs > stats.longestSpinSeconds) {
          updateStatKey('longestSpinSeconds', secs);
          const longestText = document.getElementById('spinner-longest-text');
          if (longestText) longestText.textContent = secs;
        }
      }
      const hint = document.getElementById('spinner-hint');
      if (hint) hint.classList.add('hidden');
    } else {
      if (isSpinningActive) {
        isSpinningActive = false;
        runSessionStart = null;
      }
    }

    // Real-time DOM CSS matrix rotation and blur
    const blade = document.getElementById('fidget-spinner-blade');
    if (blade) {
      const degrees = (spinnerAngle * 180) / Math.PI;
      const blur = Math.min(currentRpm / 90, 8.5);
      blade.style.transform = `rotate(${degrees}deg)`;
      blade.style.filter = blur > 0.8 ? `blur(${blur}px)` : 'none';
    }

    spinnerAnimFrame = requestAnimationFrame(loop);
  };

  audioEngine.startSpinnerHum();
  spinnerAnimFrame = requestAnimationFrame(loop);
}

// ============================================================================
// 9. STAGE #4: THE RAGE BUTTON SUITE
// ============================================================================

let rageClicksCount = 0;
let heatLevelValue = 0;
let thermalDecelerator = null;
let rageCanvas = null;
let rageCtx = null;
let rageParticlesList = [];
let rageParticleId = 0;
let rageAnimFrame = null;
let rageClickStamps = [];

function initRageGame() {
  rageCanvas = document.getElementById('rage-canvas');
  if (rageCanvas) {
    rageCtx = rageCanvas.getContext('2d');
    resizeRageCanvas();
  }

  rageClicksCount = stats.totalRageClicks || 0;
  
  const clicksField = document.getElementById('rage-clicks-field');
  if (clicksField) clicksField.textContent = rageClicksCount;

  // Clear previous intervals before creating newer ones
  if (thermalDecelerator) clearInterval(thermalDecelerator);
  thermalDecelerator = setInterval(() => {
    heatLevelValue = Math.max(0, heatLevelValue - 1.5);
    const hBar = document.getElementById('rage-heat-bar');
    if (hBar) hBar.style.width = `${heatLevelValue}%`;
  }, 80);

  syncRageTierUI();
  startRagePhysicsLoop();
}

function resizeRageCanvas() {
  const parent = document.getElementById('rage-button-arena');
  if (rageCanvas && parent) {
    rageCanvas.width = parent.clientWidth;
    rageCanvas.height = parent.clientHeight;
  }
}

function pressRageButton(e) {
  audioEngine.initContext();
  if (e.cancelable) e.preventDefault();

  // Tactile button click spring scaling feedback
  const button = document.getElementById('the-rage-button');
  if (button) {
    button.style.transform = 'scale(0.88)';
    setTimeout(() => {
      button.style.transform = 'scale(1.0)';
    }, 100);
  }

  rageClicksCount++;
  updateStatKey('totalRageClicks', rageClicksCount);

  const clicksField = document.getElementById('rage-clicks-field');
  if (clicksField) clicksField.textContent = rageClicksCount;

  // Heat Thermometer speedometer
  const now = Date.now();
  rageClickStamps = [...rageClickStamps, now].filter(stamp => now - stamp < 2000);
  heatLevelValue = Math.min(100, rageClickStamps.length * 8);

  // Screen shake seismic magnitude translations
  const shakeRange = Math.min(18, heatLevelValue * 0.18);
  const arena = document.getElementById('rage-button-arena');
  if (arena && shakeRange > 0) {
    arena.style.transform = `translate(${(Math.random() * 2 - 1) * shakeRange}px, ${(Math.random() * 2 - 1) * shakeRange}px)`;
    setTimeout(() => { arena.style.transform = 'none'; }, 50);
  }

  const spec = getRageTierSpecs(rageClicksCount);
  
  // Coordinates Click point sparkles
  const px = rageCanvas ? rageCanvas.width / 2 : 150;
  const py = rageCanvas ? rageCanvas.height / 2 + 15 : 150;
  triggerRageParticlesBurst(px, py, spec.particleColors);

  audioEngine.playRageStrike(rageClickStamps.length);

  if (navigator.vibrate) {
    navigator.vibrate(5 + Math.floor(heatLevelValue * 0.15));
  }

  checkRageMilestoneAchievements(rageClicksCount, px, py);
  syncRageTierUI();
}

function checkRageMilestoneAchievements(count, px, py) {
  const rainbow = ['#f43f5e', '#ec4899', '#3b82f6', '#10b981', '#fbbf24', '#a855f7'];

  if (count === 1) {
    triggerAchievementToast('😡 Angry Tap Unlocked!', 'Vent accumulated rage inside the laboratory!');
  } else if (count === 100) {
    triggerMilestoneFireworkExplosion(px, py, ['#f43f5e', '#f97316', '#fbbf24']);
    triggerAchievementToast('🔥 Overheated Core unlocked!', '100 clicks achieved! Thermal combustion activated.');
  } else if (count === 500) {
    triggerMilestoneFireworkExplosion(px, py, ['#06b6d4', '#3b82f6', '#ec4899']);
    triggerAchievementToast('⚡ Plasma Overload unlocked!', '500 clicks achieved! Electric volts surging!');
  } else if (count === 1000) {
    triggerMilestoneFireworkExplosion(px, py, ['#7c3aed', '#ec4899', '#0f172a']);
    triggerAchievementToast('🌀 Quantum Singularity unlocked!', '1,000 clicks! Universal gravity warped!');
  } else if (count === 5000) {
    triggerMilestoneFireworkExplosion(px, py, rainbow);
    triggerAchievementToast('☀️ Deified Aura unlocked!', '5,000 clicks achieved! You are a stress relief deity.');
  }

  // Update commentary lines
  updateRageCommentaryText(count);
}

function updateRageCommentaryText(count) {
  const label = document.getElementById('rage-commentary');
  if (!label) return;

  let msg = 'Press it. Direct instant venting.';
  if (count === 1) msg = 'Okay, first tap of anger complete. Felt clean.';
  else if (count === 5) msg = 'Again. Tap out those annoying emails.';
  else if (count === 15) msg = 'That is it. Tell that server timeout who is boss!';
  else if (count === 30) msg = 'Button is perfectly spring-loaded. Feels premium.';
  else if (count === 60) msg = 'Tapping speed is increasing! Let the steam release!';
  else if (count === 100) msg = '100 Clicks achieved! Button is heated! Magma Core Unlocked! 🔥';
  else if (count === 150) msg = 'The red color evolved to molten orange. Satisfying.';
  else if (count === 320) msg = 'Are you sure you do not have work to do? No? Excellent! Keep clicking.';
  else if (count === 500) msg = '500 Clacks! Ultimate high voltage induction! Plasma button unlocked! ⚡';
  else if (count === 1000) msg = '1,000 CLICKS! Quantum Singularity core unlocked! Cosmos loading... 🌀';
  else if (count === 5000) msg = '☀️ 5,000 CLICKS! DEIFIED SOLAR SYSTEM AURAS. ZEN ASCENSION EMBODIED!';

  label.textContent = `"${msg}"`;
}

function getRageTierSpecs(count) {
  if (count < 100) {
    return {
      label: 'Level 1: Office Red Bell',
      classNames: 'from-rose-600 to-red-700 hover:from-rose-500 hover:to-red-600 border-red-800 shadow-[0_12px_24px_rgba(239,68,68,0.4)]',
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
}

function syncRageTierUI() {
  const spec = getRageTierSpecs(rageClicksCount);
  const icon = document.getElementById('rage-tier-icon');
  const label = document.getElementById('rage-tier-label');
  const button = document.getElementById('the-rage-button');

  if (icon) icon.textContent = spec.icon;
  if (label) {
    label.textContent = spec.label;
    label.className = `text-xs font-bold ${spec.accentColor} tracking-wider`;
  }
  if (button) {
    button.className = `absolute rounded-full w-38 h-38 bg-gradient-to-b border-b-8 shadow-inner select-none transition-all outline-none cursor-pointer focus:outline-none flex items-center justify-center text-white ${spec.classNames}`;
  }
}

function triggerRageParticlesBurst(x, y, colorTheme) {
  // Shockwave Ring
  rageParticlesList.push({
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

  // Rising heat sparks
  const sparkCount = 8 + Math.floor(Math.random() * 8);
  for (let i = 0; i < sparkCount; i++) {
    const angle = -Math.PI / 2 + (Math.random() * 0.8 - 0.4);
    const speed = 2 + Math.random() * 5.5;
    const color = colorTheme[Math.floor(Math.random() * colorTheme.length)];
    rageParticlesList.push({
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

  // Dust smoke puffs
  const smokeCount = 3 + Math.floor(Math.random() * 3);
  for (let i = 0; i < smokeCount; i++) {
    const angle = Math.random() * Math.PI * 2;
    const speed = 0.5 + Math.random() * 1.2;
    rageParticlesList.push({
      x,
      y,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed - 0.5,
      color: 'rgba(100, 116, 139, 0.2)',
      size: 8 + Math.random() * 14,
      type: 'smoke',
      alpha: 0.6,
      life: 40 + Math.floor(Math.random() * 30),
      maxLife: 70,
    });
  }
}

function triggerMilestoneFireworkExplosion(x, y, colors) {
  audioEngine.playExplosion();

  for (let i = 0; i < 60; i++) {
    const angle = Math.random() * Math.PI * 2;
    const speed = 3 + Math.random() * 9;
    const color = colors[Math.floor(Math.random() * colors.length)];
    rageParticlesList.push({
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
      gravity: 0.12,
    });
  }
}

function startRagePhysicsLoop() {
  if (rageAnimFrame) cancelAnimationFrame(rageAnimFrame);

  const loop = () => {
    if (currentTab !== 'rage' || !rageCtx || !rageCanvas) return;

    rageCtx.clearRect(0, 0, rageCanvas.width, rageCanvas.height);

    rageParticlesList = rageParticlesList.filter(p => {
      p.x += p.vx;
      p.y += p.vy;
      if (p.gravity) {
        p.vy += p.gravity;
      }

      p.life--;
      p.alpha = Math.max(0, p.life / p.maxLife);

      rageCtx.save();
      rageCtx.globalAlpha = p.alpha;
      rageCtx.fillStyle = p.color;

      if (p.type === 'spark') {
        rageCtx.beginPath();
        rageCtx.strokeStyle = p.color;
        rageCtx.lineWidth = p.size;
        rageCtx.moveTo(p.x, p.y);
        rageCtx.lineTo(p.x - p.vx * 1.5, p.y - p.vy * 1.5);
        rageCtx.stroke();
      } else if (p.type === 'smoke') {
        rageCtx.beginPath();
        rageCtx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        rageCtx.fill();
      } else if (p.type === 'firework') {
        rageCtx.beginPath();
        rageCtx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        rageCtx.fill();
      } else if (p.type === 'ring') {
        rageCtx.beginPath();
        rageCtx.strokeStyle = p.color;
        rageCtx.lineWidth = 4;
        rageCtx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        rageCtx.stroke();
        p.size += 4.5;
      }

      rageCtx.restore();
      return p.life > 0;
    });

    rageAnimFrame = requestAnimationFrame(loop);
  };

  rageAnimFrame = requestAnimationFrame(loop);
}

// ============================================================================
// 10. ACHIEVEMENTS LOCKER PANEL
// ============================================================================

let currentAchFilter = 'all';

function renderAchievements() {
  const grid = document.getElementById('achievements-card-grid');
  if (!grid) return;

  grid.innerHTML = '';

  const filtered = achievements.filter(ach => {
    if (currentAchFilter === 'all') return true;
    return ach.category === currentAchFilter;
  });

  filtered.forEach(ach => {
    const progress = Math.min(ach.targetValue, stats[ach.targetField] || 0);
    const pct = Math.floor((progress / ach.targetValue) * 100);

    const card = document.createElement('div');
    card.id = `achievement-card-${ach.id}`;
    
    const isUnlocked = ach.unlocked;
    card.className = `relative p-4 rounded-2xl border transition-all duration-300 flex items-start space-x-3.5 hover:scale-101 ${isUnlocked ? 'bg-slate-900/80 border-amber-500/45 shadow-[0_4px_16px_rgba(245,158,11,0.08)]' : 'bg-slate-950/40 border-slate-900 text-slate-500'}`;

    let iconSpec = `<i data-lucide="lock" class="w-5 h-5 opacity-60"></i>`;
    if (isUnlocked) {
      iconSpec = `<i data-lucide="${ach.iconName}" class="w-5 h-5"></i>`;
    }

    let checkmark = '';
    if (isUnlocked) {
      checkmark = `
        <div class="absolute top-3 right-3 bg-amber-500/10 text-amber-400 p-1 rounded-full border border-amber-500/25">
          <i data-lucide="check-circle" class="w-3.5 h-3.5"></i>
        </div>
      `;
    }

    let dateUnlockedText = '';
    if (isUnlocked && ach.unlockedAt) {
      const d = new Date(ach.unlockedAt);
      dateUnlockedText = `
        <p class="text-[9px] text-slate-500 tracking-wider mt-2">
          Unlocked: ${d.toLocaleDateString()} at ${d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
        </p>
      `;
    }

    card.innerHTML = `
      ${checkmark}
      <div class="p-3 rounded-xl border transition-all duration-300 flex-shrink-0 ${isUnlocked ? 'bg-amber-500/15 text-amber-400 border-amber-500/20' : 'bg-slate-900/70 text-slate-500 border-slate-850'}">
        ${iconSpec}
      </div>
      <div class="flex-1 min-w-0 pr-4">
        <h4 class="text-sm font-bold tracking-wide truncate ${isUnlocked ? 'text-white' : 'text-slate-400'}">
          ${ach.title}
        </h4>
        <p class="text-xs text-slate-450 mt-1 leading-normal line-clamp-2">
          ${ach.description}
        </p>

        <div class="mt-3">
          <div class="flex items-center justify-between text-[10px] font-bold text-slate-450 mb-1">
            <span class="uppercase text-[9px] tracking-wider text-slate-500">Progress</span>
            <span>${progress} / ${ach.targetValue} (${pct}%)</span>
          </div>
          <div class="w-full bg-slate-950/60 rounded-full h-1.5 overflow-hidden border border-slate-900">
            <div id="prog-bar-${ach.id}" class="h-full rounded-full transition-all duration-300 ${isUnlocked ? 'bg-gradient-to-r from-amber-400 to-orange-400' : 'bg-slate-850'}" style="width: ${pct}%;"></div>
          </div>
        </div>
        ${dateUnlockedText}
      </div>
    `;

    grid.appendChild(card);
  });

  lucide.createIcons();

  // Sync Global Stats Header
  const unlockedCount = achievements.filter(a => a.unlocked).length;
  const totalCount = achievements.length;
  const pctTotal = totalCount > 0 ? Math.round((unlockedCount / totalCount) * 100) : 0;

  const countLabel = document.getElementById('ach-unlocked-count');
  if (countLabel) countLabel.textContent = unlockedCount;

  const totalLabel = document.getElementById('ach-total-count');
  if (totalLabel) totalLabel.textContent = totalCount;

  const pctTextLabel = document.getElementById('ach-pct-text');
  if (pctTextLabel) pctTextLabel.textContent = `${pctTotal}%`;

  const globalBar = document.getElementById('ach-global-progress-bar');
  if (globalBar) globalBar.style.width = `${pctTotal}%`;
}

function filterAchievements(tab) {
  currentAchFilter = tab;
  
  document.querySelectorAll('.ach-tab-btn').forEach(btn => {
    btn.className = 'ach-tab-btn px-4 py-2 rounded-lg text-xs font-bold tracking-wider capitalize transition-all cursor-pointer select-none text-slate-400 hover:text-white hover:bg-slate-900/60';
  });

  const activeBtn = document.getElementById(`ach-tab-${tab}`);
  if (activeBtn) {
    activeBtn.className = 'ach-tab-btn px-4 py-2 rounded-lg text-xs font-bold tracking-wider capitalize transition-all cursor-pointer select-none bg-gradient-to-r from-amber-500 to-orange-500 text-white font-extrabold shadow-md';
  }

  renderAchievements();
}

function purgeAccomplishments() {
  if (window.confirm('Are you absolutely sure you want to reset all your stats, achievements, and combos? This cannot be undone!')) {
    localStorage.removeItem('poplab_stats');
    localStorage.removeItem('poplab_achievements');

    stats = { ...DEFAULT_STATS };
    achievements = INITIAL_ACHIEVEMENTS.map(a => ({ ...a, unlocked: false, unlockedAt: null }));
    
    triggerAchievementToast('🧹 Cache Purged!', 'Your statistics, scores, and accomplishments have been reset.');
    
    syncStatsUI();
    syncAchievementsCount();
    
    if (currentTab === 'achievements') {
      renderAchievements();
    } else if (currentTab === 'bubble') {
      newBubbleSheet(false);
    } else if (currentTab === 'smash') {
      resetSmashObject(0);
    } else if (currentTab === 'spinner') {
      initSpinnerGame();
    } else if (currentTab === 'rage') {
      initRageGame();
    }
  }
}

// ============================================================================
// 11. INITIALIZATION ON WINDOW LOAD
// ============================================================================

window.addEventListener('load', () => {
  loadLocalStorage();
  syncStatsUI();
  syncAchievementsCount();
  lucide.createIcons();
});
