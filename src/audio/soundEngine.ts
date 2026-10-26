/**
 * DAMVERSE - Procedural Web Audio Engine
 * 100% synthesized sound without external mp3/wav dependencies.
 */

class SoundEngine {
  private ctx: AudioContext | null = null;
  private masterGain: GainNode | null = null;
  private sfxGain: GainNode | null = null;
  private isMuted: boolean = false;

  // Continuous sound sources
  private waterNoiseNode: AudioBufferSourceNode | null = null;
  private waterGain: GainNode | null = null;
  private waterFilter: BiquadFilterNode | null = null;

  private turbineOsc1: OscillatorNode | null = null;
  private turbineOsc2: OscillatorNode | null = null;
  private turbineGain: GainNode | null = null;

  private engineOsc: OscillatorNode | null = null;
  private engineGain: GainNode | null = null;

  private rainNoiseNode: AudioBufferSourceNode | null = null;
  private rainGain: GainNode | null = null;

  private isInitialized = false;

  public init() {
    if (this.isInitialized) return;
    try {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      this.ctx = new AudioCtx();
      this.masterGain = this.ctx.createGain();
      this.masterGain.gain.value = 0.7;
      this.masterGain.connect(this.ctx.destination);

      this.sfxGain = this.ctx.createGain();
      this.sfxGain.gain.value = 0.8;
      this.sfxGain.connect(this.masterGain);

      this.setupContinuousAudio();
      this.isInitialized = true;
    } catch {
      // AudioContext may not be available or blocked before user gesture
    }
  }

  private setupContinuousAudio() {
    if (!this.ctx || !this.sfxGain) return;

    // 1. Water Rush Sound (Spillway & River)
    const bufferSize = this.ctx.sampleRate * 2;
    const noiseBuffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const output = noiseBuffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      output[i] = Math.random() * 2 - 1;
    }

    this.waterNoiseNode = this.ctx.createBufferSource();
    this.waterNoiseNode.buffer = noiseBuffer;
    this.waterNoiseNode.loop = true;

    this.waterFilter = this.ctx.createBiquadFilter();
    this.waterFilter.type = 'lowpass';
    this.waterFilter.frequency.value = 400;

    this.waterGain = this.ctx.createGain();
    this.waterGain.gain.value = 0.05;

    this.waterNoiseNode.connect(this.waterFilter);
    this.waterFilter.connect(this.waterGain);
    this.waterGain.connect(this.sfxGain);
    this.waterNoiseNode.start(0);

    // 2. Turbine Mechanical Hum
    this.turbineOsc1 = this.ctx.createOscillator();
    this.turbineOsc1.type = 'sawtooth';
    this.turbineOsc1.frequency.value = 50; // 50 Hz power grid hum

    this.turbineOsc2 = this.ctx.createOscillator();
    this.turbineOsc2.type = 'sine';
    this.turbineOsc2.frequency.value = 100;

    const turbineFilter = this.ctx.createBiquadFilter();
    turbineFilter.type = 'lowpass';
    turbineFilter.frequency.value = 220;

    this.turbineGain = this.ctx.createGain();
    this.turbineGain.gain.value = 0.04;

    this.turbineOsc1.connect(turbineFilter);
    this.turbineOsc2.connect(turbineFilter);
    turbineFilter.connect(this.turbineGain);
    this.turbineGain.connect(this.sfxGain);

    this.turbineOsc1.start(0);
    this.turbineOsc2.start(0);

    // 3. Vehicle Engine
    this.engineOsc = this.ctx.createOscillator();
    this.engineOsc.type = 'triangle';
    this.engineOsc.frequency.value = 65;

    this.engineGain = this.ctx.createGain();
    this.engineGain.gain.value = 0.0;

    this.engineOsc.connect(this.engineGain);
    this.engineGain.connect(this.sfxGain);
    this.engineOsc.start(0);

    // 4. Rain noise
    const rainBuffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const rainData = rainBuffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      rainData[i] = (Math.random() * 2 - 1) * 0.5;
    }
    this.rainNoiseNode = this.ctx.createBufferSource();
    this.rainNoiseNode.buffer = rainBuffer;
    this.rainNoiseNode.loop = true;

    const rainFilter = this.ctx.createBiquadFilter();
    rainFilter.type = 'bandpass';
    rainFilter.frequency.value = 1200;

    this.rainGain = this.ctx.createGain();
    this.rainGain.gain.value = 0.0;

    this.rainNoiseNode.connect(rainFilter);
    rainFilter.connect(this.rainGain);
    this.rainGain.connect(this.sfxGain);
    this.rainNoiseNode.start(0);
  }

  public resumeContext() {
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  public updateWaterSound(spillwayFlow: number, maxSpillway: number = 1500) {
    if (!this.waterGain || !this.waterFilter || !this.ctx) return;
    const ratio = Math.min(1, spillwayFlow / maxSpillway);
    const targetGain = 0.04 + ratio * 0.35;
    const targetFreq = 300 + ratio * 1400;

    this.waterGain.gain.setTargetAtTime(targetGain, this.ctx.currentTime, 0.2);
    this.waterFilter.frequency.setTargetAtTime(targetFreq, this.ctx.currentTime, 0.2);
  }

  public updateTurbineSound(activeCount: number, totalMW: number) {
    if (!this.turbineGain || !this.turbineOsc1 || !this.ctx) return;
    if (activeCount === 0) {
      this.turbineGain.gain.setTargetAtTime(0, this.ctx.currentTime, 0.3);
      return;
    }
    const targetGain = Math.min(0.2, 0.02 + (totalMW / 240) * 0.16);
    const targetFreq = 48 + (totalMW / 240) * 8; // slight frequency ramp with load
    this.turbineGain.gain.setTargetAtTime(targetGain, this.ctx.currentTime, 0.3);
    this.turbineOsc1.frequency.setTargetAtTime(targetFreq, this.ctx.currentTime, 0.3);
  }

  public updateVehicleSound(inVehicle: boolean, speed: number) {
    if (!this.engineGain || !this.engineOsc || !this.ctx) return;
    if (!inVehicle) {
      this.engineGain.gain.setTargetAtTime(0, this.ctx.currentTime, 0.15);
      return;
    }
    const absSpeed = Math.abs(speed);
    const targetGain = 0.08 + Math.min(0.18, absSpeed * 0.01);
    const targetFreq = 50 + Math.min(180, absSpeed * 8);
    this.engineGain.gain.setTargetAtTime(targetGain, this.ctx.currentTime, 0.1);
    this.engineOsc.frequency.setTargetAtTime(targetFreq, this.ctx.currentTime, 0.1);
  }

  public updateWeatherSound(rainIntensity: number) {
    if (!this.rainGain || !this.ctx) return;
    const targetGain = rainIntensity * 0.25;
    this.rainGain.gain.setTargetAtTime(targetGain, this.ctx.currentTime, 0.5);
  }

  // One-shot effects
  public playClick() {
    this.resumeContext();
    if (!this.ctx || !this.sfxGain || this.isMuted) return;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(800, this.ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(400, this.ctx.currentTime + 0.04);
    gain.gain.setValueAtTime(0.12, this.ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.04);
    osc.connect(gain);
    gain.connect(this.sfxGain);
    osc.start();
    osc.stop(this.ctx.currentTime + 0.05);
  }

  public playGateAdjust() {
    this.resumeContext();
    if (!this.ctx || !this.sfxGain || this.isMuted) return;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'square';
    osc.frequency.setValueAtTime(140, this.ctx.currentTime);
    osc.frequency.linearRampToValueAtTime(180, this.ctx.currentTime + 0.12);
    gain.gain.setValueAtTime(0.08, this.ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.12);
    osc.connect(gain);
    gain.connect(this.sfxGain);
    osc.start();
    osc.stop(this.ctx.currentTime + 0.13);
  }

  public playAlarm() {
    this.resumeContext();
    if (!this.ctx || !this.sfxGain || this.isMuted) return;
    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(440, now);
    osc.frequency.linearRampToValueAtTime(880, now + 0.2);
    osc.frequency.linearRampToValueAtTime(440, now + 0.4);
    gain.gain.setValueAtTime(0.18, now);
    gain.gain.exponentialRampToValueAtTime(0.01, now + 0.5);
    osc.connect(gain);
    gain.connect(this.sfxGain);
    osc.start(now);
    osc.stop(now + 0.52);
  }

  public playSuccess() {
    this.resumeContext();
    if (!this.ctx || !this.sfxGain || this.isMuted) return;
    const now = this.ctx.currentTime;
    const notes = [523.25, 659.25, 783.99, 1046.5]; // C5, E5, G5, C6
    notes.forEach((freq, i) => {
      if (!this.ctx || !this.sfxGain) return;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, now + i * 0.08);
      gain.gain.setValueAtTime(0.15, now + i * 0.08);
      gain.gain.exponentialRampToValueAtTime(0.001, now + i * 0.08 + 0.25);
      osc.connect(gain);
      gain.connect(this.sfxGain);
      osc.start(now + i * 0.08);
      osc.stop(now + i * 0.08 + 0.26);
    });
  }

  public playThunder() {
    this.resumeContext();
    if (!this.ctx || !this.sfxGain || this.isMuted) return;
    const now = this.ctx.currentTime;
    const bufferSize = this.ctx.sampleRate * 1.5;
    const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = (Math.random() * 2 - 1) * Math.exp(-i / (this.ctx.sampleRate * 0.4));
    }
    const noise = this.ctx.createBufferSource();
    noise.buffer = buffer;
    const filter = this.ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(150, now);
    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(0.3, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 1.4);
    noise.connect(filter);
    filter.connect(gain);
    gain.connect(this.sfxGain);
    noise.start(now);
  }

  public toggleMute(): boolean {
    this.isMuted = !this.isMuted;
    if (this.masterGain && this.ctx) {
      this.masterGain.gain.setTargetAtTime(this.isMuted ? 0 : 0.7, this.ctx.currentTime, 0.05);
    }
    return this.isMuted;
  }

  public setVolume(vol: number) {
    if (this.masterGain && this.ctx && !this.isMuted) {
      this.masterGain.gain.setTargetAtTime(Math.max(0, Math.min(1, vol)), this.ctx.currentTime, 0.05);
    }
  }
}

export const sound = new SoundEngine();
