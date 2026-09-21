(() => {
  const canvas = document.getElementById('game');
  const ctx = canvas.getContext('2d');

  const UI = {
    clock: document.getElementById('clock'),
    dayText: document.getElementById('dayText'),
    dayIcon: document.getElementById('dayIcon'),
    hint: document.getElementById('hint'),
    dialogue: document.getElementById('dialogue'),
    dialogueName: document.getElementById('dialogueName'),
    dialogueText: document.getElementById('dialogueText'),
    portrait: document.getElementById('portrait'),
    toast: document.getElementById('toast'),
    quest: document.getElementById('quest'),
  };

  const WORLD = { w: 1900, h: 1250 };
  const SAVE_KEY = 'vila-aster-memory-v1';

  const keys = new Set();
  let last = performance.now();
  let gameMinutes = 8 * 60;
  let day = 1;
  let dialogue = null;
  let toastTimer = 0;
  let eventTriggered = false;

  const save = loadSave();
  eventTriggered = !!save.eventTriggered;

  const player = {
    x: save.player?.x ?? 930,
    y: save.player?.y ?? 790,
    r: 18,
    speed: 210,
    facing: 'down',
    step: 0,
  };

  const camera = { x: 0, y: 0 };

  const roads = [
    {x: 610, y: 0, w: 180, h: 1250},
    {x: 0, y: 575, w: 1900, h: 170},
    {x: 1180, y: 520, w: 180, h: 730},
  ];

  const buildings = [
    { id:'inn', name:'Taverna Lua Cheia', x:260, y:180, w:310, h:220, roof:'#9b4a3c', wall:'#e5c890', sign:'🍲' },
    { id:'smith', name:'Forja do Bram', x:860, y:160, w:300, h:220, roof:'#425f76', wall:'#d8bd87', sign:'⚒️' },
    { id:'shop', name:'Empório da Mira', x:1370, y:190, w:300, h:215, roof:'#607a47', wall:'#e2ca97', sign:'🧺' },
    { id:'home', name:'Casa da Elena', x:165, y:825, w:270, h:205, roof:'#755a92', wall:'#d9c696', sign:'🌸' },
  ];

  const solids = [
    ...buildings.map(b => ({x:b.x+10,y:b.y+44,w:b.w-20,h:b.h-44})),
    {x:0,y:0,w:46,h:1250}, {x:1854,y:0,w:46,h:1250},
    {x:0,y:0,w:1900,h:46}, {x:0,y:1204,w:1900,h:46},
    {x:1260,y:745,w:280,h:65},
  ];

  const trees = [
    [90,120],[145,180],[180,110],[80,450],[170,490],[330,500],[470,480],
    [1180,95],[1280,120],[1750,110],[1780,470],[1650,500],[1510,490],
    [80,1060],[530,1080],[650,1010],[810,1120],[1510,1080],[1740,1040],
    [1030,980],[1120,1040],[1160,930],[520,820],[460,900]
  ].map(([x,y])=>({x,y,r:32}));

  trees.forEach(t => solids.push({x:t.x-22,y:t.y-20,w:44,h:42}));

  const pond = {x:1260, y:745, w:280, h:160};

  const schedules = {
    elena: [
      {from:0,to:420,x:310,y:930,label:'dormindo em casa'},
      {from:420,to:720,x:520,y:860,label:'cuidando das flores'},
      {from:720,to:1020,x:700,y:650,label:'na praça'},
      {from:1020,to:1260,x:335,y:700,label:'caminhando perto de casa'},
      {from:1260,to:1440,x:310,y:930,label:'em casa'},
    ],
    bram: [
      {from:0,to:480,x:1000,y:330,label:'na forja'},
      {from:480,to:1020,x:1020,y:430,label:'trabalhando na forja'},
      {from:1020,to:1200,x:760,y:660,label:'na taverna'},
      {from:1200,to:1440,x:1000,y:330,label:'fechando a forja'},
    ],
    mira: [
      {from:0,to:450,x:1515,y:350,label:'no empório'},
      {from:450,to:1080,x:1510,y:455,label:'atendendo no empório'},
      {from:1080,to:1260,x:1230,y:640,label:'na praça'},
      {from:1260,to:1440,x:1515,y:350,label:'em casa'},
    ],
    theo: [
      {from:0,to:540,x:720,y:920,label:'descansando'},
      {from:540,to:900,x:1125,y:845,label:'pescando'},
      {from:900,to:1110,x:710,y:640,label:'na praça'},
      {from:1110,to:1440,x:780,y:930,label:'voltando para casa'},
    ],
    luma: [
      {from:0,to:480,x:480,y:330,label:'na taverna'},
      {from:480,to:960,x:500,y:470,label:'trabalhando na taverna'},
      {from:960,to:1140,x:760,y:650,label:'conversando na praça'},
      {from:1140,to:1440,x:480,y:330,label:'fechando a taverna'},
    ]
  };

  const npcDefs = [
    {id:'elena',name:'Elena',emoji:'🌸',role:'Jardineira',color:'#d782a7',x:520,y:860,
      intro:'Oi! Você é novo por aqui, não é? Eu sou Elena. Cuido das flores da vila... e tento cuidar das pessoas também.',
      remembered:'Você voltou! Eu sabia que aquele olhar curioso não era só de passagem.',
      topic:'Ultimamente as flores perto do rio estão murchando rápido demais. Bram diz que é bobagem, mas eu acho estranho.'},
    {id:'bram',name:'Bram',emoji:'🧔',role:'Ferreiro',color:'#a8673f',x:1020,y:430,
      intro:'Se veio atrás de espada, ainda não estou vendendo. Se veio conversar... bom, posso abrir uma exceção.',
      remembered:'Ah, é você de novo. Já está começando a parecer morador.',
      topic:'Ouvi um barulho vindo das pedras perto do rio ontem à noite. Metal raspando em pedra. Não gostei nada disso.'},
    {id:'mira',name:'Mira',emoji:'🧺',role:'Comerciante',color:'#7cab6a',x:1510,y:455,
      intro:'Bem-vindo ao Empório da Mira! Aqui eu vendo de tudo — menos segredos. Esses custam mais caro.',
      remembered:'Olha só quem voltou. Já separo alguma coisa ou você veio caçar fofoca?',
      topic:'Algumas entregas não chegaram esta semana. A estrada do norte anda estranha.'},
    {id:'theo',name:'Theo',emoji:'🎣',role:'Pescador',color:'#5c8ec7',x:1125,y:845,
      intro:'Shhh... quase peguei um enorme. Você espanta peixe andando desse jeito.',
      remembered:'Você de novo! Pelo menos hoje os peixes já sabem que você faz barulho.',
      topic:'A água mudou de gosto. Eu sei, eu sei... quem prova água do rio? Um pescador preocupado.'},
    {id:'luma',name:'Luma',emoji:'🍲',role:'Taverneira',color:'#cf7654',x:500,y:470,
      intro:'Entre, sente, coma alguma coisa... quer dizer, quando tivermos interiores. Por enquanto aceite uma boa conversa.',
      remembered:'Ora, meu cliente favorito sem conta aberta voltou.',
      topic:'Todo mundo anda falando do rio. Quando cinco pessoas contam versões diferentes da mesma coisa, normalmente existe uma sexta versão escondida.'},
  ];

  const npcs = npcDefs.map(def => ({...def, targetX:def.x,targetY:def.y, t:Math.random()*100}));

  function loadSave(){
    try { return JSON.parse(localStorage.getItem(SAVE_KEY)) || {npcs:{}}; }
    catch { return {npcs:{}}; }
  }

  function persist(){
    const npcMemory = {};
    npcs.forEach(n => {
      const old = save.npcs?.[n.id] || {};
      npcMemory[n.id] = old;
    });
    localStorage.setItem(SAVE_KEY, JSON.stringify({
      player:{x:player.x,y:player.y}, npcs:npcMemory, eventTriggered, day, gameMinutes
    }));
  }

  function memoryFor(id){
    if (!save.npcs) save.npcs = {};
    if (!save.npcs[id]) save.npcs[id] = {talks:0, affinity:0, lastDay:0};
    return save.npcs[id];
  }

  function resetMemory(){
    localStorage.removeItem(SAVE_KEY);
    location.reload();
  }

  function resize(){
    const dpr = Math.min(devicePixelRatio || 1, 2);
    canvas.width = Math.floor(innerWidth * dpr);
    canvas.height = Math.floor(innerHeight * dpr);
    canvas.style.width = innerWidth + 'px';
    canvas.style.height = innerHeight + 'px';
    ctx.setTransform(dpr,0,0,dpr,0,0);
  }
  addEventListener('resize', resize); resize();

  function clamp(v,a,b){ return Math.max(a,Math.min(b,v)); }
  function lerp(a,b,t){ return a+(b-a)*t; }
  function dist(ax,ay,bx,by){ return Math.hypot(ax-bx, ay-by); }

  function circleRect(cx,cy,r,rect){
    const nx = clamp(cx, rect.x, rect.x+rect.w);
    const ny = clamp(cy, rect.y, rect.y+rect.h);
    return dist(cx,cy,nx,ny) < r;
  }

  function canMove(nx, ny){
    if (nx-player.r < 0 || ny-player.r < 0 || nx+player.r > WORLD.w || ny+player.r > WORLD.h) return false;
    if (solids.some(s => circleRect(nx,ny,player.r,s))) return false;
    return true;
  }

  function getSchedule(npc){
    const minute = ((gameMinutes % 1440)+1440)%1440;
    return schedules[npc.id].find(s => minute >= s.from && minute < s.to) || schedules[npc.id][0];
  }

  function updateNpc(npc, dt){
    const s = getSchedule(npc);
    npc.targetX = s.x; npc.targetY = s.y;
    const d = dist(npc.x,npc.y,npc.targetX,npc.targetY);
    if (d > 4) {
      const spd = 45;
      npc.x += (npc.targetX-npc.x)/d * spd * dt;
      npc.y += (npc.targetY-npc.y)/d * spd * dt;
    }
    npc.t += dt;
  }

  function update(dt){
    if (!dialogue) {
      let dx = 0, dy = 0;
      if (keys.has('w') || keys.has('arrowup')) dy -= 1;
      if (keys.has('s') || keys.has('arrowdown')) dy += 1;
      if (keys.has('a') || keys.has('arrowleft')) dx -= 1;
      if (keys.has('d') || keys.has('arrowright')) dx += 1;
      if (dx || dy) {
        const len = Math.hypot(dx,dy); dx/=len; dy/=len;
        if (Math.abs(dx) > Math.abs(dy)) player.facing = dx > 0 ? 'right':'left';
        else player.facing = dy > 0 ? 'down':'up';
        const nx = player.x + dx*player.speed*dt;
        const ny = player.y + dy*player.speed*dt;
        if (canMove(nx,player.y)) player.x = nx;
        if (canMove(player.x,ny)) player.y = ny;
        player.step += dt*10;
      }
      gameMinutes += dt * 5.2;
      if (gameMinutes >= 1440) { gameMinutes -= 1440; day++; showToast('🌅 Um novo dia começou.'); }
    }

    npcs.forEach(n => updateNpc(n,dt));

    const viewW = innerWidth, viewH = innerHeight;
    camera.x = lerp(camera.x, clamp(player.x - viewW/2, 0, WORLD.w-viewW), 1-Math.pow(.001,dt));
    camera.y = lerp(camera.y, clamp(player.y - viewH/2, 0, WORLD.h-viewH), 1-Math.pow(.001,dt));

    const near = nearestNpc();
    UI.hint.classList.toggle('hidden', !!dialogue || !near || near.d > 74);

    updateClockUI();
    if (toastTimer > 0) { toastTimer -= dt; if (toastTimer <= 0) UI.toast.classList.add('hidden'); }
    persistEveryFewSeconds(dt);
  }

  let persistAcc = 0;
  function persistEveryFewSeconds(dt){ persistAcc += dt; if (persistAcc > 3){persistAcc=0; persist();} }

  function nearestNpc(){
    let best = null;
    for (const n of npcs) {
      const d = dist(player.x,player.y,n.x,n.y);
      if (!best || d < best.d) best = {npc:n,d};
    }
    return best;
  }

  function interact(){
    if (dialogue) { advanceDialogue(); return; }
    const near = nearestNpc();
    if (near && near.d < 78) startDialogue(near.npc);
  }

  function startDialogue(npc){
    const mem = memoryFor(npc.id);
    mem.talks += 1;
    mem.affinity = Math.min(100, mem.affinity + 8);
    mem.lastDay = day;

    const s = getSchedule(npc);
    const lines = [];
    lines.push(mem.talks === 1 ? npc.intro : npc.remembered);
    if (mem.talks >= 2) lines.push(npc.topic);
    if (mem.talks >= 3) lines.push(`Eu lembro das nossas ${mem.talks} conversas. Já não considero você exatamente um estranho.`);
    lines.push(`Agora estou ${s.label}. A vila muda bastante dependendo da hora.`);

    if (!eventTriggered && totalTalks() >= 4) {
      eventTriggered = true;
      lines.push('...Você também sentiu? Um tremor leve. Veio da direção do rio. Isso não acontecia há anos.');
      setTimeout(() => showToast('⚠️ Evento do mundo desbloqueado: “O eco sob o rio”'), 150);
      UI.quest.querySelector('span').textContent = 'Algo despertou perto do rio. Converse com os moradores para juntar pistas.';
    } else if (eventTriggered) {
      lines.push('Desde aquele tremor, ninguém está totalmente tranquilo. Cada morador parece saber um pedaço diferente da história.');
    }

    dialogue = {npc, lines, index:0};
    renderDialogue();
    persist();
  }

  function totalTalks(){ return Object.values(save.npcs || {}).reduce((a,m)=>a+(m.talks||0),0); }

  function advanceDialogue(){
    if (!dialogue) return;
    dialogue.index++;
    if (dialogue.index >= dialogue.lines.length) {
      dialogue = null;
      UI.dialogue.classList.add('hidden');
      return;
    }
    renderDialogue();
  }

  function renderDialogue(){
    const {npc,lines,index} = dialogue;
    UI.dialogueName.textContent = `${npc.name} • ${npc.role}`;
    UI.dialogueText.textContent = lines[index];
    UI.portrait.textContent = npc.emoji;
    UI.dialogue.classList.remove('hidden');
  }

  function showToast(msg){
    UI.toast.textContent = msg;
    UI.toast.classList.remove('hidden');
    toastTimer = 3.2;
  }

  function updateClockUI(){
    const mins = Math.floor(gameMinutes)%1440;
    const hh = String(Math.floor(mins/60)).padStart(2,'0');
    const mm = String(mins%60).padStart(2,'0');
    UI.clock.textContent = `${hh}:${mm}`;
    UI.dayText.textContent = `Dia ${day}`;
    UI.dayIcon.textContent = mins < 360 || mins >= 1200 ? '🌙' : mins < 480 || mins >= 1080 ? '🌅' : '☀️';
  }

  addEventListener('keydown', (e) => {
    const k = e.key.toLowerCase();
    keys.add(k);
    if (['arrowup','arrowdown','arrowleft','arrowright',' '].includes(k)) e.preventDefault();
    if ((k === 'e' || k === 'enter') && !e.repeat) interact();
    if (k === 'r' && !e.repeat) {
      if (confirm('Apagar a memória dos NPCs e reiniciar o protótipo?')) resetMemory();
    }
  });
  addEventListener('keyup', e => keys.delete(e.key.toLowerCase()));

  function draw(){
    const w = innerWidth, h = innerHeight;
    ctx.clearRect(0,0,w,h);
    ctx.save();
    ctx.translate(-camera.x,-camera.y);

    drawGround();
    drawRoads();
    drawPond();
    drawDecor();
    buildings.forEach(drawBuilding);
    trees.forEach(drawTree);
    npcs.forEach(drawNpc);
    drawPlayer();
    drawWorldLabels();

    ctx.restore();
    drawNightOverlay(w,h);
  }

  function drawGround(){
    ctx.fillStyle = '#82b866'; ctx.fillRect(0,0,WORLD.w,WORLD.h);
    ctx.globalAlpha = .14;
    for(let y=15;y<WORLD.h;y+=34){
      for(let x=15+(y%68);x<WORLD.w;x+=45){
        ctx.fillStyle = ((x+y)%3===0)?'#e6f4a5':'#4e8e48';
        ctx.fillRect(x,y,2,7);
      }
    }
    ctx.globalAlpha = 1;
  }

  function drawRoads(){
    roads.forEach(r => {
      ctx.fillStyle='#c8b083'; ctx.fillRect(r.x,r.y,r.w,r.h);
      ctx.globalAlpha=.18; ctx.fillStyle='#786448';
      for(let y=r.y+10;y<r.y+r.h;y+=28){
        for(let x=r.x+10+(y%20);x<r.x+r.w;x+=38){
          ctx.fillRect(x,y,12,5);
        }
      }
      ctx.globalAlpha=1;
    });
    ctx.fillStyle='#b4a074';
    ctx.beginPath(); ctx.arc(700,650,165,0,Math.PI*2); ctx.fill();
  }

  function drawPond(){
    roundRect(ctx, pond.x, pond.y, pond.w, pond.h, 52, '#4b9bc8');
    ctx.globalAlpha=.35; ctx.strokeStyle='#d8f5ff'; ctx.lineWidth=3;
    for(let i=0;i<5;i++){
      ctx.beginPath(); ctx.arc(pond.x+50+i*48, pond.y+70+(i%2)*24, 14, 0, Math.PI); ctx.stroke();
    }
    ctx.globalAlpha=1;
    // ponte
    ctx.fillStyle='#7b5131'; ctx.fillRect(pond.x+108,pond.y-8,64,pond.h+16);
    ctx.fillStyle='#aa7749';
    for(let y=pond.y-2;y<pond.y+pond.h;y+=18) ctx.fillRect(pond.x+112,y,56,12);
  }

  function drawDecor(){
    // canteiros
    ctx.fillStyle='#6d4a2d'; ctx.fillRect(250,760,190,110);
    for(let yy=778;yy<850;yy+=28){
      for(let xx=268;xx<425;xx+=32){
        ctx.fillStyle='#4c8f4d'; ctx.beginPath(); ctx.arc(xx,yy,7,0,Math.PI*2);ctx.fill();
        ctx.fillStyle='#f2d25a';ctx.fillRect(xx-2,yy-11,4,5);
      }
    }
    // fonte central
    ctx.fillStyle='#7b7f80'; ctx.beginPath(); ctx.arc(700,650,48,0,Math.PI*2);ctx.fill();
    ctx.fillStyle='#55a6d0'; ctx.beginPath(); ctx.arc(700,650,37,0,Math.PI*2);ctx.fill();
    ctx.fillStyle='#a9b0b2';ctx.fillRect(694,600,12,55);
    ctx.beginPath();ctx.arc(700,603,15,0,Math.PI*2);ctx.fill();
    // flores
    const flowers=[[200,610],[230,625],[420,620],[470,665],[865,690],[905,705],[1370,620],[1410,660],[1580,680],[1640,610],[1100,600],[1145,620]];
    flowers.forEach(([x,y],i)=>{
      ctx.fillStyle=['#f7e36f','#ff8eb5','#b9a5ff','#f6f1de'][i%4];
      ctx.beginPath();ctx.arc(x,y,5,0,Math.PI*2);ctx.fill();
    });
    // placa norte
    ctx.fillStyle='#6b4427';ctx.fillRect(720,70,8,55);ctx.fillRect(688,75,72,30);
    ctx.fillStyle='#f5e5bd';ctx.font='bold 13px system-ui';ctx.fillText('NORTE ↑',697,95);
  }

  function drawBuilding(b){
    // sombra
    ctx.fillStyle='rgba(0,0,0,.18)'; roundRect(ctx,b.x+10,b.y+18,b.w,b.h,12); ctx.fill();
    // parede
    ctx.fillStyle=b.wall; roundRect(ctx,b.x,b.y+50,b.w,b.h-50,10);ctx.fill();
    // telhado
    ctx.fillStyle=b.roof;
    ctx.beginPath(); ctx.moveTo(b.x-18,b.y+70); ctx.lineTo(b.x+b.w/2,b.y-5); ctx.lineTo(b.x+b.w+18,b.y+70); ctx.closePath(); ctx.fill();
    // porta
    ctx.fillStyle='#6a442b'; roundRect(ctx,b.x+b.w/2-24,b.y+b.h-68,48,68,7);ctx.fill();
    ctx.fillStyle='#e5b34d'; ctx.beginPath();ctx.arc(b.x+b.w/2+13,b.y+b.h-34,3,0,Math.PI*2);ctx.fill();
    // janelas
    ctx.fillStyle='#79b9ce';
    ctx.fillRect(b.x+42,b.y+100,56,42);ctx.fillRect(b.x+b.w-98,b.y+100,56,42);
    ctx.strokeStyle='rgba(255,255,255,.55)';ctx.lineWidth=2;
    [b.x+42,b.x+b.w-98].forEach(wx=>{ctx.strokeRect(wx, b.y+100,56,42);ctx.beginPath();ctx.moveTo(wx+28,b.y+100);ctx.lineTo(wx+28,b.y+142);ctx.stroke();});
    // placa
    ctx.fillStyle='#5f3f27'; roundRect(ctx,b.x+b.w/2-27,b.y+54,54,36,8);ctx.fill();
    ctx.font='22px serif';ctx.textAlign='center';ctx.fillText(b.sign,b.x+b.w/2,b.y+80);ctx.textAlign='left';
  }

  function drawTree(t){
    ctx.fillStyle='#694529';ctx.fillRect(t.x-7,t.y+20,14,38);
    ctx.fillStyle='rgba(0,0,0,.13)';ctx.beginPath();ctx.ellipse(t.x+6,t.y+47,34,15,0,0,Math.PI*2);ctx.fill();
    ctx.fillStyle='#2f7047';ctx.beginPath();ctx.arc(t.x,t.y,34,0,Math.PI*2);ctx.fill();
    ctx.fillStyle='#42875a';ctx.beginPath();ctx.arc(t.x-18,t.y+4,21,0,Math.PI*2);ctx.fill();ctx.beginPath();ctx.arc(t.x+19,t.y+7,22,0,Math.PI*2);ctx.fill();
    ctx.fillStyle='#5b9d66';ctx.beginPath();ctx.arc(t.x-3,t.y-18,18,0,Math.PI*2);ctx.fill();
  }

  function drawNpc(n){
    const bob = Math.sin(n.t*4)*1.7;
    ctx.fillStyle='rgba(0,0,0,.18)';ctx.beginPath();ctx.ellipse(n.x,n.y+20,16,7,0,0,Math.PI*2);ctx.fill();
    ctx.fillStyle=n.color;ctx.beginPath();ctx.arc(n.x,n.y+4+bob,15,0,Math.PI*2);ctx.fill();
    ctx.fillStyle='#f4c6a7';ctx.beginPath();ctx.arc(n.x,n.y-13+bob,12,0,Math.PI*2);ctx.fill();
    ctx.font='16px serif';ctx.textAlign='center';ctx.fillText(n.emoji,n.x,n.y-29+bob);ctx.textAlign='left';
    ctx.font='600 12px system-ui';ctx.fillStyle='rgba(20,30,20,.86)';ctx.textAlign='center';ctx.fillText(n.name,n.x,n.y+40);ctx.textAlign='left';
  }

  function drawPlayer(){
    const bob = Math.sin(player.step)*1.4;
    ctx.fillStyle='rgba(0,0,0,.22)';ctx.beginPath();ctx.ellipse(player.x,player.y+22,17,7,0,0,Math.PI*2);ctx.fill();
    ctx.fillStyle='#355a8a';ctx.beginPath();ctx.arc(player.x,player.y+5+bob,16,0,Math.PI*2);ctx.fill();
    ctx.fillStyle='#efbd98';ctx.beginPath();ctx.arc(player.x,player.y-13+bob,13,0,Math.PI*2);ctx.fill();
    ctx.fillStyle='#563b2b';ctx.beginPath();ctx.arc(player.x,player.y-18+bob,13,Math.PI,Math.PI*2);ctx.fill();
    ctx.fillStyle='#fff';
    const eyeX = player.facing==='left'?-5:player.facing==='right'?5:0;
    ctx.beginPath();ctx.arc(player.x-4+eyeX,player.y-14+bob,1.5,0,Math.PI*2);ctx.fill();
    ctx.beginPath();ctx.arc(player.x+4+eyeX,player.y-14+bob,1.5,0,Math.PI*2);ctx.fill();
  }

  function drawWorldLabels(){
    ctx.font='700 13px system-ui';ctx.textAlign='center';
    buildings.forEach(b => {
      ctx.fillStyle='rgba(26,36,28,.78)'; roundRect(ctx,b.x+b.w/2-78,b.y+b.h+8,156,25,8);ctx.fill();
      ctx.fillStyle='#f9f5e8';ctx.fillText(b.name,b.x+b.w/2,b.y+b.h+25);
    });
    ctx.textAlign='left';
  }

  function drawNightOverlay(w,h){
    const m = gameMinutes%1440;
    let alpha = 0;
    if (m < 360) alpha = .42;
    else if (m < 480) alpha = .42 * (480-m)/120;
    else if (m > 1080) alpha = .42 * Math.min(1,(m-1080)/120);
    if (alpha > 0) {
      ctx.fillStyle=`rgba(21,31,70,${alpha})`;ctx.fillRect(0,0,w,h);
    }
  }

  function roundRect(c,x,y,w,h,r,fill){
    if(fill) c.fillStyle=fill;
    const rr=Math.min(r,w/2,h/2);
    c.beginPath();c.moveTo(x+rr,y);c.arcTo(x+w,y,x+w,y+h,rr);c.arcTo(x+w,y+h,x,y+h,rr);c.arcTo(x,y+h,x,y,rr);c.arcTo(x,y,x+w,y,rr);c.closePath();
    if(fill) c.fill();
  }

  function loop(now){
    const dt = Math.min((now-last)/1000, .033); last=now;
    update(dt); draw(); requestAnimationFrame(loop);
  }

  if (save.day) day = save.day;
  if (save.gameMinutes) gameMinutes = save.gameMinutes;
  if (eventTriggered) UI.quest.querySelector('span').textContent = 'Algo despertou perto do rio. Converse com os moradores para juntar pistas.';
  showToast('🌿 Bem-vindo à Vila de Aster. Fale com os moradores.');
  requestAnimationFrame(loop);
})();
