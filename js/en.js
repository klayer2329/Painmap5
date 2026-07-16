// English presentation layer. Internal answer tokens remain unchanged so the
// clinical rule tables stay compatible with the Chinese source specification.
(function () {
  if (window.HOOPFOOT_LANG === "zh") {
    const zhPhraseMap = {
      "Basketball Foot &amp; Ankle Screening":"篮球足踝伤病筛查",
      "Basketball Foot &amp; Ankle Injury Screening System":"篮球足踝伤病筛查系统",
      "A preliminary risk-screening tool for basketball athletes ages 12–18 with foot or ankle pain, sprains, landing injuries, running or jumping pain, or gradual training-related symptoms.":"面向12–18岁篮球运动员的足踝伤病初步风险筛查工具，适用于足踝疼痛、扭伤、落地受伤、跑跳疼痛或逐渐出现的训练相关症状。",
      "What this tool can do":"本工具可以",
      "Screen injury risk and rank possible conditions":"筛查伤病风险并排列可能伤病",
      "Guide simple functional screening tests":"指导完成简单的功能筛查测试",
      "Help identify when prompt medical assessment is appropriate":"帮助判断何时应尽快接受医疗评估",
      "What this tool cannot do":"本工具不能",
      "Provide a formal medical diagnosis":"提供正式医学诊断",
      "Replace an examination by a qualified clinician":"代替专业医务人员的检查",
      "Replace imaging such as X-ray, MRI, or CT":"代替X光、MRI或CT等影像学检查",
      "Anonymous research data":"匿名研究数据",
      "With permission, this screening will anonymously save every answer, pain location, functional and special-test selection, calculated score, and final ranking. No name, email, phone number, or account is collected.":"经你同意后，本筛查会匿名保存所有答案、疼痛位置、功能与特殊检查选择、计算分数和最终排序。不会收集姓名、邮箱、电话号码或账户信息。",
      "I agree to anonymous storage of this screening and its results.":"我同意匿名保存本次筛查及其结果。",
      "What is stored?":"会保存什么？",
      "Question choices, pain-map selections, test findings, scores, result ranking, anonymous browser ID, and completion time. You can continue without saving.":"问题选项、疼痛位置、检查结果、分数、结果排序、匿名浏览器编号和完成时间。你也可以选择不保存并继续。",
      "Continue without saving":"不保存并继续",
      "Start and save anonymously":"开始并匿名保存",
      "For example, an ankle roll, awkward landing, or landing on another player's foot where you can identify the exact moment symptoms began. If you are unsure, both acute and overuse conditions will remain eligible.":"例如崴脚、落地不稳或踩到他人脚上，并且能够指出症状开始的准确时刻。如果不确定，系统会同时保留急性与劳损类候选伤病。",
      "Acute questionnaire":"急性伤病问卷",
      "Overuse questionnaire":"慢性／劳损问卷",
      "Onset-uncertain questionnaire":"起病方式不确定问卷",
      "Select all that apply":"可多选",
      "Basketball functional test":"篮球功能测试",
      "Stop immediately if this causes severe pain.":"如果动作引起剧烈疼痛，请立即停止。",
      "Score breakdown":"评分明细",
      "No candidate earned a positive feature score":"没有候选伤病获得有效特征分",
      "Selected location:":"所选位置：",
      "The broad pain region matched the library, but the exact location and the remaining questionnaire features did not add points to those candidates. The system will not invent an unrelated result.":"主要疼痛区域与伤病库匹配，但具体位置和其他问卷特征没有为候选伤病增加分数。系统不会生成无关结果。",
      "No condition in the current library uses this broad pain region. The first location selection is a hard filter, so unrelated conditions were removed.":"当前伤病库中没有伤病使用这个主要疼痛区域。第一次位置选择属于硬筛选，因此无关伤病已被排除。",
      "If the marker was inaccurate, choose the location again. If the location is accurate and symptoms persist, arrange a sports-medicine or foot-and-ankle assessment.":"如果标记位置不准确，请重新选择。如果位置准确但症状持续，请接受运动医学或足踝专科评估。",
      "Back to functional tests":"返回功能测试",
      "Change pain location":"修改疼痛位置",
      "Conditions with a positive score":"获得有效分数的伤病",
      "The first, broad pain region is a hard filter. The second, exact location does not remove a condition; it determines the 40-point location component. Other questionnaire features contribute the remaining 60 points.":"第一次选择的主要疼痛区域是硬筛选。第二次具体位置不会排除伤病，而是决定40分的位置部分；其他问卷特征贡献剩余60分。",
      "Combined scoring factors":"综合评分因素",
      "Next: special tests":"下一步：特殊检查",
      "Special tests":"特殊检查",
      "Perform additional screening tests":"完成进一步筛查测试",
      "If safe and practical, complete these tests with a clinician or qualified trainer. Record positive or negative findings to refine the ranking. You may leave every test untested.":"在安全且可行的情况下，请在医务人员或合格教练指导下完成这些检查。记录阳性或阴性结果可用于微调排序，也可以全部选择未测试。",
      "How test findings affect the score":"检查结果如何影响分数",
      "A positive finding makes a small adjustment (+10%); a negative finding makes a smaller adjustment (−5%). Scores remain capped at 100. These screens refine the ranking but cannot diagnose or rule out a condition.":"阳性结果使分数小幅上调（+10%）；阴性结果使分数小幅下调（−5%）。最高仍为100分。这些检查只能微调排序，不能确诊或排除伤病。",
      "Ranked candidate · base feature score":"排序候选 · 基础特征分",
      "Reference test":"参考检查",
      "How to perform":"如何操作",
      "Positive finding":"阳性表现",
      "Negative finding":"阴性表现",
      "The familiar symptoms are not reproduced and there is no meaningful difference from the uninjured side.":"没有诱发熟悉症状，与健侧相比也没有明显差异。",
      "Positive":"阳性",
      "Negative":"阴性",
      "Not tested":"未测试",
      "Generate final report":"生成最终报告",
      "Screening report · Final Report":"筛查报告 · 最终结果",
      "The score is an absolute questionnaire feature score: 40 points for the selected pain location and 60 points for other compatible features. It is not a probability or diagnosis.":"该分数是问卷特征绝对分：所选疼痛位置占40分，其他匹配特征占60分。它不是概率，也不是诊断。",
      "Selected pain location":"所选疼痛位置",
      "Feature score":"特征分",
      "Ranked #":"排序第",
      "Supporting factors":"支持因素",
      "Suggested clinical tests":"建议临床检查",
      "General clinical examination":"一般临床检查",
      "Rehabilitation / training guidance":"康复／训练调整建议",
      "When the joint is stable and movement has been medically cleared, pain-free muscle contractions can help reduce swelling.":"在关节稳定且经过医疗评估允许活动的情况下，无痛肌肉收缩有助于减轻肿胀。",
      "Conditions excluded because the pain location did not match":"因疼痛位置不匹配而排除的伤病",
      "None":"无",
      "Seek prompt medical assessment":"尽快接受医疗评估",
      "Next steps":"下一步建议",
      "Restart screening":"重新开始筛查",
      "Print / save report":"打印／保存报告",
      "points":"分",
      "Back":"返回",
      "Next":"下一步"
    };
    window.translateUi = function (html) {
      let out = html;
      Object.entries(zhPhraseMap).sort((a, b) => b[0].length - a[0].length).forEach(([english, chinese]) => {
        out = out.split(english).join(chinese);
      });
      return out;
    };
    window.translateFactorDesc = function (desc) { return desc || "匹配的评分因素"; };
    return;
  }

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
    bruising:["How much bruising is present?",["None","Mild","Moderate","Severe"]],
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
  const locationLabels={"大脚趾":"Great toe","前方":"Front / dorsum","内侧":"Medial ankle","外侧":"Lateral ankle","外侧足部":"Lateral foot","踝关节":"Deep ankle joint","踝上方":"Above the ankle","后方":"Achilles / heel","足底":"Sole"};
  LOCATION_CARDS.forEach((o)=>{o.label=locationLabels[o.region]||o.label;});
  const regionNames={"外侧足部":"Lateral foot","第五跖骨基底":"Base of fifth metatarsal","外侧中足":"Lateral midfoot","踝关节":"Deep ankle joint","内侧关节线":"Medial joint line","关节深层":"Central deep joint","外侧关节线":"Lateral joint line","外侧":"Lateral ankle","内侧":"Medial ankle","前方":"Front / dorsum","后方":"Achilles / heel","足底":"Sole","踝上方":"Above the ankle","大脚趾":"Great toe","前下":"Anteroinferior","中下":"Middle-inferior","后下":"Posteroinferior","舟骨区":"Navicular area","踝前":"Front of ankle","中足":"Midfoot","跟腱区":"Achilles area","后跟":"Heel","前足":"Forefoot","足弓":"Arch","后跟内侧":"Medial heel","踝上":"Above ankle","跖趾关节":"MTP joint","第一跖骨区":"First metatarsal"};
  Object.assign(REHAB,{
    Plantar_Fasciitis:["Reduce prolonged standing and barefoot walking on hard surfaces. Wear arch-support insoles daily.","Complete towel stretches and short-foot intrinsic-muscle training for 3 sets per day. Use night splints to maintain fascia stretch overnight.","Progress to eccentric heel-raise training; avoid frequent hill climbing and skipping."],
    Achilles_Tendinopathy:["Minimize tiptoeing and downhill walking; wear slight heel lifts for load reduction.","Follow the standard Alfredson eccentric heel-raise protocol and stretch the calves before and after activity.","Avoid repeated corticosteroid injections around the tendon."],
    Achilles_Tear:["For a complete tear, use non-weight-bearing immobilization in a walking boot during the acute phase as directed by a clinician.","Do not load or stretch the tendon until medically assessed and cleared.","Follow the clinician-directed progression from protected motion to strength and return-to-sport training."],
    Posterior_Tibial_Tendinopathy:["Wear custom arch orthotics, especially for flat-footed individuals.","Limit single-leg standing and excessive eversion. Strengthen the tibialis posterior and gluteus medius.","Add resisted inversion training later in recovery; avoid long-distance loaded walking."],
    Peroneal_Tendinopathy:["Wear a rigid ankle brace during sports to restrict excessive inversion.","Avoid repeated ankle-sprain movements. Prioritize resisted eversion and balance-pad proprioception training.","Choose shoes with firm lateral support; avoid shallow slip-on footwear."],
    Sesamoiditis:["Switch to athletic shoes with forefoot cushioning and add metatarsal pads to disperse forefoot pressure.","Minimize sprinting, jumping, prolonged tiptoe weight bearing, and other high-impact forefoot loading."],
    Severs_Disease:["Reduce high-volume jumping and running for adolescents and add heel-cushion insoles.","Perform gentle calf stretches daily. Pause intense track, dance, and cross-country training during flare-ups."],
    Accessory_Navicular:["Use medial arch orthotics to unload the navicular tuberosity.","Reduce single-leg standing and eversion movements. Strengthen the posterior tibial muscle.","Avoid narrow footwear that compresses the inner midfoot; apply ice for acute medial swelling."],
    Calcaneal_Fracture:["Use full non-weight-bearing walking-boot immobilization during early recovery as prescribed.","Perform non-weight-bearing ankle mobility exercises while immobilized when medically cleared.","Use heel-cushion inserts long term; avoid high-impact landing and hard-surface long-distance running."],
    Jones_Fracture:["Expect prolonged restricted weight bearing because the fracture site has relatively poor blood supply.","Avoid inversion cutting and jumping until full radiographic union.","Strengthen the peroneal muscles to distribute lateral-foot load; follow the 10% weekly training-volume rule after clearance."],
    Lateral_Malleolus_Fracture:["Use compression bandaging and limb elevation for acute swelling control when advised.","Maintain quadriceps and toe isometric contractions during immobilization.","After cast removal, gradually restore range of motion, balance, and proprioception; wear supportive braces during return to sport."],
    Medial_Malleolus_Fracture:["Use compression bandaging and limb elevation for acute swelling control when advised.","Maintain quadriceps and toe isometric contractions during immobilization.","After cast removal, gradually restore range of motion, balance, and proprioception; wear supportive braces during return to sport."],
    Stress_Fracture:["Immediately stop all high-impact running and jumping. Replace training with swimming or stationary cycling.","Avoid continuous unilateral weight bearing. Maintain calcium and vitamin D intake as advised by a clinician.","Resume competitive sport only after clinical and radiological confirmation of complete bone healing."],
    ATFL:["Control swelling and protect the ankle acutely. Prioritize peroneal strengthening and single-leg balance training.","Wear a rigid ankle brace for cutting sports for 3 months after injury.","Avoid uneven ground and frequent direction changes early in recovery."],
    CFL_PTFL:["Control swelling and protect the ankle acutely. Prioritize peroneal strengthening and single-leg balance training.","Wear a rigid ankle brace for cutting sports for 3 months after injury.","Avoid uneven ground and frequent direction changes early in recovery."],
    Deltoid:["Limit weight-bearing eversion and use medial arch orthotics.","Strengthen the posterior tibialis and medial ankle stabilizers.","Reduce downhill walking that forces ankle eversion."],
    High_Ankle_Sprain:["Restrict deep squatting and ankle external rotation during rehabilitation. Use a brace that stabilizes the tibiofibular joint.","Recovery commonly takes longer than a standard lateral sprain; return to low-intensity activity more slowly."],
    Lisfranc:["Use rigid foot-orthosis immobilization acutely to limit forefoot loading.","Wear stiff-soled shoes long term after healing.","Avoid explosive sprinting and abrupt forefoot weight shifts until cleared."],
    Turf_Toe:["Use rigid forefoot plates inside shoes to limit excessive great-toe dorsiflexion.","Reduce sprinting, jumping, and push-off loads.","Complete gentle first-MTP flexion and extension stretches daily when medically cleared."],
    OLT:["Eliminate high-impact running and repetitive rotational landing movements long term.","Replace impact training with swimming and cycling. Strengthen the full ankle-stabilizer system to reduce joint compression.","Avoid deep squats and rotational movements during painful flare-ups."],
    Cartilage_Injury:["Eliminate high-impact running and repetitive rotational landing movements during recovery.","Replace impact training with swimming and cycling. Strengthen the ankle stabilizers to reduce joint compression.","Avoid deep squats and rotational movements during painful flare-ups."],
    Ankle_Impingement:["For anterior impingement, minimize deep squatting and extreme dorsiflexion; progress pain-free dorsiflexion mobility slowly.","For posterior impingement, reduce sustained tiptoeing and maximal plantarflexion; choose low-heel footwear without rearfoot compression.","Avoid sports or drills that repeatedly force the painful end range during flare-ups."],
    Ankle_Osteoarthritis:["Prioritize low-impact aerobic exercise such as cycling and swimming. Use thick, cushioned footwear to lower joint compression.","Perform full pain-free ankle range-of-motion exercises daily.","Manage body weight to reduce chronic ankle load."],
    Tarsal_Coalition:["Use supportive midfoot orthotics to limit abnormal midfoot motion.","Reduce repetitive running and inversion cutting. Pause competitive sport during pain flares.","Maintain foot and ankle strength with pain-free exercises."],
    Mortons_Neuroma:["Wear wide-toe-box footwear and avoid narrow, pointed shoes. Add metatarsal decompression pads.","Reduce prolonged standing and long-distance running.","Avoid high-impact forefoot jumping."]
  });
  const test=(name,steps,positive,note,gold=false,negative="")=>({name,steps,positive,note,gold,negative});
  const stopNote="Stop if pain is sharp or severe. A positive screen is not a diagnosis; confirm with a qualified clinician.";
  Object.assign(SPECIAL_TESTS,{
    Plantar_Fasciitis:[test("Windlass Test",["Sit with the foot supported and relaxed.","Hold the great toe and slowly lift it upward into dorsiflexion.","Hold for about 5 seconds and compare with the other foot."],"The athlete's familiar sharp pain is reproduced at the medial plantar heel or along the plantar fascia.","A commonly used provocation test for plantar-fascia pain. "+stopNote,true)],
    Achilles_Tendinopathy:[test("Single-Leg Heel-Raise Test",["Stand beside a wall or rail for balance.","Rise slowly onto the toes of the symptomatic leg, then lower with control.","Compare height, pain, and repetitions with the other side."],"Achilles pain is reproduced, heel-rise height is clearly reduced, or the athlete cannot complete the movement with control.",stopNote)],
    Achilles_Tear:[test("Thompson Calf-Squeeze Test",["Lie face down with both feet hanging freely beyond the edge of a bed, or kneel on a padded chair with the feet unsupported.","Relax the calf and ankle completely.","A trained helper firmly squeezes the middle of the calf while watching for downward movement of the foot; compare both sides."],"The affected foot shows little or no plantarflexion compared with the other side. This requires urgent medical assessment for possible Achilles rupture.","Do not force the ankle or perform repeated heel raises when rupture is suspected. Seek urgent clinical evaluation.",true)],
    Peroneal_Tendinopathy:[test("Resisted Eversion Test",["Sit with the ankle in a neutral position.","Place a hand or resistance band against the outside of the forefoot.","Push the foot outward against resistance without moving the knee."],"Familiar pain is reproduced behind or below the lateral malleolus, or eversion strength is clearly reduced.",stopNote)],
    Posterior_Tibial_Tendinopathy:[test("Single-Leg Heel Raise with Arch Observation",["Stand beside a wall for balance on the symptomatic leg.","Rise slowly onto the toes while an observer watches the heel and medial arch.","Compare height and arch control with the other side."],"The athlete cannot rise fully, the heel fails to turn inward, the arch collapses, or familiar medial-ankle pain is reproduced.",stopNote)],
    Sesamoiditis:[test("Sesamoid Palpation and Great-Toe Dorsiflexion",["Sit with the foot relaxed.","Gently palpate beneath the first metatarsal head on each sesamoid.","Slowly lift the great toe upward while maintaining light pressure."],"Focal familiar pain is reproduced directly beneath the first metatarsal head, especially during great-toe dorsiflexion.",stopNote)],
    Severs_Disease:[test("Calcaneal Squeeze Test",["Sit or lie with the foot relaxed.","Place the thumb and fingers on the medial and lateral sides of the heel bone.","Gently compress the back half of the heel and compare sides."],"The athlete's familiar heel pain is reproduced by side-to-side compression of the calcaneus.",stopNote)],
    Accessory_Navicular:[test("Navicular Palpation and Resisted Inversion",["Palpate the bony prominence on the inner midfoot just above the arch.","Then hold the forefoot and ask the athlete to turn the sole inward against gentle resistance.","Compare pain and strength with the other side."],"Focal pain occurs over the navicular prominence or is reproduced by resisted inversion.",stopNote)],
    Calcaneal_Fracture:[test("Gentle Calcaneal Compression Screen",["Do not perform hopping or impact tests.","With the foot supported, gently compress the heel from both sides.","Stop immediately if marked pain occurs."],"Severe focal heel pain is reproduced with gentle compression or the athlete cannot bear weight.","Possible fracture requires prompt imaging and medical assessment; do not continue loading tests.")],
    Jones_Fracture:[test("Fifth-Metatarsal Base Palpation",["Support the foot and identify the bony prominence at the base of the fifth metatarsal.","Apply gentle pressure directly over the bone, not the surrounding soft tissue.","Compare with the other foot."],"Distinct focal bone tenderness is present at the fifth-metatarsal base, especially with difficulty bearing weight.","Suspected Jones fracture requires prompt imaging; do not perform hopping tests.")],
    Lateral_Malleolus_Fracture:[test("Lateral Malleolus Bone-Tenderness Screen",["Support the ankle without twisting it.","Gently palpate the back edge and tip of the lateral malleolus.","Ask whether four careful steps are possible only if it is safe."],"There is focal bone tenderness at the posterior edge/tip or the athlete cannot take four steps.","These findings support use of the Ottawa ankle rules and require clinical assessment and possible imaging.")],
    Medial_Malleolus_Fracture:[test("Medial Malleolus Bone-Tenderness Screen",["Support the ankle without twisting it.","Gently palpate the back edge and tip of the medial malleolus.","Ask whether four careful steps are possible only if it is safe."],"There is focal bone tenderness at the posterior edge/tip or the athlete cannot take four steps.","These findings support use of the Ottawa ankle rules and require clinical assessment and possible imaging.")],
    Stress_Fracture:[test("Focal Bone-Tenderness Screen",["Identify the most painful bony area while the foot is supported.","Apply gentle, localized pressure along the suspected bone.","Do not hop if walking is painful or a stress fracture is strongly suspected."],"A small, sharply localized area of bone tenderness reproduces the familiar pain.","Stress injuries may need imaging even when early X-rays are normal; stop impact training and seek assessment.")],
    ATFL:[test("Anterior Drawer Test",["Sit with the knee bent and the ankle relaxed in slight plantarflexion.","A trained examiner stabilizes the lower leg, cups the heel, and gently draws the heel forward.","Compare forward movement and end-feel with the other ankle."],"There is clearly increased forward translation, a softer end-feel, or familiar anterolateral pain compared with the other side.","Best performed by a clinician; guarding and acute swelling can affect the result.",true)],
    CFL_PTFL:[test("Talar Tilt Test",["Sit with the lower leg supported and the ankle relaxed.","A trained examiner stabilizes the lower leg and gently tilts the heel inward.","Compare movement, end-feel, and pain with the other side."],"Excessive inward tilt, a soft end-feel, or familiar pain below the lateral malleolus is present.","Best performed by a clinician; do not force an acutely painful ankle.")],
    Deltoid:[test("Gentle Eversion Stress Test",["Sit with the ankle relaxed and supported.","A trained examiner stabilizes the lower leg and gently turns the sole outward.","Compare medial pain and laxity with the other ankle."],"Familiar pain is reproduced below the medial malleolus or there is clearly increased eversion laxity.","Best performed by a clinician; avoid force when fracture is possible.")],
    High_Ankle_Sprain:[test("Syndesmosis Squeeze Test",["Sit or lie with the leg relaxed.","Place both hands around the middle-to-lower calf, above the painful ankle.","Gently squeeze the tibia and fibula together and release."],"Pain is reproduced lower down at the distal tibiofibular joint above the ankle rather than only where the hands squeeze.",stopNote)],
    Lisfranc:[test("Midfoot Compression / Forefoot Abduction Screen",["Support the heel and midfoot while the athlete is seated.","Gently compress the metatarsal bases from both sides.","A clinician may also gently move the forefoot outward while stabilizing the heel."],"Familiar deep midfoot pain is reproduced, especially over the first-second metatarsal base region, or plantar bruising is present.","Possible Lisfranc injury requires prompt medical assessment and weight-bearing imaging; avoid continued loading.")],
    Turf_Toe:[test("Passive Great-Toe Dorsiflexion Test",["Sit with the foot relaxed and support the first metatarsal.","Hold the great toe and slowly lift it upward.","Compare range and pain with the other side."],"Familiar pain is reproduced at the plantar side of the first MTP joint or motion is clearly limited.",stopNote)],
    OLT:[test("Loaded Ankle Rotation Screen",["Stand with support and place only comfortable weight through the symptomatic leg.","Bend the knee slightly and slowly rotate the body a small amount left and right.","Stop if the ankle catches, locks, or pain becomes sharp."],"Deep ankle pain, catching, locking, or a reproducible joint-line symptom occurs.","Osteochondral lesions require clinical examination and often MRI; do not repeat a painful test.")],
    Cartilage_Injury:[test("Joint-Line Loading and Rotation Screen",["With support, place comfortable weight through the symptomatic leg.","Slightly bend the knee and slowly rotate the body through a small range.","Note any deep pain, catching, or swelling response."],"Deep joint pain, catching, locking, or a consistent painful click is reproduced.","A positive screen warrants clinical assessment; MRI may be needed to define cartilage injury.")],
    Ankle_Impingement:[test("Weight-Bearing Dorsiflexion Lunge",["Face a wall with the symptomatic foot flat and pointing straight ahead.","Keeping the heel down, slowly move the knee toward the wall over the second toe.","Compare distance and pain with the other side."],"Familiar front-of-ankle pain or pinching is reproduced, or dorsiflexion is clearly reduced compared with the other side.",stopNote)],
    Ankle_Osteoarthritis:[test("Ankle Range-of-Motion Comparison",["Compare both ankles while seated or lying down.","Slowly move through dorsiflexion, plantarflexion, inversion, and eversion.","Record stiffness, crepitus, pain, and side-to-side range difference."],"The symptomatic ankle has marked stiffness, pain through multiple directions, or clearly reduced motion compared with the other side.","Persistent symptoms require clinical assessment and weight-bearing radiographs when indicated.")],
    Tarsal_Coalition:[test("Subtalar Inversion-Eversion Screen",["Sit with the heel supported and the ankle relaxed.","Gently move the heel inward and outward while keeping the lower leg still.","Compare subtalar motion with the other side."],"The hindfoot is unusually rigid, inversion/eversion is markedly restricted, or familiar midfoot/hindfoot pain is reproduced.","Tarsal coalition requires professional assessment and imaging for confirmation.")],
    Mortons_Neuroma:[test("Forefoot Squeeze / Mulder Screen",["Sit with the foot relaxed.","Gently squeeze the metatarsal heads together with one hand.","With the other thumb, press upward in the painful web space between the toes."],"Burning or electric pain radiates into the toes, numbness is reproduced, or a palpable click occurs.",stopNote,false,"The familiar forefoot or toe symptoms are not reproduced and no click is felt. A negative self-screen does not exclude a nerve problem.")]
  });
  SPECIAL_TEST_FALLBACK.splice(0,SPECIAL_TEST_FALLBACK.length,test("Condition-Specific Clinical Examination",["A qualified clinician should inspect, palpate, and compare both sides.","Use the athlete's symptom-provoking movement only when it is safe."],"The athlete's familiar symptoms are consistently reproduced with a finding that fits the suspected structure.",stopNote));
  Object.values(ACUTE_CONDITIONS).concat(Object.values(CHRONIC_CONDITIONS)).forEach(c=>{c.nameZh=c.nameEn;});
  const phraseMap={
    "篮球运动员足踝伤病智能筛查系统":"Basketball Foot & Ankle Injury Screening System","开始筛查":"Start screening","返回":"Back","下一步":"Next",
    "红旗排查":"Safety screen","病史问卷":"Questionnaire","疼痛定位":"Pain location","功能测试":"Functional tests","结果报告":"Results",
    "是否存在以下情况？":"Do any of these warning signs apply?","可多选，如果都没有，请选择\"完全没有以上情况\"":"Select all that apply. Choose “None” if no warning sign applies.","完全没有以上情况":"None of the above",
    "先确认是否存在需要立即就医的情况":"Rate your current pain","请滑动选择当前最严重时的疼痛程度":"Move the slider to the worst current pain level.","完全不痛":"No pain","无法忍受":"Unbearable","轻微疼痛":"Mild pain","中等疼痛":"Moderate pain","严重疼痛":"Severe pain",
    "发现高风险信号":"High-risk warning sign detected","本次筛查到此结束。":"This screening has ended.","重新开始筛查":"Restart screening","重新开始":"Restart",
    "是否有明确的一次受伤事件导致疼痛开始？":"Did one clear injury event start the pain?","有 — 能明确指出受伤的那一刻（急性）":"Yes — one clear injury event (acute)","没有 — 是训练后逐渐出现的疼痛（慢性 / 劳损）":"No — pain developed gradually (overuse)","不知道 / 不确定":"I don’t know / Not sure",
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
  const factorTerms={
    "受伤机制":"Injury mechanism","接触方式":"Contact","即刻功能":"Immediate function","受伤感觉":"Injury sensation","最痛动作":"Most painful movement","训练负荷变化":"Training-load change","站立痛":"Standing pain","疼痛区域":"Pain region","具体位置":"Exact location","疼痛形态":"Pain shape","疼痛深度":"Pain depth","疼痛时相":"Pain timing","活动后变化":"Response to activity","诱发动作":"Triggering movement","瘀青程度":"Bruising severity","轻度":"mild","中度":"moderate","重度":"severe","没有":"none",
    "内翻":"inversion","外翻":"eversion","旋转":"rotation","跳落地":"landing from a jump","背屈":"dorsiflexion","对抗":"body contact","垫脚":"landing on another foot","无接触":"no contact","继续打球":"continued playing","能走不能跑":"walked but could not run","完全不能走":"unable to walk","外侧足部":"lateral foot","踝关节":"deep ankle joint","外侧":"lateral ankle","内侧":"medial ankle","前方":"front / dorsum","后方":"Achilles / heel","足底":"sole","踝上方":"above the ankle","大脚趾":"great toe","点":"point","线":"line","片":"broad area","表浅":"superficial","深层":"deep","骨头":"bone tenderness"
  };
  window.translateFactorDesc=function(desc){
    if(!desc)return "Matched scoring factor";
    let m=desc.match(/^位置匹配 ([\d.]+\/[\d.]+).*40%/); if(m)return `Location match ${m[1]} (40% of base score)`;
    m=desc.match(/^其他问卷特征 ([\d.]+\/[\d.]+).*60%/); if(m)return `Other questionnaire features ${m[1]} (60% of base score)`;
    let out=desc;
    Object.entries(factorTerms).sort((a,b)=>b[0].length-a[0].length).forEach(([a,b])=>out=out.split(a).join(b));
    if(/[\u3400-\u9fff]/.test(out))return "Matched questionnaire or clinical scoring rule";
    return out.replace(/ 且 /g," and ").replace(/ = /g," = ");
  };
})();
