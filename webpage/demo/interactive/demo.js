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
    { t: 32, num: 5, text: 'Differential Privacy: gradients carry calibrated noise — raw data cannot be reverse-engineered.' },
    { t: 38, num: 6, text: 'Secure Aggregation: the coordinator sees gradients arrive, but can\'t read individual values.' },
    { t: 50, num: 7, text: 'Kanesh aggregates. The model gets stronger with every contribution.' },
    { t: 58, num: 8, text: 'The developer gets a model trained on industry-grade data — legally.' },
    { t: 66, num: 9, text: 'A customer pays the AI developer. Kanesh routes the revenue to providers proportionally.' },
    { t: 73, num: 10, text: 'Every customer payment auto-flows. Recurring revenue, no extra action needed.' },
  ];

  const TOTAL_DURATION = 80; // timeline-time seconds (not wall-clock)
  const SPEED = 3;            // 3× faster — wall-clock duration ≈ 80/3 ≈ 26.7 s

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
    const saSigma = $('#sa-sigma');
    const saTag = $('#sa-tag');
    const dpVignette = $('#dp-vignette');
    const dpRowFail = dpVignette.querySelector('.dp-row-fail');

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
    // "TEE blocks breach" tag — stays visible through end of training
    // so the user can read it at the scene-4 pause point.
    tl.set(teeTag, { x: v2r.x - 145, y: v2r.cy + 32, opacity: 0 }, 26);
    tl.to(teeTag, { opacity: 1, duration: 0.3 }, 26);
    tl.to(teeTag, { opacity: 0, duration: 0.4 }, 32);   // fades when DP scene begins
    tl.to(attackerEl, { opacity: 0, duration: 0.3 }, 26.6);

    // Stop training glow + remove training class + deactivate TEE perimeter
    // (now happens at scene-4 → scene-5 boundary, t=32, so vaults look "static" in DP scene)
    tl.call(() => {
      Object.values(vaults).forEach(v => {
        v.classList.remove('training');
        v.classList.remove('tee-active');
      });
    }, [], 32);

    // ===== Scene 5 (t=32–37.5): DIFFERENTIAL PRIVACY vignette =====
    // Diagram: "Data + ε noise → ∇W" works (forward), but "∇W → Data" fails (reverse).
    // Visualizes that calibrated noise prevents reverse-engineering of raw data.
    tl.set(dpVignette, { opacity: 0 }, 32);
    tl.to(dpVignette, { opacity: 1, duration: 0.5 }, 32.3);
    // Reverse-failure row pulses in 1.5 s after the forward row settles
    tl.call(() => dpRowFail.classList.add('show'), [], 34);
    tl.fromTo('.dp-box.dp-fail',
      { scale: 0.7 },
      { scale: 1.18, duration: 0.4, ease: 'back.out(2)' },
      34
    );
    tl.to('.dp-box.dp-fail', { scale: 1, duration: 0.3 }, 34.4);
    // Vignette stays visible at pause (37.5); fades when next scene begins (~38)
    tl.to(dpVignette, { opacity: 0, duration: 0.5 }, 38.0);
    tl.call(() => dpRowFail.classList.remove('show'), [], 38.5);

    // ===== Scene 6 (t=38–49.5): Encrypted gradients flow back; SA "?" on each =====
    // 3 gradients fly back to platform — vertical queue just left of platform
    const GRAD_DX = -150;   // 150 px left of platform center (in the gap)
    const GRAD_DY = 42;     // vertical spacing between stacked gradients
    tl.add(flyPacket('p-grad-1', vaults.dp1, platform, { duration: 1.6, offsetX: GRAD_DX, offsetY: -GRAD_DY }), 40);
    tl.add(flyPacket('p-grad-2', vaults.dp2, platform, { duration: 1.6, offsetX: GRAD_DX, offsetY: 0          }), 40.3);
    tl.add(flyPacket('p-grad-3', vaults.dp3, platform, { duration: 1.6, offsetX: GRAD_DX, offsetY: GRAD_DY    }), 40.6);

    // DP noise effect during flight (purple particle halo around each ∇W)
    tl.call(() => {
      ['p-grad-1', 'p-grad-2', 'p-grad-3'].forEach(id => $('#' + id).classList.add('dp-noisy'));
    }, [], 40);
    tl.call(() => {
      ['p-grad-1', 'p-grad-2', 'p-grad-3'].forEach(id => $('#' + id).classList.remove('dp-noisy'));
    }, [], 42.5);

    // ▶ SA visualization — "?" badge appears on EACH gradient packet:
    // visualizes that the coordinator sees them arrive but can't read individual values.
    tl.call(() => {
      ['p-grad-1', 'p-grad-2', 'p-grad-3'].forEach(id => $('#' + id).classList.add('sa-unknown'));
    }, [], 43);

    // SA tag near platform top
    tl.set(saTag, { x: platR.cx - 145, y: platR.y - 50, opacity: 0 }, 43.5);
    tl.to(saTag, { opacity: 1, duration: 0.3 }, 43.5);

    // ===== Scene 7 (t=50): Aggregation — 3 ∇W converge into platform, become trained model =====
    // ▶ SA continued: as ∇W converge into Σ, "?" badges drop and only the SUM is revealed.
    tl.call(() => {
      ['p-grad-1', 'p-grad-2', 'p-grad-3'].forEach(id => $('#' + id).classList.remove('sa-unknown'));
    }, [], 50);
    tl.call(() => $('#platform').classList.add('aggregating'), [], 50);
    tl.fromTo(platform,
      { scale: 1.04 },
      { scale: 1.08, duration: 0.5, yoyo: true, repeat: 3, ease: 'sine.inOut' },
      50
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
    }, 50);

    // Σ symbol pops in (replaces the "?"s) — the only thing the coordinator knows
    tl.set(saSigma, { x: platformRectAtBuild.cx - 16, y: platformRectAtBuild.y - 56, opacity: 0, scale: 0.5 }, 51.0);
    tl.to(saSigma, { opacity: 1, scale: 1.2, duration: 0.5, ease: 'back.out(2)' }, 51.0);
    tl.to(saSigma, { scale: 1, duration: 0.3 }, 51.5);

    // Gradients fade as the trained model emerges
    tl.to(['#p-grad-1', '#p-grad-2', '#p-grad-3'], { opacity: 0, duration: 0.4 }, 51.7);

    // Trained model packet pops into existence at platform center
    const mfEl = $('#p-model-final');
    const mfW = mfEl.getBoundingClientRect().width  || 130;
    const mfH = mfEl.getBoundingClientRect().height || 32;
    const mfX = platformRectAtBuild.cx - mfW / 2;
    const mfY = platformRectAtBuild.cy - mfH / 2;
    tl.set('#p-model-final', { x: mfX, y: mfY, scale: 0.5 }, 51.8);
    tl.to('#p-model-final', { opacity: 1, scale: 1.18, duration: 0.45, ease: 'back.out(2)' }, 51.8);
    tl.to('#p-model-final', { scale: 1, duration: 0.3 }, 52.3);

    // Σ + SA tag fade as the trained model fully emerges
    tl.to(saSigma, { opacity: 0, duration: 0.4 }, 52.5);
    tl.to(saTag, { opacity: 0, duration: 0.3 }, 52.7);
    tl.call(() => $('#platform').classList.remove('aggregating'), [], 54);

    // ===== Scene 8 (t=58): Trained model → Developer =====
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
    }, 58);
    tl.call(() => $('#developer').classList.add('deployed'), [], 59.5);

    // ===== Scheduled fade-outs at scene boundaries =====
    tl.to('#p-bounty', { opacity: 0, duration: 0.4 }, 15.7);                                  // before scene 4 (models fly)
    tl.to(['#p-model-1', '#p-model-2', '#p-model-3'], { opacity: 0, duration: 0.4 }, 39.5);   // before scene 6 (gradients fly back)
    // Trained model + money packets + earnings → stay visible as the final summary frame

    // ===== Scene 9 (t=66): $$$ flow — Customer → Developer → Kanesh → 3 Providers =====
    // Phase A (66.0–67.0): A customer pays the AI Developer
    tl.call(() => customers.classList.add('active'), [], 66);
    tl.add(flyPacket('p-customer-pay', customers, developer, { duration: 1.0 }), 66);

    // Phase B (67.0–67.5): Developer briefly pulses (payment received), customer-pay fades
    tl.fromTo(developer,
      { scale: 1 },
      { scale: 1.06, duration: 0.3, yoyo: true, repeat: 1, ease: 'sine.inOut' },
      67.0
    );
    tl.to('#p-customer-pay', { opacity: 0, duration: 0.3 }, 67.2);
    tl.call(() => customers.classList.remove('active'), [], 67.5);

    // Phase C (67.5–68.7): Developer forwards Payment to Kanesh
    tl.add(flyPacket('p-revenue', developer, platform, { duration: 1.2 }), 67.5);

    // Phase D (68.8–69.2): "Split" moment at Kanesh
    tl.to('#p-revenue', {
      scale: 1.3,
      duration: 0.25,
      yoyo: true,
      repeat: 1,
      ease: 'sine.inOut',
    }, 68.8);
    tl.fromTo(platform,
      { scale: 1.04 },
      { scale: 1.1, duration: 0.3, yoyo: true, repeat: 1, ease: 'sine.inOut' },
      69.0
    );
    tl.to('#p-revenue', { opacity: 0, duration: 0.3 }, 69.2);

    // Phase E (69.3–70.7): 3 money packets emerge from Kanesh and fly to each provider
    tl.add(flyPacket('p-money-1', platform, vaults.dp1, { duration: 1.4 }), 69.3);
    tl.add(flyPacket('p-money-2', platform, vaults.dp2, { duration: 1.4 }), 69.5);
    tl.add(flyPacket('p-money-3', platform, vaults.dp3, { duration: 1.4 }), 69.7);

    // Phase F (70.7–71.1): earnings labels appear as money arrives
    tl.call(() => $('#earn-1').classList.add('show'), [], 70.7);
    tl.call(() => $('#earn-2').classList.add('show'),  [], 70.9);
    tl.call(() => $('#earn-3').classList.add('show'),  [], 71.1);

    // ===== Scene 10 (t=73): Recurring revenue — 2 quick payment cycles =====
    // ---------- Cycle 1 (t=73.0 → 74.6) ----------
    tl.call(() => customers.classList.add('active'), [], 73.0);
    tl.add(flyPacket('p-customer-pay', customers, developer, { duration: 0.5 }), 73.0);
    tl.fromTo(developer, { scale: 1 }, { scale: 1.04, duration: 0.2, yoyo: true, repeat: 1 }, 73.4);
    tl.to('#p-customer-pay', { opacity: 0, duration: 0.2 }, 73.5);
    tl.call(() => customers.classList.remove('active'), [], 73.7);

    tl.add(flyPacket('p-revenue', developer, platform, { duration: 0.5 }), 73.6);
    tl.to('#p-revenue', { opacity: 0, duration: 0.2 }, 74.1);
    tl.fromTo(platform, { scale: 1.04 }, { scale: 1.07, duration: 0.2, yoyo: true, repeat: 1 }, 74.0);

    tl.add(flyPacket('p-money-1', platform, vaults.dp1, { duration: 0.6 }), 74.2);
    tl.add(flyPacket('p-money-2', platform, vaults.dp2, { duration: 0.6 }), 74.3);
    tl.add(flyPacket('p-money-3', platform, vaults.dp3, { duration: 0.6 }), 74.4);
    tl.fromTo('.earnings.show', { scale: 1 }, { scale: 1.18, duration: 0.2, yoyo: true, repeat: 1 }, 74.9);

    // ---------- Cycle 2 (t=76.0 → 77.6) ----------
    tl.call(() => customers.classList.add('active'), [], 76.0);
    tl.add(flyPacket('p-customer-pay', customers, developer, { duration: 0.5 }), 76.0);
    tl.fromTo(developer, { scale: 1 }, { scale: 1.04, duration: 0.2, yoyo: true, repeat: 1 }, 76.4);
    tl.to('#p-customer-pay', { opacity: 0, duration: 0.2 }, 76.5);
    tl.call(() => customers.classList.remove('active'), [], 76.7);

    tl.add(flyPacket('p-revenue', developer, platform, { duration: 0.5 }), 76.6);
    tl.to('#p-revenue', { opacity: 0, duration: 0.2 }, 77.1);
    tl.fromTo(platform, { scale: 1.04 }, { scale: 1.07, duration: 0.2, yoyo: true, repeat: 1 }, 77.0);

    tl.add(flyPacket('p-money-1', platform, vaults.dp1, { duration: 0.6 }), 77.2);
    tl.add(flyPacket('p-money-2', platform, vaults.dp2, { duration: 0.6 }), 77.3);
    tl.add(flyPacket('p-money-3', platform, vaults.dp3, { duration: 0.6 }), 77.4);
    tl.fromTo('.earnings.show', { scale: 1 }, { scale: 1.18, duration: 0.2, yoyo: true, repeat: 1 }, 77.9);

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
  // 9 step-throughs aligned with the 9 ACTION scenes (skip static intro):
  //   2(merged), 3(models), 4(training), 5(DP), 6(grads+SA), 7(aggregation),
  //   8(model→dev), 9(customer), 10(recurring).
  const PAUSE_POINTS = [15.5, 21.5, 31.5, 37.5, 49.5, 57.5, 65.5, 72, 80];

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
      p.classList.remove('sa-unknown');
    });
    gsap.set('#shields', { opacity: 0 });
    // Reset DP vignette + its row state
    gsap.set('#dp-vignette', { opacity: 0 });
    const rf = document.querySelector('.dp-row-fail');
    if (rf) rf.classList.remove('show');
    // Reset security visualization elements
    ['#attacker-icon', '#tee-tag', '#sa-sigma', '#sa-tag'].forEach(sel => {
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
