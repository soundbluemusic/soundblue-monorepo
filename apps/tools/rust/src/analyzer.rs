//! Spectrum analyzer module

use rustfft::{num_complex::Complex, FftPlanner};

/// Spectrum analyzer using FFT
pub struct SpectrumAnalyzer {
    fft_size: usize,
    planner: FftPlanner<f32>,
    window: Vec<f32>,
    scratch: Vec<Complex<f32>>,
}

impl SpectrumAnalyzer {
    pub fn new(fft_size: usize) -> Self {
        // Ensure power of 2
        let fft_size = fft_size.next_power_of_two();

        // Create Hann window
        let window: Vec<f32> = (0..fft_size)
            .map(|i| {
                0.5 * (1.0 - (2.0 * std::f32::consts::PI * i as f32 / (fft_size - 1) as f32).cos())
            })
            .collect();

        Self {
            fft_size,
            planner: FftPlanner::new(),
            window,
            scratch: vec![Complex::new(0.0, 0.0); fft_size],
        }
    }

    pub fn analyze(&mut self, input: &[f32], magnitudes: &mut [f32]) {
        let fft = self.planner.plan_fft_forward(self.fft_size);

        // Apply window and convert to complex
        let len = input.len().min(self.fft_size);
        for i in 0..len {
            self.scratch[i] = Complex::new(input[i] * self.window[i], 0.0);
        }
        for i in len..self.fft_size {
            self.scratch[i] = Complex::new(0.0, 0.0);
        }

        // Perform FFT
        fft.process(&mut self.scratch);

        // Calculate magnitudes (only positive frequencies)
        let output_len = magnitudes.len().min(self.fft_size / 2);
        for i in 0..output_len {
            let mag = self.scratch[i].norm() / self.fft_size as f32;
            // Convert to dB
            magnitudes[i] = 20.0 * (mag + 1e-10).log10();
        }
    }

    pub fn get_fft_size(&self) -> usize {
        self.fft_size
    }
}

/// Simple peak detector for beat detection
pub struct PeakDetector {
    threshold: f32,
    decay: f32,
    current_level: f32,
}

impl PeakDetector {
    pub fn new(threshold: f32, decay: f32) -> Self {
        Self {
            threshold,
            decay,
            current_level: 0.0,
        }
    }

    /// Returns true if a beat is detected
    pub fn process(&mut self, input: f32) -> bool {
        let abs_input = input.abs();

        // Decay current level
        self.current_level *= self.decay;

        // Check for peak
        if abs_input > self.current_level && abs_input > self.threshold {
            self.current_level = abs_input;
            true
        } else {
            false
        }
    }

    pub fn set_threshold(&mut self, threshold: f32) {
        self.threshold = threshold;
    }

    pub fn set_decay(&mut self, decay: f32) {
        self.decay = decay.clamp(0.9, 0.9999);
    }
}
