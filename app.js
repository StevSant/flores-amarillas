/* 💛 Personaliza esto antes de enviarlo.
   También puedes pasar ?nombre=Camila&firma=Bryan en el enlace. */
const CONFIG = {
  nombre: "",
  mensaje:
    "Unas flores bonitas para una niña bonita,\n ",
  firma: "",
  musica: true,
  youtubeId: "S7gMzYqXIZc",
};

const params = new URLSearchParams(window.location.search);
const nombre = (params.get("nombre") || CONFIG.nombre || "").trim();
const mensaje = (params.get("mensaje") || CONFIG.mensaje).replace(/\\n/g, "\n");
const firma = (params.get("firma") || CONFIG.firma || "").trim();
const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

const startBtn = document.getElementById("startBtn");
const cover = document.getElementById("cover");
const garden = document.getElementById("garden");
const flowersRoot = document.getElementById("flowers");
const letter = document.getElementById("letter");
const petalRain = document.getElementById("petalRain");
const muteBtn = document.getElementById("muteBtn");
const heartGlow = document.getElementById("heartGlow");

let ytPlayer = null;
let wantMusic = false;
let songReady = false;
let volumeFade = null;

document.getElementById("letterTo").textContent = nombre ? `Para ${nombre}` : "Para ti";
document.getElementById("letterBody").textContent = mensaje;
document.getElementById("letterSign").textContent = firma;

window.onYouTubeIframeAPIReady = createYouTubePlayer;
if (window.YT && YT.Player) createYouTubePlayer();

function createYouTubePlayer() {
  if (ytPlayer || !window.YT || !YT.Player) return;
  ytPlayer = new YT.Player("ytPlayer", {
    videoId: CONFIG.youtubeId,
    width: 240,
    height: 140,
    playerVars: {
      autoplay: 0,
      controls: 0,
      disablekb: 1,
      fs: 0,
      modestbranding: 1,
      playsinline: 1,
      rel: 0,
      loop: 1,
      playlist: CONFIG.youtubeId,
    },
    events: {
      onReady(event) {
        // Buffer it silently up front so the song starts the instant she taps.
        event.target.mute();
        event.target.playVideo();
      },
      onStateChange(event) {
        if (event.data === YT.PlayerState.ENDED) {
          playSong();
          return;
        }
        if (event.data !== YT.PlayerState.PLAYING || songReady) return;

        songReady = true;
        // Hold it paused right where it buffered; resuming avoids a fresh fetch.
        if (wantMusic) playSong();
        else event.target.pauseVideo();
      },
    },
  });
}

startBtn.addEventListener("click", () => {
  startBtn.disabled = true;
  cover.classList.add("is-gone");
  garden.hidden = false;
  garden.classList.add("is-live");
  if (CONFIG.musica) startMusic();
  runGarden();
});

muteBtn.addEventListener("click", () => {
  if (!ytPlayer) return;
  if (ytPlayer.isMuted()) {
    ytPlayer.unMute();
    muteBtn.classList.remove("is-muted");
    muteBtn.setAttribute("aria-label", "Silenciar canción");
    muteBtn.textContent = "♪";
  } else {
    ytPlayer.mute();
    muteBtn.classList.add("is-muted");
    muteBtn.setAttribute("aria-label", "Activar canción");
    muteBtn.textContent = "×";
  }
});

function runGarden() {
  const blooms = buildBlooms();
  blooms.forEach((el) => flowersRoot.appendChild(el));
  growTree();
  rainPetals();

  const firstWave = reduceMotion ? 0 : 1100;
  const glowAt = reduceMotion ? 80 : 2800;
  const letterAt = reduceMotion ? 200 : 7200;

  window.setTimeout(() => sproutFlowers(blooms), firstWave);
  window.setTimeout(() => heartGlow.classList.add("is-on"), glowAt);
  window.setTimeout(() => letter.classList.add("is-shown"), letterAt);
}

function growTree() {
  const paths = [...document.querySelectorAll(".tree-strokes .grow")];
  paths.forEach((path) => {
    const length = path.getTotalLength();
    const order = Number(path.dataset.order || 0);
    path.style.strokeDasharray = `${length}`;
    path.style.strokeDashoffset = `${length}`;
    if (reduceMotion) {
      path.style.strokeDashoffset = "0";
      return;
    }
    window.setTimeout(() => {
      path.style.transition = `stroke-dashoffset ${900 + order * 80}ms ease-out`;
      path.style.strokeDashoffset = "0";
    }, 280 + order * 280);
  });
}

function sproutFlowers(blooms) {
  if (reduceMotion) {
    blooms.forEach((el) => el.classList.add("is-grown"));
    return;
  }

  const ranked = blooms.map((el) => {
    const x = parseFloat(el.style.getPropertyValue("--x"));
    const y = parseFloat(el.style.getPropertyValue("--y"));
    const dist = Math.hypot(x - 50, y - 58);
    return { el, wait: dist * 26 + Math.random() * 420 };
  });

  ranked.sort((a, b) => a.wait - b.wait);

  ranked.forEach((item) => {
    window.setTimeout(() => {
      item.el.classList.add("is-open");
      item.el.addEventListener(
        "animationend",
        () => {
          item.el.classList.remove("is-open");
          item.el.classList.add("is-grown");
        },
        { once: true }
      );
    }, item.wait);
  });
}

function buildBlooms() {
  return canopyPoints().map((p) => {
    const size = p.stray ? 19 + Math.random() * 11 : 26 + Math.random() * 20;
    const type = Math.random() < 0.2 ? "blossom" : "sun";
    const palette = type === "blossom" ? SOFT_TONES : SUN_TONES;
    return makeBloom({
      x: p.x,
      y: p.y,
      size,
      type,
      petal: palette[Math.floor(Math.random() * palette.length)],
      rot: Math.random() * 360,
    });
  });
}

function canopyPoints() {
  const outline = heartOutline();
  const points = [];
  const stepX = 3.9;
  const stepY = 4.9;

  for (let y = 0; y <= 65; y += stepY) {
    for (let x = 5; x <= 95; x += stepX) {
      const jx = x + (Math.random() - 0.5) * stepX * 1.6;
      const jy = y + (Math.random() - 0.5) * stepY * 1.6;
      if (!pointInPolygon(jx, jy, outline)) continue;

      points.push({ x: jx, y: jy, stray: false });
      // Companions close by fill the gaps the grid leaves and read as clumps.
      if (Math.random() < 0.34) {
        const angle = Math.random() * Math.PI * 2;
        points.push({
          x: jx + Math.cos(angle) * (1.8 + Math.random() * 2.2),
          y: jy + Math.sin(angle) * (2.2 + Math.random() * 2.8),
          stray: false,
        });
      }
    }
  }

  // Flowers spilling past the edge keep the silhouette from looking stamped.
  for (let i = 0; i < 18; i += 1) {
    const p = outline[Math.floor(Math.random() * outline.length)];
    points.push({
      x: p.x + (p.x - 50) * 0.07 + (Math.random() - 0.5) * 4,
      y: p.y + (p.y - 28) * 0.07 + (Math.random() - 0.5) * 4,
      stray: true,
    });
  }

  return points;
}

// A wobbly heart reads as a tree that grew this way, not as a stamped shape.
function heartOutline() {
  const a = Math.random() * Math.PI * 2;
  const b = Math.random() * Math.PI * 2;
  const c = Math.random() * Math.PI * 2;
  const outline = [];

  for (let i = 0; i < 140; i += 1) {
    const t = (i / 140) * Math.PI * 2;
    const wobble =
      1 + 0.045 * Math.sin(3 * t + a) + 0.032 * Math.sin(7 * t + b) + 0.022 * Math.sin(13 * t + c);
    const p = heartXY(t);
    outline.push({
      x: 50 + p.x * 2.32 * wobble,
      y: 28 + p.y * 1.82 * wobble,
    });
  }

  return outline;
}

function pointInPolygon(x, y, poly) {
  let inside = false;
  for (let i = 0, j = poly.length - 1; i < poly.length; j = i, i += 1) {
    const xi = poly[i].x;
    const yi = poly[i].y;
    const xj = poly[j].x;
    const yj = poly[j].y;
    const hit = yi > y !== yj > y && x < ((xj - xi) * (y - yi)) / (yj - yi) + xi;
    if (hit) inside = !inside;
  }
  return inside;
}

function heartXY(t) {
  const x = 16 * Math.sin(t) ** 3;
  const y = -(13 * Math.cos(t) - 5 * Math.cos(2 * t) - 2 * Math.cos(3 * t) - Math.cos(4 * t));
  return { x, y };
}

const SUN_TONES = ["#f2bc12", "#ffd233", "#e8a80b", "#ffc61f", "#f7cb3d"];
const SOFT_TONES = ["#ffe574", "#ffdd57", "#fff0a3"];

function makeBloom({ x, y, size, type, petal, rot = Math.random() * 50 }) {
  const el = document.createElement("button");
  el.type = "button";
  el.className = "bloom";
  el.dataset.type = type;
  el.setAttribute("aria-label", "Flor");
  el.style.setProperty("--size", `${size}px`);
  el.style.setProperty("--rot", `${rot}deg`);
  el.style.setProperty("--x", `${x}%`);
  el.style.setProperty("--y", `${y}%`);
  el.style.setProperty("--petal", petal);
  const icon = type === "blossom" ? "icon-blossom" : "icon-sun";
  el.innerHTML = `<span class="bloom-face"><svg viewBox="0 0 64 64"><use href="#${icon}"></use></svg></span>`;
  return el;
}

function rainPetals() {
  const count = reduceMotion ? 0 : 8;
  for (let i = 0; i < count; i += 1) {
    const p = document.createElement("span");
    p.className = "petal";
    p.style.setProperty("--x", `${8 + Math.random() * 84}%`);
    p.style.setProperty("--dx", `${-80 + Math.random() * 160}px`);
    p.style.setProperty("--dur", `${8 + Math.random() * 6}s`);
    p.style.setProperty("--d", `${Math.random() * 5}s`);
    p.style.setProperty("--ps", `${10 + Math.random() * 10}px`);
    petalRain.appendChild(p);
  }
}

function decorateSky() {
  const root = document.getElementById("floaters");
  const total = 10;
  for (let i = 0; i < total; i += 1) {
    const el = document.createElement("span");
    const isSpark = i % 3 === 0;
    el.className = isSpark ? "floater is-spark" : "floater is-flower";
    el.style.setProperty("--x", `${Math.random() * 100}%`);
    el.style.setProperty("--dur", `${12 + Math.random() * 10}s`);
    el.style.setProperty("--d", `${-Math.random() * 12}s`);
    el.style.setProperty("--dx", `${-70 + Math.random() * 140}px`);
    el.style.setProperty("--s", `${16 + Math.random() * 22}px`);
    root.appendChild(el);
  }
}

decorateSky();

function startMusic() {
  wantMusic = true;
  muteBtn.hidden = false;
  playSong();
}

function playSong() {
  if (!ytPlayer || typeof ytPlayer.playVideo !== "function") return;
  ytPlayer.unMute();
  ytPlayer.playVideo();
  fadeInVolume();

  window.setTimeout(() => {
    if (wantMusic && ytPlayer.getPlayerState() !== YT.PlayerState.PLAYING) {
      ytPlayer.playVideo();
    }
  }, 1200);
}

function fadeInVolume() {
  window.clearInterval(volumeFade);
  let level = 0;
  ytPlayer.setVolume(level);
  volumeFade = window.setInterval(() => {
    level += 10;
    ytPlayer.setVolume(Math.min(level, 80));
    if (level >= 80) window.clearInterval(volumeFade);
  }, 70);
}
