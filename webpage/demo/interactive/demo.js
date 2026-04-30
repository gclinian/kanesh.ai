// ============================================================
// Kanesh — Interactive Demo Animation
// 9 scenes, ~70 seconds. GSAP-driven, layout-aware.
// ============================================================

(() => {
  'use strict';

  const $ = (s) => document.querySelector(s);
  const $$ = (s) => Array.from(document.querySelectorAll(s));

  // -----------------------------------------------------------
  // Scene captions (timed to scene start)
  // -----------------------------------------------------------
  const SCENES = [
    { t: 0,  num: 1, text: 'Three data providers hold billions of dollars of design data — locked away.' },
    { t: 5,  num: 2, text: 'An AI developer wants to train a DRC violation predictor.' },
    { t: 10, num: 3, text: 'They post a training job to Kanesh, with a bounty.' },
    { t: 16, num: 4, text: 'Kanesh sends the model — never asks for the data.' },
    { t: 22, num: 5, text: 'Training happens where the data lives. Inside the vault. Always.' },
    { t: 32, num: 6, text: 'Only encrypted gradients leave — protected by 5 cryptographic layers.' },
    { t: 44, num: 7, text: 'Kanesh aggregates. The model gets stronger with every contribution.' },
    { t: 52, num: 8, text: 'The developer gets a model trained on industry-grade data — legally.' },
    { t: 60, num: 9, text: 'Providers earn — fairly, proportionally, automatically. Data stayed home.' },
  ];

  const TOTAL_DURATION = 70; // timeline-time seconds (not wall-clock)
  const SPEED = 3;            // 3× faster — wall-clock duration ≈ 70/3 = 23 s

  // -----------------------------------------------------------
  // Position helpers (relative to canvas)
  // -----------------------------------------------------------
  const canvas = $('#canvas');

  function rectIn(el) {
    const c = canvas.getBoundingClientRect();
    const r = el.getBoundingClientRect();
    return {
      x: r.left - c.left,
      y: r.top - c.top,
      w: r.width,
      h: r.height,
      cx: r.left - c.left + r.width / 2,
      cy: r.top - c.top + r.height / 2,
    };
  }

  // Place a packet centered at (x, y), measuring its own width
  function placeCentered(packet, x, y) {
    const r = packet.getBoundingClientRect();
    return { x: x - r.width / 2, y: y - r.height / 2 };
  }

  // -----------------------------------------------------------
  // Build timeline
  // -----------------------------------------------------------
  function build() {
    const tl = gsap.timeline({
      paused: true,
      onUpdate: () => {
        const p = (tl.time() / TOTAL_DURATION) * 100;
        $('#progress').style.width = Math.min(p, 100) + '%';
      },
    });
    tl.timeScale(SPEED); // affects play() / reverse(); tweenTo needs explicit duration

    // Schedule caption + scene-number changes
    SCENES.forEach((s, i) => {
      tl.call(() => updateCaption(s.text, s.num), [], s.t);
    });

    // Initial state — set all packets to platform center, opacity 0
    const platform = $('#platform');
    const developer = $('#developer');
    const vaults = {
      dp1: $('#vault-1'),
      dp2: $('#vault-2'),
      dp3: $('#vault-3'),
    };

    // Place every packet at platform center initially (will fade in/move from there)
    function resetPacket(id, anchor = platform) {
      const a = rectIn(anchor);
      const el = $('#' + id);
      const c = placeCentered(el, a.cx, a.cy);
      gsap.set(el, { x: c.x, y: c.y, opacity: 0 });
    }

    // Helper to fly a packet from anchor A → anchor B
    function flyPacket(packetId, fromEl, toEl, opts = {}) {
      const el = $('#' + packetId);
      const from = rectIn(fromEl);
      const to = rectIn(toEl);
      const start = placeCentered(el, from.cx, from.cy);
      const end = placeCentered(el, to.cx, to.cy);
      const tlLocal = gsap.timeline();
      tlLocal.set(el, { x: start.x, y: start.y, opacity: 0 });
      tlLocal.to(el, { opacity: 1, duration: 0.25 });
      tlLocal.to(el, {
        x: end.x,
        y: end.y,
        duration: opts.duration ?? 1.2,
        ease: opts.ease ?? 'power2.inOut',
      }, '-=0.05');
      tlLocal.to(el, { opacity: 0, duration: 0.25 }, '+=0.1');
      return tlLocal;
    }

    // ===== Scene 2 (t=5): Developer pulses =====
    tl.fromTo(developer,
      { scale: 1 },
      { scale: 1.06, duration: 0.4, yoyo: true, repeat: 1, ease: 'sine.inOut' },
      5
    );

    // ===== Scene 3 (t=10): Bounty Developer → Kanesh =====
    tl.add(flyPacket('p-bounty', developer, platform, { duration: 1.5 }), 10);

    // ===== Scene 4 (t=16): Model Kanesh → 3 Providers =====
    tl.add(flyPacket('p-model-1', platform, vaults.dp1, { duration: 1.5 }), 16);
    tl.add(flyPacket('p-model-2', platform, vaults.dp2,  { duration: 1.5 }), 16.2);
    tl.add(flyPacket('p-model-3', platform, vaults.dp3,  { duration: 1.5 }), 16.4);

    // ===== Scene 5 (t=22): Training in vaults — vaults light up =====
    tl.call(() => {
      Object.values(vaults).forEach(v => v.classList.add('training'));
    }, [], 22);
    // pulse glow during training
    tl.to(Object.values(vaults), {
      boxShadow: '0 0 36px rgba(212, 170, 111, 0.7), inset 0 0 24px rgba(212, 170, 111, 0.3)',
      duration: 1.4,
      yoyo: true,
      repeat: 4,
      ease: 'sine.inOut',
    }, 22);

    // ===== Scene 6 (t=32): Encrypted gradients flow back, shields light up =====
    // Show shields container
    tl.to('#shields', { opacity: 1, duration: 0.4 }, 32);
    // Light shields one by one
    const shieldEls = $$('.shield');
    shieldEls.forEach((sh, i) => {
      tl.call(() => sh.classList.add('lit'), [], 32 + i * 0.4);
    });
    // Stop training glow + remove training class once gradients fly
    tl.call(() => {
      Object.values(vaults).forEach(v => v.classList.remove('training'));
    }, [], 33);

    // 3 gradients fly back to platform
    tl.add(flyPacket('p-grad-1', vaults.dp1, platform, { duration: 1.6 }), 34);
    tl.add(flyPacket('p-grad-2', vaults.dp2,  platform, { duration: 1.6 }), 34.3);
    tl.add(flyPacket('p-grad-3', vaults.dp3,  platform, { duration: 1.6 }), 34.6);

    // ===== Scene 7 (t=44): Platform aggregates — pulse =====
    tl.call(() => $('#platform').classList.add('aggregating'), [], 44);
    tl.fromTo(platform,
      { scale: 1.04 },
      { scale: 1.08, duration: 0.5, yoyo: true, repeat: 3, ease: 'sine.inOut' },
      44
    );
    // Hide shields after aggregation
    tl.to('#shields', { opacity: 0, duration: 0.4 }, 47);
    tl.call(() => $('#platform').classList.remove('aggregating'), [], 48);

    // ===== Scene 8 (t=52): Trained model → Developer =====
    tl.add(flyPacket('p-model-final', platform, developer, { duration: 1.6 }), 52);
    tl.call(() => $('#developer').classList.add('deployed'), [], 53.5);

    // ===== Scene 9 (t=60): $$$ flows back, proportional =====
    // Money flies developer → kanesh → vaults (in sequence, different sizes already encoded in label)
    tl.add(flyPacket('p-money-1', platform, vaults.dp1, { duration: 1.4 }), 60);
    tl.add(flyPacket('p-money-2', platform, vaults.dp2,  { duration: 1.4 }), 60.4);
    tl.add(flyPacket('p-money-3', platform, vaults.dp3,  { duration: 1.4 }), 60.8);
    // Earnings indicators appear under each vault
    tl.call(() => $('#earn-1').classList.add('show'), [], 62);
    tl.call(() => $('#earn-2').classList.add('show'),  [], 62.4);
    tl.call(() => $('#earn-3').classList.add('show'),  [], 62.8);

    // ===== End (t=68+) =====
    tl.to('#caption', { /* hold final caption */ }, 70);

    return tl;
  }

  // -----------------------------------------------------------
  // Caption updater (with fade)
  // -----------------------------------------------------------
  let _capLock = false;
  function updateCaption(text, num) {
    const cap = $('#caption');
    const sceneNum = $('#scene-num');
    sceneNum.textContent = num;
    if (_capLock) return;
    _capLock = true;
    gsap.to(cap, {
      opacity: 0,
      duration: 0.25,
      onComplete: () => {
        cap.textContent = text;
        gsap.to(cap, {
          opacity: 1,
          duration: 0.35,
          onComplete: () => { _capLock = false; },
        });
      },
    });
  }

  // -----------------------------------------------------------
  // Initial render — make sure layout is settled before measuring
  // -----------------------------------------------------------
  let timeline;

  function init() {
    // Hide all packets initially
    $$('.packet').forEach(p => gsap.set(p, { opacity: 0 }));
    timeline = build();
  }

  function rebuild() {
    if (timeline) timeline.kill();
    init();
  }

  // Wait for fonts + layout
  if (document.fonts && document.fonts.ready) {
    document.fonts.ready.then(init);
  } else {
    window.addEventListener('load', init);
  }

  // Rebuild on resize (debounced) so packet positions stay aligned
  let resizeTimer;
  window.addEventListener('resize', () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(() => {
      const wasPlaying = timeline && timeline.isActive();
      const t = timeline ? timeline.time() : 0;
      rebuild();
      if (wasPlaying) {
        timeline.time(t);
        timeline.play();
      } else if (t > 0) {
        timeline.time(t);
      }
    }, 250);
  });

  // -----------------------------------------------------------
  // Controls — Step-through + continuous play
  // -----------------------------------------------------------
  // Step boundaries: each Next advances to the END of one scene's animated action.
  // Scene 1 is a static intro (no animation), so we skip its end-marker — first Next
  // jumps straight to end of Scene 2 (developer pulse). 8 Next clicks total = 8 actions.
  const PAUSE_POINTS = [9.5, 15.5, 21.5, 31.5, 43.5, 51.5, 59.5, 70];

  const playBtn = $('#play');
  const nextBtn = $('#next');
  const prevBtn = $('#prev');
  const restartBtn = $('#restart');

  let stepTween = null; // tweenTo handle for cancellation

  function killStepTween() {
    if (stepTween && stepTween.isActive && stepTween.isActive()) {
      stepTween.kill();
    }
    stepTween = null;
  }

  function resetVisualState() {
    $$('.vault').forEach(v => v.classList.remove('training'));
    $$('.shield').forEach(s => s.classList.remove('lit'));
    $$('.earnings').forEach(e => e.classList.remove('show'));
    $('#platform').classList.remove('aggregating');
    $('#developer').classList.remove('deployed');
    $$('.packet').forEach(p => gsap.set(p, { opacity: 0 }));
    gsap.set('#shields', { opacity: 0 });
  }

  function setPlayLabel(state) {
    if (state === 'playing') playBtn.textContent = '⏸ Pause';
    else if (state === 'resume') playBtn.textContent = '▶ Resume';
    else playBtn.textContent = '▶ Play all';
  }

  // ===== Next step: play to the next scene boundary, then pause =====
  nextBtn.addEventListener('click', () => {
    if (!timeline) return;
    killStepTween();

    const t = timeline.time();
    let target = PAUSE_POINTS.find((p) => p > t + 0.05);

    if (target === undefined) {
      // Already at the end — wrap back to scene 1's end
      resetVisualState();
      timeline.pause();
      timeline.time(0);
      target = PAUSE_POINTS[0];
    }

    stepTween = timeline.tweenTo(target, {
      duration: (target - t) / SPEED, // tweenTo doesn't inherit timeScale — apply manually
      onComplete: () => {
        timeline.pause();
        setPlayLabel('paused');
      },
    });
    setPlayLabel('playing');
  });

  // ===== Prev step: go back to the previous scene's start, paused =====
  prevBtn.addEventListener('click', () => {
    if (!timeline) return;
    killStepTween();

    const t = timeline.time();
    // Find scene boundary BEFORE current time. Pause point N = end of scene N+1.
    // If we're at PAUSE_POINTS[2] (end of scene 3), prev should land at PAUSE_POINTS[1] (end of scene 2).
    let targetIdx = PAUSE_POINTS.findIndex((p) => p >= t - 0.5);
    targetIdx = Math.max(0, targetIdx - 1);
    const target = targetIdx === 0 && t < PAUSE_POINTS[0] ? 0 : PAUSE_POINTS[Math.max(0, targetIdx - 1)] || 0;

    // To rewind safely: full reset, then fast-forward (no flicker, callbacks fire correctly)
    resetVisualState();
    timeline.pause();
    timeline.time(0);
    if (target > 0) {
      stepTween = timeline.tweenTo(target, {
        ease: 'none',
        duration: Math.min(0.4, target / 30), // fast rewind
        onComplete: () => {
          timeline.pause();
          setPlayLabel('paused');
        },
      });
      setPlayLabel('playing');
    } else {
      setPlayLabel('paused');
    }
  });

  // ===== Play all: continuous from current point to end =====
  playBtn.addEventListener('click', () => {
    if (!timeline) return;
    killStepTween();

    if (timeline.isActive()) {
      timeline.pause();
      setPlayLabel('resume');
    } else {
      if (timeline.time() >= TOTAL_DURATION - 0.1) {
        resetVisualState();
        timeline.restart();
      } else {
        timeline.play();
      }
      setPlayLabel('playing');
    }
  });

  // ===== Restart: back to scene 1, paused =====
  restartBtn.addEventListener('click', () => {
    if (!timeline) return;
    killStepTween();
    resetVisualState();
    timeline.pause();
    timeline.time(0);
    setPlayLabel('paused');
  });
})();
