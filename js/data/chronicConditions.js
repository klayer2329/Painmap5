// ============================================================
// 慢性损伤评分规则
// ============================================================

const CHRONIC_CONDITIONS = {

  Peroneal_Tendinopathy: {
    nameZh: "腓骨肌腱炎", nameEn: "Peroneal Tendinopathy", category: "chronic-tendon",
    rules: [
      { points: 2, when: [{ field: "load_change", match: "训练量增加" }] },
      { points: 2, when: [{ field: "load_change", match: "训练强度增加" }] },
      { points: 2, when: [{ field: "load_change", match: "训练频率增加" }] },
      { points: 1, when: [{ field: "load_change", match: "换鞋" }] },
      { points: 1, when: [{ field: "load_change", match: "更换场地" }] },
      { points: 2, when: [{ field: "pain_action", match: "跑步" }] },
      { points: 2, when: [{ field: "pain_action", match: "变向" }] },
      { points: 2, when: [{ field: "pain_pattern", match: "持续存在" }] },
      { points: 2, when: [{ field: "standing_pain", match: "有点痛" }] },
      { points: 2, when: [{ field: "standing_pain", match: "很痛" }] },
      { points: 4, when: [{ field: "primary_location", match: "外侧" }, { field: "secondary_location", match: "后下" }] },
      { points: 2, when: [{ field: "pain_shape", match: "线" }] },
      { points: 4, when: [{ field: "pain_depth", match: "表浅" }] },
    ],
  },

  Plantar_Fasciitis: {
    nameZh: "足底筋膜炎", nameEn: "Plantar Fasciitis", category: "chronic-tendon",
    rules: [
      { points: 2, when: [{ field: "load_change", match: "训练量增加" }] },
      { points: 2, when: [{ field: "load_change", match: "训练强度增加" }] },
      { points: 2, when: [{ field: "load_change", match: "训练频率增加" }] },
      { points: 2, when: [{ field: "load_change", match: "换鞋" }] },
      { points: 2, when: [{ field: "load_change", match: "更换场地" }] },
      { points: 2, when: [{ field: "pain_action", match: "走路" }] },
      { points: 2, when: [{ field: "pain_action", match: "跑步" }] },
      { points: 4, when: [{ field: "pain_action", match: "早晨第一步" }] },
      { points: 2, when: [{ field: "standing_pain", match: "有点痛" }] },
      { points: 2, when: [{ field: "standing_pain", match: "很痛" }] },
      { points: 4, when: [{ field: "primary_location", match: "足底" }, { field: "secondary_location", match: "后跟内侧" }] },
      { points: 2, when: [{ field: "pain_shape", match: "点" }] },
      { points: 4, when: [{ field: "pain_depth", match: "表浅" }] },
    ],
  },

  Posterior_Tibial_Tendinopathy: {
    nameZh: "胫后肌腱炎", nameEn: "Posterior Tibial Tendinopathy", category: "chronic-tendon",
    rules: [
      { points: 2, when: [{ field: "load_change", match: "训练量增加" }] },
      { points: 2, when: [{ field: "load_change", match: "训练强度增加" }] },
      { points: 2, when: [{ field: "load_change", match: "训练频率增加" }] },
      { points: 2, when: [{ field: "pain_action", match: "走路" }] },
      { points: 2, when: [{ field: "pain_action", match: "跑步" }] },
      { points: 2, when: [{ field: "pain_pattern", match: "持续存在" }] },
      { points: 2, when: [{ field: "standing_pain", match: "有点痛" }] },
      { points: 2, when: [{ field: "standing_pain", match: "很痛" }] },
      { points: 4, when: [{ field: "primary_location", match: "内侧" }] },
      { points: 2, when: [{ field: "pain_shape", match: "线" }] },
      { points: 4, when: [{ field: "pain_depth", match: "表浅" }] },
    ],
  },

  Achilles_Tendinopathy: {
    nameZh: "跟腱炎", nameEn: "Achilles Tendinopathy", category: "chronic-tendon",
    rules: [
      { points: 4, when: [{ field: "load_change", match: "训练量增加" }] },
      { points: 4, when: [{ field: "load_change", match: "训练强度增加" }] },
      { points: 4, when: [{ field: "load_change", match: "训练频率增加" }] },
      { points: 2, when: [{ field: "pain_action", match: "跑步" }] },
      { points: 4, when: [{ field: "pain_action", match: "蹬地" }] },
      { points: 3, when: [{ field: "pain_action", match: "早晨第一步" }] },
      { points: 2, when: [{ field: "pain_pattern", match: "持续存在" }] },
      { points: 2, when: [{ field: "standing_pain", match: "有点痛" }] },
      { points: 2, when: [{ field: "standing_pain", match: "很痛" }] },
      { points: 4, when: [{ field: "primary_location", match: "后方" }, { field: "secondary_location", match: "跟腱区" }] },
      { points: 2, when: [{ field: "pain_shape", match: "线" }] },
      { points: 4, when: [{ field: "pain_depth", match: "表浅" }] },
    ],
  },

  Ankle_Osteoarthritis: {
    nameZh: "足踝关节炎", nameEn: "Ankle Osteoarthritis", category: "chronic-joint",
    rules: [
      { points: 2, when: [{ field: "load_change", match: "无变化" }] },
      { points: 2, when: [{ field: "pain_action", match: "走路" }] },
      { points: 2, when: [{ field: "pain_pattern", match: "持续存在" }] },
      { points: 4, when: [{ field: "standing_pain", match: "很痛" }] },
      { points: 2, when: [{ field: "pain_action", match: "早晨第一步" }] },
      { points: 3, when: [{ field: "primary_location", match: "踝上方" }] },
      { points: 2, when: [{ field: "pain_shape", match: "片" }] },
      { points: 2, when: [{ field: "pain_depth", match: "深层" }] },
    ],
  },

  Stress_Fracture: {
    nameZh: "应力性骨折", nameEn: "Stress Fracture", category: "chronic-fracture",
    rules: [
      { points: 4, when: [{ field: "load_change", match: "训练量增加" }] },
      { points: 4, when: [{ field: "load_change", match: "训练强度增加" }] },
      { points: 4, when: [{ field: "load_change", match: "训练频率增加" }] },
      { points: 2, when: [{ field: "pain_action", match: "跑步" }] },
      { points: 2, when: [{ field: "pain_action", match: "起跳" }] },
      { points: 2, when: [{ field: "pain_pattern", match: "持续存在" }] },
      { points: 4, when: [{ field: "standing_pain", match: "很痛" }] },
      { points: 4, when: [{ field: "primary_location", match: "前方" }, { field: "secondary_location", match: "中足" }] },
      { points: 4, when: [{ field: "pain_shape", match: "点" }] },
      { points: 4, when: [{ field: "pain_depth", match: "骨头" }] },
    ],
  },

  Severs_Disease: {
    nameZh: "跟骨骨骺炎 (Sever's 病)", nameEn: "Sever's Disease", category: "chronic-bone",
    rules: [
      { points: 2, when: [{ field: "load_change", match: "训练量增加" }] },
      { points: 2, when: [{ field: "load_change", match: "训练强度增加" }] },
      { points: 2, when: [{ field: "load_change", match: "训练频率增加" }] },
      { points: 2, when: [{ field: "pain_action", match: "跑步" }] },
      { points: 2, when: [{ field: "pain_action", match: "起跳" }] },
      { points: 2, when: [{ field: "pain_action", match: "早晨第一步" }] },
      { points: 4, when: [{ field: "primary_location", match: "后方" }, { field: "secondary_location", match: "后跟" }] },
      { points: 2, when: [{ field: "pain_shape", match: "片" }] },
      { points: 4, when: [{ field: "pain_depth", match: "骨头" }] },
    ],
  },

  Sesamoiditis: {
    nameZh: "籽骨炎", nameEn: "Sesamoiditis", category: "chronic-bone",
    rules: [
      { points: 2, when: [{ field: "load_change", match: "训练量增加" }] },
      { points: 2, when: [{ field: "load_change", match: "训练强度增加" }] },
      { points: 2, when: [{ field: "load_change", match: "训练频率增加" }] },
      { points: 2, when: [{ field: "load_change", match: "换鞋" }] },
      { points: 4, when: [{ field: "pain_action", match: "蹬地" }] },
      { points: 2, when: [{ field: "pain_action", match: "走路" }] },
      { points: 1, when: [{ field: "pain_action", match: "早晨第一步" }] },
      { points: 4, when: [{ field: "primary_location", match: "大脚趾" }] },
      { points: 4, when: [{ field: "primary_location", match: "足底" }, { field: "secondary_location", match: "前足" }] },
      { points: 2, when: [{ field: "pain_shape", match: "点" }] },
      { points: 4, when: [{ field: "pain_depth", match: "骨头" }] },
    ],
  },

  Tarsal_Coalition: {
    nameZh: "跗骨联合", nameEn: "Tarsal Coalition", category: "chronic-bone",
    rules: [
      { points: 2, when: [{ field: "load_change", match: "无变化" }] },
      { points: 2, when: [{ field: "pain_action", match: "跑步" }] },
      { points: 2, when: [{ field: "pain_action", match: "变向" }] },
      { points: 3, when: [{ field: "primary_location", match: "后方" }] },
      { points: 2, when: [{ field: "pain_shape", match: "片" }] },
      { points: 4, when: [{ field: "pain_depth", match: "骨头" }] },
    ],
  },

  Mortons_Neuroma: {
    nameZh: "Morton 神经瘤", nameEn: "Morton's Neuroma", category: "chronic-nerve",
    rules: [
      { points: 4, when: [{ field: "load_change", match: "换鞋" }] },
      { points: 2, when: [{ field: "pain_action", match: "走路" }] },
      { points: 2, when: [{ field: "pain_action", match: "跑步" }] },
      { points: 4, when: [{ field: "primary_location", match: "足底" }, { field: "secondary_location", match: "前足" }] },
      { points: 2, when: [{ field: "pain_depth", match: "深层" }] },
    ],
  },

  CECS: {
    nameZh: "慢性运动性筋膜室综合征", nameEn: "CECS", category: "chronic-other",
    rules: [
      { points: 4, when: [{ field: "load_change", match: "训练量增加" }] },
      { points: 4, when: [{ field: "load_change", match: "训练强度增加" }] },
      { points: 4, when: [{ field: "load_change", match: "训练频率增加" }] },
      { points: 4, when: [{ field: "pain_action", match: "跑步" }] },
      { points: 2, when: [{ field: "pain_shape", match: "片" }] },
      { points: 2, when: [{ field: "pain_depth", match: "深层" }] },
    ],
  },

  OLT: {
    nameZh: "距骨骨软骨损伤 (OLT)", nameEn: "Osteochondral Lesion of Talus", category: "chronic-joint",
    rules: [
      { points: 1, when: [{ field: "load_change", match: "训练量增加" }] },
      { points: 1, when: [{ field: "load_change", match: "训练强度增加" }] },
      { points: 1, when: [{ field: "load_change", match: "训练频率增加" }] },
      { points: 2, when: [{ field: "pain_action", match: "起跳" }] },
      { points: 2, when: [{ field: "pain_action", match: "变向" }] },
      { points: 4, when: [{ field: "primary_location", match: "踝上方" }] },
      { points: 2, when: [{ field: "pain_shape", match: "片" }] },
      { points: 4, when: [{ field: "pain_depth", match: "深层" }] },
    ],
  },

  Cartilage_Injury: {
    nameZh: "关节软骨损伤", nameEn: "Cartilage Injury", category: "chronic-joint",
    rules: [
      { points: 1, when: [{ field: "load_change", match: "训练量增加" }] },
      { points: 1, when: [{ field: "load_change", match: "训练强度增加" }] },
      { points: 1, when: [{ field: "load_change", match: "训练频率增加" }] },
      { points: 2, when: [{ field: "pain_action", match: "走路" }] },
      { points: 2, when: [{ field: "pain_action", match: "起跳" }] },
      { points: 2, when: [{ field: "pain_action", match: "落地" }] },
      { points: 1, when: [{ field: "pain_pattern", match: "持续存在" }] },
      { points: 3, when: [{ field: "primary_location", match: "踝上方" }] },
      { points: 2, when: [{ field: "pain_shape", match: "片" }] },
      { points: 3, when: [{ field: "pain_depth", match: "深层" }] },
    ],
  },

  Accessory_Navicular: {
    nameZh: "副舟骨综合征", nameEn: "Accessory Navicular Syndrome", category: "chronic-bone",
    rules: [
      { points: 2, when: [{ field: "load_change", match: "训练量增加" }] },
      { points: 2, when: [{ field: "load_change", match: "训练强度增加" }] },
      { points: 2, when: [{ field: "load_change", match: "训练频率增加" }] },
      { points: 2, when: [{ field: "pain_action", match: "走路" }] },
      { points: 2, when: [{ field: "pain_action", match: "跑步" }] },
      { points: 1, when: [{ field: "pain_action", match: "早晨第一步" }] },
      { points: 4, when: [{ field: "primary_location", match: "内侧" }, { field: "secondary_location", match: "舟骨区" }] },
      { points: 2, when: [{ field: "pain_shape", match: "点" }] },
      { points: 4, when: [{ field: "pain_depth", match: "骨头" }] },
    ],
  },

  Ankle_Impingement: {
    nameZh: "踝关节撞击综合征", nameEn: "Ankle Impingement", category: "chronic-joint",
    rules: [
      { points: 2, when: [{ field: "load_change", match: "训练量增加" }] },
      { points: 2, when: [{ field: "load_change", match: "训练强度增加" }] },
      { points: 2, when: [{ field: "load_change", match: "训练频率增加" }] },
      { points: 4, when: [{ field: "primary_location", match: "前方" }, { field: "secondary_location", match: "踝前" }] },
      { points: 2, when: [{ field: "pain_shape", match: "片" }] },
      { points: 3, when: [{ field: "pain_depth", match: "表浅" }] },
    ],
  },
};
