// ============================================================
// 疼痛定位地图 — 简化示意图（非解剖级精确，用于引导选择区域）
// ============================================================

const PAIN_VIEW_TABS = [
  { id: "dorsal",    label: "背侧 / 内外侧视图", regions: ["大脚趾", "前方", "内侧", "外侧", "踝上方"] },
  { id: "posterior", label: "后方视图",          regions: ["后方"] },
  { id: "plantar",   label: "足底视图",          regions: ["足底"] },
];

function svgFootDorsal(selected) {
  const sel = (r) => (selected === r ? "foot-region selected" : "foot-region");
  return `
  <svg viewBox="0 0 280 420" xmlns="http://www.w3.org/2000/svg">
    <!-- 大致足外形轮廓（右脚，背侧视图，脚尖朝上） -->
    <path d="M110 10 C95 30 90 55 95 80 L60 90 C40 130 30 200 35 270 C38 320 50 370 75 400
             L205 400 C230 370 242 320 245 270 C250 200 240 130 220 90 L185 80
             C190 55 185 30 170 10 C150 -2 130 -2 110 10 Z"
          fill="none" stroke="#B9AF98" stroke-width="2"/>

    <!-- 大脚趾 -->
    <ellipse class="${sel("大脚趾")}" data-region="大脚趾" cx="118" cy="35" rx="26" ry="30"/>
    <text class="foot-label" x="118" y="39" text-anchor="middle">大脚趾</text>

    <!-- 其他脚趾（不可点） -->
    <ellipse cx="168" cy="30" rx="12" ry="16" fill="#EFE9DA" stroke="#B9AF98"/>
    <ellipse cx="196" cy="38" rx="11" ry="15" fill="#EFE9DA" stroke="#B9AF98"/>
    <ellipse cx="218" cy="52" rx="10" ry="14" fill="#EFE9DA" stroke="#B9AF98"/>
    <ellipse cx="234" cy="68" rx="9"  ry="13" fill="#EFE9DA" stroke="#B9AF98"/>

    <!-- 前方（足背/前足） -->
    <rect class="${sel("前方")}" data-region="前方" x="55" y="95" width="195" height="70" rx="14"/>
    <text class="foot-label" x="152" y="135" text-anchor="middle">前方</text>

    <!-- 内侧（左条） -->
    <rect class="${sel("内侧")}" data-region="内侧" x="35" y="175" width="85" height="195" rx="16"/>
    <text class="foot-label" x="77" y="275" text-anchor="middle">内侧</text>

    <!-- 外侧（右条） -->
    <rect class="${sel("外侧")}" data-region="外侧" x="165" y="175" width="85" height="195" rx="16"/>
    <text class="foot-label" x="207" y="275" text-anchor="middle">外侧</text>

    <!-- 踝上方 -->
    <rect class="${sel("踝上方")}" data-region="踝上方" x="80" y="378" width="130" height="34" rx="10"/>
    <text class="foot-label" x="145" y="399" text-anchor="middle">踝上方</text>
  </svg>`;
}

function svgFootPosterior(selected) {
  const sel = (r) => (selected === r ? "foot-region selected" : "foot-region");
  return `
  <svg viewBox="0 0 200 260" xmlns="http://www.w3.org/2000/svg">
    <path d="M60 10 C50 40 48 70 55 100 L48 160 C45 190 48 220 60 245 L140 245
             C152 220 155 190 152 160 L145 100 C152 70 150 40 140 10
             C120 -2 80 -2 60 10 Z" fill="none" stroke="#B9AF98" stroke-width="2"/>
    <rect class="${sel("后方")}" data-region="后方" x="55" y="60" width="90" height="170" rx="20"/>
    <text class="foot-label" x="100" y="100" text-anchor="middle">跟腱</text>
    <text class="foot-label" x="100" y="200" text-anchor="middle">后跟（后方）</text>
  </svg>`;
}

function svgFootPlantar(selected) {
  const sel = (r) => (selected === r ? "foot-region selected" : "foot-region");
  return `
  <svg viewBox="0 0 240 400" xmlns="http://www.w3.org/2000/svg">
    <path d="M100 10 C85 30 80 55 88 80 L60 100 C40 140 32 210 38 280 C42 330 55 375 80 395
             L165 395 C190 375 200 330 202 280 C208 210 200 140 180 100 L152 80
             C160 55 155 30 140 10 C127 0 113 0 100 10 Z" fill="none" stroke="#B9AF98" stroke-width="2"/>
    <rect class="${sel("足底")}" data-region="足底" x="45" y="20" width="150" height="365" rx="30"/>
    <text class="foot-label" x="120" y="55"  text-anchor="middle">前足</text>
    <text class="foot-label" x="120" y="150" text-anchor="middle">足弓 / 中足</text>
    <text class="foot-label" x="120" y="330" text-anchor="middle">后跟</text>
  </svg>`;
}

function renderPainMapSvg(viewId, selectedRegion) {
  if (viewId === "dorsal") return svgFootDorsal(selectedRegion);
  if (viewId === "posterior") return svgFootPosterior(selectedRegion);
  return svgFootPlantar(selectedRegion);
}

const LOCATION_CARDS = [
  { region: "大脚趾", image: "assets/foot/dorsal.png", marker: "great-toe", label: "大脚趾" },
  { region: "前方", image: "assets/foot/dorsal.png", marker: "front", label: "足背 / 前方" },
  { region: "内侧", image: "assets/foot/dorsal.png", marker: "medial", label: "足踝内侧" },
  { region: "外侧", image: "assets/foot/dorsal.png", marker: "lateral", label: "足踝外侧" },
  { region: "踝上方", image: "assets/foot/dorsal.png", marker: "above", label: "踝关节上方" },
  { region: "后方", image: "assets/foot/posterior.png", marker: "posterior", label: "跟腱 / 后跟" },
  { region: "足底", image: "assets/foot/plantar.png", marker: "plantar", label: "足底" },
];

function renderLocationCards(selectedRegion) {
  return LOCATION_CARDS.map((item, index) => `
    <button class="loc-card ${selectedRegion === item.region ? "selected" : ""}" data-region-index="${index}">
      <span class="loc-thumb">
        <img src="${item.image}" alt="${item.label}">
        <span class="region-marker ${item.marker}" aria-hidden="true"></span>
      </span>
      <span class="loc-label">${item.label}</span>
    </button>`).join("");
}

const DETAIL_CARD_CONFIG = {
  "外侧": { image: "assets/foot/dorsal.png", markers: { "前下": "lat-anterior", "中下": "lat-middle", "后下": "lat-posterior" } },
  "内侧": { image: "assets/foot/dorsal.png", markers: { "前下": "med-anterior", "中下": "med-middle", "后下": "med-posterior", "舟骨区": "navicular" } },
  "前方": { image: "assets/foot/dorsal.png", markers: { "踝前": "ankle-front", "中足": "dorsal-midfoot" } },
  "后方": { image: "assets/foot/posterior.png", markers: { "跟腱区": "achilles", "后跟": "heel" } },
  "足底": { image: "assets/foot/plantar.png", markers: { "前足": "forefoot", "中足": "midfoot", "足弓": "arch", "后跟内侧": "medial-heel" } },
  "踝上方": { image: "assets/foot/dorsal.png", markers: { "踝上": "above-ankle" } },
  "大脚趾": { image: "assets/foot/dorsal.png", markers: { "跖趾关节": "mtp", "第一跖骨区": "first-metatarsal" } },
};

function renderSecondaryLocationCards(primary, options, selectedLocation) {
  const config = DETAIL_CARD_CONFIG[primary] || { image: "assets/foot/dorsal.png", markers: {} };
  return options.map((location, index) => `
    <button class="loc-card detail-card ${selectedLocation === location ? "selected" : ""}" data-location-index="${index}">
      <span class="loc-thumb">
        <img src="${config.image}" alt="${primary} ${location}">
        <span class="region-marker ${config.markers[location] || "dorsal-midfoot"}" aria-hidden="true"></span>
      </span>
      <span class="loc-label">${location}</span>
    </button>`).join("");
}
