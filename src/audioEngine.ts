/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

class AudioEngine {
  private ctx: AudioContext | null = null;
  private masterVolume: number = 0.5;
  private isMuted: boolean = false;

  // Active spinner hum node references
  private humOsc: OscillatorNode | null = null;
  private humGain: GainNode | null = null;
  private humFilter: BiquadFilterNode | null = null;

  initContext() {
    if (!this.ctx) {
      // Lazy init AudioContext on user interaction
      const AudioCtxClass = window.AudioContext || (window as any).webkitAudioContext;
      if (AudioCtxClass) {
        this.ctx = new AudioCtxClass();
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  setMute(muted: boolean) {
    this.isMuted = muted;
    if (this.ctx) {
      this.updateHumVolume(0);
    }
  }

  setVolume(volume: number) {
    this.masterVolume = Math.max(0, Math.min(1, volume));
  }

  private getEffectiveGain(): number {
    return this.isMuted ? 0 : this.masterVolume;
  }

  private createNoiseBuffer(): AudioBuffer {
    if (!this.ctx) return new AudioBuffer({ length: 1, sampleRate: 44100 });
    const bufferSize = this.ctx.sampleRate * 1.5; // Up to 1.5s of noise
    const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = Math.random() * 2 - 1;
    }
    return buffer;
  }

  // GAME #1: Bubble Popper (dynamic and extremely satisfying plastic pops)
  playPop(pitchModifier: number = 1.0) {
    this.initContext();
    const ctx = this.ctx;
    if (!ctx) return;

    const volume = this.getEffectiveGain();
    if (volume <= 0) return;

    const now = ctx.currentTime;

    // Output node
    const out = ctx.createGain();
    out.gain.setValueAtTime(volume * 0.7, now);
    out.gain.exponentialRampToValueAtTime(0.0001, now + 0.08);
    out.connect(ctx.destination);

    // 1. Tonal element (sine sweep)
    const osc = ctx.createOscillator();
    osc.type = 'sine';
    const startFreq = (900 + Math.random() * 200) * pitchModifier;
    const endFreq = (180 + Math.random() * 40) * pitchModifier;
    osc.frequency.setValueAtTime(startFreq, now);
    osc.frequency.exponentialRampToValueAtTime(endFreq, now + 0.04);
    osc.connect(out);

    // 2. Click element (high pass filtered noise burst for the snap)
    const clickGain = ctx.createGain();
    clickGain.gain.setValueAtTime(0.4, now);
    clickGain.gain.exponentialRampToValueAtTime(0.0001, now + 0.015);

    const noiseFilter = ctx.createBiquadFilter();
    noiseFilter.type = 'bandpass';
    noiseFilter.frequency.setValueAtTime(4500, now);
    noiseFilter.Q.setValueAtTime(5, now);

    const noiseSource = ctx.createBufferSource();
    noiseSource.buffer = this.createNoiseBuffer();
    
    noiseSource.connect(noiseFilter);
    noiseFilter.connect(clickGain);
    clickGain.connect(out);

    // Start & stop
    osc.start(now);
    osc.stop(now + 0.1);
    noiseSource.start(now);
    noiseSource.stop(now + 0.02);
  }

  // GAME #2: Smash Lab Destructive Sound Engine
  // 1. Glass Shatter: Multiple high chimes + noise burst
  playShatterGlass() {
    this.initContext();
    const ctx = this.ctx;
    if (!ctx) return;

    const volume = this.getEffectiveGain();
    if (volume <= 0) return;

    const now = ctx.currentTime;
    const duration = 0.5;

    // Master shatter out
    const masterOut = ctx.createGain();
    masterOut.gain.setValueAtTime(volume * 0.8, now);
    masterOut.gain.exponentialRampToValueAtTime(0.0001, now + duration);
    masterOut.connect(ctx.destination);

    // Base punch
    const impactOsc = ctx.createOscillator();
    impactOsc.type = 'triangle';
    impactOsc.frequency.setValueAtTime(120, now);
    impactOsc.frequency.linearRampToValueAtTime(40, now + 0.08);
    impactOsc.connect(masterOut);
    impactOsc.start(now);
    impactOsc.stop(now + 0.08);

    // High frequency rings
    const frequencies = [1400, 2100, 3200, 4800];
    frequencies.forEach((freq, idx) => {
      const osc = ctx.createOscillator();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq + Math.random() * 100, now);
      
      const oscGain = ctx.createGain();
      oscGain.gain.setValueAtTime(0.2, now);
      // Stagger decay times
      const ringDecay = 0.15 + idx * 0.08;
      oscGain.gain.exponentialRampToValueAtTime(0.0001, now + ringDecay);

      osc.connect(oscGain);
      oscGain.connect(masterOut);

      osc.start(now);
      osc.stop(now + ringDecay + 0.02);
    });

    // Glass friction noise burst
    const noise = ctx.createBufferSource();
    noise.buffer = this.createNoiseBuffer();

    const filter = ctx.createBiquadFilter();
    filter.type = 'highpass';
    filter.frequency.setValueAtTime(2000, now);

    const noiseGain = ctx.createGain();
    noiseGain.gain.setValueAtTime(0.4, now);
    noiseGain.gain.exponentialRampToValueAtTime(0.0001, now + 0.25);

    noise.connect(filter);
    filter.connect(noiseGain);
    noiseGain.connect(masterOut);

    noise.start(now);
    noise.stop(now + 0.3);
  }

  // 2. Brick Shatter: Deep, gritty impact mixed with dry low-pitched crunch
  playShatterBrick() {
    this.initContext();
    const ctx = this.ctx;
    if (!ctx) return;

    const volume = this.getEffectiveGain();
    if (volume <= 0) return;

    const now = ctx.currentTime;
    const duration = 0.4;

    const masterOut = ctx.createGain();
    masterOut.gain.setValueAtTime(volume * 0.9, now);
    masterOut.gain.exponentialRampToValueAtTime(0.0001, now + duration);
    masterOut.connect(ctx.destination);

    // Bass thud
    const osc = ctx.createOscillator();
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(100, now);
    osc.frequency.exponentialRampToValueAtTime(30, now + 0.15);
    osc.connect(masterOut);
    osc.start(now);
    osc.stop(now + 0.2);

    // Gritty low crunch
    const crunch = ctx.createBufferSource();
    crunch.buffer = this.createNoiseBuffer();

    const lowpass = ctx.createBiquadFilter();
    lowpass.type = 'bandpass';
    lowpass.frequency.setValueAtTime(350, now);
    lowpass.Q.setValueAtTime(3, now);

    const crunchGain = ctx.createGain();
    crunchGain.gain.setValueAtTime(0.6, now);
    crunchGain.gain.exponentialRampToValueAtTime(0.0001, now + 0.25);

    crunch.connect(lowpass);
    lowpass.connect(crunchGain);
    crunchGain.connect(masterOut);

    crunch.start(now);
    crunch.stop(now + 0.25);
  }

  // 3. Plate Shatter: Sharp ring with a high-pitched click and quick ringing decay
  playShatterPlate() {
    this.initContext();
    const ctx = this.ctx;
    if (!ctx) return;

    const volume = this.getEffectiveGain();
    if (volume <= 0) return;

    const now = ctx.currentTime;
    const duration = 0.6;

    const masterOut = ctx.createGain();
    masterOut.gain.setValueAtTime(volume * 0.8, now);
    masterOut.gain.exponentialRampToValueAtTime(0.0001, now + duration);
    masterOut.connect(ctx.destination);

    // Initial click impact
    const click = ctx.createOscillator();
    click.type = 'triangle';
    click.frequency.setValueAtTime(400, now);
    click.frequency.linearRampToValueAtTime(80, now + 0.05);
    click.connect(masterOut);
    click.start(now);
    click.stop(now + 0.06);

    // Resonant high ringing frequencies
    const resonances = [980, 1650, 2400];
    resonances.forEach((freq, idx) => {
      const osc = ctx.createOscillator();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq + Math.random() * 40, now);

      const rGain = ctx.createGain();
      rGain.gain.setValueAtTime(0.25, now);
      const ringDuration = 0.25 + idx * 0.12;
      rGain.gain.exponentialRampToValueAtTime(0.0001, now + ringDuration);

      osc.connect(rGain);
      rGain.connect(masterOut);

      osc.start(now);
      osc.stop(now + ringDuration + 0.05);
    });

    // Ringing noise
    const ringNoise = ctx.createBufferSource();
    ringNoise.buffer = this.createNoiseBuffer();

    const bp = ctx.createBiquadFilter();
    bp.type = 'bandpass';
    bp.frequency.setValueAtTime(1800, now);
    bp.Q.setValueAtTime(8, now);

    const bpGain = ctx.createGain();
    bpGain.gain.setValueAtTime(0.3, now);
    bpGain.gain.exponentialRampToValueAtTime(0.0001, now + 0.15);

    ringNoise.connect(bp);
    bp.connect(bpGain);
    bpGain.connect(masterOut);

    ringNoise.start(now);
    ringNoise.stop(now + 0.2);
  }

  // 4. Box Smash: Dull paper/cardboard impact with low resonance
  playShatterBox() {
    this.initContext();
    const ctx = this.ctx;
    if (!ctx) return;

    const volume = this.getEffectiveGain();
    if (volume <= 0) return;

    const now = ctx.currentTime;
    const duration = 0.35;

    const masterOut = ctx.createGain();
    masterOut.gain.setValueAtTime(volume * 0.85, now);
    masterOut.gain.exponentialRampToValueAtTime(0.0001, now + duration);
    masterOut.connect(ctx.destination);

    // Deep hollow body knock
    const knock = ctx.createOscillator();
    knock.type = 'triangle';
    knock.frequency.setValueAtTime(140, now);
    knock.frequency.exponentialRampToValueAtTime(50, now + 0.12);
    knock.connect(masterOut);
    knock.start(now);
    knock.stop(now + 0.15);

    // Cardboard friction tear
    const tear = ctx.createBufferSource();
    tear.buffer = this.createNoiseBuffer();

    const lp = ctx.createBiquadFilter();
    lp.type = 'lowpass';
    lp.frequency.setValueAtTime(600, now);

    const lpGain = ctx.createGain();
    lpGain.gain.setValueAtTime(0.5, now);
    lpGain.gain.exponentialRampToValueAtTime(0.0001, now + 0.18);

    tear.connect(lp);
    lp.connect(lpGain);
    lpGain.connect(masterOut);

    tear.start(now);
    tear.stop(now + 0.255);
  }

  // 5. Watermelon Smashing: Dull heavy squish + organic impact
  playShatterWatermelon() {
    this.initContext();
    const ctx = this.ctx;
    if (!ctx) return;

    const volume = this.getEffectiveGain();
    if (volume <= 0) return;

    const now = ctx.currentTime;
    const duration = 0.45;

    const masterOut = ctx.createGain();
    masterOut.gain.setValueAtTime(volume * 0.9, now);
    masterOut.gain.exponentialRampToValueAtTime(0.0001, now + duration);
    masterOut.connect(ctx.destination);

    // Low heavy impact squish
    const squish = ctx.createOscillator();
    squish.type = 'sine';
    squish.frequency.setValueAtTime(80, now);
    squish.frequency.exponentialRampToValueAtTime(25, now + 0.2);
    squish.connect(masterOut);
    squish.start(now);
    squish.stop(now + 0.25);

    // Wet liquid splash sound (random filter sweeps)
    const splash = ctx.createBufferSource();
    splash.buffer = this.createNoiseBuffer();

    const sweepFilter = ctx.createBiquadFilter();
    sweepFilter.type = 'lowpass';
    sweepFilter.frequency.setValueAtTime(1200, now);
    sweepFilter.frequency.exponentialRampToValueAtTime(200, now + 0.18);

    const splashGain = ctx.createGain();
    splashGain.gain.setValueAtTime(0.55, now);
    splashGain.gain.exponentialRampToValueAtTime(0.0001, now + 0.22);

    splash.connect(sweepFilter);
    sweepFilter.connect(splashGain);
    splashGain.connect(masterOut);

    splash.start(now);
    splash.stop(now + 0.3);
  }

  // GAME #3: Fidget Spinner (active hum that translates rotation speed to frequency & level)
  startSpinnerHum() {
    this.initContext();
    const ctx = this.ctx;
    if (!ctx) return;

    const now = ctx.currentTime;

    // Create unique oscillator & filter if not present
    if (!this.humOsc) {
      this.humOsc = ctx.createOscillator();
      this.humOsc.type = 'triangle';
      this.humOsc.frequency.setValueAtTime(50, now);

      this.humFilter = ctx.createBiquadFilter();
      this.humFilter.type = 'lowpass';
      this.humFilter.frequency.setValueAtTime(150, now);

      this.humGain = ctx.createGain();
      this.humGain.gain.setValueAtTime(0, now);

      // Routing
      this.humOsc.connect(this.humFilter);
      this.humFilter.connect(this.humGain);
      this.humGain.connect(ctx.destination);

      this.humOsc.start(now);
    }
  }

  updateHumVolume(rpm: number) {
    if (!this.ctx || !this.humGain || !this.humOsc || !this.humFilter) return;
    const now = this.ctx.currentTime;
    const volume = this.getEffectiveGain();

    if (rpm <= 5 || volume <= 0) {
      // Fade out hum safely
      this.humGain.gain.setTargetAtTime(0, now, 0.1);
      return;
    }

    // Dynamic pitch mapping (from 40Hz up to 250Hz depending on speed)
    const normalizedSpeed = Math.min(rpm / 1500, 1.0); // Max speed around 1500 RPM
    const targetFreq = 45 + (normalizedSpeed * 150);
    const targetGain = volume * (0.05 + normalizedSpeed * 0.25); // cap hum volume
    const targetCutoff = 100 + (normalizedSpeed * 350);

    // Apply smooth tracking parameters
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
      this.humGain.disconnect();
      this.humGain = null;
    }
    if (this.humFilter) {
      this.humFilter.disconnect();
      this.humFilter = null;
    }
  }

  // GAME #4: Rage Button
  playRageStrike(clicksCount: number = 0) {
    this.initContext();
    const ctx = this.ctx;
    if (!ctx) return;

    const volume = this.getEffectiveGain();
    if (volume <= 0) return;

    const now = ctx.currentTime;
    const duration = 0.25;

    // Build intensity based on cumulative rapid clicks
    const densityFactor = Math.min(clicksCount / 20, 1.0); // cap at 20 clicks rapid succession
    const scale = 1.0 + densityFactor * 0.4;

    const masterOut = ctx.createGain();
    masterOut.gain.setValueAtTime(volume * 0.8 * scale, now);
    masterOut.gain.exponentialRampToValueAtTime(0.0001, now + duration);
    masterOut.connect(ctx.destination);

    // Base sub drop punch
    const punch = ctx.createOscillator();
    punch.type = 'sawtooth';
    const baseFreq = 95 - densityFactor * 15; // lower pitch feel as rage increases
    punch.frequency.setValueAtTime(baseFreq * 2, now);
    punch.frequency.exponentialRampToValueAtTime(30, now + 0.15);
    punch.connect(masterOut);
    punch.start(now);
    punch.stop(now + 0.2);

    // Metal sizzle noise peak
    const sparks = ctx.createBufferSource();
    sparks.buffer = this.createNoiseBuffer();

    const hp = ctx.createBiquadFilter();
    hp.type = 'highpass';
    hp.frequency.setValueAtTime(1500 - densityFactor * 500, now);

    const sparksGain = ctx.createGain();
    sparksGain.gain.setValueAtTime(0.3 * scale, now);
    sparksGain.gain.exponentialRampToValueAtTime(0.0001, now + 0.08);

    sparks.connect(hp);
    hp.connect(sparksGain);
    sparksGain.connect(masterOut);

    sparks.start(now);
    sparks.stop(now + 0.1);
  }

  // Heavy dynamic explosion effect
  playExplosion() {
    this.initContext();
    const ctx = this.ctx;
    if (!ctx) return;

    const volume = this.getEffectiveGain();
    if (volume <= 0) return;

    const now = ctx.currentTime;
    const duration = 1.5;

    const master = ctx.createGain();
    master.gain.setValueAtTime(volume * 1.5, now);
    master.gain.exponentialRampToValueAtTime(0.0001, now + duration);
    master.connect(ctx.destination);

    // Heavy low boom
    const boom = ctx.createOscillator();
    boom.type = 'triangle';
    boom.frequency.setValueAtTime(130, now);
    boom.frequency.linearRampToValueAtTime(20, now + 0.4);
    boom.connect(master);
    boom.start(now);
    boom.stop(now + 0.5);

    // Deep roar crackle
    const roar = ctx.createBufferSource();
    roar.buffer = this.createNoiseBuffer();

    const lowpass = ctx.createBiquadFilter();
    lowpass.type = 'lowpass';
    lowpass.frequency.setValueAtTime(250, now);

    const roarGain = ctx.createGain();
    roarGain.gain.setValueAtTime(0.9, now);
    roarGain.gain.exponentialRampToValueAtTime(0.0001, now + 0.8);

    roar.connect(lowpass);
    lowpass.connect(roarGain);
    roarGain.connect(master);

    roar.start(now);
    roar.stop(now + 1.0);

    // High crackling dust sizzle
    const dust = ctx.createBufferSource();
    dust.buffer = this.createNoiseBuffer();

    const highpass = ctx.createBiquadFilter();
    highpass.type = 'highpass';
    highpass.frequency.setValueAtTime(4000, now);

    const dustGain = ctx.createGain();
    dustGain.gain.setValueAtTime(0.25, now);
    dustGain.gain.exponentialRampToValueAtTime(0.0001, now + 1.2);

    dust.connect(highpass);
    highpass.connect(dustGain);
    dustGain.connect(master);

    dust.start(now);
    dust.stop(now + 1.3);
  }

  // Achievement Unlock Melodic Triad
  playChime() {
    this.initContext();
    const ctx = this.ctx;
    if (!ctx) return;

    const volume = this.getEffectiveGain();
    if (volume <= 0) return;

    const now = ctx.currentTime;

    // Simple rich synthesizer for arpeggio: C5 -> E5 -> G5 -> C6
    const notes = [523.25, 659.25, 783.99, 1046.50];
    const itemDelay = 0.085;

    notes.forEach((freq, idx) => {
      const start = now + idx * itemDelay;
      
      const osc = ctx.createOscillator();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, start);

      const oscGain = ctx.createGain();
      oscGain.gain.setValueAtTime(volume * 0.35, start);
      oscGain.gain.exponentialRampToValueAtTime(0.0001, start + 0.45);

      osc.connect(oscGain);
      oscGain.connect(ctx.destination);

      osc.start(start);
      osc.stop(start + 0.5);
    });
  }
}

export const audioEngine = new AudioEngine();
