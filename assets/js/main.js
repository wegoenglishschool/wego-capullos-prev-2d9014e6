(function(){
  var d=document, root=d.documentElement;
  root.classList.remove('no-js');
  var reduce=window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var fmt=function(n){return '$'+Math.round(n).toLocaleString('en-US');};
  var num=function(n,dec){return dec?n.toFixed(dec):Math.round(n).toLocaleString('en-US');};

  /* reveal on scroll (one time, no loops) */
  var rvs=[].slice.call(d.querySelectorAll('.rv'));
  var countUp=function(el){
    if(el.dataset.done) return; el.dataset.done=1;
    var to=parseFloat(el.dataset.count), dec=parseInt(el.dataset.dec||0,10);
    if(reduce){el.textContent=num(to,dec);return;}
    var t0=null, dur=1600;
    var step=function(ts){ if(!t0) t0=ts; var p=Math.min((ts-t0)/dur,1); var e=1-Math.pow(1-p,3);
      el.textContent=num(to*e,dec); if(p<1) requestAnimationFrame(step); };
    requestAnimationFrame(step);
  };
  var onIn=function(el){
    el.classList.add('in');
    [].forEach.call(el.querySelectorAll('[data-count]'),countUp);
  };
  if('IntersectionObserver' in window){
    var io=new IntersectionObserver(function(ents){
      ents.forEach(function(en){ if(en.isIntersecting){ onIn(en.target); io.unobserve(en.target);} });
    },{rootMargin:'0px 0px -8% 0px',threshold:0.12});
    rvs.forEach(function(el,i){
      var sib=el.parentElement?[].slice.call(el.parentElement.children).filter(function(c){return c.classList.contains('rv');}):[];
      var idx=sib.indexOf(el); if(idx>0 && !el.classList.contains('rv-clip')) el.style.transitionDelay=Math.min(idx*0.08,0.4)+'s';
      io.observe(el);
    });
    // other animated blocks
    ['.week','.cmp','.model-visual','.path'].forEach(function(s){ var el=d.querySelector(s); if(el && !el.classList.contains('rv')) io.observe(el); });
  } else { rvs.forEach(onIn); }
  // set counters to 0 before they animate (only when JS runs)
  if(!reduce) [].forEach.call(d.querySelectorAll('[data-count]'),function(el){ var r=el.getBoundingClientRect(); if(r.top>window.innerHeight) el.textContent='0'; });

  /* top bar, progress, dots, timeline fill */
  var bar=d.getElementById('topbar'), prog=d.getElementById('progress'), dots=d.querySelector('.dots');
  var secs=[].slice.call(d.querySelectorAll('main > section'));
  var tl=d.getElementById('timeline'), tlFill=d.getElementById('tlFill');
  var ticking=false;
  var update=function(){
    ticking=false;
    var y=window.scrollY||0, h=root.scrollHeight-window.innerHeight;
    prog.style.transform='scaleX('+(h>0?Math.min(y/h,1):0)+')';
    var vh=window.innerHeight, cur=secs[0];
    secs.forEach(function(s){ if(s.getBoundingClientRect().top<=vh*0.45) cur=s; });
    var heroBottom=secs[0].getBoundingClientRect().bottom;
    var darkUnder = cur.getAttribute('data-theme')==='dark';
    bar.classList.toggle('solid', heroBottom<70);
    if(dots){ [].forEach.call(dots.children,function(a){ a.classList.toggle('on',a.dataset.s===cur.id); }); dots.classList.toggle('dark',darkUnder); }
    if(tl && tlFill){
      var r=tl.getBoundingClientRect(); var p=(vh*0.75-r.top)/(r.height);
      p=Math.max(0,Math.min(1,p));
      var horiz=window.innerWidth>=1000;
      tlFill.style.transform=horiz?'scaleX('+p+')':'scaleY('+p+')';
    }
  };
  var req=function(){ if(!ticking){ ticking=true; requestAnimationFrame(update);} };
  window.addEventListener('scroll',req,{passive:true}); window.addEventListener('resize',req); update();

  /* menu */
  var mb=d.getElementById('menuBtn'), menu=d.getElementById('menu');
  var setMenu=function(open){
    mb.setAttribute('aria-expanded',open);
    if(open){ menu.hidden=false; requestAnimationFrame(function(){menu.classList.add('open');}); d.body.style.overflow='hidden'; }
    else { menu.classList.remove('open'); d.body.style.overflow=''; setTimeout(function(){ if(mb.getAttribute('aria-expanded')==='false') menu.hidden=true; },350); }
  };
  mb.addEventListener('click',function(){ setMenu(mb.getAttribute('aria-expanded')!=='true'); });
  menu.addEventListener('click',function(e){ if(e.target.closest('a')) setMenu(false); });
  d.addEventListener('keydown',function(e){ if(e.key==='Escape') setMenu(false); });

  /* video: plays only on click */
  var v=d.getElementById('heroVideo'), vf=d.getElementById('videoFrame'), vp=d.getElementById('videoPlay'), pc=d.getElementById('playCta');
  var play=function(){ vf.classList.add('playing');
    var p=v.play();
    if(p&&p.catch) p.catch(function(){ try{ v.load(); var p2=v.play(); if(p2&&p2.catch) p2.catch(function(){ /* deja los controles nativos visibles */ }); }catch(e){} });
  };
  v.addEventListener('error',function(){ vf.classList.add('playing'); },true);
  vp.addEventListener('click',play);
  pc.addEventListener('click',function(){ vf.scrollIntoView({behavior:reduce?'auto':'smooth',block:'center'}); play(); });
  v.addEventListener('play',function(){ vf.classList.add('playing'); });
  v.addEventListener('ended',function(){ vf.classList.remove('playing'); });

  /* REACT cards */
  var cards=[].slice.call(d.querySelectorAll('.rc'));
  cards.forEach(function(c){ c.addEventListener('click',function(){ var o=c.getAttribute('aria-expanded')==='true'; cards.forEach(function(k){ k.setAttribute('aria-expanded','false'); }); c.setAttribute('aria-expanded',!o); }); });
  var letters=[].slice.call(d.querySelectorAll('.react-word span'));
  if(cards.length) letters.forEach(function(l,i){ l.style.cursor='pointer'; l.addEventListener('click',function(){ cards.forEach(function(c,j){ c.setAttribute('aria-expanded', j===i); }); if(cards[i]) cards[i].scrollIntoView({behavior:reduce?'auto':'smooth',block:'center'}); }); });
  // open the first card by default so the interaction is evident
  if(cards[0]) cards[0].setAttribute('aria-expanded','true');

  /* second video: shows itself once assets/video/WEGO_Capullos_contribucion.mp4 exists */
  var cf=d.getElementById('contribFrame');
  if(cf && cf.dataset.src){
    var cv=d.createElement('video'); cv.controls=true; cv.preload='metadata'; cv.playsInline=true; cv.setAttribute('poster',cf.querySelector('.soon-poster').getAttribute('src'));
    cv.addEventListener('loadedmetadata',function(){ cf.classList.remove('vf-soon'); cf.classList.add('vf-ready'); cf.innerHTML=''; cf.appendChild(cv); });
    cv.src=cf.dataset.src;
  }

  /* CTA y flecha: llevar al video 2 y dejarlo visible */
  [].forEach.call(d.querySelectorAll('a[href="#contribucion"].btn-cta, a.scroll-more'),function(a){ a.addEventListener('click',function(e){ var f=d.getElementById('contribFrame'); if(!f) return; e.preventDefault(); f.scrollIntoView({behavior:reduce?'auto':'smooth',block:'center'}); if(history.replaceState) history.replaceState(null,'','#contribucion'); }); });

  /* print: make everything visible */
  window.addEventListener('beforeprint',function(){ rvs.forEach(onIn); ['.week','.cmp','.model-visual','.path'].forEach(function(s){var el=d.querySelector(s); if(el) el.classList.add('in');}); cards.forEach(function(c){c.setAttribute('aria-expanded','true');}); });
})();
