# ☕ MOCHA STUDIO
### Cozy Algorithmic Modular Synthesizer, Lo-Fi Groovebox & Ambient Sound Laboratory

> A handcrafted, aesthetic digital audio workstation (DAW) and generative sound laboratory built with modern TypeScript, React 19, Tailwind CSS, and the Web Audio API. 
> 
> Designed with a soothing, tactile **Mocha** aesthetic: strictly two warm accents—**Warm Caramel** (`#d99b61`) and **Soft Cream Latte** (`#e8cca7`)—over dark roasted espresso textures. No radiant or neon colors, creating an inviting, zero-eye-strain environment for late-night beats and ambient compositions.

---

## ☕ The Aesthetic Philosophy

- **Two-Accent Harmony**:
  - **Primary Accent — Warm Caramel (`#d99b61`)**: Drives interactive controls, active sequencer triggers, playheads, and filter cutoffs.
  - **Secondary Accent — Soft Cream Latte (`#e8cca7`)**: Illuminates secondary readouts, piano keys, harmonic ripples, and modal highlights.
  - **Background Surfaces**: Roasted Espresso (`#14100e`), Dark Mocha (`#1b1511`), and Warm Cocoa borders (`#2e241d`).
- **Tactile Hardware Feel**: Custom-drawn analog rotary knobs with silky radial arcs, tactile MPC finger pads, and an ivory & dark roasted keyboard.

---

## 🎛️ Key Features & Sound Architecture

### 1. Multi-Voice Procedural Sound Engine
Zero external samples or audio files—every single tone is procedurally synthesized directly in Web Audio:
- **Warm Polyphonic Lead Synth**:
  - 8-voice dynamic polyphony with soft voice-stealing.
  - Dual oscillators (Triangle, Sine, Warm Sawtooth, Rounded Square) with detune and sub-oscillator.
  - 4-pole multi-mode warm filter (Lowpass, Highpass, Bandpass, Notch) with ADSR envelope modulation.
  - Analog-style LFO with gentle pitch vibrato and stereo panning tremolo.
- **Vintage Acid Bass Synthesizer**:
  - Warm Roland TB-303 emulation with smooth resonant filter sweeps, portamento slides, and warm tape saturation.
- **Acoustic & Lo-Fi 8-Voice Drum Machine**:
  - *Warm Acoustic Kick*: Tuned exponential sine wave with soft transient click.
  - *Wood & Wire Snare*: Resonant body tone blended with high-pass filtered noise burst.
  - *Brushed Hi-Hats*: Metallic frequency cluster with variable natural decay.
  - *Organic Clap*: Multi-burst stereo-spread claps.
  - *Soft Water Drop / Chime*: FM-modulated acoustic transient.
  - *Warm Wooden Toms*: Resonant pitch-swept tone.
- **Ambient Dream Pad**:
  - 4-voice supersaw/supersine with stereo detuning and tape-like chorus diffusion.

---

### 2. 16-Step Multitrack Precision Sequencer
- **Sample-Accurate Lookahead Scheduler**: High-precision `AudioContext.currentTime` timer queue running 100ms in advance for **0ms timing jitter**, even during heavy UI animations or background tab switching.
- **Cozy Groove & Swing**: Variable swing from 50% (straight) to 75% (lo-fi shuffle).
- **Per-Step Parameter Locks**:
  - Pitch & Octave selection
  - Velocity dynamics (10% - 100%)
  - Gate duration (staccato to legato tie)
  - Probability trigger (10% - 100% for generative, evolving grooves)
  - Portamento slide & accent triggers
- **Euclidean Polyrhythm Generator**: Instant mathematical rhythm generation via Bjorklund's algorithm.

---

### 3. Procedural "Brew Pattern" Auto-Composer
Generate brand-new songs on the fly across four cozy, warm styles:
- **Lo-Fi Coffee Shop** (82 BPM, A Dorian, swung vinyl drums, warm electric piano chords)
- **Midnight Espresso** (118 BPM, C Minor, driving warm bassline, analog drums)
- **Autumn Tea & Rain** (68 BPM, D Pentatonic, ambient water droplets, tape delay arpeggios)
- **Morning Roast** (96 BPM, F Major 7th, uplifting jazzy chords, gentle groove)

---

### 4. Audio-Reactive Ambient Visualizers (60 FPS)
Powered by high-resolution 2048-point Web Audio FFT:
1. **Warm Oscilloscope**: Silky time-domain waveform with soft ember persistence.
2. **Latte Ripples**: Concentric radial rings that expand and pulse like latte art to the rhythm.
3. **Cozy Dust Motes**: 300+ gentle floating ambient dust particles reacting to kick and bass frequencies.
4. **Ambient Bars**: Smooth frequency spectrum analyzer with floating peak caps.

---

### 5. Live Performance Controllers
- **X/Y Kaoss Touchpad**: Real-time tactile control over Low-Pass Filter Cutoff (X) and Tape Delay Mix / Resonance (Y) with soft cream harmonic ripple animations.
- **Ivory & Roasted Espresso Keyboard**: Natural cream white keys and dark roasted black keys with **Harmonic Scale Lock** (Dorian, Minor Pentatonic, Lo-Fi Major 7th, Hirajoshi).
- **8 MPC Drum Launchpads**: Responsive finger drumming pads mapped to keys <kbd>1</kbd>-<kbd>4</kbd>, <kbd>Q</kbd>, <kbd>W</kbd>, <kbd>E</kbd>, <kbd>R</kbd>.

---

### 6. Studio Effects Rack
- **Analog Tape Delay**: Warm ping-pong cross-feedback delay with high-frequency roll-off.
- **Cozy Room & Hall Reverb**: Algorithmic impulse response with soft high-frequency damping.
- **Warm Tube Saturation**: Smooth hyperbolic tangent saturation curve without harsh digital clipping.
- **Lo-Fi Bitcrusher**: Sample-rate reduction and bit-depth control for retro tape and sampler grit.
- **Master Bus Limiter**: Transparent compressor/limiter preventing digital distortion.

---

### 7. Studio 16-Bit WAV Exporter
- Capture your live sessions directly from the master audio bus.
- Instant export to **uncompressed stereo 16-bit 44.1kHz PCM WAV** with a single click.

---

## ⌨️ Keyboard Shortcuts

| Key | Function |
| :--- | :--- |
| <kbd>Space</kbd> | Toggle Play / Pause |
| <kbd>1</kbd>, <kbd>2</kbd>, <kbd>3</kbd>, <kbd>4</kbd> | Kick, Snare, Closed Hat, Open Hat |
| <kbd>Q</kbd>, <kbd>W</kbd>, <kbd>E</kbd>, <kbd>R</kbd> | Clap, Chime, Low Tom, High Tom |
| <kbd>A</kbd> - <kbd>K</kbd> | Natural Ivory Piano Keys |
| <kbd>W</kbd>, <kbd>E</kbd>, <kbd>T</kbd>, <kbd>Y</kbd>, <kbd>U</kbd>, <kbd>O</kbd>, <kbd>P</kbd> | Dark Roasted Piano Keys |
| **Right-Click** on any Sequencer Step | Open Step Pitch, Velocity, Probability & Slide editor |

---

## 🛠️ Technology Stack

- **Framework**: React 19 & TypeScript
- **Bundler**: Vite 8
- **Styling**: Tailwind CSS v4 & Lucide Icons
- **Audio DSP**: Pure Web Audio API (`AudioContext`, `OscillatorNode`, `BiquadFilterNode`, `ConvolverNode`, `WaveShaperNode`, `AnalyserNode`, `DynamicsCompressorNode`)
- **Canvas Rendering**: High-DPI HTML5 Canvas 2D with smooth delta-time interpolation

---

## 🏁 Getting Started

```bash
# 1. Install dependencies
npm install

# 2. Start local development server
npm run dev

# 3. Build for production
npm run build

# 4. Preview production build
npm run preview
```

---

*Handcrafted for cozy music making, generative exploration, and late-night creativity.*
