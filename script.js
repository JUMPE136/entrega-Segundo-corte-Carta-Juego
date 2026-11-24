(function(){
  var card=document.getElementById('card'),
      cups=Array.prototype.slice.call(document.querySelectorAll('.cup')),
      table=document.getElementById('table'),
      status=document.getElementById('status'),
      playBtn=document.getElementById('play'),
      el={wins:document.getElementById('wins'),streak:document.getElementById('streak'),level:document.getElementById('level')},
      slots=[0,1,2], ballCup=0, state='idle', wins=0, streak=0, level=1;

  function sleep(ms){return new Promise(function(r){setTimeout(r,ms)})}
  function place(){cups.forEach(function(c,i){c.style.left=(slots[i]*33.333)+'%'})}
  function say(t){status.textContent=t}
  function speed(){return Math.min(5,1+0.5*Math.floor(streak/2))}
  function stats(){el.wins.textContent=wins;el.streak.textContent=streak;el.level.textContent=speed()+'x'}
  function setPickable(on){cups.forEach(function(c){c.disabled=!on;c.classList.toggle('pickable',on)})}

  function flip(){
    var f=card.classList.toggle('flipped');
    card.setAttribute('tabindex',f?'-1':'0');
    if(!f&&state!=='idle'){state='idle';setPickable(false);cups.forEach(function(c){c.classList.remove('up','has-ball')});say('Pulsa Jugar y sigue la bolita con la vista.');playBtn.disabled=false}
  }
  card.addEventListener('click',function(e){if(!card.classList.contains('flipped'))flip()});
  card.addEventListener('keydown',function(e){if((e.key==='Enter'||e.key===' ')&&e.target===card){e.preventDefault();flip()}});
  document.getElementById('flip').addEventListener('click',flip);
  document.getElementById('back-btn').addEventListener('click',function(e){e.stopPropagation();flip()});

  async function play(){
    if(state==='busy'||state==='pick')return;
    state='busy';playBtn.disabled=true;setPickable(false);
    cups.forEach(function(c){c.classList.remove('up','has-ball','win')});
    ballCup=Math.floor(Math.random()*3);
    cups[ballCup].classList.add('has-ball');
    say('Mira dónde está la bolita…');
    await sleep(500);cups[ballCup].classList.add('up');
    await sleep(1100);cups[ballCup].classList.remove('up');
    await sleep(500);
    say('¡Ahí van los vasos!');
    var dur=480/speed();
    table.style.setProperty('--dur',dur+'ms');
    cups.forEach(function(c){c.style.setProperty('--dur',dur+'ms')});
    var n=6+Math.round((speed()-1)*2);
    for(var k=0;k<n;k++){
      var a=Math.floor(Math.random()*3),b=(a+1+Math.floor(Math.random()*2))%3;
      var ia=slots.indexOf(a),ib=slots.indexOf(b);
      slots[ia]=b;slots[ib]=a;place();
      await sleep(dur+40);
    }
    state='pick';setPickable(true);
    say('¿Dónde está la bolita? Elige un vaso.');
  }

  async function pick(i){
    if(state!=='pick')return;
    state='busy';setPickable(false);
    cups[i].classList.add('up');
    var ok=i===ballCup;
    if(!ok){await sleep(500);cups[ballCup].classList.add('up')}
    if(ok){wins++;streak++;say(streak%2===0&&speed()>1?'¡Acertaste! 2 seguidas: velocidad '+speed()+'x.':'¡Acertaste! La bolita estaba ahí.');cups[i].classList.add('win')}
    else{streak=0;say('Casi. Esa bolita estaba en otro vaso.')}
    stats();
    state='idle';playBtn.disabled=false;playBtn.textContent='Otra ronda';
  }

  cups.forEach(function(c,i){c.addEventListener('click',function(){pick(i)})});
  playBtn.addEventListener('click',play);
  place();stats();
})();
