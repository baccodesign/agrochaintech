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
  if(wrap){if(reduce)wrap.classList.add('paused');show(0)}

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

  /* formulario de contacto → FormSubmit → correo de AgroChain (copia a Jorge) */
  var form=document.getElementById('cform');
  if(form){
    function show(c){form.querySelectorAll('.fmsg').forEach(function(m){m.hidden=!m.classList.contains(c)})}
    var fm=form.querySelector('.fmail');if(fm)fm.remove();
    form.addEventListener('submit',function(e){
      e.preventDefault();
      if(form.classList.contains('sending'))return;
      var d=new FormData(form);
      var data={name:(d.get('name')||'').trim(),email:(d.get('email')||'').trim(),company:(d.get('company')||'').trim(),message:(d.get('message')||'').trim(),_honey:d.get('_honey')||''};
      if(data._honey)return;
      if(!data.name||!data.message||!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(data.email)){show('inv');return}
      form.classList.add('sending');show('none');
      // Envío directo desde el navegador del visitante (FormSubmit). Destino: BACCO Design + copia a Adriana.
      var EP=['infobaccodesign','gmail.com'].join('@'),CC=['adrianasotonegron','gmail.com'].join('@');
      var payload={name:data.name,email:data.email,company:data.company,message:data.message,_replyto:data.email,_cc:CC,
        _subject:'Nuevo mensaje desde agrochaintech.com — '+data.name,_template:'table',_captcha:'false'};
      function attempt(n){
        return fetch('https://formsubmit.co/ajax/'+EP,{method:'POST',headers:{'Content-Type':'application/json','Accept':'application/json'},body:JSON.stringify(payload)})
          .then(function(r){return r.text().then(function(t){var j={};try{j=JSON.parse(t)}catch(e){}return {s:r.status,j:j}})})
          .then(function(r){if(String(r.j.success)==='true')return {ok:true};if((r.s>=500||!r.s)&&n>1)return new Promise(function(res){setTimeout(res,1200)}).then(function(){return attempt(n-1)});if(window.console)console.warn('Contact form:',r.s,r.j&&r.j.message);return {ok:false}},
                function(){return n>1?new Promise(function(res){setTimeout(res,1200)}).then(function(){return attempt(n-1)}):{ok:false}});
      }
      attempt(3)
        .then(function(j){if(j.ok){form.reset();show('ok')}else show('err')})
        .then(function(){form.classList.remove('sending')});
    });
  }

  /* Radar de noticias (página de Noticias) — lee /api/news */
  var radar=document.getElementById('radar');
  if(radar){
    var ALL=[],shown=12,state={t:'all',l:null,q:''};
    var TL={traceability:['Traceability','Trazabilidad'],foodsafety:['Food safety','Inocuidad'],logistics:['Supply chain','Cadena de suministro'],agtech:['AgTech','Agrotecnología'],blockchain:['Blockchain','Blockchain'],agrifood:['Agri-food','Agroalimentario']};
    function es(){return root.lang==='es'}
    function tl(k){return (TL[k]||[k,k])[es()?1:0]}
    function esc(t){return String(t||'').replace(/[&<>"]/g,function(c){return{'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]})}
    function ago(iso){
      var m=Math.max(1,Math.round((Date.now()-Date.parse(iso))/60000)),E=es();
      if(m<60)return E?'hace '+m+' min':m+' min ago';
      var h=Math.round(m/60); if(h<24)return E?'hace '+h+' h':h+' h ago';
      var d=Math.round(h/24); return E?(d===1?'ayer':'hace '+d+' días'):(d===1?'yesterday':d+' days ago');
    }
    function art(i){
      var t=i.topics[0];
      var ic={traceability:'<path d="M3 7V4h3M21 7V4h-3M3 17v3h3M21 17v3h-3M7 8v8M10 8v8M13 8v8M17 8v8"/>',foodsafety:'<path d="M12 3 4 6v6c0 5 3.5 8 8 9 4.5-1 8-4 8-9V6z"/><path d="m8.5 12 2.5 2.5 4.5-5"/>',logistics:'<path d="M2 7h12v10H2zM14 11h4l4 4v2h-8"/><circle cx="6" cy="18" r="2"/><circle cx="18" cy="18" r="2"/>',agtech:'<path d="M12 21v-9"/><path d="M12 13c0-4 3-7 8-7 0 4.5-3 7-8 7zM12 16c0-3.5-2.5-6-7-6 0 4 2.5 6 7 6z"/>',blockchain:'<path d="m12 2 9 5v10l-9 5-9-5V7z"/><path d="m3 7 9 5 9-5M12 12v10"/>',agrifood:'<path d="M12 21c5 0 8-4 8-9-4 0-8 2-8 9zM12 21c-5 0-8-4-8-9 4 0 8 2 8 9zM12 12V3"/>'}[t]||'';
      return '<div class="rart t-'+t+'"><svg class="rart-ic" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">'+ic+'</svg>'+(i.image?'<img src="'+esc(i.image)+'" alt="" loading="lazy" referrerpolicy="no-referrer" onerror="this.remove()">':'')+'<span class="rart-t">'+esc(tl(t))+'</span></div>';
    }
    function meta(i){return '<span class="rm mono"><span class="src">'+esc(i.source)+'</span><span>'+ago(i.date)+'</span>'+(i.lang==='en'&&es()?'<span class="lg">EN</span>':i.lang==='es'&&!es()?'<span class="lg">ES</span>':'')+'</span>'}
    function list(){
      var q=state.q.toLowerCase();
      return ALL.filter(function(i){
        return (state.l==='all'||i.lang===state.l)&&(state.t==='all'||i.topics.indexOf(state.t)>-1)&&(!q||(i.title+' '+i.summary+' '+i.source).toLowerCase().indexOf(q)>-1);
      });
    }
    function counts(){
      var base=ALL.filter(function(i){return state.l==='all'||i.lang===state.l});
      radar.querySelectorAll('.rchips button').forEach(function(b){
        var k=b.dataset.t,n=k==='all'?base.length:base.filter(function(i){return i.topics.indexOf(k)>-1}).length;
        b.querySelector('i').textContent=n;b.hidden=n===0&&k!=='all';
      });
    }
    function render(){
      var L0=list(),f=L0.filter(function(i){return i.image})[0]||L0[0],L=f?[f].concat(L0.filter(function(i){return i!==f})):L0;
      counts();
      radar.querySelector('.rempty').hidden=L.length>0;
      var feat=radar.querySelector('.rfeat'),lat=radar.querySelector('.rlatest'),grid=radar.querySelector('.rgrid'),more=radar.querySelector('.rmore button');
      feat.classList.remove('skel');
      if(!f){feat.hidden=true;lat.innerHTML='';grid.innerHTML='';more.hidden=true;return}
      feat.hidden=false;feat.href=f.link;
      feat.innerHTML=art(f)+'<div class="rf-b">'+meta(f)+'<h3>'+esc(f.title)+'</h3><p>'+esc(f.summary)+'</p><span class="rgo">'+(es()?'Leer noticia':'Read story')+' ↗</span></div>';
      lat.innerHTML='<li class="rl-h mono">'+(es()?'Lo último':'Latest')+'</li>'+L.slice(1,6).map(function(i){return '<li><a href="'+esc(i.link)+'" target="_blank" rel="noopener">'+meta(i)+'<b>'+esc(i.title)+'</b></a></li>'}).join('');
      grid.innerHTML=L.slice(6,6+shown).map(function(i,k){return '<a class="rcard" style="--d:'+(k%6)*60+'ms" href="'+esc(i.link)+'" target="_blank" rel="noopener">'+art(i)+'<div class="rc-b">'+meta(i)+'<h4>'+esc(i.title)+'</h4></div></a>'}).join('');
      more.hidden=L.length<=6+shown;
    }
    function ticker(){
      var tk=document.querySelector('.nticker .track');if(!tk)return;
      var L=ALL.filter(function(i){return i.lang===(es()?'es':'en')}).slice(0,10);if(!L.length)L=ALL.slice(0,10);
      var h=L.map(function(i){return '<a href="'+esc(i.link)+'" target="_blank" rel="noopener">'+esc(i.title)+'</a>'}).join('');
      tk.innerHTML=h+h;
    }
    function upd(iso){radar.querySelector('.upd').textContent=(es()?'actualizado ':'updated ')+ago(iso)}
    var updated=null;
    function setLang(l){state.l=l;radar.querySelectorAll('.rlang button').forEach(function(b){b.setAttribute('aria-pressed',b.dataset.l===l)});shown=12;render()}
    radar.querySelectorAll('.rlang button').forEach(function(b){b.addEventListener('click',function(){setLang(b.dataset.l)})});
    radar.querySelectorAll('.rchips button').forEach(function(b){b.addEventListener('click',function(){
      state.t=b.dataset.t;radar.querySelectorAll('.rchips button').forEach(function(o){o.setAttribute('aria-pressed',o===b)});shown=12;render()})});
    var qt;radar.querySelector('#rq').addEventListener('input',function(e){clearTimeout(qt);qt=setTimeout(function(){state.q=e.target.value.trim();shown=12;render()},180)});
    radar.querySelector('.rmore button').addEventListener('click',function(){shown+=12;render()});
    document.querySelectorAll('.langs button').forEach(function(b){b.addEventListener('click',function(){if(!ALL.length)return;setLang(b.dataset.lang==='es'?'es':'en');ticker();if(updated)upd(updated)})});
    function load(){
      return fetch('/api/news',{headers:{'Accept':'application/json'}}).then(function(r){if(!r.ok)throw 0;return r.json()}).then(function(j){
        if(!j.items||!j.items.length)throw 0;
        ALL=j.items;updated=j.updated;radar.dataset.state='ready';
        if(state.l===null)state.l=es()?'es':'en';
        setLang(state.l);ticker();upd(updated);
      }).catch(function(){if(!ALL.length){radar.dataset.state='error';radar.querySelector('.rerr').hidden=false;radar.querySelector('.rtop').hidden=true;var tk=document.querySelector('.nticker');if(tk)tk.hidden=true}});
    }
    load();
    setInterval(function(){if(!document.hidden)load()},30*60000);
    setInterval(function(){if(updated)upd(updated)},60000);
  }

  /* Cintillo de mercados agrícolas + noticias (página principal) */
  var band=document.querySelector('.mband');
  if(band){
    var MK=[],NW=[];
    function isEs(){return root.lang==='es'}
    function esc2(t){return String(t||'').replace(/[&<>"]/g,function(c){return{'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]})}
    function fmt(v,u){var d=v>=1000?0:v<1?3:2;return 'US$'+v.toLocaleString(isEs()?'es-CO':'en-US',{minimumFractionDigits:d,maximumFractionDigits:d})+'/'+u}
    function spark(arr,w,h){
      if(!arr||arr.length<2)return '';
      var mn=Math.min.apply(null,arr),mx=Math.max.apply(null,arr),r=mx-mn||1;
      return arr.map(function(v,i){return (i?'L':'M')+(i*(w/(arr.length-1))).toFixed(1)+' '+(h-2-(v-mn)/r*(h-4)).toFixed(1)}).join(' ');
    }
    function loop(row,html,pps){
      var tr=row.querySelector('.mtrack');tr.innerHTML='<div class="mset">'+html+'</div><div class="mset" aria-hidden="true">'+html+'</div>';
      tr.querySelectorAll('.mset[aria-hidden] a, .mset[aria-hidden] button').forEach(function(e){e.tabIndex=-1});
      var w=tr.querySelector('.mset').scrollWidth;tr.style.setProperty('--dur',Math.max(40,w/(pps||30))+'s');row.hidden=false;
    }
    function drawPrices(){
      if(!MK.length)return;
      loop(band.querySelector('.mprices'),MK.map(function(m,i){
        var up=m.change>=0,cls=m.change===0?'eq':up?'up':'dn';
        return '<button type="button" class="mi '+cls+'" data-i="'+i+'"><b>'+esc2(isEs()?m.es:m.en)+'</b><span class="mv">'+fmt(m.price,m.unit)+'</span><span class="mc">'+(up?'▲':'▼')+' '+Math.abs(m.pct).toFixed(2)+'%</span><svg viewBox="0 0 60 20" aria-hidden="true"><path d="'+spark(m.series,60,20)+'"/></svg></button>';
      }).join(''),32);
      band.querySelectorAll('.mprices .mi').forEach(function(b){b.addEventListener('click',function(){openPanel(+b.dataset.i)})});
    }
    function drawNews(){
      if(!NW.length)return;
      var L=NW.filter(function(i){return i.lang===(isEs()?'es':'en')}).slice(0,12);if(!L.length)L=NW.slice(0,12);
      loop(band.querySelector('.mnews'),L.map(function(i){return '<a class="mi" href="'+esc2(i.link)+'" target="_blank" rel="noopener"><span class="msrc">'+esc2(i.source)+'</span>'+esc2(i.title)+'</a>'}).join(''),16);
    }
    var panel=band.querySelector('.mpanel'),openI=-1;
    function openPanel(i){
      var m=MK[i];if(!m)return;openI=i;
      var up=m.change>=0,E=isEs();
      panel.querySelector('.mp-sym').textContent=m.symbol+' · '+(E?'futuros':'futures');
      panel.querySelector('.mp-name').textContent=E?m.es:m.en;
      panel.querySelector('.mp-price').innerHTML='<b>'+fmt(m.price,m.unit)+'</b><span class="'+(up?'up':'dn')+'">'+(up?'▲ +':'▼ ')+m.change.toFixed(m.price>=1000?0:3)+' ('+(up?'+':'')+m.pct.toFixed(2)+'%)</span>';
      var d=spark(m.series,600,160);
      panel.querySelector('.mp-chart').innerHTML='<path class="area" d="'+d+' L600 160 L0 160 Z"/><path class="line" d="'+d+'"/>';
      var t=m.time?new Date(m.time):null;
      panel.querySelector('.mp-stats').innerHTML='<div><dt>'+(E?'Máximo 1 mes':'1-month high')+'</dt><dd>'+fmt(m.high,m.unit)+'</dd></div><div><dt>'+(E?'Mínimo 1 mes':'1-month low')+'</dt><dd>'+fmt(m.low,m.unit)+'</dd></div><div><dt>'+(E?'Último dato':'Last update')+'</dt><dd>'+(t?t.toLocaleString(E?'es-CO':'en-US',{dateStyle:'medium',timeStyle:'short'}):'—')+'</dd></div><div><dt>'+(E?'Fuente':'Source')+'</dt><dd>Yahoo Finance · '+(E?'referencial, con retraso':'reference, delayed')+'</dd></div>';
      panel.hidden=false;band.classList.add('paused','open');
      band.querySelectorAll('.mprices .mi').forEach(function(b){b.classList.toggle('sel',+b.dataset.i===i)});
    }
    function closePanel(){panel.hidden=true;openI=-1;band.classList.remove('open');if(!band.classList.contains('hold'))band.classList.remove('paused');band.querySelectorAll('.mi.sel').forEach(function(b){b.classList.remove('sel')})}
    panel.querySelector('.mp-x').addEventListener('click',closePanel);
    document.addEventListener('keydown',function(e){if(e.key==='Escape'&&!panel.hidden)closePanel()});
    var pb=band.querySelector('.mpause');
    pb.addEventListener('click',function(){var h=band.classList.toggle('hold');band.classList.toggle('paused',h||!panel.hidden);pb.setAttribute('aria-pressed',h)});
    document.querySelectorAll('.langs button').forEach(function(b){b.addEventListener('click',function(){drawPrices();drawNews();if(openI>-1)openPanel(openI)})});
    function loadM(){return fetch('/api/markets').then(function(r){return r.ok?r.json():null}).then(function(j){if(j&&j.items&&j.items.length){MK=j.items;drawPrices();if(openI>-1)openPanel(openI)}}).catch(function(){})}
    function loadN(){return fetch('/api/news').then(function(r){return r.ok?r.json():null}).then(function(j){if(j&&j.items&&j.items.length){NW=j.items;drawNews()}}).catch(function(){})}
    loadM();loadN();
    setInterval(function(){if(!document.hidden){loadM();loadN()}},15*60000);
  }
})();
