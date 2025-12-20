//! Oscillator module - Basic waveform generators

use std::f32::consts::PI;

/// Waveform types
pub const SINE: u8 = 0;
pub const SAW: u8 = 1;
pub const SQUARE: u8 = 2;
pub const TRIANGLE: u8 = 3;
pub const NOISE: u8 = 4;

/// Oscillator state
pub struct Oscillator {
    pub waveform: u8,
    pub frequency: f32,
    pub phase: f32,
    pub sample_rate: f32,
}

impl Oscillator {
    pub fn new(sample_rate: f32) -> Self {
        Self {
            waveform: SINE,
            frequency: 440.0,
            phase: 0.0,
            sample_rate,
        }
    }

    pub fn set_frequency(&mut self, freq: f32) {
        self.frequency = freq;
    }

    pub fn set_waveform(&mut self, waveform: u8) {
        self.waveform = waveform;
    }

    pub fn generate(&mut self, output: &mut [f32]) {
        let phase_increment = self.frequency / self.sample_rate;

        for sample in output.iter_mut() {
            *sample = match self.waveform {
                SINE => (self.phase * 2.0 * PI).sin(),
                SAW => 2.0 * self.phase - 1.0,
                SQUARE => if self.phase < 0.5 { 1.0 } else { -1.0 },
                TRIANGLE => 4.0 * (self.phase - (self.phase + 0.5).floor()).abs() - 1.0,
                NOISE => fastrand::f32() * 2.0 - 1.0,
                _ => 0.0,
            };

            self.phase += phase_increment;
            if self.phase >= 1.0 {
                self.phase -= 1.0;
            }
        }
    }
}

/// Stateless oscillator generation (for simple use cases)
pub fn generate(waveform: u8, frequency: f32, sample_rate: f32, output: &mut [f32]) {
    let phase_increment = frequency / sample_rate;
    let mut phase = 0.0f32;

    for sample in output.iter_mut() {
        *sample = match waveform {
            SINE => (phase * 2.0 * PI).sin(),
            SAW => 2.0 * phase - 1.0,
            SQUARE => if phase < 0.5 { 1.0 } else { -1.0 },
            TRIANGLE => 4.0 * (phase - (phase + 0.5).floor()).abs() - 1.0,
            NOISE => fastrand::f32() * 2.0 - 1.0,
            _ => 0.0,
        };

        phase += phase_increment;
        if phase >= 1.0 {
            phase -= 1.0;
        }
    }
}

/// Generate ADSR envelope
pub fn generate_envelope(
    attack: f32,
    decay: f32,
    sustain: f32,
    release: f32,
    sample_rate: f32,
    gate: bool,
    current_level: &mut f32,
    stage: &mut u8,
) -> f32 {
    const ATTACK_STAGE: u8 = 0;
    const DECAY_STAGE: u8 = 1;
    const SUSTAIN_STAGE: u8 = 2;
    const RELEASE_STAGE: u8 = 3;

    if gate {
        match *stage {
            ATTACK_STAGE => {
                let rate = 1.0 / (attack * sample_rate).max(1.0);
                *current_level += rate;
                if *current_level >= 1.0 {
                    *current_level = 1.0;
                    *stage = DECAY_STAGE;
                }
            }
            DECAY_STAGE => {
                let rate = 1.0 / (decay * sample_rate).max(1.0);
                *current_level -= rate * (1.0 - sustain);
                if *current_level <= sustain {
                    *current_level = sustain;
                    *stage = SUSTAIN_STAGE;
                }
            }
            SUSTAIN_STAGE => {
                *current_level = sustain;
            }
            _ => {}
        }
    } else {
        *stage = RELEASE_STAGE;
        let rate = 1.0 / (release * sample_rate).max(1.0);
        *current_level -= rate;
        if *current_level < 0.0 {
            *current_level = 0.0;
        }
    }

    *current_level
}
