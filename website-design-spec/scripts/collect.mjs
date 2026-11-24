#!/usr/bin/env node
/** Bounded baseline only. See references/inspection-methods.md for limits. */
import fs from 'node:fs/promises';
import path from 'node:path';
import { pathToFileURL } from 'node:url';

const help = `Website design evidence collector
--url <http(s) URL> --out <directory> (required)
--playwright-module <absolute index.mjs path> (optional; otherwise import playwright)
--browser <Chrome/Chromium executable> (optional)
--viewports desktop:1440x1000,tablet:768x1024,mobile:390x844
--max-scrolls 10 --settle-ms 1200 --reduced-motion no-preference|reduce
--color-scheme light|dark --touch
Requires a Node version supported by installed Playwright (currently 20+).
Fresh contexts; no clicks, submissions, persistent profiles, or authentication.
Writes manifest.json and per-viewport images/samples.json. Never a complete audit.`;

function parseArgs(args) {
  const options = {};
  const allowed = new Set(['url','out','playwright-module','browser','viewports','max-scrolls','settle-ms','reduced-motion','color-scheme']);
  for (let i = 0; i < args.length; i++) {
    const k = args[i].replace(/^--/, '');
    if (k === 'help') { console.log(help); process.exit(0); }
    if (k === 'touch') { options.touch = true; continue; }
    if (!args[i].startsWith('--') || !allowed.has(k) || !args[i+1] || args[i+1].startsWith('--')) throw new Error(`Invalid option: ${args[i]}. Use --help.`);
    options[k] = args[++i];
  }
  if (!options.url || !options.out) throw new Error('--url and --out are required. Use --help.');
  if (!['https:','http:'].includes(new URL(options.url).protocol)) throw new Error('Only HTTP(S) URLs are supported.');
  if (new URL(options.url).username || new URL(options.url).password) throw new Error('Do not pass credentials in URLs.');
  options.scrolls = Number(options['max-scrolls'] ?? 10);
  options.settle = Number(options['settle-ms'] ?? 1200);
  if (!Number.isInteger(options.scrolls) || options.scrolls < 1 || options.scrolls > 60) throw new Error('--max-scrolls must be 1–60.');
  if (!Number.isFinite(options.settle) || options.settle < 0 || options.settle > 10000) throw new Error('--settle-ms must be 0–10000.');
  options.motion = options['reduced-motion'] ?? 'no-preference';
  options.scheme = options['color-scheme'] ?? 'light';
  if (!['reduce','no-preference'].includes(options.motion)) throw new Error('Invalid motion preference.');
  if (!['light','dark'].includes(options.scheme)) throw new Error('Invalid color scheme.');
  options.views = (options.viewports ?? 'desktop:1440x1000,tablet:768x1024,mobile:390x844').split(',').map(v => {
    const m = /^([a-zA-Z0-9_-]+):(\d+)x(\d+)$/.exec(v);
    if (!m) throw new Error(`Invalid viewport ${v}`);
    const [,name,w,h] = m, width = Number(w), height = Number(h);
    if (width < 240 || height < 240 || width > 3840 || height > 2160) throw new Error('Viewport outside supported bounds.');
    return {name,width,height};
  });
  if (new Set(options.views.map(v => v.name)).size !== options.views.length) throw new Error('Viewport names must be unique.');
  return options;
}

// Runs inside the page. It only reads DOM, CSSOM, geometry and active animations.
function probe() {
  const props = ['display','position','zIndex','width','maxWidth','height','minHeight','margin','padding','gap','rowGap','columnGap','gridTemplateColumns','flexDirection','alignItems','justifyContent','fontFamily','fontSize','fontWeight','fontStyle','fontStretch','fontVariationSettings','lineHeight','letterSpacing','textTransform','textAlign','textDecoration','color','backgroundColor','backgroundImage','border','borderRadius','boxShadow','opacity','transform','transitionProperty','transitionDuration','transitionTimingFunction','transitionDelay','animationName','animationDuration','animationDelay','animationTimingFunction','animationIterationCount','objectFit','objectPosition','overflow','outline','outlineOffset','filter','backdropFilter'];
  const clean = value => JSON.parse(JSON.stringify(value, (_k,v) => typeof v === 'number' && !Number.isFinite(v) ? String(v) : v));
  const locator = el => {
    if (!el || !el.tagName) return null;
    if (el.id && document.querySelectorAll('#' + CSS.escape(el.id)).length === 1) return '#' + CSS.escape(el.id);
    const parts = [];
    for (let p = el; p && p.nodeType === 1 && parts.length < 8; p = p.parentElement) {
      const siblings = p.parentElement ? [...p.parentElement.children].filter(s => s.tagName === p.tagName) : [p];
      parts.unshift(p.tagName.toLowerCase() + (siblings.length > 1 ? `:nth-of-type(${siblings.indexOf(p)+1})` : ''));
    }
    return parts.join(' > ');
  };
  const styles = (el,pseudo=null) => {
    const s = getComputedStyle(el,pseudo);
    return Object.fromEntries(props.map(p => [p,s[p]]));
  };
  const selector = 'html,body,header,nav,main,footer,section,article,h1,h2,h3,p,a,button,label,input,select,textarea,[role="button"],[role="tab"],summary,details,img,svg,video,canvas,[class*="card"],[class*="container"],[class*="hero"]';
  const candidates = [...document.querySelectorAll(selector)];
  const visible = candidates.filter(el => {
    const r = el.getBoundingClientRect(), s = getComputedStyle(el);
    return r.width > 0 && r.height > 0 && s.display !== 'none' && s.visibility !== 'hidden';
  });
  // Priority includes semantic structure before repeated links/cards; report truncation.
  const important = visible.filter(el => el.matches('html,body,header,nav,main,footer,section,h1,h2,h3,button,input,summary'));
  const chosen = [...new Set([...important,...visible])].slice(0,220);
  const elements = chosen.map(el => {
    const r = el.getBoundingClientRect(), s = getComputedStyle(el);
    const custom = Object.fromEntries([...s].filter(k => k.startsWith('--')).slice(0,40).map(k => [k,s.getPropertyValue(k).trim()]));
    const pseudos = {};
    for (const p of ['::before','::after']) {
      const ps = getComputedStyle(el,p);
      if (ps.content && !['none','normal'].includes(ps.content)) pseudos[p] = {content:ps.content,style:styles(el,p)};
    }
    return {locator:locator(el),tag:el.tagName.toLowerCase(),text:el.innerText?.trim().slice(0,140) ?? '',
      role:el.getAttribute('role'),ariaLabel:el.getAttribute('aria-label'),ariaExpanded:el.getAttribute('aria-expanded'),
      rect:{x:r.x,y:r.y,documentX:r.x+scrollX,documentY:r.y+scrollY,width:r.width,height:r.height},
      style:styles(el),customProperties:custom,pseudos,
      href:el instanceof HTMLAnchorElement ? el.href : undefined};
  });
  const sheets = [], fontRules = [], mediaRules = [], keyframes = [], containers = [];
  let visitedRules = 0;
  function rulesWalk(rules,source,conditions=[]) {
    for (const r of rules) {
      if (++visitedRules > 12000) return;
      if (r.type === 5 && fontRules.length < 40) fontRules.push({source,conditions,css:r.cssText});
      if (r.type === 7 && keyframes.length < 40) keyframes.push({source,conditions,name:r.name,css:r.cssText.slice(0,5000)});
      if (r.type === 4 && mediaRules.length < 100) mediaRules.push({source,condition:r.conditionText,matches:matchMedia(r.conditionText).matches});
      if (r.constructor?.name === 'CSSContainerRule' && containers.length < 50) containers.push({source,condition:r.conditionText,name:r.containerName});
      if (r.cssRules && r.type !== 7) rulesWalk(r.cssRules,source,[...conditions,...(r.conditionText ? [r.conditionText] : [])]);
    }
  }
  for (const sheet of document.styleSheets) {
    const source = sheet.href ?? 'inline';
    try { const rules = sheet.cssRules; sheets.push({source,readable:true,ruleCount:rules.length}); rulesWalk(rules,source); }
    catch(e) { sheets.push({source,readable:false,error:e.name}); }
  }
  const animations = document.getAnimations().slice(0,100).map(a => {
    try {return clean({name:a.animationName ?? a.id ?? null,type:a.constructor.name,playState:a.playState,currentTime:a.currentTime,
      target:locator(a.effect?.target),timing:a.effect?.getTiming(),computedTiming:a.effect?.getComputedTiming(),keyframes:a.effect?.getKeyframes()});}
    catch(e){return {error:e.message};}
  });
  return {capturedAt:new Date().toISOString(),url:location.href,title:document.title,
    environment:{viewport:[innerWidth,innerHeight],dpr:devicePixelRatio,scroll:[scrollX,scrollY],language:navigator.language,documentLanguage:document.documentElement.lang,
      reducedMotion:matchMedia('(prefers-reduced-motion: reduce)').matches,colorSchemeDark:matchMedia('(prefers-color-scheme: dark)').matches,
      coarsePointer:matchMedia('(pointer: coarse)').matches,hover:matchMedia('(hover: hover)').matches,zoom:'not independently measured'},
    documentSize:{width:document.documentElement.scrollWidth,height:document.documentElement.scrollHeight},
    sampling:{candidates:candidates.length,visible:visible.length,sampled:elements.length,truncated:visible.length>elements.length,cssRulesVisited:visitedRules,cssRuleCap:12000},
    fonts:[...document.fonts].slice(0,60).map(f=>({family:f.family,status:f.status,weight:f.weight,style:f.style,stretch:f.stretch,unicodeRange:f.unicodeRange})),
    sheets,fontRules,mediaRules,containerRules:containers,keyframes,animations,elements,
    links:[...document.querySelectorAll('a[href]')].slice(0,180).map(a=>({text:a.innerText.trim().slice(0,90),href:a.href})),
    images:[...document.images].slice(0,80).map(i=>({locator:locator(i),src:i.currentSrc||i.src,alt:i.alt,naturalWidth:i.naturalWidth,naturalHeight:i.naturalHeight,loading:i.loading})),
    media:[...document.querySelectorAll('video,canvas,iframe')].slice(0,30).map(el=>({tag:el.tagName.toLowerCase(),locator:locator(el),src:el.currentSrc||el.src||null,autoplay:el.autoplay,loop:el.loop,muted:el.muted})),
    limits:['Main document only; no iframe/shadow traversal','Bounded element/rule samples','Visibility check is geometric, not painted occlusion','Declared/loaded font data is not rendered glyph proof','Active Web Animations only; no complete JS/canvas motion inventory','No interaction/keyboard/contrast/conformance testing']};
}

async function main() {
  const options = parseArgs(process.argv.slice(2));
  const out = path.resolve(options.out);
  await fs.mkdir(out,{recursive:true});
  // Refuse to overwrite an earlier audit silently.
  try { await fs.access(path.join(out,'manifest.json')); throw new Error('Output already contains manifest.json; use a new directory.'); }
  catch(e) { if (e.code !== 'ENOENT') throw e; }
  let pw;
  try { pw = await import(options['playwright-module'] ? pathToFileURL(path.resolve(options['playwright-module'])).href : 'playwright'); }
  catch(e) { throw new Error(`Cannot load Playwright: ${e.message}. See references/inspection-methods.md.`); }
  const manifest = {schemaVersion:'1.0',startedAt:new Date().toISOString(),requestedUrl:options.url,
    environment:{node:process.version,reducedMotion:options.motion,colorScheme:options.scheme,touch:Boolean(options.touch),deviceScaleFactor:1},
    method:'Bounded read-only baseline; screenshots preserve natural animations',views:[],errors:[]};
  let browser;
  try {
    browser = await pw.chromium.launch({headless:true,...(options.browser ? {executablePath:options.browser} : {})});
    manifest.browserVersion = browser.version();
    for (const view of options.views) {
      const dir = path.join(out,view.name); await fs.mkdir(dir,{recursive:true});
      const record = {name:view.name,viewport:[view.width,view.height],artifacts:[],errors:[],captures:[]};
      manifest.views.push(record);
      const ctx = await browser.newContext({viewport:{width:view.width,height:view.height},deviceScaleFactor:1,
        reducedMotion:options.motion,colorScheme:options.scheme,hasTouch:Boolean(options.touch),isMobile:Boolean(options.touch),locale:'en-US'});
      const page = await ctx.newPage();
      page.setDefaultTimeout(12000);
      const capture = async (filename,state,fullPage=false) => {
        try {
          await page.screenshot({path:path.join(dir,filename),fullPage,timeout:12000,animations:'allow'});
          record.artifacts.push(`${view.name}/${filename}`);
          record.captures.push({artifact:`${view.name}/${filename}`,state,capturedAt:new Date().toISOString(),url:page.url(),scroll:await page.evaluate(()=>[scrollX,scrollY])});
        } catch(e) {record.errors.push({operation:filename,message:e.message});}
      };
      try {
        const response = await page.goto(options.url,{waitUntil:'domcontentloaded',timeout:45000});
        record.httpStatus=response?.status()??null; record.finalUrl=page.url();
        await capture('initial.png','after DOMContentLoaded; screenshot may await fonts');
        record.fontWait = await page.evaluate(async()=>Promise.race([document.fonts.ready.then(()=>'ready'),new Promise(r=>setTimeout(()=>r('timeout'),6000))]));
        await page.waitForTimeout(options.settle);
        await capture('settled.png','settled top; overlays unchanged');
        const top=await page.evaluate(probe);
        const scrollSamples=[];
        record.reachedBottom=false;
        for(let i=0;i<options.scrolls;i++) {
          const state=await page.evaluate(()=>({y:scrollY,height:innerHeight,bottom:scrollY+innerHeight>=document.documentElement.scrollHeight-2}));
          await capture(`section-${String(i).padStart(2,'0')}.png`,`natural scroll section ${i}`);
          // Sample current animations/geometry after each scroll, since transient effects can disappear later.
          const s=await page.evaluate(probe);
          scrollSamples.push({section:i,...s});
          if(state.bottom){record.reachedBottom=true;break;}
          await page.evaluate(()=>window.scrollBy(0,Math.round(innerHeight*0.85)));
          await page.waitForTimeout(300);
        }
        record.scrollTruncated=!record.reachedBottom;
        await page.evaluate(()=>window.scrollTo(0,0));
        await page.waitForTimeout(300);
        const height=await page.evaluate(()=>document.documentElement.scrollHeight);
        if(height<=20000) await capture('full.png','post-scroll full-page reference; not initial state',true);
        else record.errors.push({operation:'full.png',message:'Skipped: page height exceeds 20000 CSS px; use section coverage.'});
        const samples={top,scrollSamples};
        await fs.writeFile(path.join(dir,'samples.json'),JSON.stringify(samples,null,2));
        record.artifacts.push(`${view.name}/samples.json`);
      } catch(e) {record.errors.push({operation:'collect',message:e.message});}
      finally {await ctx.close();}
      await fs.writeFile(path.join(out,'manifest.json'),JSON.stringify(manifest,null,2));
    }
  } catch(e) {manifest.errors.push({operation:'browser',message:e.message});}
  finally {
    if(browser) await browser.close();
    manifest.finishedAt=new Date().toISOString();
    await fs.writeFile(path.join(out,'manifest.json'),JSON.stringify(manifest,null,2));
  }
  console.log(JSON.stringify({manifest:path.join(out,'manifest.json'),views:manifest.views.map(v=>({name:v.name,status:v.httpStatus,reachedBottom:v.reachedBottom,errors:v.errors.length})),errors:manifest.errors.length},null,2));
  if(manifest.errors.length || manifest.views.every(v=>!v.artifacts.some(a=>a.endsWith('samples.json')))) process.exitCode=1;
}

main().catch(e=>{console.error(e.message);process.exitCode=1;});
