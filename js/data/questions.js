// ============================================================
// 篮球足踝筛查 — 问题与选项数据
// ============================================================

const REDFLAG_OPTIONS = [
  { id: "unable_to_weight_bear", label: "无法走路或负重" },
  { id: "deformity",             label: "明显畸形" },
  { id: "severe_rest_pain",      label: "持续剧烈静息痛" },
  { id: "night_pain",            label: "夜间痛醒" },
  { id: "neurological_symptoms", label: "麻木 / 刺痛 / 感觉减退" },
];

// -------------------- ACUTE QUESTIONNAIRE --------------------
const ACUTE_QUESTIONS = [
  {
    field: "mechanism",
    title: "受伤时脚是怎么受力的？",
    options: [
      { v: "内翻",     label: "内翻",     desc: "脚底朝内翻过去" },
      { v: "外翻",     label: "外翻",     desc: "脚底朝外翻过去" },
      { v: "旋转",     label: "脚被固定身体旋转" },
      { v: "跳落地",   label: "跳起后落地" },
      { v: "背屈",     label: "踝关节过度背屈", desc: "脚尖被迫向上掰" },
      { v: "不确定",   label: "不确定" },
    ],
  },
  {
    field: "contact",
    title: "受伤时发生了什么？",
    options: [
      { v: "对抗",   label: "有身体对抗" },
      { v: "垫脚",   label: "被别人垫脚" },
      { v: "无接触", label: "没有接触" },
    ],
  },
  {
    field: "immediate_function",
    title: "受伤后立刻能做到什么？",
    options: [
      { v: "继续打球",   label: "继续打球" },
      { v: "能走不能跑", label: "能走但不能跑" },
      { v: "完全不能走", label: "完全不能走" },
    ],
  },
  {
    field: "injury_sensation",
    title: "受伤瞬间有什么感觉？",
    options: [
      { v: "啪",     label: "听到或感觉到\u201c啪\u201d的一声" },
      { v: "被踢",   label: "感觉像被踢了一下" },
      { v: "卡住",   label: "感觉关节卡了一下" },
      { v: "无特殊", label: "没有特别感觉" },
    ],
  },
  {
    field: "pain_action",
    title: "现在什么篮球动作最痛？",
    options: [
      { v: "走路",     label: "慢走" },
      { v: "跑步",     label: "慢跑" },
      { v: "起跳",     label: "起跳" },
      { v: "落地",     label: "落地" },
      { v: "变向",     label: "急停" },
      { v: "变向",     label: "变向" },
      { v: "蹬地",     label: "启动蹬地" },
      { v: "早晨第一步", label: "早晨第一步" },
      { v: "站立",     label: "站着不动" },
      { v: "静止休息", label: "静止休息" },
    ],
  },
];

// -------------------- CHRONIC QUESTIONNAIRE --------------------
const CHRONIC_QUESTIONS = [
  {
    field: "load_change",
    title: "疼痛开始前是否发生以下变化？",
    multi: true,
    options: [
      { v: "训练量增加",   label: "训练量增加" },
      { v: "训练强度增加", label: "训练强度增加" },
      { v: "训练频率增加", label: "训练频率增加" },
      { v: "换鞋",         label: "换了新鞋" },
      { v: "更换场地",     label: "更换球场地面" },
      { v: "无变化",       label: "没有明显变化" },
    ],
  },
  {
    field: "pain_action",
    title: "什么篮球 / 日常动作最痛？",
    options: [
      { v: "走路",       label: "走路" },
      { v: "跑步",       label: "跑步" },
      { v: "起跳",       label: "起跳" },
      { v: "落地",       label: "落地" },
      { v: "变向",       label: "急停" },
      { v: "变向",       label: "变向" },
      { v: "蹬地",       label: "启动蹬地" },
      { v: "站立",       label: "站立" },
      { v: "早晨第一步", label: "早晨第一步" },
      { v: "静止休息",   label: "静止休息" },
    ],
  },
];

const STANDING_PAIN_OPTIONS = [
  { v: "不痛",   label: "不痛" },
  { v: "有点痛", label: "有点痛" },
  { v: "很痛",   label: "很痛" },
];

// -------------------- ADDITIONAL SYMPTOM MODULE --------------------
const ADDITIONAL_QUESTIONS = [
  {
    field: "activity_pattern",
    title: "活动后疼痛如何变化？",
    options: [
      { v: "开始最痛", label: "开始活动最痛" },
      { v: "越动越好", label: "越动越好" },
      { v: "越动越痛", label: "越动越痛" },
      { v: "无变化",   label: "无明显变化" },
    ],
  },
  {
    field: "pain_pattern",
    title: "疼痛主要在什么时候出现？",
    options: [
      { v: "持续存在", label: "持续存在" },
      { v: "只有运动", label: "只有运动时" },
      { v: "只有负重", label: "只有负重时" },
    ],
  },
  {
    field: "specific_trigger",
    title: "有没有某个动作特别容易诱发疼痛？",
    options: [
      { v: "蹬地",   label: "启动蹬地", desc: "突破蹬地 / 上篮最后一步 / 起跳发力" },
      { v: "背屈",   label: "背屈", desc: "深蹲、防守姿势、膝盖向前顶脚尖" },
      { v: "变向",   label: "急停变向", desc: "急停 / 变向 / Cross Over / Euro Step" },
      { v: "无",     label: "没有" },
    ],
  },
  {
    field: "swelling_severity",
    title: "肿胀程度",
    options: [
      { v: "无",   label: "没有" },
      { v: "轻度", label: "轻度" },
      { v: "中度", label: "中度" },
      { v: "重度", label: "重度" },
    ],
  },
  {
    field: "swelling_timing",
    title: "肿胀什么时候出现？",
    skipIf: (a) => a.swelling_severity === "无",
    options: [
      { v: "立刻",   label: "立刻出现" },
      { v: "数小时", label: "几小时后" },
      { v: "第二天", label: "第二天明显" },
      { v: "持续",   label: "一直消不下去" },
    ],
  },
];

const YESNO_QUESTIONS = [
  {
    field: "bruising",
    title: "瘀青程度",
    onlyFor: "acute",
    options: [
      { v:"无", label:"没有" },
      { v:"轻度", label:"轻度" },
      { v:"中度", label:"中度" },
      { v:"重度", label:"重度" },
    ],
  },
  {
    field: "inflammation_heat",
    title: "疼痛区域是否明显发热、比另一侧更热？",
    options: [ { v:"是", label:"是" }, { v:"否", label:"否" } ],
  },
  {
    field: "instability",
    title: "是否经常感觉要崴脚、脚会突然软一下、不敢发力？",
    options: [ { v:"是", label:"经常有这种感觉" }, { v:"否", label:"没有" } ],
  },
  {
    field: "recurrent_sprain",
    title: "过去是否反复崴脚？",
    onlyFor: "acute",
    options: [ { v:"是", label:"是，反复崴脚" }, { v:"否", label:"没有" } ],
  },
];

// -------------------- FUNCTIONAL TEST MODULE --------------------
const FUNCTIONAL_TESTS = [
  {
    field: "single_leg_stand",
    title: "单脚站立 10 秒",
    note: "如果动作导致剧烈疼痛，请立即停止测试",
    options: [
      { v: "正常",   label: "正常完成，不痛" },
      { v: "疼痛完成", label: "有疼痛，但能完成" },
      { v: "无法完成", label: "无法完成" },
      { v: "不稳",   label: "感觉明显不稳" },
    ],
  },
  {
    field: "single_leg_hop",
    title: "单脚连续轻跳 3 次",
    options: [
      { v: "正常",     label: "正常完成，不痛" },
      { v: "疼痛完成", label: "有疼痛，但能完成" },
      { v: "无法完成", label: "无法完成" },
    ],
  },
  {
    field: "change_direction_test",
    title: "向左 / 向右变向，各 3 次",
    options: [
      { v: "正常",     label: "正常完成，不痛" },
      { v: "疼痛完成", label: "有疼痛，但能完成" },
      { v: "无法完成", label: "无法完成" },
      { v: "不稳",     label: "感觉明显不稳" },
    ],
  },
  {
    field: "push_off_test",
    title: "原地启动第一步（蹬地）",
    options: [
      { v: "正常",     label: "正常完成，不痛" },
      { v: "疼痛完成", label: "有疼痛，但能完成" },
      { v: "无法完成", label: "无法完成" },
      { v: "明显无力", label: "明显无力" },
    ],
  },
];

// -------------------- PAIN MAP --------------------
// 主要区域 → 次级区域
const PAIN_MAP_REGIONS = {
  "外侧":     ["前下", "中下", "后下"],
  "内侧":     ["前下", "中下", "后下", "舟骨区"],
  "前方":     ["踝前", "中足"],
  "后方":     ["跟腱区", "后跟"],
  "足底":     ["前足", "中足", "足弓", "后跟内侧"],
  "外侧足部": ["第五跖骨基底", "外侧中足"],
  "踝关节":   ["内侧关节线", "关节深层", "外侧关节线"],
  "踝上方":   ["踝上"],
  "大脚趾":   ["跖趾关节", "第一跖骨区"],
};

const PAIN_SHAPE_OPTIONS = [
  { v: "点",   label: "一个点" },
  { v: "线",   label: "一条线" },
  { v: "片",   label: "一片区域" },
];

const PAIN_DEPTH_OPTIONS = [
  { v: "表浅", label: "能摸到" },
  { v: "深层", label: "摸不到（感觉在里面）" },
  { v: "骨头", label: "骨头", desc: "按骨头最痛" },
];
