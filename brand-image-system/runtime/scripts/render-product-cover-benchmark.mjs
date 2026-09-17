import fs from "node:fs";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import { spawnSync } from "node:child_process";

// Historical reproduction only. Founder review rejected this visual system on
// 2026-08-17. Keep the renderer for experiment provenance, but prevent an agent
// from accidentally using it as the current brand foundation.
if (process.env.ALLOW_REJECTED_VISUAL_EXPERIMENT !== "1") {
  console.error(
    "Blocked: this renderer reproduces the rejected 2026-08-17 cover experiment. " +
      "Use the visual foundation reset and identity rebuild protocol. Set " +
      "ALLOW_REJECTED_VISUAL_EXPERIMENT=1 only for historical reproduction."
  );
  process.exit(2);
}

const scriptDir = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(scriptDir, "../../..");
const reposRoot = path.resolve(repoRoot, "..");

function arg(name, fallback = null) {
  const i = process.argv.indexOf(name);
  return i >= 0 ? process.argv[i + 1] : fallback;
}

const jobRoot = path.resolve(arg("--output", "C:/Users/frank/brands/image-system/jobs/2026-08-17/product-cover-overhaul-v2"));
const arcaneaSource = arg("--arcanea-source");
const portfolioPath = path.resolve(arg("--portfolio", path.join(repoRoot, "brand-image-system/experiments/2026-08-17-product-cover-overhaul/product-asset-portfolio.json")));
if (!arcaneaSource || !fs.existsSync(path.resolve(arcaneaSource))) {
  console.error("Provide --arcanea-source <existing generated source image>.");
  process.exit(2);
}
const portfolio = JSON.parse(fs.readFileSync(portfolioPath, "utf8"));

const dirs = {
  assets: path.join(jobRoot, "assets"),
  fonts: path.join(jobRoot, "assets", "fonts"),
  logos: path.join(jobRoot, "assets", "logos"),
  source: path.join(jobRoot, "assets", "source"),
  masters: path.join(jobRoot, "masters"),
  exports: path.join(jobRoot, "exports")
};
Object.values(dirs).forEach((dir) => fs.mkdirSync(dir, { recursive: true }));

function copy(source, destination) {
  if (!fs.existsSync(source)) throw new Error(`Missing canonical asset: ${source}`);
  fs.copyFileSync(source, destination);
  return destination;
}

const assetSources = {
  frankxWordmark: path.join(reposRoot, "frankx.ai-vercel-website/public/images/brand/logo-full-v2.png"),
  frankxMark: path.join(reposRoot, "frankx.ai-vercel-website/public/images/brand/logo-mark-v2.png"),
  gencreatorWordmark: path.join(reposRoot, "gencreator.ai/public/brand/gencreator-wordmark.svg"),
  gencreatorMark: path.join(reposRoot, "gencreator.ai/public/brand/gencreator-mark.svg"),
  arcaneaWordmark: path.join(reposRoot, "arcanea-ai-app/apps/web/public/brand/arcanea-wordmark.svg"),
  arcaneaLogo: path.join(reposRoot, "arcanea-ai-app/apps/web/public/brand/arcanea-logo.svg"),
  sisProof: path.join(reposRoot, "starlightintelligence.ai/public/media/gallery/batch-10-encyclopedia-masters/b10-097-seven-sovereignty-guarantees.png")
};

const copiedAssets = [
  copy(assetSources.frankxWordmark, path.join(dirs.logos, "frankx-wordmark.png")),
  copy(assetSources.frankxMark, path.join(dirs.logos, "frankx-mark.png")),
  copy(assetSources.gencreatorWordmark, path.join(dirs.logos, "gencreator-wordmark.svg")),
  copy(assetSources.gencreatorMark, path.join(dirs.logos, "gencreator-mark.svg")),
  copy(assetSources.arcaneaWordmark, path.join(dirs.logos, "arcanea-wordmark.svg")),
  copy(assetSources.arcaneaLogo, path.join(dirs.logos, "arcanea-logo.svg")),
  copy(assetSources.sisProof, path.join(dirs.source, "sis-sovereignty-proof.png")),
  copy(path.resolve(arcaneaSource), path.join(dirs.source, "arcanea-world-bible-source.png"))
];
const frankxCrop = path.join(dirs.logos, "frankx-wordmark-crop.png");
const cropResult = spawnSync("ffmpeg", ["-hide_banner", "-loglevel", "error", "-y", "-i", assetSources.frankxWordmark, "-vf", "crop=900:300:245:235", frankxCrop], { encoding: "utf8", timeout: 120000 });
if (cropResult.status !== 0 || !fs.existsSync(frankxCrop)) {
  throw new Error(`Could not create a non-destructive presentation crop of the canonical FrankX wordmark: ${cropResult.stderr || cropResult.stdout}`);
}
copiedAssets.push(frankxCrop);

const fontRoot = path.join(reposRoot, "arcanea-ai-app/apps/web/public/fonts");
const fonts = [
  ["outfit/outfit-v15-latin-regular.woff2", "outfit-regular.woff2"],
  ["outfit/outfit-v15-latin-700.woff2", "outfit-bold.woff2"],
  ["inter/inter-v20-latin-regular.woff2", "inter-regular.woff2"],
  ["inter/inter-v20-latin-700.woff2", "inter-bold.woff2"],
  ["sora/sora-v17-latin-regular.woff2", "sora-regular.woff2"],
  ["sora/sora-v17-latin-700.woff2", "sora-bold.woff2"],
  ["ibm-plex-sans/ibm-plex-sans-v23-latin-regular.woff2", "plex-sans-regular.woff2"],
  ["ibm-plex-sans/ibm-plex-sans-v23-latin-700.woff2", "plex-sans-bold.woff2"],
  ["ibm-plex-mono/ibm-plex-mono-v20-latin-regular.woff2", "plex-mono-regular.woff2"],
  ["plus-jakarta-sans/plus-jakarta-sans-v12-latin-regular.woff2", "jakarta-regular.woff2"],
  ["plus-jakarta-sans/plus-jakarta-sans-v12-latin-700.woff2", "jakarta-bold.woff2"]
];
for (const [source, destination] of fonts) {
  copiedAssets.push(copy(path.join(fontRoot, source), path.join(dirs.fonts, destination)));
}

const fontCss = `
@font-face{font-family:Outfit;src:url('../assets/fonts/outfit-regular.woff2')}@font-face{font-family:Outfit;src:url('../assets/fonts/outfit-bold.woff2');font-weight:700}
@font-face{font-family:Inter;src:url('../assets/fonts/inter-regular.woff2')}@font-face{font-family:Inter;src:url('../assets/fonts/inter-bold.woff2');font-weight:700}
@font-face{font-family:Sora;src:url('../assets/fonts/sora-regular.woff2')}@font-face{font-family:Sora;src:url('../assets/fonts/sora-bold.woff2');font-weight:700}
@font-face{font-family:PlexSans;src:url('../assets/fonts/plex-sans-regular.woff2')}@font-face{font-family:PlexSans;src:url('../assets/fonts/plex-sans-bold.woff2');font-weight:700}
@font-face{font-family:PlexMono;src:url('../assets/fonts/plex-mono-regular.woff2')}
@font-face{font-family:Jakarta;src:url('../assets/fonts/jakarta-regular.woff2')}@font-face{font-family:Jakarta;src:url('../assets/fonts/jakarta-bold.woff2');font-weight:700}
`;

const sharedCss = `
*{box-sizing:border-box}html,body{margin:0;width:100%;height:100%;overflow:hidden}body{background:#05060a;color:white}body:after{content:'';position:fixed;inset:0;z-index:999;pointer-events:none;opacity:.022;mix-blend-mode:soft-light;background-image:url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='180' height='180' viewBox='0 0 180 180'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='.82' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)' opacity='.72'/%3E%3C/svg%3E")}
.page{position:relative;width:1080px;height:1440px;overflow:hidden}.eyebrow{font:700 18px/1 Inter,sans-serif;letter-spacing:.18em;text-transform:uppercase}.status{display:inline-flex;align-items:center;gap:10px;padding:11px 16px;border:1px solid rgba(255,255,255,.18);border-radius:999px;font:700 15px/1 Inter,sans-serif;letter-spacing:.12em;text-transform:uppercase}.status:before{content:'';width:7px;height:7px;border-radius:50%;background:currentColor;box-shadow:0 0 18px currentColor}.fine{font:400 16px/1.45 Inter,sans-serif;letter-spacing:.02em}.rule{height:1px;background:rgba(255,255,255,.18)}
`;

function doc(body, extraCss, width = 1080, height = 1440) {
  return `<!doctype html><html><head><meta charset="utf-8"><style>${fontCss}${sharedCss}${extraCss}html,body{width:${width}px;height:${height}px}</style></head><body>${body}</body></html>`;
}

function escapeHtml(value) {
  return String(value).replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;").replaceAll('"', "&quot;");
}

const covers = [
  {
    id: "frankx-venture-signal-sprint",
    brand: "FrankX",
    product: "Venture Signal Sprint",
    form: "SPRINT",
    status: "VALIDATION CONCEPT",
    accent: "#00d4ff",
    html: doc(`
      <main class="page fx">
        <div class="fx-grid"></div><div class="fx-signal-glow"></div>
        <header><img src="../assets/logos/frankx-wordmark-crop.png" alt="FrankX"><span class="status">Validation concept</span></header>
        <section class="fx-title"><div class="eyebrow">FP–000 / DECISION INSTRUMENT</div><h1>Venture<br><span>Signal</span> Sprint</h1><p>Five-day decision sprint</p></section>
        <section class="fx-instrument">
          <div class="instrument-label">EVIDENCE SIGNAL / 01—05</div>
          <svg viewBox="0 0 900 290" aria-label="Evidence signal crossing a decision gate">
            <defs><linearGradient id="fxline" x1="0" y1="0" x2="1" y2="0"><stop stop-color="#41647c"/><stop offset=".58" stop-color="#00d4ff"/><stop offset="1" stop-color="#f2b84b"/></linearGradient></defs>
            <g stroke="#173047" stroke-width="1"><path d="M0 40H900M0 100H900M0 160H900M0 220H900M0 280H900"/><path d="M90 0V290M270 0V290M450 0V290M630 0V290M810 0V290"/></g>
            <path d="M0 232 C90 218 145 246 225 207 S355 192 418 150 S530 178 592 110 S730 128 900 42" fill="none" stroke="url(#fxline)" stroke-width="8" stroke-linecap="round"/>
            <path d="M630 0V290" stroke="#f2b84b" stroke-width="2" stroke-dasharray="7 9"/><circle cx="630" cy="92" r="13" fill="#08131f" stroke="#f2b84b" stroke-width="5"/>
          </svg>
          <div class="gate-label">DECISION GATE</div>
        </section>
        <section class="fx-artifacts"><div><b>01</b><span>Source ledger</span></div><div><b>02</b><span>Decision memo</span></div><div><b>03</b><span>Kill criteria</span></div></section>
        <footer><span>BUILD · HOLD · KILL</span><span>frankx.ai</span></footer>
      </main>`, `
      .fx{font-family:Outfit,sans-serif;background:#050914;color:#f6faff;padding:58px 64px 48px;border:1px solid #173047}.fx:after{content:'';position:absolute;inset:18px;border:1px solid rgba(0,212,255,.12);pointer-events:none}.fx-grid{position:absolute;inset:0;background-image:linear-gradient(rgba(0,212,255,.055) 1px,transparent 1px),linear-gradient(90deg,rgba(0,212,255,.055) 1px,transparent 1px);background-size:72px 72px;mask-image:linear-gradient(to bottom,black,transparent 72%)}.fx-signal-glow{position:absolute;width:520px;height:520px;right:-190px;top:-210px;background:radial-gradient(circle,rgba(0,212,255,.2),transparent 66%)}.fx header{position:relative;display:flex;align-items:center;justify-content:space-between;height:84px}.fx header img{width:270px;height:90px;object-fit:contain;object-position:left center;mix-blend-mode:screen}.fx .status{color:#00d4ff}.fx-title{position:relative;margin-top:90px}.fx-title .eyebrow{color:#7ba7c4}.fx h1{margin:28px 0 18px;font:700 112px/.88 Outfit,sans-serif;letter-spacing:-.055em}.fx h1 span{color:#00d4ff}.fx-title p{margin:0;color:#b7c9d7;font:400 28px/1.3 Inter,sans-serif}.fx-instrument{position:relative;margin-top:88px;padding:28px 28px 20px;background:rgba(7,18,31,.86);border:1px solid rgba(0,212,255,.28);box-shadow:0 28px 90px rgba(0,0,0,.35)}.instrument-label{font:700 15px/1 PlexMono,monospace;color:#8fb6cc;letter-spacing:.13em}.fx-instrument svg{display:block;width:100%;margin-top:18px}.gate-label{position:absolute;right:208px;top:44px;color:#f2b84b;font:400 14px/1 PlexMono,monospace;letter-spacing:.14em;writing-mode:vertical-rl}.fx-artifacts{position:relative;display:grid;grid-template-columns:repeat(3,1fr);gap:14px;margin-top:22px}.fx-artifacts div{display:flex;flex-direction:column;gap:12px;padding:22px 20px;border-top:2px solid #00d4ff;background:#08101c}.fx-artifacts b{font:400 13px/1 PlexMono;color:#6996b1}.fx-artifacts span{font:700 17px/1.2 Inter}.fx footer{position:absolute;left:64px;right:64px;bottom:48px;display:flex;justify-content:space-between;color:#7293a8;font:400 14px/1 PlexMono;letter-spacing:.14em}
      `)
  },
  {
    id: "gencreator-creatorpack",
    brand: "GenCreator",
    product: "CreatorPack / owned-work loop",
    form: "PACK",
    status: "VALIDATION CONCEPT",
    accent: "#38bdf8",
    html: doc(`
      <main class="page gc">
        <header><img src="../assets/logos/gencreator-wordmark.svg" alt="GenCreator"><span class="status">Validation concept</span></header>
        <section class="gc-title"><div class="eyebrow">VERSIONED CREATOR INSTRUMENT</div><h1>Creator<span>Pack</span></h1><p>One owned-work loop that resumes.</p></section>
        <section class="gc-loop">
          <div class="source-stack"><div><i>01</i><span>Source</span></div><div><i>02</i><span>Source</span></div><div><i>03</i><span>Source</span></div></div>
          <div class="flow flow-a"></div>
          <div class="constellation"><img src="../assets/logos/gencreator-mark.svg" alt=""><b>CONSTELLATION<br>MEMBER</b><i class="n n1"></i><i class="n n2"></i><i class="n n3"></i><i class="n n4"></i></div>
          <div class="flow flow-b"></div>
          <div class="artifact"><div class="artifact-bar"></div><small>APPROVED</small><strong>Artifact</strong><span>Source-linked</span></div>
        </section>
        <section class="gc-rail"><span>SOURCE</span><b>→</b><span>ARTIFACT</span><b>→</b><span>PROOF</span><b>→</b><span>NEXT MISSION</span></section>
        <footer><span>OWN THE WORK · RESUME THE LOOP</span><span>gencreator.ai</span></footer>
      </main>`, `
      .gc{font-family:Sora,sans-serif;background:#05060a;padding:56px 60px 48px;color:#f1f7ff}.gc:before{content:'';position:absolute;inset:0;background:linear-gradient(140deg,transparent 48%,rgba(56,189,248,.08) 48.2%,transparent 74%),radial-gradient(circle at 75% 48%,rgba(52,211,153,.12),transparent 32%)}.gc:after{content:'';position:absolute;inset:22px;border:1px solid rgba(241,247,255,.1);pointer-events:none}.gc header{position:relative;display:flex;align-items:center;justify-content:space-between}.gc header img{width:385px;height:96px;object-fit:contain;object-position:left}.gc .status{color:#34d399}.gc-title{position:relative;margin-top:90px}.gc-title .eyebrow{color:#8be9fd}.gc h1{margin:24px 0 14px;font:700 118px/.95 Sora,sans-serif;letter-spacing:-.06em}.gc h1 span{color:#38bdf8}.gc-title p{margin:0;color:#a8b7c7;font:400 27px/1.4 Inter,sans-serif}.gc-loop{position:relative;margin-top:112px;height:455px;border:1px solid rgba(110,168,254,.22);background:#070a10;display:grid;grid-template-columns:190px 1fr 260px 1fr 220px;align-items:center;padding:34px;box-shadow:0 34px 100px rgba(0,0,0,.45)}.source-stack{display:flex;flex-direction:column;gap:16px}.source-stack div{height:88px;padding:14px 16px;border:1px solid #263648;background:#0b111a;display:flex;align-items:center;gap:16px}.source-stack i{font:400 12px PlexMono;color:#6ea8fe}.source-stack span{font:700 17px Inter}.flow{height:1px;background:linear-gradient(90deg,#6ea8fe,#38bdf8,#34d399);position:relative}.flow:after{content:'';position:absolute;right:-3px;top:-4px;border-left:8px solid #34d399;border-top:4px solid transparent;border-bottom:4px solid transparent}.constellation{height:260px;border-radius:50%;border:1px solid rgba(56,189,248,.38);position:relative;display:flex;flex-direction:column;align-items:center;justify-content:center;background:radial-gradient(circle,rgba(56,189,248,.14),transparent 62%)}.constellation:before,.constellation:after{content:'';position:absolute;inset:32px;border-radius:50%;border:1px dashed rgba(52,211,153,.22);transform:rotate(22deg)}.constellation:after{inset:68px;transform:rotate(-18deg)}.constellation img{width:76px;height:76px}.constellation b{margin-top:14px;font:700 12px/1.45 PlexMono;text-align:center;letter-spacing:.12em;color:#ccecff}.constellation .n{position:absolute;width:10px;height:10px;border-radius:50%;background:#34d399;box-shadow:0 0 18px #34d399}.n1{top:24px;left:85px}.n2{right:17px;top:110px}.n3{bottom:34px;left:52px}.n4{left:17px;top:115px}.artifact{height:250px;border:1px solid #2f455c;background:#0b1119;padding:24px;display:flex;flex-direction:column;justify-content:flex-end;position:relative}.artifact-bar{position:absolute;left:24px;right:24px;top:24px;height:92px;background:linear-gradient(120deg,rgba(110,168,254,.9),rgba(56,189,248,.8),rgba(52,211,153,.9));clip-path:polygon(0 86%,22% 38%,39% 62%,62% 12%,78% 50%,100% 18%,100% 100%,0 100%)}.artifact small{font:700 11px PlexMono;color:#34d399;letter-spacing:.14em}.artifact strong{font:700 29px/1.1 Sora;margin-top:10px}.artifact span{font:400 14px Inter;color:#91a6b8;margin-top:7px}.gc-rail{position:relative;margin-top:26px;display:flex;justify-content:space-between;align-items:center;color:#8be9fd;font:700 14px PlexMono;letter-spacing:.08em}.gc-rail b{color:#31485c}.gc footer{position:absolute;left:60px;right:60px;bottom:48px;display:flex;justify-content:space-between;color:#60788c;font:400 14px PlexMono;letter-spacing:.12em}
      `)
  },
  {
    id: "sis-sovereign-intelligence-starter-kit",
    brand: "Starlight Intelligence",
    product: "Sovereign Intelligence Starter Kit",
    form: "KIT",
    status: "VALIDATION CONCEPT",
    accent: "#c7aa69",
    html: doc(`
      <main class="page sis">
        <img class="sis-photo" src="../assets/source/sis-sovereignty-proof.png" alt="Inspected Starlight sovereignty proof visual">
        <div class="sis-shade"></div>
        <header><div class="sis-signature"><b>STARLIGHT</b><span>INTELLIGENCE</span></div><span class="status">Validation concept</span></header>
        <section class="sis-title"><div class="eyebrow">SOVEREIGN OPERATOR KIT</div><h1>Sovereign<br>Intelligence<br><em>Starter Kit</em></h1><p>Own the system. Inspect the proof. Keep the exit.</p></section>
        <section class="sis-checks"><div><b>01</b><span>OWN</span></div><div><b>02</b><span>INSPECT</span></div><div><b>03</b><span>EVALUATE</span></div><div><b>04</b><span>EXPORT</span></div></section>
        <footer><span>OWNED MEMORY · EVAL RECEIPTS · EXPORT RIGHTS</span><span>starlightintelligence.ai</span></footer>
      </main>`, `
      .sis{font-family:PlexSans,sans-serif;background:#07090b;color:#f3efe7}.sis-photo{position:absolute;left:0;right:0;bottom:0;width:100%;height:830px;object-fit:cover;object-position:center 34%;filter:saturate(.74) contrast(1.05)}.sis-shade{position:absolute;inset:0;background:linear-gradient(to bottom,#07090b 0%,#07090b 40%,rgba(7,9,11,.88) 55%,rgba(7,9,11,.28) 79%,rgba(7,9,11,.92) 100%),linear-gradient(90deg,rgba(184,154,90,.1),transparent 45%)}.sis:after{content:'';position:absolute;inset:22px;border:1px solid rgba(199,170,105,.28)}.sis header{position:relative;margin:58px 62px 0;display:flex;justify-content:space-between;align-items:center}.sis-signature{display:flex;align-items:baseline;gap:14px}.sis-signature b{font:700 24px/1 PlexSans;letter-spacing:.16em}.sis-signature span{font:400 13px/1 PlexMono;letter-spacing:.18em;color:#b89a5a}.sis .status{color:#c7aa69}.sis-title{position:relative;margin:118px 62px 0;max-width:850px}.sis-title .eyebrow{color:#b89a5a}.sis h1{margin:24px 0 22px;font:700 94px/.92 PlexSans;letter-spacing:-.045em}.sis h1 em{font-style:normal;color:#d2bd8b}.sis-title p{margin:0;max-width:650px;font:400 26px/1.45 PlexSans;color:#c8c6be}.sis-checks{position:absolute;left:62px;right:62px;bottom:138px;display:grid;grid-template-columns:repeat(4,1fr);border:1px solid rgba(231,224,210,.28);background:rgba(7,9,11,.84);backdrop-filter:blur(12px)}.sis-checks div{height:105px;padding:19px 22px;border-right:1px solid rgba(231,224,210,.2);display:flex;flex-direction:column;justify-content:space-between}.sis-checks div:last-child{border:0}.sis-checks b{font:400 12px PlexMono;color:#b89a5a}.sis-checks span{font:700 17px PlexSans;letter-spacing:.12em}.sis footer{position:absolute;left:62px;right:62px;bottom:55px;display:flex;justify-content:space-between;color:#aaa69b;font:400 13px PlexMono;letter-spacing:.08em}
      `)
  },
  {
    id: "arcanea-world-bible",
    brand: "Arcanea",
    product: "World Bible / Project Context Kit",
    form: "KIT",
    status: "VALIDATION CONCEPT",
    accent: "#7fffd4",
    html: doc(`
      <main class="page ar">
        <img class="ar-photo" src="../assets/source/arcanea-world-bible-source.png" alt="Generated codex source art">
        <div class="ar-shade"></div><div class="ar-rule"></div>
        <header><img src="../assets/logos/arcanea-wordmark.svg" alt="Arcanea"><span class="status">Validation concept</span></header>
        <section class="ar-title"><div class="eyebrow">PORTABLE WORLD CONTEXT</div><h1>World<br><span>Bible</span></h1><p>Project Context Kit</p></section>
        <section class="ar-chrome"><div><b>01</b><span>LORE</span></div><div><b>02</b><span>CONTINUITY</span></div><div><b>03</b><span>EXPORT</span></div><p>Living context, carried with the project.</p></section>
        <footer><span>PRODUCT RAIL / WORLD SOURCE</span><span>arcanea.ai</span></footer>
      </main>`, `
      .ar{font-family:Jakarta,sans-serif;background:#05040a;color:#f8f7fb}.ar-photo{position:absolute;inset:0;width:100%;height:100%;object-fit:cover}.ar-shade{position:absolute;inset:0;background:linear-gradient(to bottom,rgba(5,4,10,.96) 0%,rgba(5,4,10,.82) 26%,rgba(5,4,10,.18) 57%,rgba(5,4,10,.55) 78%,rgba(5,4,10,.96) 100%),linear-gradient(90deg,rgba(5,4,10,.45),transparent 70%)}.ar:after{content:'';position:absolute;inset:20px;border:1px solid rgba(127,255,212,.22)}.ar-rule{position:absolute;left:0;top:0;width:9px;height:100%;background:linear-gradient(#7fffd4,#a78bfa,#9b59ff)}.ar header{position:relative;margin:54px 60px 0;display:flex;align-items:center;justify-content:space-between}.ar header img{width:305px;height:74px;object-fit:contain;object-position:left}.ar .status{color:#7fffd4;background:rgba(5,4,10,.54)}.ar-title{position:relative;margin:92px 60px 0}.ar-title .eyebrow{color:#b7a7f8}.ar h1{margin:20px 0 12px;font:400 125px/.82 Georgia,serif;letter-spacing:-.065em}.ar h1 span{color:#7fffd4;font-style:italic}.ar-title p{margin:0;color:#d9d1ef;font:700 27px/1.3 Jakarta;letter-spacing:.02em}.ar-chrome{position:absolute;left:60px;right:60px;bottom:128px;display:grid;grid-template-columns:repeat(3,1fr);padding:0;border:1px solid rgba(127,255,212,.28);background:rgba(7,5,14,.82);backdrop-filter:blur(18px)}.ar-chrome div{height:100px;padding:18px 22px;border-right:1px solid rgba(167,139,250,.22);display:flex;flex-direction:column;justify-content:space-between}.ar-chrome b{font:400 11px PlexMono;color:#9d8ede}.ar-chrome span{font:700 16px Jakarta;letter-spacing:.14em}.ar-chrome p{grid-column:1/-1;margin:0;padding:18px 22px;border-top:1px solid rgba(167,139,250,.22);font:400 18px/1.4 Jakarta;color:#d4cfe1}.ar footer{position:absolute;left:60px;right:60px;bottom:54px;display:flex;justify-content:space-between;color:#a99fbe;font:400 13px PlexMono;letter-spacing:.1em}
      `)
  }
];

const edge = [
  "C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe",
  "C:/Program Files/Microsoft/Edge/Application/msedge.exe",
  "C:/Program Files/Google/Chrome/Application/chrome.exe"
].find((candidate) => fs.existsSync(candidate));
if (!edge) throw new Error("No supported headless browser found.");

function write(file, content) {
  fs.writeFileSync(file, content, "utf8");
}

function capture(htmlPath, outputPath, width, height) {
  const result = spawnSync(edge, [
    "--headless=new",
    "--hide-scrollbars",
    "--disable-gpu",
    "--disable-extensions",
    "--disable-background-networking",
    "--allow-file-access-from-files",
    "--run-all-compositor-stages-before-draw",
    "--no-first-run",
    `--window-size=${width},${height}`,
    `--screenshot=${outputPath}`,
    pathToFileURL(htmlPath).href
  ], { encoding: "utf8", timeout: 120000 });
  if (result.status !== 0 || !fs.existsSync(outputPath)) {
    throw new Error(`Capture failed for ${htmlPath}: ${result.stderr || result.stdout}`);
  }
}

function webp(pngPath, webpPath) {
  const result = spawnSync("ffmpeg", ["-hide_banner", "-loglevel", "error", "-y", "-i", pngPath, "-c:v", "libwebp", "-quality", "92", webpPath], { encoding: "utf8", timeout: 120000 });
  if (result.status !== 0 || !fs.existsSync(webpPath)) {
    throw new Error(`WebP conversion failed for ${pngPath}: ${result.stderr || result.stdout}`);
  }
}

function ogDocument(cover) {
  return doc(`<main class="og" style="--accent:${cover.accent}"><div class="og-cover"><img src="../exports/${cover.id}.png" alt=""></div><section><div class="og-brand">${cover.brand}</div><div class="og-form">${cover.form} / ${cover.status}</div><h1>${cover.product}</h1><div class="og-rule"></div><p>Brand-locked product cover system · benchmark v2</p></section></main>`, `
    .og{width:1200px;height:630px;background:#06080c;color:#f7f9fc;display:grid;grid-template-columns:430px 1fr;gap:58px;padding:44px 58px;font-family:Inter,sans-serif;position:relative}.og:before{content:'';position:absolute;inset:0;border-top:8px solid var(--accent)}.og-cover{height:542px;display:flex;justify-content:center}.og-cover img{height:542px;width:auto;box-shadow:0 26px 80px rgba(0,0,0,.55)}.og section{display:flex;flex-direction:column;justify-content:center}.og-brand{font:700 19px Inter;letter-spacing:.15em;text-transform:uppercase;color:var(--accent)}.og-form{margin-top:22px;font:400 14px PlexMono;color:#8493a2;letter-spacing:.1em}.og h1{max-width:610px;margin:28px 0 30px;font:700 64px/.96 Outfit,sans-serif;letter-spacing:-.045em}.og-rule{width:130px;height:3px;background:var(--accent)}.og p{margin-top:24px;color:#9aa7b3;font:400 17px/1.4 Inter}
  `, 1200, 630);
}

const outputs = [];
for (const cover of covers) {
  const master = path.join(dirs.masters, `${cover.id}.html`);
  const png = path.join(dirs.exports, `${cover.id}.png`);
  const webpPath = path.join(dirs.exports, `${cover.id}.webp`);
  write(master, cover.html);
  capture(master, png, 1080, 1440);
  webp(png, webpPath);
  outputs.push(master, png, webpPath);

  const ogMaster = path.join(dirs.masters, `${cover.id}-og.html`);
  const ogPng = path.join(dirs.exports, `${cover.id}-og.png`);
  write(ogMaster, ogDocument(cover));
  capture(ogMaster, ogPng, 1200, 630);
  outputs.push(ogMaster, ogPng);
}

const overviewNotes = {
  SPRINT: "Decision signal · memo · kill criteria",
  PACK: "Source → artifact → proof → next mission",
  KIT: "Inspectable contents · owned delivery"
};
const overviewCards = covers.map((cover) => `<article style="--accent:${cover.accent}"><img src="../exports/${cover.id}.png" alt=""><h2>${cover.product}</h2><p>${overviewNotes[cover.form]}</p><div><span>${cover.brand}</span><b>${cover.form}</b></div></article>`).join("");
const overview = doc(`<main class="overview"><header><div><span>STARLIGHT PRODUCT PORTFOLIO</span><h1>Four brands. Forty-seven products.<br><em>One truthful asset system.</em></h1></div><div class="scope"><b>${portfolio.summary.byReleaseState.public}</b> PUBLIC <i>·</i> <b>${portfolio.summary.byReleaseState.validation}</b> VALIDATION <i>·</i> <b>${portfolio.summary.byReleaseState["internal-only"]}</b> INTERNAL</div></header><section class="cards">${overviewCards}</section><footer><span>FORM-SPECIFIC · BRAND-LOCKED · MODEL-RECEIPTED</span><span>BENCHMARK WAVE 01 / 2026-08-17</span></footer></main>`, `
  .overview{position:relative;width:1920px;height:1080px;background:#06080d;color:#f6f8fb;padding:54px 70px 38px;font-family:Inter,sans-serif;overflow:hidden}.overview:before{content:'';position:absolute;inset:0;background:linear-gradient(90deg,rgba(0,212,255,.06),transparent 22%,transparent 76%,rgba(167,139,250,.07))}.overview header{position:relative;display:flex;justify-content:space-between;align-items:flex-end}.overview header>div>span{font:700 15px PlexMono;letter-spacing:.15em;color:#91a4b6}.overview h1{margin:18px 0 0;font:700 49px/1.04 Outfit;letter-spacing:-.04em}.overview h1 em{font-style:normal;color:#8be9fd}.scope{font:400 14px PlexMono;color:#7f91a2;letter-spacing:.08em}.scope b{color:#e9f1f7}.scope i{font-style:normal;margin:0 9px;color:#334657}.cards{position:relative;display:grid;grid-template-columns:repeat(4,1fr);gap:34px;margin-top:44px;height:790px}.cards article{position:relative;background:#0a0e15;border:1px solid #1d2a38;padding:16px 16px 82px;overflow:hidden}.cards article:before{content:'';position:absolute;left:0;right:0;top:0;height:5px;background:var(--accent)}.cards article img{width:100%;height:540px;object-fit:contain;object-position:center top;background:#05070b;display:block}.cards article h2{margin:24px 4px 0;font:700 25px/1.05 Outfit;letter-spacing:-.025em}.cards article p{margin:11px 4px 0;font:400 13px/1.35 PlexMono;color:#8193a4}.cards article div{position:absolute;left:20px;right:20px;bottom:22px;display:flex;justify-content:space-between;align-items:center}.cards article span{font:700 15px Inter;color:#dce6ee}.cards article b{font:400 12px PlexMono;color:var(--accent);letter-spacing:.12em}.overview footer{position:absolute;left:70px;right:70px;bottom:26px;display:flex;justify-content:space-between;color:#6f8293;font:400 12px PlexMono;letter-spacing:.1em}
`, 1920, 1080);
const overviewMaster = path.join(dirs.masters, "portfolio-overview.html");
const overviewPng = path.join(dirs.exports, "portfolio-overview-1920x1080.png");
const overviewWebp = path.join(dirs.exports, "portfolio-overview-1920x1080.webp");
write(overviewMaster, overview);
capture(overviewMaster, overviewPng, 1920, 1080);
webp(overviewPng, overviewWebp);
outputs.push(overviewMaster, overviewPng, overviewWebp);

const portfolioBrands = [
  { id: "frankx", name: "FrankX", accent: "#00d4ff", className: "matrix-frankx" },
  { id: "gencreator", name: "GenCreator", accent: "#38bdf8", className: "matrix-gencreator" },
  { id: "sis", name: "Starlight Intelligence", accent: "#c7aa69", className: "matrix-sis" },
  { id: "arcanea", name: "Arcanea", accent: "#7fffd4", className: "matrix-arcanea" }
];

function matrixPanel(brand) {
  const products = portfolio.products.filter((product) => product.brandId === brand.id);
  const rows = products.map((product) => `<li class="state-${product.releaseState}"><i></i><span>${escapeHtml(product.name)}</span><b>${escapeHtml(product.productForm)}</b><em>${escapeHtml(product.status)}</em></li>`).join("");
  const counts = {
    public: products.filter((product) => product.releaseState === "public").length,
    validation: products.filter((product) => product.releaseState === "validation").length,
    internal: products.filter((product) => product.releaseState === "internal-only").length
  };
  return `<section class="matrix-panel ${brand.className}" style="--accent:${brand.accent}"><header><div><span>BRAND OPERATING UNIT</span><h2>${brand.name}</h2></div><p><b>${products.length}</b> products<br>${counts.public} public · ${counts.validation} validation · ${counts.internal} internal</p></header><ol>${rows}</ol></section>`;
}

const matrix = doc(`<main class="matrix"><header class="matrix-head"><div><span>PRODUCT ASSET PORTFOLIO / HERMES SCOPE</span><h1>All forty-seven products.<br><em>Truth before launch theater.</em></h1></div><div class="matrix-legend"><span class="public">PUBLIC</span><span class="validation">VALIDATION</span><span class="internal">INTERNAL ONLY</span></div></header><div class="matrix-grid">${portfolioBrands.map(matrixPanel).join("")}</div><footer><span>FORM → RELEASE STATE → ASSET FAMILY</span><span>SOURCE: PRODUCT FUNNEL OS · 2026-08-17</span></footer></main>`, `
  .matrix{position:relative;width:2560px;height:1800px;background:#06080d;color:#f6f8fb;padding:62px 74px 44px;font-family:Inter,sans-serif}.matrix:before{content:'';position:absolute;inset:0;background:linear-gradient(120deg,rgba(0,212,255,.055),transparent 31%,transparent 70%,rgba(167,139,250,.06))}.matrix-head{position:relative;display:flex;justify-content:space-between;align-items:flex-end;height:180px}.matrix-head>div>span{font:700 17px PlexMono;letter-spacing:.15em;color:#8ea3b4}.matrix h1{margin:18px 0 0;font:700 58px/1.02 Outfit;letter-spacing:-.04em}.matrix h1 em{font-style:normal;color:#8be9fd}.matrix-legend{display:flex;gap:14px}.matrix-legend span{padding:12px 16px;border:1px solid #283745;font:700 13px PlexMono;letter-spacing:.1em}.matrix-legend .public{color:#65e5c1}.matrix-legend .validation{color:#e3bd67}.matrix-legend .internal{color:#8998a5}.matrix-grid{position:relative;margin-top:42px;height:1430px;display:grid;grid-template-columns:1.35fr 1fr;grid-template-rows:repeat(3,1fr);gap:24px}.matrix-panel{position:relative;background:#0a0e15;border:1px solid #1b2936;padding:27px 30px 24px;overflow:hidden}.matrix-panel:before{content:'';position:absolute;left:0;top:0;bottom:0;width:5px;background:var(--accent)}.matrix-panel>header{height:72px;display:flex;justify-content:space-between;align-items:flex-start;border-bottom:1px solid #21303d;padding-bottom:18px}.matrix-panel>header span{font:400 11px PlexMono;letter-spacing:.14em;color:#708496}.matrix-panel h2{margin:7px 0 0;font:700 30px/1 Outfit;letter-spacing:-.025em}.matrix-panel>header p{margin:0;text-align:right;color:#8092a1;font:400 12px/1.45 PlexMono}.matrix-panel>header p b{color:var(--accent);font-size:18px}.matrix-panel ol{list-style:none;padding:0;margin:18px 0 0;display:grid;gap:5px}.matrix-frankx{grid-row:1/4}.matrix-frankx ol{grid-template-columns:1fr 1fr;column-gap:17px}.matrix-panel li{position:relative;min-height:54px;display:grid;grid-template-columns:13px 1fr auto;grid-template-rows:auto auto;gap:4px 12px;align-content:center;padding:8px 12px;background:#0d131b;border:1px solid #182430}.matrix-frankx li{min-height:72px}.matrix-panel:not(.matrix-frankx){padding:20px 26px 18px}.matrix-panel:not(.matrix-frankx)>header{height:58px;padding-bottom:10px}.matrix-panel:not(.matrix-frankx) ol{margin-top:10px;gap:4px}.matrix-panel:not(.matrix-frankx) li{min-height:37px;padding:4px 10px;gap:2px 10px}.matrix-panel:not(.matrix-frankx) li span{font-size:13px}.matrix-panel:not(.matrix-frankx) li em{font-size:8px}.matrix-panel li i{grid-row:1/3;width:7px;height:7px;margin-top:8px;border-radius:50%;background:#7d8b96;box-shadow:0 0 12px rgba(125,139,150,.24)}.matrix-panel li.state-public i{background:#65e5c1;box-shadow:0 0 12px rgba(101,229,193,.45)}.matrix-panel li.state-validation i{background:#e3bd67;box-shadow:0 0 12px rgba(227,189,103,.38)}.matrix-panel li span{font:700 15px/1.2 Inter;color:#e9eef2}.matrix-panel li b{font:400 10px/1 PlexMono;color:var(--accent);letter-spacing:.09em;text-transform:uppercase}.matrix-panel li em{grid-column:2/4;font:400 10px/1 PlexMono;color:#6f818f;font-style:normal;text-transform:uppercase;letter-spacing:.06em}.matrix>footer{position:absolute;left:74px;right:74px;bottom:27px;display:flex;justify-content:space-between;color:#6d8192;font:400 12px PlexMono;letter-spacing:.1em}
`, 2560, 1800);
const matrixMaster = path.join(dirs.masters, "portfolio-matrix-all-47.html");
const matrixPng = path.join(dirs.exports, "portfolio-matrix-all-47-2560x1800.png");
const matrixWebp = path.join(dirs.exports, "portfolio-matrix-all-47-2560x1800.webp");
write(matrixMaster, matrix);
capture(matrixMaster, matrixPng, 2560, 1800);
webp(matrixPng, matrixWebp);
outputs.push(matrixMaster, matrixPng, matrixWebp);

const receipt = {
  jobId: "2026-08-17-product-cover-overhaul-v2",
  renderer: "headless Edge + deterministic HTML/CSS + ffmpeg WebP",
  edgePath: edge,
  generatedSource: {
    lane: "codex-imagegen",
    declaredModel: null,
    modelReceipt: "runtime-best-available; the image tool did not expose a model id",
    role: "Arcanea source art only",
    inputPath: path.resolve(arcaneaSource),
    copiedPath: path.join(dirs.source, "arcanea-world-bible-source.png")
  },
  canonicalAssets: copiedAssets,
  outputs,
  createdAt: new Date().toISOString()
};
write(path.join(jobRoot, "render-receipt.json"), `${JSON.stringify(receipt, null, 2)}\n`);
console.log(`Rendered ${covers.length} covers, ${covers.length} OG crops, a flagship overview, and the complete 47-product matrix to ${jobRoot}`);
