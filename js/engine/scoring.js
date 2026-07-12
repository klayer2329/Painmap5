// ============================================================
// 评分引擎
// ============================================================

function matchField(answers, field, match) {
  const val = answers[field];
  if (val === undefined || val === null) return false;
  const matches = Array.isArray(match) ? match : [match];
  if (Array.isArray(val)) {
    // multi-select field
    return matches.some((m) => val.includes(m));
  }
  return matches.includes(val);
}

function ruleHits(answers, rule) {
  return rule.when.every((cond) => matchField(answers, cond.field, cond.match));
}

function fieldLabel(field) {
  const map = {
    mechanism: "受伤机制", contact: "接触方式", immediate_function: "即刻功能",
    injury_sensation: "受伤感觉", pain_action: "最痛动作", load_change: "训练负荷变化",
    standing_pain: "站立痛", primary_location: "疼痛区域", secondary_location: "具体位置",
    pain_shape: "疼痛形态", pain_depth: "疼痛深度", pain_pattern: "疼痛时相",
    activity_pattern: "活动后变化", specific_trigger: "诱发动作",
  };
  return map[field] || field;
}
function valueLabel(v) { return Array.isArray(v) ? v.join("/") : v; }

function ruleDesc(rule) {
  const parts = rule.when.map((c) => `${fieldLabel(c.field)} = ${valueLabel(c.match)}`);
  return parts.join(" 且 ");
}

// 计算某一组条件（ACUTE_CONDITIONS 或 CHRONIC_CONDITIONS）的基础得分
// supporting[key] 是一份逐条记录：{ points, desc, source }
function computeBaseScores(conditionSet, answers) {
  const scores = {};
  const supporting = {};
  Object.entries(conditionSet).forEach(([key, cond]) => {
    let total = 0;
    const factors = [];
    let locationRaw = 0;
    let otherRaw = 0;
    let locationHit = false;
    let otherHit = false;
    (cond.rules || []).forEach((rule) => {
      if (ruleHits(answers, rule)) {
        const isLocation = rule.when.some((c) => c.field === "primary_location" || c.field === "secondary_location");
        if (isLocation) { locationRaw += rule.points; locationHit = true; }
        else { otherRaw += rule.points; otherHit = true; }
      }
    });
    const rules = cond.rules || [];
    const maxLocation = rules.filter((r) => r.when.some((c) => c.field === "primary_location" || c.field === "secondary_location")).reduce((n, r) => n + Math.max(0, r.points), 0);
    const maxOther = rules.filter((r) => !r.when.some((c) => c.field === "primary_location" || c.field === "secondary_location")).reduce((n, r) => n + Math.max(0, r.points), 0);
    const locationScore = maxLocation ? (locationRaw / maxLocation) * 40 : 0;
    const otherScore = maxOther ? (otherRaw / maxOther) * 60 : 0;
    total = locationScore + otherScore;
    if (locationHit) factors.push({ points: Math.round(locationScore * 10) / 10, desc: `位置匹配 ${locationRaw}/${maxLocation}（基础分权重 40%）`, source: "location" });
    if (otherHit) factors.push({ points: Math.round(otherScore * 10) / 10, desc: `其他问卷特征 ${otherRaw}/${maxOther}（基础分权重 60%）`, source: "other" });
    scores[key] = total;
    supporting[key] = factors;
  });
  return { scores, supporting };
}

// ---------------- 全局规则（Part 4） ----------------
// 每条规则：{ id, desc（题目=选项，人话描述）, when(answers) => bool, effects: [{key, points}] }
function buildGlobalRules(mode) {
  const rules = [];

  // Pain Pattern — Activity Response
  rules.push({
    id: "activity_warmup", desc: "活动后疼痛变化 = 越动越好",
    when: (a) => a.activity_pattern === "越动越好",
    effects: [{ key: "Achilles_Tendinopathy", points: 4 }, { key: "Plantar_Fasciitis", points: 4 }],
  });
  rules.push({
    id: "activity_worsens", desc: "活动后疼痛变化 = 越动越痛",
    when: (a) => a.activity_pattern === "越动越痛",
    effects: [
      { key: "Stress_Fracture", points: 2 }, { key: "Lateral_Malleolus_Fracture", points: 2 },
      { key: "Medial_Malleolus_Fracture", points: 2 }, { key: "Jones_Fracture", points: 2 },
      { key: "Calcaneal_Fracture", points: 2 }, { key: "Lisfranc", points: 2 }, { key: "Cartilage_Injury", points: 2 },
    ],
  });

  // Constant Pain Rules
  rules.push({
    id: "pain_constant", desc: "疼痛时相 = 持续存在",
    when: (a) => a.pain_pattern === "持续存在",
    effects: [
      { key: "Stress_Fracture", points: 4 }, { key: "Lateral_Malleolus_Fracture", points: 4 },
      { key: "Medial_Malleolus_Fracture", points: 4 }, { key: "Jones_Fracture", points: 4 },
      { key: "Calcaneal_Fracture", points: 4 }, { key: "Ankle_Osteoarthritis", points: 2 },
    ],
  });
  rules.push({
    id: "pain_only_exercise", desc: "疼痛时相 = 只有运动时",
    when: (a) => a.pain_pattern === "只有运动",
    effects: [{ key: "CECS", points: 4 }],
  });
  rules.push({
    id: "pain_only_weightbearing", desc: "疼痛时相 = 只有负重时",
    when: (a) => a.pain_pattern === "只有负重",
    effects: [{ key: "Stress_Fracture", points: 2 }, { key: "Cartilage_Injury", points: 2 }, { key: "OLT", points: 2 }],
  });

  // Specific Trigger Rules
  rules.push({
    id: "trigger_pushoff", desc: "诱发动作 = 启动蹬地",
    when: (a) => a.specific_trigger === "蹬地",
    effects: [{ key: "Achilles_Tendinopathy", points: 4 }, { key: "Sesamoiditis", points: 4 }, { key: "Turf_Toe", points: 4 }],
  });
  rules.push({
    id: "trigger_dorsiflexion", desc: "诱发动作 = 背屈",
    when: (a) => a.specific_trigger === "背屈",
    effects: [{ key: "Ankle_Impingement", points: 4 }, { key: "High_Ankle_Sprain", points: 2 }],
  });
  rules.push({
    id: "trigger_change_direction", desc: "诱发动作 = 急停变向",
    when: (a) => a.specific_trigger === "变向",
    effects: [{ key: "ATFL", points: 2 }, { key: "High_Ankle_Sprain", points: 2 }, { key: "OLT", points: 2 }],
  });

  // Swelling Rules
  rules.push({
    id: "swelling_immediate", desc: "肿胀出现时间 = 立刻出现",
    when: (a) => a.swelling_timing === "立刻",
    effects: [
      { key: "ATFL", points: 4 }, { key: "CFL_PTFL", points: 4 },
      { key: "Lateral_Malleolus_Fracture", points: 4 }, { key: "Medial_Malleolus_Fracture", points: 4 },
    ],
  });
  rules.push({
    id: "swelling_delayed", desc: "肿胀出现时间 = 第二天明显",
    when: (a) => a.swelling_timing === "第二天",
    effects: [{ key: "Lisfranc", points: 3 }],
  });
  rules.push({
    id: "swelling_persistent", desc: "肿胀出现时间 = 一直消不下去",
    when: (a) => a.swelling_timing === "持续",
    effects: [
      { key: "Lateral_Malleolus_Fracture", points: 3 }, { key: "Medial_Malleolus_Fracture", points: 3 },
      { key: "Jones_Fracture", points: 3 }, { key: "Calcaneal_Fracture", points: 3 }, { key: "CFL_PTFL", points: 2 },
    ],
  });
  rules.push({
    id: "swelling_none", desc: "肿胀程度 = 没有",
    when: (a) => a.swelling_severity === "无",
    effects: [{ key: "High_Ankle_Sprain", points: 3 }],
  });

  // Functional Test Rules
  rules.push({
    id: "sls_fail", desc: "单脚站立测试 = 无法完成",
    when: (a) => a.single_leg_stand === "无法完成",
    effects: ["Lateral_Malleolus_Fracture", "Medial_Malleolus_Fracture", "Jones_Fracture", "Calcaneal_Fracture", "Lisfranc"]
      .map((key) => ({ key, points: 4 })),
  });
  rules.push({
    id: "sls_pain", desc: "单脚站立测试 = 疼痛但完成",
    when: (a) => a.single_leg_stand === "疼痛完成",
    effects: [
      { key: "ATFL", points: 2 }, { key: "CFL_PTFL", points: 2 },
      { key: "Peroneal_Tendinopathy", points: 2 }, { key: "Posterior_Tibial_Tendinopathy", points: 2 },
      { key: "Achilles_Tendinopathy", points: 2 },
    ],
  });
  rules.push({
    id: "sls_unstable", desc: "单脚站立测试 = 明显不稳",
    when: (a) => a.single_leg_stand === "不稳",
    effects: [{ key: "ATFL", points: 4 }],
  });

  rules.push({
    id: "hop_fail", desc: "单脚跳测试 = 无法完成",
    when: (a) => a.single_leg_hop === "无法完成",
    effects: ["Lateral_Malleolus_Fracture", "Medial_Malleolus_Fracture", "Jones_Fracture", "Calcaneal_Fracture", "Lisfranc"]
      .map((key) => ({ key, points: 4 })),
  });
  rules.push({
    id: "hop_pain", desc: "单脚跳测试 = 疼痛但完成",
    when: (a) => a.single_leg_hop === "疼痛完成",
    effects: [{ key: "ATFL", points: 2 }, { key: "CFL_PTFL", points: 2 }, { key: "Achilles_Tendinopathy", points: 2 }, { key: "Stress_Fracture", points: 2 }],
  });

  rules.push({
    id: "cod_fail", desc: "变向测试 = 无法完成",
    when: (a) => a.change_direction_test === "无法完成",
    effects: [{ key: "ATFL", points: 4 }, { key: "CFL_PTFL", points: 4 }, { key: "High_Ankle_Sprain", points: 4 }, { key: "Lisfranc", points: 4 }],
  });
  rules.push({
    id: "cod_unstable", desc: "变向测试 = 明显不稳",
    when: (a) => a.change_direction_test === "不稳",
    effects: [{ key: "ATFL", points: 4 }],
  });

  rules.push({
    id: "pushoff_fail", desc: "蹬地测试 = 无法完成",
    when: (a) => a.push_off_test === "无法完成",
    effects: [{ key: "Achilles_Tendinopathy", points: 4 }, { key: "Achilles_Tear", points: 4 }],
  });
  rules.push({
    id: "pushoff_weak", desc: "蹬地测试 = 明显无力",
    when: (a) => a.push_off_test === "明显无力",
    effects: [{ key: "Achilles_Tear", points: 4 }, { key: "Achilles_Tendinopathy", points: 2 }],
  });

  // Instability
  rules.push({
    id: "instability_yes", desc: "是否经常崴脚感 / 不稳 = 是",
    when: (a) => a.instability === "是",
    effects: [{ key: "ATFL", points: 4 }, { key: "High_Ankle_Sprain", points: 2 }],
  });

  // Bruising
  rules.push({
    id: "bruising_yes", desc: "瘀青 = 有",
    when: (a) => a.bruising === "是",
    effects: ["ATFL", "CFL_PTFL", "Lateral_Malleolus_Fracture", "Medial_Malleolus_Fracture", "Jones_Fracture", "Calcaneal_Fracture"]
      .map((key) => ({ key, points: 3 })),
  });
  rules.push({
    id: "bruising_no", desc: "瘀青 = 没有",
    when: (a) => a.bruising === "否",
    effects: [{ key: "High_Ankle_Sprain", points: 2 }],
  });

  // Inflammation / heat
  rules.push({
    id: "heat_yes", desc: "局部发热（比对侧热） = 是",
    when: (a) => a.inflammation_heat === "是",
    effects: ["Peroneal_Tendinopathy", "Plantar_Fasciitis", "Posterior_Tibial_Tendinopathy", "Achilles_Tendinopathy", "Severs_Disease", "Sesamoiditis"]
      .map((key) => ({ key, points: 2 })),
  });

  // Recurrent sprain
  rules.push({
    id: "recurrent_sprain_yes", desc: "既往反复崴脚 = 是",
    when: (a) => a.recurrent_sprain === "是",
    effects: [{ key: "ATFL", points: 4 }, { key: "Tarsal_Coalition", points: 2 }],
  });

  return rules;
}

// 应用全局规则并把命中记录写入 supporting，便于展示"哪道题+哪个选项加了几分"
function applyGlobalRules(scores, supporting, mode, answers) {
  buildGlobalRules(mode).forEach((rule) => {
    if (!rule.when(answers)) return;
    rule.effects.forEach(({ key, points }) => {
      if (!Object.prototype.hasOwnProperty.call(scores, key)) return;
      scores[key] = (scores[key] || 0) + points;
      supporting[key] = supporting[key] || [];
      supporting[key].push({ points, desc: rule.desc, source: "global" });
    });
  });
}

// ---------------- Special Test Re-scoring ----------------
// 阳性：score *= (1 + 0.1 * posWeight)
// 阴性：score *= (1 - 0.1 * negWeight)
// testResults: { [conditionKey]: { [testName]: 'positive' | 'negative' } }
function applyTestAdjustments(scores, testResults, posWeight, negWeight) {
  const pw = Number(posWeight) || 0;
  const nw = Number(negWeight) || 0;
  Object.entries(testResults || {}).forEach(([key, tests]) => {
    if (!Object.prototype.hasOwnProperty.call(scores, key)) return;
    Object.values(tests).forEach((result) => {
      if (result === "positive") scores[key] = scores[key] * (1 + 0.1 * pw);
      else if (result === "negative") scores[key] = scores[key] * (1 - 0.1 * nw);
    });
  });
}

// ---------------- Overrides ----------------
function applyOverrides(scores, answers, overrideList, supporting) {
  const triggered = [];
  overrideList.forEach((ov) => {
    if (ov.when(answers)) {
      triggered.push(ov.id);
      if (ov.apply) ov.apply(scores);
      if (supporting && ov.desc && ov.affects) {
        ov.affects.forEach((key) => {
          if (!Object.prototype.hasOwnProperty.call(scores, key)) return;
          supporting[key] = supporting[key] || [];
          supporting[key].push({ points: 100, desc: ov.desc, source: "override" });
        });
      }
    }
  });
  return triggered;
}

// ---------------- Ranking ----------------
function rankConditions(scores, conditionSet, topN = 3) {
  const visible = Object.entries(scores).filter(([key]) => !conditionSet[key].hidden);
  const sorted = visible.sort((a, b) => b[1] - a[1]);
  const top = sorted.slice(0, topN).filter(([, sc]) => sc > 0);
  const top1Score = top.length ? top[0][1] : 1;
  return top.map(([key, score]) => ({
    key,
    score: Math.round(score * 10) / 10,
    matchPct: Math.round((score / (top1Score || 1)) * 100),
    ...conditionSet[key],
  }));
}

// 列出所有分数 > 0 的伤病（不限 Top N），用于"加分透明度"页面
function listAllScored(scores, conditionSet) {
  const visible = Object.entries(scores).filter(([key, sc]) => !conditionSet[key].hidden && sc > 0);
  const sorted = visible.sort((a, b) => b[1] - a[1]);
  return sorted.map(([key, score]) => ({
    key,
    score: Math.round(score * 10) / 10,
    ...conditionSet[key],
  }));
}

function buildSupportingFactorText(entry) {
  // 兼容两种入参：新格式 {points, desc} 或旧格式 rule 对象 {when:[...]}
  if (entry && entry.desc) return entry.desc;
  if (entry && entry.when) {
    return entry.when.map((c) => `${fieldLabel(c.field)} = ${valueLabel(c.match)}`).join(" 且 ");
  }
  return "";
}
