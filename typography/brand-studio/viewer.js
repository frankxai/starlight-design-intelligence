const source = JSON.parse(document.getElementById('font-data').textContent);
const frame = document.getElementById('specimen');
const stage = document.querySelector('.stage');
const escapeHTML = value => String(value).replace(/[&<>"']/g, ch => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[ch]));
const arrow = '<svg class="arrow" aria-hidden="true" viewBox="0 0 24 24" fill="none"><path d="M4 12h15m-6-6 6 6-6 6" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/></svg>';
const brands = {
 frankx: {
  name:'FrankX', headline:'Build what you want to exist.', prefix:'Build what you', accent:'want to exist.', label:'Ideas, tools and the work behind them',
  lead:'A place to think deeply, make useful things and share what works. Explore the essays, music and systems taking shape along the way.',
  action:'Explore the field notes', secondary:'The design system', links:['Essays','Builds','Music'],
  variants:['Instrument Sans + Instrument Serif','Inter + Playfair Display'],
  families:[['Instrument Sans','Instrument Serif'],['Inter','Playfair Display']],
  recommendation:'Instrument Sans + Instrument Serif',
  why:'Use this pairing for the editorial FrankX: essays, personal pages and thoughtful product stories. Instrument Sans keeps the writing direct; a short Instrument Serif phrase adds a recognizable human inflection.',
  tradeoff:'Keep Inter in existing technical interfaces. Inter + Playfair remains credible, but its broader display forms consume more space in this same headline. A flagship migration still requires testing real site content.',
  signature:'Warm paper, forest ink, a vertical margin note. Let one expressive phrase carry the page.',
  titles:['Think in public','Make something useful','Leave room for music'],
  texts:['Essays and field notes that connect a difficult question to something you can try.','Tools and systems explained through their decisions, tradeoffs and working parts.','Sound, atmosphere and creative practice belong beside the technical work.'],
 },
 arcanea: {
  name:'Arcanea', headline:'A world begins with one page.', prefix:'A world begins', accent:'with one page.', label:'A place for worlds to take shape',
  lead:'Give a character a reason to leave home. Follow a thread of music. Keep the details that make the world yours, and return to them as the story grows.',
  action:'Enter the reading room', secondary:'The design system', links:['Worlds','Stories','Create'],
  variants:['Geist + Newsreader','Geist + Instrument Serif'],
  families:[['Geist','Newsreader'],['Geist','Instrument Serif']],
  recommendation:'Geist + Newsreader for this reading surface',
  why:'Geist makes the tools and navigation legible. Newsreader gives sustained stories a different rhythm while also carrying a strong narrative title. This is the recommended pairing for the reading room.',
  tradeoff:'Keep Instrument Serif for short cinematic introductions on a separate surface. In the alternative here, Geist carries the story body; adding all three families to every route would dilute the roles.',
  signature:'An illuminated threshold, warm mineral color and chapter-like pacing. The world is the spectacle; reading stays quiet.',
 },
 starlight: {
  name:'Starlight Intelligence', headline:'Give intelligence a direction.', prefix:'Give intelligence', accent:'a direction.', label:'Research, systems and a larger horizon',
  lead:'Bring ambitious questions into shared work. Connect research, human judgment and capable systems so the next decision has somewhere solid to stand.',
  action:'Explore the work', secondary:'The design system', links:['Research','Systems','Academy'],
  variants:['Instrument Sans + Newsreader','Instrument Sans + Instrument Serif'],
  families:[['Instrument Sans','Newsreader','IBM Plex Mono'],['Instrument Sans','Instrument Serif','IBM Plex Mono']],
  recommendation:'Instrument Sans + Newsreader + IBM Plex Mono',
  why:'Restore the editorial role to Newsreader, as supported by the recovered Starlight kits. Instrument Sans handles decisions and operations. IBM Plex Mono is reserved for short technical identifiers.',
  tradeoff:'The Instrument Serif web loader is implementation evidence, not proof of a selected brand direction. Resolve that drift before a rollout. Starlight must support both an ambitious public horizon and precise operational work.',
  signature:'A clear horizon, disciplined information rows and teal used for orientation. Give future-facing language a visible working structure.',
 }
};
let brand='frankx', variant=0, fallback=source.fallbackBuild, large=false, customHeadline='';
const params = new URLSearchParams(location.search);
if (brands[params.get('brand')]) brand=params.get('brand');
if (params.get('variant')==='1') variant=1;
if (params.get('fallback')==='1') fallback=true;
if (params.get('width') && ['320','390','1280'].includes(params.get('width'))) document.getElementById('viewport').value=params.get('width');
function tokens(b){
 const f=b.families[variant];
 return `<section class="type-rail" id="type"><div><div class="overline">The type system</div><h2>${escapeHTML(f[0])}</h2><p>Controls, labels and clear explanations.<br>400 regular · 500 medium · 600 semibold</p><div class="type-sample">A clear idea. A useful next step.</div></div><div><div class="overline">The editorial voice</div><h2 class="serif">${escapeHTML(f[1])}</h2><div class="type-sample serif">Something worth returning to.</div><p>${['Instrument Serif','Playfair Display'].includes(f[1])?'400 regular · Short display only.':'400 regular · Reading and narrative display.'}<br>Use actual italic files when the role calls for them.</p></div><div><div class="overline">The visual memory</div><div class="swatches" aria-hidden="true"><span style="background:var(--paper)"></span><span style="background:var(--ink)"></span><span style="background:var(--accent)"></span></div><p>${escapeHTML(b.signature)}</p></div></section>`;
}
function art(){
 if(brand==='frankx')return '<div class="hero-art" aria-hidden="true"><div class="folio"><div class="ribbon"></div><div class="overline">Notes from the work</div><div class="serif">Ideas into<br>practice.</div><div class="folio-rule"></div><div class="folio-foot"><span>FrankX</span><span>Open notebook</span></div></div></div>';
 if(brand==='arcanea')return '<div class="hero-art" aria-hidden="true"><div class="portal"><span class="portal-glyph">Aa</span><div class="portal-stair"></div></div><div class="art-caption">A threshold for the imagination</div></div>';
 return '<div class="hero-art" aria-hidden="true"><div class="orbit-art"><span class="star-point"></span></div><div class="folio-caption">From a question to a shared horizon</div></div>';
}
function middle(b){
 if(brand==='frankx')return '<section class="editorial-grid" id="work">'+b.titles.map((t,i)=>`<article><div class="overline">0${i+1} / Field notes</div><h2>${t}</h2><p>${b.texts[i]}</p></article>`).join('')+'</section>';
 if(brand==='arcanea')return `<section class="editorial-grid" id="work"><article><div class="overline">Original reading specimen</div><h2>The shore of unfinished things</h2><p class="reading">The sea kept every story that had never found its ending. At dusk, they washed ashore as small blue stones, still warm with the voices of the people who had imagined them.</p></article><article><div class="overline">A creator’s path</div><div class="chapter-list"><span class="chapter-number">1</span><div><h3>Follow a question</h3><p>Begin with a person, a place and something that cannot stay the same.</p></div><span class="chapter-number">2</span><div><h3>Keep what matters</h3><p>Give the story a memory: characters, sounds, choices and consequences.</p></div></div></article></section>`;
 return `<section class="system-table" id="work" aria-label="Illustrative work structure"><div class="system-row head"><span>Workstream</span><span>What makes it useful</span><span>Design principle</span></div><div class="system-row"><span>Research</span><p>A question with sources that can be inspected.</p><span class="status">Trace the evidence</span></div><div class="system-row"><span>Human + AI systems</span><p>Clear responsibilities and a visible decision owner.</p><span class="status">Keep judgment visible</span></div><div class="system-row"><span>Academy</span><p>A learning path that ends in something you made.</p><span class="mono">artifact / 001</span></div></section>`;
}
function render(){
 const b=brands[brand];
 document.querySelectorAll('[data-brand]').forEach(el=>el.setAttribute('aria-pressed',String(el.dataset.brand===brand)));
 document.getElementById('variants').innerHTML='<span class="variant-label">Same content, different pairing</span>'+b.variants.map((name,i)=>`<button data-variant="${i}" aria-pressed="${i===variant}">${escapeHTML(name)}</button>`).join('');
 document.querySelectorAll('[data-variant]').forEach(el=>el.addEventListener('click',()=>{variant=Number(el.dataset.variant);render();}));
 document.getElementById('fallback').setAttribute('aria-pressed',String(fallback));
 document.getElementById('large').setAttribute('aria-pressed',String(large));
 if(document.activeElement!==document.getElementById('headline')) document.getElementById('headline').value=customHeadline||b.headline;
 document.getElementById('decision-copy').innerHTML=`<p class="pair">${escapeHTML(b.recommendation)}</p><p>${escapeHTML(b.why)}</p><p>${escapeHTML(b.tradeoff)}</p>`;
 const width=document.getElementById('viewport').value;
 frame.style.width=width==='fit'?Math.max(240,stage.clientWidth-(innerWidth>700?34:2))+'px':width+'px';
 frame.title=b.name+' typography specimen';
 const headline=customHeadline?escapeHTML(customHeadline):`${escapeHTML(b.prefix)}<span class="serif">${escapeHTML(b.accent)}</span>`;
 const expected=fallback?[]:b.families[variant];
 const selectedFontCSS=source.fontFaces.filter(f=>expected.includes(f.family)&&f.style==='normal').map(f=>f.css).join('\n');
 const innerScript=`const expected=${JSON.stringify(expected)};function report(){const root=document.querySelector('.page');const text=[];const seen=new Set();const walker=document.createTreeWalker(root,NodeFilter.SHOW_TEXT);while(walker.nextNode()){const n=walker.currentNode;const el=n.parentElement;if(!n.textContent.trim()||!el||el.closest('[aria-hidden=true]')||seen.has(el))continue;const cs=getComputedStyle(el);const r=el.getBoundingClientRect();if(r.width<=0||r.height<=0||cs.visibility==='hidden')continue;seen.add(el);const range=document.createRange();range.selectNodeContents(el);const rects=[...range.getClientRects()];text.push({text:el.textContent.trim(),fontFamily:cs.fontFamily,fontSize:parseFloat(cs.fontSize),lineHeight:parseFloat(cs.lineHeight),fontWeight:cs.fontWeight,fontStyle:cs.fontStyle,fontSynthesis:cs.fontSynthesis,textTransform:cs.textTransform,fontVariantCaps:cs.fontVariantCaps,letterSpacing:cs.letterSpacing,clientWidth:Math.ceil(r.width),scrollWidth:Math.max(Math.ceil(r.width),el.scrollWidth||0),right:Math.max(...rects.map(q=>q.right),r.right)});}const fonts=[...document.fonts].map(f=>({family:f.family.replace(/['\"]/g,''),status:f.status}));parent.postMessage({kind:'specimen',height:document.documentElement.scrollHeight,report:{scope:'controlled-specimen',mode:'${fallback?'fallback':'primary'}',expectedFamilies:expected,fonts,text,viewport:{width:innerWidth,scrollWidth:document.documentElement.scrollWidth},brand:'${brand}',variant:${variant},textScale:${large?2:1}}},'*');}document.fonts.ready.then(()=>requestAnimationFrame(report));`;
 frame.srcdoc=`<!doctype html><html lang="en"${large?' style="font-size:32px"':''}><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><style>${selectedFontCSS}\n${source.sheetCSS}\n${brand==='arcanea'&&variant===1?'.arcanea.alt .reading,.arcanea.alt .chapter-number{font-family:var(--sans),Arial,sans-serif}.arcanea.alt .portal-glyph{font-family:var(--serif),Georgia,serif}':''}</style></head><body class="${brand}${variant?' alt':''}${fallback?' fallback':''}${large?' large':''}"><main class="page"><header class="brand-nav"><span class="brand-name">${escapeHTML(b.name)}</span><div class="brand-links">${b.links.map(x=>'<span>'+x+'</span>').join('')}</div></header><section class="hero"><div><p class="overline">${escapeHTML(b.label)}</p><h1>${headline}</h1><p class="lead">${escapeHTML(b.lead)}</p><div class="actions"><a class="action" href="#work">${escapeHTML(b.action)}${arrow}</a><a class="small-link" href="#type">${escapeHTML(b.secondary)}</a></div></div>${art()}</section>${middle(b)}${tokens(b)}<footer class="footer-line"><span>${escapeHTML(b.name)} · Applied typography specimen</span><span>${fallback?'Fallback fonts':escapeHTML(b.variants[variant])} · Review candidate</span></footer></main><script>${innerScript}<\/script></body></html>`;
 document.getElementById('font-state').textContent='Rendering '+b.name+'…';
}
window.addEventListener('message',e=>{
 if(e.source!==frame.contentWindow||e.data?.kind!=='specimen')return;
 frame.style.height=(e.data.height+2)+'px';
 const r=e.data.report;
 document.getElementById('preflight').textContent=JSON.stringify(r,null,2);
 const missing=r.expectedFamilies.filter(f=>!r.fonts.some(x=>x.family===f&&x.status==='loaded'));
 document.getElementById('font-state').textContent=`${fallback?'Fallback specimen · No embedded fonts loaded':missing.length?'Missing: '+missing.join(', '):'Embedded font families loaded'} · ${r.viewport.width} px CSS viewport${large?' · Text at 200%':''}`;
});
document.querySelectorAll('[data-brand]').forEach(el=>el.addEventListener('click',()=>{brand=el.dataset.brand;variant=0;customHeadline='';render();}));
document.getElementById('viewport').addEventListener('change',render);
document.getElementById('fallback').addEventListener('click',()=>{fallback=!fallback;render();});
document.getElementById('large').addEventListener('click',()=>{large=!large;render();});
document.getElementById('headline').addEventListener('input',e=>{customHeadline=e.target.value;render();});
document.getElementById('reset').addEventListener('click',()=>{customHeadline='';render();});
let resizeTimer;window.addEventListener('resize',()=>{clearTimeout(resizeTimer);resizeTimer=setTimeout(render,100);});
render();
