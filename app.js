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
      onReady() {
        if (wantMusic) playSong();
      },
      onStateChange(event) {
        if (event.data === YT.PlayerState.ENDED) playSong();
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
    const dist = Math.hypot(x - 50, y - 46);
    return { el, wait: dist * 32 + Math.random() * 220 };
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
  const spots = [
    ...branchSpots(),
    ...heartPoints(),
  ];

  return spots.map((p) => {
    const size = 22 + Math.random() * 14 + (p.edge ? 5 : 0);
    const type = Math.random() < 0.22 ? "blossom" : "sun";
    return makeBloom({
      x: p.x,
      y: p.y,
      size,
      type,
      rot: Math.random() * 360,
    });
  });
}

function branchSpots() {
  const lines = [
    [
      [50, 48],
      [42, 42],
      [34, 36],
      [26, 40],
      [20, 30],
      [14, 34],
    ],
    [
      [50, 47],
      [58, 40],
      [66, 34],
      [74, 38],
      [80, 26],
      [86, 22],
    ],
    [
      [48, 40],
      [40, 28],
      [34, 18],
      [28, 22],
    ],
    [
      [52, 38],
      [60, 24],
      [68, 16],
      [76, 14],
    ],
    [
      [50, 36],
      [50, 22],
      [46, 12],
    ],
  ];

  const spots = [];
  lines.forEach((line) => {
    for (let i = 0; i < line.length - 1; i += 1) {
      const [x1, y1] = line[i];
      const [x2, y2] = line[i + 1];
      const steps = 3 + Math.floor(Math.random() * 2);
      for (let s = 0; s <= steps; s += 1) {
        const t = s / steps;
        spots.push({
          x: x1 + (x2 - x1) * t + (Math.random() - 0.5) * 3.2,
          y: y1 + (y2 - y1) * t + (Math.random() - 0.5) * 2.8,
          edge: false,
        });
      }
    }
  });
  return spots;
}

function heartPoints() {
  const outline = [];
  const steps = 56;
  for (let i = 0; i < steps; i += 1) {
    const t = (i / steps) * Math.PI * 2;
    const p = heartXY(t);
    outline.push({
      x: 50 + p.x * 2.38 + (Math.random() - 0.5) * 0.9,
      y: 27 + p.y * 1.82 + (Math.random() - 0.5) * 0.8,
    });
  }

  const points = outline
    .filter(() => Math.random() > 0.12)
    .map((p) => ({ x: p.x, y: p.y, edge: true }));

  let tries = 0;
  while (points.length < 108 && tries < 1400) {
    tries += 1;
    const x = 14 + Math.random() * 72;
    const y = 7 + Math.random() * 44;
    if (!pointInPolygon(x, y, outline)) continue;
    points.push({ x, y, edge: false });
  }

  return points;
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

function makeBloom({ x, y, size, type, rot = Math.random() * 50 }) {
  const el = document.createElement("button");
  el.type = "button";
  el.className = "bloom";
  el.dataset.type = type;
  el.setAttribute("aria-label", "Flor");
  el.style.setProperty("--size", `${size}px`);
  el.style.setProperty("--rot", `${rot}deg`);
  el.style.setProperty("--x", `${x}%`);
  el.style.setProperty("--y", `${y}%`);
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
  ytPlayer.setVolume(80);
  ytPlayer.playVideo();
}
