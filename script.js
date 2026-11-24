(function(){
  var tuto=document.getElementById('tuto'),seen=false,card=document.getElementById('card'),cv=document.getElementById('game'),ctx=cv.getContext('2d'),
      playBtn=document.getElementById('play'),elS=document.getElementById('score'),elL=document.getElementById('lives'),
      W=cv.width,H=cv.height,GY=200,GRAV=.46,K={left:0,right:0,up:0,fire:0},
      running=false,raf=0,p,solids,coins,enemies,bul,shells,boss,L,WORLD,camX=0,score=0,lives=5,best=0,level=1,banner=0,shT=0;
  var FONT='bold 22px "Bricolage Grotesque",system-ui,sans-serif';
  var TH=[
    {sky:'#c6b8ff',cl:'#ffffff',g:'#1f8a70',gt:'#7ee8a2',b:'#ff8fab',bs:'#c94f73',p:'#ff7a1a',pr:'#ffa14d'},
    {sky:'#ffd9a8',cl:'#fff3e0',g:'#7a3f98',gt:'#e58bd0',b:'#6dd3ff',bs:'#2a8cb5',p:'#2fbf71',pr:'#6fe0a0'},
    {sky:'#3b3c4a',cl:'#555a66',g:'#4a4033',gt:'#6b5b3e',b:'#7b7f86',bs:'#4a4d52',p:'#5a6b3a',pr:'#7f9450'},
    {sky:'#4d2222',cl:'#6a3030',g:'#3b3028',gt:'#7a2a1f',b:'#8a6f6f',bs:'#4a3a3a',p:'#6b5a2a',pr:'#8f7a3a'},
    {sky:'#120d1c',cl:'#201832',g:'#2a2238',gt:'#6a4a9a',b:'#444444',bs:'#222222',p:'#444444',pr:'#555555'}];
  var LV=[
    {n:'Nivel 1 \u00b7 Oficina abierta',msg:'Pisa a los bugs rojos y llega a la bandera verde',th:0,wd:3400,
     seg:[[0,700],[780,1300],[1380,2100],[2200,2800],[2880,3400]],pi:[[360,40],[1000,60],[1620,40],[1900,60],[2500,60]],
     rw:[[180,140,1,'q'],[200,140,1],[220,140,1,'q'],[540,140,4],[900,140,1,'q'],[1100,140,3],[1480,140,1,'q'],[1500,140,1],[1520,140,1,'q'],[1760,140,3],[2260,140,1,'q'],[2280,140,3],[2640,140,1,'q']],
     en:[300,600,880,1200,1450,1700,1950,2350,2600]},
    {n:'Nivel 2 \u00b7 Hora pico',msg:'M\u00e1s pozos: mant\u00e9n Correr para saltar lejos',th:1,wd:3600,
     seg:[[0,560],[660,1100],[1200,1650],[1760,2050],[2160,2800],[2900,3600]],pi:[[300,40],[760,60],[1380,60],[1900,40],[2400,60],[3100,40]],
     rw:[[160,140,1,'q'],[180,140,3],[620,140,1,'q'],[1130,140,3],[1500,140,1,'q'],[1520,140,2],[1730,140,2],[2100,140,2],[2300,140,1,'q'],[2320,140,3],[2850,140,1,'q'],[2870,140,2]],
     en:[280,520,800,980,1300,1500,1850,2250,2550,2700,3000,3150],sp:.8},
    {n:'Nivel 3 \u00b7 Zona de guerra',msg:'\u00a1Bombas! Mira las marcas rojas del suelo',th:2,wd:3800,
     seg:[[0,500],[600,1000],[1100,1600],[1700,2200],[2300,2900],[3000,3800]],pi:[[280,40],[800,40],[1300,40],[1900,40],[2600,40],[3300,40]],
     rw:[[360,140,1,'q'],[380,140,2],[700,140,3],[1180,140,1,'q'],[1200,140,2],[1500,140,2],[1960,140,3],[2400,140,1,'q'],[2420,140,2],[3150,140,3]],
     en:[400,900,1250,1800,2100,2450,3100],tu:[1,3,5],bm:150,sp:.8},
    {n:'Nivel 4 \u00b7 Frente de batalla',msg:'M\u00e1s bombas y torretas. Sigue avanzando',th:3,wd:4000,
     seg:[[0,450],[560,900],[1000,1400],[1510,1900],[2010,2400],[2510,3100],[3200,4000]],pi:[[250,40],[700,40],[1200,40],[1650,40],[2150,40],[2750,40],[3500,40]],
     rw:[[330,140,1,'q'],[350,140,2],[490,140,2],[960,140,2],[1450,140,2],[1950,140,2],[2450,140,2],[2840,140,1,'q'],[2860,140,2],[3130,140,2],[3350,140,3]],
     en:[380,620,850,1100,1350,1600,1800,2100,2300,2600,2950,3300],tu:[1,2,3,5,6],bm:95,sp:.9},
    {n:'Nivel 5 \u00b7 Goser',msg:'Esquiva las zonas rojas y pisa a Goser cuando est\u00e9 cansado',th:4,wd:520,boss:1}];

  function flip(){
    var f=card.classList.toggle('flipped');
    card.setAttribute('tabindex',f?'-1':'0');
    if(!f)stop();
  }
  card.addEventListener('click',function(){if(!card.classList.contains('flipped'))flip()});
  card.addEventListener('keydown',function(e){if((e.key==='Enter'||e.key===' ')&&e.target===card){e.preventDefault();flip()}});
  document.getElementById('flip').addEventListener('click',flip);
  document.getElementById('back-btn').addEventListener('click',function(e){e.stopPropagation();flip()});

  function keyMap(k){
    k=k.toLowerCase();
    if(k==='arrowleft'||k==='a')return'left';
    if(k==='arrowright'||k==='d')return'right';
    if(k==='arrowup'||k==='w'||k===' ')return'up';
    if(k==='j'||k==='z'||k==='x')return'fire';
  }
  function onKey(e,v){var m=keyMap(e.key);if(m&&running){K[m]=v;e.preventDefault()}}
  addEventListener('keydown',function(e){if(!tuto.hidden&&keyMap(e.key)){e.preventDefault();start();return}onKey(e,1)});
  addEventListener('keyup',function(e){onKey(e,0)});
  Array.prototype.forEach.call(document.querySelectorAll('.touch button'),function(b){
    var k=b.dataset.k;
    b.addEventListener('pointerdown',function(e){e.preventDefault();K[k]=1});
    ['pointerup','pointerleave','pointercancel'].forEach(function(n){b.addEventListener(n,function(){K[k]=0})});
  });

  function ov(a,b){return a.x<b.x+b.w&&a.x+a.w>b.x&&a.y<b.y+b.h&&a.y+a.h>b.y}
  function say(m){document.getElementById('status').textContent=m}
  function hud(){elS.textContent=score;elL.textContent=lives}
  function rnd(n){return Math.floor(Math.random()*n)}

  function newBoss(){return{x:400,y:GY-56,w:56,h:56,hp:6,max:6,ph:1,st:'idle',t:70,hit:0,zones:[]}}
  function spawnPlayer(){p={x:40,y:GY-26,w:16,h:26,vx:0,vy:0,g:false,face:1,isP:true}}

  function build(){
    var i;L=LV[level-1];WORLD=L.wd;camX=0;solids=[];coins=[];enemies=[];bul=[];shells=[];boss=null;shT=L.bm||0;banner=150;
    if(L.boss){solids.push({x:0,y:GY,w:W,h:H-GY,t:'g'});boss=newBoss()}
    else{
      L.seg.forEach(function(s){solids.push({x:s[0],y:GY,w:s[1]-s[0],h:H-GY,t:'g'})});
      L.pi.forEach(function(a){solids.push({x:a[0],y:GY-a[1],w:36,h:a[1],t:'p'})});
      L.rw.forEach(function(r){for(var k=0;k<r[2];k++)solids.push({x:r[0]+k*20,y:r[1],w:20,h:20,t:r[3]||'b'});
        if(r[3]!=='q')for(k=0;k<r[2];k+=2)coins.push({x:r[0]+k*20+6,y:r[1]-24,w:8,h:12})});
      for(i=0;i<L.seg.length-1;i++)coins.push({x:(L.seg[i][1]+L.seg[i+1][0])/2-4,y:150,w:8,h:12});
      for(i=0;i<5;i++)solids.push({x:WORLD-400+i*20,y:GY-(i+1)*20,w:20,h:(i+1)*20,t:'b'});
      L.en.forEach(function(x){enemies.push({x:x,y:GY-18,w:18,h:18,vx:-(L.sp||.7),vy:0,g:false})});
      (L.tu||[]).forEach(function(k){var a=L.pi[k];enemies.push({tur:1,x:a[0]+8,y:GY-a[1]-20,w:20,h:20,vx:0,vy:0,g:false,cd:60+k*13})});
    }
    spawnPlayer();say(L.msg);
  }

  function move(b){
    var i,s,hx=false;
    b.x+=b.vx;
    for(i=0;i<solids.length;i++){s=solids[i];if(ov(b,s)){if(b.vx>0)b.x=s.x-b.w;else if(b.vx<0)b.x=s.x+s.w;hx=true}}
    b.vy=Math.min(b.vy+GRAV,10);b.y+=b.vy;b.g=false;
    for(i=0;i<solids.length;i++){s=solids[i];if(ov(b,s)){
      if(b.vy>0){b.y=s.y-b.h;b.g=true}
      else if(b.vy<0){b.y=s.y+s.h;if(s.t==='q'&&b.isP&&!s.used){s.used=1;score+=50;say('Factura cobrada')}}
      b.vy=0}}
    return hx;
  }

  function start(){
    tuto.hidden=true;seen=true;score=0;lives=5;level=1;build();
    K.left=K.right=K.up=K.fire=0;running=true;hud();
    playBtn.textContent='Jugando\u2026';playBtn.disabled=true;
    cancelAnimationFrame(raf);loop();
  }
  function stop(){tuto.hidden=true;running=false;cancelAnimationFrame(raf);playBtn.disabled=false;playBtn.textContent='Jugar';if(p)drawAll()}
  function end(title,color){
    running=false;best=Math.max(best,score);hud();drawAll();
    ctx.fillStyle='rgba(10,15,30,.7)';ctx.fillRect(0,0,W,H);
    ctx.fillStyle=color;ctx.font=FONT;ctx.textAlign='center';ctx.fillText(title,W/2,100);
    ctx.fillStyle='#eef2fb';ctx.font='16px sans-serif';ctx.fillText('Puntos: '+score+'   R\u00e9cord: '+best,W/2,132);
    playBtn.disabled=false;playBtn.textContent='Jugar otra vez';
  }
  function die(msg){
    lives--;say(msg);hud();
    if(lives<=0){end('Te despidieron','#ff7a8a');return}
    if(boss){spawnPlayer();boss.st='idle';boss.t=70;boss.zones=[];boss.h=56;boss.y=GY-56;bul=[]}else build();
  }
  function nextLevel(){
    score+=500;level++;build();
  }

  function updateBoss(){
    var b=boss,i,pm,sl;
    if(b.hit>0)b.hit--;
    if(b.st==='idle'){
      b.x+=(p.x>b.x?1:-1)*(b.ph===2?1:.7);b.x=Math.max(0,Math.min(W-b.w,b.x));
      if(--b.t<=0){
        pm=Math.max(0,Math.min(4,Math.floor((p.x+8)/104)));b.zones=[];
        if(b.ph===1){var a=rnd(5),c=(a+1+rnd(4))%5;b.zones=[a,c]}
        else{sl=Math.max(0,Math.min(4,pm+rnd(5)-2));for(i=0;i<5;i++)if(i!==sl)b.zones.push(i)}
        b.st='tele';b.t=b.ph===1?75:105;
      }
    }else if(b.st==='tele'){if(--b.t<=0){b.st='atk';b.t=28}}
    else if(b.st==='atk'){
      for(i=0;i<b.zones.length;i++)if(ov(p,{x:b.zones[i]*104,y:0,w:104,h:GY})){die('Goser te alcanz\u00f3 con su zona');return}
      if(--b.t<=0){b.st='tired';b.t=b.ph===1?190:160;b.zones=[];b.h=34;b.y=GY-34;say('\u00a1Goser est\u00e1 cansado! P\u00edsale la cabeza')}
    }else if(b.st==='tired'){
      if(ov(p,b)&&p.vy>0&&p.y+p.h-b.y<=14&&b.hit<=0){
        b.hp--;b.hit=55;p.vy=-7.5;score+=200;say('\u00a1Golpe a Goser!');
        if(b.hp<=0){
          if(b.ph===1){b.ph=2;b.hp=b.max=12;b.st='phase';b.t=130;b.h=56;b.y=GY-56;say('\u00a1Fase 2! Goser tiene el doble de vida. Busca la zona segura')}
          else{score+=2000;end('\u00a1Goser vencido!','#7ee8a2');return}
        }
      }
      if(b.st==='tired'&&--b.t<=0){b.st='idle';b.t=b.ph===1?60:45;b.h=56;b.y=GY-56}
    }else if(b.st==='phase'){if(--b.t<=0){b.st='idle';b.t=50}}
    if((b.st==='idle'||b.st==='tele'||b.st==='atk')&&ov(p,b))die('Goser te aplast\u00f3');
  }

  function update(){
    var i,e,c,sp=K.fire?3.4:2.2;
    if(banner>0)banner--;
    p.vx=(K.right-K.left)*sp;if(p.vx)p.face=p.vx>0?1:-1;
    if(K.up&&p.g)p.vy=-9.4;
    if(!K.up&&p.vy<-3)p.vy=-3;
    move(p);
    if(p.x<camX)p.x=camX;if(p.x+p.w>WORLD)p.x=WORLD-p.w;
    camX=Math.max(0,Math.min(WORLD-W,p.x+p.w/2-W/2));
    if(p.y>H+40){die('Te ca\u00edste del plan de pagos');return}
    if(boss){updateBoss();hud();return}
    for(i=0;i<enemies.length;i++){
      e=enemies[i];if(e.dead||e.x>camX+W+120)continue;
      if(e.tur){
        if(--e.cd<=0&&e.x>camX&&e.x<camX+W){bul.push({x:e.x+6,y:e.y+6,w:8,h:4,vx:p.x<e.x?-2:2});e.cd=160}
      }else{
        if(move(e))e.vx=-e.vx;
        if(e.g){var pr={x:e.vx<0?e.x-3:e.x+e.w+1,y:e.y+e.h+1,w:2,h:2},ok=false;
          for(var k=0;k<solids.length;k++)if(ov(pr,solids[k])){ok=true;break}
          if(!ok)e.vx=-e.vx}
        if(e.y>H+40){e.dead=1;continue}
      }
      if(ov(p,e)){
        if(p.vy>0&&p.y+p.h-e.y<=14){e.dead=1;p.vy=-6;score+=e.tur?150:100;say(e.tur?'Torreta aplastada':'Bug aplastado')}
        else{die(e.tur?'Una torreta te dio':'Un bug te atrap\u00f3');return}
      }
    }
    for(i=bul.length-1;i>=0;i--){
      c=bul[i];c.x+=c.vx;
      if(c.x<camX-20||c.x>camX+W+20){bul.splice(i,1);continue}
      if(ov(p,c)){die('Te dio una bala');return}
    }
    if(L.bm&&--shT<=0){shT=L.bm;shells.push({x:Math.max(camX+20,Math.min(camX+W-34,p.x+(Math.random()-.5)*240)),y:-30,w:14,h:22,wt:55,ex:0})}
    for(i=shells.length-1;i>=0;i--){
      c=shells[i];
      if(c.wt>0)c.wt--;
      else if(!c.ex){c.y+=6;if(ov(p,c)){die('Te cay\u00f3 una bomba');return}if(c.y+c.h>=GY){c.ex=14}}
      else{if(ov(p,{x:c.x-14,y:GY-36,w:42,h:36})){die('Te alcanz\u00f3 la explosi\u00f3n');return}if(--c.ex<=0)shells.splice(i,1)}
    }
    for(i=0;i<coins.length;i++){c=coins[i];if(!c.got&&ov(p,c)){c.got=1;score+=50}}
    if(ov(p,{x:WORLD-110,y:40,w:30,h:160})){nextLevel();return}
    hud();
  }

  function drawAll(){
    var i,s,e,c,cx=Math.round(camX),T=TH[L.th],sx,b;
    ctx.textAlign='left';
    ctx.fillStyle=T.sky;ctx.fillRect(0,0,W,H);
    ctx.fillStyle=T.cl;
    for(i=0;i<8;i++){var x=((i*260+60-camX*.4)%(W+160)+(W+160))%(W+160)-80,y=26+(i%3)*24;ctx.fillRect(x,y,60,16);ctx.fillRect(x+10,y-10,40,10)}
    for(i=0;i<solids.length;i++){
      s=solids[i];if(s.x+s.w<cx||s.x>cx+W)continue;sx=s.x-cx;
      if(s.t==='g'){ctx.fillStyle=T.g;ctx.fillRect(sx,s.y,s.w,s.h);ctx.fillStyle=T.gt;ctx.fillRect(sx,s.y,s.w,6)}
      else if(s.t==='p'){ctx.fillStyle=T.p;ctx.fillRect(sx,s.y,s.w,s.h);ctx.fillStyle=T.pr;ctx.fillRect(sx-3,s.y,s.w+6,10)}
      else if(s.t==='q'){ctx.fillStyle=s.used?'#9a8fb0':'#ffd23f';ctx.fillRect(sx,s.y,s.w,s.h);ctx.strokeStyle='#7a4b00';ctx.strokeRect(sx+.5,s.y+.5,s.w-1,s.h-1);
        if(!s.used){ctx.fillStyle='#7a4b00';ctx.font='bold 14px sans-serif';ctx.textAlign='center';ctx.fillText('?',sx+10,s.y+15);ctx.textAlign='left'}}
      else{ctx.fillStyle=T.b;ctx.fillRect(sx,s.y,s.w,s.h);ctx.strokeStyle=T.bs;ctx.strokeRect(sx+.5,s.y+.5,s.w-1,s.h-1)}
    }
    if(!boss){ctx.fillStyle='#fff';ctx.fillRect(WORLD-100-cx,50,4,150);ctx.fillStyle='#00d27f';ctx.fillRect(WORLD-96-cx,52,28,16)}
    for(i=0;i<coins.length;i++){c=coins[i];if(c.got)continue;ctx.fillStyle='#ffd23f';ctx.fillRect(c.x-cx,c.y,c.w,c.h);ctx.strokeStyle='#b8860b';ctx.strokeRect(c.x-cx+.5,c.y+.5,c.w-1,c.h-1)}
    for(i=0;i<enemies.length;i++){e=enemies[i];if(e.dead)continue;
      if(e.tur){ctx.fillStyle='#9aa0ab';ctx.fillRect(e.x-cx,e.y,e.w,e.h);ctx.fillStyle='#d0d4dc';ctx.fillRect(e.x-cx-5,e.y+6,8,4);ctx.fillRect(e.x-cx+e.w-3,e.y+6,8,4)}
      else{ctx.fillStyle='#c1121f';ctx.fillRect(e.x-cx,e.y,e.w,e.h);ctx.fillStyle='#fff';ctx.fillRect(e.x-cx+3,e.y+4,4,4);ctx.fillRect(e.x-cx+11,e.y+4,4,4)}}
    ctx.fillStyle='#ffeb3b';for(i=0;i<bul.length;i++)ctx.fillRect(bul[i].x-cx,bul[i].y,bul[i].w,bul[i].h);
    for(i=0;i<shells.length;i++){c=shells[i];
      if(c.wt>0){ctx.fillStyle='#ff3d3d';ctx.fillRect(c.x-cx,GY-6,c.w,6);ctx.fillRect(c.x-cx+5,GY-22,4,14)}
      else if(!c.ex){ctx.fillStyle='#ff9f1c';ctx.fillRect(c.x-cx,c.y,c.w,c.h);ctx.fillStyle='#fff';ctx.fillRect(c.x-cx+4,c.y+16,6,6)}
      else{ctx.fillStyle='#ff6a00';ctx.fillRect(c.x-cx-14,GY-36,42,36);ctx.fillStyle='#ffd23f';ctx.fillRect(c.x-cx-6,GY-26,26,26)}}
    if(boss){b=boss;
      for(i=0;i<b.zones.length;i++){s=b.zones[i]*104;
        if(b.st==='tele'){ctx.fillStyle='rgba(255,60,60,.28)';ctx.fillRect(s,0,104,GY);ctx.strokeStyle='#ff3d3d';ctx.strokeRect(s+.5,.5,103,GY)}
        else{ctx.fillStyle='#ff3d3d';ctx.fillRect(s,0,104,GY)}}
      var tired=b.st==='tired';
      ctx.fillStyle=tired?'#7d6aa8':(b.ph===2?'#5a0f2e':'#2a1740');ctx.fillRect(b.x,b.y,b.w,b.h);
      ctx.fillStyle=tired?'#7d6aa8':'#7a3fb0';ctx.fillRect(b.x+4,b.y-8,8,8);ctx.fillRect(b.x+b.w-12,b.y-8,8,8);
      ctx.fillStyle=tired?'#1b1030':(b.ph===2?'#ffa31a':'#ff2d4a');
      if(tired){ctx.fillRect(b.x+10,b.y+12,12,3);ctx.fillRect(b.x+34,b.y+12,12,3);ctx.fillStyle='#fff';ctx.font='bold 14px sans-serif';ctx.fillText('zzz',b.x+b.w-6,b.y-12)}
      else{ctx.fillRect(b.x+10,b.y+14,12,10);ctx.fillRect(b.x+34,b.y+14,12,10)}
      ctx.fillStyle='#000a';ctx.fillRect(W/2-152,12,304,16);
      ctx.fillStyle=b.ph===2?'#a02bff':'#e0457b';ctx.fillRect(W/2-150,14,Math.max(0,300*b.hp/b.max),12);
      ctx.fillStyle='#fff';ctx.font='bold 11px sans-serif';ctx.textAlign='center';ctx.fillText('GOSER'+(b.ph===2?' \u00b7 FASE 2':''),W/2,40);ctx.textAlign='left';
    }
    if(p){
      ctx.fillStyle='#2d6cff';ctx.fillRect(p.x-cx,p.y,p.w,p.h);
      ctx.fillStyle='#ffd23f';ctx.fillRect(p.x-cx-1,p.y,p.w+2,7);
      ctx.fillStyle='#ffe0c2';ctx.fillRect(p.x-cx+(p.face>0?8:2),p.y+9,6,6);
    }
    ctx.fillStyle='#0008';ctx.fillRect(6,6,66,18);ctx.fillStyle='#fff';ctx.font='bold 12px sans-serif';ctx.fillText('Nivel '+level+'/5',12,19);
    if(banner>0){ctx.fillStyle='rgba(10,15,30,.75)';ctx.fillRect(W/2-170,H/2-26,340,44);
      ctx.fillStyle='#ffd23f';ctx.font='bold 18px sans-serif';ctx.textAlign='center';ctx.fillText(L.n,W/2,H/2+2);ctx.textAlign='left'}
  }
  function loop(){if(!running)return;update();if(running){drawAll();raf=requestAnimationFrame(loop)}}

  playBtn.addEventListener('click',function(){if(seen||!tuto.hidden)start();else{tuto.hidden=false;document.getElementById('go').focus()}});
  document.getElementById('go').addEventListener('click',start);
  build();hud();drawAll();
  ctx.fillStyle='rgba(10,15,30,.55)';ctx.fillRect(0,0,W,H);
  ctx.fillStyle='#ffd23f';ctx.font=FONT;ctx.textAlign='center';ctx.fillText('Pulsa Jugar',W/2,H/2);
})();
