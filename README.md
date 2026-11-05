# ⚡ HYPERWAVE STUDIO
### Next-Gen Algorithmic Modular Synthesizer, Groovebox & Audio-Reactive Visual Laboratory

> A studio-grade cyberpunk digital audio workstation (DAW) and generative sound synthesizer built from scratch in modern TypeScript, React 19, Tailwind CSS, and the Web Audio API. Zero external sound libraries or samples required—all audio is procedurally synthesized in real time.

---

## 🚀 Key Highlights & Capabilities

### 🎛️ 1. Multi-Voice Procedural Sound Engines
- **Polyphonic Lead Synthesizer**:
  - 8-voice dynamic polyphony with voice stealing
  - Dual oscillators (Sawtooth, Square, Sine, Triangle) with detuning, sub-oscillator, and white noise generator
  - 4-pole multi-mode analog filter (Lowpass, Highpass, Bandpass, Notch) with resonance and cutoff envelope modulation
  - Dedicated ADSR Amp and Filter envelopes with visual curve feedback
  - Multi-target LFO (Filter Cutoff, Pitch Vibrato, Stereo Panning) and portamento glide
- **Acid 303 Monophonic Bass Synth**:
  - Authentic Roland TB-303 emulation with squelchy resonance, slide portamento, and snappy accent decay
  - Custom hyperbolic saturation overdrive for industrial and acid techno timbres
- **8-Voice Analog & FM Drum Machine**:
  - *808/909 Kick*: Exponential pitch-swept sine wave + transient click
  - *Snare*: Dual-component model (tuned resonant body tone + high-pass filtered white noise burst)
  - *Closed & Open Hi-Hats*: High-density metallic noise cluster with variable decay
  - *Handclap*: Triple micro-burst trigger with spatial stereo spread
  - *Cyber Zap*: FM frequency-modulated transient chirp
  - *Analog Toms*: Resonant pitch-swept sine wave
- **Atmospheric Pad Synth**:
  - 4-voice unison supersaw/supersine with stereo detuning and lush chorus tail

---

### 🎼 2. 16-Step Multitrack Precision Sequencer
- **Lookahead Audio Scheduler**: Uses a high-precision `AudioContext.currentTime` timer queue (scheduling 100ms in advance) to ensure **0ms timing jitter**, even during heavy UI rendering or tab switching.
- **Dynamic Groove & Swing**: Variable swing percentage from 50% (straight) up to 75% (heavy shuffle).
- **Per-Step Parameters**:
  - Pitch & Octave selection
  - Velocity control (10% - 100%)
  - Gate duration (staccato to tie)
  - Probability engine (10% - 100% trigger probability for generative variation)
  - Acid 303 Slide and Accent flags
- **Track Controls**: Mute, Solo, Volume, Pan, Clear, and Randomize per track.
- **Euclidean Rhythm Generator**: Generate mathematically balanced polyrhythmic grooves using Bjorklund's algorithm for any track with a single click.

---

### ✨ 3. Algorithmic "Surprise Me" Auto-Composer
- Procedurally writes complete songs in real time across 4 electronic genres:
  - **Synthwave 80s** (Driving 126 BPM, F Minor, 4-on-the-floor beat, rolling bassline, shimmering arpeggios)
  - **Acid 303 Techno** (Pounding 134 BPM, C Minor / Hirajoshi, distorted kicks, screaming resonant slides)
  - **Lo-Fi Chillhop** (Laid-back 84 BPM, A Dorian, swung vinyl drums, warm electric piano chords)
  - **Deep Space Ambient** (Ethereal 72 BPM, D Pentatonic, floating Euclidean polyrhythms, cavernous reverb)

---

### 🌌 4. Audio-Reactive Real-Time Visualizers (60 FPS)
Integrated with Web Audio `AnalyserNode` (2048 FFT bins):
1. **Cyberpunk Oscilloscope**: Time-domain vector beam with phosphor persistence trails and glowing CRT scanline grid.
2. **Radial Audio Galaxy**: 360-degree circular equalizer with bass-reactive pulsing reactor core.
3. **3D Hyperspace Warp Tunnel**: 350+ glowing neon particles accelerating towards the viewer with bass kick energy.
4. **Matrix Spectrogram**: Dynamic frequency heatmap with frequency peak caps.
- **Visualizer Customization**: Switch between 5 cyberpunk color themes (*Neon Cyan*, *Cyber Magenta*, *Amber CRT*, *Matrix Green*, *Solar Fire*) and toggle neon bloom.

---

### 🕹️ 5. Live Performance Controllers
- **X/Y Kaoss Touchpad**: Touch/drag to sweep filter cutoff (X-axis: 60Hz - 16kHz) and delay/resonance mix (Y-axis) in real time with interactive particle ripple physics. Includes Gate and Hold lock modes.
- **Interactive Polyphonic Piano Keyboard**:
  - Playable via mouse, touch, or laptop keyboard (<kbd>A</kbd>-<kbd>K</kbd>, <kbd>W</kbd>, <kbd>E</kbd>, <kbd>T</kbd>, etc.)
  - **Scale Lock**: Quantizes keys to musical modes (*Pentatonic*, *Natural Minor*, *Harmonic Minor*, *Dorian*, *Phrygian*, *Hirajoshi*, *Blues*) so you never hit a wrong note.
  - Octave transposition buttons (-1 / +1 octave).
- **8 MPC Drum Launchpads**: Velocity-sensitive finger drumming pads mapped to keys <kbd>1</kbd>-<kbd>4</kbd>, <kbd>Q</kbd>, <kbd>W</kbd>, <kbd>E</kbd>, <kbd>R</kbd>.

---

### 🎚️ 6. Studio Effects Rack
- **Ping-Pong Delay**: Stereo cross-feedback delay with warm analog high-cut filter on repeats.
- **Algorithmic Reverb**: Synthetic impulse response convolution with adjustable decay (up to 8s) and high-frequency damping.
- **Analog Tube Overdrive**: Hyperbolic tangent saturation curve with tone control.
- **Lo-Fi Bitcrusher**: Variable bit depth (3-bit to 16-bit) and sample-rate reduction.
- **Master Bus Limiter**: Dynamic compression to prevent digital clipping and provide fat punch.

---

### 💾 7. Direct WAV Studio Exporter
- Record your live performance or loop directly from the master bus.
- Automatically encodes to an **uncompressed stereo 16-bit 44.1kHz PCM WAV file** and prompts an instant download.

---

## ⌨️ Global Keyboard Shortcuts

| Shortcut | Action |
| :--- | :--- |
| <kbd>Space</kbd> | Toggle Play / Pause |
| <kbd>1</kbd>, <kbd>2</kbd>, <kbd>3</kbd>, <kbd>4</kbd> | Trigger Kick, Snare, Closed Hat, Open Hat |
| <kbd>Q</kbd>, <kbd>W</kbd>, <kbd>E</kbd>, <kbd>R</kbd> | Trigger Clap, Cyber Zap, High Tom, Low Tom |
| <kbd>A</kbd> - <kbd>K</kbd> | Play white piano keys (C, D, E, F, G, A, B...) |
| <kbd>W</kbd>, <kbd>E</kbd>, <kbd>T</kbd>, <kbd>Y</kbd>, <kbd>U</kbd>, <kbd>O</kbd>, <kbd>P</kbd> | Play black piano keys (C#, D#, F#, G#, A#...) |
| **Right-Click** on any Sequencer Step | Open Step Note, Velocity, Probability & Slide editor |

---

## 🛠️ Tech Stack

- **Runtime**: Node.js & Vite 8
- **Framework**: React 19 & TypeScript
- **Styling**: Tailwind CSS v4 & Lucide Icons
- **Audio DSP**: Pure Web Audio API (`AudioContext`, `OscillatorNode`, `BiquadFilterNode`, `ConvolverNode`, `WaveShaperNode`, `AnalyserNode`, `DynamicsCompressorNode`)
- **Graphics**: HTML5 High-DPI Canvas 2D with particle physics and glow post-processing

---

## 🏁 Getting Started

### 1. Install Dependencies
```bash
npm install
```

### 2. Start Development Server
```bash
npm run dev
```

### 3. Production Build & Preview
```bash
npm run build
npm run preview
```

---

*Engineered with precision for electronic music enthusiasts, generative coders, and cyberpunk audiophiles.*
