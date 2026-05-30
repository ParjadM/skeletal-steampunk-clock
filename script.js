/**
 * Skeletal Steampunk Clock - Engine & Acoustics
 */

document.addEventListener('DOMContentLoaded', () => {
  
  // --- STATE SYSTEM ---
  const state = {
    mode: 'realtime', // 'realtime' | 'demo'
    demoSpeed: 10,
    theme: 'classic',
    isMuted: true,
    volume: 0.5,
    isExploded: false,
    currentTimeSec: 0, // Time in seconds within a 24h cycle
    lastFrameTime: 0,
    fps: 60,
    tickCount: 0,
    lastTickWholeSecond: -1
  };

  // --- AUDIO SYNTH ENGINE (Web Audio API) ---
  let audioCtx = null;

  function initAudio() {
    if (!audioCtx) {
      audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    }
    if (audioCtx.state === 'suspended') {
      audioCtx.resume();
    }
  }

  // Synthesize a highly authentic mechanical tick/tock sound
  function playTick(isTock = false) {
    if (state.isMuted) return;
    initAudio();

    const now = audioCtx.currentTime;
    
    // 1. Noise Burst (The dry mechanical impact friction)
    const noiseBuffer = audioCtx.createBuffer(1, audioCtx.sampleRate * 0.015, audioCtx.sampleRate);
    const output = noiseBuffer.getChannelData(0);
    for (let i = 0; i < noiseBuffer.length; i++) {
      output[i] = Math.random() * 2 - 1;
    }
    const noiseNode = audioCtx.createBufferSource();
    noiseNode.buffer = noiseBuffer;

    const noiseFilter = audioCtx.createBiquadFilter();
    noiseFilter.type = 'bandpass';
    noiseFilter.frequency.value = isTock ? 1200 : 1600;
    noiseFilter.Q.value = 4;

    const noiseGain = audioCtx.createGain();
    noiseGain.gain.setValueAtTime(0.08 * state.volume, now);
    noiseGain.gain.exponentialRampToValueAtTime(0.001, now + 0.012);

    noiseNode.connect(noiseFilter);
    noiseFilter.connect(noiseGain);
    noiseGain.connect(audioCtx.destination);

    // 2. Metallic Ring (Resonant brass/steel strike)
    const osc = audioCtx.createOscillator();
    const oscGain = audioCtx.createGain();
    
    osc.type = 'sine';
    // Tock is slightly lower in pitch & decay to give rhythm
    osc.frequency.setValueAtTime(isTock ? 850 : 1100, now);
    
    oscGain.gain.setValueAtTime(0.15 * state.volume, now);
    oscGain.gain.exponentialRampToValueAtTime(0.001, now + (isTock ? 0.025 : 0.035));

    osc.connect(oscGain);
    oscGain.connect(audioCtx.destination);

    // Start & Stop
    noiseNode.start(now);
    osc.start(now);
    osc.stop(now + 0.05);
  }

  // Rich Westminster Grand Tubular Bell Chime
  function playChime() {
    initAudio();
    if (state.isMuted) return;

    const now = audioCtx.currentTime;
    // Chime notes: E4 (329.63 Hz), C4 (261.63 Hz), D4 (293.66 Hz), G3 (196.00 Hz)
    // We'll play a massive resonant master gong at 110Hz with rich harmonics
    const fundamental = 110; 
    const harmonics = [1, 2, 2.98, 4.01, 5.3, 6.8]; // Tubular bell non-harmonic ratios
    const gains = [0.4, 0.3, 0.25, 0.15, 0.1, 0.05];

    harmonics.forEach((ratio, index) => {
      const osc = audioCtx.createOscillator();
      const gainNode = audioCtx.createGain();
      
      osc.type = 'sine';
      osc.frequency.setValueAtTime(fundamental * ratio, now);
      
      const volumeFactor = gains[index] * state.volume;
      gainNode.gain.setValueAtTime(volumeFactor, now);
      // Long resonant decay (Grandfather clock style)
      gainNode.gain.exponentialRampToValueAtTime(0.001, now + 4.5 / ratio);

      osc.connect(gainNode);
      gainNode.connect(audioCtx.destination);

      osc.start(now);
      osc.stop(now + 5.0);
    });
  }

  // --- SVG MATHEMATICAL GEAR GENERATION ---
  // Programmatically draws highly detailed steampunk gears with custom tooth sizes and spokes
  function createGearPath(cx, cy, innerR, outerR, teeth, holeR, spokeCount = 6) {
    let d = "";
    const step = (Math.PI * 2) / teeth;
    const toothWidth = step * 0.32; // Width at top of tooth
    const slopeWidth = step * 0.14; // Transition width

    for (let i = 0; i < teeth; i++) {
      const angle = i * step;

      // Start of tooth rise
      const a1 = angle;
      const x1 = cx + innerR * Math.cos(a1);
      const y1 = cy + innerR * Math.sin(a1);

      // Top of tooth start
      const a2 = angle + slopeWidth;
      const x2 = cx + outerR * Math.cos(a2);
      const y2 = cy + outerR * Math.sin(a2);

      // Top of tooth end
      const a3 = angle + slopeWidth + toothWidth;
      const x3 = cx + outerR * Math.cos(a3);
      const y3 = cy + outerR * Math.sin(a3);

      // Fall of tooth end
      const a4 = angle + slopeWidth * 2 + toothWidth;
      const x4 = cx + innerR * Math.cos(a4);
      const y4 = cy + innerR * Math.sin(a4);

      if (i === 0) {
        d += `M ${x1} ${y1} `;
      } else {
        d += `L ${x1} ${y1} `;
      }
      d += `L ${x2} ${y2} L ${x3} ${y3} L ${x4} ${y4} `;
    }
    d += "Z ";

    // Center hole (drawn counter-clockwise to subtract/create hollow center)
    d += `M ${cx} ${cy - holeR} A ${holeR} ${holeR} 0 1 0 ${cx} ${cy + holeR} A ${holeR} ${holeR} 0 1 0 ${cx} ${cy - holeR} Z `;

    // Ornate spokes / cutouts
    if (spokeCount > 0) {
      const spokeAngle = (Math.PI * 2) / spokeCount;
      const innerRimR = holeR + 12;
      const outerRimR = innerR - 12;

      if (outerRimR > innerRimR) {
        for (let i = 0; i < spokeCount; i++) {
          const aStart = i * spokeAngle + 0.15;
          const aEnd = (i + 1) * spokeAngle - 0.15;

          const sx1 = cx + innerRimR * Math.cos(aStart);
          const sy1 = cy + innerRimR * Math.sin(aStart);
          const sx2 = cx + outerRimR * Math.cos(aStart);
          const sy2 = cy + outerRimR * Math.sin(aStart);
          const sx3 = cx + outerRimR * Math.cos(aEnd);
          const sy3 = cy + outerRimR * Math.sin(aEnd);
          const sx4 = cx + innerRimR * Math.cos(aEnd);
          const sy4 = cy + innerRimR * Math.sin(aEnd);

          d += `M ${sx1} ${sy1} L ${sx2} ${sy2} A ${outerRimR} ${outerRimR} 0 0 1 ${sx3} ${sy3} L ${sx4} ${sy4} A ${innerRimR} ${innerRimR} 0 0 0 ${sx1} ${sy1} Z `;
        }
      }
    }

    return d;
  }

  // Specialized escape wheel with sharp slanted ratchet-like teeth
  function createEscapeWheelPath(cx, cy, innerR, outerR, teeth, holeR) {
    let d = "";
    const step = (Math.PI * 2) / teeth;

    for (let i = 0; i < teeth; i++) {
      const angle = i * step;
      const x1 = cx + innerR * Math.cos(angle);
      const y1 = cy + innerR * Math.sin(angle);

      // Slanted tooth tip
      const a2 = angle + step * 0.45;
      const x2 = cx + outerR * Math.cos(a2);
      const y2 = cy + outerR * Math.sin(a2);

      // Drop back down to inner radius
      const a3 = angle + step * 0.5;
      const x3 = cx + innerR * Math.cos(a3);
      const y3 = cy + innerR * Math.sin(a3);

      if (i === 0) d += `M ${x1} ${y1} `;
      else d += `L ${x1} ${y1} `;
      d += `L ${x2} ${y2} L ${x3} ${y3} `;
    }
    d += "Z ";

    // Hole
    d += `M ${cx} ${cy - holeR} A ${holeR} ${holeR} 0 1 0 ${cx} ${cy + holeR} A ${holeR} ${holeR} 0 1 0 ${cx} ${cy - holeR} Z `;

    // Filigree curved spokes
    const spokeCount = 5;
    const spokeAngle = (Math.PI * 2) / spokeCount;
    for (let i = 0; i < spokeCount; i++) {
      const aStart = i * spokeAngle;
      const aEnd = aStart + 0.3;
      const sx1 = cx + (holeR + 5) * Math.cos(aStart);
      const sy1 = cy + (holeR + 5) * Math.sin(aStart);
      const sx2 = cx + (innerR - 8) * Math.cos(aEnd);
      const sy2 = cy + (innerR - 8) * Math.sin(aEnd);
      
      // Draw simple curved lines acting as elegant clockwork spokes
      d += `M ${sx1} ${sy1} Q ${cx + (innerR/2)*Math.cos(aStart+0.2)} ${cy + (innerR/2)*Math.sin(aStart+0.2)} ${sx2} ${sy2} `;
    }

    return d;
  }

  // --- INJECT GEARS & DECORATIONS INTO THE SVG LAYERS ---
  const layers = {
    back: document.getElementById('layer-gears-back'),
    mid: document.getElementById('layer-gears-mid'),
    front: document.getElementById('layer-gears-front')
  };

  // Inject dynamic gears
  // G1: Seconds Gear (Center, Front)
  const gSeconds = document.createElementNS("http://www.w3.org/2000/svg", "path");
  gSeconds.setAttribute("id", "gear-seconds");
  gSeconds.setAttribute("class", "gear-metal");
  gSeconds.setAttribute("d", createGearPath(400, 400, 70, 82, 30, 25, 5));
  layers.front.appendChild(gSeconds);

  // G2: Escape Wheel (Top, Front)
  const gEscape = document.createElementNS("http://www.w3.org/2000/svg", "path");
  gEscape.setAttribute("id", "gear-escape");
  gEscape.setAttribute("class", "gear-accent");
  gEscape.setAttribute("d", createEscapeWheelPath(400, 200, 40, 52, 15, 12));
  layers.front.appendChild(gEscape);

  // G3: Left Idler (Meshes with Seconds Gear)
  const gLeftIdler = document.createElementNS("http://www.w3.org/2000/svg", "path");
  gLeftIdler.setAttribute("id", "gear-left-idler");
  gLeftIdler.setAttribute("class", "gear-metal");
  gLeftIdler.setAttribute("d", createGearPath(265, 330, 60, 72, 24, 18, 4));
  layers.mid.appendChild(gLeftIdler);

  // G4: Right Idler (Meshes with Seconds Gear)
  const gRightIdler = document.createElementNS("http://www.w3.org/2000/svg", "path");
  gRightIdler.setAttribute("id", "gear-right-idler");
  gRightIdler.setAttribute("class", "gear-metal");
  gRightIdler.setAttribute("d", createGearPath(535, 330, 60, 72, 24, 18, 4));
  layers.mid.appendChild(gRightIdler);

  // G5: Minute Gear (Center, Middle, larger)
  const gMinute = document.createElementNS("http://www.w3.org/2000/svg", "path");
  gMinute.setAttribute("id", "gear-minute");
  gMinute.setAttribute("class", "gear-accent");
  gMinute.setAttribute("d", createGearPath(400, 400, 130, 145, 54, 85, 8));
  layers.mid.appendChild(gMinute);

  // G6: Hour Gear (Center, Back, largest)
  const gHour = document.createElementNS("http://www.w3.org/2000/svg", "path");
  gHour.setAttribute("id", "gear-hour");
  gHour.setAttribute("class", "gear-metal");
  gHour.setAttribute("d", createGearPath(400, 400, 210, 230, 80, 150, 12));
  layers.back.appendChild(gHour);

  // G7: Bottom Idler (Meshes with Minute Gear)
  const gBottomIdler = document.createElementNS("http://www.w3.org/2000/svg", "path");
  gBottomIdler.setAttribute("id", "gear-bottom-idler");
  gBottomIdler.setAttribute("class", "gear-accent");
  gBottomIdler.setAttribute("d", createGearPath(400, 595, 60, 72, 24, 15, 4));
  layers.mid.appendChild(gBottomIdler);

  // G8: Escapement Drive Pinion (Meshes between Seconds Gear and Escape Wheel)
  const gPinion = document.createElementNS("http://www.w3.org/2000/svg", "path");
  gPinion.setAttribute("id", "gear-pinion");
  gPinion.setAttribute("class", "gear-metal");
  gPinion.setAttribute("d", createGearPath(400, 295, 30, 40, 14, 10, 3));
  layers.front.appendChild(gPinion);


  // --- POPULATE CLOCKFACE DIAL ---
  const numeralsContainer = document.getElementById('roman-numerals');
  const numerals = ["XII", "I", "II", "III", "IV", "V", "VI", "VII", "VIII", "IX", "X", "XI"];
  const dialRadius = 302;

  numerals.forEach((num, index) => {
    const angle = (index * 30 - 90) * (Math.PI / 180);
    const x = 400 + dialRadius * Math.cos(angle);
    const y = 400 + dialRadius * Math.sin(angle);

    const textElem = document.createElementNS("http://www.w3.org/2000/svg", "text");
    textElem.setAttribute("x", x);
    textElem.setAttribute("y", y);
    textElem.textContent = num;
    numeralsContainer.appendChild(textElem);
  });

  // Minute track ticks
  const ticksContainer = document.getElementById('minute-ticks');
  for (let i = 0; i < 60; i++) {
    if (i % 5 === 0) continue; // Skip hour indicators
    const angle = (i * 6 - 90) * (Math.PI / 180);
    const x1 = 400 + 318 * Math.cos(angle);
    const y1 = 400 + 318 * Math.sin(angle);
    const x2 = 400 + 322 * Math.cos(angle);
    const y2 = 400 + 322 * Math.sin(angle);

    const line = document.createElementNS("http://www.w3.org/2000/svg", "line");
    line.setAttribute("x1", x1);
    line.setAttribute("y1", y1);
    line.setAttribute("x2", x2);
    line.setAttribute("y2", y2);
    ticksContainer.appendChild(line);
  }


  // --- CLOCK ENGINE (TICK-TOCK LOGIC & SYNCHRONIZATION) ---
  const elements = {
    hands: {
      second: document.getElementById('hand-second'),
      minute: document.getElementById('hand-minute'),
      hour: document.getElementById('hand-hour')
    },
    gears: {
      seconds: document.getElementById('gear-seconds'),
      escape: document.getElementById('gear-escape'),
      leftIdler: document.getElementById('gear-left-idler'),
      rightIdler: document.getElementById('gear-right-idler'),
      minute: document.getElementById('gear-minute'),
      hour: document.getElementById('gear-hour'),
      bottomIdler: document.getElementById('gear-bottom-idler'),
      pinion: document.getElementById('gear-pinion')
    },
    pendulum: document.getElementById('pendulum-assembly'),
    anchor: document.getElementById('anchor-assembly'),
    container: document.getElementById('clock-container'),
    clockSvg: document.getElementById('skeletal-clock')
  };

  // Sync state.currentTimeSec with system clock initially
  function syncWithSystemTime() {
    const d = new Date();
    state.currentTimeSec = d.getHours() * 3600 + d.getMinutes() * 60 + d.getSeconds() + d.getMilliseconds() / 1000;
  }
  syncWithSystemTime();

  function updateClockMovement(timestamp) {
    if (!state.lastFrameTime) state.lastFrameTime = timestamp;
    const delta = (timestamp - state.lastFrameTime) / 1000;
    state.lastFrameTime = timestamp;

    // Calculate FPS
    if (delta > 0) {
      const currentFps = 1 / delta;
      state.fps = state.fps * 0.95 + currentFps * 0.05; // smooth FPS filter
      document.getElementById('stat-fps').textContent = state.fps.toFixed(1);
    }

    // Step Time depending on active mode
    if (state.mode === 'realtime') {
      syncWithSystemTime();
    } else {
      // Demo Fast-Forward Mode
      state.currentTimeSec += delta * state.demoSpeed;
      if (state.currentTimeSec >= 86400) state.currentTimeSec -= 86400; // loop day
    }

    // Update Manual Calibration slider silently when running
    document.getElementById('time-scrub').value = Math.floor(state.currentTimeSec);
    updateScrubLabel(state.currentTimeSec);

    // --- MECHANICAL ALIGNMENT CALCULATIONS ---
    const t = state.currentTimeSec;

    // Seconds & Gear (60s rotation = 6 degrees/s)
    const secAngle = t * 6;
    elements.hands.second.setAttribute("transform", `rotate(${secAngle} 400 400)`);
    elements.gears.seconds.setAttribute("transform", `rotate(${secAngle} 400 400)`);

    // Left Idler (meshes G2/Seconds). Ratio = 30/24 = 1.25. Rotates opposite.
    const leftIdlerAngle = -secAngle * 1.25;
    elements.gears.leftIdler.setAttribute("transform", `rotate(${leftIdlerAngle} 265 330)`);

    // Right Idler (meshes G2/Seconds). Ratio = 30/24 = 1.25. Rotates opposite.
    const rightIdlerAngle = -secAngle * 1.25;
    elements.gears.rightIdler.setAttribute("transform", `rotate(${rightIdlerAngle} 535 330)`);

    // Pinion (meshes G2/Seconds). Ratio = 30/14 = 2.1428. Rotates opposite.
    const pinionAngle = -secAngle * (30 / 14);
    elements.gears.pinion.setAttribute("transform", `rotate(${pinionAngle} 400 295)`);

    // Minutes & Gear (60m rotation = 0.1 degrees/s)
    const minAngle = (t / 60) * 6;
    elements.hands.minute.setAttribute("transform", `rotate(${minAngle} 400 400)`);
    elements.gears.minute.setAttribute("transform", `rotate(${minAngle} 400 400)`);

    // Bottom Idler (meshes G5/Minutes). Ratio = 54/24 = 2.25. Rotates opposite.
    const bottomIdlerAngle = -minAngle * 2.25;
    elements.gears.bottomIdler.setAttribute("transform", `rotate(${bottomIdlerAngle} 400 595)`);

    // Hours & Gear (12h rotation = 0.00833 degrees/s)
    const hourAngle = (t / 3600) * 30;
    elements.hands.hour.setAttribute("transform", `rotate(${hourAngle} 400 400)`);
    elements.gears.hour.setAttribute("transform", `rotate(${hourAngle} 400 400)`);

    // --- ESCAPEMENT & PENDULUM (The Deadbeat Mechanism) ---
    // The pendulum swings left-to-right at 1Hz (1 full period = 2 seconds, i.e., 2 ticks per period)
    const swingFrequency = 1.0; // Hz
    const swingAngle = Math.sin(t * Math.PI * 2 * swingFrequency) * 11; // Swing max 11 degrees
    elements.pendulum.setAttribute("transform", `rotate(${swingAngle} 400 110)`);

    // Anchor pallets rock in counter-sync with the pendulum swing
    const anchorAngle = -Math.sin(t * Math.PI * 2 * swingFrequency) * 5.5; // Rocks max 5.5 degrees
    elements.anchor.setAttribute("transform", `rotate(${anchorAngle} 400 130)`);

    // The Escape Wheel drops step-by-step per tick (deadbeat motion)
    // 15 teeth = 30 tick states (12 degrees per tick). It advances rapidly then locks.
    const escapeTicks = Math.floor(t * 2); // 2 ticks per second
    const tickFraction = (t * 2) % 1;
    // Fast snap-to-next-tooth interpolation
    const snapFactor = Math.pow(tickFraction, 4); // sharp transition
    const escapeAngle = (escapeTicks + snapFactor) * (360 / 30);
    elements.gears.escape.setAttribute("transform", `rotate(${-escapeAngle} 400 200)`);

    // Play tick acoustics on whole ticks
    if (escapeTicks !== state.lastTickWholeSecond) {
      state.lastTickWholeSecond = escapeTicks;
      const isTock = (escapeTicks % 2 === 0);
      playTick(isTock);

      // Hourly Chime trigger
      const currentHour = Math.floor(t / 3600);
      if (state.mode === 'realtime' && Math.floor(t) % 3600 === 0) {
        playChime();
      }
    }

    requestAnimationFrame(updateClockMovement);
  }

  // Helper to format clock time string
  function updateScrubLabel(secondsTotal) {
    const hours = Math.floor(secondsTotal / 3600);
    const mins = Math.floor((secondsTotal % 3600) / 60);
    const secs = Math.floor(secondsTotal % 60);
    const pad = (n) => n.toString().padStart(2, '0');
    document.getElementById('scrub-current-time').textContent = `${pad(hours)}:${pad(mins)}:${pad(secs)}`;
  }


  // --- INTERACTION & EVENT LISTENERS ---

  // Real-time vs Demo toggle
  document.getElementById('mode-realtime').addEventListener('click', (e) => {
    state.mode = 'realtime';
    e.target.classList.add('active');
    document.getElementById('mode-demo').classList.remove('active');
    document.getElementById('speed-control-group').classList.add('disabled');
    document.getElementById('speed-slider').disabled = true;
    document.getElementById('stat-state').textContent = "Synchronized";
    document.getElementById('stat-state').className = "stat-value text-gold";
  });

  document.getElementById('mode-demo').addEventListener('click', (e) => {
    state.mode = 'demo';
    e.target.classList.add('active');
    document.getElementById('mode-realtime').classList.remove('active');
    document.getElementById('speed-control-group').classList.remove('disabled');
    document.getElementById('speed-slider').disabled = false;
    document.getElementById('stat-state').textContent = "Demo Run";
    document.getElementById('stat-state').className = "stat-value text-green";
  });

  // Demo Speed slider
  const speedSlider = document.getElementById('speed-slider');
  speedSlider.addEventListener('input', (e) => {
    state.demoSpeed = parseInt(e.target.value);
    document.getElementById('speed-val').textContent = `${state.demoSpeed}x`;
  });

  // Theme selector
  const themeButtons = document.querySelectorAll('.theme-btn');
  themeButtons.forEach(btn => {
    btn.addEventListener('click', (e) => {
      themeButtons.forEach(b => b.classList.remove('active'));
      e.target.classList.add('active');
      
      const theme = e.target.getAttribute('data-theme');
      state.theme = theme;
      
      // Update SVG classes
      const svg = document.getElementById('skeletal-clock');
      svg.className.baseVal = `theme-${theme}`;
    });
  });

  // Mute / Volume controller
  const btnMute = document.getElementById('btn-mute');
  btnMute.addEventListener('click', () => {
    state.isMuted = !state.isMuted;
    if (state.isMuted) {
      btnMute.classList.add('muted');
      btnMute.querySelector('span').textContent = "Sound Off";
    } else {
      btnMute.classList.remove('muted');
      btnMute.querySelector('span').textContent = "Sound On";
      initAudio();
    }
  });

  const volumeSlider = document.getElementById('volume-slider');
  volumeSlider.addEventListener('input', (e) => {
    state.volume = parseFloat(e.target.value) / 100;
    if (state.volume > 0 && state.isMuted) {
      btnMute.click();
    }
  });

  // Manual Gong Chime Button
  document.getElementById('btn-chime').addEventListener('click', () => {
    playChime();
  });

  // Exploded 3D view toggle
  const btnExplode = document.getElementById('btn-explode');
  btnExplode.addEventListener('click', () => {
    state.isExploded = !state.isExploded;
    const container = document.getElementById('clock-container');
    if (state.isExploded) {
      container.classList.add('exploded');
      btnExplode.classList.add('active');
    } else {
      container.classList.remove('exploded');
      btnExplode.classList.remove('active');
    }
  });

  // Time scrubber calibration
  const timeScrub = document.getElementById('time-scrub');
  timeScrub.addEventListener('input', (e) => {
    // Force demo mode when user grabs calibration slide
    if (state.mode === 'realtime') {
      document.getElementById('mode-demo').click();
    }
    state.currentTimeSec = parseInt(e.target.value);
    updateScrubLabel(state.currentTimeSec);
  });


  // --- INITIALIZE & START ANIMATION LOOP ---
  // Set default theme class
  document.getElementById('skeletal-clock').className.baseVal = `theme-classic`;
  
  // Start loop
  requestAnimationFrame(updateClockMovement);
});