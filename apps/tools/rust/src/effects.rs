//! Effects module - Audio effect processors

/// Effect IDs
pub const EQ_LOW: u8 = 0;
pub const EQ_MID: u8 = 1;
pub const EQ_HIGH: u8 = 2;
pub const COMPRESSOR: u8 = 3;
pub const DELAY: u8 = 4;
pub const REVERB: u8 = 5;

/// Biquad filter state
struct BiquadFilter {
    b0: f32,
    b1: f32,
    b2: f32,
    a1: f32,
    a2: f32,
    x1: f32,
    x2: f32,
    y1: f32,
    y2: f32,
}

impl BiquadFilter {
    fn new() -> Self {
        Self {
            b0: 1.0,
            b1: 0.0,
            b2: 0.0,
            a1: 0.0,
            a2: 0.0,
            x1: 0.0,
            x2: 0.0,
            y1: 0.0,
            y2: 0.0,
        }
    }

    fn set_lowshelf(&mut self, frequency: f32, gain_db: f32, sample_rate: f32) {
        let a = 10.0f32.powf(gain_db / 40.0);
        let w0 = 2.0 * std::f32::consts::PI * frequency / sample_rate;
        let cos_w0 = w0.cos();
        let sin_w0 = w0.sin();
        let alpha = sin_w0 / 2.0 * ((a + 1.0 / a) * (1.0 / 0.707 - 1.0) + 2.0).sqrt();

        let a_plus_1 = a + 1.0;
        let a_minus_1 = a - 1.0;
        let two_sqrt_a_alpha = 2.0 * a.sqrt() * alpha;

        let a0 = a_plus_1 + a_minus_1 * cos_w0 + two_sqrt_a_alpha;
        self.b0 = a * (a_plus_1 - a_minus_1 * cos_w0 + two_sqrt_a_alpha) / a0;
        self.b1 = 2.0 * a * (a_minus_1 - a_plus_1 * cos_w0) / a0;
        self.b2 = a * (a_plus_1 - a_minus_1 * cos_w0 - two_sqrt_a_alpha) / a0;
        self.a1 = -2.0 * (a_minus_1 + a_plus_1 * cos_w0) / a0;
        self.a2 = (a_plus_1 + a_minus_1 * cos_w0 - two_sqrt_a_alpha) / a0;
    }

    fn set_highshelf(&mut self, frequency: f32, gain_db: f32, sample_rate: f32) {
        let a = 10.0f32.powf(gain_db / 40.0);
        let w0 = 2.0 * std::f32::consts::PI * frequency / sample_rate;
        let cos_w0 = w0.cos();
        let sin_w0 = w0.sin();
        let alpha = sin_w0 / 2.0 * ((a + 1.0 / a) * (1.0 / 0.707 - 1.0) + 2.0).sqrt();

        let a_plus_1 = a + 1.0;
        let a_minus_1 = a - 1.0;
        let two_sqrt_a_alpha = 2.0 * a.sqrt() * alpha;

        let a0 = a_plus_1 - a_minus_1 * cos_w0 + two_sqrt_a_alpha;
        self.b0 = a * (a_plus_1 + a_minus_1 * cos_w0 + two_sqrt_a_alpha) / a0;
        self.b1 = -2.0 * a * (a_minus_1 + a_plus_1 * cos_w0) / a0;
        self.b2 = a * (a_plus_1 + a_minus_1 * cos_w0 - two_sqrt_a_alpha) / a0;
        self.a1 = 2.0 * (a_minus_1 - a_plus_1 * cos_w0) / a0;
        self.a2 = (a_plus_1 - a_minus_1 * cos_w0 - two_sqrt_a_alpha) / a0;
    }

    fn set_peaking(&mut self, frequency: f32, gain_db: f32, q: f32, sample_rate: f32) {
        let a = 10.0f32.powf(gain_db / 40.0);
        let w0 = 2.0 * std::f32::consts::PI * frequency / sample_rate;
        let cos_w0 = w0.cos();
        let sin_w0 = w0.sin();
        let alpha = sin_w0 / (2.0 * q);

        let a0 = 1.0 + alpha / a;
        self.b0 = (1.0 + alpha * a) / a0;
        self.b1 = -2.0 * cos_w0 / a0;
        self.b2 = (1.0 - alpha * a) / a0;
        self.a1 = -2.0 * cos_w0 / a0;
        self.a2 = (1.0 - alpha / a) / a0;
    }

    fn process(&mut self, input: f32) -> f32 {
        let output = self.b0 * input + self.b1 * self.x1 + self.b2 * self.x2
            - self.a1 * self.y1
            - self.a2 * self.y2;

        self.x2 = self.x1;
        self.x1 = input;
        self.y2 = self.y1;
        self.y1 = output;

        output
    }
}

/// Simple delay line
struct DelayLine {
    buffer: Vec<f32>,
    write_pos: usize,
    delay_samples: usize,
    feedback: f32,
    mix: f32,
}

impl DelayLine {
    fn new(max_delay_samples: usize) -> Self {
        Self {
            buffer: vec![0.0; max_delay_samples],
            write_pos: 0,
            delay_samples: max_delay_samples / 2,
            feedback: 0.3,
            mix: 0.3,
        }
    }

    fn set_delay(&mut self, samples: usize) {
        self.delay_samples = samples.min(self.buffer.len() - 1);
    }

    fn set_feedback(&mut self, feedback: f32) {
        self.feedback = feedback.clamp(0.0, 0.95);
    }

    fn set_mix(&mut self, mix: f32) {
        self.mix = mix.clamp(0.0, 1.0);
    }

    fn process(&mut self, input: f32) -> f32 {
        let read_pos = (self.write_pos + self.buffer.len() - self.delay_samples) % self.buffer.len();
        let delayed = self.buffer[read_pos];

        self.buffer[self.write_pos] = input + delayed * self.feedback;
        self.write_pos = (self.write_pos + 1) % self.buffer.len();

        input * (1.0 - self.mix) + delayed * self.mix
    }
}

/// Simple compressor
struct Compressor {
    threshold: f32,
    ratio: f32,
    attack: f32,
    release: f32,
    makeup_gain: f32,
    envelope: f32,
    sample_rate: f32,
}

impl Compressor {
    fn new(sample_rate: f32) -> Self {
        Self {
            threshold: -12.0,
            ratio: 4.0,
            attack: 0.01,
            release: 0.1,
            makeup_gain: 0.0,
            envelope: 0.0,
            sample_rate,
        }
    }

    fn process(&mut self, input: f32) -> f32 {
        let input_db = 20.0 * (input.abs() + 1e-10).log10();

        // Envelope follower
        let target_env = if input.abs() > self.envelope {
            input.abs()
        } else {
            self.envelope
        };

        let attack_coef = (-1.0 / (self.attack * self.sample_rate)).exp();
        let release_coef = (-1.0 / (self.release * self.sample_rate)).exp();

        let coef = if input.abs() > self.envelope {
            attack_coef
        } else {
            release_coef
        };

        self.envelope = self.envelope * coef + target_env * (1.0 - coef);

        // Gain computation
        let gain_db = if input_db > self.threshold {
            self.threshold + (input_db - self.threshold) / self.ratio - input_db
        } else {
            0.0
        };

        let gain = 10.0f32.powf((gain_db + self.makeup_gain) / 20.0);
        input * gain
    }
}

/// Effects chain
pub struct EffectsChain {
    eq_low: BiquadFilter,
    eq_mid: BiquadFilter,
    eq_high: BiquadFilter,
    compressor: Compressor,
    delay: DelayLine,
    sample_rate: f32,
}

impl EffectsChain {
    pub fn new(sample_rate: f32) -> Self {
        let mut eq_low = BiquadFilter::new();
        let mut eq_mid = BiquadFilter::new();
        let mut eq_high = BiquadFilter::new();

        eq_low.set_lowshelf(200.0, 0.0, sample_rate);
        eq_mid.set_peaking(1000.0, 0.0, 1.0, sample_rate);
        eq_high.set_highshelf(4000.0, 0.0, sample_rate);

        Self {
            eq_low,
            eq_mid,
            eq_high,
            compressor: Compressor::new(sample_rate),
            delay: DelayLine::new((sample_rate * 2.0) as usize), // 2 seconds max delay
            sample_rate,
        }
    }

    pub fn process(&mut self, buffer: &mut [f32]) {
        for sample in buffer.iter_mut() {
            // EQ
            *sample = self.eq_low.process(*sample);
            *sample = self.eq_mid.process(*sample);
            *sample = self.eq_high.process(*sample);

            // Compressor
            *sample = self.compressor.process(*sample);

            // Delay
            *sample = self.delay.process(*sample);
        }
    }

    pub fn set_param(&mut self, effect_id: u8, param_id: u8, value: f32) {
        match effect_id {
            EQ_LOW => {
                self.eq_low.set_lowshelf(200.0, value, self.sample_rate);
            }
            EQ_MID => {
                self.eq_mid.set_peaking(1000.0, value, 1.0, self.sample_rate);
            }
            EQ_HIGH => {
                self.eq_high.set_highshelf(4000.0, value, self.sample_rate);
            }
            DELAY => match param_id {
                0 => self.delay.set_delay((value * self.sample_rate) as usize),
                1 => self.delay.set_feedback(value),
                2 => self.delay.set_mix(value),
                _ => {}
            },
            _ => {}
        }
    }
}
