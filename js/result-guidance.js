(function () {
  'use strict';
  const esc = value => String(value ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const routes = [
    [/坐姿(?:屈膝)?提踵|坐姿或双脚提踵/g, 'seated/gym', '坐姿提踵'],
    [/提踵/g, 'calf/gym', '提踵'],
    [/单脚站立|单脚平衡/g, 'stand/gym', '单脚平衡'],
    [/四向点地/g, 'cross/gym', '四向点地'],
    [/冷敷/g, 'ice/emergency', '冷敷'],
    [/加压/g, 'compression/emergency', '加压'],
    [/抬高/g, 'elevation/emergency', '抬高'],
    [/弹力带(?:外翻|内翻|踝部训练)/g, 'band/gym', '弹力带训练'],
    [/足底三点支撑/g, 'tripod/gym', '三点支撑'],
    [/短足练习/g, 'short/gym', '短足练习'],
    [/脚趾分离控制/g, 'toes/gym', '脚趾控制'],
    [/大脚趾轻压地面的控制/g, 'toe-press/gym', '大脚趾压地'],
    [/足底筋膜牵伸/g, 'plantar-stretch/post', '足底牵伸'],
    [/牵伸小腿/g, 'calf-stretch/post', '小腿牵伸'],
    [/Pogo Jump/g, 'pogo/gym', '小幅弹跳'],
    [/落地|侧向移动|变向|减速练习/g, 'landing-control/gym', '落地与变向']
  ];
  const careLink = (route, label) => `<a class="guidance-link" href="care.html#action/${route}" target="_blank" rel="noopener">${esc(label)} ↗</a>`;
  function tutorialLinks(context) {
    // Each marker applies to the last clause since the preceding marker.
    context = context.split(/[。！？；\n]/).pop();
    let matches = routes.flatMap(([pattern,route,label]) => [...context.matchAll(pattern)].map(m => ({at:m.index,route,label})));
    if (matches.some(m=>m.route==='seated/gym')) {
      matches = matches.filter(m=>m.route!=='calf/gym');
      if (/站姿|双脚/.test(context)) matches.push({at:context.length,route:'calf/gym/double',label:'站姿提踵'});
    }
    // Simple double-leg references should land on that version, not weighted single-leg.
    if (/双脚提踵/.test(context) && !/单脚/.test(context)) matches=matches.map(m=>m.route==='calf/gym'?{...m,route:'calf/gym/double'}:m);
    const unique = [...new Map(matches.map(m=>[m.route,m])).values()];
    if (!unique.length) throw new Error('Unmapped tutorial: '+context);
    return unique.map(m=>careLink(m.route,m.label+'教程')).join(' ');
  }
  function paragraph(text, entry) {
    let out='',previous=0;
    const marker=/<链接教程>|（图片）|（动图演示）/g;
    for(const m of text.matchAll(marker)) {
      const context=text.slice(previous,m.index);
      out+=esc(context);
      if(m[0]==='<链接教程>') out+=tutorialLinks(context);
      else if(m[0]==='（动图演示）') out+=careLink('achilles-animation/explain','查看动图');
      else if(/足底三点支撑/.test(context.split(/[。！？；]/).pop())) out+=careLink('tripod/gym','三点支撑图示');
      else {
        const picture=entry.blocks.find(b=>b.type==='image');
        out+=picture?`<a class="guidance-link" href="${esc(picture.src)}" target="_blank" rel="noopener">查看图示 ↗</a>`:careLink('achilles-animation/explain','查看图示');
      }
      previous=m.index+m[0].length;
    }
    return out+esc(text.slice(previous));
  }
  function render(key) {
    const entry=window.PainmapResultCopy?.conditions[key];
    if(!entry) return '';
    return `<section class="result-guidance" lang="zh-CN"><h3>了解这次伤病与恢复</h3>${entry.blocks.map(b=>b.type==='image'?`<figure><a href="${esc(b.src)}" target="_blank" rel="noopener"><img src="${esc(b.src)}" alt="${esc(b.alt)}" width="${b.width}" height="${b.height}" loading="lazy"></a><figcaption>${esc(b.alt)} · 点击查看大图</figcaption></figure>`:`<p>${paragraph(b.text,entry)}</p>`).join('')}<div class="guidance-nav"><a href="care.html#emergency" target="_blank" rel="noopener">紧急处理 ↗</a><a href="care.html#rehab" target="_blank" rel="noopener">康复模块 ↗</a></div></section>`;
  }
  window.PainmapGuidance={render,tutorialLinks};
})();
