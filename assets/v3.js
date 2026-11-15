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

  /* año del copyright: se actualiza solo */
  var y=new Date().getFullYear();
  document.querySelectorAll('.yr').forEach(function(e){e.textContent=y});

  /* proyectos: explorador + filtros + pantalla completa */
  var pex=document.querySelector('.pex');
  if(pex){
    var imgs=[].slice.call(pex.querySelectorAll('.stage-imgs img')),caps=[].slice.call(pex.querySelectorAll('.cap')),
        btns=[].slice.call(pex.querySelectorAll('.pi')),count=pex.querySelector('.count b'),prog=pex.querySelector('.prog i'),
        cur=0,timer=null,DUR=6000;
    function visible(){return btns.filter(function(b){return !b.parentNode.hidden}).map(function(b){return +b.dataset.i})}
    function go(i,user){
      cur=i;
      imgs.forEach(function(e){e.classList.toggle('on',+e.dataset.i===i)});
      caps.forEach(function(e){e.classList.toggle('on',+e.dataset.i===i)});
      btns.forEach(function(e){var on=+e.dataset.i===i;e.classList.toggle('on',on);e.setAttribute('aria-pressed',on)});
      count.textContent=('0'+(i+1)).slice(-2);
      if(user)stop();else restart();
    }
    function step(d){var v=visible(),k=v.indexOf(cur);go(v[(k+d+v.length)%v.length],true)}
    function restart(){if(reduce||pex.dataset.stopped)return;clearTimeout(timer);prog.style.animation='none';void prog.offsetWidth;prog.style.animation='';
      timer=setTimeout(function(){var v=visible(),k=v.indexOf(cur);go(v[(k+1)%v.length])},DUR)}
    function stop(){pex.dataset.stopped='1';clearTimeout(timer);pex.classList.add('stopped')}
    btns.forEach(function(b){b.addEventListener('click',function(){go(+b.dataset.i,true)})});
    pex.querySelector('.prev').addEventListener('click',function(){step(-1)});
    pex.querySelector('.next').addEventListener('click',function(){step(1)});
    pex.addEventListener('keydown',function(e){if(e.key==='ArrowRight'){step(1);e.preventDefault()}else if(e.key==='ArrowLeft'){step(-1);e.preventDefault()}});
    var tx=null,st=pex.querySelector('.stage');
    st.addEventListener('touchstart',function(e){tx=e.touches[0].clientX},{passive:true});
    st.addEventListener('touchend',function(e){if(tx===null)return;var d=e.changedTouches[0].clientX-tx;if(Math.abs(d)>40)step(d<0?1:-1);tx=null});
    document.querySelectorAll('.pfilter button').forEach(function(f){f.addEventListener('click',function(){
      document.querySelectorAll('.pfilter button').forEach(function(o){o.setAttribute('aria-pressed',o===f)});
      btns.forEach(function(b){var li=b.parentNode;li.hidden=!(f.dataset.f==='all'||li.dataset.g===f.dataset.f)});
      go(visible()[0],true);
    })});
    /* pantalla completa */
    var lb=document.querySelector('.lb'),lbi=lb.querySelector('img'),lbc=lb.querySelector('figcaption');
    function fill(){var im=imgs[cur];lbi.src=im.src;lbi.alt=im.alt;lbc.innerHTML=caps[cur].innerHTML}
    pex.querySelector('.zoom').addEventListener('click',function(){stop();fill();if(lb.showModal)lb.showModal();else lb.setAttribute('open','')});
    st.querySelector('.stage-imgs').addEventListener('click',function(){pex.querySelector('.zoom').click()});
    lb.querySelector('.lb-x').addEventListener('click',function(){lb.close?lb.close():lb.removeAttribute('open')});
    lb.querySelector('.lb-p').addEventListener('click',function(){step(-1);fill()});
    lb.querySelector('.lb-n').addEventListener('click',function(){step(1);fill()});
    lb.addEventListener('keydown',function(e){if(e.key==='ArrowRight'){step(1);fill()}else if(e.key==='ArrowLeft'){step(-1);fill()}});
    lb.addEventListener('click',function(e){if(e.target===lb)lb.close()});
    var lx=null;lb.addEventListener('touchstart',function(e){lx=e.touches[0].clientX},{passive:true});
    lb.addEventListener('touchend',function(e){if(lx===null)return;var d=e.changedTouches[0].clientX-lx;if(Math.abs(d)>40){step(d<0?1:-1);fill()}lx=null});
    if('IntersectionObserver' in window){new IntersectionObserver(function(es){if(es[0].isIntersecting&&!pex.dataset.started){pex.dataset.started='1';restart()}},{threshold:.4}).observe(pex)}
  }

  /* formulario de contacto (FormSubmit → correo de AgroChain) */
  var form=document.getElementById('cform');
  if(form){
    var TO='gonzalezjorge72'+'@'+'yahoo.com';
    function show(c){form.querySelectorAll('.fmsg').forEach(function(m){m.hidden=!m.classList.contains(c)})}
    form.addEventListener('submit',function(e){
      e.preventDefault();
      var d=new FormData(form);
      if(d.get('_honey'))return;
      var name=(d.get('name')||'').trim(),email=(d.get('email')||'').trim(),msg=(d.get('message')||'').trim();
      if(!name||!msg||!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)){show('inv');return}
      form.classList.add('sending');show('none');
      fetch('https://formsubmit.co/ajax/'+TO,{method:'POST',headers:{'Content-Type':'application/json','Accept':'application/json'},
        body:JSON.stringify({name:name,email:email,company:(d.get('company')||'').trim(),message:msg,
          _subject:'Nuevo mensaje desde agrochaintech.com — '+name,_template:'table',_captcha:'false',_honey:''})})
      .then(function(r){return r.json().then(function(j){return {ok:r.ok,j:j}})})
      .then(function(r){if(r.ok&&String(r.j.success)==='true'){form.reset();show('ok')}else{show('err')}})
      .catch(function(){show('err')})
      .then(function(){form.classList.remove('sending')});
    });
  }
})();
