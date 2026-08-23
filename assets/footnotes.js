// قارئ الرسالة: حواشٍ + تحكّم + وضع الكتاب (صفحات حقيقية بلا قصّ) + حفظ الموضع
(function(){
  var root=document.documentElement, body=document.body;
  var FS_KEY='risala-fs', TH_KEY='risala-theme', PG_KEY='risala-paged';
  var GAP=52;

  // ---- إعدادات محفوظة ----
  var fs=parseInt(localStorage.getItem(FS_KEY)||'112',10);
  root.style.setProperty('--fs', fs+'%');
  var savedTheme=localStorage.getItem(TH_KEY);
  if(savedTheme) root.setAttribute('data-theme', savedTheme);
  var pagedPref=localStorage.getItem(PG_KEY);
  var paged=(pagedPref===null)?true:(pagedPref==='1');

  // ---- الحواشي ----
  var arNum=function(n){return String(n).replace(/[0-9]/g,function(d){return "٠١٢٣٤٥٦٧٨٩"[d]})};
  document.querySelectorAll('.matn').forEach(function(matn,ai){
    var terms=matn.querySelectorAll('.g'); if(!terms.length) return;
    var ol=document.createElement('ol'); ol.className='notes';
    ol.innerHTML='<div class="nh">حواشٍ وشروح</div>';
    terms.forEach(function(t,i){
      var n=i+1, rid='r'+ai+'-'+n, fid='f'+ai+'-'+n, an=arNum(n);
      t.setAttribute('title', t.dataset.note);
      var sup=document.createElement('sup'); sup.className='fn';
      sup.innerHTML='<a id="'+rid+'" href="#'+fid+'">'+an+'</a>';
      t.after(sup);
      var li=document.createElement('li'); li.id=fid;
      li.innerHTML='<span class="fnum"><a href="#'+rid+'">'+an+'.</a></span><span><b>'+t.textContent+'</b> — '+t.dataset.note+'</span>';
      ol.appendChild(li);
    });
    var src=matn.querySelector('.src');
    if(src){ src.before(ol); } else { matn.appendChild(ol); }
  });

  // ---- شريط التحكّم ----
  var old=document.getElementById('tt'); if(old) old.remove();
  var ctl=document.createElement('div'); ctl.className='ctl';
  ctl.innerHTML='<button id="c-pg" aria-label="وضع الكتاب">▤</button>'
              +'<button id="c-th" aria-label="الوضع الليلي">◐</button>'
              +'<button id="c-dn" aria-label="تصغير الخط">A−</button>'
              +'<button id="c-up" aria-label="تكبير الخط">A+</button>';
  document.body.appendChild(ctl);

  var hint=document.createElement('div'); hint.className='taphint'; document.body.appendChild(hint);
  var hintT;
  function showHint(msg){ hint.textContent=msg; hint.classList.add('show'); clearTimeout(hintT);
    hintT=setTimeout(function(){ hint.classList.remove('show'); },1000); }

  var ind=document.createElement('div'); ind.className='pageind'; document.body.appendChild(ind);

  // ---- محرّك وضع الكتاب ----
  var flow=document.querySelector('.wrap'), vp=null, step=0, pages=1, cur=0;
  var PAGEKEY='risala-pg:'+location.pathname;

  function layout(){
    var colW=flow.clientWidth;
    flow.style.columnWidth=colW+'px';
    step=colW+GAP;
    // فرض إعادة التخطيط ثم القياس
    var total=flow.scrollWidth;
    pages=Math.max(1, Math.round((total+GAP)/step));
  }
  function render(){
    flow.style.setProperty('--px', (cur*step)+'px');
    ind.textContent='صفحة '+arNum(cur+1)+' / '+arNum(pages);
    localStorage.setItem(PAGEKEY, cur);
  }
  function setPage(p){ cur=Math.max(0,Math.min(pages-1,p)); render(); }
  function enterPaged(){
    try{
      body.classList.add('paged');
      vp=document.createElement('div'); vp.id='vp';
      flow.parentNode.insertBefore(vp, flow); vp.appendChild(flow);
      layout();
      var saved=parseInt(localStorage.getItem(PAGEKEY)||'0',10);
      cur=isNaN(saved)?0:Math.min(saved,pages-1); render();
      ind.style.display='';
    }catch(e){ exitPaged(); }
  }
  function exitPaged(){
    body.classList.remove('paged');
    if(vp){ vp.parentNode.insertBefore(flow, vp); vp.remove(); vp=null; }
    flow.style.removeProperty('--px'); flow.style.removeProperty('column-width');
    ind.style.display='none';
  }
  function relayout(){ if(!paged) return; var c=cur; layout(); setPage(c); }

  // ---- الأزرار ----
  function setFs(v){ fs=Math.max(88,Math.min(196,v)); root.style.setProperty('--fs',fs+'%'); localStorage.setItem(FS_KEY,fs); relayout(); }
  document.getElementById('c-up').addEventListener('click',function(){ setFs(fs+12); });
  document.getElementById('c-dn').addEventListener('click',function(){ setFs(fs-12); });
  document.getElementById('c-th').addEventListener('click',function(){
    var curT=root.getAttribute('data-theme');
    var dark=curT?curT==='dark':matchMedia('(prefers-color-scheme:dark)').matches;
    var next=dark?'light':'dark'; root.setAttribute('data-theme',next); localStorage.setItem(TH_KEY,next);
  });
  document.getElementById('c-pg').addEventListener('click',function(){
    paged=!paged; localStorage.setItem(PG_KEY, paged?'1':'0');
    if(paged){ enterPaged(); showHint('وضع الكتاب'); } else { exitPaged(); showHint('وضع التمرير'); }
  });

  // ---- اللمس: يسار=التالي، يمين=السابق، الوسط=الأدوات ----
  function toggleUI(){ body.classList.toggle('hide-ui');
    showHint(body.classList.contains('hide-ui')?'وضع القراءة':'الأدوات ظاهرة'); }
  document.addEventListener('click', function(e){
    var fn=e.target.closest('sup.fn a, .notes .fnum a');
    if(fn){ if(paged) e.preventDefault(); return; }   // في وضع الكتاب لا نقفز
    if(e.target.closest('a,button')) return;
    var w=window.innerWidth, x=e.clientX;
    if(paged){
      if(x<w*0.35) setPage(cur+1);
      else if(x>w*0.65) setPage(cur-1);
      else toggleUI();
    } else {
      var pg=Math.round(window.innerHeight*0.88);
      if(x<w*0.35) window.scrollBy(0,pg);
      else if(x>w*0.65) window.scrollBy(0,-pg);
      else toggleUI();
    }
  });

  window.addEventListener('resize', relayout);
  ['fullscreenchange','webkitfullscreenchange'].forEach(function(ev){
    document.addEventListener(ev, function(){
      var f=document.fullscreenElement||document.webkitFullscreenElement;
      body.classList.toggle('hide-ui', !!f);
      setTimeout(relayout, 60);
    });
  });

  // ---- تشغيل ----
  if(paged){ ind.style.display=''; enterPaged(); } else { ind.style.display='none'; }
})();
