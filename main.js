// The sky, the theme switch and the current micro-season.

// --- Sky -------------------------------------------------------------------
// A woodblock "ichimonji bokashi" (a band of indigo that fades down from the
// top of the sheet), drawn with an 8x8 Bayer dither: a print made of pixels.

const BAYER = [
  [0, 32, 8, 40, 2, 34, 10, 42],
  [48, 16, 56, 24, 50, 18, 58, 26],
  [12, 44, 4, 36, 14, 46, 6, 38],
  [60, 28, 52, 20, 62, 30, 54, 22],
  [3, 35, 11, 43, 1, 33, 9, 41],
  [51, 19, 59, 27, 49, 17, 57, 25],
  [15, 47, 7, 39, 13, 45, 5, 37],
  [63, 31, 55, 23, 61, 29, 53, 21],
];

const CELL = 3; // CSS pixels per dither cell
const canvas = document.getElementById("sky");

function hex(name) {
  const v = getComputedStyle(document.documentElement).getPropertyValue(name).trim();
  return [1, 3, 5].map((i) => parseInt(v.slice(i, i + 2), 16));
}

const clamp = (v) => Math.min(1, Math.max(0, v));

function ridge(x, seed, height, rough) {
  return height
    + Math.sin(x * 2.1 + seed) * rough
    + Math.sin(x * 5.3 + seed * 2.7) * rough * 0.45
    + Math.sin(x * 11.9 + seed * 1.3) * rough * 0.16;
}

function drawSky() {
  const box = canvas.getBoundingClientRect();
  const w = Math.ceil(box.width / CELL);
  const h = Math.ceil(box.height / CELL);
  if (!w || !h) return;
  canvas.width = w;
  canvas.height = h;

  const ctx = canvas.getContext("2d");
  const img = ctx.createImageData(w, h);
  const paper = hex("--paper");
  const sky = hex("--sky-ink");
  const disc = hex("--disc-ink");
  const ridgeInk = hex("--ridge-ink");

  const tall = h > w * 1.5; // Tall on desktop, a short band on phones.
  const r = Math.min(w, h) * (tall ? 0.22 : 0.17);
  const cx = w * (tall ? 0.62 : 0.72);
  const cy = h * (tall ? 0.3 : 0.32);

  for (let y = 0; y < h; y++) {
    const v = y / h;
    for (let x = 0; x < w; x++) {
      const u = x / w;
      const t = (BAYER[y % 8][x % 8] + 0.5) / 64;
      let ink = paper;

      // Sky: dense at the top, gone by the middle, a faint rise at the horizon.
      const band = (1 - v / 0.62) ** 2;
      const glow = clamp((v - 0.5) / 0.3) * 0.16;
      if (t < clamp(band + glow)) ink = sky;

      // Sun or moon, sinking into mist on its lower edge.
      const d = Math.hypot(x - cx, y - cy);
      if (d < r) {
        const mist = clamp((cy + r - y) / (r * 0.7));
        if (t < mist) ink = disc;
      }

      // Two ridges. Each is solid at its crest and fades into mist below.
      const far = ridge(u, 1.7, 0.74, 0.035);
      const near = ridge(u, 4.2, 0.86, 0.03);
      if (v > far && t < clamp(0.42 - (v - far) * 3.2)) ink = ridgeInk;
      if (v > near && t < clamp(0.8 - (v - near) * 3.4)) ink = ridgeInk;

      const i = (y * w + x) * 4;
      img.data[i] = ink[0];
      img.data[i + 1] = ink[1];
      img.data[i + 2] = ink[2];
      img.data[i + 3] = 255;
    }
  }
  ctx.putImageData(img, 0, 0);
}

let resizeTimer;
window.addEventListener("resize", () => {
  clearTimeout(resizeTimer);
  resizeTimer = setTimeout(drawSky, 120);
});

// --- Theme -----------------------------------------------------------------

const root = document.documentElement;
const button = document.getElementById("theme");

function syncButton() {
  const dark = root.dataset.theme === "dark";
  // The glyph names the state a click takes you to: 夜 night, 昼 day.
  button.firstElementChild.textContent = dark ? "昼" : "夜";
  button.setAttribute("aria-label", dark ? "Switch to light mode" : "Switch to dark mode");
}

function setTheme(theme, save) {
  root.dataset.theme = theme;
  if (save) {
    try { localStorage.setItem("theme", theme); } catch {}
  }
  syncButton();
  drawSky();
}

button.hidden = false;
button.addEventListener("click", () => {
  setTheme(root.dataset.theme === "dark" ? "light" : "dark", true);
});

// Follow the system until the visitor chooses.
matchMedia("(prefers-color-scheme: dark)").addEventListener("change", (e) => {
  let saved = null;
  try { saved = localStorage.getItem("theme"); } catch {}
  if (!saved) setTheme(e.matches ? "dark" : "light", false);
});

// --- Micro-seasons ---------------------------------------------------------
// The 72 kō of the Japanese calendar, each about five days long. Dates are the
// usual modern ones and can be a day off in a given year. [month, day, ja, en]

const KO = [
  [1, 1, "雪下出麦", "Wheat sprouts under snow"],
  [1, 5, "芹乃栄", "Parsley flourishes"],
  [1, 10, "水泉動", "Springs thaw"],
  [1, 15, "雉始雊", "Pheasants start to call"],
  [1, 20, "款冬華", "Butterburs bud"],
  [1, 25, "水沢腹堅", "Ice thickens on streams"],
  [1, 30, "鶏始乳", "Hens start to lay"],
  [2, 4, "東風解凍", "East wind melts the ice"],
  [2, 9, "黄鶯睍睆", "Bush warblers start to sing"],
  [2, 14, "魚上氷", "Fish rise from the ice"],
  [2, 19, "土脉潤起", "Rain moistens the soil"],
  [2, 24, "霞始靆", "Mist starts to linger"],
  [3, 1, "草木萌動", "Grass sprouts, trees bud"],
  [3, 6, "蟄虫啓戸", "Hibernating insects surface"],
  [3, 11, "桃始笑", "First peach blossoms"],
  [3, 16, "菜虫化蝶", "Caterpillars become butterflies"],
  [3, 21, "雀始巣", "Sparrows start to nest"],
  [3, 26, "櫻始開", "First cherry blossoms"],
  [3, 31, "雷乃発声", "Distant thunder"],
  [4, 5, "玄鳥至", "Swallows return"],
  [4, 10, "鴻雁北", "Wild geese fly north"],
  [4, 15, "虹始見", "First rainbows"],
  [4, 20, "葭始生", "First reeds sprout"],
  [4, 25, "霜止出苗", "Last frost, rice seedlings grow"],
  [4, 30, "牡丹華", "Peonies bloom"],
  [5, 5, "蛙始鳴", "Frogs start to sing"],
  [5, 10, "蚯蚓出", "Worms surface"],
  [5, 15, "竹笋生", "Bamboo shoots sprout"],
  [5, 21, "蚕起食桑", "Silkworms feast on mulberry"],
  [5, 26, "紅花栄", "Safflowers bloom"],
  [5, 31, "麦秋至", "Wheat ripens"],
  [6, 6, "蟷螂生", "Praying mantises hatch"],
  [6, 11, "腐草為螢", "Rotten grass becomes fireflies"],
  [6, 16, "梅子黄", "Plums turn yellow"],
  [6, 21, "乃東枯", "Self-heal withers"],
  [6, 27, "菖蒲華", "Irises bloom"],
  [7, 2, "半夏生", "Crow-dipper sprouts"],
  [7, 7, "温風至", "Warm winds blow"],
  [7, 12, "蓮始開", "First lotus blossoms"],
  [7, 17, "鷹乃学習", "Hawks learn to fly"],
  [7, 23, "桐始結花", "Paulownia trees seed"],
  [7, 29, "土潤溽暑", "Earth is damp, air is humid"],
  [8, 3, "大雨時行", "Great rains sometimes fall"],
  [8, 8, "涼風至", "Cool winds rise"],
  [8, 13, "寒蝉鳴", "Evening cicadas sing"],
  [8, 18, "蒙霧升降", "Thick fog descends"],
  [8, 23, "綿柎開", "Cotton bolls open"],
  [8, 28, "天地始粛", "Heat starts to die down"],
  [9, 2, "禾乃登", "Rice ripens"],
  [9, 8, "草露白", "Dew glistens white on grass"],
  [9, 13, "鶺鴒鳴", "Wagtails sing"],
  [9, 18, "玄鳥去", "Swallows leave"],
  [9, 23, "雷乃収声", "Thunder ceases"],
  [9, 28, "蟄虫坏戸", "Insects hole up underground"],
  [10, 3, "水始涸", "Farmers drain the fields"],
  [10, 8, "鴻雁来", "Wild geese return"],
  [10, 13, "菊花開", "Chrysanthemums bloom"],
  [10, 18, "蟋蟀在戸", "Crickets chirp at the door"],
  [10, 23, "霜始降", "First frost"],
  [10, 28, "霎時施", "Light rains sometimes fall"],
  [11, 2, "楓蔦黄", "Maple and ivy turn yellow"],
  [11, 7, "山茶始開", "Camellias bloom"],
  [11, 12, "地始凍", "Land starts to freeze"],
  [11, 17, "金盞香", "Daffodils bloom"],
  [11, 22, "虹蔵不見", "Rainbows hide"],
  [11, 27, "朔風払葉", "North wind strips the leaves"],
  [12, 2, "橘始黄", "Tachibana citrus turns yellow"],
  [12, 7, "閉塞成冬", "Cold sets in, winter begins"],
  [12, 12, "熊蟄穴", "Bears start to hibernate"],
  [12, 17, "鱖魚群", "Salmon gather upstream"],
  [12, 22, "乃東生", "Self-heal sprouts"],
  [12, 27, "麋角解", "Deer shed their antlers"],
];

function currentKo(date) {
  const today = (date.getMonth() + 1) * 100 + date.getDate();
  // The list starts on 1 January, so the last start date not after today wins.
  return KO.findLast(([m, d]) => m * 100 + d <= today);
}

const [, , ja, en] = currentKo(new Date());
document.getElementById("season-ja").textContent = ja;
document.getElementById("season-en").textContent = en;
document.getElementById("season").hidden = false;

syncButton();
drawSky();
