//! # Audio Engine (Rust/WASM)
//!
//! 프로급 오디오 엔진 - C++ 급 성능의 실시간 오디오 처리
//!
//! ## Features
//! - Zero-copy audio buffer processing
//! - Real-time synthesizers (sine, saw, square, noise)
//! - Effects (EQ, Compressor, Reverb, Delay)
//! - Spectrum analyzer (FFT)

mod oscillator;
mod effects;
mod analyzer;

use wasm_bindgen::prelude::*;

// Initialize panic hook for better error messages
#[wasm_bindgen(start)]
pub fn init() {
    #[cfg(feature = "console_error_panic_hook")]
    console_error_panic_hook::set_once();
}

/// Audio Engine - Main WASM interface
#[wasm_bindgen]
pub struct AudioEngine {
    sample_rate: f32,
    buffer_size: usize,
    // Oscillators
    oscillators: Vec<oscillator::Oscillator>,
    // Effects chain
    effects: effects::EffectsChain,
    // Analyzer
    analyzer: analyzer::SpectrumAnalyzer,
}

#[wasm_bindgen]
impl AudioEngine {
    /// Create a new audio engine
    #[wasm_bindgen(constructor)]
    pub fn new(sample_rate: f32, buffer_size: usize) -> Self {
        Self {
            sample_rate,
            buffer_size,
            oscillators: Vec::new(),
            effects: effects::EffectsChain::new(sample_rate),
            analyzer: analyzer::SpectrumAnalyzer::new(buffer_size),
        }
    }

    /// Process audio buffer (called from AudioWorklet)
    /// Returns processed audio data
    #[wasm_bindgen]
    pub fn process(&mut self, input: &[f32], output: &mut [f32]) {
        // Copy input to output first
        output.copy_from_slice(input);

        // Apply effects chain
        self.effects.process(output);
    }

    /// Process with SharedArrayBuffer (zero-copy)
    #[wasm_bindgen]
    pub fn process_shared(&mut self, buffer_ptr: *mut f32, length: usize) {
        let buffer = unsafe { std::slice::from_raw_parts_mut(buffer_ptr, length) };
        self.effects.process(buffer);
    }

    /// Generate oscillator output
    #[wasm_bindgen]
    pub fn generate_oscillator(
        &mut self,
        waveform: u8,
        frequency: f32,
        output: &mut [f32],
    ) {
        oscillator::generate(waveform, frequency, self.sample_rate, output);
    }

    /// Analyze spectrum (returns FFT magnitudes)
    #[wasm_bindgen]
    pub fn analyze_spectrum(&mut self, input: &[f32], magnitudes: &mut [f32]) {
        self.analyzer.analyze(input, magnitudes);
    }

    /// Set effect parameter
    #[wasm_bindgen]
    pub fn set_effect_param(&mut self, effect_id: u8, param_id: u8, value: f32) {
        self.effects.set_param(effect_id, param_id, value);
    }

    /// Get current sample rate
    #[wasm_bindgen]
    pub fn get_sample_rate(&self) -> f32 {
        self.sample_rate
    }

    /// Get buffer size
    #[wasm_bindgen]
    pub fn get_buffer_size(&self) -> usize {
        self.buffer_size
    }
}

/// Utility: Calculate RMS (Root Mean Square) of audio buffer
#[wasm_bindgen]
pub fn calculate_rms(buffer: &[f32]) -> f32 {
    if buffer.is_empty() {
        return 0.0;
    }

    let sum_squares: f32 = buffer.iter().map(|&x| x * x).sum();
    (sum_squares / buffer.len() as f32).sqrt()
}

/// Utility: Calculate peak level
#[wasm_bindgen]
pub fn calculate_peak(buffer: &[f32]) -> f32 {
    buffer.iter().map(|&x| x.abs()).fold(0.0f32, f32::max)
}

/// Utility: Apply gain to buffer
#[wasm_bindgen]
pub fn apply_gain(buffer: &mut [f32], gain: f32) {
    for sample in buffer.iter_mut() {
        *sample *= gain;
    }
}

/// Utility: Mix two buffers
#[wasm_bindgen]
pub fn mix_buffers(a: &[f32], b: &[f32], output: &mut [f32], mix: f32) {
    let len = a.len().min(b.len()).min(output.len());
    for i in 0..len {
        output[i] = a[i] * (1.0 - mix) + b[i] * mix;
    }
}
