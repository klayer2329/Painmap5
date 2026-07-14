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

const MULTI_SELECT_FIELDS = new Set(["load_change"]);

function ruleValues(rule, field) {
  const condition = rule.when.find((item) => item.field === field);
  if (!condition) return [];
  return Array.isArray(condition.match) ? condition.match : [condition.match];
}

// Location rules contain alternative valid paths. Find the best path a single
// patient can actually select instead of adding mutually exclusive paths.
function maximumLocationScore(rules, answers) {
  const selectedPrimary = answers.primary_location;
  const eligibleRules = rules.filter((rule) =>
    rule.when
      .filter((condition) => condition.field === "primary_location")
      .every((condition) => matchField({ primary_location: selectedPrimary }, condition.field, condition.match))
  );
  const secondaryValues = new Set([undefined]);
  eligibleRules.forEach((rule) => {
    ruleValues(rule, "secondary_location").forEach((value) => secondaryValues.add(value));
  });
  let best = 0;
  secondaryValues.forEach((secondary) => {
    const candidate = { primary_location: selectedPrimary, secondary_location: secondary };
    const score = eligibleRules.reduce((sum, rule) => sum + (ruleHits(candidate, rule) ? Math.max(0, rule.points) : 0), 0);
    best = Math.max(best, score);
  });
  return best;
}

// Non-location rules are independent questionnaire fields. A single-select
// field contributes only its best reachable option. The training-load field is
// multi-select, so compatible subsets are checked ("no change" stays exclusive).
function maximumOtherScore(rules) {
  const byField = new Map();
  rules.forEach((rule) => {
    if (rule.when.length !== 1) return;
    const field = rule.when[0].field;
    if (!byField.has(field)) byField.set(field, []);
    byField.get(field).push(rule);
  });

  let total = 0;
  byField.forEach((fieldRules, field) => {
    const values = [...new Set(fieldRules.flatMap((rule) => ruleValues(rule, field)))];
    let best = 0;
    if (MULTI_SELECT_FIELDS.has(field)) {
      const count = 1 << values.length;
      for (let mask = 0; mask < count; mask += 1) {
        const selected = values.filter((_, index) => mask & (1 << index));
        if (selected.includes("无变化") && selected.length > 1) continue;
        const candidate = { [field]: selected };
        const score = fieldRules.reduce((sum, rule) => sum + (ruleHits(candidate, rule) ? Math.max(0, rule.points) : 0), 0);
        best = Math.max(best, score);
      }
    } else {
      values.forEach((value) => {
        const candidate = { [field]: value };
        const score = fieldRules.reduce((sum, rule) => sum + (ruleHits(candidate, rule) ? Math.max(0, rule.points) : 0), 0);
        best = Math.max(best, score);
      });
    }
    total += best;
  });
  return total;
}

// Only the first pain-map selection is a hard eligibility filter. The exact
// sub-location is scored inside the 40-point location component; it never
// removes a condition whose main region matches.
function locationEligibilityMatches(answers, condition) {
  const locationRules = (condition.rules || []).filter((rule) =>
    rule.when.some((cond) => cond.field === "primary_location")
  );
  if (locationRules.length === 0) return false;
  return locationRules.some((rule) =>
    rule.when.filter((cond) => cond.field === "primary_location")
      .every((cond) => matchField(answers, cond.field, cond.match))
  );
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
function computeBaseScores(conditionSet, answers, mode) {
  const scores = {};
  const supporting = {};
  const locationScores = {};
  Object.entries(conditionSet).forEach(([key, cond]) => {
    if (!locationEligibilityMatches(answers, cond)) return;
    let total = 0;
    const factors = [];
    let locationRaw = 0;
    let otherRaw = 0;
    let locationHit = false;
    let otherHit = false;
    const conditionRules = cond.rules || [];
    const globalFeatureRules = buildGlobalRules(mode).flatMap((globalRule) =>
      globalRule.effects
        .filter((effect) => effect.key === key)
        .map((effect) => ({ points: effect.points, when: globalRule.conditions, desc: globalRule.desc }))
    );
    const allRules = [...conditionRules, ...globalFeatureRules];
    allRules.forEach((rule) => {
      if (ruleHits(answers, rule)) {
        const isLocation = rule.when.some((c) => c.field === "primary_location" || c.field === "secondary_location");
        if (isLocation) { locationRaw += rule.points; locationHit = true; }
        else { otherRaw += rule.points; otherHit = true; }
      }
    });
    const locationRules = conditionRules.filter((r) => r.when.some((c) => c.field === "primary_location" || c.field === "secondary_location"));
    const otherRules = allRules.filter((r) => !r.when.some((c) => c.field === "primary_location" || c.field === "secondary_location"));
    const maxLocation = maximumLocationScore(locationRules, answers);
    const maxOther = maximumOtherScore(otherRules);
    const locationScore = maxLocation ? (locationRaw / maxLocation) * 40 : 0;
    const otherScore = maxOther ? (otherRaw / maxOther) * 60 : 0;
    total = locationScore + otherScore;
    if (locationHit) factors.push({ points: Math.round(locationScore * 10) / 10, desc: `位置匹配 ${locationRaw}/${maxLocation}（基础分权重 40%）`, source: "location" });
    if (otherHit) factors.push({ points: Math.round(otherScore * 10) / 10, desc: `其他问卷特征 ${otherRaw}/${maxOther}（基础分权重 60%）`, source: "other" });
    scores[key] = total;
    locationScores[key] = locationScore;
    supporting[key] = factors;
  });
  return { scores, supporting, locationScores };
}

// ---------------- 全局规则（Part 4） ----------------
// 每条规则：{ id, desc（题目=选项，人话描述）, when(answers) => bool, effects: [{key, points}] }
function buildGlobalRules(mode) {
  const rules = [];

  // Pain Pattern — Activity Response
  rules.push({
    id: "activity_warmup", desc: "活动后疼痛变化 = 越动越好",
    conditions: [{ field: "activity_pattern", match: "越动越好" }],
    when: (a) => a.activity_pattern === "越动越好",
    effects: [{ key: "Achilles_Tendinopathy", points: 4 }, { key: "Plantar_Fasciitis", points: 4 }],
  });
  rules.push({
    id: "activity_start_worst", desc: "活动后疼痛变化 = 开始活动最痛",
    conditions: [{ field: "activity_pattern", match: "开始最痛" }],
    when: (a) => a.activity_pattern === "开始最痛",
    effects: [{ key: "Achilles_Tendinopathy", points: 2 }, { key: "Plantar_Fasciitis", points: 2 }],
  });
  rules.push({
    id: "activity_worsens", desc: "活动后疼痛变化 = 越动越痛",
    conditions: [{ field: "activity_pattern", match: "越动越痛" }],
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
    conditions: [{ field: "pain_pattern", match: "持续存在" }],
    when: (a) => a.pain_pattern === "持续存在",
    effects: [
      { key: "Stress_Fracture", points: 4 }, { key: "Lateral_Malleolus_Fracture", points: 4 },
      { key: "Medial_Malleolus_Fracture", points: 4 }, { key: "Jones_Fracture", points: 4 },
      { key: "Calcaneal_Fracture", points: 4 }, { key: "Ankle_Osteoarthritis", points: 2 },
    ],
  });
  rules.push({
    id: "pain_only_exercise", desc: "疼痛时相 = 只有运动时",
    conditions: [{ field: "pain_pattern", match: "只有运动" }],
    when: (a) => a.pain_pattern === "只有运动",
    effects: [
      { key: "Stress_Fracture", points: 2 }, { key: "Peroneal_Tendinopathy", points: 1 },
      { key: "Posterior_Tibial_Tendinopathy", points: 1 }, { key: "Achilles_Tendinopathy", points: 1 },
    ],
  });
  rules.push({
    id: "pain_only_weightbearing", desc: "疼痛时相 = 只有负重时",
    conditions: [{ field: "pain_pattern", match: "只有负重" }],
    when: (a) => a.pain_pattern === "只有负重",
    effects: [{ key: "Stress_Fracture", points: 2 }, { key: "Cartilage_Injury", points: 2 }, { key: "OLT", points: 2 }],
  });

  // Specific Trigger Rules
  rules.push({
    id: "trigger_pushoff", desc: "诱发动作 = 启动蹬地",
    conditions: [{ field: "specific_trigger", match: "蹬地" }],
    when: (a) => a.specific_trigger === "蹬地",
    effects: [{ key: "Achilles_Tendinopathy", points: 4 }, { key: "Sesamoiditis", points: 4 }, { key: "Turf_Toe", points: 4 }],
  });
  rules.push({
    id: "trigger_dorsiflexion", desc: "诱发动作 = 背屈",
    conditions: [{ field: "specific_trigger", match: "背屈" }],
    when: (a) => a.specific_trigger === "背屈",
    effects: [{ key: "Ankle_Impingement", points: 4 }, { key: "High_Ankle_Sprain", points: 2 }],
  });
  rules.push({
    id: "trigger_change_direction", desc: "诱发动作 = 急停变向",
    conditions: [{ field: "specific_trigger", match: "变向" }],
    when: (a) => a.specific_trigger === "变向",
    effects: [{ key: "ATFL", points: 2 }, { key: "High_Ankle_Sprain", points: 2 }, { key: "OLT", points: 2 }],
  });

  // Swelling Rules
  rules.push({
    id: "swelling_immediate", desc: "肿胀出现时间 = 立刻出现",
    conditions: [{ field: "swelling_timing", match: "立刻" }],
    when: (a) => a.swelling_timing === "立刻",
    effects: [
      { key: "ATFL", points: 4 }, { key: "CFL_PTFL", points: 4 },
      { key: "Lateral_Malleolus_Fracture", points: 4 }, { key: "Medial_Malleolus_Fracture", points: 4 },
    ],
  });
  rules.push({
    id: "swelling_hours", desc: "肿胀出现时间 = 几小时后",
    conditions: [{ field: "swelling_timing", match: "数小时" }],
    when: (a) => a.swelling_timing === "数小时",
    effects: [
      { key: "ATFL", points: 2 }, { key: "CFL_PTFL", points: 2 },
      { key: "OLT", points: 1 }, { key: "Cartilage_Injury", points: 1 },
    ],
  });
  rules.push({
    id: "swelling_delayed", desc: "肿胀出现时间 = 第二天明显",
    conditions: [{ field: "swelling_timing", match: "第二天" }],
    when: (a) => a.swelling_timing === "第二天",
    effects: [{ key: "Lisfranc", points: 3 }],
  });
  rules.push({
    id: "swelling_persistent", desc: "肿胀出现时间 = 一直消不下去",
    conditions: [{ field: "swelling_timing", match: "持续" }],
    when: (a) => a.swelling_timing === "持续",
    effects: [
      { key: "Lateral_Malleolus_Fracture", points: 3 }, { key: "Medial_Malleolus_Fracture", points: 3 },
      { key: "Jones_Fracture", points: 3 }, { key: "Calcaneal_Fracture", points: 3 }, { key: "CFL_PTFL", points: 2 },
    ],
  });
  rules.push({
    id: "swelling_none", desc: "肿胀程度 = 没有",
    conditions: [{ field: "swelling_severity", match: "无" }],
    when: (a) => a.swelling_severity === "无",
    effects: [{ key: "High_Ankle_Sprain", points: 3 }],
  });
  [
    ["轻度", 1], ["中度", 2], ["重度", 3],
  ].forEach(([severity, points]) => rules.push({
    id: `swelling_${severity}`, desc: `肿胀程度 = ${severity}`,
    conditions: [{ field: "swelling_severity", match: severity }],
    when: (a) => a.swelling_severity === severity,
    effects: [
      { key: "ATFL", points }, { key: "CFL_PTFL", points },
      { key: "Lateral_Malleolus_Fracture", points }, { key: "Medial_Malleolus_Fracture", points },
      { key: "Lisfranc", points }, { key: "OLT", points }, { key: "Cartilage_Injury", points },
    ],
  }));

  // Functional Test Rules
  rules.push({
    id: "sls_fail", desc: "单脚站立测试 = 无法完成",
    conditions: [{ field: "single_leg_stand", match: "无法完成" }],
    when: (a) => a.single_leg_stand === "无法完成",
    effects: ["Lateral_Malleolus_Fracture", "Medial_Malleolus_Fracture", "Jones_Fracture", "Calcaneal_Fracture", "Lisfranc"]
      .map((key) => ({ key, points: 4 })),
  });
  rules.push({
    id: "sls_pain", desc: "单脚站立测试 = 疼痛但完成",
    conditions: [{ field: "single_leg_stand", match: "疼痛完成" }],
    when: (a) => a.single_leg_stand === "疼痛完成",
    effects: [
      { key: "ATFL", points: 2 }, { key: "CFL_PTFL", points: 2 },
      { key: "Peroneal_Tendinopathy", points: 2 }, { key: "Posterior_Tibial_Tendinopathy", points: 2 },
      { key: "Achilles_Tendinopathy", points: 2 },
    ],
  });
  rules.push({
    id: "sls_unstable", desc: "单脚站立测试 = 明显不稳",
    conditions: [{ field: "single_leg_stand", match: "不稳" }],
    when: (a) => a.single_leg_stand === "不稳",
    effects: [{ key: "ATFL", points: 4 }],
  });

  rules.push({
    id: "hop_fail", desc: "单脚跳测试 = 无法完成",
    conditions: [{ field: "single_leg_hop", match: "无法完成" }],
    when: (a) => a.single_leg_hop === "无法完成",
    effects: ["Lateral_Malleolus_Fracture", "Medial_Malleolus_Fracture", "Jones_Fracture", "Calcaneal_Fracture", "Lisfranc"]
      .map((key) => ({ key, points: 4 })),
  });
  rules.push({
    id: "hop_pain", desc: "单脚跳测试 = 疼痛但完成",
    conditions: [{ field: "single_leg_hop", match: "疼痛完成" }],
    when: (a) => a.single_leg_hop === "疼痛完成",
    effects: [{ key: "ATFL", points: 2 }, { key: "CFL_PTFL", points: 2 }, { key: "Achilles_Tendinopathy", points: 2 }, { key: "Stress_Fracture", points: 2 }],
  });

  rules.push({
    id: "cod_fail", desc: "变向测试 = 无法完成",
    conditions: [{ field: "change_direction_test", match: "无法完成" }],
    when: (a) => a.change_direction_test === "无法完成",
    effects: [{ key: "ATFL", points: 4 }, { key: "CFL_PTFL", points: 4 }, { key: "High_Ankle_Sprain", points: 4 }, { key: "Lisfranc", points: 4 }],
  });
  rules.push({
    id: "cod_unstable", desc: "变向测试 = 明显不稳",
    conditions: [{ field: "change_direction_test", match: "不稳" }],
    when: (a) => a.change_direction_test === "不稳",
    effects: [{ key: "ATFL", points: 4 }],
  });
  rules.push({
    id: "cod_pain", desc: "变向测试 = 疼痛但完成",
    conditions: [{ field: "change_direction_test", match: "疼痛完成" }],
    when: (a) => a.change_direction_test === "疼痛完成",
    effects: [
      { key: "ATFL", points: 2 }, { key: "CFL_PTFL", points: 2 },
      { key: "High_Ankle_Sprain", points: 2 }, { key: "OLT", points: 2 },
    ],
  });

  rules.push({
    id: "pushoff_fail", desc: "蹬地测试 = 无法完成",
    conditions: [{ field: "push_off_test", match: "无法完成" }],
    when: (a) => a.push_off_test === "无法完成",
    effects: [{ key: "Achilles_Tendinopathy", points: 4 }, { key: "Achilles_Tear", points: 4 }],
  });
  rules.push({
    id: "pushoff_weak", desc: "蹬地测试 = 明显无力",
    conditions: [{ field: "push_off_test", match: "明显无力" }],
    when: (a) => a.push_off_test === "明显无力",
    effects: [{ key: "Achilles_Tear", points: 4 }, { key: "Achilles_Tendinopathy", points: 2 }],
  });
  rules.push({
    id: "pushoff_pain", desc: "蹬地测试 = 疼痛但完成",
    conditions: [{ field: "push_off_test", match: "疼痛完成" }],
    when: (a) => a.push_off_test === "疼痛完成",
    effects: [
      { key: "Achilles_Tear", points: 1 }, { key: "Achilles_Tendinopathy", points: 2 },
      { key: "Sesamoiditis", points: 2 }, { key: "Turf_Toe", points: 2 },
      { key: "Plantar_Fasciitis", points: 1 },
    ],
  });

  // Instability
  rules.push({
    id: "instability_yes", desc: "是否经常崴脚感 / 不稳 = 是",
    conditions: [{ field: "instability", match: "是" }],
    when: (a) => a.instability === "是",
    effects: [{ key: "ATFL", points: 4 }, { key: "High_Ankle_Sprain", points: 2 }],
  });

  // Bruising
  [["轻度", 1], ["中度", 2], ["重度", 3]].forEach(([severity, points]) => rules.push({
    id: `bruising_${severity}`, desc: `瘀青程度 = ${severity}`,
    conditions: [{ field: "bruising", match: severity }],
    when: (a) => a.bruising === severity,
    effects: ["ATFL", "CFL_PTFL", "Lateral_Malleolus_Fracture", "Medial_Malleolus_Fracture", "Jones_Fracture", "Calcaneal_Fracture"]
      .map((key) => ({ key, points })),
  }));
  rules.push({
    id: "bruising_no", desc: "瘀青程度 = 没有",
    conditions: [{ field: "bruising", match: "无" }],
    when: (a) => a.bruising === "无",
    effects: [{ key: "High_Ankle_Sprain", points: 2 }],
  });

  // Inflammation / heat
  rules.push({
    id: "heat_yes", desc: "局部发热（比对侧热） = 是",
    conditions: [{ field: "inflammation_heat", match: "是" }],
    when: (a) => a.inflammation_heat === "是",
    effects: ["Peroneal_Tendinopathy", "Plantar_Fasciitis", "Posterior_Tibial_Tendinopathy", "Achilles_Tendinopathy", "Severs_Disease", "Sesamoiditis"]
      .map((key) => ({ key, points: 2 })),
  });

  // Recurrent sprain
  rules.push({
    id: "recurrent_sprain_yes", desc: "既往反复崴脚 = 是",
    conditions: [{ field: "recurrent_sprain", match: "是" }],
    when: (a) => a.recurrent_sprain === "是",
    effects: [{ key: "ATFL", points: 4 }, { key: "Tarsal_Coalition", points: 2 }],
  });

  return rules;
}

// ---------------- Special Test Re-scoring ----------------
// 阳性：score *= (1 + 0.1 * posWeight)
// 阴性：score *= (1 - 0.1 * negWeight)
// testResults: { [conditionKey]: { [testName]: 'positive' | 'negative' } }
function applyTestAdjustments(scores, testResults, posWeight, negWeight) {
  Object.entries(testResults || {}).forEach(([key, tests]) => {
    if (!Object.prototype.hasOwnProperty.call(scores, key)) return;
    Object.values(tests).forEach((result) => {
      if (result === "positive") scores[key] = scores[key] * 1.1;
      else if (result === "negative") scores[key] = scores[key] * 0.95;
    });
    scores[key] = Math.max(0, Math.min(100, scores[key]));
  });
}

// ---------------- Overrides ----------------
function applyOverrides(scores, answers, overrideList, supporting) {
  const triggered = [];
  const eligibleKeys = new Set(Object.keys(scores));
  overrideList.forEach((ov) => {
    if (ov.when(answers)) {
      triggered.push(ov.id);
      if (ov.apply) {
        ov.apply(scores);
        Object.keys(scores).forEach((key) => {
          if (!eligibleKeys.has(key)) delete scores[key];
        });
      }
    }
  });
  return triggered;
}

// ---------------- Ranking ----------------
function rankConditions(scores, conditionSet, topN = 3, locationScores = null) {
  const visible = Object.entries(scores).filter(([key]) =>
    !conditionSet[key].hidden && (!locationScores || (locationScores[key] || 0) > 0)
  );
  const sorted = visible.sort((a, b) => b[1] - a[1]);
  const top = sorted.slice(0, topN).filter(([, sc]) => sc > 0);
  return top.map(([key, score]) => ({
    key,
    score: Math.round(Math.max(0, Math.min(100, score)) * 10) / 10,
    scorePct: Math.round(Math.max(0, Math.min(100, score))),
    ...conditionSet[key],
  }));
}

// 列出所有分数 > 0 的伤病（不限 Top N），用于"加分透明度"页面
function listAllScored(scores, conditionSet, locationScores = null) {
  const visible = Object.entries(scores).filter(([key, sc]) =>
    !conditionSet[key].hidden && sc > 0 && (!locationScores || (locationScores[key] || 0) > 0)
  );
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
