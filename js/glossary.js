(function () {
  const isEnglish = document.documentElement.lang.toLowerCase().startsWith("en");
  const entries = [
    { key:"inversion", en:["inversion"], zh:["内翻"], title:["Inversion","内翻"], desc:["The sole turns inward toward the other foot. The big-toe edge lifts and pressure shifts toward the little-toe edge.","脚底朝身体内侧转：大脚趾一侧抬起，压力移向小脚趾外侧缘。"], cue:["↑ Big-toe edge · ↓ Little-toe edge","↑ 大脚趾侧 · ↓ 小脚趾侧"], image:"assets/reference/movement-inversion.png" },
    { key:"eversion", en:["eversion"], zh:["外翻"], title:["Eversion","外翻"], desc:["The sole turns outward away from the other foot. The little-toe edge lifts and pressure shifts toward the big-toe edge.","脚底朝身体外侧转：小脚趾一侧抬起，压力移向大脚趾内侧缘。"], cue:["↑ Little-toe edge · ↓ Big-toe edge","↑ 小脚趾侧 · ↓ 大脚趾侧"], image:"assets/reference/movement-eversion.png" },
    { key:"dorsiflexion", en:["dorsiflexion"], zh:["背屈"], title:["Dorsiflexion","背屈"], desc:["The whole foot moves upward toward the shin at the ankle. This is ankle motion, not merely curling or lifting the toes.","整个脚在踝关节处向小腿方向抬起；不是只把脚趾翘起来。"], cue:["↑ Whole foot toward the shin","↑ 整只脚向小腿方向抬起"], image:"assets/reference/movement-dorsiflexion.png" },
    { key:"plantarflexion", en:["plantarflexion"], zh:["跖屈"], title:["Plantarflexion","跖屈"], desc:["The foot points downward, like pressing a gas pedal or rising onto the toes.","脚尖向下压，类似踩油门或踮脚。"], visual:"down" },
    { key:"medial", en:["medial"], zh:["内侧"], title:["Medial","内侧"], desc:["The side closer to the body's midline. At the ankle, this is the big-toe side.","靠近身体中线的一侧；在脚踝处就是大脚趾这一侧。"], visual:"medial" },
    { key:"lateral", en:["lateral"], zh:["外侧"], title:["Lateral","外侧"], desc:["The side farther from the body's midline. At the ankle, this is the little-toe side.","远离身体中线的一侧；在脚踝处就是小脚趾这一侧。"], visual:"lateral" },
    { key:"malleolus", en:["malleolus","malleoli"], zh:["踝骨","踝尖"], title:["Malleolus","踝骨 / 踝尖"], desc:["One of the two bony ankle bumps. The medial malleolus is inside; the lateral malleolus is outside.","脚踝两侧可摸到的骨性突起；内踝在内侧，外踝在外侧。"], visual:"ankle" },
    { key:"navicular", en:["navicular"], zh:["舟骨"], title:["Navicular","舟骨"], desc:["A bone on the inner midfoot, just above the arch. Its prominence can be felt in front of the medial ankle.","位于足弓上方的内侧中足骨，通常可在内踝前下方摸到突起。"], visual:"midfoot" },
    { key:"metatarsal", en:["metatarsal","metatarsals"], zh:["跖骨"], title:["Metatarsal","跖骨"], desc:["One of the five long bones between the midfoot and toes.","连接中足与脚趾的五根长骨。"], visual:"forefoot" },
    { key:"mtp", en:["MTP","metatarsophalangeal"], zh:["跖趾关节"], title:["MTP joint","跖趾关节"], desc:["The joint where a toe meets its metatarsal. The first MTP joint is the big-toe joint.","脚趾与跖骨相接的关节；第一跖趾关节就是大脚趾根部关节。"], visual:"toe" },
    { key:"syndesmosis", en:["syndesmosis","syndesmotic"], zh:["下胫腓联合"], title:["Syndesmosis","下胫腓联合"], desc:["Strong ligaments joining the tibia and fibula just above the ankle. Injury here is often called a high ankle sprain.","连接踝关节上方胫骨与腓骨的韧带结构；这里受伤常被称为高位踝扭伤。"], visual:"above" },
    { key:"proprioception", en:["proprioception","proprioceptive"], zh:["本体感觉"], title:["Proprioception","本体感觉"], desc:["Your body's sense of joint position and movement. Balance training helps restore it after injury.","身体感知关节位置和运动的能力；受伤后常通过平衡训练恢复。"], visual:"balance" },
    { key:"isometric", en:["isometric","isometric contractions"], zh:["等长收缩"], title:["Isometric contraction","等长收缩"], desc:["The muscle produces tension without visibly moving the joint, such as pressing the foot into a wall and holding.","肌肉发力但关节基本不动，例如用脚抵住墙保持用力。"], visual:"hold" },
    { key:"eccentric", en:["eccentric"], zh:["离心"], title:["Eccentric exercise","离心训练"], desc:["The muscle stays active while slowly lengthening, such as lowering the heel under control from a heel raise.","肌肉在受力时缓慢拉长，例如提踵后控制脚跟慢慢下降。"], visual:"lower" }
  ];

  const byKey = Object.fromEntries(entries.map((entry) => [entry.key, entry]));
  const activeTerms = entries.flatMap((entry) => (isEnglish ? entry.en : entry.zh).map((term) => ({ term, key:entry.key })))
    .sort((a, b) => b.term.length - a.term.length);
  const escaped = activeTerms.map(({term}) => term.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"));
  const pattern = isEnglish ? new RegExp(`\\b(${escaped.join("|")})\\b`, "gi") : new RegExp(`(${escaped.join("|")})`, "g");

  function lookup(text) {
    const lower = text.toLowerCase();
    return activeTerms.find(({term}) => term.toLowerCase() === lower);
  }

  function visualSvg(kind) {
    const arrow = kind === "up" ? "M195 120 Q210 82 188 55" : kind === "down" ? "M190 62 Q218 92 202 132" : kind === "in" ? "M72 132 Q112 165 148 132" : kind === "out" ? "M148 132 Q108 165 72 132" : kind === "lower" ? "M205 58 L205 132" : "";
    const pointMap = { medial:[88,116], lateral:[168,116], ankle:[132,104], midfoot:[164,138], forefoot:[196,145], toe:[226,148], above:[132,67] };
    const point = pointMap[kind];
    if (["balance","hold"].includes(kind)) {
      return `<svg viewBox="0 0 280 190" role="img" aria-label="${kind === "balance" ? "Balance exercise illustration" : "Isometric hold illustration"}"><rect width="280" height="190" rx="12" fill="#f6f3ec"/><path d="M128 26v77M95 58h66M128 103l-30 60M128 103l34 60" stroke="#16213e" stroke-width="10" stroke-linecap="round"/><path d="M60 166h160" stroke="#1f6f5c" stroke-width="6" stroke-linecap="round"/>${kind === "balance" ? '<path d="M82 176q45-24 92 0" fill="none" stroke="#e8720b" stroke-width="6"/>' : '<path d="M178 83h55M224 68l15 15-15 15" fill="none" stroke="#e8720b" stroke-width="7" stroke-linecap="round" stroke-linejoin="round"/>'}</svg>`;
    }
    return `<svg viewBox="0 0 280 190" role="img" aria-label="Foot movement or anatomy illustration"><defs><marker id="glossaryArrow" markerWidth="8" markerHeight="8" refX="7" refY="4" orient="auto"><path d="M0,0 L8,4 L0,8 Z" fill="#e8720b"/></marker></defs><rect width="280" height="190" rx="12" fill="#f6f3ec"/><path d="M112 22h48v82c0 14 12 24 28 28l48 13c13 4 11 22-3 22H94c-18 0-27-20-14-33l29-29c2-2 3-5 3-9Z" fill="#e8c5a5" stroke="#16213e" stroke-width="4"/>${arrow ? `<path d="${arrow}" fill="none" stroke="#e8720b" stroke-width="8" stroke-linecap="round" marker-end="url(#glossaryArrow)"/>` : ""}${point ? `<circle cx="${point[0]}" cy="${point[1]}" r="14" fill="rgba(232,114,11,.78)" stroke="#fff" stroke-width="5"/>` : ""}</svg>`;
  }

  function closeGlossary() {
    document.querySelector(".glossary-backdrop")?.remove();
  }

  function openGlossary(key) {
    closeGlossary();
    const entry = byKey[key];
    if (!entry) return;
    const index = isEnglish ? 0 : 1;
    const backdrop = document.createElement("div");
    backdrop.className = "glossary-backdrop";
    const visual = entry.image
      ? `<img src="${entry.image}" alt="${entry.title[index]} ${isEnglish ? "start and finish movement comparison" : "起始位与终点位动作对照"}">`
      : visualSvg(entry.visual);
    backdrop.innerHTML = `<section class="glossary-modal" role="dialog" aria-modal="true" aria-labelledby="glossaryTitle"><button class="glossary-close" type="button" aria-label="${isEnglish ? "Close" : "关闭"}">×</button><h2 id="glossaryTitle">${entry.title[index]}</h2><p>${entry.desc[index]}</p><div class="glossary-visual">${visual}</div>${entry.cue ? `<div class="glossary-cue">${entry.cue[index]}</div>` : ""}<div class="glossary-hint">${isEnglish ? "Left: neutral start. Right: movement finish. Educational explanation only; stop if pain is sharp or severe." : "左侧为起始位，右侧为动作终点。仅用于帮助理解；若出现尖锐或剧烈疼痛，请立即停止。"}</div></section>`;
    backdrop.addEventListener("click", (event) => { if (event.target === backdrop || event.target.closest(".glossary-close")) closeGlossary(); });
    document.body.appendChild(backdrop);
    backdrop.querySelector(".glossary-close").focus();
  }

  window.applyGlossaryTerms = function (root) {
    if (!root || !activeTerms.length) return;
    const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
    const nodes = [];
    while (walker.nextNode()) {
      const node = walker.currentNode;
      if (node.parentElement && !node.parentElement.closest(".clinical-term, script, style, .glossary-backdrop") && pattern.test(node.nodeValue)) nodes.push(node);
      pattern.lastIndex = 0;
    }
    nodes.forEach((node) => {
      const fragment = document.createDocumentFragment();
      let last = 0;
      node.nodeValue.replace(pattern, (match, _group, offset) => {
        fragment.append(node.nodeValue.slice(last, offset));
        const found = lookup(match);
        const span = document.createElement("span");
        span.className = "clinical-term";
        span.tabIndex = 0;
        span.setAttribute("role", "button");
        span.setAttribute("aria-label", `${match}: ${isEnglish ? "open explanation" : "查看解释"}`);
        span.title = isEnglish ? "Click for a plain-language explanation" : "点击查看通俗解释";
        span.dataset.glossaryKey = found.key;
        span.textContent = match;
        fragment.append(span);
        last = offset + match.length;
        return match;
      });
      fragment.append(node.nodeValue.slice(last));
      node.replaceWith(fragment);
      pattern.lastIndex = 0;
    });
    root.querySelectorAll(".clinical-term").forEach((term) => {
      term.addEventListener("click", (event) => { event.preventDefault(); event.stopPropagation(); openGlossary(term.dataset.glossaryKey); });
      term.addEventListener("keydown", (event) => { if (event.key === "Enter" || event.key === " ") { event.preventDefault(); event.stopPropagation(); openGlossary(term.dataset.glossaryKey); } });
    });
  };
  document.addEventListener("keydown", (event) => { if (event.key === "Escape") closeGlossary(); });
})();
