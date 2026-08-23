// حواشٍ مرقّمة + تحكّم بالوضع الليلي وحجم الخط (يُحفظ محليًّا)
(function(){
  var root=document.documentElement;

  // 1) طبّق حجم الخط المحفوظ فورًا
  var FS_KEY='risala-fs', TH_KEY='risala-theme';
  var fs=parseInt(localStorage.getItem(FS_KEY)||'112',10);
  root.style.setProperty('--fs', fs+'%');
  var savedTheme=localStorage.getItem(TH_KEY);
  if(savedTheme) root.setAttribute('data-theme', savedTheme);

  // 2) الحواشي
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

  // 3) شريط التحكّم — يستبدل زر ◐ القديم
  var old=document.getElementById('tt'); if(old) old.remove();
  var ctl=document.createElement('div'); ctl.className='ctl';
  ctl.innerHTML='<button id="c-th" aria-label="الوضع الليلي">◐</button>'
              +'<button id="c-dn" aria-label="تصغير الخط">A−</button>'
              +'<button id="c-up" aria-label="تكبير الخط">A+</button>';
  document.body.appendChild(ctl);

  function setFs(v){ fs=Math.max(88,Math.min(196,v)); root.style.setProperty('--fs',fs+'%'); localStorage.setItem(FS_KEY,fs); }
  document.getElementById('c-up').addEventListener('click',function(){ setFs(fs+12); });
  document.getElementById('c-dn').addEventListener('click',function(){ setFs(fs-12); });
  document.getElementById('c-th').addEventListener('click',function(){
    var cur=root.getAttribute('data-theme');
    var dark=cur?cur==='dark':matchMedia('(prefers-color-scheme:dark)').matches;
    var next=dark?'light':'dark'; root.setAttribute('data-theme',next); localStorage.setItem(TH_KEY,next);
  });
})();
