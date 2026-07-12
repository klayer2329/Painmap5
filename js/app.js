// ============================================================
// 主应用控制器
// ============================================================

const state = {
  answers: {},
  mode: null,           // 'acute' | 'chronic'
  qIndex: 0,             // 主问卷题号指针
  aIndex: 0,             // additional questions 指针
  yIndex: 0,             // yes/no questions 指针
  fIndex: 0,             // functional tests 指针
  painStep: "primary",   // primary -> secondary -> shape -> depth
  testResults: {},       // { [conditionKey]: { [testName]: 'positive'|'negative' } }
  testPosWeight: 3,       // 特殊检查阳性权重 0-10
  testNegWeight: 3,       // 特殊检查阴性权重 0-10
  _base: null,            // 缓存基础评分结果（进入特殊检查页时计算一次）
};

const appEl = document.getElementById("app");

function setQuarter(idx) {
  document.querySelectorAll(".q").forEach((el) => {
    const q = Number(el.dataset.q);
    el.classList.toggle("active", q === idx);
    el.classList.toggle("done", q < idx);
  });
}

function render(html) {
  appEl.innerHTML = `<div class="screen">${translateUi(html)}</div>`;
  window.scrollTo({ top: 0, behavior: "smooth" });
}

function progressNote(text) {
  return `<p class="progress-note">${text}</p>`;
}

// ---------------------------------------------------------
// 0. WELCOME
// ---------------------------------------------------------
function showWelcome() {
  setQuarter(0);
  render(`
    <p class="eyebrow">Basketball Foot &amp; Ankle Screening</p>
    <h1 class="title">篮球运动员足踝伤病智能筛查系统</h1>
    <p class="subtitle">适用于 12–18 岁篮球运动员：足部疼痛、踝关节疼痛、崴脚、落地受伤、跑跳疼痛、训练后逐渐疼痛等情况的初步风险筛查。</p>
    <div class="card">
      <p style="margin:0 0 10px; font-weight:600;">这个工具能做什么</p>
      <ul style="margin:0 0 16px; padding-left:20px; color:var(--ink-soft); font-size:14.5px;">
        <li>伤病风险筛查与可能伤病排序</li>
        <li>指导进一步自测（功能测试）</li>
        <li>帮助你判断是否需要尽快就医</li>
      </ul>
      <p style="margin:0 0 10px; font-weight:600;">这个工具不能做什么</p>
      <ul style="margin:0; padding-left:20px; color:var(--ink-soft); font-size:14.5px;">
        <li>不能提供正式医学诊断</li>
        <li>不能替代医生检查</li>
        <li>不能替代影像学检查（X光 / MRI / CT）</li>
      </ul>
    </div>
    <div class="btn-row">
      <button class="btn btn-primary" id="startBtn">开始筛查 →</button>
    </div>
  `);
  document.getElementById("startBtn").onclick = showRedFlagChecklist;
}

// ---------------------------------------------------------
// 1. RED FLAG — VAS
// ---------------------------------------------------------
function showRedFlagVas() {
  setQuarter(0);
  const current = state.answers.vas ?? 3;
  render(`
    <p class="eyebrow">Q1 · 红旗排查</p>
    <h1 class="title">先确认是否存在需要立即就医的情况</h1>
    <p class="subtitle">请滑动选择当前最严重时的疼痛程度</p>
    <div class="card">
      <div class="vas-wrap">
        <div class="vas-value" id="vasNum">${current}</div>
        <div class="vas-desc" id="vasDesc"></div>
        <input type="range" min="0" max="10" step="1" id="vasSlider" value="${current}">
        <div class="vas-scale"><span>0 完全不痛</span><span>10 无法忍受</span></div>
      </div>
    </div>
    <div class="btn-row">
      <button class="btn btn-secondary" id="backBtn">← 返回</button>
      <button class="btn btn-primary" id="nextBtn">下一步 →</button>
    </div>
  `);
  const descFor = (v) => {
    if (v == 0) return "0 = 完全不痛";
    if (v <= 3) return "轻微疼痛";
    if (v <= 6) return "中等疼痛";
    if (v <= 9) return "严重疼痛";
    return "10 = 无法忍受";
  };
  const numEl = document.getElementById("vasNum");
  const descEl = document.getElementById("vasDesc");
  descEl.textContent = descFor(current);
  document.getElementById("vasSlider").oninput = (e) => {
    numEl.textContent = e.target.value;
    descEl.textContent = descFor(Number(e.target.value));
  };
  document.getElementById("backBtn").onclick = showRedFlagChecklist;
  document.getElementById("nextBtn").onclick = () => {
    state.answers.vas = Number(document.getElementById("vasSlider").value);
    const vasHigh = state.answers.vas >= 8;
    const anyFlag = REDFLAG_OPTIONS.some((o) => state.answers[o.id]);
    if (vasHigh || anyFlag) showEmergency();
    else showModeSelect();
  };
}

// ---------------------------------------------------------
// 2. RED FLAG — checklist
// ---------------------------------------------------------
function showRedFlagChecklist() {
  setQuarter(0);
  const selected = new Set(
    REDFLAG_OPTIONS.filter((o) => state.answers[o.id]).map((o) => o.id)
  );
  render(`
    <p class="eyebrow">Q1 · 红旗排查</p>
    <h1 class="title">是否存在以下情况？</h1>
    <p class="subtitle">可多选，如果都没有，请选择"完全没有以上情况"</p>
    <div class="card">
      <div class="checklist" id="rfList">
        ${REDFLAG_OPTIONS.map((o) => `
          <div class="chk ${selected.has(o.id) ? "selected" : ""}" data-id="${o.id}">
            <span class="box">${selected.has(o.id) ? "✓" : ""}</span>
            <span>${o.label}</span>
          </div>`).join("")}
        <div class="chk" data-id="none" style="border-color:var(--teal); margin-top:4px;">
          <span class="box"></span><span>完全没有以上情况</span>
        </div>
      </div>
    </div>
    <div class="btn-row">
      <button class="btn btn-secondary" id="backBtn">← 返回</button>
      <button class="btn btn-primary" id="nextBtn">下一步 →</button>
    </div>
  `);
  document.querySelectorAll("#rfList .chk").forEach((el) => {
    el.onclick = () => {
      const id = el.dataset.id;
      if (id === "none") {
        REDFLAG_OPTIONS.forEach((o) => (state.answers[o.id] = false));
        showRedFlagChecklist();
        return;
      }
      state.answers[id] = !state.answers[id];
      showRedFlagChecklist();
    };
  });
  document.getElementById("backBtn").onclick = showWelcome;
  document.getElementById("nextBtn").onclick = showRedFlagVas;
}

// ---------------------------------------------------------
// 3. EMERGENCY (terminal)
// ---------------------------------------------------------
function showEmergency() {
  setQuarter(0);
  render(`
    <div class="emergency">
      <div class="icon">⚠️</div>
      <h1>发现高风险信号</h1>
      <p>根据你提供的信息（剧烈疼痛或负重/畸形/夜间痛/神经症状等），建议尽快前往医院或运动医学专科就诊，明确诊断并排除骨折、脱位或神经血管损伤等严重情况。</p>
      <p style="margin-top:14px; font-weight:600;">本次筛查到此结束。</p>
    </div>
    <div class="btn-row">
      <button class="btn btn-secondary" id="restartBtn">重新开始筛查</button>
    </div>
  `);
  document.getElementById("restartBtn").onclick = () => {
    Object.keys(state.answers).forEach((k) => delete state.answers[k]);
    state.mode = null; state.qIndex = 0; state.aIndex = 0; state.yIndex = 0; state.fIndex = 0; state.painStep = "primary";
    showWelcome();
  };
}

// ---------------------------------------------------------
// 4. ACUTE vs CHRONIC
// ---------------------------------------------------------
function showModeSelect() {
  setQuarter(1);
  render(`
    <p class="eyebrow">Q2 · 病史问卷</p>
    <h1 class="title">是否有明确的一次受伤事件导致疼痛开始？</h1>
    <p class="subtitle">例如崴脚、落地扭伤、被人踩到脚等，能明确指出"就是那一下"</p>
    <div class="card">
      <div class="options">
        <button class="opt" data-v="acute"><span class="num">1</span><span>有 — 能明确指出受伤的那一刻（急性）</span></button>
        <button class="opt" data-v="chronic"><span class="num">2</span><span>没有 — 是训练后逐渐出现的疼痛（慢性 / 劳损）</span></button>
      </div>
    </div>
    <div class="btn-row"><button class="btn btn-secondary" id="backBtn">← 返回</button></div>
  `);
  document.getElementById("backBtn").onclick = showRedFlagVas;
  document.querySelectorAll(".opt").forEach((el) => {
    el.onclick = () => {
      state.mode = el.dataset.v;
      state.qIndex = 0;
      showQuestionnaireStep();
    };
  });
}

// ---------------------------------------------------------
// 5. MAIN QUESTIONNAIRE (acute or chronic)
// ---------------------------------------------------------
function currentQuestionSet() {
  return state.mode === "acute" ? ACUTE_QUESTIONS : CHRONIC_QUESTIONS;
}

function showQuestionnaireStep() {
  setQuarter(1);
  const qs = currentQuestionSet();
  if (state.qIndex >= qs.length) {
    // chronic 追加：是否需要 standing_pain
    if (state.mode === "chronic" && state.answers.pain_action === "静止休息" && state.answers.standing_pain === undefined) {
      return showStandingPainStep();
    }
    return showPainMapPrimary();
  }
  const q = qs[state.qIndex];
  renderQuestion(q, () => {
    state.qIndex += 1;
    showQuestionnaireStep();
  }, () => {
    if (state.qIndex === 0) showModeSelect();
    else { state.qIndex -= 1; showQuestionnaireStep(); }
  });
}

function showStandingPainStep() {
  setQuarter(1);
  renderQuestion({
    field: "standing_pain",
    title: "站着不动会痛吗？",
    options: STANDING_PAIN_OPTIONS.map((o) => ({ v: o.v, label: o.label })),
  }, showPainMapPrimary, () => { state.qIndex -= 1; showQuestionnaireStep(); });
}

// generic single/multi select question renderer
function renderQuestion(q, onNext, onBack) {
  const label = q.field === "mechanism" ? "受伤机制" : q.title;
  const multi = !!q.multi;
  const currentVal = state.answers[q.field];

  render(`
    <p class="eyebrow">${state.mode === "acute" ? "急性问卷" : state.mode === "chronic" ? "慢性问卷" : "问卷"}</p>
    <h1 class="title">${q.title}</h1>
    ${multi ? progressNote("可多选") : ""}
    <div class="card">
      <div class="options" id="optList">
        ${q.options.map((o, i) => {
          const isSel = multi ? (Array.isArray(currentVal) && currentVal.includes(o.v)) : currentVal === o.v;
          return `<button class="opt ${isSel ? "selected" : ""}" data-v="${o.v}">
            <span class="num">${i + 1}</span>
            <span>${o.label}${o.desc ? `<span class="desc">${o.desc}</span>` : ""}</span>
          </button>`;
        }).join("")}
      </div>
    </div>
    <div class="btn-row">
      <button class="btn btn-secondary" id="backBtn">← 返回</button>
      ${multi ? `<button class="btn btn-primary" id="nextBtn">下一步 →</button>` : ""}
    </div>
  `);

  document.getElementById("backBtn").onclick = onBack;

  if (multi) {
    if (!Array.isArray(state.answers[q.field])) state.answers[q.field] = [];
    document.querySelectorAll("#optList .opt").forEach((el) => {
      el.onclick = () => {
        const v = el.dataset.v;
        const arr = state.answers[q.field];
        const exists = arr.includes(v);
        if (v === "无变化") {
          state.answers[q.field] = exists ? [] : ["无变化"];
        } else {
          state.answers[q.field] = exists ? arr.filter((x) => x !== v) : [...arr.filter((x) => x !== "无变化"), v];
        }
        renderQuestion(q, onNext, onBack);
      };
    });
    document.getElementById("nextBtn").onclick = onNext;
  } else {
    document.querySelectorAll("#optList .opt").forEach((el) => {
      el.onclick = () => {
        state.answers[q.field] = el.dataset.v;
        onNext();
      };
    });
  }
}

// ---------------------------------------------------------
// 6. PAIN MAP
// ---------------------------------------------------------
function showPainMapPrimary() {
  setQuarter(2);
  const selected = state.answers.primary_location;
  render(`
    <p class="eyebrow">Q3 · 疼痛定位</p>
    <h1 class="title">点击疼痛最明显的区域</h1>
    <p class="subtitle">请选择最接近疼痛位置的图片</p>
    <div class="card">
      <div class="loc-grid" id="locationGrid">${renderLocationCards(selected)}</div>
    </div>
    <div class="btn-row">
      <button class="btn btn-secondary" id="backBtn">← 返回</button>
      <button class="btn btn-primary" id="nextBtn" ${selected ? "" : "disabled"}>下一步 →</button>
    </div>
  `);

  document.querySelectorAll("#locationGrid .loc-card").forEach((el) => {
    el.onclick = () => {
      state.answers.primary_location = LOCATION_CARDS[Number(el.dataset.regionIndex)].region;
      state.answers.secondary_location = undefined;
      showPainMapPrimary();
    };
  });
  document.getElementById("backBtn").onclick = () => {
    if (state.mode === "chronic" && state.answers.pain_action === "静止休息") showStandingPainStep();
    else { state.qIndex = currentQuestionSet().length - 1; showQuestionnaireStep(); }
  };
  document.getElementById("nextBtn").onclick = () => {
    if (selected) showPainMapSecondary();
  };
}

function showPainMapSecondary() {
  setQuarter(2);
  const primary = state.answers.primary_location;
  const options = PAIN_MAP_REGIONS[primary] || [];
  const current = state.answers.secondary_location;
  render(`
    <p class="eyebrow">Q3 · 疼痛定位</p>
    <h1 class="title">具体是哪个位置？</h1>
    <p class="subtitle">大区域：${primary}</p>
    <div class="card">
      <div class="loc-grid detail-grid">${renderSecondaryLocationCards(primary, options, current)}</div>
    </div>
    <div class="btn-row"><button class="btn btn-secondary" id="backBtn">← 返回</button></div>
  `);
  document.getElementById("backBtn").onclick = showPainMapPrimary;
  document.querySelectorAll(".detail-card").forEach((el) => {
    el.onclick = () => { state.answers.secondary_location = options[Number(el.dataset.locationIndex)]; showPainShape(); };
  });
}

function showPainShape() {
  setQuarter(2);
  renderQuestion({ field: "pain_shape", title: "疼痛更像哪种？", options: PAIN_SHAPE_OPTIONS.map(o=>({v:o.v,label:o.label})) },
    showPainDepth, showPainMapSecondary);
}

function showPainDepth() {
  setQuarter(2);
  renderQuestion({ field: "pain_depth", title: "最痛的位置属于哪种？", options: PAIN_DEPTH_OPTIONS },
    () => { state.aIndex = 0; showAdditionalStep(); }, showPainShape);
}

// ---------------------------------------------------------
// 7. ADDITIONAL SYMPTOMS
// ---------------------------------------------------------
function showAdditionalStep() {
  setQuarter(2);
  while (state.aIndex < ADDITIONAL_QUESTIONS.length) {
    const q = ADDITIONAL_QUESTIONS[state.aIndex];
    if (q.skipIf && q.skipIf(state.answers)) { state.aIndex += 1; continue; }
    return renderQuestion(q, () => { state.aIndex += 1; showAdditionalStep(); }, () => {
      state.aIndex -= 1;
      if (state.aIndex < 0) return showPainDepth();
      // skip back over skipped ones
      while (state.aIndex >= 0 && ADDITIONAL_QUESTIONS[state.aIndex].skipIf && ADDITIONAL_QUESTIONS[state.aIndex].skipIf(state.answers)) state.aIndex -= 1;
      if (state.aIndex < 0) return showPainDepth();
      showAdditionalStep();
    });
  }
  state.yIndex = 0;
  showYesNoStep();
}

// ---------------------------------------------------------
// 8. YES/NO factor questions
// ---------------------------------------------------------
function applicableYesNo() {
  return YESNO_QUESTIONS.filter((q) => !q.onlyFor || q.onlyFor === state.mode);
}

function showYesNoStep() {
  setQuarter(2);
  const qs = applicableYesNo();
  if (state.yIndex >= qs.length) { state.fIndex = 0; return showFunctionalStep(); }
  const q = qs[state.yIndex];
  renderQuestion(q, () => { state.yIndex += 1; showYesNoStep(); }, () => {
    state.yIndex -= 1;
    if (state.yIndex < 0) { state.aIndex = ADDITIONAL_QUESTIONS.length - 1; return showAdditionalStep(); }
    showYesNoStep();
  });
}

// ---------------------------------------------------------
// 9. FUNCTIONAL TESTS
// ---------------------------------------------------------
function showFunctionalStep() {
  setQuarter(3);
  if (state.fIndex >= FUNCTIONAL_TESTS.length) return showScoreBreakdown();
  const t = FUNCTIONAL_TESTS[state.fIndex];
  render(`
    <p class="eyebrow">Q4 · 篮球功能测试</p>
    <h1 class="title">${t.title}</h1>
    ${t.note ? `<p class="subtitle" style="color:var(--red);">⚠ ${t.note}</p>` : `<p class="subtitle">如出现剧烈疼痛请立即停止</p>`}
    <div class="card">
      <div class="options" id="optList">
        ${t.options.map((o, i) => `<button class="opt ${state.answers[t.field]===o.v?"selected":""}" data-v="${o.v}"><span class="num">${i+1}</span><span>${o.label}</span></button>`).join("")}
      </div>
    </div>
    <div class="btn-row">
      <button class="btn btn-secondary" id="backBtn">← 返回</button>
    </div>
  `);
  document.getElementById("backBtn").onclick = () => {
    state.fIndex -= 1;
    if (state.fIndex < 0) { state.yIndex = applicableYesNo().length - 1; return showYesNoStep(); }
    showFunctionalStep();
  };
  document.querySelectorAll("#optList .opt").forEach((el) => {
    el.onclick = () => {
      state.answers[t.field] = el.dataset.v;
      state.fIndex += 1;
      showFunctionalStep();
    };
  });
}

// ---------------------------------------------------------
// 10.5 SCORE BREAKDOWN — 加分透明度页面
// 列出所有分数 > 0 的伤病，并说明每一分是因为哪道题的哪个选项加的
// ---------------------------------------------------------
function showScoreBreakdown() {
  setQuarter(3);
  const result = computeResults();
  state._base = result; // 缓存给后续特殊检查 / 结果页复用，避免重复计算 & 分数不一致

  if (result.emergency) {
    render(`
      <div class="emergency">
        <div class="icon">🚨</div>
        <h1>疑似脱位 / 严重结构损伤</h1>
        <p>建议立即前往医院急诊或运动医学专科就诊，本次筛查评分到此中止。</p>
      </div>
      <div class="btn-row"><button class="btn btn-secondary" id="restartBtn">重新开始</button></div>
    `);
    document.getElementById("restartBtn").onclick = () => location.reload();
    return;
  }

  const { scores, supporting, conditionSet } = result;
  const all = listAllScored(scores, conditionSet);

  render(`
    <p class="eyebrow">加分透明度</p>
    <h1 class="title">所有有分数的伤病（共 ${all.length} 项）</h1>
    <p class="subtitle">基础分固定由位置匹配 40% + 其他问卷特征 60% 组成；随后再叠加全局规则、紧急覆盖规则与特殊检查调整。</p>

    ${all.length === 0 ? `<div class="card"><p style="margin:0; color:var(--ink-soft);">目前没有任何伤病命中明显的加分特征。可以继续下一步的特殊检查，或返回修改答案。</p></div>` : ""}

    ${all.map((r, i) => `
      <div class="card breakdown-card">
        <div class="breakdown-head">
          <span class="breakdown-rank">#${i + 1}</span>
          <div>
            <div class="breakdown-name-zh">${r.nameZh}</div>
            <div class="breakdown-name-en">${r.nameEn}</div>
          </div>
          <span class="breakdown-score">${r.score} 分</span>
        </div>
        <ul class="factor-list">
          ${(supporting[r.key] || []).map((f) => `
            <li>
              <span class="factor-desc">${f.desc}</span>
              <span class="factor-points ${sourceClass(f.source)}">${f.points >= 0 ? "+" : ""}${f.points}</span>
            </li>`).join("") || "<li>综合评分因素</li>"}
        </ul>
      </div>
    `).join("")}

    <div class="btn-row">
      <button class="btn btn-secondary" id="backBtn">← 返回功能测试</button>
      <button class="btn btn-primary" id="nextBtn">下一步：特殊检查 →</button>
    </div>
  `);

  document.getElementById("backBtn").onclick = () => { state.fIndex = FUNCTIONAL_TESTS.length - 1; showFunctionalStep(); };
  document.getElementById("nextBtn").onclick = showSpecialTestScreen;
}

function sourceClass(source) {
  if (source === "override") return "factor-override";
  if (source === "location") return "factor-location";
  if (source === "other") return "factor-other";
  if (source === "global") return "factor-global";
  return "factor-base";
}

// ---------------------------------------------------------
// 11. RESULTS
// ---------------------------------------------------------
function computeResults() {
  const conditionSet = state.mode === "acute" ? ACUTE_CONDITIONS : CHRONIC_CONDITIONS;
  const overrides = state.mode === "acute" ? ACUTE_OVERRIDES : [];
  const { scores, supporting } = computeBaseScores(conditionSet, state.answers);

  applyGlobalRules(scores, supporting, state.mode, state.answers);

  let emergency = false;
  if (state.mode === "acute") {
    applyOverrides(scores, state.answers, overrides, supporting);
    emergency = overrides.some((o) => o.emergency && o.when(state.answers));
  }

  const ranking = rankConditions(scores, conditionSet, 3);
  return { scores, supporting, emergency, conditionSet, ranking };
}

// ---------------- 11. SPECIAL TESTS RE-SCORING ----------------
function showSpecialTestScreen() {
  setQuarter(4);
  const base = state._base || computeResults();

  if (base.emergency) {
    render(`
      <div class="emergency">
        <div class="icon">🚨</div>
        <h1>疑似脱位 / 严重结构损伤</h1>
        <p>建议立即前往医院急诊或运动医学专科就诊，本次筛查评分到此中止。</p>
      </div>
      <div class="btn-row"><button class="btn btn-secondary" id="restartBtn">重新开始</button></div>
    `);
    document.getElementById("restartBtn").onclick = () => location.reload();
    return;
  }

  state._base = base; // 缓存，供 showResults 使用
  const prelim = rankConditions(base.scores, base.conditionSet, 3);

  if (prelim.length === 0) {
    // 没有明显阳性分数，跳过特殊检查直接出报告
    return showResults();
  }

  render(`
    <p class="eyebrow">Q4 · 特殊检查</p>
    <h1 class="title">对可能伤病做进一步特殊检查</h1>
    <p class="subtitle">如果条件允许（自己测试或由队医 / 医生协助完成），记录以下检查的阳性 / 阴性结果，系统会据此微调排序。全部跳过也可以直接生成报告。</p>

    <div class="card">
      <p style="margin:0 0 6px; font-weight:600; font-size:14px;">阳性权重：<span id="posVal" style="color:var(--orange);">${state.testPosWeight}</span> / 10
        <span style="color:var(--ink-soft); font-weight:400;">— 阳性时分数 ×(1 + 0.1 × n)</span></p>
      <input type="range" min="0" max="10" step="1" id="posSlider" value="${state.testPosWeight}">
      <p style="margin:18px 0 6px; font-weight:600; font-size:14px;">阴性权重：<span id="negVal" style="color:var(--teal);">${state.testNegWeight}</span> / 10
        <span style="color:var(--ink-soft); font-weight:400;">— 阴性时分数 ×(1 − 0.1 × n)</span></p>
      <input type="range" min="0" max="10" step="1" id="negSlider" value="${state.testNegWeight}">
    </div>

    ${prelim.map((r) => {
      const tests = SPECIAL_TESTS[r.key] || SPECIAL_TEST_FALLBACK;
      if (!tests.length) return "";
      return `
      <div class="card">
        <p style="margin:0 0 4px; font-weight:700; font-size:16px;">${r.nameZh}</p>
        <p style="margin:0 0 14px; color:var(--ink-soft); font-size:13px;">当前分数 ${r.score}（初步匹配度 ${r.matchPct}%）</p>
        ${tests.map((t) => {
          const current = (state.testResults[r.key] || {})[t.name];
          const stepsHtml = Array.isArray(t.steps)
            ? t.steps.map((line) => `<li>${line}</li>`).join("")
            : "";
          return `
          <div class="test-result-row" data-key="${r.key}" data-test="${t.name.replace(/"/g, '&quot;')}">
            <div class="test-instructions">
              <span class="test-result-name">${t.name}${t.gold ? ' <span class="gold-badge">金标准</span>' : ""}</span>
              <div class="test-block">
                <span class="test-block-label">怎么做</span>
                <ol class="test-steps">${stepsHtml}</ol>
              </div>
              <div class="test-block">
                <span class="test-block-label positive-label">阳性表现（怎样算阳性）</span>
                <div class="test-positive">${t.positive}</div>
              </div>
              <div class="test-block">
                <span class="test-block-label negative-label">阴性表现（怎样算阴性）</span>
                <div class="test-negative">做完动作后没有出现上述阳性表现，与健侧对比无明显差异，即为阴性。</div>
              </div>
              ${t.note ? `<p class="test-note">${t.note}</p>` : ""}
            </div>
            <div class="test-result-btns">
              <button class="test-btn positive ${current === "positive" ? "active" : ""}" data-result="positive">阳性</button>
              <button class="test-btn negative ${current === "negative" ? "active" : ""}" data-result="negative">阴性</button>
              <button class="test-btn skip ${!current ? "active" : ""}" data-result="skip">未测试</button>
            </div>
          </div>`;
        }).join("")}
      </div>`;
    }).join("")}

    <div class="btn-row">
      <button class="btn btn-secondary" id="backBtn">← 返回</button>
      <button class="btn btn-primary" id="finalBtn">生成最终报告 →</button>
    </div>
  `);

  document.getElementById("posSlider").oninput = (e) => {
    state.testPosWeight = Number(e.target.value);
    document.getElementById("posVal").textContent = e.target.value;
  };
  document.getElementById("negSlider").oninput = (e) => {
    state.testNegWeight = Number(e.target.value);
    document.getElementById("negVal").textContent = e.target.value;
  };
  document.querySelectorAll(".test-result-row").forEach((row) => {
    const key = row.dataset.key;
    const test = row.dataset.test;
    row.querySelectorAll(".test-btn").forEach((btn) => {
      btn.onclick = () => {
        state.testResults[key] = state.testResults[key] || {};
        const result = btn.dataset.result;
        if (result === "skip") delete state.testResults[key][test];
        else state.testResults[key][test] = result;
        showSpecialTestScreen();
      };
    });
  });
  document.getElementById("backBtn").onclick = showScoreBreakdown;
  document.getElementById("finalBtn").onclick = showResults;
}

// ---------------------------------------------------------
// 12. RESULTS (final, after special-test adjustment)
// ---------------------------------------------------------
function recommendationText(ranking) {
  const top = ranking[0];
  if (!top) {
    return { urgent: false, text: "根据你提供的信息，暂未匹配到明显的高风险伤病特征。建议观察症状变化：如果疼痛持续超过一周、逐渐加重，或出现肿胀、不稳定感，建议前往运动医学科或骨科就诊评估。" };
  }
  if (top.matchPct >= 70 && /fracture|骨折|Lisfranc/i.test(top.key + top.category)) {
    return { urgent: true, text: `你的回答与「${top.nameZh}」的特征较为吻合，此类损伤存在骨折/严重结构损伤可能，建议尽快就医并完善影像学检查（X光 / CT），避免继续负重训练。` };
  }
  if (top.matchPct >= 70) {
    return { urgent: false, text: `你的回答与「${top.nameZh}」的特征最为吻合。建议先减少诱发疼痛的动作与训练量，并尽快到运动医学科或骨科做进一步检查确认。下方列出了相关的推荐特殊检查，可供医生参考。` };
  }
  return { urgent: false, text: "你的症状可能对应多种伤病，特征不算非常典型，建议结合下方前三项可能性，尽快由医生或队医做进一步检查确认，切勿自行按摩热敷加重损伤区域。" };
}

function testAdjustmentNote(key) {
  const tests = state.testResults[key];
  if (!tests) return "";
  const results = Object.values(tests);
  const posCount = results.filter((r) => r === "positive").length;
  const negCount = results.filter((r) => r === "negative").length;
  if (!posCount && !negCount) return "";
  const parts = [];
  if (posCount) parts.push(`${posCount} 项阳性 ×(1 + 0.1 × ${state.testPosWeight}) ^${posCount}`);
  if (negCount) parts.push(`${negCount} 项阴性 ×(1 − 0.1 × ${state.testNegWeight}) ^${negCount}`);
  return `<p class="test-adjust-note">已按特殊检查结果调整分数：${parts.join("，")}</p>`;
}

function showResults() {
  setQuarter(4);

  // 复用特殊检查页缓存的基础评分（避免重复计算，且保证与该页展示的分数一致）
  const base = state._base || computeResults();
  const { scores, supporting, emergency, conditionSet } = base;

  // 应用特殊检查阳性 / 阴性调整：
  //   阳性 → score *= (1 + 0.1 × posWeight)
  //   阴性 → score *= (1 − 0.1 × negWeight)
  applyTestAdjustments(scores, state.testResults, state.testPosWeight, state.testNegWeight);
  const ranking = rankConditions(scores, conditionSet, 3);

  if (emergency) {
    render(`
      <div class="emergency">
        <div class="icon">🚨</div>
        <h1>疑似脱位 / 严重结构损伤</h1>
        <p>建议立即前往医院急诊或运动医学专科就诊，本次筛查评分到此中止。</p>
      </div>
      <div class="btn-row"><button class="btn btn-secondary" id="restartBtn">重新开始</button></div>
    `);
    document.getElementById("restartBtn").onclick = () => location.reload();
    return;
  }

  const rec = recommendationText(ranking);

  render(`
    <p class="eyebrow">筛查报告 · Final Report</p>
    <h1 class="title">可能伤病排序（Top ${ranking.length || 0}）</h1>
    <p class="subtitle">评分越高，特征越吻合。这不是诊断结果，仅供参考与就医沟通使用。</p>

    ${ranking.map((r, i) => `
      <div class="result-card ${i===0 ? "rank1":""}" data-rank="${i+1}">
        <div class="result-head">
          <span class="result-rank">TOP ${i+1}</span>
          <div>
            <div class="result-name-zh">${r.nameZh}</div>
            <div class="result-name-en">${r.nameEn}</div>
          </div>
        </div>
        <div class="match-bar-track"><div class="match-bar-fill" style="width:${r.matchPct}%"></div></div>
        <div class="match-pct">匹配度 ${r.matchPct}% · 原始评分 ${r.score}</div>

        <div class="section-label">支持因素</div>
        <ul class="factor-list">
          ${(supporting[r.key] || []).slice(0, 8).map((f) => `<li>${f.desc} <span class="factor-points">(${f.points >= 0 ? "+" : ""}${f.points})</span></li>`).join("") || "<li>综合评分因素</li>"}
        </ul>

        <div class="section-label">建议特殊检查（供医生 / 队医参考）</div>
        <div>${(SPECIAL_TESTS[r.key] || SPECIAL_TEST_FALLBACK).map((t) => {
          const stepsText = Array.isArray(t.steps) ? t.steps.join(" → ") : "";
          const tip = (stepsText + (stepsText ? " → " : "") + "阳性：" + t.positive).replace(/"/g, "&quot;");
          return `<span class="test-chip" title="${tip}">${t.name}</span>`;
        }).join("") || "<span class='test-chip'>常规查体</span>"}</div>
        ${testAdjustmentNote(r.key)}

        <div class="rehab-box">
          <div class="section-label">康复 / 训练调整建议</div>
          <ul class="rehab-list">
            ${(REHAB[r.key] || REHAB_FALLBACK).map((line) => `<li>${line}</li>`).join("")}
          </ul>
        </div>
      </div>
    `).join("")}

    <div class="rec-box ${rec.urgent ? "urgent" : ""}">
      <strong>${rec.urgent ? "⚠ 建议尽快就医" : "📋 下一步建议"}</strong>
      <p style="margin:8px 0 0;">${rec.text}</p>
    </div>

    <div class="btn-row">
      <button class="btn btn-secondary" id="restartBtn">重新开始筛查</button>
      <button class="btn btn-primary" id="printBtn">打印 / 保存报告</button>
    </div>
  `);

  document.getElementById("printBtn").onclick = () => window.print();
  document.getElementById("restartBtn").onclick = () => location.reload();
}

// ---------------------------------------------------------
// BOOT
// ---------------------------------------------------------
showWelcome();
