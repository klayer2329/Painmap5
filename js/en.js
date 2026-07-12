// English presentation layer. Internal answer tokens remain unchanged so the
// clinical rule tables stay compatible with the Chinese source specification.
(function () {
  const questionText = {
    mechanism:["How was your foot loaded when the injury happened?",["Inversion","Eversion","Foot planted while body rotated","Landing from a jump","Forced ankle dorsiflexion","Not sure"]],
    contact:["What happened at the time of injury?",["Body contact","Landed on another player's foot","No contact"]],
    immediate_function:["What could you do immediately after the injury?",["Continue playing","Walk but not run","Could not walk"]],
    injury_sensation:["What did you feel at the moment of injury?",["A pop or snap","Felt as if kicked","Joint caught or locked","Nothing unusual"]],
    pain_action:["Which basketball or daily movement hurts most?",["Walking","Running","Jumping","Landing","Stopping","Changing direction","Pushing off","First step in the morning","Standing still","Resting"]],
    load_change:["What changed before the pain began?",["More training volume","Higher intensity","More sessions","New shoes","New court surface","No clear change"]],
    activity_pattern:["How does pain change with activity?",["Worst at the start","Improves as I move","Gets worse as I move","No clear change"]],
    pain_pattern:["When is the pain mainly present?",["Constant","Only during exercise","Only while weight-bearing"]],
    specific_trigger:["Which movement most reliably triggers pain?",["Push-off","Dorsiflexion","Stop or change direction","None"]],
    swelling_severity:["How much swelling is present?",["None","Mild","Moderate","Severe"]],
    swelling_timing:["When did the swelling appear?",["Immediately","After several hours","The next day","It has not settled"]],
    bruising:["Is there bruising?",["Yes","No"]],
    inflammation_heat:["Is the painful area warmer than the other side?",["Yes","No"]],
    instability:["Does the ankle often feel as if it will give way?",["Yes, often","No"]],
    recurrent_sprain:["Have you repeatedly sprained this ankle?",["Yes","No"]],
    single_leg_stand:["Single-leg stand for 10 seconds",["Normal and pain-free","Painful but completed","Unable to complete","Clearly unstable"]],
    single_leg_hop:["Three gentle single-leg hops",["Normal and pain-free","Painful but completed","Unable to complete"]],
    change_direction_test:["Change direction left and right three times",["Normal and pain-free","Painful but completed","Unable to complete","Clearly unstable"]],
    push_off_test:["Explosive first step / push-off",["Normal and pain-free","Painful but completed","Unable to complete","Clearly weak"]]
  };
  [...ACUTE_QUESTIONS,...CHRONIC_QUESTIONS,...ADDITIONAL_QUESTIONS,...YESNO_QUESTIONS,...FUNCTIONAL_TESTS].forEach(q=>{
    const x=questionText[q.field]; if(!x)return; q.title=x[0];
    (q.options||[]).forEach((o,i)=>{o.label=x[1][i]||o.label; if(o.desc)o.desc="Movement description";});
    if(q.note)q.note="Stop immediately if this causes severe pain.";
  });
  REDFLAG_OPTIONS.forEach((o,i)=>o.label=["Unable to walk or bear weight","Visible deformity","Severe constant pain at rest","Pain wakes you at night","Numbness, tingling, or reduced sensation"][i]);
  STANDING_PAIN_OPTIONS.forEach((o,i)=>o.label=["No pain","Some pain","Severe pain"][i]);
  PAIN_SHAPE_OPTIONS.forEach((o,i)=>o.label=["One point","A line","A broad area"][i]);
  PAIN_DEPTH_OPTIONS.forEach((o,i)=>{o.label=["Superficial / palpable","Deep / cannot be palpated","Bone tenderness"][i];o.desc="";});
  LOCATION_CARDS.forEach((o,i)=>o.label=["Great toe","Front / dorsum","Medial ankle","Lateral ankle","Above the ankle","Achilles / heel","Sole"][i]);
  const regionNames={"外侧":"Lateral ankle","内侧":"Medial ankle","前方":"Front / dorsum","后方":"Achilles / heel","足底":"Sole","踝上方":"Above the ankle","大脚趾":"Great toe","前下":"Anteroinferior","中下":"Middle-inferior","后下":"Posteroinferior","舟骨区":"Navicular area","踝前":"Front of ankle","中足":"Midfoot","跟腱区":"Achilles area","后跟":"Heel","前足":"Forefoot","足弓":"Arch","后跟内侧":"Medial heel","踝上":"Above ankle","跖趾关节":"MTP joint","第一跖骨区":"First metatarsal"};
  Object.keys(REHAB).forEach(k=>REHAB[k]=[
    "Protect the injured area and reduce movements that reproduce pain.",
    "Maintain pain-free range of motion and use isometric muscle contractions when the joint is stable.",
    "Progress strength, balance, jumping, and sport-specific loading gradually under a qualified clinician's guidance."
  ]);
  Object.keys(SPECIAL_TESTS).forEach(k=>SPECIAL_TESTS[k]=(SPECIAL_TESTS[k]||[]).map((t,i)=>({
    name:`${i+1}. Clinical assessment for ${((ACUTE_CONDITIONS[k]||CHRONIC_CONDITIONS[k]||{}).nameEn)||"this condition"}`,
    gold:!!t.gold,
    steps:["Compare the injured side with the uninjured side.","Perform the movement slowly and stop if pain is severe.","Record whether the familiar symptoms are reproduced."],
    positive:"The familiar pain, instability, weakness, or a clear side-to-side difference is reproduced.",
    note:"Use this screening result together with clinical examination; it is not a diagnosis."
  })));
  if(typeof SPECIAL_TEST_FALLBACK!=="undefined"){
    SPECIAL_TEST_FALLBACK.name="General clinical assessment";
    SPECIAL_TEST_FALLBACK.steps=["Palpate the painful area gently.","Try the movement that normally triggers symptoms."];
    SPECIAL_TEST_FALLBACK.positive="The familiar pain is consistently reproduced.";
    SPECIAL_TEST_FALLBACK.note="Seek professional assessment if symptoms are severe or persistent.";
  }
  Object.values(ACUTE_CONDITIONS).concat(Object.values(CHRONIC_CONDITIONS)).forEach(c=>{c.nameZh=c.nameEn;});
  const phraseMap={
    "篮球运动员足踝伤病智能筛查系统":"Basketball Foot & Ankle Injury Screening System","开始筛查":"Start screening","返回":"Back","下一步":"Next",
    "红旗排查":"Safety screen","病史问卷":"Questionnaire","疼痛定位":"Pain location","功能测试":"Functional tests","结果报告":"Results",
    "是否存在以下情况？":"Do any of these warning signs apply?","可多选，如果都没有，请选择\"完全没有以上情况\"":"Select all that apply. Choose “None” if no warning sign applies.","完全没有以上情况":"None of the above",
    "先确认是否存在需要立即就医的情况":"Rate your current pain","请滑动选择当前最严重时的疼痛程度":"Move the slider to the worst current pain level.","完全不痛":"No pain","无法忍受":"Unbearable","轻微疼痛":"Mild pain","中等疼痛":"Moderate pain","严重疼痛":"Severe pain",
    "发现高风险信号":"High-risk warning sign detected","本次筛查到此结束。":"This screening has ended.","重新开始筛查":"Restart screening","重新开始":"Restart",
    "是否有明确的一次受伤事件导致疼痛开始？":"Did one clear injury event start the pain?","有 — 能明确指出受伤的那一刻（急性）":"Yes — one clear injury event (acute)","没有 — 是训练后逐渐出现的疼痛（慢性 / 劳损）":"No — pain developed gradually (overuse)",
    "点击疼痛最明显的区域":"Select the main pain region","请选择最接近疼痛位置的图片":"Choose the image that best matches the painful area.","具体是哪个位置？":"Which exact area?","大区域":"Main region","疼痛更像哪种？":"What shape best describes the pain?","最痛的位置属于哪种？":"How deep does the pain feel?",
    "加分透明度":"Score breakdown","所有有分数的伤病":"All conditions with a positive score","基础分固定由位置匹配 40% + 其他问卷特征 60% 组成；随后再叠加全局规则、紧急覆盖规则与特殊检查调整。":"Base score = 40% location match + 60% other questionnaire features. Global rules, urgent overrides, and special-test adjustments are applied afterward.","返回功能测试":"Back to functional tests","下一步：特殊检查":"Next: special tests","分":"points",
    "特殊检查":"Special tests","对可能伤病做进一步特殊检查":"Perform additional screening tests","阳性权重":"Positive weight","阴性权重":"Negative weight","阳性":"Positive","阴性":"Negative","未测试":"Not tested","怎么做":"How to perform","阳性表现":"Positive finding","阴性表现":"Negative finding","金标准":"Reference test","生成最终报告":"Generate final report",
    "初步筛查结果":"Preliminary screening results","康复 / 训练调整建议":"Rehabilitation / training guidance","支持因素":"Supporting factors","推荐特殊检查":"Recommended special tests","匹配度":"Match","仅用于初步风险筛查与自测引导，不构成正式医学诊断，不能替代医生检查或影像学检查。如有严重症状，请立即就医。":"For preliminary screening only. This is not a diagnosis and does not replace medical examination or imaging. Seek urgent care for severe symptoms."
  };
  window.translateUi=function(html){
    let out=html;
    Object.entries(regionNames).sort((a,b)=>b[0].length-a[0].length).forEach(([a,b])=>out=out.split(a).join(b));
    Object.entries(phraseMap).sort((a,b)=>b[0].length-a[0].length).forEach(([a,b])=>out=out.split(a).join(b));
    return out.replace(/[\u3400-\u9fff]+/g,"Clinical information");
  };
})();
