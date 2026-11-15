(function(){
  var root=document.documentElement;
  var reduce=window.matchMedia&&matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* idioma: misma lógica y clave que el sitio original */
  function set(l){
    root.lang=l;
    try{sessionStorage.setItem('agro-lang',l)}catch(e){}
    if(window.__T)document.title=__T[l]||__T.en;
    document.querySelectorAll('.langs button').forEach(function(b){b.setAttribute('aria-pressed',b.dataset.lang===l)});
  }
  document.querySelectorAll('.langs button').forEach(function(b){b.addEventListener('click',function(){set(b.dataset.lang)})});
  set(root.lang==='es'?'es':'en');

  /* nav */
  var nav=document.querySelector('.nav'),burger=document.querySelector('.burger');
  function sc(){nav.classList.toggle('scrolled',scrollY>40)}
  addEventListener('scroll',sc,{passive:true});sc();
  burger.addEventListener('click',function(){var o=nav.classList.toggle('open');burger.setAttribute('aria-expanded',o)});
  nav.querySelectorAll('.links a').forEach(function(a){a.addEventListener('click',function(){nav.classList.remove('open')})});

  /* título del hero: palabras que suben */
  document.querySelectorAll('.hero h1 > span').forEach(function(lang){
    var i=0;
    lang.querySelectorAll('[data-split]').forEach(function(part){
      var words=part.textContent.trim().split(/\s+/);part.textContent='';
      words.forEach(function(w,k){
        var o=document.createElement('span');o.className='w';
        var s=document.createElement('span');s.textContent=w;s.style.animationDelay=(0.15+i*0.07)+'s';i++;
        o.appendChild(s);part.appendChild(o);if(k<words.length-1)part.appendChild(document.createTextNode(' '));
      });
    });
  });

  if('IntersectionObserver' in window){
    var ro=new IntersectionObserver(function(es){es.forEach(function(e){if(e.isIntersecting){e.target.classList.add('in');ro.unobserve(e.target)}})},{rootMargin:'0px 0px -10% 0px'});
    document.querySelectorAll('.rv').forEach(function(el){ro.observe(el)});
    var po=new IntersectionObserver(function(es){es.forEach(function(e){if(e.isIntersecting)e.target.classList.add('on')})},{rootMargin:'-30% 0px -45% 0px'});
    document.querySelectorAll('.story .paras p').forEach(function(p){po.observe(p)});
    var vo=new IntersectionObserver(function(es){es.forEach(function(e){var v=e.target;if(e.isIntersecting){if(v.preload==='none')v.preload='auto';var p=v.play();if(p&&p.catch)p.catch(function(){})}else v.pause()})},{rootMargin:'200px'});
    document.querySelectorAll('video[autoplay]').forEach(function(v){vo.observe(v)});
  }else{document.querySelectorAll('.rv').forEach(function(el){el.classList.add('in')});document.querySelectorAll('.story .paras p').forEach(function(p){p.classList.add('on')})}

  /* plataforma: pestañas con avance automático */
  var steps=[].slice.call(document.querySelectorAll('.step')),wrap=document.querySelector('.steps');
  function show(i){
    steps.forEach(function(s,k){s.setAttribute('aria-selected',k===i);s.tabIndex=k===i?0:-1;document.getElementById(s.getAttribute('aria-controls')).hidden=k!==i});
  }
  steps.forEach(function(s,i){
    s.addEventListener('click',function(){wrap.classList.add('paused');show(i)});
    s.addEventListener('keydown',function(e){var d=e.key==='ArrowRight'?1:e.key==='ArrowLeft'?-1:0;if(d){wrap.classList.add('paused');var n=(i+d+steps.length)%steps.length;show(n);steps[n].focus()}});
    s.querySelector('.bar').addEventListener('animationend',function(){if(!wrap.classList.contains('paused'))show((i+1)%steps.length)});
  });
  if(reduce)wrap.classList.add('paused');
  show(0);

  /* galería de proyectos: flechas y arrastre */
  var rail=document.querySelector('.rail');
  document.querySelectorAll('.ctrl button').forEach(function(b){b.addEventListener('click',function(){rail.scrollBy({left:(+b.dataset.dir)*rail.clientWidth*.7,behavior:reduce?'auto':'smooth'})})});
  var down=false,sx,sl,moved;
  rail.addEventListener('pointerdown',function(e){if(e.pointerType!=='mouse')return;down=true;moved=false;sx=e.clientX;sl=rail.scrollLeft;rail.classList.add('drag')});
  addEventListener('pointermove',function(e){if(!down)return;var dx=e.clientX-sx;if(Math.abs(dx)>3)moved=true;rail.scrollLeft=sl-dx});
  addEventListener('pointerup',function(){if(down){down=false;rail.classList.remove('drag')}});
  rail.addEventListener('click',function(e){if(moved){e.preventDefault();e.stopPropagation()}},true);
})();
