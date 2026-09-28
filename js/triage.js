// Shared safety routing for the questionnaire and admin explorer. No diagnosis.
(function (root) {
  const pair = (zh, en) => ({zh, en});
  const opt = (v, zh, en) => ({v, ...pair(zh,en)});
  const questions = [
    {field:'screening_context', ...pair('这次主要想了解什么？','What brings you here?'), options:[opt('recent','刚发生的损伤','A recent injury'),opt('ongoing','持续或反复的不适／陈旧伤目前仍有症状','Ongoing or recurring symptoms'),opt('history','回顾以前的一次伤病','Reviewing a past injury')]},
    {field:'rf_circulation', ...pair('现在是否有以下紧急情况？','Are any of these happening now?'), options:[opt('yes','脚明显发冷、发白／发青，或开放伤口伴大量出血','The foot is unusually cold, pale/blue, or there is a wound with heavy bleeding'),opt('no','没有','No'),opt('unsure','不确定是否存在这些情况','Unsure')]},
    {field:'rf_systemic', ...pair('目前是否发热／寒战，并伴足踝红、热、肿、痛？','Do you have fever or chills along with a red, hot, swollen or painful foot/ankle?'), options:[opt('yes','是','Yes'),opt('no','否','No'),opt('unsure','不确定','Unsure')]},
    {field:'rf_weight', flag:'unable_to_weight_bear', ...pair('关于不能走路／负重，具体是哪种情况？','What do you mean by difficulty bearing weight?'), options:[opt('current','现在无法负重，或不能独立走几步','Currently cannot bear weight or walk more than a few steps'),opt('painful','能走几步，但走路疼','Can walk a few steps, but it hurts'),opt('past','仅以前受伤时不能走，目前已恢复','Only at a past injury; this has resolved'),opt('unsure','不确定','Unsure')]},
    {field:'rf_shape', flag:'deformity', ...pair('形状改变是什么时候出现的？','When did the change in shape appear?'), options:[opt('new','本次受伤后新出现明显变形／角度异常','A new deformity or odd angle after this injury'),opt('longstanding','长期存在且没有新变化，例如原有扁平足','Longstanding shape, such as flat feet, without a new change'),opt('changing','最近逐渐改变或足弓继续塌陷','A recent gradual change or progressively collapsing arch'),opt('unsure','不确定是不是新出现的','Unsure whether it is new')]},
    {field:'rf_rest', flag:'severe_rest_pain', ...pair('剧烈疼痛在什么时候出现？','When does the severe pain occur?'), options:[opt('current','现在不动也持续很痛／越来越痛','Severe ongoing pain at rest now, or worsening pain'),opt('movement','目前只在活动时很痛','Severe pain with activity now'),opt('past','只是以前受伤时，目前已不再剧烈疼痛','Only during a past injury; no longer severe'),opt('unsure','不确定','Unsure')]},
    {field:'rf_night', flag:'night_pain', ...pair('夜间疼痛具体是什么情况？','What happens at night?'), options:[opt('repeated','最近反复被痛醒，或休息时仍持续痛','Recently repeatedly waking with pain, or ongoing rest pain'),opt('touch','最近翻身／碰到时会痛醒','Recently waking when turning or touching the area'),opt('past','仅以前发生，目前不再有','Only in the past; no longer happening'),opt('unsure','不确定','Unsure')]},
    {field:'rf_neuro', flag:'neurological_symptoms', ...pair('麻木、刺痛或感觉减退目前是什么情况？','What is happening with numbness, tingling or reduced sensation?'), options:[opt('new','本次受伤后新出现，目前仍有，或伴新出现的无力','New after this injury and still present, or with new weakness'),opt('persistent','目前持续／反复出现，或正在加重','Ongoing, recurring or worsening now'),opt('resolved','只短暂出现过，目前完全恢复','Was brief and has completely resolved'),opt('past','只在过去的旧伤时发生，目前没有','Only with a past injury; none now'),opt('unsure','不确定','Unsure')]},
    {field:'rf_pain_timing', highPain:true, ...pair('这个高疼痛评分指的是什么时候？','When did this high pain score occur?'), options:[opt('rest','现在静止休息也很痛','Severe pain at rest now'),opt('activity','这次不适期间活动时很痛','Severe pain during activity in this episode'),opt('past','仅过去伤病时的最高痛感，目前不再这样','Only the peak of a past injury; no longer this painful'),opt('unsure','不确定','Unsure')]}
  ];
  function active(a) {return questions.filter(q=>q.flag ? a[q.flag]===true : q.highPain ? Number(a.vas)>=8 : true);}
  function evaluate(a) {
    const immediate=[],urgent=[];
    const add=(list,zh,en)=>list.push(pair(zh,en));
    if(a.rf_circulation==='yes') add(immediate,'脚发冷／颜色异常或大量出血','Cold/discoloured foot or heavy bleeding');
    if(a.rf_circulation==='unsure') add(urgent,'无法确认血液循环或出血情况','Circulation or bleeding is uncertain');
    if(a.rf_systemic && a.rf_systemic!=='no') add(urgent,'发热／寒战伴足踝症状，或不能确认','Fever/chills with foot or ankle symptoms, or uncertainty');
    if(a.deformity && a.rf_shape!=='longstanding') add(a.rf_shape==='changing'?urgent:immediate,'新出现的形状改变，或无法确认是否为新畸形','New shape change, or uncertainty about a new deformity');
    if(a.neurological_symptoms && !['past','resolved'].includes(a.rf_neuro)) add(['new','unsure',undefined].includes(a.rf_neuro)?immediate:urgent,'目前麻木／刺痛／感觉减退或无力','Current numbness, tingling, reduced sensation or weakness');
    if(a.neurological_symptoms && a.rf_neuro==='resolved' && a.screening_context!=='history') add(urgent,'近期曾有麻木或刺痛，即使已经缓解也需评估','Recent numbness/tingling needs assessment even if it resolved');
    if(a.unable_to_weight_bear && !['past','painful'].includes(a.rf_weight)) add(urgent,'目前不能负重／走几步，或无法确认','Unable to bear weight/walk a few steps, or uncertain');
    if(a.severe_rest_pain && a.rf_rest!=='past') add(urgent,'目前剧烈疼痛或疼痛加重','Current severe or worsening pain');
    if(a.night_pain && a.rf_night!=='past') add(urgent,'目前有夜间痛醒，需要进一步评估','Current pain waking you at night needs assessment');
    if(Number(a.vas)>=8 && a.rf_pain_timing!=='past') add(urgent,'本次症状疼痛评分达到8分或以上','Pain score of 8 or more in this episode');
    return {version:'20260928',level:immediate.length?'immediate':urgent.length?'urgent':'continue',reasons:[...immediate,...urgent]};
  }
  root.PainmapTriage={questions,active,evaluate,text:(item,lang)=>item[lang==='en'?'en':'zh']};
})(globalThis);
