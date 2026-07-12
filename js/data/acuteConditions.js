// ============================================================
// 急性损伤评分规则
// 每条 rule: { points, when:[{field, match}] }  — when 内条件为 AND
// match 可以是字符串或字符串数组（数组=命中其一即可）
// ============================================================

const ACUTE_CONDITIONS = {

  Achilles_Tear: {
    nameZh: "跟腱撕裂 / 断裂", nameEn: "Achilles Tendon Rupture", category: "acute-tendon",
    rules: [
      { points: 4, when: [{ field: "mechanism", match: "跳落地" }] },
      { points: 4, when: [{ field: "mechanism", match: "蹬地" }] },
      { points: 3, when: [{ field: "pain_action", match: "跑步" }] },
      { points: 2, when: [{ field: "contact", match: "对抗" }] },
      { points: 1, when: [{ field: "contact", match: "无接触" }] },
      { points: 4, when: [{ field: "immediate_function", match: "完全不能走" }] },
      { points: 2, when: [{ field: "immediate_function", match: "能走不能跑" }] },
      { points: 4, when: [{ field: "injury_sensation", match: "啪" }] },
      { points: 2, when: [{ field: "injury_sensation", match: "被踢" }] },
      { points: 1, when: [{ field: "injury_sensation", match: "无特殊" }] },
      { points: 4, when: [{ field: "pain_action", match: "蹬地" }] },
      { points: 4, when: [{ field: "pain_action", match: "起跳" }] },
      { points: 2, when: [{ field: "pain_action", match: "站立" }] },
      { points: 4, when: [{ field: "primary_location", match: "后方" }] },
      { points: 4, when: [{ field: "primary_location", match: "踝上方" }] },
      { points: 3, when: [{ field: "primary_location", match: "后方" }, { field: "secondary_location", match: "跟腱区" }] },
      { points: 2, when: [{ field: "pain_shape", match: "线" }] },
      { points: 1, when: [{ field: "pain_shape", match: "片" }] },
      { points: 4, when: [{ field: "pain_depth", match: "深层" }] },
      { points: 3, when: [{ field: "pain_depth", match: "表浅" }] },
    ],
  },

  ATFL: {
    nameZh: "前距腓韧带损伤", nameEn: "ATFL Injury", category: "acute-ligament",
    rules: [
      { points: 4, when: [{ field: "mechanism", match: "内翻" }] },
      { points: 1, when: [{ field: "mechanism", match: "旋转" }] },
      { points: 1, when: [{ field: "contact", match: "对抗" }] },
      { points: 2, when: [{ field: "contact", match: "垫脚" }] },
      { points: 2, when: [{ field: "immediate_function", match: "能走不能跑" }] },
      { points: 1, when: [{ field: "injury_sensation", match: "啪" }] },
      { points: 2, when: [{ field: "pain_action", match: "变向" }] },
      { points: 1, when: [{ field: "pain_action", match: "跑步" }] },
      { points: 4, when: [{ field: "primary_location", match: "外侧" }, { field: "secondary_location", match: "前下" }] },
      { points: 2, when: [{ field: "pain_shape", match: "点" }] },
      { points: 2, when: [{ field: "pain_depth", match: "表浅" }] },
    ],
  },

  CFL_PTFL: {
    nameZh: "跟腓 / 后距腓韧带损伤", nameEn: "CFL / PTFL Injury", category: "acute-ligament",
    rules: [
      { points: 4, when: [{ field: "mechanism", match: "内翻" }] },
      { points: 2, when: [{ field: "contact", match: "对抗" }] },
      { points: 2, when: [{ field: "contact", match: "垫脚" }] },
      { points: 2, when: [{ field: "immediate_function", match: "完全不能走" }] },
      { points: 2, when: [{ field: "injury_sensation", match: "啪" }] },
      { points: 2, when: [{ field: "pain_action", match: "走路" }] },
      { points: 2, when: [{ field: "pain_action", match: "变向" }] },
      { points: 4, when: [{ field: "primary_location", match: "外侧" }, { field: "secondary_location", match: "中下" }] },
      { points: 4, when: [{ field: "primary_location", match: "外侧" }, { field: "secondary_location", match: "后下" }] },
      { points: 2, when: [{ field: "pain_shape", match: "点" }] },
      { points: 2, when: [{ field: "pain_shape", match: "片" }] },
      { points: 1, when: [{ field: "pain_depth", match: "表浅" }] },
      { points: 2, when: [{ field: "pain_depth", match: "深层" }] },
    ],
  },

  Lateral_Malleolus_Fracture: {
    nameZh: "外踝骨折", nameEn: "Lateral Malleolus Fracture", category: "acute-fracture",
    rules: [
      { points: 4, when: [{ field: "mechanism", match: "外翻" }] },
      { points: 2, when: [{ field: "mechanism", match: "内翻" }] },
      { points: 2, when: [{ field: "contact", match: "对抗" }] },
      { points: 1, when: [{ field: "contact", match: "垫脚" }] },
      { points: 4, when: [{ field: "immediate_function", match: "完全不能走" }] },
      { points: 4, when: [{ field: "primary_location", match: "外侧" }] },
      { points: 4, when: [{ field: "pain_shape", match: "点" }] },
      { points: 4, when: [{ field: "pain_depth", match: "骨头" }] },
    ],
  },

  Jones_Fracture: {
    nameZh: "第五跖骨基底骨折 (Jones骨折)", nameEn: "Jones Fracture", category: "acute-fracture",
    rules: [
      { points: 2, when: [{ field: "mechanism", match: "内翻" }] },
      { points: 1, when: [{ field: "contact", match: "对抗" }] },
      { points: 1, when: [{ field: "contact", match: "垫脚" }] },
      { points: 4, when: [{ field: "immediate_function", match: "完全不能走" }] },
      { points: 2, when: [{ field: "pain_action", match: "走路" }] },
      { points: 2, when: [{ field: "pain_action", match: "跑步" }] },
      { points: 4, when: [{ field: "primary_location", match: "外侧" }] },
      { points: 4, when: [{ field: "pain_shape", match: "点" }] },
      { points: 4, when: [{ field: "pain_depth", match: "骨头" }] },
    ],
  },

  Lisfranc: {
    nameZh: "Lisfranc 损伤", nameEn: "Lisfranc Injury", category: "acute-fracture",
    rules: [
      { points: 4, when: [{ field: "mechanism", match: "旋转" }] },
      { points: 1, when: [{ field: "mechanism", match: "内翻" }] },
      { points: 2, when: [{ field: "contact", match: "对抗" }] },
      { points: 2, when: [{ field: "contact", match: "垫脚" }] },
      { points: 4, when: [{ field: "immediate_function", match: "完全不能走" }] },
      { points: 1, when: [{ field: "injury_sensation", match: "无特殊" }] },
      { points: 2, when: [{ field: "pain_action", match: "走路" }] },
      { points: 2, when: [{ field: "pain_action", match: "起跳" }] },
      { points: 2, when: [{ field: "pain_action", match: "落地" }] },
      { points: 4, when: [{ field: "primary_location", match: "前方" }, { field: "secondary_location", match: "中足" }] },
      { points: 4, when: [{ field: "primary_location", match: "足底" }, { field: "secondary_location", match: "中足" }] },
      { points: 2, when: [{ field: "pain_shape", match: "点" }] },
      { points: 2, when: [{ field: "pain_shape", match: "片" }] },
      { points: 2, when: [{ field: "pain_depth", match: "深层" }] },
    ],
  },

  Deltoid: {
    nameZh: "三角韧带损伤", nameEn: "Deltoid Ligament Injury", category: "acute-ligament",
    rules: [
      { points: 4, when: [{ field: "mechanism", match: "外翻" }] },
      { points: 2, when: [{ field: "contact", match: "对抗" }] },
      { points: 2, when: [{ field: "immediate_function", match: "能走不能跑" }] },
      { points: 1, when: [{ field: "injury_sensation", match: "啪" }] },
      { points: 2, when: [{ field: "pain_action", match: "变向" }] },
      { points: 4, when: [{ field: "primary_location", match: "内侧" }] },
      { points: 2, when: [{ field: "pain_shape", match: "点" }] },
      { points: 2, when: [{ field: "pain_depth", match: "表浅" }] },
    ],
  },

  Medial_Malleolus_Fracture: {
    nameZh: "内踝骨折", nameEn: "Medial Malleolus Fracture", category: "acute-fracture",
    rules: [
      { points: 2, when: [{ field: "mechanism", match: "外翻" }] },
      { points: 2, when: [{ field: "contact", match: "对抗" }] },
      { points: 4, when: [{ field: "immediate_function", match: "完全不能走" }] },
      { points: 4, when: [{ field: "pain_action", match: "走路" }] },
      { points: 4, when: [{ field: "primary_location", match: "内侧" }] },
      { points: 4, when: [{ field: "pain_shape", match: "点" }] },
      { points: 4, when: [{ field: "pain_depth", match: "骨头" }] },
    ],
  },

  High_Ankle_Sprain: {
    nameZh: "高位踝扭伤（下胫腓联合损伤）", nameEn: "High Ankle Sprain (Syndesmosis)", category: "acute-ligament",
    rules: [
      { points: 4, when: [{ field: "mechanism", match: "外翻" }] },
      { points: 4, when: [{ field: "mechanism", match: "旋转" }] },
      { points: 4, when: [{ field: "mechanism", match: "背屈" }] },
      { points: 2, when: [{ field: "contact", match: "对抗" }] },
      { points: 2, when: [{ field: "immediate_function", match: "能走不能跑" }] },
      { points: 1, when: [{ field: "injury_sensation", match: "无特殊" }] },
      { points: 2, when: [{ field: "pain_action", match: "变向" }] },
      { points: 2, when: [{ field: "pain_action", match: "跑步" }] },
      { points: 4, when: [{ field: "primary_location", match: "踝上方" }] },
      { points: 2, when: [{ field: "pain_shape", match: "线" }] },
      { points: 4, when: [{ field: "pain_depth", match: "深层" }] },
    ],
  },

  Calcaneal_Fracture: {
    nameZh: "跟骨骨折", nameEn: "Calcaneal Fracture", category: "acute-fracture",
    rules: [
      { points: 4, when: [{ field: "mechanism", match: "跳落地" }] },
      { points: 1, when: [{ field: "contact", match: "对抗" }] },
      { points: 4, when: [{ field: "immediate_function", match: "完全不能走" }] },
      { points: 4, when: [{ field: "pain_action", match: "走路" }] },
      { points: 4, when: [{ field: "primary_location", match: "后方" }, { field: "secondary_location", match: "后跟" }] },
      { points: 2, when: [{ field: "pain_shape", match: "片" }] },
      { points: 4, when: [{ field: "pain_depth", match: "骨头" }] },
    ],
  },

  OLT: {
    nameZh: "距骨骨软骨损伤 (OLT)", nameEn: "Osteochondral Lesion of Talus", category: "acute-joint",
    rules: [
      { points: 2, when: [{ field: "mechanism", match: "跳落地" }] },
      { points: 2, when: [{ field: "mechanism", match: "背屈" }] },
      { points: 1, when: [{ field: "contact", match: "对抗" }] },
      { points: 1, when: [{ field: "contact", match: "垫脚" }] },
      { points: 2, when: [{ field: "immediate_function", match: "能走不能跑" }] },
      { points: 4, when: [{ field: "injury_sensation", match: "卡住" }] },
      { points: 2, when: [{ field: "pain_action", match: "起跳" }] },
      { points: 2, when: [{ field: "pain_action", match: "变向" }] },
      { points: 4, when: [{ field: "primary_location", match: "踝上方" }] },
      { points: 4, when: [{ field: "primary_location", match: "前方" }, { field: "secondary_location", match: "踝前" }] },
      { points: 2, when: [{ field: "pain_shape", match: "片" }] },
      { points: 4, when: [{ field: "pain_depth", match: "深层" }] },
    ],
  },

  Ankle_Impingement: {
    nameZh: "踝关节撞击综合征", nameEn: "Ankle Impingement", category: "joint",
    rules: [
      { points: 4, when: [{ field: "mechanism", match: "背屈" }] },
      { points: 4, when: [{ field: "pain_action", match: "背屈" }] }, // 也用于specific_trigger
      { points: 4, when: [{ field: "primary_location", match: "前方" }, { field: "secondary_location", match: "踝前" }] },
      { points: 3, when: [{ field: "pain_depth", match: "表浅" }] },
    ],
  },

  Turf_Toe: {
    nameZh: "大脚趾跖趾关节扭伤 (Turf Toe)", nameEn: "Turf Toe", category: "acute-ligament",
    rules: [
      { points: 4, when: [{ field: "mechanism", match: "背屈" }] },
      { points: 2, when: [{ field: "contact", match: "对抗" }] },
      { points: 2, when: [{ field: "contact", match: "垫脚" }] },
      { points: 2, when: [{ field: "immediate_function", match: "能走不能跑" }] },
      { points: 1, when: [{ field: "injury_sensation", match: "啪" }] },
      { points: 4, when: [{ field: "pain_action", match: "蹬地" }] },
      { points: 4, when: [{ field: "primary_location", match: "大脚趾" }] },
      { points: 2, when: [{ field: "pain_shape", match: "点" }] },
      { points: 2, when: [{ field: "pain_depth", match: "表浅" }] },
      { points: 2, when: [{ field: "pain_depth", match: "深层" }] },
    ],
  },
};

// 急性覆盖规则（Override，优先级最高，评分结束后执行）
const ACUTE_OVERRIDES = [
  {
    id: "override_deformity",
    when: (a) => a.deformity === true,
    emergency: true,
    message: "疑似脱位，建议立即前往医院，停止评估。",
  },
  {
    id: "override_fracture_tenderness",
    desc: "无法负重 + 骨点压痛（骨性深度）→ 骨折类分数直接 +100",
    affects: ["Lateral_Malleolus_Fracture", "Medial_Malleolus_Fracture", "Jones_Fracture", "Calcaneal_Fracture"],
    when: (a) => a.unable_to_weight_bear === true && a.pain_depth === "骨头",
    apply: (scores) => {
      scores.Lateral_Malleolus_Fracture = (scores.Lateral_Malleolus_Fracture || 0) + 100;
      scores.Medial_Malleolus_Fracture = (scores.Medial_Malleolus_Fracture || 0) + 100;
      scores.Jones_Fracture = (scores.Jones_Fracture || 0) + 100;
      scores.Calcaneal_Fracture = (scores.Calcaneal_Fracture || 0) + 100;
    },
  },
  {
    id: "override_lisfranc",
    desc: "具体位置 = 中足 + 受伤机制 = 旋转 → Lisfranc 分数直接 +100",
    affects: ["Lisfranc"],
    when: (a) => (a.secondary_location === "中足") && a.mechanism === "旋转",
    apply: (scores) => { scores.Lisfranc = (scores.Lisfranc || 0) + 100; },
  },
  {
    id: "override_high_ankle",
    desc: "疼痛区域 = 踝上方 → 高位踝扭伤分数直接 +100",
    affects: ["High_Ankle_Sprain"],
    when: (a) => a.primary_location === "踝上方",
    apply: (scores) => { scores.High_Ankle_Sprain = (scores.High_Ankle_Sprain || 0) + 100; },
  },
];
