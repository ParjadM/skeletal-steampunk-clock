# Chronos Automata: Skeletal Steampunk Clock

Chronos Automata is an interactive, highly detailed, and mechanically modeled skeletal steampunk clock. Designed with a retro-futuristic Victorian aesthetic, this web application brings horology to life using advanced CSS 3D transforms, nested SVG parallax layers, a custom Web Audio API engine, and interactive physics-based ambient effects.

---

## Description

Chronos Automata (No. 9482-A, Est. 1889) is a digital tribute to the complexity of skeletal clocks—timepieces designed to display all of their internal moving gears, escapements, and springs. 

By utilizing multiple layered SVG assets rendered inside a glassmorphic 3D cabinet, this project simulates a fully synchronized mechanical gear train. Users can manipulate the passage of time, toggle aesthetic schemes, release pneumatic steam, and listen to a real-time synthesized mechanical soundscape that matches the exact visual rate of the escapement wheel.

---

## Features

### 1. Multi-Layered 3D Skeletal Clockwork
The clock is split into 7 distinct depth layers inside a glass-enclosed cabinet. Using mouse-tracking parallax, users can look "around" the gears to see the depth:
*   **Layer 1 (Back Frame):** Heavy industrial rivets and structural load-bearing pillars.
*   **Layer 2 (Back Gears):** Slow-turning hour wheels and deep-set reduction trains.
*   **Layer 3 (Middle Gears):** Intermediate reduction train transferring kinetic energy.
*   **Layer 4 (Frosted Glass Dial):** Semi-opaque chapter ring displaying polished Roman numerals.
*   **Layer 5 (Front Gears & Escapement):** High-speed escape wheels, pinions, and seconds gear.
*   **Layer 6 (Pendulum & Escapement Anchor):** A physically rocking anchor with simulated ruby pallets linked to a swinging brass pendulum.
*   **Layer 7 (Filigree Hands):** Ornate, drop-shadowed brass hour, minute, and crimson second hands.

### 2. Interactive Glassmorphic Control Dashboard
A floating control panel allows users to configure the workshop machinery:
*   **Aesthetic Schemes:** Instantly transition CSS variables and SVG gradients between four distinct metallic themes:
    *   *Victorian Brass* (Default golden warmth)
    *   *Industrial Copper* (Deep reddish-orange hues)
    *   *Tempered Steel* (Cool slate-blue tones)
    *   *Obsidian Gold* (Dark carbon plates accented with gold trim)
*   **Speed Regulator Slider:** Adjust the clock speed seamlessly from a complete pause (0.0x) up to a hyper-accelerated rate of 50.0x. Watch the gear trains spin and reduce ratios in real-time.
*   **Pneumatics & Sound Controls:** Release high-pressure steam, toggle synthesized sound effects, or trigger a custom brass chime.
*   **Live Diagnostics:** View real-time rendering performance (FPS) and mechanical frequency rate (Hz).

### 3. Integrated Web Audio API Synthesizer
Rather than relying on flat audio files, Chronos Automata features a built-in procedural synthesizer:
*   **Mechanical Ticks:** High-frequency click synthesizers that adjust pitch, decay, and rate to match the current speed of the escapement wheel.
*   **Pneumatic Steam Release:** A white-noise generator paired with dynamic bandpass filters and gain envelopes to simulate physical high-pressure steam valves.
*   **Chime System:** A multi-oscillator metallic bell synthesizer simulating a physical heavy brass gong.

### 4. Ambient Particle & Gauge Simulations
*   **Steam & Ember Canvas:** A background 2D canvas simulation rendering floating embers and rising steam particles reacting dynamically to user interactions.
*   **Functional Gauges:** Dual mechanical dial displays indicating simulated Boiler PSI and Escapement Torque (N·m), complete with subtle needle vibrations, micro-fluctuations, and inertia.

---

## Tech Stack

*   **Markup & Structuring:** HTML5, Inline Scalable Vector Graphics (SVG)
*   **Styling & 3D Rendering:** CSS3 (Custom properties, 3D perspective transforms, backdrop-filters, custom radial/linear SVG gradients)
*   **Interactivity & Physics Engine:** Vanilla JavaScript (ES6+)
*   **Audio Engine:** Web Audio API (Custom synthesizers, oscillators, white-noise nodes, biquad filters, and dynamic gain envelopes)
*   **Graphics & Visual Effects:** HTML5 Canvas (2D Context particle systems)
*   **Typography:** Google Fonts (*Cinzel Decorative*, *Cinzel*, *Special Elite*, *Share Tech Mono*)

---

## File Structure

*   `index.html` — Holds the structural skeleton of the clock, the layered SVG configurations, the control dashboard, and gradient definitions.
*   `style.css` — Defines the responsive layouts, glassmorphic card stylings, interactive transitions, 3D perspective spaces, and theme variable overrides.
*   `script.js` — Manages state, handles user interactions, updates visual gear rotations, drives the canvas particle system, animates the gauges, and hosts the procedural Web Audio API synthesizer.

---

## Installation & Local Setup

Since Chronos Automata is built entirely with vanilla web technologies, it requires no compilation, bundlers, or external dependencies.

1.  **Clone or Download the Repository:**
    ```bash
    git clone https://github.com/yourusername/chronos-automata.git
    cd chronos-automata
    ```

2.  **Run Locally:**
    *   You can open `index.html` directly in any modern web browser.
    *   Alternatively, for the best performance and to avoid any potential strict browser-origin policies regarding Web Audio, serve the files using a simple local server:
        ```bash
        # Using Python 3
        python3 -m http.server 8000
        ```
        Then navigate to `http://localhost:8000` in your browser.

---

## How It Works

### The Gear Ratio Calculation
The mechanical gears are not just rotating randomly. Their rotation speeds are calculated based on realistic horological reduction ratios. The second hand completes a full rotation every 60 seconds (at 1x speed), driving the escapement wheel. The minute hand rotates 60 times slower, and the hour hand rotates 12 times slower than the minute hand, keeping the displayed time perfectly accurate.

### Mouse Parallax Effect
When moving the mouse across the screen, the application calculates the offset from the center of the viewport and applies a subtle 3D rotation (`rotateX` and `rotateY`) to the `.glass-cabinet` container. Each layer inside the cabinet has a custom `data-depth` attribute. The JavaScript engine translates these depths into subtle offset translations, creating a convincing optical illusion of physical depth behind the glass.