(function(){
  var root=document.documentElement;
  function set(l){
    root.lang=l;
    try{localStorage.setItem('agro-lang',l)}catch(e){}
    if(window.__T)document.title=__T[l]||__T.en;
    document.querySelectorAll('.langs button').forEach(function(b){b.setAttribute('aria-pressed',b.dataset.lang===l)});
  }
  document.querySelectorAll('.langs button').forEach(function(b){b.addEventListener('click',function(){set(b.dataset.lang)})});
  set(root.lang==='es'?'es':'en');
  // play decorative loops only while visible (saves data on mobile)
  if('IntersectionObserver' in window){
    var io=new IntersectionObserver(function(es){es.forEach(function(e){var v=e.target;if(e.isIntersecting){if(v.preload==='none')v.preload='auto';var p=v.play();if(p&&p.catch)p.catch(function(){})}else v.pause()})},{rootMargin:'200px'});
    document.querySelectorAll('video[autoplay]').forEach(function(v){io.observe(v)});
  }
})();
