# Chronos Automata: Skeletal Steampunk Clock

Chronos Automata is an interactive, highly stylized simulation of a 19th-century skeletal mechanical clockwork masterpiece. Built entirely with vanilla web technologies, this project blends Victorian industrial aesthetics with retro-futuristic science fiction, featuring procedural audio, interactive physics, and a deeply layered 3D parallax interface.

---

## Description

Chronos Automata (No. 9482-A, Est. 1889) is a digital tribute to the art of horology and the steampunk genre. Unlike traditional flat digital clocks, this application exposes its inner skeletal mechanics: a complex array of interlocking brass and copper gears, a swinging pendulum, a functional ruby-pallet anchor escapement, and a set of ornate filigree hands. 

The clock is housed inside a glassmorphic cabinet that reacts dynamically to your mouse movement, creating an immersive 3D parallax depth effect. Ambient steam and glowing embers rise from the underlying boiler engine, while dual analog gauges track simulated steam pressure and escapement torque in real-time.

---

## Features

### 🛠️ Mechanical Horology Simulation
*   **Skeletal Gear Train:** Multiple layers of functional, interlocking gears rotating at mathematically accurate relative gear ratios (seconds, minutes, and hours).
*   **Escapement & Pendulum:** A realistic rocking anchor escapement with ruby pallets that engages with the escape wheel in perfect synchronization with a swinging pendulum.
*   **Ornate Filigree Hands:** Custom vector hands (including a sweep second hand with a brass crescent counterweight) indicate the precise time against a frosted glass dial with Roman numerals.

### 🎨 Immersive Visuals & Parallax
*   **Interactive 3D Cabinet:** Moving your cursor over the clock tilts the glass cabinet, shifting the 7 internal layers at varying depths to create a highly convincing 3D parallax effect.
*   **Four Aesthetic Schemes:**
    *   **Victorian Brass:** Classic gold-polished brass with dark wooden framing.
    *   **Industrial Copper:** Warm, weathered copper plates with deep rust-toned accents.
    *   **Tempered Steel:** Modernized cold-rolled steel with blue-grey metallic gradients.
    *   **Obsidian Gold:** High-contrast luxury scheme featuring charcoal-black plates and polished gold gears.
*   **Ambient Particle Engine:** A dedicated HTML5 Canvas rendering engine simulates rising steam, pressurized puffs, and drifting fireplace embers in the background.

### 🔊 Procedural Audio & Synthesizer
*   **Synthesized Mechanical Sounds:** Built-in Web Audio API synthesizer that generates procedural, organic "tick-tock" sounds without using external audio files.
*   **Resonant Cathedral Chime:** Trigger a deep, rich metal chime (gong) synthesized with additive wave oscillators.
*   **Pneumatic Steam Release:** Simulate a high-pressure valve release with procedural white-noise filtering and envelope attenuation.

### 🎛️ Control & Diagnostics Dashboard
*   **Speed Regulator:** Warp time from a complete pause (0x) up to hyper-speed (50x) to watch the mechanical gear train accelerate, with the audio pitch and tick rate scaling dynamically.
*   **Dynamic Gauges:** Watch the analog "Boiler PSI" and "Escapement Torque" needles vibrate and fluctuate based on clock speed, steam releases, and mechanical friction.
*   **Live Diagnostics:** Real-time performance monitoring, displaying frame rate (FPS) and operating frequency (Hz).

---

## Tech Stack

*   **Markup:** HTML5 (Semantic structure, inline SVG definitions for complex vector shapes, responsive layout).
*   **Styling:** CSS3 (Custom properties for real-time theme swapping, CSS nesting, 3D transforms, glassmorphism filters, responsive grid/flexbox, custom Google Fonts).
*   **Scripting:** Vanilla JavaScript (ES6+).
    *   **Web Audio API:** Real-time synthesis of mechanical impacts, resonant filters, and frequency modulations.
    *   **HTML5 Canvas API:** High-performance particle physics simulation for steam and embers.
    *   **SVG DOM Manipulation:** Dynamic generation of clock dial ticks, Roman numerals, and mathematical rotation calculations.
    *   **Parallax Engine:** Euler angles translation mapping mouse coordinates to 3D matrix rotations.

---

## Architecture & Layer Layout

The glass cabinet is composed of 7 distinct layers stacked along the Z-axis to produce the 3D depth effect:

1.  **Layer 1: Back Frame (Depth: -0.6)** — Heavy structural pillars, backplate, and industrial rivets.
2.  **Layer 2: Back Gears (Depth: -0.3)** — Slow-turning hour wheels and heavy reduction gears.
3.  **Layer 3: Middle Gears (Depth: -0.1)** — Intermediate gear train and driving pinions.
4.  **Layer 4: Frosted Glass Dial (Depth: 0.1)** — Semi-transparent chapter ring with Roman numerals and minute ticks.
5.  **Layer 5: Front Gears (Depth: 0.3)** — High-speed seconds gear, escapement wheel, and drive pinions.
6.  **Layer 6: Escapement Assembly (Depth: 0.5)** — Anchor/pallet fork and the heavy swinging pendulum rod/bob.
7.  **Layer 7: Ornate Hands (Depth: 0.7)** — Hour, minute, and second hands casting realistic drop shadows onto the layers below.

---

## Installation & Local Development

This project runs entirely in the browser without any external dependencies, build tools, or server requirements.

1.  **Clone the Repository:**
    ```bash
    git clone https://github.com/yourusername/chronos-automata.git
    cd chronos-automata
    ```

2.  **Open the Project:**
    Simply double-click `index.html` to open it in any modern web browser, or serve it locally using a simple HTTP server:
    ```bash
    # Using Python
    python -m http.server 8000
    
    # Using Node.js (serve package)
    npx serve .
    ```

3.  **Interact:**
    *   Hover your mouse over the clock to tilt the cabinet.
    *   Use the **Control Dashboard** at the bottom to change themes, speed up time, release steam, or toggle the audio.

---

## License

This project is open-source and available under the [MIT License](LICENSE). Feel free to customize, modify, and build upon this mechanical simulation for your own creative projects.