/**
 * DSP Audio Worklet Processor
 * Runs on a dedicated audio thread for real-time audio processing
 *
 * Features:
 * - Metronome click synthesis
 * - Drum sound synthesis
 * - Low-latency audio generation
 * - No main thread blocking
 */

// ============================================
// Constants
// ============================================

const SAMPLE_RATE = 44100; // Will be updated from AudioContext
const TWO_PI = 2 * Math.PI;

// ============================================
// Metronome Processor
// ============================================

class MetronomeProcessor extends AudioWorkletProcessor {
  constructor() {
    super();

    // State
    this.isPlaying = false;
    this.bpm = 120;
    this.beatsPerMeasure = 4;
    this.volume = 0.8;

    // Timing
    this.samplesPerBeat = 0;
    this.sampleCounter = 0;
    this.currentBeat = 0;

    // Click envelope
    this.clickDuration = 0.03; // 30ms
    this.clickPhase = 0;
    this.clickPlaying = false;
    this.clickSamplesRemaining = 0;
    this.isAccent = false;

    // Handle messages from main thread
    this.port.onmessage = (event) => {
      const { type, data } = event.data;

      switch (type) {
        case 'start':
          this.start();
          break;
        case 'stop':
          this.stop();
          break;
        case 'setBpm':
          this.setBpm(data.bpm);
          break;
        case 'setVolume':
          this.volume = data.volume;
          break;
        case 'setTimeSignature':
          this.beatsPerMeasure = data.beatsPerMeasure;
          break;
      }
    };

    this.updateSamplesPerBeat();
  }

  start() {
    this.isPlaying = true;
    this.sampleCounter = 0;
    this.currentBeat = 0;
    this.triggerClick(true); // Start with accent
  }

  stop() {
    this.isPlaying = false;
    this.clickPlaying = false;
  }

  setBpm(bpm) {
    this.bpm = Math.max(20, Math.min(400, bpm));
    this.updateSamplesPerBeat();
  }

  updateSamplesPerBeat() {
    this.samplesPerBeat = Math.floor((60 / this.bpm) * sampleRate);
  }

  triggerClick(isAccent) {
    this.clickPlaying = true;
    this.clickSamplesRemaining = Math.floor(this.clickDuration * sampleRate);
    this.clickPhase = 0;
    this.isAccent = isAccent;

    // Notify main thread of beat
    this.port.postMessage({
      type: 'beat',
      data: {
        beat: this.currentBeat,
        isAccent: isAccent,
        time: currentTime,
      }
    });
  }

  generateClickSample() {
    if (!this.clickPlaying) return 0;

    const totalSamples = Math.floor(this.clickDuration * sampleRate);
    const progress = 1 - (this.clickSamplesRemaining / totalSamples);

    // Frequency: accent is higher pitched
    const freq = this.isAccent ? 1200 : 800;

    // Sine wave
    const sample = Math.sin(this.clickPhase);
    this.clickPhase += (TWO_PI * freq) / sampleRate;

    // Exponential decay envelope
    const envelope = Math.exp(-progress * 8);

    this.clickSamplesRemaining--;
    if (this.clickSamplesRemaining <= 0) {
      this.clickPlaying = false;
    }

    return sample * envelope * this.volume;
  }

  process(inputs, outputs, parameters) {
    const output = outputs[0];
    const channel = output[0];

    if (!channel) return true;

    for (let i = 0; i < channel.length; i++) {
      // Generate click if playing
      let sample = 0;

      if (this.clickPlaying) {
        sample = this.generateClickSample();
      }

      // Check if it's time for next beat
      if (this.isPlaying) {
        this.sampleCounter++;

        if (this.sampleCounter >= this.samplesPerBeat) {
          this.sampleCounter = 0;
          this.currentBeat = (this.currentBeat + 1) % this.beatsPerMeasure;
          this.triggerClick(this.currentBeat === 0);
        }
      }

      channel[i] = sample;
    }

    // Copy to other channels if stereo
    for (let ch = 1; ch < output.length; ch++) {
      output[ch].set(channel);
    }

    return true; // Keep processor alive
  }
}

// ============================================
// Drum Synth Processor
// ============================================

class DrumSynthProcessor extends AudioWorkletProcessor {
  constructor() {
    super();

    // Active voices
    this.voices = [];
    this.volume = 1.0;

    // Handle messages
    this.port.onmessage = (event) => {
      const { type, data } = event.data;

      switch (type) {
        case 'trigger':
          this.triggerDrum(data.drum, data.velocity, data.params);
          break;
        case 'setVolume':
          this.volume = data.volume;
          break;
        case 'stop':
          this.voices = [];
          break;
      }
    };
  }

  triggerDrum(drum, velocity, params) {
    const voice = this.createVoice(drum, velocity, params);
    if (voice) {
      this.voices.push(voice);
    }
  }

  createVoice(drum, velocity, params) {
    const vel = velocity / 127;

    switch (drum) {
      case 'kick':
        return this.createKickVoice(vel, params);
      case 'snare':
        return this.createSnareVoice(vel, params);
      case 'hihat':
        return this.createHihatVoice(vel, params, false);
      case 'openhat':
        return this.createHihatVoice(vel, params, true);
      case 'clap':
        return this.createClapVoice(vel, params);
      default:
        return null;
    }
  }

  createKickVoice(velocity, params) {
    const p = params || { pitchStart: 150, pitchEnd: 50, pitchDecay: 0.1, ampDecay: 0.3 };
    return {
      type: 'kick',
      time: 0,
      velocity,
      phase: 0,
      pitchStart: p.pitchStart,
      pitchEnd: p.pitchEnd,
      pitchDecay: p.pitchDecay,
      ampDecay: p.ampDecay,
      duration: p.ampDecay + 0.1,
    };
  }

  createSnareVoice(velocity, params) {
    const p = params || { toneFreq: 200, toneDecay: 0.1, noiseDecay: 0.15, toneMix: 50 };
    return {
      type: 'snare',
      time: 0,
      velocity,
      tonePhase: 0,
      toneFreq: p.toneFreq,
      toneDecay: p.toneDecay,
      noiseDecay: p.noiseDecay,
      toneMix: p.toneMix / 100,
      duration: Math.max(p.toneDecay, p.noiseDecay) + 0.1,
    };
  }

  createHihatVoice(velocity, params, isOpen) {
    const p = params || { decay: 0.05, pitch: 50, filterFreq: 8000 };
    const decay = isOpen ? p.decay + 0.2 : p.decay;
    return {
      type: 'hihat',
      time: 0,
      velocity,
      phases: [0, 0, 0, 0, 0, 0],
      decay,
      pitch: p.pitch,
      filterFreq: p.filterFreq,
      duration: decay + 0.1,
    };
  }

  createClapVoice(velocity, params) {
    const p = params || { decay: 0.2, spread: 50, filterFreq: 1200 };
    return {
      type: 'clap',
      time: 0,
      velocity,
      decay: p.decay,
      spread: p.spread,
      filterFreq: p.filterFreq,
      duration: p.decay + 0.2,
    };
  }

  processVoice(voice) {
    const dt = 1 / sampleRate;
    let sample = 0;

    switch (voice.type) {
      case 'kick':
        sample = this.processKick(voice, dt);
        break;
      case 'snare':
        sample = this.processSnare(voice, dt);
        break;
      case 'hihat':
        sample = this.processHihat(voice, dt);
        break;
      case 'clap':
        sample = this.processClap(voice, dt);
        break;
    }

    voice.time += dt;
    return sample * voice.velocity;
  }

  processKick(voice, dt) {
    // Pitch envelope
    const pitchT = Math.min(voice.time / voice.pitchDecay, 1);
    const freq = voice.pitchStart + (voice.pitchEnd - voice.pitchStart) * pitchT;

    // Oscillator
    const sample = Math.sin(voice.phase);
    voice.phase += (TWO_PI * freq) / sampleRate;

    // Amplitude envelope
    const ampEnv = Math.exp(-voice.time / (voice.ampDecay * 0.3));

    return sample * ampEnv;
  }

  processSnare(voice, dt) {
    // Tone oscillator
    const toneSample = Math.sin(voice.tonePhase);
    voice.tonePhase += (TWO_PI * voice.toneFreq) / sampleRate;
    const toneEnv = Math.exp(-voice.time / (voice.toneDecay * 0.3));

    // Noise
    const noise = Math.random() * 2 - 1;
    const noiseEnv = Math.exp(-voice.time / (voice.noiseDecay * 0.3));

    // Mix
    return (toneSample * toneEnv * voice.toneMix + noise * noiseEnv * (1 - voice.toneMix)) * 0.5;
  }

  processHihat(voice, dt) {
    // Multiple detuned square waves
    const baseFreq = 4000 + (voice.pitch / 100) * 4000;
    const ratios = [1, 1.342, 1.2312, 1.6532, 1.9523, 2.1523];

    let sample = 0;
    for (let i = 0; i < 6; i++) {
      const freq = baseFreq * ratios[i];
      sample += Math.sign(Math.sin(voice.phases[i])) * 0.1;
      voice.phases[i] += (TWO_PI * freq) / sampleRate;
    }

    // Add noise
    sample += (Math.random() * 2 - 1) * 0.3;

    // Envelope
    const env = Math.exp(-voice.time / (voice.decay * 0.3));

    return sample * env;
  }

  processClap(voice, dt) {
    // Filtered noise bursts
    const noise = Math.random() * 2 - 1;

    // Multiple hits
    let sample = 0;
    const numHits = 3 + Math.floor(voice.spread / 25);

    for (let i = 0; i < numHits; i++) {
      const hitTime = i * 0.01;
      if (voice.time >= hitTime) {
        const localTime = voice.time - hitTime;
        const env = Math.exp(-localTime / (voice.decay * 0.2));
        sample += noise * env * (1 - i * 0.15);
      }
    }

    return sample * 0.3;
  }

  process(inputs, outputs, parameters) {
    const output = outputs[0];
    const channel = output[0];

    if (!channel) return true;

    for (let i = 0; i < channel.length; i++) {
      let sample = 0;

      // Process all active voices
      for (const voice of this.voices) {
        sample += this.processVoice(voice);
      }

      channel[i] = sample * this.volume;
    }

    // Remove finished voices
    this.voices = this.voices.filter(v => v.time < v.duration);

    // Copy to other channels
    for (let ch = 1; ch < output.length; ch++) {
      output[ch].set(channel);
    }

    return true;
  }
}

// ============================================
// Noise Generator Processor
// ============================================

class NoiseGeneratorProcessor extends AudioWorkletProcessor {
  constructor() {
    super();
    this.type = 'white'; // white, pink, brown
    this.volume = 0.5;
    this.isPlaying = false;

    // Pink noise state
    this.b0 = 0;
    this.b1 = 0;
    this.b2 = 0;
    this.b3 = 0;
    this.b4 = 0;
    this.b5 = 0;
    this.b6 = 0;

    // Brown noise state
    this.lastBrown = 0;

    this.port.onmessage = (event) => {
      const { type, data } = event.data;

      switch (type) {
        case 'start':
          this.isPlaying = true;
          break;
        case 'stop':
          this.isPlaying = false;
          break;
        case 'setType':
          this.type = data.type;
          break;
        case 'setVolume':
          this.volume = data.volume;
          break;
      }
    };
  }

  generateWhiteNoise() {
    return Math.random() * 2 - 1;
  }

  generatePinkNoise() {
    const white = Math.random() * 2 - 1;

    this.b0 = 0.99886 * this.b0 + white * 0.0555179;
    this.b1 = 0.99332 * this.b1 + white * 0.0750759;
    this.b2 = 0.96900 * this.b2 + white * 0.1538520;
    this.b3 = 0.86650 * this.b3 + white * 0.3104856;
    this.b4 = 0.55000 * this.b4 + white * 0.5329522;
    this.b5 = -0.7616 * this.b5 - white * 0.0168980;

    const pink = this.b0 + this.b1 + this.b2 + this.b3 + this.b4 + this.b5 + this.b6 + white * 0.5362;
    this.b6 = white * 0.115926;

    return pink * 0.11;
  }

  generateBrownNoise() {
    const white = Math.random() * 2 - 1;
    this.lastBrown = (this.lastBrown + (0.02 * white)) / 1.02;
    return this.lastBrown * 3.5;
  }

  process(inputs, outputs, parameters) {
    const output = outputs[0];
    const channel = output[0];

    if (!channel || !this.isPlaying) {
      if (channel) channel.fill(0);
      return true;
    }

    for (let i = 0; i < channel.length; i++) {
      let sample;

      switch (this.type) {
        case 'pink':
          sample = this.generatePinkNoise();
          break;
        case 'brown':
          sample = this.generateBrownNoise();
          break;
        default:
          sample = this.generateWhiteNoise();
      }

      channel[i] = sample * this.volume;
    }

    // Copy to other channels
    for (let ch = 1; ch < output.length; ch++) {
      output[ch].set(channel);
    }

    return true;
  }
}

// ============================================
// Register Processors
// ============================================

registerProcessor('metronome-processor', MetronomeProcessor);
registerProcessor('drum-synth-processor', DrumSynthProcessor);
registerProcessor('noise-generator-processor', NoiseGeneratorProcessor);
