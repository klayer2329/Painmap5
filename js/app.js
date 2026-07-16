// ============================================================
// 主应用控制器
// ============================================================

const state = {
  answers: { language: window.HOOPFOOT_LANG },
  mode: null,           // 'acute' | 'chronic' | 'unknown'
  qIndex: 0,             // 主问卷题号指针
  aIndex: 0,             // additional questions 指针
  yIndex: 0,             // yes/no questions 指针
  fIndex: 0,             // functional tests 指针
  painStep: "primary",   // primary -> secondary -> shape -> depth
  testResults: {},       // { [conditionKey]: { [testName]: 'positive'|'negative' } }
  _base: null,            // 缓存基础评分结果（进入特殊检查页时计算一次）
  dataConsent: false,
  sessionId: window.ScreeningDataStore?.uuid?.() || null,
  submissionId: null,
  _submissionPromise: null,
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
  window.applyGlossaryTerms?.(appEl);
  window.scrollTo({ top: 0, behavior: "smooth" });
}

function progressNote(text) {
  return `<p class="progress-note">${text}</p>`;
}

function dataSaveStatusHtml() {
  if (!state.dataConsent) return "";
  return `<div class="data-save-status" id="dataSaveStatus" role="status">${uiText("Preparing anonymous data record…", "正在准备匿名数据记录…")}</div>`;
}

function setDataSaveStatus(message, type = "") {
  const target = document.getElementById("dataSaveStatus");
  if (!target) return;
  target.textContent = message;
  target.className = `data-save-status ${type}`.trim();
}

function saveScreeningRecord(outcome, base = null, finalScores = {}, ranking = [], emergency = false) {
  if (!state.dataConsent || state.submissionId) return;
  if (state._submissionPromise) return;
  const store = window.ScreeningDataStore;
  if (!store?.isConfigured?.()) {
    setDataSaveStatus(uiText("Anonymous data storage is not connected yet.", "匿名数据存储尚未连接。"), "warning");
    return;
  }
  setDataSaveStatus(uiText("Saving this anonymous screening record…", "正在保存本次匿名筛查记录…"));
  state._submissionPromise = store.submitScreening({
    state,
    outcome,
    baseScores: base?.scores || {},
    finalScores,
    ranking: ranking.map((item, index) => ({
      rank: index + 1,
      key: item.key,
      nameEn: item.nameEn,
      nameZh: item.nameZh,
      score: item.score,
      scorePct: item.scorePct,
    })),
    emergency,
  }).then((result) => {
    if (result.status === "saved" || result.status === "already-saved") {
      setDataSaveStatus(uiText(`Anonymous screening saved · Record ${result.id.slice(0, 8)}`, `匿名筛查已保存 · 记录 ${result.id.slice(0, 8)}`), "success");
    } else if (result.status === "not-configured") {
      setDataSaveStatus(uiText("Anonymous data storage is not connected yet.", "匿名数据存储尚未连接。"), "warning");
    }
  }).catch((error) => {
    console.error("Unable to save anonymous screening", error);
    setDataSaveStatus(uiText("The screening report is complete, but the anonymous record could not be saved.", "筛查报告已经完成，但匿名记录未能保存。"), "error");
    state._submissionPromise = null;
  });
}

function beginNewDataSession() {
  state.sessionId = window.ScreeningDataStore?.uuid?.() || null;
  state.submissionId = null;
  state._submissionPromise = null;
}

function renderQuestionReference(field) {
  if (field !== "swelling_severity" && field !== "bruising") return "";
  const english = document.documentElement.lang.toLowerCase().startsWith("en");
  const labels = english ? ["None", "Mild", "Moderate", "Severe"] : ["没有", "轻度", "中度", "重度"];
  const image = field === "swelling_severity" ? "assets/reference/swelling-scale.png" : "assets/reference/bruising-scale.png";
  const alt = field === "swelling_severity"
    ? (english ? "Visual comparison from no ankle swelling to severe ankle swelling" : "从无肿胀到重度肿胀的图片对照")
    : (english ? "Visual comparison from no bruising to severe bruising" : "从无瘀青到重度瘀青的图片对照");
  const note = english
    ? "Use the image as a guide and compare with the uninjured side. Skin tone, lighting, and injury appearance vary; the image is not a diagnosis."
    : "请结合健侧进行比较。肤色、光线和实际伤情会影响外观；图片仅供分级参考，不构成诊断。";
  return `<div class="visual-reference"><img src="${image}" alt="${alt}"><div class="visual-reference-labels">${labels.map((label) => `<span>${label}</span>`).join("")}</div></div><p class="visual-reference-note">${note}</p>`;
}

// ---------------------------------------------------------
// 0. WELCOME
// ---------------------------------------------------------
function showWelcome() {
  setQuarter(0);
  render(`
    <p class="eyebrow">Basketball Foot &amp; Ankle Screening</p>
    <h1 class="title">Basketball Foot &amp; Ankle Injury Screening System</h1>
    <p class="subtitle">A preliminary risk-screening tool for basketball athletes ages 12–18 with foot or ankle pain, sprains, landing injuries, running or jumping pain, or gradual training-related symptoms.</p>
    <div class="card">
      <p style="margin:0 0 10px; font-weight:600;">What this tool can do</p>
      <ul style="margin:0 0 16px; padding-left:20px; color:var(--ink-soft); font-size:14.5px;">
        <li>Screen injury risk and rank possible conditions</li>
        <li>Guide simple functional screening tests</li>
        <li>Help identify when prompt medical assessment is appropriate</li>
      </ul>
      <p style="margin:0 0 10px; font-weight:600;">What this tool cannot do</p>
      <ul style="margin:0; padding-left:20px; color:var(--ink-soft); font-size:14.5px;">
        <li>Provide a formal medical diagnosis</li>
        <li>Replace an examination by a qualified clinician</li>
        <li>Replace imaging such as X-ray, MRI, or CT</li>
      </ul>
    </div>
    <div class="card consent-card">
      <p class="consent-title">Anonymous research data</p>
      <p class="consent-copy">With permission, this screening will anonymously save every answer, pain location, functional and special-test selection, calculated score, and final ranking. No name, email, phone number, or account is collected.</p>
      <label class="consent-control">
        <input type="checkbox" id="dataConsent" ${state.dataConsent ? "checked" : ""}>
        <span>I agree to anonymous storage of this screening and its results.</span>
      </label>
      <details class="consent-details"><summary>What is stored?</summary><p>Question choices, pain-map selections, test findings, scores, result ranking, anonymous browser ID, and completion time. You can continue without saving.</p></details>
    </div>
    <div class="btn-row">
      <button class="btn btn-secondary" id="privateStartBtn">Continue without saving</button>
      <button class="btn btn-primary" id="startBtn" ${state.dataConsent ? "" : "disabled"}>Start and save anonymously →</button>
      <button class="btn btn-secondary" id="languageBtn">${uiText("Change language", "更改语言")}</button>
    </div>
  `);
  const consent = document.getElementById("dataConsent");
  const start = document.getElementById("startBtn");
  consent.onchange = () => {
    state.dataConsent = consent.checked;
    start.disabled = !consent.checked;
  };
  document.getElementById("privateStartBtn").onclick = () => { state.dataConsent = false; showRedFlagChecklist(); };
  start.onclick = () => { state.dataConsent = true; showRedFlagChecklist(); };
  document.getElementById("languageBtn").onclick = window.restartWithLanguageChoice;
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
    if (v == 0) return uiText("0 = No pain", "0 = 完全不痛");
    if (v <= 3) return uiText("Mild pain", "轻微疼痛");
    if (v <= 6) return uiText("Moderate pain", "中等疼痛");
    if (v <= 9) return uiText("Severe pain", "严重疼痛");
    return uiText("10 = Unbearable pain", "10 = 无法忍受的疼痛");
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
    ${dataSaveStatusHtml()}
    <div class="btn-row">
      <button class="btn btn-secondary" id="restartBtn">重新开始筛查</button>
    </div>
  `);
  saveScreeningRecord("emergency_stop", null, {}, [], true);
  document.getElementById("restartBtn").onclick = () => location.reload();
}

// ---------------------------------------------------------
// 4. ACUTE vs CHRONIC
// ---------------------------------------------------------
function showModeSelect() {
  setQuarter(1);
  render(`
    <p class="eyebrow">Q2 · 病史问卷</p>
    <h1 class="title">是否有明确的一次受伤事件导致疼痛开始？</h1>
    <p class="subtitle">For example, an ankle roll, awkward landing, or landing on another player's foot where you can identify the exact moment symptoms began. If you are unsure, both acute and overuse conditions will remain eligible.</p>
    <div class="card">
      <div class="options">
        <button class="opt" data-v="acute"><span class="num">1</span><span>有 — 能明确指出受伤的那一刻（急性）</span></button>
        <button class="opt" data-v="chronic"><span class="num">2</span><span>没有 — 是训练后逐渐出现的疼痛（慢性 / 劳损）</span></button>
        <button class="opt" data-v="unknown"><span class="num">3</span><span>不知道 / 不确定</span></button>
      </div>
    </div>
    <div class="btn-row"><button class="btn btn-secondary" id="backBtn">← 返回</button></div>
  `);
  document.getElementById("backBtn").onclick = showRedFlagVas;
  document.querySelectorAll(".opt").forEach((el) => {
    el.onclick = () => {
      state.mode = el.dataset.v;
      state.answers.onset_event = el.dataset.v;
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
    if (state.mode !== "acute" && state.answers.pain_action === "静止休息" && state.answers.standing_pain === undefined) {
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
    <p class="eyebrow">${state.mode === "acute" ? "Acute questionnaire" : state.mode === "chronic" ? "Overuse questionnaire" : "Onset-uncertain questionnaire"}</p>
    <h1 class="title">${q.title}</h1>
    ${multi ? progressNote("Select all that apply") : ""}
    <div class="card">
      ${renderQuestionReference(q.field)}
      <div class="options" id="optList">
        ${q.options.map((o, i) => {
          const isSel = multi ? (Array.isArray(currentVal) && currentVal.includes(o.v)) : currentVal === o.v;
          return `<button class="opt ${isSel ? "selected" : ""}" data-option-index="${i}">
            <span class="num">${i + 1}</span>
            <span>${o.label}${o.desc ? `<span class="desc">${o.desc}</span>` : ""}</span>
          </button>`;
        }).join("")}
      </div>
    </div>
    <div class="btn-row">
      <button class="btn btn-secondary" id="backBtn">← Back</button>
      ${multi ? `<button class="btn btn-primary" id="nextBtn">Next →</button>` : ""}
    </div>
  `);

  document.getElementById("backBtn").onclick = onBack;

  if (multi) {
    if (!Array.isArray(state.answers[q.field])) state.answers[q.field] = [];
    document.querySelectorAll("#optList .opt").forEach((el) => {
      el.onclick = () => {
        const v = q.options[Number(el.dataset.optionIndex)].v;
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
        const selectedValue = q.options[Number(el.dataset.optionIndex)].v;
        state.answers[q.field] = selectedValue;
        if (q.field === "swelling_severity" && selectedValue === "无") {
          delete state.answers.swelling_timing;
        }
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
    if (state.mode !== "acute" && state.answers.pain_action === "静止休息") showStandingPainStep();
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
    <p class="eyebrow">Q4 · Basketball functional test</p>
    <h1 class="title">${t.title}</h1>
    ${t.note ? `<p class="subtitle" style="color:var(--red);">⚠ ${t.note}</p>` : `<p class="subtitle">Stop immediately if this causes severe pain.</p>`}
    <div class="card">
      <div class="options" id="optList">
        ${t.options.map((o, i) => `<button class="opt ${state.answers[t.field]===o.v?"selected":""}" data-option-index="${i}"><span class="num">${i+1}</span><span>${o.label}</span></button>`).join("")}
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
      state.answers[t.field] = t.options[Number(el.dataset.optionIndex)].v;
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
      ${dataSaveStatusHtml()}
      <div class="btn-row"><button class="btn btn-secondary" id="restartBtn">重新开始</button></div>
    `);
    saveScreeningRecord("emergency_stop", result, result.scores, [], true);
    document.getElementById("restartBtn").onclick = () => location.reload();
    return;
  }

  const { scores, supporting, conditionSet, locationScores } = result;
  const all = listAllScored(scores, conditionSet, locationScores);

  if (all.length === 0) {
    const selectedLocation = [state.answers.primary_location, state.answers.secondary_location].filter(Boolean).join(" · ");
    const hasMainRegionCandidates = Object.keys(scores).length > 0;
    render(`
      <p class="eyebrow">Score breakdown</p>
      <h1 class="title">No candidate earned a positive feature score</h1>
      <p class="subtitle">Selected location: ${selectedLocation}</p>
      <div class="card no-match-card">
        <p>${hasMainRegionCandidates
          ? "The broad pain region matched the library, but the exact location and the remaining questionnaire features did not add points to those candidates. The system will not invent an unrelated result."
          : "No condition in the current library uses this broad pain region. The first location selection is a hard filter, so unrelated conditions were removed."}</p>
        <p>If the marker was inaccurate, choose the location again. If the location is accurate and symptoms persist, arrange a sports-medicine or foot-and-ankle assessment.</p>
      </div>
      ${dataSaveStatusHtml()}
      <div class="btn-row">
        <button class="btn btn-secondary" id="backBtn">← Back to functional tests</button>
        <button class="btn btn-primary" id="locationBtn">Change pain location</button>
      </div>
    `);
    saveScreeningRecord("no_candidate", result, result.scores, [], false);
    document.getElementById("backBtn").onclick = () => { beginNewDataSession(); state.fIndex = FUNCTIONAL_TESTS.length - 1; showFunctionalStep(); };
    document.getElementById("locationBtn").onclick = () => { beginNewDataSession(); showPainMapPrimary(); };
    return;
  }

  render(`
    <p class="eyebrow">Score breakdown</p>
    <h1 class="title">Conditions with a positive score (${all.length})</h1>
    <p class="subtitle">The first, broad pain region is a hard filter. The second, exact location does not remove a condition; it determines the 40-point location component. Other questionnaire features contribute the remaining 60 points.</p>

    ${all.map((r, i) => `
      <div class="card breakdown-card">
        <div class="breakdown-head">
          <span class="breakdown-rank">#${i + 1}</span>
          <div>
            <div class="breakdown-name-zh">${r.nameZh}</div>
            <div class="breakdown-name-en">${r.nameEn}</div>
          </div>
          <span class="breakdown-score">${r.score} points</span>
        </div>
        <ul class="factor-list">
          ${(supporting[r.key] || []).map((f) => `
            <li>
              <span class="factor-desc">${translateFactorDesc(f.desc)}</span>
              <span class="factor-points ${sourceClass(f.source)}">${f.points >= 0 ? "+" : ""}${f.points}</span>
            </li>`).join("") || "<li>Combined scoring factors</li>"}
        </ul>
      </div>
    `).join("")}

    <div class="btn-row">
      <button class="btn btn-secondary" id="backBtn">← Back to functional tests</button>
      <button class="btn btn-primary" id="nextBtn">Next: special tests →</button>
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

function locationExcludedConditions(conditionSet) {
  return Object.entries(conditionSet)
    .filter(([, condition]) => !locationEligibilityMatches(state.answers, condition))
    .map(([, condition]) => uiText(condition.nameEn, condition.nameZh));
}

// ---------------------------------------------------------
// 11. RESULTS
// ---------------------------------------------------------
function computeResults() {
  const conditionSet = conditionSetForMode(state.mode);
  const overrides = state.mode === "acute" ? ACUTE_OVERRIDES : [];
  const { scores, supporting, locationScores } = computeBaseScores(conditionSet, state.answers, state.mode);

  let emergency = false;
  if (state.mode === "acute") {
    applyOverrides(scores, state.answers, overrides, supporting);
    emergency = overrides.some((o) => o.emergency && o.when(state.answers));
  }

  const ranking = rankConditions(scores, conditionSet, 3, locationScores);
  return { scores, supporting, locationScores, emergency, conditionSet, ranking };
}

function conditionSetForMode(mode) {
  if (mode === "acute") return ACUTE_CONDITIONS;
  if (mode === "chronic") return CHRONIC_CONDITIONS;

  // An uncertain onset must not be silently classified as overuse. Keep both
  // libraries eligible, merging the few shared diagnoses into one candidate.
  const combined = {};
  [ACUTE_CONDITIONS, CHRONIC_CONDITIONS].forEach((library) => {
    Object.entries(library).forEach(([key, condition]) => {
      if (!combined[key]) {
        combined[key] = { ...condition, rules: [...(condition.rules || [])] };
        return;
      }
      combined[key] = {
        ...combined[key],
        ...condition,
        rules: [...(combined[key].rules || []), ...(condition.rules || [])],
      };
    });
  });
  return combined;
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
      ${dataSaveStatusHtml()}
      <div class="btn-row"><button class="btn btn-secondary" id="restartBtn">重新开始</button></div>
    `);
    saveScreeningRecord("emergency_stop", base, base.scores, [], true);
    document.getElementById("restartBtn").onclick = () => location.reload();
    return;
  }

  state._base = base; // 缓存，供 showResults 使用
  const prelim = rankConditions(base.scores, base.conditionSet, 3, base.locationScores);

  if (prelim.length === 0) {
    // 没有明显阳性分数，跳过特殊检查直接出报告
    return showResults();
  }

  render(`
    <p class="eyebrow">Q4 · Special tests</p>
    <h1 class="title">Perform additional screening tests</h1>
    <p class="subtitle">If safe and practical, complete these tests with a clinician or qualified trainer. Record positive or negative findings to refine the ranking. You may leave every test untested.</p>

    <div class="card test-weight-note">
      <strong>How test findings affect the score</strong>
      <p>A positive finding makes a small adjustment (+10%); a negative finding makes a smaller adjustment (−5%). Scores remain capped at 100. These screens refine the ranking but cannot diagnose or rule out a condition.</p>
    </div>

    ${prelim.map((r) => {
      const tests = SPECIAL_TESTS[r.key] || SPECIAL_TEST_FALLBACK;
      if (!tests.length) return "";
      return `
      <div class="card">
        <p style="margin:0 0 4px; font-weight:700; font-size:16px;">${r.nameZh}</p>
        <p style="margin:0 0 14px; color:var(--ink-soft); font-size:13px;">Ranked candidate · base feature score ${r.score}/100</p>
        ${tests.map((t) => {
          const current = (state.testResults[r.key] || {})[t.name];
          const stepsHtml = Array.isArray(t.steps)
            ? t.steps.map((line) => `<li>${line}</li>`).join("")
            : "";
          return `
          <div class="test-result-row" data-key="${r.key}" data-test="${t.name.replace(/"/g, '&quot;')}">
            <div class="test-instructions">
              <span class="test-result-name">${t.name}${t.gold ? ' <span class="gold-badge">Reference test</span>' : ""}</span>
              <div class="test-block">
                <span class="test-block-label">How to perform</span>
                <ol class="test-steps">${stepsHtml}</ol>
              </div>
              <div class="test-block">
                <span class="test-block-label positive-label">Positive finding</span>
                <div class="test-positive">${t.positive}</div>
              </div>
              <div class="test-block">
                <span class="test-block-label negative-label">Negative finding</span>
                <div class="test-negative">${t.negative || "The familiar symptoms are not reproduced and there is no meaningful difference from the uninjured side."}</div>
              </div>
              ${t.note ? `<p class="test-note">${t.note}</p>` : ""}
            </div>
            <div class="test-result-btns">
              <button class="test-btn positive ${current === "positive" ? "active" : ""}" data-result="positive">Positive</button>
              <button class="test-btn negative ${current === "negative" ? "active" : ""}" data-result="negative">Negative</button>
              <button class="test-btn skip ${!current ? "active" : ""}" data-result="skip">Not tested</button>
            </div>
          </div>`;
        }).join("")}
      </div>`;
    }).join("")}

    <div class="btn-row">
      <button class="btn btn-secondary" id="backBtn">← Back</button>
      <button class="btn btn-primary" id="finalBtn">Generate final report →</button>
    </div>
  `);

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
    return { urgent: false, text: uiText("No strong high-risk pattern was identified. Monitor your symptoms and seek a sports-medicine or orthopedic assessment if pain persists beyond one week, worsens, or is accompanied by swelling or instability.", "目前没有发现明显的高风险模式。请继续观察；如果疼痛超过一周、逐渐加重，或伴随肿胀和不稳定，应接受运动医学或骨科评估。") };
  }
  if (top.scorePct >= 70 && /fracture|骨折|Lisfranc/i.test(top.key + top.category)) {
    return { urgent: true, text: uiText(`Your answers are consistent with ${top.nameEn}. Because a fracture or major structural injury is possible, seek prompt medical assessment and appropriate imaging. Avoid weight-bearing training until cleared.`, `你的答案与${top.nameZh}较为一致。由于可能存在骨折或严重结构损伤，请尽快接受医疗评估和适当影像检查；在获准前避免负重训练。`) };
  }
  if (top.scorePct >= 70) {
    return { urgent: false, text: uiText(`Your answers most closely match ${top.nameEn}. Reduce painful movements and training load, and arrange a sports-medicine or orthopedic assessment. The suggested tests below can support that clinical evaluation.`, `你的答案与${top.nameZh}最为接近。请减少引起疼痛的动作和训练负荷，并安排运动医学或骨科评估；下方建议检查可为临床评估提供参考。`) };
  }
  return { urgent: false, text: uiText("The pattern is not highly specific and may fit several conditions. Review the top possibilities with a clinician or qualified team medical professional before returning to full training.", "当前症状模式不够特异，可能符合多种伤病。在恢复完整训练前，请与医生或合格队医一起评估排名靠前的可能伤病。") };
}

function testAdjustmentNote(key) {
  const tests = state.testResults[key];
  if (!tests) return "";
  const results = Object.values(tests);
  const posCount = results.filter((r) => r === "positive").length;
  const negCount = results.filter((r) => r === "negative").length;
  if (!posCount && !negCount) return "";
  const parts = [];
  if (posCount) parts.push(uiText(`${posCount} positive finding${posCount > 1 ? "s" : ""} (+10% each)`, `${posCount}项阳性（每项+10%）`));
  if (negCount) parts.push(uiText(`${negCount} negative finding${negCount > 1 ? "s" : ""} (−5% each)`, `${negCount}项阴性（每项−5%）`));
  return `<p class="test-adjust-note">${uiText("Score adjusted using special-test findings", "已根据特殊检查结果调整分数")}：${parts.join(uiText(", ", "，"))}</p>`;
}

function showResults() {
  setQuarter(4);

  // 复用特殊检查页缓存的基础评分（避免重复计算，且保证与该页展示的分数一致）
  const base = state._base || computeResults();
  const { supporting, emergency, conditionSet } = base;
  const scores = { ...base.scores };

  // 应用特殊检查阳性 / 阴性调整：
  //   阳性 → score *= (1 + 0.1 × posWeight)
  //   阴性 → score *= (1 − 0.1 × negWeight)
  applyTestAdjustments(scores, state.testResults);
  const ranking = rankConditions(scores, conditionSet, 3, base.locationScores);

  if (emergency) {
    render(`
      <div class="emergency">
        <div class="icon">🚨</div>
        <h1>疑似脱位 / 严重结构损伤</h1>
        <p>建议立即前往医院急诊或运动医学专科就诊，本次筛查评分到此中止。</p>
      </div>
      ${dataSaveStatusHtml()}
      <div class="btn-row"><button class="btn btn-secondary" id="restartBtn">重新开始</button></div>
    `);
    saveScreeningRecord("emergency_stop", base, scores, [], true);
    document.getElementById("restartBtn").onclick = () => location.reload();
    return;
  }

  const rec = recommendationText(ranking);
  const excludedByLocation = locationExcludedConditions(conditionSet);
  const selectedLocation = [state.answers.primary_location, state.answers.secondary_location].filter(Boolean).join(" · ");

  render(`
    <p class="eyebrow">Screening report · Final Report</p>
    <h1 class="title">${uiText(`Ranked possibilities (Top ${ranking.length || 0})`, `候选伤病排序（前${ranking.length || 0}名）`)}</h1>
    <p class="subtitle">The score is an absolute questionnaire feature score: 40 points for the selected pain location and 60 points for other compatible features. It is not a probability or diagnosis.</p>
    <div class="screening-summary"><strong>Selected pain location</strong><span>${selectedLocation}</span></div>

    ${ranking.map((r, i) => `
      <div class="result-card ${i===0 ? "rank1":""}" data-rank="${i+1}">
        <div class="result-head">
          <span class="result-rank">TOP ${i+1}</span>
          <div>
            <div class="result-name-zh">${r.nameZh}</div>
            <div class="result-name-en">${r.nameEn}</div>
          </div>
        </div>
        <div class="match-bar-track"><div class="match-bar-fill" style="width:${r.scorePct}%"></div></div>
        <div class="match-pct">Feature score ${r.score}/100 · Ranked #${i + 1}</div>

        <div class="section-label">Supporting factors</div>
        <ul class="factor-list">
          ${(supporting[r.key] || []).slice(0, 8).map((f) => `<li>${translateFactorDesc(f.desc)} <span class="factor-points">(${f.points >= 0 ? "+" : ""}${f.points})</span></li>`).join("") || "<li>Combined scoring factors</li>"}
        </ul>

        <div class="section-label">Suggested clinical tests</div>
        <div>${(SPECIAL_TESTS[r.key] || SPECIAL_TEST_FALLBACK).map((t) => {
          const stepsText = Array.isArray(t.steps) ? t.steps.join(" → ") : "";
          const tip = (stepsText + (stepsText ? " → " : "") + uiText("Positive: ", "阳性表现：") + t.positive).replace(/"/g, "&quot;");
          return `<span class="test-chip" title="${tip}">${t.name}</span>`;
        }).join("") || "<span class='test-chip'>General clinical examination</span>"}</div>
        ${testAdjustmentNote(r.key)}

        <div class="rehab-box">
          <div class="section-label">Rehabilitation / training guidance</div>
          <p class="rehab-principle">When the joint is stable and movement has been medically cleared, pain-free muscle contractions can help reduce swelling.</p>
          <ul class="rehab-list">
            ${(REHAB[r.key] || REHAB_FALLBACK).map((line) => `<li>${line}</li>`).join("")}
          </ul>
        </div>
      </div>
    `).join("")}

    <details class="location-exclusions">
      <summary>Conditions excluded because the pain location did not match (${excludedByLocation.length})</summary>
      <p>${excludedByLocation.join(", ") || "None"}</p>
    </details>

    <div class="rec-box ${rec.urgent ? "urgent" : ""}">
      <strong>${rec.urgent ? "⚠ Seek prompt medical assessment" : "📋 Next steps"}</strong>
      <p style="margin:8px 0 0;">${rec.text}</p>
    </div>

    ${dataSaveStatusHtml()}

    <div class="btn-row">
      <button class="btn btn-secondary" id="restartBtn">Restart screening</button>
      <button class="btn btn-primary" id="printBtn">Print / save report</button>
    </div>
  `);

  saveScreeningRecord(ranking.length ? "completed" : "no_candidate", base, scores, ranking, false);

  document.getElementById("printBtn").onclick = () => window.print();
  document.getElementById("restartBtn").onclick = () => location.reload();
}

// ---------------------------------------------------------
// BOOT
// ---------------------------------------------------------
showWelcome();
