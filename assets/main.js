/* ============================================================
   Nimbus Portfolio — shared behaviour
   Every block guards for its own elements, so any page can
   include this file safely.
   ============================================================ */
gsap.registerPlugin(ScrollTrigger);

/* ───── Lenis smooth scroll ───── */
const lenis = new Lenis({
  duration: 1.25,
  easing: t => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
  smoothWheel: true, smoothTouch: false, wheelMultiplier: .9
});
lenis.on('scroll', ScrollTrigger.update);
gsap.ticker.add(t => lenis.raf(t * 1000));
gsap.ticker.lagSmoothing(0);

/* ───── Custom cursor ───── */
const cursor = document.getElementById('cursor');
if (cursor) {
  let cx = innerWidth/2, cy = innerHeight/2, tx = cx, ty = cy;
  addEventListener('mousemove', e => { tx = e.clientX; ty = e.clientY; });
  (function loop(){
    cx += (tx - cx)*.22; cy += (ty - cy)*.22;
    cursor.style.transform = `translate(${cx}px,${cy}px) translate(-50%,-50%)`;
    requestAnimationFrame(loop);
  })();
}
function bindHover(){
  if (!cursor) return;
  document.querySelectorAll('[data-hover]').forEach(el => {
    if (el.dataset.hoverBound) return;
    el.dataset.hoverBound = '1';
    el.addEventListener('mouseenter', () => cursor.classList.add('is-hover'));
    el.addEventListener('mouseleave', () => cursor.classList.remove('is-hover'));
  });
}
bindHover();

/* ───── Visual Design dropdown (aligns under its trigger word) ───── */
(function(){
  const menu = document.querySelector('.nav-menu');
  const trigger = document.querySelector('.nav .has-dropdown');
  const triggerA = trigger ? trigger.querySelector('a') : null;
  const dd = document.querySelector('.nav .dropdown');
  if (!menu || !trigger || !triggerA || !dd) return;
  /* place the dropdown's anchor point under the trigger word, not the nav pill center */
  function place(){
    const tr = triggerA.getBoundingClientRect();
    const mr = menu.getBoundingClientRect();
    dd.style.left = ((tr.left + tr.width/2) - mr.left) + 'px';
  }
  place();
  addEventListener('resize', place);
  if (document.fonts) document.fonts.ready.then(place);
  let t;
  const open  = () => { clearTimeout(t); menu.classList.add('dd-open'); };
  const close = () => { t = setTimeout(() => menu.classList.remove('dd-open'), 140); };
  [trigger, dd].forEach(el => {
    el.addEventListener('mouseenter', open);
    el.addEventListener('mouseleave', close);
  });
})();

/* ───── Loader → intro ───── */
const waiter = document.getElementById('waiter');
const pct = document.getElementById('pct');
if (waiter && pct) {
  let p = 0;
  const fakeLoad = setInterval(() => {
    p += Math.random()*8 + 3;
    if (p >= 100) { p = 100; clearInterval(fakeLoad); finish(); }
    pct.textContent = String(Math.floor(p)).padStart(2,'0');
  }, 75);
  function finish(){
    gsap.timeline({onComplete: intro})
      .to('#waiter', { yPercent:-100, duration:1, ease:'expo.inOut' })
      .set('#waiter', { display:'none' });
  }
} else {
  intro();
}
function intro(){
  gsap.from('.nav', { y:-20, opacity:0, duration:1, ease:'expo.out' });
  if (document.querySelector('.hero-slider'))
    gsap.from('.hero-slider', { opacity:0, y:20, duration:1, delay:.4, ease:'expo.out' });
  /* first-screen heading: fade + blur-in (so it isn't missed behind the loader) */
  const firstScreen = document.querySelector('.page-head') || document.querySelector('.proj-title');
  if (firstScreen)
    gsap.from(firstScreen.children, { opacity:0, y:24, filter:'blur(10px)', duration:1.1, delay:.2, ease:'power2.out', stagger:.1 });
}

/* ───── DPR canvas helper ───── */
const DPR = Math.min(2, devicePixelRatio || 1);
function fit(canvas){
  const r = canvas.getBoundingClientRect();
  canvas.width = r.width * DPR; canvas.height = r.height * DPR;
  const ctx = canvas.getContext('2d');
  ctx.setTransform(DPR,0,0,DPR,0,0);
  return ctx;
}

/* ───── HOME: hero carousel ───── */
if (document.querySelector('.hero-slider')) {
  const HERO_COUNT = document.querySelectorAll('.hero-bg .slide').length;
  let heroIdx = 0;
  const thumbs = document.querySelectorAll('.hero-slider .thumb');
  const slides = document.querySelectorAll('.hero-bg .slide');

  function setHero(i){
    i = (i + HERO_COUNT) % HERO_COUNT;
    if (i === heroIdx) return;
    heroIdx = i;
    slides.forEach((sl, k) => sl.classList.toggle('is-on', k === i));
    thumbs.forEach(t => t.classList.remove('is-on'));
    void thumbs[i].offsetWidth;
    thumbs[i].classList.add('is-on');
  }
  thumbs.forEach((t, i) => t.addEventListener('click', () => { setHero(i); resetAuto(); }));
  let heroAuto;
  function resetAuto(){ clearInterval(heroAuto); heroAuto = setInterval(() => setHero(heroIdx + 1), 7000); }
  resetAuto();
  const heroEl = document.querySelector('.hero');
  heroEl.addEventListener('mouseenter', () => clearInterval(heroAuto));
  heroEl.addEventListener('mouseleave', resetAuto);
}

/* ───── HOME: explore soft canvases ───── */
document.querySelectorAll('[data-soft]').forEach((cv, idx) => {
  let ctx = fit(cv);
  addEventListener('resize', () => { ctx = fit(cv); });
  let t = idx * 7;
  (function draw(){
    t += 0.004;
    const w = cv.clientWidth, h = cv.clientHeight;
    ctx.clearRect(0,0,w,h);
    for (let i = 0; i < 4; i++){
      const y = h * (.4 + i*.08) + Math.sin(t + i*1.3) * 20;
      ctx.beginPath(); ctx.moveTo(0, h); ctx.lineTo(0, y);
      for (let x = 0; x <= w; x += 14){
        const yy = y + Math.sin(t + (x*.012) + i*1.8) * (20 - i*4) + Math.cos(t*.7 + x*.008) * 14;
        ctx.lineTo(x, yy);
      }
      ctx.lineTo(w, h); ctx.closePath();
      const g = ctx.createLinearGradient(0, y - 40, 0, h);
      g.addColorStop(0, `hsla(30,5%,${80 - i*8}%,${.6 - i*.1})`);
      g.addColorStop(1, `hsla(30,5%,${60 - i*5}%,0)`);
      ctx.fillStyle = g; ctx.fill();
    }
    requestAnimationFrame(draw);
  })();
});

/* ───── HOME: how-we-work node diagram ───── */
const howCard = document.getElementById('howCard');
if (howCard) {
  function buildHow(){
    howCard.innerHTML = '';
    const r = howCard.getBoundingClientRect();
    const cx = r.width/2, cy = r.height/2;
    for (let ring = 0; ring < 4; ring++){
      const rx = 90 + ring*70, ry = 60 + ring*42;
      const count = 22 + ring*8;
      for (let i = 0; i < count; i++){
        const a = (i / count) * Math.PI * 2;
        const x = cx + Math.cos(a) * rx, y = cy + Math.sin(a) * ry;
        const d = document.createElement('div');
        d.className = 'node';
        d.style.left = (x - 3) + 'px'; d.style.top = (y - 3) + 'px';
        d.style.opacity = (.18 + ring*.08).toString();
        howCard.appendChild(d);
      }
    }
    const steps = ['Brief','Design','Material','Prototype','Production','Setup','Live'];
    steps.forEach((s, i) => {
      const a = -Math.PI/2 + (i / steps.length) * Math.PI * 2;
      const x = cx + Math.cos(a) * 300, y = cy + Math.sin(a) * 180;
      const wrap = document.createElement('div');
      wrap.style.cssText = `position:absolute;left:${x-50}px;top:${y-14}px;width:100px;text-align:center;font-size:14px;color:var(--ink-2)`;
      wrap.innerHTML = `<div style="width:8px;height:8px;border-radius:50%;background:var(--ink);margin:0 auto 6px"></div>${s}`;
      howCard.appendChild(wrap);
    });
  }
  let to; new ResizeObserver(() => { clearTimeout(to); to = setTimeout(buildHow, 80); }).observe(howCard);
  setTimeout(buildHow, 60);
}

/* ───── HOME: approach canvas ───── */
const appCan = document.getElementById('appCanvas');
if (appCan) {
  let appCtx = fit(appCan);
  addEventListener('resize', () => { appCtx = fit(appCan); });
  let appT = 0;
  (function appDraw(){
    appT += 0.005;
    const w = appCan.clientWidth, h = appCan.clientHeight;
    appCtx.clearRect(0,0,w,h);
    for (let i = 6; i > 0; i--){
      const r = 60 + i * 38 + Math.sin(appT + i) * 8;
      const cx = w/2 + Math.cos(appT*.6 + i) * 8, cy = h/2 + Math.sin(appT*.8 + i) * 8;
      const g = appCtx.createRadialGradient(cx, cy, r*.2, cx, cy, r);
      g.addColorStop(0, `hsla(30,5%,${88 - i*3}%,.55)`);
      g.addColorStop(1, `hsla(30,5%,${68 - i*4}%,0)`);
      appCtx.fillStyle = g; appCtx.beginPath(); appCtx.arc(cx, cy, r, 0, Math.PI*2); appCtx.fill();
    }
    appCtx.strokeStyle = 'rgba(44,42,40,.18)'; appCtx.lineWidth = 1;
    for (let i = 0; i < 6; i++){
      const x = w/2 + (i - 2.5) * 22;
      appCtx.beginPath(); appCtx.moveTo(x, 0);
      appCtx.bezierCurveTo(x + Math.sin(appT + i)*4, h*.3, x + Math.cos(appT + i*.7)*4, h*.5, x, h*.55);
      appCtx.stroke();
    }
    requestAnimationFrame(appDraw);
  })();
}

/* ───── Scroll reveals — fade + blur-to-sharp + slight rise (all pages) ───── */
const revealSel = [
  '.section-title', '.section-sub',
  '.about-photo', '.about-me h2', '.about-me .intro', '.about-skills .sg',
  '.tl-item', '.wx-intro', '.wx-cats li', '.worksx-stage',
  '.proj-card', '.gallery .shot',
  '.proj-metarow .m', '.proj-block', '.proj-figure', '.proj-nav a',
  '.think-card', '.foot .col',
  '.exp-card', '.pills span', '.sub-card'
].join(',');

gsap.utils.toArray(revealSel).forEach(el => {
  gsap.fromTo(el,
    { opacity: 0, y: 28, filter: 'blur(9px)' },
    {
      opacity: 1, y: 0, filter: 'blur(0px)',
      duration: 1.1, ease: 'power2.out',
      scrollTrigger: { trigger: el, start: 'top 88%' }
    }
  );
});

/* ───── HOME: works explore — hover category lifts its card to front ───── */
(function(){
  const sec = document.querySelector('.worksx');
  const list = document.querySelector('.wx-cats');
  const cats = document.querySelectorAll('.wx-cats a');
  const cards = document.querySelectorAll('.worksx-stage .wx-card');
  if (!sec || !list || !cats.length) return;
  function front(key){ cards.forEach(c => c.classList.toggle('front', c.dataset.key === key)); }
  cats.forEach(a => a.addEventListener('mouseenter', () => front(a.dataset.img)));
  list.addEventListener('mouseenter', () => sec.classList.add('is-hovering'));
  list.addEventListener('mouseleave', () => { sec.classList.remove('is-hovering'); cards.forEach(c => c.classList.remove('front')); });
})();

/* ───── ILLUSTRATION: lightbox ───── */
(function(){
  const shots = document.querySelectorAll('.gallery .shot');
  const lb = document.getElementById('lightbox');
  if (!shots.length || !lb) return;
  const lbImg = lb.querySelector('.lb-img');
  const lbCat = lb.querySelector('.lb-cat');
  const lbTitle = lb.querySelector('.lb-title');
  const lbMeta = lb.querySelector('.lb-meta');
  const lbDesc = lb.querySelector('.lb-desc');
  const items = Array.from(shots).map(s => ({
    src: s.dataset.full || (s.querySelector('img') ? s.querySelector('img').src : ''),
    cat: s.dataset.cat || '',
    title: s.dataset.title || s.dataset.cap || '',
    year: s.dataset.year || '',
    medium: s.dataset.medium || '',
    desc: s.dataset.desc || ''
  }));
  let cur = 0;
  function open(i){
    cur = (i + items.length) % items.length;
    const it = items[cur];
    if (it.src){ lbImg.src = it.src; lbImg.style.display = 'block'; }
    else { lbImg.removeAttribute('src'); lbImg.style.display = 'none'; }
    lbCat.textContent = it.cat;
    lbTitle.textContent = it.title;
    let rows = '';
    lbMeta.innerHTML = rows;
    lbDesc.textContent = it.desc;
    lb.classList.add('open');
    lenis.stop();
  }
  function close(){
    const lbVid = lb.querySelector('.lb-video');
    if (lbVid) lbVid.pause();
    lb.classList.remove('open'); lenis.start();
  }
  shots.forEach((s, i) => s.addEventListener('click', () => open(i)));
  lb.querySelector('.lb-close').addEventListener('click', close);
  lb.querySelector('.lb-prev').addEventListener('click', e => { e.stopPropagation(); open(cur - 1); });
  lb.querySelector('.lb-next').addEventListener('click', e => { e.stopPropagation(); open(cur + 1); });
  lb.addEventListener('click', e => { if (e.target === lb) close(); });
  addEventListener('keydown', e => {
    if (!lb.classList.contains('open')) return;
    if (e.key === 'Escape') close();
    if (e.key === 'ArrowLeft') open(cur - 1);
    if (e.key === 'ArrowRight') open(cur + 1);
  });
})();

/* ───── AD: multi-image project lightbox (left image + thumbs, right info) ───── */
(function(){
  const shots = document.querySelectorAll('.ad-gallery .shot');
  const lb = document.getElementById('lightboxAd');
  if (!shots.length || !lb) return;
  const lbImg = lb.querySelector('.lb-img');
  const lbCat = lb.querySelector('.lb-cat');
  const lbTitle = lb.querySelector('.lb-title');
  const lbMeta = lb.querySelector('.lb-meta');
  const lbDesc = lb.querySelector('.lb-desc');
  const lbThumbs = lb.querySelector('.lb-thumbs');

  const projects = Array.from(shots).map(s => {
    const imgs = (s.dataset.images || '').split(',').map(x => x.trim()).filter(Boolean);
    if (!imgs.length && s.querySelector('img')) imgs.push(s.querySelector('img').src);
    // 影片來源：優先 data-video，其次 <video><source src>
    const vidSrcEl = s.querySelector('video source');
    const video = s.dataset.video || (vidSrcEl ? vidSrcEl.getAttribute('src') : '');
    return {
      cat: s.dataset.cat || 'Advertising',
      title: s.dataset.title || '',
      year: s.dataset.year || '',
      client: s.dataset.client || '',
      desc: s.dataset.desc || '',
      images: imgs,
      video: video
    };
  });
  let pi = 0, ii = 0;

  function showImage(){
    const proj = projects[pi];
    if (proj.images[ii]) lbImg.src = proj.images[ii];
    lbThumbs.querySelectorAll('.lb-thumb').forEach((t, k) => t.classList.toggle('is-on', k === ii));
  }
  function showProject(){
    const proj = projects[pi];
    ii = 0;
    // ── 影片模式：以 video 取代 img；隱藏縮圖列 ──
    let lbVid = lb.querySelector('.lb-video');
    if (proj.video) {
      if (!lbVid) {
        lbVid = document.createElement('video');
        lbVid.className = 'lb-video';
        lbVid.setAttribute('autoplay','');
        lbVid.setAttribute('loop','');
        lbVid.setAttribute('muted','');
        lbVid.muted = true;
        lbVid.setAttribute('playsinline','');
        lbVid.setAttribute('disablepictureinpicture','');
        lbVid.setAttribute('controlslist','nodownload noremoteplayback nofullscreen');
        lbVid.style.cssText = 'max-width:100%;max-height:82vh;display:block;border-radius:8px;pointer-events:none';
        lbImg.parentNode.appendChild(lbVid);
      }
      lbVid.src = proj.video;
      lbVid.style.display = 'block';
      lbImg.style.display = 'none';
    } else {
      if (lbVid) { lbVid.pause(); lbVid.removeAttribute('src'); lbVid.load(); lbVid.style.display = 'none'; }
      lbImg.style.display = 'block';
    }
    lbCat.textContent = proj.cat;
    lbTitle.textContent = proj.title;
    let rows = '';
    if (proj.year)   rows += `<div class="row"><b>年份</b><span>${proj.year}</span></div>`;
    if (proj.client) rows += `<div class="row"><b>客戶</b><span>${proj.client}</span></div>`;
    lbMeta.innerHTML = rows;
    lbDesc.textContent = proj.desc;
    /* build thumbnail strip for this project's images */
    lbThumbs.innerHTML = '';
    proj.images.forEach((src, k) => {
      const b = document.createElement('button');
      b.className = 'lb-thumb' + (k === 0 ? ' is-on' : '');
      b.setAttribute('data-hover', '');
      b.innerHTML = `<img src="${src}" alt="">`;
      b.addEventListener('click', () => { ii = k; showImage(); });
      lbThumbs.appendChild(b);
    });
    lbThumbs.style.display = (proj.video || proj.images.length <= 1) ? 'none' : 'flex';
    showImage();
    bindHover();
  }
  function open(i){ pi = (i + projects.length) % projects.length; showProject(); lb.classList.add('open'); lenis.stop(); }
  function close(){
    const lbVid = lb.querySelector('.lb-video');
    if (lbVid) lbVid.pause();
    lb.classList.remove('open'); lenis.start();
  }
  shots.forEach((s, i) => s.addEventListener('click', () => {
    if (s.dataset.href) { location.href = s.dataset.href; return; }
    open(i);
  }));
  lb.querySelector('.lb-close').addEventListener('click', close);
  lb.querySelector('.lb-prev').addEventListener('click', e => { e.stopPropagation(); open(pi - 1); });
  lb.querySelector('.lb-next').addEventListener('click', e => { e.stopPropagation(); open(pi + 1); });
  lb.addEventListener('click', e => { if (e.target === lb) close(); });
  addEventListener('keydown', e => {
    if (!lb.classList.contains('open')) return;
    if (e.key === 'Escape') close();
    if (e.key === 'ArrowLeft') open(pi - 1);
    if (e.key === 'ArrowRight') open(pi + 1);
  });
})();

/* ───── Cookie dismiss ───── */
document.querySelectorAll('#cookie a').forEach(a => {
  a.addEventListener('click', e => {
    e.preventDefault();
    gsap.to('#cookie', { y:60, opacity:0, duration:.5, ease:'expo.in', onComplete:()=>{ const c=document.getElementById('cookie'); if(c) c.style.display='none'; } });
  });
});

/* ───── Refresh after fonts + images ───── */
if (document.fonts) document.fonts.ready.then(() => ScrollTrigger.refresh());
addEventListener('load', () => ScrollTrigger.refresh());


/* ───── UIUX: video lightbox (play/pause + fullscreen only) ───── */
(function(){
  const cards = document.querySelectorAll('.proj-card[data-lightbox-video]');
  const lb = document.getElementById('lightboxUiux');
  if (!cards.length || !lb) return;
  const lbCat = lb.querySelector('.lb-cat');
  const lbTitle = lb.querySelector('.lb-title');
  const lbDesc = lb.querySelector('.lb-desc');
  const holder = lb.querySelector('.lb-video-holder');
  const closeBtn = lb.querySelector('.lb-close');
  let currentVid = null;

  function open(card){
    const src = card.dataset.lightboxVideo;
    lbCat.textContent = card.dataset.lightboxCat || 'UIUX Design';
    lbTitle.textContent = card.dataset.lightboxTitle || '';
    lbDesc.textContent = card.dataset.lightboxDesc || '';

    holder.innerHTML = '';
    const v = document.createElement('video');
    v.src = src;
    v.autoplay = true;
    v.playsInline = true;
    v.setAttribute('playsinline','');
    v.setAttribute('disablepictureinpicture','');
    v.setAttribute('controlslist','nodownload noremoteplayback');
    v.addEventListener('click', () => { v.paused ? v.play() : v.pause(); playBtn.textContent = v.paused ? '▶' : '❚❚'; });
    const playBtn = document.createElement('button');
    playBtn.className = 'lb-play';
    playBtn.setAttribute('aria-label','播放／暫停');
    playBtn.textContent = '❚❚';
    playBtn.addEventListener('click', (e) => { e.stopPropagation(); v.paused ? v.play() : v.pause(); playBtn.textContent = v.paused ? '▶' : '❚❚'; });
    v.addEventListener('play', () => { playBtn.textContent = '❚❚'; });
    v.addEventListener('pause', () => { playBtn.textContent = '▶'; });
    holder.appendChild(v);
    holder.appendChild(playBtn);
    currentVid = v;

    lb.classList.add('open');
    lenis.stop();
  }
  function close(){
    if (currentVid) { currentVid.pause(); currentVid = null; }
    holder.innerHTML = '';
    lb.classList.remove('open');
    lenis.start();
  }
  cards.forEach(c => c.addEventListener('click', (e) => { e.preventDefault(); open(c); }));
  closeBtn.addEventListener('click', close);
  lb.addEventListener('click', (e) => { if (e.target === lb) close(); });
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape' && lb.classList.contains('open')) close(); });
})();

/* ───── Disable right-click / drag save ───── */
document.addEventListener('contextmenu', e => e.preventDefault());
document.addEventListener('dragstart', e => {
  if (e.target.tagName === 'IMG' || e.target.tagName === 'VIDEO') e.preventDefault();
});
