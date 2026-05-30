# Chronos Automata: Skeletal Steampunk Clock

Chronos Automata is an interactive, highly detailed web-based skeletal mechanical clock simulation. Drawing inspiration from Victorian industrial aesthetics and retro-futuristic steampunk design, this project features a fully functional, multi-layered mechanical timepiece. Built entirely with vanilla web technologies, it features mathematically generated vector gear trains, real-time 3D parallax depth, an HTML5 Canvas particle system, and an organic mechanical synthesizer driven by the Web Audio API.

---

## Features

### ⚙️ Procedural Mechanical Gear Train
* **Mathematically Generated SVG Gears**: Gear teeth, spokes, and escape wheels are calculated and rendered dynamically using custom SVG path algorithms.
* **Accurate Transmission Ratios**: Gear rotation speeds correspond to realistic mechanical ratios (e.g., the pinion meshes with the seconds gear at a 2.5:1 ratio, and idlers rotate in perfect sync with the hour and minute wheels).
* **Working Deadbeat Escapement**: Features a rocking pallet fork (anchor assembly) and an escape wheel that updates with a sharp, realistic snap-back motion.

### 👁️ 3D Parallax Glass Cabinet
* **Interactive Depth Mapping**: The clock is housed in a glassmorphic cabinet that tilts dynamically in response to mouse movements (or touch inputs on mobile devices).
* **Layered Z-Axis Separation**: Components are distributed across 7 individual perspective layers (from deepest backplates to front-most filigree hands), creating a striking 3D volumetric effect.

### 🔊 Real-Time Web Audio Synthesizer
* **Procedural Sound Effects**: No static audio files are used. All sounds are synthesized on-the-fly using the Web Audio API.
* **Dynamic Mechanical Hum**: A low-frequency triangle wave oscillator and lowpass filter create a warm, continuous industrial rumble that pitches up and down based on clock speed.
* **Acoustic Tick-Tock**: Synthesizes physical impacts using white noise transients combined with resonant sine waves, alternating between distinct "tick" and "tock" pitches.
* **Resonant Grand Chime**: Generates a deep, harmonically rich gong chime using a fundamental frequency layered with multiple non-integer partials.
* **Steam Release Hiss**: Models high-pressure pneumatics using bandpass-filtered white noise with exponential decay.

### 💨 Thermodynamic Particle Engine
* **Ember Simulation**: A dedicated HTML5 Canvas background continuously spawns rising golden embers.
* **Pneumatic Steam Explosions**: Releasing steam triggers a dense burst of expanding, fading steam clouds that drift outwards from behind the glass cabinet.

### 🎛️ Interactive Control Dashboard
* **Speed Regulator**: Accelerate time from a complete pause (0x) up to 50x speed. Mechanical humming, particle rates, and tick-tock sounds scale proportionally.
* **Aesthetic Schemes**: Instant, smooth transitions between four historical metal finishes:
  * **Victorian Brass**: Classic warm gold with dark bronze framing.
  * **Industrial Copper**: Deep reddish-orange tones with rustic undertones.
  * **Tempered Steel**: Cold, polished silver and slate-blue components.
  * **Obsidian Gold**: High-contrast dark charcoal plates highlighted by bright gold trims.
* **Live Diagnostics**: Real-time readouts monitoring clock engine FPS and the system's mechanical frequency (Hz).
* **Simulated Physical Gauges**: Two glass-covered analog dials tracking real-time mechanical metrics:
  * **Boiler PSI**: Fluctuates dynamically based on the energy required to drive the clockwork at various speeds.
  * **Escapement Torque (N·m)**: Simulates physical tension and high-frequency vibration in the escapement wheel.

---

## Tech Stack

* **Structure & Vector Graphics**: HTML5, SVG (Scalable Vector Graphics)
* **Styling & 3D Layout**: CSS3 (Custom Variables, 3D Transforms, Backdrop Filters, Glassmorphism, CSS Gradients)
* **Logic & Animation**: Vanilla JavaScript (ES6+)
* **Audio Synthesis**: Web Audio API (Oscillators, Gain Nodes, Biquad Filters, Audio Buffers)
* **Background Effects**: HTML5 Canvas 2D API

---

## How It Works

### Mathematical Gear Generation
The gear geometry is generated programmatically using the `createGearPath` and `createEscapeWheelPath` functions. Instead of static images, the script calculates the precise coordinates of gear teeth using trigonometric functions:

```javascript
const step = (Math.PI * 2) / teeth;
const toothWidth = step * 0.35;
const slopeWidth = step * 0.12;
// Generates trapezoidal teeth profiles with subtractive inner spokes
```

### 3D Parallax Formula
By normalizing pointer coordinates relative to the viewport center, the application calculates target rotation angles (pitch and yaw). The individual layers then translate along the Z-axis based on their custom `data-depth` attribute:

$$\text{Translation Offset} = \text{Rotation Angle} \times \text{Layer Depth} \times \text{Scale Factor}$$

This translates into a realistic depth shift whenever the user moves their mouse.

---

## Installation & Usage

1. Clone or download this repository:
   ```bash
   git clone https://github.com/your-username/chronos-automata.git
   ```
2. Navigate into the project directory:
   ```bash
   cd chronos-automata
   ```
3. Open `index.html` directly in any modern web browser, or serve it using a local server (e.g., Live Server in VS Code, Python `http.server`, or Nginx).

*Note: Because the project utilizes the Web Audio API, browsers may require a user interaction (such as clicking "Sound On" or "Release Steam") before audio playback is permitted.*

---

## Customization

The project's styling is highly modular and controlled via CSS variables. You can easily modify existing themes or add your own custom material schemes in `style.css` by overriding the following variables:

```css
body.theme-custom {
  --metal-bright: url(#your-svg-gradient-bright);
  --metal-mid: url(#your-svg-gradient-mid);
  --metal-accent: url(#your-svg-gradient-dark);
  --frame-color: #hexcolor;
  --glow-color: rgba(r, g, b, alpha);
  --accent-solid: #hexcolor;
}