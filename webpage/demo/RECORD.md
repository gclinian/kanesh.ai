# Kanesh Demo — Recording & Publishing Playbook

This is the **single source of truth** for producing the 90-second Kanesh
demo video. Hand this to anyone — yourself in two weeks, a teammate, a
contractor — and they should be able to reproduce the video end-to-end.

> **Goal:** A 90-second video that lives at `kanesh.ai/demo` (embedded from
> YouTube Unlisted) and can also be embedded in pitch decks as a local mp4.

---

## 0. The 90-Second Storyboard

Each scene below has timing, on-screen action, narrator subtitle, and which
elements in `interactive/index.html` carry the action. The interactive demo
is the **source of truth for visuals** — record from it, don't re-make it.

| # | Time | Action | Subtitle |
|---|------|--------|----------|
| 1 | 0:00–0:08 | Three vaults visible (TSMC, MediaTek, Samsung), all 🔒 locked. Developer (right) idle. | "Three foundries hold billions of dollars of design data — locked away." |
| 2 | 0:08–0:14 | Developer card pulses. | "An EDA AI startup wants to train a DRC violation predictor." |
| 3 | 0:14–0:22 | A 💰 packet flies Developer → Kanesh. | "They post a training job to Kanesh, with a bounty." |
| 4 | 0:22–0:30 | Three 📦 model packets fly Kanesh → each vault. **Vaults stay locked.** | "Kanesh sends the model — never asks for the data." |
| 5 | 0:30–0:42 | Vaults glow / pulse (training inside). Locks remain. | "Training happens where the data lives. Inside the vault. Always." |
| 6 | 0:42–0:56 | Three encrypted gradient packets fly back. **5 shields (FL · TEE · DP · SA · Audit) light up underneath.** | "Only encrypted gradients leave — protected by 5 cryptographic layers." |
| 7 | 0:56–1:08 | Kanesh platform pulses (aggregating). Shields fade. | "Kanesh aggregates. The model gets stronger with every contribution." |
| 8 | 1:08–1:18 | A 🚀 trained model flies Kanesh → Developer. Developer card glows green. | "The developer gets a model trained on industry-grade data — legally." |
| 9 | 1:18–1:30 | 💰 50% / 30% / 20% packets flow back to TSMC / MediaTek / Samsung. Earnings labels appear under each vault. | "Providers earn — fairly, proportionally, automatically. Data stayed home." |

> The interactive demo is currently timed at ~70 seconds (snappier for live
> step-through). For the recorded video we **record at slow speed (0.85x)**
> in OBS to stretch to ~90 seconds, OR edit in pauses post-record.

---

## 1. Local Preview First

Always preview locally before recording.

```bash
cd ~/Desktop/StartUp/repos/web
python3 -m http.server 8000 --directory webpage
# Open http://localhost:8000/demo/interactive/
```

Click **▶ Play** and watch end-to-end. Verify:

- All three vaults stay 🔒 locked the entire time
- All three gradients show "encrypted" label (not raw data)
- All five shields light up in scene 6
- Money packets are differently sized (50% / 30% / 20%) in scene 9
- Earnings labels appear under each vault at the end

If anything drifts, edit `interactive/demo.js` and reload. **Do not record
until the visual is right** — every second spent on a polish pass saves
re-records later.

---

## 2. Record the mp4 with OBS

### 2a. Install (one-time)

```bash
brew install --cask obs
```

### 2b. OBS settings

- **Output → Recording**:
  - Format: `mp4`
  - Encoder: `Apple VT H.264 Hardware Encoder` (Apple Silicon) or `x264`
  - Quality: `Indistinguishable` or set bitrate `12000 Kbps`
- **Video**:
  - Base resolution: `1920x1080`
  - Output resolution: `1920x1080`
  - FPS: `60` (smooth GSAP)
- **Sources**:
  - Add `Display Capture` → choose your display
  - **Crop** to just the browser window (Cmd+drag the corners) — or use
    `Window Capture` and pick Chrome/Safari directly

### 2c. Recording session

1. Open browser to `http://localhost:8000/demo/interactive/`
2. **Hide cursor**: System Settings → Accessibility → enable "Display →
   Hide pointer when typing", or just keep cursor outside the canvas
3. Press F11 (full-screen) to remove browser chrome
4. OBS → **Start Recording**
5. Click **▶ Play** in the demo
6. Wait for the timeline to finish (scene 9 ends ~70s)
7. Wait 3 more seconds (graceful tail)
8. OBS → **Stop Recording**
9. Trim head/tail in QuickTime (Edit → Trim) so the final clip is exactly:
   - Start: first frame where caption "Three foundries…" is visible
   - End:   last frame where all earnings labels are visible

### 2d. Compress to <30 MB for pitch decks

```bash
ffmpeg -i kanesh-demo-raw.mp4 \
  -vcodec libx264 -crf 23 -preset slow \
  -movflags +faststart \
  -acodec aac -b:a 128k \
  kanesh-demo.mp4

# Verify size
du -h kanesh-demo.mp4
```

If still > 30 MB, increase `-crf` to 26 or 28. Keynote / PowerPoint embed
limit is around 50 MB, but Gmail / Outlook attachment limit is 25 MB.

---

## 3. Upload to YouTube

### 3a. Settings (use exactly these)

| Field | Value |
|---|---|
| Title | `Kanesh — Privacy-Preserving Federated Learning for EDA AI (90s Demo)` |
| Description | (see template below) |
| **Visibility** | **Unlisted** |
| Audience | "No, it's not made for kids" |
| Comments | **Off** (Settings → disable comments) |
| End screens / cards | **None** (avoid YouTube recommending other videos) |
| Monetization | **Off** (avoid ads on our pitch material) |
| Tags | `federated learning, EDA, semiconductor, AI, privacy, kanesh` |
| Thumbnail | Pull a frame from scene 9 (everyone earning) — that's the headline visual |

### 3b. Description template

```
Kanesh is the first privacy-preserving collaborative-training infrastructure
dedicated to the EDA (Electronic Design Automation) industry.

Watch how three foundries — TSMC, MediaTek, Samsung — co-train an AI model
without a single byte of raw data ever leaving their premises, and how every
contributor gets paid fairly and automatically.

Learn more: https://kanesh.ai
Interactive demo: https://kanesh.ai/demo/interactive

Kanesh combines:
• Federated Learning (data stays on-prem)
• Trusted Execution Environments (NVIDIA H100 CC, Intel TDX, AMD SEV-SNP)
• Differential Privacy + Secure Aggregation (cryptographic privacy)
• Cryptographic audit layer (verifiable contribution accounting)

Contact: gclin.ian@gmail.com
```

### 3c. Once uploaded — paste the YouTube ID

YouTube will give you a URL like `https://youtu.be/dQw4w9WgXcQ`. The video
ID is the last segment (`dQw4w9WgXcQ`).

Open `demo/index.html` and find the placeholder block:

```html
<div class="placeholder" role="status" ...>...</div>
```

Replace it with:

```html
<iframe
  src="https://www.youtube-nocookie.com/embed/REPLACE_WITH_VIDEO_ID?rel=0&modestbranding=1&playsinline=1"
  title="Kanesh — 90-second demo"
  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
  allowfullscreen
  loading="lazy">
</iframe>
```

…with the actual video ID. Commit, push, done.

---

## 4. Distribution Matrix

| Channel | Asset | Why |
|---|---|---|
| Innovex live pitch | Local `kanesh-demo.mp4` embedded in Keynote | Defends against venue Wi-Fi failure |
| `kanesh.ai/demo` | YouTube embed (Unlisted) | Anyone with the link can watch; competitors can't search-find |
| Cold email to VC | YouTube link (don't attach mp4) | Avoids spam filters; plays in browser without download |
| LinkedIn / Twitter | 30-second cut, public on YouTube | Different content from pitch — viral-cut, no audio narration |
| Press kit | Both YouTube link + raw mp4 download URL | Journalists want the original |

---

## 5. Iteration & Re-recording

When you change `interactive/demo.js` or the storyboard:

1. Test locally (`python3 -m http.server`)
2. Re-record with OBS (15 minutes total)
3. Re-upload to YouTube **as a new video** (don't replace — keep old version
   private as backup)
4. Update the video ID in `demo/index.html`
5. Commit + push

YouTube does not allow swapping the video file under the same ID.

---

## 6. Optional: Headless Puppeteer Recording

For 100% reproducible, pixel-perfect renders (e.g., for press kit):

```bash
mkdir -p tools && cd tools
npm init -y
npm install puppeteer puppeteer-screen-recorder
```

```javascript
// tools/record-demo.js
const puppeteer = require('puppeteer');
const { PuppeteerScreenRecorder } = require('puppeteer-screen-recorder');

(async () => {
  const browser = await puppeteer.launch({
    headless: false,
    defaultViewport: { width: 1920, height: 1080 },
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
  });
  const page = await browser.newPage();
  const recorder = new PuppeteerScreenRecorder(page, {
    fps: 60,
    videoFrame: { width: 1920, height: 1080 },
    videoCrf: 18,
    videoCodec: 'libx264',
    videoPreset: 'slow',
  });

  await recorder.start('./kanesh-demo-headless.mp4');
  await page.goto('http://localhost:8000/demo/interactive/');
  await page.waitForSelector('#play');
  await page.click('#play');
  await new Promise(r => setTimeout(r, 75000)); // 75s — covers 70s timeline + buffer
  await recorder.stop();
  await browser.close();
})();
```

Run with `node tools/record-demo.js`. Output is in `tools/kanesh-demo-headless.mp4`.

---

## 7. Don't Do These

- ❌ Record with macOS QuickTime screen capture — drops frames on busy machines
- ❌ Record a moving cursor — looks unprofessional
- ❌ Upload as Public before pitch — competitors will Google "Kanesh demo"
- ❌ Embed regular `youtube.com/embed` — use `youtube-nocookie.com`
- ❌ Add background music in YouTube — pitch deck adds its own
- ❌ Edit the YouTube video on YouTube's editor — re-record locally and re-upload
