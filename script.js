/**
 * Skeletal Steampunk Clock - Interactive Engine & Synthesizer
 */

document.addEventListener('DOMContentLoaded', () => {

  // --- STATE MANAGEMENT ---
  const state = {
    theme: 'brass',
    speedMultiplier: 1.0,
    isMuted: true,
    volume: 0.5,
    currentTimeSec: 0,
    lastFrameTime: 0,
    fps: 60,
    lastTickIndex: -1,
    targetBoilerPSI: 45,
    currentBoilerPSI: 45,
    targetTorque: 12.4,
    currentTorque: 12.4,
    cabinetRotation: { x: 0, y: 0 },
    cabinetTargetRotation: { x: 0, y: 0 }
  };

  // Set initial time
  const initTime = new Date();
  state.currentTimeSec = initTime.getHours() * 3600 + initTime.getMinutes() * 60 + initTime.getSeconds();

  // --- WEB AUDIO API SYNTHESIZER ---
  let audioCtx = null;
  let gearHumOsc = null;
  let gearHumGain = null;

  function initAudio() {
    if (audioCtx) return;
    audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    
    // Create continuous low gear hum
    gearHumOsc = audioCtx.createOscillator();
    gearHumGain = audioCtx.createGain();
    
    gearHumOsc.type = 'triangle';
    gearHumOsc.frequency.setValueAtTime(45, audioCtx.currentTime); // Low mechanical rumble
    
    // Add a lowpass filter to make the hum warm and dark
    const lpFilter = audioCtx.createBiquadFilter();
    lpFilter.type = 'lowpass';
    lpFilter.frequency.setValueAtTime(120, audioCtx.currentTime);

    gearHumOsc.connect(lpFilter);
    lpFilter.connect(gearHumGain);
    gearHumGain.connect(audioCtx.destination);
    
    gearHumGain.gain.setValueAtTime(state.isMuted ? 0 : 0.08 * state.volume, audioCtx.currentTime);
    gearHumOsc.start();
  }

  function playTick(isTock = false) {
    if (state.isMuted || !audioCtx) return;
    const now = audioCtx.currentTime;

    // 1. Mechanical Impact (Noise Transient)
    const noiseBuffer = audioCtx.createBuffer(1, audioCtx.sampleRate * 0.02, audioCtx.sampleRate);
    const output = noiseBuffer.getChannelData(0);
    for (let i = 0; i < noiseBuffer.length; i++) {
      output[i] = Math.random() * 2 - 1;
    }
    const noiseNode = audioCtx.createBufferSource();
    noiseNode.buffer = noiseBuffer;

    const noiseFilter = audioCtx.createBiquadFilter();
    noiseFilter.type = 'bandpass';
    noiseFilter.frequency.value = isTock ? 1000 : 1300;
    noiseFilter.Q.value = 5;

    const noiseGain = audioCtx.createGain();
    noiseGain.gain.setValueAtTime(0.06 * state.volume, now);
    noiseGain.gain.exponentialRampToValueAtTime(0.001, now + 0.015);

    noiseNode.connect(noiseFilter);
    noiseFilter.connect(noiseGain);
    noiseGain.connect(audioCtx.destination);

    // 2. Resonant Bell/Gear Ring (Metallic Pitch)
    const osc = audioCtx.createOscillator();
    const oscGain = audioCtx.createGain();
    
    osc.type = 'sine';
    osc.frequency.setValueAtTime(isTock ? 750 : 980, now);
    
    oscGain.gain.setValueAtTime(0.12 * state.volume, now);
    oscGain.gain.exponentialRampToValueAtTime(0.001, now + (isTock ? 0.03 : 0.04));

    osc.connect(oscGain);
    oscGain.connect(audioCtx.destination);

    noiseNode.start(now);
    osc.start(now);
    osc.stop(now + 0.05);
  }

  function playSteamHiss() {
    if (state.isMuted || !audioCtx) return;
    const now = audioCtx.currentTime;
    const duration = 2.5;

    // Synthesize steam hiss using white noise
    const bufferSize = audioCtx.sampleRate * duration;
    const buffer = audioCtx.createBuffer(1, bufferSize, audioCtx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = Math.random() * 2 - 1;
    }

    const noise = audioCtx.createBufferSource();
    noise.buffer = buffer;

    // Filter to shape the steam hiss
    const filter = audioCtx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.setValueAtTime(3000, now);
    filter.frequency.exponentialRampToValueAtTime(800, now + duration);
    filter.Q.value = 2;

    const gain = audioCtx.createGain();
    gain.gain.setValueAtTime(0.25 * state.volume, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + duration);

    noise.connect(filter);
    filter.connect(gain);
    gain.connect(audioCtx.destination);

    noise.start(now);
  }

  function playChime() {
    if (state.isMuted || !audioCtx) return;
    const now = audioCtx.currentTime;
    
    // Rich resonant grand chime synthesised via multiple sine waves
    const fundamental = 110; // Low A
    const partials = [1, 2, 2.95, 4.02, 5.2, 6.8];
    const gains = [0.5, 0.35, 0.25, 0.15, 0.1, 0.05];

    partials.forEach((ratio, index) => {
      const osc = audioCtx.createOscillator();
      const gainNode = audioCtx.createGain();
      
      osc.type = 'sine';
      osc.frequency.setValueAtTime(fundamental * ratio, now);
      
      gainNode.gain.setValueAtTime(gains[index] * state.volume, now);
      gainNode.gain.exponentialRampToValueAtTime(0.001, now + 5.0 / ratio);

      osc.connect(gainNode);
      gainNode.connect(audioCtx.destination);

      osc.start(now);
      osc.stop(now + 6.0);
    });
  }

  function updateGearHum() {
    if (!gearHumGain || !gearHumOsc) return;
    if (state.isMuted) {
      gearHumGain.gain.setTargetAtTime(0, audioCtx.currentTime, 0.1);
    } else {
      // Scale hum loudness and pitch with clock speed
      const targetGain = (0.05 + Math.min(state.speedMultiplier * 0.005, 0.12)) * state.volume;
      const targetFreq = 45 + (state.speedMultiplier * 1.5);
      gearHumGain.gain.setTargetAtTime(targetGain, audioCtx.currentTime, 0.2);
      gearHumOsc.frequency.setTargetAtTime(targetFreq, audioCtx.currentTime, 0.2);
    }
  }


  // --- AMBIENT CANVAS (STEAM & PARTICLES) ---
  const canvas = document.getElementById('ambient-canvas');
  const ctx = canvas.getContext('2d');
  let particles = [];

  function resizeCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
  }
  window.addEventListener('resize', resizeCanvas);
  resizeCanvas();

  class Particle {
    constructor(x, y, type = 'ember') {
      this.x = x;
      this.y = y;
      this.type = type; // 'ember' | 'steam'
      if (type === 'ember') {
        this.vx = (Math.random() - 0.5) * 0.8;
        this.vy = -Math.random() * 1.2 - 0.4;
        this.size = Math.random() * 2.5 + 0.5;
        this.alpha = Math.random() * 0.6 + 0.2;
        this.color = `rgba(212, 175, 55, ${this.alpha})`;
        this.maxLife = Math.random() * 150 + 100;
      } else {
        // Steam cloud
        this.vx = (Math.random() - 0.5) * 4 + (Math.random() > 0.5 ? 2 : -2);
        this.vy = -Math.random() * 3 - 2;
        this.size = Math.random() * 15 + 10;
        this.alpha = Math.random() * 0.4 + 0.3;
        this.color = `rgba(230, 230, 230, ${this.alpha})`;
        this.maxLife = Math.random() * 80 + 60;
      }
      this.life = 0;
    }

    update() {
      this.x += this.vx;
      this.y += this.vy;
      this.life++;
      
      if (this.type === 'steam') {
        this.size += 0.8; // Steam expands as it rises
        this.vx *= 0.98;
        this.vy *= 0.99;
        this.alpha = (1 - (this.life / this.maxLife)) * 0.4;
      } else {
        this.alpha = (1 - (this.life / this.maxLife)) * 0.8;
      }
    }

    draw() {
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
      if (this.type === 'steam') {
        ctx.fillStyle = `rgba(220, 220, 220, ${this.alpha})`;
      } else {
        ctx.fillStyle = `rgba(212, 175, 55, ${this.alpha})`;
      }
      ctx.fill();
    }
  }

  // Populate background embers continuously
  function spawnEmbers() {
    if (particles.filter(p => p.type === 'ember').length < 60) {
      particles.push(new Particle(Math.random() * canvas.width, canvas.height + 10, 'ember'));
    }
  }

  function triggerSteamExplosion() {
    playSteamHiss();
    const cabinetRect = document.getElementById('main-cabinet').getBoundingClientRect();
    const startX = cabinetRect.left + cabinetRect.width / 2;
    const startY = cabinetRect.top + cabinetRect.height / 2;

    // Burst steam outwards from behind the cabinet
    for (let i = 0; i < 80; i++) {
      particles.push(new Particle(
        startX + (Math.random() - 0.5) * 100,
        startY + (Math.random() - 0.5) * 100,
        'steam'
      ));
    }
  }


  // --- MATHEMATICAL GEAR GENERATION ---
  function createGearPath(cx, cy, innerR, outerR, teeth, holeR, spokeCount = 6) {
    let d = "";
    const step = (Math.PI * 2) / teeth;
    const toothWidth = step * 0.35;
    const slopeWidth = step * 0.12;

    for (let i = 0; i < teeth; i++) {
      const angle = i * step;
      const a1 = angle;
      const x1 = cx + innerR * Math.cos(a1);
      const y1 = cy + innerR * Math.sin(a1);

      const a2 = angle + slopeWidth;
      const x2 = cx + outerR * Math.cos(a2);
      const y2 = cy + outerR * Math.sin(a2);

      const a3 = angle + slopeWidth + toothWidth;
      const x3 = cx + outerR * Math.cos(a3);
      const y3 = cy + outerR * Math.sin(a3);

      const a4 = angle + slopeWidth * 2 + toothWidth;
      const x4 = cx + innerR * Math.cos(a4);
      const y4 = cy + innerR * Math.sin(a4);

      if (i === 0) d += `M ${x1} ${y1} `;
      else d += `L ${x1} ${y1} `;
      d += `L ${x2} ${y2} L ${x3} ${y3} L ${x4} ${y4} `;
    }
    d += "Z ";

    // Subtractive center hole
    d += `M ${cx} ${cy - holeR} A ${holeR} ${holeR} 0 1 0 ${cx} ${cy + holeR} A ${holeR} ${holeR} 0 1 0 ${cx} ${cy - holeR} Z `;

    // Cutouts / Spokes
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

  function createEscapeWheelPath(cx, cy, innerR, outerR, teeth, holeR) {
    let d = "";
    const step = (Math.PI * 2) / teeth;

    for (let i = 0; i < teeth; i++) {
      const angle = i * step;
      const x1 = cx + innerR * Math.cos(angle);
      const y1 = cy + innerR * Math.sin(angle);

      // Sharp slanted escapement tooth tip
      const a2 = angle + step * 0.45;
      const x2 = cx + outerR * Math.cos(a2);
      const y2 = cy + outerR * Math.sin(a2);

      const a3 = angle + step * 0.5;
      const x3 = cx + innerR * Math.cos(a3);
      const y3 = cy + innerR * Math.sin(a3);

      if (i === 0) d += `M ${x1} ${y1} `;
      else d += `L ${x1} ${y1} `;
      d += `L ${x2} ${y2} L ${x3} ${y3} `;
    }
    d += "Z ";

    d += `M ${cx} ${cy - holeR} A ${holeR} ${holeR} 0 1 0 ${cx} ${cy + holeR} A ${holeR} ${holeR} 0 1 0 ${cx} ${cy - holeR} Z `;

    // Elegant curved filigree spokes
    const spokeCount = 5;
    const spokeAngle = (Math.PI * 2) / spokeCount;
    for (let i = 0; i < spokeCount; i++) {
      const aStart = i * spokeAngle;
      const aEnd = aStart + 0.25;
      const sx1 = cx + (holeR + 5) * Math.cos(aStart);
      const sy1 = cy + (holeR + 5) * Math.sin(aStart);
      const sx2 = cx + (innerR - 6) * Math.cos(aEnd);
      const sy2 = cy + (innerR - 6) * Math.sin(aEnd);
      
      d += `M ${sx1} ${sy1} Q ${cx + (innerR/1.8)*Math.cos(aStart+0.15)} ${cy + (innerR/1.8)*Math.sin(aStart+0.15)} ${sx2} ${sy2} `;
    }
    return d;
  }

  // Inject dynamic gears into their respective parallax layers
  const gearLayers = {
    back: document.getElementById('svg-gears-back'),
    mid: document.getElementById('svg-gears-mid'),
    front: document.getElementById('svg-gears-front')
  };

  function injectGears() {
    // 1. Hour Gear (Back Layer, slow, large)
    const gHour = document.createElementNS("http://www.w3.org/2000/svg", "path");
    gHour.setAttribute("id", "gear-hour");
    gHour.setAttribute("class", "gear-metal");
    gHour.setAttribute("d", createGearPath(400, 400, 210, 230, 72, 140, 10));
    gearLayers.back.appendChild(gHour);

    // 2. Minute Gear (Mid Layer, medium-large)
    const gMinute = document.createElementNS("http://www.w3.org/2000/svg", "path");
    gMinute.setAttribute("id", "gear-minute");
    gMinute.setAttribute("class", "gear-accent");
    gMinute.setAttribute("d", createGearPath(400, 400, 130, 146, 48, 80, 8));
    gearLayers.mid.appendChild(gMinute);

    // 3. Left Idler (Mid Layer, meshes with Minute Gear)
    const gLeftIdler = document.createElementNS("http://www.w3.org/2000/svg", "path");
    gLeftIdler.setAttribute("id", "gear-left-idler");
    gLeftIdler.setAttribute("class", "gear-metal");
    gLeftIdler.setAttribute("d", createGearPath(245, 310, 60, 72, 24, 20, 5));
    gearLayers.mid.appendChild(gLeftIdler);

    // 4. Right Idler (Mid Layer, meshes with Minute Gear)
    const gRightIdler = document.createElementNS("http://www.w3.org/2000/svg", "path");
    gRightIdler.setAttribute("id", "gear-right-idler");
    gRightIdler.setAttribute("class", "gear-metal");
    gRightIdler.setAttribute("d", createGearPath(555, 310, 60, 72, 24, 20, 5));
    gearLayers.mid.appendChild(gRightIdler);

    // 5. Seconds Gear (Front Layer, center)
    const gSeconds = document.createElementNS("http://www.w3.org/2000/svg", "path");
    gSeconds.setAttribute("id", "gear-seconds");
    gSeconds.setAttribute("class", "gear-metal");
    gSeconds.setAttribute("d", createGearPath(400, 400, 70, 82, 30, 25, 5));
    gearLayers.front.appendChild(gSeconds);

    // 6. Escape Wheel (Front Layer, top)
    const gEscape = document.createElementNS("http://www.w3.org/2000/svg", "path");
    gEscape.setAttribute("id", "gear-escape");
    gEscape.setAttribute("class", "gear-accent");
    gEscape.setAttribute("d", createEscapeWheelPath(400, 200, 42, 54, 15, 12));
    gearLayers.front.appendChild(gEscape);

    // 7. Escapement Pinion (Front Layer, meshes Seconds and Escape)
    const gPinion = document.createElementNS("http://www.w3.org/2000/svg", "path");
    gPinion.setAttribute("id", "gear-pinion");
    gPinion.setAttribute("class", "gear-metal");
    gPinion.setAttribute("d", createGearPath(400, 295, 28, 38, 12, 10, 3));
    gearLayers.front.appendChild(gPinion);
  }
  injectGears();


  // --- POPULATE ROMAN NUMERALS & DIAL TICKS ---
  const numeralsContainer = document.getElementById('roman-numerals');
  const numerals = ["XII", "I", "II", "III", "IV", "V", "VI", "VII", "VIII", "IX", "X", "XI"];
  const dialRadius = 290;

  numerals.forEach((num, index) => {
    const angle = (index * 30 - 90) * (Math.PI / 180);
    const x = 400 + dialRadius * Math.cos(angle);
    const y = 400 + dialRadius * Math.sin(angle);

    const text = document.createElementNS("http://www.w3.org/2000/svg", "text");
    text.setAttribute("x", x);
    text.setAttribute("y", y);
    text.textContent = num;
    numeralsContainer.appendChild(text);
  });

  const ticksContainer = document.getElementById('minute-ticks');
  for (let i = 0; i < 60; i++) {
    if (i % 5 === 0) continue; // Skip primary hours
    const angle = (i * 6 - 90) * (Math.PI / 180);
    const x1 = 400 + 308 * Math.cos(angle);
    const y1 = 400 + 308 * Math.sin(angle);
    const x2 = 400 + 314 * Math.cos(angle);
    const y2 = 400 + 314 * Math.sin(angle);

    const line = document.createElementNS("http://www.w3.org/2000/svg", "line");
    line.setAttribute("x1", x1);
    line.setAttribute("y1", y1);
    line.setAttribute("x2", x2);
    line.setAttribute("y2", y2);
    ticksContainer.appendChild(line);
  }


  // --- CLOCKWORK ANIMATION LOOP ---
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
      pinion: document.getElementById('gear-pinion')
    },
    pendulum: document.getElementById('pendulum-assembly'),
    anchor: document.getElementById('anchor-assembly'),
    cabinet: document.getElementById('main-cabinet'),
    boilerNeedle: document.getElementById('needle-boiler'),
    torqueNeedle: document.getElementById('needle-torque'),
    boilerVal: document.getElementById('val-boiler'),
    torqueVal: document.getElementById('val-torque'),
    diagFps: document.getElementById('diag-fps'),
    diagRate: document.getElementById('diag-rate')
  };

  function updateClock(timestamp) {
    if (!state.lastFrameTime) state.lastFrameTime = timestamp;
    const delta = (timestamp - state.lastFrameTime) / 1000;
    state.lastFrameTime = timestamp;

    // Smooth FPS Calculation
    if (delta > 0) {
      const currentFps = 1 / delta;
      state.fps = state.fps * 0.95 + currentFps * 0.05;
      elements.diagFps.textContent = state.fps.toFixed(1);
    }

    // Advance clock time based on speed multiplier
    state.currentTimeSec += delta * state.speedMultiplier;
    if (state.currentTimeSec >= 86400) state.currentTimeSec -= 86400; // Loop 24h

    const t = state.currentTimeSec;

    // --- GEAR & HAND ROTATIONS ---
    // Seconds & Gear (60s rotation = 6 deg/s)
    const secAngle = t * 6;
    elements.hands.second.setAttribute("transform", `rotate(${secAngle} 400 400)`);
    elements.gears.seconds.setAttribute("transform", `rotate(${secAngle} 400 400)`);

    // Pinion (meshes with Seconds). Ratio = 30/12 = 2.5. Rotates opposite.
    const pinionAngle = -secAngle * 2.5;
    elements.gears.pinion.setAttribute("transform", `rotate(${pinionAngle} 400 295)`);

    // Minutes & Gear (60m rotation = 0.1 deg/s)
    const minAngle = (t / 60) * 6;
    elements.hands.minute.setAttribute("transform", `rotate(${minAngle} 400 400)`);
    elements.gears.minute.setAttribute("transform", `rotate(${minAngle} 400 400)`);

    // Left & Right Idlers (meshes with Minute Gear). Ratio = 48/24 = 2. Rotates opposite.
    const idlerAngle = -minAngle * 2;
    elements.gears.leftIdler.setAttribute("transform", `rotate(${idlerAngle} 245 310)`);
    elements.gears.rightIdler.setAttribute("transform", `rotate(${idlerAngle} 555 310)`);

    // Hours & Gear (12h rotation = 0.00833 deg/s)
    const hourAngle = (t / 3600) * 30;
    elements.hands.hour.setAttribute("transform", `rotate(${hourAngle} 400 400)`);
    elements.gears.hour.setAttribute("transform", `rotate(${hourAngle} 400 400)`);

    // --- ESCAPEMENT & PENDULUM (1Hz nominal frequency) ---
    // Scale swing frequency with speed multiplier
    const swingFreq = 1.0 * state.speedMultiplier;
    const swingAngle = Math.sin(t * Math.PI * 2) * 11; // Swing range 11 degrees
    elements.pendulum.setAttribute("transform", `rotate(${swingAngle} 400 100)`);

    // Escapement pallet fork rocks in counter-phase with the pendulum
    const anchorAngle = -Math.sin(t * Math.PI * 2) * 5.5;
    elements.anchor.setAttribute("transform", `rotate(${anchorAngle} 400 130)`);

    // Deadbeat Escapement Wheel advance
    const escapeTicks = Math.floor(t * 2); // 2 ticks per simulated second
    const tickFraction = (t * 2) % 1;
    const snapFactor = Math.pow(tickFraction, 5); // Sharp mechanical release snap
    const escapeAngle = (escapeTicks + snapFactor) * (360 / 30); // 15 teeth = 30 states
    elements.gears.escape.setAttribute("transform", `rotate(${-escapeAngle} 400 200)`);

    // Trigger tick acoustics on new state transition
    if (escapeTicks !== state.lastTickIndex) {
      state.lastTickIndex = escapeTicks;
      playTick(escapeTicks % 2 === 0);
    }

    // --- DYNAMIC GLASS STEAM GAUGES ---
    // Boiler PSI reacts to clock speed (simulated thermodynamic power required)
    state.targetBoilerPSI = 12 + (state.speedMultiplier * 1.6) + Math.sin(timestamp / 800) * 1.5;
    state.currentBoilerPSI = state.currentBoilerPSI * 0.9 + state.targetBoilerPSI * 0.1;
    
    // Torque reacts to speed with some high frequency vibration noise
    state.targetTorque = 4.2 + (state.speedMultiplier * 0.35) + (Math.random() - 0.5) * 0.3;
    state.currentTorque = state.currentTorque * 0.85 + state.targetTorque * 0.15;

    // Convert values to needle rotation angles (-120deg to 120deg range)
    const boilerAngle = -120 + Math.min(state.currentBoilerPSI / 100, 1) * 240;
    const torqueAngle = -120 + Math.min(state.currentTorque / 25, 1) * 240;

    elements.boilerNeedle.style.transform = `rotate(${boilerAngle}deg)`;
    elements.torqueNeedle.style.transform = `rotate(${torqueAngle}deg)`;

    elements.boilerVal.textContent = Math.max(0, state.currentBoilerPSI).toFixed(1);
    elements.torqueVal.textContent = Math.max(0, state.currentTorque).toFixed(2);

    // Update Diagnostics
    elements.diagRate.textContent = `${(1.0 * state.speedMultiplier).toFixed(2)} Hz`;

    // --- 3D INTERACTIVE CABINET PARALLAX ---
    // Smoothly interpolate rotation towards target
    state.cabinetRotation.x += (state.cabinetTargetRotation.x - state.cabinetRotation.x) * 0.1;
    state.cabinetRotation.y += (state.cabinetTargetRotation.y - state.cabinetRotation.y) * 0.1;

    elements.cabinet.style.transform = `rotateX(${state.cabinetRotation.x}deg) rotateY(${state.cabinetRotation.y}deg)`;

    // Apply translation depth offsets to individual layers inside the cabinet
    const layers = elements.cabinet.querySelectorAll('.cabinet-layer');
    layers.forEach(layer => {
      const depth = parseFloat(layer.getAttribute('data-depth'));
      // Calculate parallax translation offsets based on current rotation
      const tx = state.cabinetRotation.y * depth * -1.8;
      const ty = state.cabinetRotation.x * depth * 1.8;
      const tz = depth * 45; // Physical separation distance along Z axis
      layer.style.transform = `translate3d(${tx}px, ${ty}px, ${tz}px)`;
    });

    // --- RENDER PARTICLES (CANVAS) ---
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    spawnEmbers();
    particles = particles.filter(p => {
      p.update();
      p.draw();
      return p.life < p.maxLife;
    });

    requestAnimationFrame(updateClock);
  }


  // --- INTERACTION & CONTROLS ---

  // 3D Mouse Tracking for Parallax
  window.addEventListener('mousemove', (e) => {
    // Normalize coordinates around center of screen (-1 to 1)
    const nx = (e.clientX / window.innerWidth) * 2 - 1;
    const ny = (e.clientY / window.innerHeight) * 2 - 1;

    // Limit maximum tilt angle
    state.cabinetTargetRotation.y = nx * 18; // Max 18 degrees yaw
    state.cabinetTargetRotation.x = -ny * 18; // Max 18 degrees pitch
  });

  // Handle touch events for mobile parallax
  window.addEventListener('touchmove', (e) => {
    if (e.touches.length > 0) {
      const nx = (e.touches[0].clientX / window.innerWidth) * 2 - 1;
      const ny = (e.touches[0].clientY / window.innerHeight) * 2 - 1;
      state.cabinetTargetRotation.y = nx * 14;
      state.cabinetTargetRotation.x = -ny * 14;
    }
  });

  // Speed Regulator Slider
  const speedSlider = document.getElementById('speed-slider');
  const speedIndicator = document.getElementById('speed-indicator');
  speedSlider.addEventListener('input', (e) => {
    state.speedMultiplier = parseFloat(e.target.value);
    speedIndicator.textContent = `${state.speedMultiplier.toFixed(2)}x`;
    updateGearHum();
  });

  // Material Theme Switcher
  const themeButtons = document.querySelectorAll('.theme-btn');
  themeButtons.forEach(btn => {
    btn.addEventListener('click', (e) => {
      themeButtons.forEach(b => b.classList.remove('active'));
      const activeBtn = e.currentTarget;
      activeBtn.classList.add('active');
      
      const themeName = activeBtn.getAttribute('data-theme');
      state.theme = themeName;
      
      document.body.className = `theme-${themeName}`;
    });
  });

  // Sound Toggle Button
  const btnAudio = document.getElementById('btn-audio');
  const audioIcon = document.getElementById('audio-icon');
  btnAudio.addEventListener('click', () => {
    initAudio();
    state.isMuted = !state.isMuted;
    if (state.isMuted) {
      btnAudio.classList.add('muted');
      btnAudio.innerHTML = `<span class="btn-icon">🔇</span> SOUND OFF`;
    } else {
      btnAudio.classList.remove('muted');
      btnAudio.innerHTML = `<span class="btn-icon">🔊</span> SOUND ON`;
      if (audioCtx.state === 'suspended') {
        audioCtx.resume();
      }
    }
    updateGearHum();
  });

  // Steam Release Button
  document.getElementById('btn-steam').addEventListener('click', () => {
    initAudio();
    triggerSteamExplosion();
  });

  // Gong Chime Button
  document.getElementById('btn-gong').addEventListener('click', () => {
    initAudio();
    playChime();
  });


  // --- START ENGINE ---
  requestAnimationFrame(updateClock);
});