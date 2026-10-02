(() => {
  'use strict';
  const hero = document.querySelector('.hero');
  const heading = document.querySelector('#hero-title');
  const titleCanvas = document.querySelector('#stardustTitle');
  const fieldCanvas = document.querySelector('#particleField');
  const soundButton = document.querySelector('#soundToggle');
  const soundLabel = document.querySelector('#soundLabel');
  const motionQuery = matchMedia('(prefers-reduced-motion: reduce)');
  const titleContext = titleCanvas.getContext('2d');
  const fieldContext = fieldCanvas.getContext('2d');
  if (!titleContext || !fieldContext) return;

  let titleWidth = 0;
  let titleHeight = 0;
  let fieldWidth = 0;
  let fieldHeight = 0;
  let letters = [];
  let stars = [];
  let frame = 0;
  let lastFrame = 0;
  let elapsed = 0;
  let visible = true;
  const pointer = { x: -1000, y: -1000, targetX: -1000, targetY: -1000, active: false };
  const parallax = { x: 0, y: 0, targetX: 0, targetY: 0 };
  const colors = ['#d7e7ff', '#a9cbee', '#eef4ff'];

  const sizeCanvas = (canvas, context) => {
    const rect = canvas.getBoundingClientRect();
    const dpr = Math.min(devicePixelRatio || 1, 2);
    canvas.width = Math.round(rect.width * dpr);
    canvas.height = Math.round(rect.height * dpr);
    context.setTransform(dpr, 0, 0, dpr, 0, 0);
    return rect;
  };

  const rebuild = () => {
    const titleRect = sizeCanvas(titleCanvas, titleContext);
    titleWidth = titleRect.width;
    titleHeight = titleRect.height;
    const mask = document.createElement('canvas');
    mask.width = Math.max(1, Math.round(titleWidth));
    mask.height = Math.max(1, Math.round(titleHeight));
    const maskContext = mask.getContext('2d', { willReadFrequently: true });
    if (!maskContext || titleWidth < 1) return;
    const fontSize = Math.min(titleHeight * .82, (titleWidth - 36) / 2.3);
    maskContext.font = `700 ${fontSize}px Arial, sans-serif`;
    maskContext.textBaseline = 'middle';
    const glyphs = ['L', 'E', 'O'];
    const gap = fontSize * .13;
    const widths = glyphs.map(glyph => maskContext.measureText(glyph).width);
    const total = widths.reduce((sum, width) => sum + width, 0) + gap * 2;
    let left = (titleWidth - total) / 2;
    glyphs.forEach((glyph, index) => {
      maskContext.fillText(glyph, left, titleHeight * .52);
      left += widths[index] + gap;
    });
    const pixels = maskContext.getImageData(0, 0, mask.width, mask.height).data;
    const spacing = titleWidth < 500 ? 2.3 : 3.1;
    const next = [];
    for (let y = 0; y < mask.height; y += spacing) {
      for (let x = 0; x < mask.width; x += spacing) {
        if (pixels[(Math.floor(y) * mask.width + Math.floor(x)) * 4 + 3] < 130) continue;
        const homeX = x + (Math.random() - .5) * .9;
        const homeY = y + (Math.random() - .5) * .9;
        next.push({ homeX, homeY, x: homeX, y: homeY, vx: 0, vy: 0,
          radius: titleWidth < 500 ? .55 + Math.random() * .4 : .65 + Math.random() * .5,
          phase: Math.random() * Math.PI * 2, scatter: .55 + Math.random() * 1.1,
          group: Math.floor(Math.random() * colors.length) });
      }
    }
    letters = next;
    heading.classList.toggle('particle-ready', letters.length > 0);
    const fieldRect = sizeCanvas(fieldCanvas, fieldContext);
    fieldWidth = fieldRect.width;
    fieldHeight = fieldRect.height;
    const count = Math.min(160, Math.max(60, Math.round(fieldWidth / 11)));
    stars = Array.from({ length: count }, () => ({
      x: Math.random() * fieldWidth, y: Math.random() * fieldHeight,
      depth: .2 + Math.random() * .8, phase: Math.random() * Math.PI * 2,
      radius: .35 + Math.random() * 1.1, drift: .4 + Math.random() * 1.3
    }));
    renderTitle(0);
    renderField();
  };

  const renderTitle = dt => {
    titleContext.clearRect(0, 0, titleWidth, titleHeight);
    const calm = motionQuery.matches;
    const radius = titleWidth < 500 ? 58 : 108;
    const damping = Math.pow(.91, dt);
    if (pointer.active) {
      pointer.x += (pointer.targetX - pointer.x) * (1 - Math.pow(.84, dt));
      pointer.y += (pointer.targetY - pointer.y) * (1 - Math.pow(.84, dt));
    }
    for (const particle of letters) {
      const targetX = particle.homeX + (calm ? 0 : Math.sin(elapsed * .38 + particle.phase) * .65);
      const targetY = particle.homeY + (calm ? 0 : Math.cos(elapsed * .31 + particle.phase) * .65);
      if (!calm && dt > 0) {
        particle.vx += (targetX - particle.x) * .009 * dt;
        particle.vy += (targetY - particle.y) * .009 * dt;
        if (pointer.active) {
          const dx = particle.x - pointer.x;
          const dy = particle.y - pointer.y;
          const distance = Math.hypot(dx, dy);
          if (distance < radius) {
            const falloff = Math.pow(1 - distance / radius, 2);
            const angle = distance > .01 ? Math.atan2(dy, dx) : particle.phase;
            particle.vx += (Math.cos(angle) * .67 - Math.sin(angle) * .12) * falloff * particle.scatter * dt;
            particle.vy += (Math.sin(angle) * .67 + Math.cos(angle) * .12) * falloff * particle.scatter * dt;
          }
        }
        particle.vx *= damping;
        particle.vy *= damping;
        particle.x += particle.vx * dt;
        particle.y += particle.vy * dt;
      } else if (calm) {
        particle.x = particle.homeX;
        particle.y = particle.homeY;
        particle.vx = particle.vy = 0;
      }
    }
    for (let group = 0; group < colors.length; group++) {
      titleContext.fillStyle = colors[group];
      titleContext.globalAlpha = .72 + Math.sin(elapsed * .45 + group) * .08;
      titleContext.beginPath();
      for (const particle of letters) {
        if (particle.group !== group) continue;
        titleContext.moveTo(particle.x + particle.radius, particle.y);
        titleContext.arc(particle.x, particle.y, particle.radius, 0, Math.PI * 2);
      }
      titleContext.fill();
    }
    titleContext.globalAlpha = 1;
  };

  const renderField = () => {
    fieldContext.clearRect(0, 0, fieldWidth, fieldHeight);
    fieldContext.fillStyle = '#b8d4f5';
    for (const star of stars) {
      const x = star.x + Math.sin(elapsed * .045 + star.phase) * 12 * star.drift + parallax.x * star.depth;
      const y = star.y + Math.cos(elapsed * .038 + star.phase) * 10 * star.drift + parallax.y * star.depth;
      fieldContext.globalAlpha = (.16 + star.depth * .38) * (.8 + Math.sin(elapsed * .32 + star.phase) * .2);
      fieldContext.beginPath();
      fieldContext.arc(x, y, star.radius * star.depth, 0, Math.PI * 2);
      fieldContext.fill();
      if (star.depth > .85) {
        fieldContext.globalAlpha *= .16;
        fieldContext.beginPath();
        fieldContext.arc(x, y, star.radius * 4, 0, Math.PI * 2);
        fieldContext.fill();
      }
    }
    fieldContext.globalAlpha = 1;
    // A distant, slowly drifting arc adds a third depth plane behind the stars.
    fieldContext.strokeStyle = '#a0c5f21c';
    fieldContext.lineWidth = .65;
    fieldContext.beginPath();
    fieldContext.ellipse(fieldWidth * .77 + parallax.x * .3, fieldHeight * .42,
      fieldWidth * .38, fieldHeight * .24, -.32 + Math.sin(elapsed * .018) * .06, .15, 2.9);
    fieldContext.stroke();
  };

  const draw = now => {
    frame = 0;
    if (!visible || document.hidden) return;
    const dt = lastFrame ? Math.min((now - lastFrame) / 16.667, 2) : 1;
    lastFrame = now;
    if (!motionQuery.matches) elapsed += dt / 60;
    parallax.x += (parallax.targetX - parallax.x) * .025 * dt;
    parallax.y += (parallax.targetY - parallax.y) * .025 * dt;
    renderTitle(dt);
    renderField();
    if (!motionQuery.matches) frame = requestAnimationFrame(draw);
  };
  const start = () => {
    if (frame || !visible || document.hidden) return;
    lastFrame = 0;
    frame = requestAnimationFrame(draw);
  };
  const stop = () => {
    cancelAnimationFrame(frame);
    frame = 0;
    lastFrame = 0;
  };

  // Original pentatonic phrases, rendered locally as soft music-box overtones.
  // Sound is opt-in. No audio request, autoplay, or per-mouse-event beep.
  const AudioEngine = window.AudioContext || window.webkitAudioContext;
  let audio = null;
  let enabled = false;
  let soundBusy = false;
  let timer = 0;
  let nextNote = 0;
  let step = 0;
  let lastMovement = 0;
  let resumeTimer = 0;
  const phrase = [74, 78, 81, 85, 83, 81, 78, 76, 73, 78, 81, 83, 85, 81, 78, 76];
  const rhythm = [1.08, .88, 1.24, 1.48, 1.04, .92, 1.2, 1.7];
  const outputLevel = .22;

  const refreshSoundLabel = () => {
    soundButton.setAttribute('aria-pressed', String(enabled));
    const english = document.documentElement.lang === 'en';
    const zh = enabled ? '旋律已开启' : '开启旋律';
    const en = enabled ? 'SOUND ON' : 'SOUND OFF';
    soundLabel.dataset.zh = zh;
    soundLabel.dataset.en = en;
    soundLabel.textContent = english ? en : zh;
    soundButton.setAttribute('aria-label', english ? (enabled ? 'Mute stardust melody' : 'Enable stardust melody') : (enabled ? '关闭星尘旋律' : '开启星尘旋律'));
  };
  new MutationObserver(refreshSoundLabel).observe(document.documentElement, { attributes: true, attributeFilter: ['lang'] });

  const buildAudio = () => {
    const context = new AudioEngine();
    const bus = context.createGain();
    const master = context.createGain();
    master.gain.value = 0;
    const filter = context.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.value = 4100;
    filter.Q.value = .35;
    const compressor = context.createDynamicsCompressor();
    compressor.threshold.value = -24;
    compressor.knee.value = 20;
    compressor.ratio.value = 3;
    const reverb = context.createConvolver();
    const length = Math.floor(context.sampleRate * 3.4);
    const impulse = context.createBuffer(2, length, context.sampleRate);
    for (let channel = 0; channel < 2; channel++) {
      const samples = impulse.getChannelData(channel);
      let smooth = 0;
      for (let i = 0; i < length; i++) {
        smooth = smooth * .6 + (Math.random() * 2 - 1) * .4;
        samples[i] = smooth * Math.pow(1 - i / length, 2.7) * .35;
      }
    }
    reverb.buffer = impulse;
    const wet = context.createGain();
    wet.gain.value = .38;
    bus.connect(filter);
    bus.connect(reverb);
    reverb.connect(wet);
    wet.connect(filter);
    filter.connect(compressor);
    compressor.connect(master);
    master.connect(context.destination);
    return { context, bus, master };
  };
  const rampVolume = level => {
    if (!audio) return;
    audio.master.gain.setTargetAtTime(level, audio.context.currentTime, .32);
  };
  const playNote = (midi, when, pan) => {
    const context = audio.context;
    const frequency = 440 * Math.pow(2, (midi - 69) / 12);
    const panner = context.createStereoPanner ? context.createStereoPanner() : context.createGain();
    if (panner.pan) panner.pan.value = pan;
    panner.connect(audio.bus);
    const partials = [[1, .075, 2.8], [2, .018, 1.9], [3, .008, 1.2], [4.17, .003, .7]];
    partials.forEach(([ratio, level, decay], index) => {
      const oscillator = context.createOscillator();
      const envelope = context.createGain();
      oscillator.type = 'sine';
      oscillator.frequency.value = frequency * ratio;
      oscillator.detune.value = index === 0 ? -2 : 2;
      envelope.gain.setValueAtTime(.0001, when);
      envelope.gain.linearRampToValueAtTime(level, when + .085);
      envelope.gain.exponentialRampToValueAtTime(.0001, when + decay);
      oscillator.connect(envelope);
      envelope.connect(panner);
      oscillator.start(when);
      oscillator.stop(when + decay + .1);
      oscillator.onended = () => { oscillator.disconnect(); envelope.disconnect(); };
    });
    setTimeout(() => panner.disconnect(), Math.max(0, (when - context.currentTime + 3.1) * 1000));
  };
  const pauseSound = () => {
    clearTimeout(timer);
    timer = 0;
    rampVolume(0);
  };
  const schedule = () => {
    timer = 0;
    if (!enabled || !audio || !pointer.active || !visible || document.hidden) return;
    const context = audio.context;
    if (context.state !== 'running') return;
    if (performance.now() - lastMovement < 1800) {
      rampVolume(outputLevel);
      if (nextNote < context.currentTime + .12) {
        nextNote = Math.max(nextNote, context.currentTime + .08);
        const index = step % phrase.length;
        const pan = Math.max(-.45, Math.min(.45, (pointer.targetX / titleWidth - .5) * .7));
        playNote(phrase[index], nextNote, pan);
        if (index === 0 || index === 8) playNote(phrase[index] - 12, nextNote + .16, -pan * .5);
        nextNote += rhythm[step % rhythm.length];
        step++;
      }
    } else rampVolume(0);
    timer = setTimeout(schedule, 110);
  };
  const activateSound = () => {
    lastMovement = performance.now();
    if (!timer && enabled && audio?.context.state === 'running') {
      nextNote = Math.max(nextNote, audio.context.currentTime + .16);
      schedule();
    }
  };

  if (!AudioEngine) {
    soundButton.disabled = true;
    soundLabel.textContent = '声音暂不可用';
  } else soundButton.addEventListener('click', async () => {
    if (soundBusy) return;
    if (enabled) {
      enabled = false;
      pauseSound();
      refreshSoundLabel();
      // Allow the release to finish before suspending the idle audio graph.
      clearTimeout(resumeTimer);
      resumeTimer = setTimeout(() => { if (!enabled) audio.context.suspend().catch(() => {}); }, 1600);
      return;
    }
    soundBusy = true;
    try {
      clearTimeout(resumeTimer);
      if (!audio) audio = buildAudio();
      await audio.context.resume();
      enabled = audio.context.state === 'running';
      refreshSoundLabel();
    } catch {
      soundButton.disabled = true;
      soundLabel.textContent = '声音暂不可用';
    } finally { soundBusy = false; }
  });

  heading.addEventListener('pointermove', event => {
    const rect = titleCanvas.getBoundingClientRect();
    pointer.targetX = event.clientX - rect.left;
    pointer.targetY = event.clientY - rect.top;
    if (!pointer.active) { pointer.x = pointer.targetX; pointer.y = pointer.targetY; }
    pointer.active = true;
    document.querySelector('.cursor-orbit')?.classList.add('is-stardust');
    activateSound();
    if (motionQuery.matches) start();
  }, { passive: true });
  const leaveTitle = () => {
    pointer.active = false;
    document.querySelector('.cursor-orbit')?.classList.remove('is-stardust');
    pauseSound();
  };
  heading.addEventListener('pointerleave', leaveTitle);
  heading.addEventListener('pointerup', event => { if (event.pointerType !== 'mouse') leaveTitle(); });
  heading.addEventListener('pointercancel', leaveTitle);
  hero.addEventListener('pointermove', event => {
    const rect = hero.getBoundingClientRect();
    parallax.targetX = motionQuery.matches ? 0 : (event.clientX / rect.width - .5) * 14;
    parallax.targetY = motionQuery.matches ? 0 : ((event.clientY - rect.top) / rect.height - .5) * 12;
  }, { passive: true });
  hero.addEventListener('pointerleave', () => { parallax.targetX = parallax.targetY = 0; });

  const visibilityObserver = new IntersectionObserver(entries => {
    visible = entries[0].isIntersecting;
    if (visible) start();
    else { stop(); leaveTitle(); }
  }, { threshold: 0 });
  visibilityObserver.observe(hero);
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) {
      stop();
      leaveTitle();
      if (audio) audio.context.suspend().catch(() => {});
    } else {
      start();
      if (enabled && audio?.context.state === 'suspended') audio.context.resume().catch(() => {
        enabled = false;
        refreshSoundLabel();
      });
    }
  });
  window.addEventListener('blur', leaveTitle);
  motionQuery.addEventListener('change', () => { stop(); rebuild(); start(); });
  const resizeObserver = new ResizeObserver(() => { rebuild(); start(); });
  resizeObserver.observe(heading);
  resizeObserver.observe(hero);
  rebuild();
  start();
})();
