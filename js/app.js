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
  _currentStep:null, _latestStep:null,
};

const appEl = document.getElementById("app");

function setQuarter(idx) {
  document.querySelectorAll(".q").forEach((el) => {
    const q = Number(el.dataset.q);
    el.classList.toggle("active", q === idx);
    el.classList.toggle("done", q < idx);
  });
}

function render(html, alreadyLocalized = false) {
  state._locationPicker?.dispose();
  state._locationPicker = null;
  appEl.innerHTML = `<div class="screen">${alreadyLocalized ? html : translateUi(html)}</div>`;
  renderDraftNavigation();
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
      persistDraft();
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
    <div class="card"><p>${uiText('Answer every question about the same injury and the same stage. Do not mix symptoms during injury with those after recovery. If answering about a previous injury, consistently use how it felt then. For movement tests, report known performance; do not recreate an old injury.','请整份问卷围绕同一次伤病、同一阶段的感受填写，不要混用受伤时和恢复后的情况。如果想了解以前的一次受伤，请全程按当时的感受填写。动作测试只填写已知表现，不要为了重现旧伤而勉强做动作。')}</p></div>
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
    persistDraft();
  };
  document.getElementById("privateStartBtn").onclick = () => { state.dataConsent = false; showRedFlagChecklist(); };
  start.onclick = () => { state.dataConsent = true; showRedFlagChecklist(); };
  document.getElementById("languageBtn").onclick = window.restartWithLanguageChoice;
}

// Safety flow: current context -> checklist -> clarification -> routing.
const renderSafety = html => render(html, true);
const triageText = item => PainmapTriage.text(item, window.HOOPFOOT_LANG);
const triageEscape = value => String(value ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
function triageSelect(q) {
  return `<fieldset style="border:0;padding:0;margin:20px 0"><legend style="font-weight:700;margin-bottom:12px">${triageText(q)}</legend><div class="opt-list">${q.options.map((o,i)=>`<button type="button" class="opt ${state.answers[q.field]===o.v?'selected':''}" data-triage="${q.field}" value="${o.v}" aria-pressed="${state.answers[q.field]===o.v}"><span class="num">${i+1}</span><span>${triageText(o)}</span></button>`).join('')}</div></fieldset>`;
}
function bindTriageChoices(onChange) {
  const buttons=document.querySelectorAll('[data-triage]');
  buttons.forEach(el=>el.onclick=()=>{
    state.answers[el.dataset.triage]=el.value;
    buttons.forEach(b=>{const active=state.answers[b.dataset.triage]===b.value;b.classList.toggle('selected',active);b.setAttribute('aria-pressed',String(active));});
    onChange(el);
  });
}
function showRedFlagChecklist() {
  setQuarter(0);
  const labels=[['unable_to_weight_bear','走路／负重有困难','Difficulty walking or bearing weight'],['deformity','足踝形状异常（包括原有足型问题）','Unusual foot/ankle shape'],['severe_rest_pain','剧烈静息痛','Severe pain at rest'],['night_pain','夜间痛醒','Pain waking you at night'],['neurological_symptoms','麻木／刺痛／感觉减退','Numbness, tingling or reduced sensation']];
  const extra=[['rf_circulation','脚明显发冷、发白／发青，或伤口大量出血','An unusually cold, pale/blue foot or heavy bleeding'],['rf_systemic','发热／寒战，同时伴足踝红、热、肿、痛','Fever/chills with a red, hot, swollen or painful foot/ankle']];
  renderSafety(`<p class="eyebrow">Q1 · ${uiText('Safety','安全排查')}</p><h1 class="title">${uiText('Which concerns apply?','有没有以下情况需要进一步确认？')}</h1><p class="subtitle">${uiText('Check all signs you know apply to this injury and stage. For the last two items, unchecked means no or unsure; uncertainty does not rule out a problem.','请勾选这次伤病、这一阶段明确出现的情况。最后两项未勾选表示“没有或不确定”；不确定不代表已排除问题。')}</p><div class="card">${labels.map(([id,zh,en])=>`<label style="display:block;padding:12px 0"><input type="checkbox" data-safety="${id}" ${state.answers[id]?'checked':''}> ${uiText(en,zh)}</label>`).join('')}${extra.map(([id,zh,en])=>`<label style="display:block;padding:12px 0"><input type="checkbox" data-safety-extra="${id}" ${state.answers[id]==='yes'?'checked':''}> ${uiText(en,zh)}</label>`).join('')}<label style="display:block;padding:12px 0;border-top:1px solid #ddd"><input type="checkbox" id="safetyNone" ${state.answers.rf_none?'checked':''}> ${uiText('None of the above / unsure','以上没有／不确定')}</label></div><div class="btn-row"><button class="btn btn-secondary" id="backBtn">${uiText('Back','返回')}</button><button class="btn btn-primary" id="nextBtn" disabled>${uiText('Continue','下一步')}</button></div>`);
  const ready=()=>document.getElementById('nextBtn').disabled=!(state.answers.rf_none||labels.some(([id])=>state.answers[id])||extra.some(([id])=>state.answers[id]==='yes'));
  const selected=()=>{state.answers.rf_none=false;document.getElementById('safetyNone').checked=false;ready();};
  document.querySelectorAll('[data-safety]').forEach(el=>el.onchange=()=>{state.answers[el.dataset.safety]=el.checked;selected();});
  document.querySelectorAll('[data-safety-extra]').forEach(el=>el.onchange=()=>{state.answers[el.dataset.safetyExtra]=el.checked?'yes':'no';selected();});
  document.getElementById('safetyNone').onchange=e=>{state.answers.rf_none=e.target.checked;if(e.target.checked){labels.forEach(([id])=>state.answers[id]=false);extra.forEach(([id])=>state.answers[id]='no');document.querySelectorAll('[data-safety], [data-safety-extra]').forEach(el=>el.checked=false);}ready();};
  ready();document.getElementById('backBtn').onclick=showWelcome;
  document.getElementById('nextBtn').onclick=()=>{extra.forEach(([id])=>{if(state.answers[id]!=='yes')state.answers[id]='no';});if(state.answers.rf_circulation==='yes')showEmergency();else showRedFlagVas();};
}
function showRedFlagVas() {
  setQuarter(0);
  renderSafety(`<p class="eyebrow">Q1 · ${uiText('Pain','疼痛程度')}</p><h1 class="title">${uiText('How painful is the current episode?','这次不适期间，疼痛最严重时有几分？')}</h1><p class="subtitle">${uiText('Rate pain during the injury stage you are describing, not after recovery.','请按这次填写的伤病阶段选择分数；不要用恢复后的感受代替受伤时的感受。')}</p><div class="card"><label for="vasSlider">${uiText('Pain score (0–10)','疼痛评分（0–10）')}</label><div class="vas-wrap"><div class="vas-value" id="vasValue" aria-live="polite">${state.answers.vas??'—'}</div><input id="vasSlider" type="range" min="0" max="10" step="1" value="${state.answers.vas??0}" aria-describedby="vasHelp"><div class="vas-scale">${Array.from({length:11},(_,i)=>`<span>${i}</span>`).join('')}</div></div><p id="vasHelp">${uiText('0 = no pain; 10 = unbearable. Tap or drag the slider to choose.','0＝完全不痛；10＝无法忍受。点击或拖动滑条选择分数。')}</p></div><div class="btn-row"><button class="btn btn-secondary" id="backBtn">${uiText('Back','返回')}</button><button class="btn btn-primary" id="nextBtn" ${state.answers.vas===undefined?'disabled':''}>${uiText('Continue','下一步')}</button></div>`);
  const el=document.getElementById('vasSlider');
  const updateVas=()=>{state.answers.vas=Number(el.value);document.getElementById('vasValue').textContent=el.value;document.getElementById('nextBtn').disabled=false;};
  el.oninput=updateVas;el.onchange=updateVas;el.onclick=updateVas;
  document.getElementById('backBtn').onclick=showRedFlagChecklist;document.getElementById('nextBtn').onclick=showSafetyFollowup;
}
function showSafetyFollowup() {
  const qs=PainmapTriage.active(state.answers).filter(q=>q.flag||q.highPain);
  if(!qs.length) return finishSafety();
  renderSafety(`<p class="eyebrow">Q1 · ${uiText('Clarify symptoms','进一步确认')}</p><h1 class="title">${uiText('Tell us more about the symptoms','进一步了解症状')}</h1><p class="subtitle">${uiText('Answer from what you have already noticed. Do not perform movement tests.','根据已经观察到的情况回答，不需要做任何动作测试。')}</p><div class="card">${qs.map(triageSelect).join('')}</div><div class="btn-row"><button class="btn btn-secondary" id="backBtn">${uiText('Back','返回')}</button><button class="btn btn-primary" id="nextBtn" disabled>${uiText('View guidance','查看下一步建议')}</button></div>`);
  const ready=()=>document.getElementById('nextBtn').disabled=qs.some(q=>!state.answers[q.field]);
  bindTriageChoices(el=>{if((el.dataset.triage==='rf_shape'&&el.value==='new')||(el.dataset.triage==='rf_neuro'&&['new','unsure'].includes(el.value))){showEmergency();return;}ready();});
  ready();document.getElementById('backBtn').onclick=showRedFlagVas;document.getElementById('nextBtn').onclick=finishSafety;
}
function finishSafety() {
  const result=PainmapTriage.evaluate(state.answers);state.answers.safety_triage=result;
  if(result.level!=='continue') return showEmergency();
  renderSafety(`<h1 class="title">${uiText('You can continue the questionnaire','可以继续了解症状')}</h1><div class="card"><p>${uiText('Your current answers do not trigger a referral in this safety check. This does not rule out a fracture or another serious condition. Seek medical care if pain worsens, you cannot bear weight, numbness or a change in shape/colour appears.','目前的答案未触发本次安全分流，但不能据此排除骨折或其他严重问题。如果疼痛加重、不能负重，或出现麻木、形状／颜色改变，请及时就医。')}</p><p>${uiText('Keep answering about the same injury and stage.','后续问卷请继续按同一次伤病、同一阶段回答。')}</p></div><div class="btn-row"><button class="btn btn-secondary" id="backBtn">${uiText('Review answers','返回核对')}</button><button class="btn btn-primary" id="nextBtn">${uiText('Continue the questionnaire','继续填写症状')}</button></div>`);
  document.getElementById('backBtn').onclick=showRedFlagChecklist;document.getElementById('nextBtn').onclick=showModeSelect;
}
function safetyExplanationHtml(result) {
  const a=state.answers,parts=[];
  const add=(zh,en)=>parts.push(`<p style="text-align:left;line-height:1.8">${uiText(en,zh)}</p>`);
  if(a.rf_circulation==='yes') add('你勾选了“脚明显发冷、发白／发青，或伤口大量出血”这一项。如果脚异常冰冷或颜色改变，需要排查足部供血是否受到影响；如果是伤口大量出血，则需要及时控制出血。这一题包含多种情况，系统不能判断你具体是哪一种，也无法隔着屏幕检查血液循环，因此不能继续用问卷判断伤病。','You selected the option for an unusually cold, pale/blue foot or heavy bleeding. Coldness or colour change can signal a blood-supply problem; heavy bleeding needs prompt control. Because this option covers several signs, we cannot tell which applies or examine circulation remotely. A questionnaire cannot safely assess this situation.');
  if(a.rf_circulation==='unsure') add('你表示不确定是否有脚发冷、颜色改变或大量出血。这里并不是认定你已经出现了这些问题，而是这项重要的安全信息尚不能确认，需要医务人员进一步检查。','You were unsure about coldness, colour change or heavy bleeding. This does not confirm a problem, but an important safety question remains unresolved and needs professional assessment.');
  if(a.rf_systemic&&a.rf_systemic!=='no') add(a.rf_systemic==='yes'?'你填写了发热／寒战，同时伴足踝红、热、肿、痛。这样的组合需要排查感染等问题，不能只按运动扭伤来处理，建议由医生检查后再决定下一步。':'你无法确认是否有发热／寒战伴足踝红、热、肿、痛。如果这些症状同时出现，需要排查感染；问卷无法完成这个判断，所以先暂停并请医务人员核实。',a.rf_systemic==='yes'?'You reported fever or chills with a red, hot, swollen or painful foot/ankle. This combination needs assessment for infection and should not simply be treated as a sports sprain.':'You were unsure about fever or chills with local redness, warmth, swelling or pain. This combination can require assessment for infection, so a professional should clarify it before screening continues.');
  if(a.deformity&&a.rf_shape!=='longstanding') add(a.rf_shape==='changing'?'你描述了足部形状逐渐改变或足弓继续塌陷。这需要当面检查足部结构和功能，单靠疼痛位置无法解释原因，因此先暂停筛查。':a.rf_shape==='new'?'你描述了受伤后新出现的明显变形或角度异常。这可能涉及骨折、脱位等需要及时处理的损伤；问卷无法确认骨骼和关节的位置，也不能判断周围组织是否受影响。':'你勾选了足踝形状异常，但还不能确认是否为新出现的变形。我们不能据此确诊骨折或脱位，也无法安全排除，所以需要先接受当面检查。',a.rf_shape==='changing'?'You reported a changing foot shape or collapsing arch. An in-person examination of structure and function is needed; pain location alone cannot explain it.':'You reported a new deformity or could not confirm whether it is new. Fracture or dislocation may need urgent treatment, and a questionnaire cannot check alignment or surrounding tissues.');
  if(a.neurological_symptoms) add(a.rf_neuro==='unsure'?'你勾选了麻木、刺痛或感觉减退，但具体情况尚不明确。这类感觉变化需要检查神经功能，必要时也要检查血液循环，不能靠问卷排除需要处理的问题。':'你填写了麻木、刺痛、感觉减退或无力。这类表现可能涉及神经受刺激或受压，需要医务人员检查感觉、力量及血液循环；即使只是短暂出现，也不能由这个筛查直接判断为没有问题。','You reported altered sensation or weakness, or were unsure of the details. These symptoms may involve nerve irritation or compression. A clinician needs to check sensation, strength and circulation; this screening cannot dismiss even a brief episode.');
  if(a.unable_to_weight_bear&&a.rf_weight!=='painful') add(a.rf_weight==='current'?'你填写了无法负重或不能独立走几步。这说明伤病已经明显影响使用这只脚，需要排查骨折或较重的软组织损伤。仅凭这一项不能确诊，但不适合继续做跳跃等功能测试。':'你勾选了负重困难，但不能确认能否独立走几步。负重能力是重要的安全信息；请不要为了回答而勉强走路，应先由医务人员评估。','You reported inability to bear weight or uncertainty about walking a few steps. This needs assessment for fracture or significant soft-tissue injury. It does not establish a diagnosis; do not force walking or attempt hopping tests to find out.');
  if(a.severe_rest_pain||Number(a.vas)>=8) add(Number(a.vas)>=8?'你把疼痛评为 '+Number(a.vas)+'／10 分，达到了本工具预设的高疼痛暂停标准。高分不等于已经发生骨折或严重损伤，但说明疼痛较强；问卷无法判断原因和是否需要检查，因此应先接受专业评估，不再继续动作测试。':'你填写了剧烈疼痛或疼痛加重。疼痛强度本身不能确定是哪一种伤病，但需要当面评估原因；继续用动作测试刺激疼痛并不能安全地完成判断。',Number(a.vas)>=8?'You rated pain '+Number(a.vas)+'/10, meeting this tool’s high-pain pause threshold. This is not proof of a fracture or serious injury. It means pain is substantial and its cause needs professional assessment before movement testing.':'You reported severe or worsening pain. Pain intensity alone cannot identify an injury, and further movement tests are not an appropriate way to investigate it without professional assessment.');
  if(a.night_pain) add('你填写了夜间会被疼痛叫醒。夜间痛并不自动代表某种严重疾病，但它影响休息，需要结合受伤经过、疼痛变化和当面检查判断原因，所以本工具先暂停自动筛查。','You reported pain waking you at night. This does not automatically mean a serious disease, but the cause needs assessment alongside the injury history and an examination. The tool therefore pauses automated screening.');
  return parts.join('');
}
function showEmergency() {
  const result=PainmapTriage.evaluate(state.answers);state.answers.safety_triage=result;
  const immediate=result.level==='immediate';
  renderSafety(`<div class="emergency"><h1>${immediate?uiText('Seek emergency care now','请立即就医'):uiText('Arrange prompt medical assessment','请尽快接受专业评估')}</h1><p style="text-align:left;line-height:1.8">${uiText('We have paused this screening because your answers include a sign that needs professional assessment first. This is a safety decision, not a diagnosis. Further questionnaire scoring or movement tests cannot safely rule out a problem.','这次筛查已暂停，因为你填写的症状中，有需要优先由医务人员评估的情况。这是安全分流，不是已经确诊了某种伤病；继续填写问卷或做动作测试，无法安全排除这些问题。')}</p>${safetyExplanationHtml(result)}<p>${immediate?uiText('Go to an emergency department now. Ask someone to accompany you; call your local emergency number if you cannot travel safely. Do not delay care to finish this form.','请立即前往急诊，请他人陪同；无法安全前往时联系当地急救服务。不要为了填完问卷延误就医。'):uiText('Contact a clinician or urgent-care service promptly to decide how soon you need assessment. If symptoms are severe or worsening, or you cannot bear weight, seek care today.','请尽快联系医生或急诊／急诊门诊，确认就诊安排。若症状剧烈、不断加重或不能负重，请当天就医。')}</p><p>${uiText('Stop sport. Do not try hopping, cutting, forced stretching or self-correction of a deformity. If under 18, tell a parent/guardian or team medical professional.','暂停运动，不做跳跃、变向、强行拉伸或自行掰正。未满18岁请告知家长／监护人或队医。')}</p><p>${uiText('You can end the questionnaire here and arrange care. The optional visit summary only records your answers; it does not continue diagnosis and must not delay care.','现在可以直接结束问卷，先安排就医。下方“整理就医摘要”只是可选的记录工具，不是继续诊断，也不需要为了完成它而推迟就医。')}</p></div><div class="btn-row"><button class="btn btn-secondary" id="backBtn">${uiText('Review answers','返回核对答案')}</button><button class="btn btn-primary" id="summaryBtn">${uiText('Prepare visit summary (optional)','整理就医摘要（可选）')}</button><button class="btn btn-secondary" id="finishBtn">${uiText('Finish here','直接完成')}</button></div>${dataSaveStatusHtml()}`);
  document.getElementById('backBtn').onclick=()=>{if(!state.submissionId)showRedFlagChecklist();};
  document.getElementById('summaryBtn').onclick=()=>showSafetySummary();
  document.getElementById('finishBtn').onclick=()=>completeSafetyRecord();
}
function showSafetySummary() {
  const summary=state.answers.safety_summary||{};
  renderSafety(`<h1 class="title">${uiText('Symptom summary','症状摘要')}</h1><p>${uiText('Optional. Do not delay medical care. Do not enter your name or contact details.','以下均为选填，不要因此延误就医。请勿填写姓名或联系方式。')}</p><div class="card">${[['location','哪里不舒服？','Where does it hurt?'],['onset','什么时候开始？发生了什么？','When did it start? What happened?'],['progress','目前症状及变化／此前诊断和处理','Current symptoms and changes / previous diagnosis and care']].map(([key,zh,en])=>`<label style="display:block;margin:12px 0">${uiText(en,zh)}<textarea data-summary="${key}" maxlength="500" rows="3" style="display:block;width:100%;box-sizing:border-box;font:inherit">${triageEscape(summary[key]||'')}</textarea></label>`).join('')}</div><div class="btn-row"><button class="btn btn-secondary" id="backBtn">${uiText('Back','返回')}</button><button class="btn btn-primary" id="finishBtn">${uiText('Generate summary','生成摘要')}</button></div>`);
  const capture=()=>{state.answers.safety_summary=Object.fromEntries([...document.querySelectorAll('[data-summary]')].map(el=>[el.dataset.summary,el.value.trim()]));};
  document.getElementById('backBtn').onclick=()=>{capture();showEmergency();};
  document.getElementById('finishBtn').onclick=()=>{capture();completeSafetyRecord();};
}
function completeSafetyRecord() {
  state.answers.safety_summary_only=false;
  const result=state.answers.safety_triage||PainmapTriage.evaluate(state.answers);
  renderSafety(`<h1 class="title">${result.level==='immediate'?uiText('Seek emergency care now','请立即就医'):uiText('Prompt medical assessment advised','请尽快接受专业评估')}</h1><div class="card"><p>${uiText('This is a record of your answers, not a diagnosis.','以下为你的自述记录，不是医学诊断。')}</p>${result.reasons.map(r=>`<p>• ${triageText(r)}</p>`).join('')}${PainmapTriage.active(state.answers).filter(q=>state.answers[q.field]).map(q=>`<p><strong>${triageText(q)}</strong><br>${triageText(q.options.find(o=>o.v===state.answers[q.field]))}</p>`).join('')}<p>${uiText('Pain score','疼痛评分')}：${state.answers.vas??uiText('Not answered','未填写')}/10</p>${Object.entries(state.answers.safety_summary||{}).map(([k,v])=>`<p><strong>${({location:uiText('Location','位置'),onset:uiText('Onset','发生经过'),progress:uiText('Symptoms / previous care','症状／此前诊疗')})[k]}</strong><br><span style="white-space:pre-wrap">${triageEscape(v)||'—'}</span></p>`).join('')}<p>${uiText('Stop sport and do not perform movement tests. Do not delay care to finish or print this summary. If symptoms worsen or the foot becomes cold, discoloured or numb, seek emergency care.','暂停运动，不做动作测试；不要为了完成或打印摘要延误就医。如症状加重，或脚发冷、变色、麻木，请立即就医。')}</p></div>${dataSaveStatusHtml()}<div class="btn-row"><button class="btn btn-secondary" id="printBtn">${uiText('Print / save PDF','打印／保存PDF')}</button><button class="btn btn-secondary" id="restartBtn">${uiText('Start a new screening','重新开始筛查')}</button></div>`);
  // Keep legacy outcome values accepted by the existing database; detailed routing is in answers.
  saveScreeningRecord('emergency_stop',null,{},[],true);
  document.getElementById('printBtn').onclick=()=>window.print();document.getElementById('restartBtn').onclick=restartScreening;
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
        <button class="opt ${state.mode==='acute'?'selected':''}" data-v="acute"><span class="num">1</span><span>有 — 能明确指出受伤的那一刻（急性）</span></button>
        <button class="opt ${state.mode==='chronic'?'selected':''}" data-v="chronic"><span class="num">2</span><span>没有 — 是训练后逐渐出现的疼痛（慢性 / 劳损）</span></button>
        <button class="opt ${state.mode==='unknown'?'selected':''}" data-v="unknown"><span class="num">3</span><span>不知道 / 不确定</span></button>
      </div>
    </div>
    <div class="btn-row"><button class="btn btn-secondary" id="backBtn">← 返回</button></div>
  `);
  document.getElementById("backBtn").onclick = showRedFlagVas;
  document.querySelectorAll(".opt").forEach((el) => {
    el.onclick = () => {
      if(state.mode && state.mode !== el.dataset.v) state._latestStep=null;
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
  if(state.answers[q.field]===undefined&&state._answerArchive?.[q.field]!==undefined)state.answers[q.field]=state._answerArchive[q.field];
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
          state._answerArchive ||= {};
          if(state.answers.swelling_timing!==undefined)state._answerArchive.swelling_timing=state.answers.swelling_timing;
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
  render(`
    <p class="eyebrow">Q3 · ${uiText("Pain location", "疼痛定位")}</p>
    <h1 class="title">${uiText("Select the most painful area", "点击疼痛最明显的区域")}</h1>
    <div id="painmap3d"></div>
    <div class="btn-row">
      <button class="btn btn-secondary" id="backBtn">${uiText("← Back", "← 返回")}</button>
      <button class="btn btn-primary" id="nextBtn" disabled>${uiText("Confirm location →", "确认位置 →")}</button>
    </div>
  `, true);
  const valid = () => PAIN_MAP_REGIONS[state.answers.primary_location]?.includes(state.answers.secondary_location);
  document.getElementById("nextBtn").disabled = !valid();
  state._locationPicker = window.PainmapLocation3D.mount(document.getElementById("painmap3d"), {
    answers: state.answers,
    language: window.HOOPFOOT_LANG,
    onChange(selection) {
      if (selection) Object.assign(state.answers, selection);
      else {
        delete state.answers.primary_location;
        delete state.answers.secondary_location;
      }
      document.getElementById("nextBtn").disabled = !valid();
    },
  });
  document.getElementById("backBtn").onclick = () => {
    if (state.mode !== "acute" && state.answers.pain_action === "静止休息") showStandingPainStep();
    else { state.qIndex = currentQuestionSet().length - 1; showQuestionnaireStep(); }
  };
  document.getElementById("nextBtn").onclick = () => {
    if (!valid()) return;
    // A restored location is also explicitly confirmed before proceeding.
    state.answers.foot_side ||= "right";
    state.answers.location_input ||= "3d";
    state.answers.location_model_version = window.PainmapLocation3D.version;
    showPainShape();
  };
}

// Kept for existing back-navigation callers; both location fields are now selected together.
function showPainMapSecondary() { showPainMapPrimary(); }

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
    document.getElementById("restartBtn").onclick = restartScreening;
    return;
  }

  const { scores, supporting, conditionSet, locationScores, otherScores, otherFieldCounts, evidenceEligibility } = result;
  const all = listAllScored(scores, conditionSet, locationScores, evidenceEligibility);
  const insufficient = listInsufficientEvidence(scores, conditionSet, locationScores, otherScores, otherFieldCounts, evidenceEligibility);

  if (all.length === 0) {
    const selectedLocation = [state.answers.primary_location, state.answers.secondary_location].filter(Boolean).join(" · ");
    const hasMainRegionCandidates = Object.keys(scores).length > 0;
    render(`
      <p class="eyebrow">Score breakdown</p>
      <h1 class="title">${uiText("No condition met the minimum evidence threshold", "没有伤病达到最低证据门槛")}</h1>
      <p class="subtitle">Selected location: ${selectedLocation}</p>
      <div class="card no-match-card">
        <p>${hasMainRegionCandidates
          ? uiText("One or more conditions matched the pain region, but none had enough supporting questionnaire evidence for the formal Top 3.", "一个或多个伤病与疼痛位置相符，但其他问卷证据不足，因此不进入正式Top 3。")
          : "No condition in the current library uses this broad pain region. The first location selection is a hard filter, so unrelated conditions were removed."}</p>
        ${hasMainRegionCandidates ? `<p>${uiText("Required: location score above 0, other-feature score at least 15/60, at least two different supporting fields, and total score at least 35/100.", "进入正式候选需要：位置分大于0、其他特征至少15/60、至少命中2个不同特征维度，并且总分至少35/100。")}</p>` : ""}
        <p>If the marker was inaccurate, choose the location again. If the location is accurate and symptoms persist, arrange a sports-medicine or foot-and-ankle assessment.</p>
      </div>
      ${renderInsufficientEvidence(insufficient)}
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
    <p class="subtitle">${uiText("The broad region is a hard filter. Formal candidates also require other-feature score ≥15/60, at least two supporting fields, and total score ≥35/100.", "主要区域是硬筛选。正式候选还必须满足：其他特征≥15/60、至少2个支持维度、总分≥35/100。")}</p>

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

    ${renderInsufficientEvidence(insufficient)}

    <div class="btn-row">
      <button class="btn btn-secondary" id="backBtn">← Back to functional tests</button>
      <button class="btn btn-primary" id="nextBtn">Next: special tests →</button>
    </div>
  `);

  document.getElementById("backBtn").onclick = () => { state.fIndex = FUNCTIONAL_TESTS.length - 1; showFunctionalStep(); };
  document.getElementById("nextBtn").onclick = showSpecialTestScreen;
}

function renderInsufficientEvidence(items) {
  if (!items.length) return "";
  return `
    <details class="location-exclusions evidence-insufficient">
      <summary>${uiText(`Location-compatible but below the evidence threshold (${items.length})`, `位置相符但证据不足（${items.length}）`)}</summary>
      <p>${uiText("These are not formal candidates and will not proceed to special tests.", "以下伤病不是正式候选，也不会进入特殊检查。")}</p>
      <ul class="factor-list">
        ${items.map((item) => `<li><strong>${uiText(item.nameEn, item.nameZh)}</strong> · ${uiText("location", "位置")} ${item.locationScore}/40 · ${uiText("other features", "其他特征")} ${item.otherScore}/60 · ${uiText("supporting fields", "支持维度")} ${item.otherFieldCount} · ${uiText("total", "总分")} ${item.score}/100</li>`).join("")}
      </ul>
    </details>`;
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
  const { scores, supporting, locationScores, otherScores, otherFieldCounts, evidenceEligibility } = computeBaseScores(conditionSet, state.answers, state.mode);

  let emergency = false;
  if (state.mode === "acute") {
    applyOverrides(scores, state.answers, overrides, supporting);
    emergency = PainmapTriage.evaluate(state.answers).level !== "continue";
  }

  const ranking = rankConditions(scores, conditionSet, 3, locationScores, evidenceEligibility);
  return { scores, supporting, locationScores, otherScores, otherFieldCounts, evidenceEligibility, emergency, conditionSet, ranking };
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
    document.getElementById("restartBtn").onclick = restartScreening;
    return;
  }

  state._base = base; // 缓存，供 showResults 使用
  const prelim = rankConditions(base.scores, base.conditionSet, 3, base.locationScores, base.evidenceEligibility);

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
  const ranking = rankConditions(scores, conditionSet, 3, base.locationScores, base.evidenceEligibility);

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
    document.getElementById("restartBtn").onclick = restartScreening;
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
  document.getElementById("restartBtn").onclick = restartScreening;
}

// ---------------------------------------------------------
// BOOT
// ---------------------------------------------------------
// Local draft and revision navigation. No draft is sent to the research database.
const DRAFT_KEY='painmap.screening.draft.v1';
const DRAFT_FIELDS=['answers','testResults','mode','qIndex','aIndex','yIndex','fIndex','dataConsent','sessionId','submissionId','_currentStep','_latestStep','_answerArchive'];
let draftEnabled=false,draftStorageFailed=false;
function persistDraft(){
  if(!draftEnabled)return;
  try{window.localStorage.setItem(DRAFT_KEY,JSON.stringify({version:1,savedAt:Date.now(),data:Object.fromEntries(DRAFT_FIELDS.map(k=>[k,state[k]]))}));draftStorageFailed=false;}
  catch(_){draftStorageFailed=true;}
}
function watchDraft(value){
  if(!value||typeof value!=='object')return value;
  return new Proxy(value,{get(o,k){return watchDraft(o[k]);},set(o,k,v){const changed=o[k]!==v;o[k]=v;if(changed){state._base=null;persistDraft();}return true;},deleteProperty(o,k){delete o[k];state._base=null;persistDraft();return true;}});
}
const STEP_DEFS={showWelcome:[0],showRedFlagChecklist:[10],showRedFlagVas:[20],showSafetyFollowup:[30],finishSafety:[40],showModeSelect:[50],showQuestionnaireStep:[60,'qIndex'],showStandingPainStep:[90],showPainMapPrimary:[100],showPainShape:[110],showPainDepth:[120],showAdditionalStep:[130,'aIndex'],showYesNoStep:[160,'yIndex'],showFunctionalStep:[190,'fIndex'],showScoreBreakdown:[220],showSpecialTestScreen:[230],showResults:[240],showEmergency:[-1],showSafetySummary:[-1],completeSafetyRecord:[-1]};
function enterStep(name){
  const [rank,index]=STEP_DEFS[name];
  state._currentStep={name,index:index?state[index]:null,rank:rank+(index?state[index]:0)};
  if(rank>=0&&(!state._latestStep||state._currentStep.rank>state._latestStep.rank))state._latestStep={...state._currentStep};
  persistDraft();
}
function goToStep(step){
  if(!step||!STEP_DEFS[step.name])return showRedFlagChecklist();
  if(step.rank>40){
    if(!state.answers.rf_none&&!['unable_to_weight_bear','deformity','severe_rest_pain','night_pain','neurological_symptoms'].some(k=>state.answers[k])&&state.answers.rf_circulation!=='yes'&&state.answers.rf_systemic!=='yes')return showRedFlagChecklist();
    if(state.answers.vas===undefined)return showRedFlagVas();
    if(PainmapTriage.active(state.answers).some(q=>(q.flag||q.highPain)&&!state.answers[q.field]))return showSafetyFollowup();
    if(PainmapTriage.evaluate(state.answers).level!=='continue')return showEmergency();
    if(step.rank>50&&!state.mode)return showModeSelect();
    // Changed branches may introduce a question that has never been answered.
    if(step.rank>=100){const missing=currentQuestionSet().findIndex(q=>state.answers[q.field]===undefined);if(missing>=0){state.qIndex=missing;return showQuestionnaireStep();}}
    if(step.rank>100&&!PAIN_MAP_REGIONS[state.answers.primary_location]?.includes(state.answers.secondary_location))return showPainMapPrimary();
    if(step.rank>110&&state.answers.pain_shape===undefined)return showPainShape();
    if(step.rank>120&&state.answers.pain_depth===undefined)return showPainDepth();
    if(step.rank>=160){const i=ADDITIONAL_QUESTIONS.findIndex(q=>!(q.skipIf&&q.skipIf(state.answers))&&state.answers[q.field]===undefined);if(i>=0){state.aIndex=i;return showAdditionalStep();}}
    if(step.rank>=190){const i=applicableYesNo().findIndex(q=>state.answers[q.field]===undefined);if(i>=0){state.yIndex=i;return showYesNoStep();}}
    if(step.rank>=220){const i=FUNCTIONAL_TESTS.findIndex(q=>state.answers[q.field]===undefined);if(i>=0){state.fIndex=i;return showFunctionalStep();}}
  }
  const index=STEP_DEFS[step.name][1];if(index)state[index]=Math.max(0,Number(step.index)||0);
  state._base=null;STEP_ACTIONS[step.name]();
}
function restartScreening(){try{window.localStorage.removeItem(DRAFT_KEY);}catch(_){}draftEnabled=false;location.reload();}
function renderDraftNavigation(){
  if(!appEl.insertAdjacentHTML)return;
  const current=state._currentStep,latest=state._latestStep;
  if(!current)return;
  const canReturn=latest&&latest.rank>current.rank&&current.rank>=0;
  const message=draftStorageFailed?uiText('This browser cannot save a draft. Keep this tab open.','此浏览器暂时无法保存草稿，请保持页面打开。'):uiText('Answers are saved on this device, separately from anonymous research submission.','答案自动保存在本设备，与匿名研究提交分开。');
  appEl.insertAdjacentHTML('beforeend',`<div class="screen" style="padding-top:0"><p style="font-size:13px;color:#687078">${message}</p>${current.name==='showWelcome'&&latest?.rank>0?`<button class="btn btn-secondary" id="clearDraftBtn">${uiText('Start a new screening','清空草稿，重新开始')}</button> `:''}${canReturn?`<button class="btn btn-secondary" id="resumeLatestBtn">${uiText('Return to where I left off →','回到上次填写位置 →')}</button>`:''}</div>`);
  if(document.getElementById('clearDraftBtn'))document.getElementById('clearDraftBtn').onclick=restartScreening;
  if(canReturn)document.getElementById('resumeLatestBtn').onclick=()=>goToStep({...state._latestStep});
}
const STEP_ACTIONS={};
function trackedStep(name,fn){const wrapped=function(...args){enterStep(name);const result=fn(...args);persistDraft();return result;};STEP_ACTIONS[name]=wrapped;return wrapped;}

showWelcome=trackedStep('showWelcome',showWelcome);
showRedFlagChecklist=trackedStep('showRedFlagChecklist',showRedFlagChecklist);
showRedFlagVas=trackedStep('showRedFlagVas',showRedFlagVas);
showSafetyFollowup=trackedStep('showSafetyFollowup',showSafetyFollowup);
finishSafety=trackedStep('finishSafety',finishSafety);
showModeSelect=trackedStep('showModeSelect',showModeSelect);
showQuestionnaireStep=trackedStep('showQuestionnaireStep',showQuestionnaireStep);
showStandingPainStep=trackedStep('showStandingPainStep',showStandingPainStep);
showPainMapPrimary=trackedStep('showPainMapPrimary',showPainMapPrimary);
showPainShape=trackedStep('showPainShape',showPainShape);
showPainDepth=trackedStep('showPainDepth',showPainDepth);
showAdditionalStep=trackedStep('showAdditionalStep',showAdditionalStep);
showYesNoStep=trackedStep('showYesNoStep',showYesNoStep);
showFunctionalStep=trackedStep('showFunctionalStep',showFunctionalStep);
showScoreBreakdown=trackedStep('showScoreBreakdown',showScoreBreakdown);
showSpecialTestScreen=trackedStep('showSpecialTestScreen',showSpecialTestScreen);
showResults=trackedStep('showResults',showResults);
showEmergency=trackedStep('showEmergency',showEmergency);
showSafetySummary=trackedStep('showSafetySummary',showSafetySummary);
completeSafetyRecord=trackedStep('completeSafetyRecord',completeSafetyRecord);
try{const saved=JSON.parse(window.localStorage.getItem(DRAFT_KEY)||'null');if(saved?.version===1&&saved.data&&typeof saved.data.answers==='object'){for(const key of DRAFT_FIELDS)if(saved.data[key]!==undefined)state[key]=saved.data[key];}}catch(_){}
state.answers=watchDraft({...state.answers,language:window.HOOPFOOT_LANG});state.testResults=watchDraft(state.testResults||{});
draftEnabled=true;
window.addEventListener?.('pagehide',persistDraft);
document.addEventListener?.('input',()=>{if(state._currentStep?.name==='showSafetySummary'){state.answers.safety_summary=Object.fromEntries([...document.querySelectorAll('[data-summary]')].map(el=>[el.dataset.summary,el.value]));}persistDraft();});
// Show the welcome page before restoring a saved session on a shared device.
showWelcome();

