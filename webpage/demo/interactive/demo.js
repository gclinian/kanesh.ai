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
    { t: 5,  num: 2, text: 'An AI developer posts a training job to Kanesh, with a bounty.' },
    { t: 16, num: 3, text: 'Kanesh sends the model — never asks for the data.' },
    { t: 22, num: 4, text: 'Training happens where the data lives. Inside the vault. Always.' },
    { t: 32, num: 5, text: 'Only encrypted gradients leave — protected by 5 cryptographic layers.' },
    { t: 44, num: 6, text: 'Kanesh aggregates. The model gets stronger with every contribution.' },
    { t: 52, num: 7, text: 'The developer gets a model trained on industry-grade data — legally.' },
    { t: 60, num: 8, text: 'A customer pays the AI developer. Kanesh routes the revenue to providers proportionally.' },
    { t: 67, num: 9, text: 'Every customer payment auto-flows. Recurring revenue, no extra action needed.' },
  ];

  const TOTAL_DURATION = 75; // timeline-time seconds (not wall-clock)
  const SPEED = 3;            // 3× faster — wall-clock duration ≈ 75/3 = 25 s

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
    const customers = $('#customers');
    const vaults = {
      dp1: $('#vault-1'),
      dp2: $('#vault-2'),
      dp3: $('#vault-3'),
    };

    // Security visualization elements
    const attackerEl = $('#attacker-icon');
    const teeTag = $('#tee-tag');
    const dpTag = $('#dp-tag');
    const saQuestion = $('#sa-question');
    const saSigma = $('#sa-sigma');
    const saTag = $('#sa-tag');

    // Place every packet at platform center initially (will fade in/move from there)
    function resetPacket(id, anchor = platform) {
      const a = rectIn(anchor);
      const el = $('#' + id);
      const c = placeCentered(el, a.cx, a.cy);
      gsap.set(el, { x: c.x, y: c.y, opacity: 0 });
    }

    // Helper to fly a packet from anchor A → anchor B.
    // Packet PERSISTS at destination — explicit fade-outs are scheduled at scene
    // boundaries below so each pause point shows a clean snapshot of state.
    // opts.offsetX / opts.offsetY → final position is toEl center + offset.
    function flyPacket(packetId, fromEl, toEl, opts = {}) {
      const el = $('#' + packetId);
      const from = rectIn(fromEl);
      const to = rectIn(toEl);
      const targetCx = to.cx + (opts.offsetX || 0);
      const targetCy = to.cy + (opts.offsetY || 0);
      const start = placeCentered(el, from.cx, from.cy);
      const end = placeCentered(el, targetCx, targetCy);
      const tlLocal = gsap.timeline();
      tlLocal.set(el, { x: start.x, y: start.y, opacity: 0 });
      tlLocal.to(el, { opacity: 1, duration: 0.25 });
      tlLocal.to(el, {
        x: end.x,
        y: end.y,
        duration: opts.duration ?? 1.2,
        ease: opts.ease ?? 'power2.inOut',
      }, '-=0.05');
      // No auto fade-out — caller schedules a fade at the next scene boundary.
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
      // ▶ TEE: activate hardware-enclave perimeter (dashed glow ring around vaults)
      Object.values(vaults).forEach(v => v.classList.add('tee-active'));
    }, [], 22);
    // pulse glow during training
    tl.to(Object.values(vaults), {
      boxShadow: '0 0 36px rgba(212, 170, 111, 0.7), inset 0 0 24px rgba(212, 170, 111, 0.3)',
      duration: 1.4,
      yoyo: true,
      repeat: 4,
      ease: 'sine.inOut',
    }, 22);

    // ▶ TEE attack visualization — attacker tries to breach vault 2, gets bounced.
    // Visualizes: even if the server is "hacked", the TEE enclave keeps data safe.
    const v2r = rectIn(vaults.dp2);
    const platR = rectIn(platform);
    tl.set(attackerEl, { x: v2r.x - 110, y: v2r.cy - 14, opacity: 0 }, 25);
    tl.to(attackerEl, { opacity: 1, duration: 0.3 }, 25);
    // Approach
    tl.to(attackerEl, { x: v2r.x - 30, duration: 0.6, ease: 'power2.in' }, 25.3);
    // Hit — vault TEE flashes
    tl.to(vaults.dp2, {
      boxShadow: '0 0 40px rgba(95, 184, 148, 0.95), inset 0 0 24px rgba(95, 184, 148, 0.4)',
      duration: 0.18,
      yoyo: true,
      repeat: 1,
    }, 25.85);
    // Bounce back
    tl.to(attackerEl, { x: v2r.x - 130, duration: 0.55, ease: 'back.out(2)' }, 25.9);
    // "TEE blocks breach" tag
    tl.set(teeTag, { x: v2r.x - 145, y: v2r.cy + 32, opacity: 0 }, 26);
    tl.to(teeTag, { opacity: 1, duration: 0.3 }, 26);
    tl.to(teeTag, { opacity: 0, duration: 0.3 }, 28.5);
    tl.to(attackerEl, { opacity: 0, duration: 0.3 }, 26.6);

    // ===== Scene 6 (t=32): Encrypted gradients flow back, shields light up =====
    // Show shields container
    tl.to('#shields', { opacity: 1, duration: 0.4 }, 32);
    // Light shields one by one
    const shieldEls = $$('.shield');
    shieldEls.forEach((sh, i) => {
      tl.call(() => sh.classList.add('lit'), [], 32 + i * 0.4);
    });
    // Stop training glow + remove training class + deactivate TEE perimeter
    tl.call(() => {
      Object.values(vaults).forEach(v => {
        v.classList.remove('training');
        v.classList.remove('tee-active');
      });
    }, [], 33);

    // 3 gradients fly back to platform — but land in a VERTICAL QUEUE just left
    // of the platform, so user can see "3 separate encrypted gradients arrived".
    // Scene 7 will then visibly converge them into one trained model.
    const GRAD_DX = -150;   // 150 px left of platform center (in the gap)
    const GRAD_DY = 42;     // vertical spacing between stacked gradients
    tl.add(flyPacket('p-grad-1', vaults.dp1, platform, { duration: 1.6, offsetX: GRAD_DX, offsetY: -GRAD_DY }), 34);
    tl.add(flyPacket('p-grad-2', vaults.dp2, platform, { duration: 1.6, offsetX: GRAD_DX, offsetY: 0          }), 34.3);
    tl.add(flyPacket('p-grad-3', vaults.dp3, platform, { duration: 1.6, offsetX: GRAD_DX, offsetY: GRAD_DY    }), 34.6);

    // ▶ DP visualization — gradients carry visible noise dust while in flight.
    // Visualizes: the gradient is calibrated-noisy, so raw data can't be reverse-engineered.
    tl.call(() => {
      ['p-grad-1', 'p-grad-2', 'p-grad-3'].forEach(id => $('#' + id).classList.add('dp-noisy'));
    }, [], 34);
    // DP tag flashes mid-flight
    const dpTagX = (v2r.cx + platR.cx) / 2 - 95;
    const dpTagY = platR.y - 18;
    tl.set(dpTag, { x: dpTagX, y: dpTagY, opacity: 0 }, 35);
    tl.to(dpTag, { opacity: 1, duration: 0.3 }, 35);
    tl.to(dpTag, { opacity: 0, duration: 0.3 }, 37.5);
    // Drop dp-noisy when gradients have arrived at queue (they look "settled")
    tl.call(() => {
      ['p-grad-1', 'p-grad-2', 'p-grad-3'].forEach(id => $('#' + id).classList.remove('dp-noisy'));
    }, [], 36.5);

    // ▶ SA visualization — "?" appears above Kanesh as gradients queue up,
    // signalling the coordinator can see them but can't read individual values.
    tl.set(saQuestion, { x: platR.cx - 18, y: platR.y - 60, opacity: 0, scale: 0.6 }, 41);
    tl.to(saQuestion, { opacity: 1, scale: 1, duration: 0.5, ease: 'back.out(2)' }, 41);
    tl.set(saTag, { x: platR.cx - 145, y: platR.y - 96, opacity: 0 }, 41.4);
    tl.to(saTag, { opacity: 1, duration: 0.3 }, 41.4);

    // ===== Scene 7 (t=44): Aggregation — 3 gradients converge into platform, become trained model =====
    // ▶ SA continued: "?" → "Σ" visually shows the coordinator only knows the SUM.
    tl.to(saQuestion, { opacity: 0, scale: 0.6, duration: 0.4 }, 44.6);
    tl.set(saSigma, { x: platR.cx - 16, y: platR.y - 56, opacity: 0, scale: 0.5 }, 45.0);
    tl.to(saSigma, { opacity: 1, scale: 1.2, duration: 0.5, ease: 'back.out(2)' }, 45.0);
    tl.to(saSigma, { scale: 1, duration: 0.3 }, 45.5);
    // Σ + tag fade as the trained model emerges
    tl.to(saSigma, { opacity: 0, duration: 0.4 }, 46.5);
    tl.to(saTag, { opacity: 0, duration: 0.3 }, 46.7);

    tl.call(() => $('#platform').classList.add('aggregating'), [], 44);
    tl.fromTo(platform,
      { scale: 1.04 },
      { scale: 1.08, duration: 0.5, yoyo: true, repeat: 3, ease: 'sine.inOut' },
      44
    );

    // Pre-compute platform-center coords for converging packets
    const platformRectAtBuild = rectIn(platform);
    const gradEl = $('#p-grad-1');
    const gradW = gradEl.getBoundingClientRect().width  || 110;
    const gradH = gradEl.getBoundingClientRect().height || 32;
    const mergeX = platformRectAtBuild.cx - gradW / 2;
    const mergeY = platformRectAtBuild.cy - gradH / 2;

    // 3 gradients slide rightward into platform center (1.5 s)
    tl.to(['#p-grad-1', '#p-grad-2', '#p-grad-3'], {
      x: mergeX,
      y: mergeY,
      duration: 1.5,
      ease: 'power2.in',
    }, 44);

    // Brief overlap moment — all 3 stacked at center for 0.2 s, visible
    // (no animation in the gap; they hold position and opacity)

    // Gradients fade as the trained model emerges (45.7 → 46.1)
    tl.to(['#p-grad-1', '#p-grad-2', '#p-grad-3'], { opacity: 0, duration: 0.4 }, 45.7);

    // Trained model packet pops into existence at platform center
    const mfEl = $('#p-model-final');
    const mfW = mfEl.getBoundingClientRect().width  || 130;
    const mfH = mfEl.getBoundingClientRect().height || 32;
    const mfX = platformRectAtBuild.cx - mfW / 2;
    const mfY = platformRectAtBuild.cy - mfH / 2;
    tl.set('#p-model-final', { x: mfX, y: mfY, scale: 0.5 }, 45.8);
    tl.to('#p-model-final', { opacity: 1, scale: 1.18, duration: 0.45, ease: 'back.out(2)' }, 45.8);
    tl.to('#p-model-final', { scale: 1, duration: 0.3 }, 46.3);

    // Hide shields after merge complete
    tl.to('#shields', { opacity: 0, duration: 0.4 }, 47);
    tl.call(() => $('#platform').classList.remove('aggregating'), [], 48);

    // ===== Scene 8 (t=52): Trained model → Developer =====
    // Direct tween (NOT flyPacket) so the packet continues from its visible
    // platform-center position instead of resetting to invisible.
    const developerRectAtBuild = rectIn(developer);
    const devEndX = developerRectAtBuild.cx - mfW / 2;
    const devEndY = developerRectAtBuild.cy - mfH / 2;
    tl.to('#p-model-final', {
      x: devEndX,
      y: devEndY,
      duration: 1.6,
      ease: 'power2.inOut',
    }, 52);
    tl.call(() => $('#developer').classList.add('deployed'), [], 53.5);

    // ===== Scheduled fade-outs at scene boundaries =====
    // Each pause point shows the END STATE of that scene; old packets fade out
    // only when the NEXT scene's action begins, so user has time to read.
    tl.to('#p-bounty', { opacity: 0, duration: 0.4 }, 15.7);                                  // before scene 4 (models fly)
    tl.to(['#p-model-1', '#p-model-2', '#p-model-3'], { opacity: 0, duration: 0.4 }, 33.5);   // before scene 6 (gradients fly back)
    // (gradient fade is now part of scene 7 aggregation choreography above)
    // Trained model + money packets + earnings → stay visible as the final summary frame

    // ===== Scene 8 (t=60): $$$ flow — Customer → Developer → Kanesh → 3 Providers =====
    // Phase A (60.0–61.0): A customer pays the AI Developer
    tl.call(() => customers.classList.add('active'), [], 60);
    tl.add(flyPacket('p-customer-pay', customers, developer, { duration: 1.0 }), 60);

    // Phase B (61.0–61.5): Developer briefly pulses (payment received), customer-pay fades
    tl.fromTo(developer,
      { scale: 1 },
      { scale: 1.06, duration: 0.3, yoyo: true, repeat: 1, ease: 'sine.inOut' },
      61.0
    );
    tl.to('#p-customer-pay', { opacity: 0, duration: 0.3 }, 61.2);
    tl.call(() => customers.classList.remove('active'), [], 61.5);

    // Phase C (61.5–62.7): Developer forwards Payment to Kanesh
    tl.add(flyPacket('p-revenue', developer, platform, { duration: 1.2 }), 61.5);

    // Phase D (62.8–63.2): "Split" moment at Kanesh
    tl.to('#p-revenue', {
      scale: 1.3,
      duration: 0.25,
      yoyo: true,
      repeat: 1,
      ease: 'sine.inOut',
    }, 62.8);
    tl.fromTo(platform,
      { scale: 1.04 },
      { scale: 1.1, duration: 0.3, yoyo: true, repeat: 1, ease: 'sine.inOut' },
      63.0
    );
    tl.to('#p-revenue', { opacity: 0, duration: 0.3 }, 63.2);

    // Phase E (63.3–64.7): 3 money packets emerge from Kanesh and fly to each provider
    tl.add(flyPacket('p-money-1', platform, vaults.dp1, { duration: 1.4 }), 63.3);
    tl.add(flyPacket('p-money-2', platform, vaults.dp2, { duration: 1.4 }), 63.5);
    tl.add(flyPacket('p-money-3', platform, vaults.dp3, { duration: 1.4 }), 63.7);

    // Phase F (64.7–65.1): earnings labels appear as money arrives
    tl.call(() => $('#earn-1').classList.add('show'), [], 64.7);
    tl.call(() => $('#earn-2').classList.add('show'),  [], 64.9);
    tl.call(() => $('#earn-3').classList.add('show'),  [], 65.1);

    // ===== Scene 9 (t=67): Recurring revenue — 2 quick payment cycles =====
    // Each cycle reuses the same packets via flyPacket (which set+resets each call).
    // Compress the full chain into ~2 s per cycle so user feels the rhythm.

    // ---------- Cycle 1 (t=67.0 → 68.6) ----------
    tl.call(() => customers.classList.add('active'), [], 67.0);
    tl.add(flyPacket('p-customer-pay', customers, developer, { duration: 0.5 }), 67.0);
    tl.fromTo(developer, { scale: 1 }, { scale: 1.04, duration: 0.2, yoyo: true, repeat: 1 }, 67.4);
    tl.to('#p-customer-pay', { opacity: 0, duration: 0.2 }, 67.5);
    tl.call(() => customers.classList.remove('active'), [], 67.7);

    tl.add(flyPacket('p-revenue', developer, platform, { duration: 0.5 }), 67.6);
    tl.to('#p-revenue', { opacity: 0, duration: 0.2 }, 68.1);
    tl.fromTo(platform, { scale: 1.04 }, { scale: 1.07, duration: 0.2, yoyo: true, repeat: 1 }, 68.0);

    tl.add(flyPacket('p-money-1', platform, vaults.dp1, { duration: 0.6 }), 68.2);
    tl.add(flyPacket('p-money-2', platform, vaults.dp2, { duration: 0.6 }), 68.3);
    tl.add(flyPacket('p-money-3', platform, vaults.dp3, { duration: 0.6 }), 68.4);
    // Earnings labels pulse to acknowledge another payment received
    tl.fromTo('.earnings.show', { scale: 1 }, { scale: 1.18, duration: 0.2, yoyo: true, repeat: 1 }, 68.9);

    // ---------- Cycle 2 (t=70.0 → 71.6) ----------
    tl.call(() => customers.classList.add('active'), [], 70.0);
    tl.add(flyPacket('p-customer-pay', customers, developer, { duration: 0.5 }), 70.0);
    tl.fromTo(developer, { scale: 1 }, { scale: 1.04, duration: 0.2, yoyo: true, repeat: 1 }, 70.4);
    tl.to('#p-customer-pay', { opacity: 0, duration: 0.2 }, 70.5);
    tl.call(() => customers.classList.remove('active'), [], 70.7);

    tl.add(flyPacket('p-revenue', developer, platform, { duration: 0.5 }), 70.6);
    tl.to('#p-revenue', { opacity: 0, duration: 0.2 }, 71.1);
    tl.fromTo(platform, { scale: 1.04 }, { scale: 1.07, duration: 0.2, yoyo: true, repeat: 1 }, 71.0);

    tl.add(flyPacket('p-money-1', platform, vaults.dp1, { duration: 0.6 }), 71.2);
    tl.add(flyPacket('p-money-2', platform, vaults.dp2, { duration: 0.6 }), 71.3);
    tl.add(flyPacket('p-money-3', platform, vaults.dp3, { duration: 0.6 }), 71.4);
    tl.fromTo('.earnings.show', { scale: 1 }, { scale: 1.18, duration: 0.2, yoyo: true, repeat: 1 }, 71.9);

    // ===== End (final summary frame holds visible: model at dev, money at vaults) =====

    return tl;
  }

  // -----------------------------------------------------------
  // Caption updater — set text immediately, then animate a fade-in pulse.
  // No lock: rapid scene crossings always reflect the latest scene's caption.
  // -----------------------------------------------------------
  function updateCaption(text, num) {
    const cap = $('#caption');
    const sceneNum = $('#scene-num');
    sceneNum.textContent = num;
    cap.textContent = text;
    gsap.fromTo(cap,
      { y: 8, opacity: 0.35 },
      { y: 0, opacity: 1, duration: 0.4, ease: 'power2.out', overwrite: true }
    );
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
  // 8 step-throughs aligned with the 8 ACTION scenes (skip static intro):
  //   end of merged scene 2, then scenes 3, 4, 5, 6, 7, 8 (cust→dev→kanesh→prov),
  //   and 9 (recurring).
  const PAUSE_POINTS = [15.5, 21.5, 31.5, 43.5, 51.5, 59.5, 66, 73];

  const playBtn = $('#play');
  const nextBtn = $('#next');
  const prevBtn = $('#prev');
  const restartBtn = $('#restart');

  // Pending "pause-at-target" delayedCall handle. We use real play() (not tweenTo)
  // so callbacks/tweens fire reliably; delayedCall just schedules WHEN to pause.
  let stepTween = null;

  function killStepTween() {
    if (stepTween) {
      if (typeof stepTween.kill === 'function') stepTween.kill();
      stepTween = null;
    }
  }

  function resetVisualState() {
    $$('.vault').forEach(v => {
      v.classList.remove('training');
      v.classList.remove('tee-active');
    });
    $$('.shield').forEach(s => s.classList.remove('lit'));
    $$('.earnings').forEach(e => e.classList.remove('show'));
    $('#platform').classList.remove('aggregating');
    $('#developer').classList.remove('deployed');
    const customersEl = document.getElementById('customers');
    if (customersEl) customersEl.classList.remove('active');
    $$('.packet').forEach(p => {
      gsap.set(p, { opacity: 0 });
      p.classList.remove('dp-noisy');
    });
    gsap.set('#shields', { opacity: 0 });
    // Reset security visualization elements
    ['#attacker-icon', '#tee-tag', '#dp-tag', '#sa-question', '#sa-sigma', '#sa-tag'].forEach(sel => {
      gsap.set(sel, { opacity: 0 });
    });
  }

  function setPlayLabel(state) {
    if (state === 'playing') playBtn.textContent = '⏸ Pause';
    else if (state === 'resume') playBtn.textContent = '▶ Resume';
    else playBtn.textContent = '▶ Play all';
  }

  // ===== Next step: play (normal speed) to next scene boundary, then pause =====
  nextBtn.addEventListener('click', () => {
    if (!timeline) return;
    killStepTween();
    timeline.timeScale(SPEED); // make sure we're at base speed (Prev may have boosted)

    const t = timeline.time();
    let target = PAUSE_POINTS.find((p) => p > t + 0.05);

    if (target === undefined) {
      // Already at end — wrap back to first pause point
      resetVisualState();
      timeline.pause();
      timeline.time(0);
      target = PAUSE_POINTS[0];
    }

    // Real play + scheduled pause. timeScale=SPEED already in effect.
    const realDuration = Math.max(0.01, (target - timeline.time()) / SPEED);
    timeline.play();
    stepTween = gsap.delayedCall(realDuration, () => {
      timeline.pause();
      setPlayLabel('paused');
      stepTween = null;
    });
    setPlayLabel('playing');
  });

  // ===== Prev step: full reset + fast-forward to previous boundary =====
  prevBtn.addEventListener('click', () => {
    if (!timeline) return;
    killStepTween();
    timeline.timeScale(SPEED); // base speed first

    const t = timeline.time();
    // Find the largest pause point < current time (with small epsilon)
    let target = 0;
    for (let i = PAUSE_POINTS.length - 1; i >= 0; i--) {
      if (PAUSE_POINTS[i] < t - 0.5) { target = PAUSE_POINTS[i]; break; }
    }

    // Rewind via full replay at boosted speed (callbacks fire in correct order)
    resetVisualState();
    timeline.pause();
    timeline.time(0);

    if (target <= 0) {
      setPlayLabel('paused');
      return;
    }

    const BOOST = 8;
    timeline.timeScale(SPEED * BOOST);
    timeline.play();
    stepTween = gsap.delayedCall(target / (SPEED * BOOST), () => {
      timeline.pause();
      timeline.timeScale(SPEED); // restore
      setPlayLabel('paused');
      stepTween = null;
    });
    setPlayLabel('playing');
  });

  // ===== Play all: continuous from current point to end =====
  playBtn.addEventListener('click', () => {
    if (!timeline) return;
    killStepTween();
    timeline.timeScale(SPEED);

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
    timeline.timeScale(SPEED);
    resetVisualState();
    timeline.pause();
    timeline.time(0);
    setPlayLabel('paused');
  });
})();
