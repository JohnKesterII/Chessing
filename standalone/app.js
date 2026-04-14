/* global Chess */
const PIECE = {p:'♟',r:'♜',n:'♞',b:'♝',q:'♛',k:'♚',P:'♙',R:'♖',N:'♘',B:'♗',Q:'♕',K:'♔'};
const navItems = [
  ['dashboard','Dashboard'],['play','Live Play'],['puzzles','Puzzles'],['bots','Bots'],['analysis','Analysis'],['leaderboards','Leaderboards'],['profile','Profile'],['hcf','HCF Hub']
];
const state = {
  user: JSON.parse(localStorage.getItem('chessing_user')||'{"name":"HamrockPlayer","country":"US","bio":"Dual-ladder grinder.","elo":1548,"hcf":1482,"puzzle":1620,"wins":34,"losses":25,"draws":12,"hcfTitle":"Candidate Master"}'),
  history: JSON.parse(localStorage.getItem('chessing_history')||'[]'),
  puzzles: [
    {id:1,fen:'6k1/5ppp/8/8/8/8/5PPP/6K1 w - - 0 1',theme:'mate in 1',line:['g2g3']},
    {id:2,fen:'r1bqkbnr/pppp1ppp/2n5/4p3/3P4/5N2/PPP1PPPP/RNBQKB1R b KQkq - 1 3',theme:'fork',line:['e5e4','f3g5']},
    {id:3,fen:'4k3/8/8/8/8/8/5K2/6R1 w - - 0 1',theme:'mate in 2',line:['g1e1','e8d7','e1d1']}
  ],
  leaderboard: JSON.parse(localStorage.getItem('chessing_lb')||'[]')
};
if(!state.leaderboard.length){
  state.leaderboard = Array.from({length:18},(_,i)=>({name:`Player${i+1}`,elo:2200-i*32,hcf:2140-i*28,puzzle:2300-i*30,country:['US','IN','NO','DE','BR'][i%5]}));
}
function save(){
  localStorage.setItem('chessing_user',JSON.stringify(state.user));
  localStorage.setItem('chessing_history',JSON.stringify(state.history));
  localStorage.setItem('chessing_lb',JSON.stringify(state.leaderboard));
}

const nav = document.getElementById('nav');
navItems.forEach(([id,label])=>{const b=document.createElement('button');b.textContent=label;b.onclick=()=>show(id);b.dataset.id=id;nav.appendChild(b);});
function show(id){
  document.querySelectorAll('.view').forEach(v=>v.classList.remove('active'));
  document.getElementById(id).classList.add('active');
  document.querySelectorAll('nav button').forEach(b=>b.classList.toggle('active',b.dataset.id===id));
  document.getElementById('viewTitle').textContent = navItems.find(n=>n[0]===id)[1];
}
show('dashboard');

function renderDashboard(){
  const v=document.getElementById('dashboard');
  v.innerHTML=`<div class="grid g3">
    <div class="panel"><div class="muted">Standard Elo</div><div class="kpi">${state.user.elo}</div><span class="badge elo">Public ladder</span></div>
    <div class="panel"><div class="muted">HCF Rating</div><div class="kpi">${state.user.hcf}</div><span class="badge hcf">Federation circuit</span></div>
    <div class="panel"><div class="muted">Puzzle Rating</div><div class="kpi">${state.user.puzzle}</div><div class="muted">Streak ${puzzleSession.streak}</div></div>
  </div>
  <div class="grid g2" style="margin-top:14px">
    <div class="panel"><h3>Featured events</h3><ul><li>HCF Swiss #42 starts in 3h</li><li>Elite Arena 5+0 tonight</li><li>Daily puzzle championship live</li></ul></div>
    <div class="panel"><h3>Recent match history</h3>${renderRecentTable(6)}</div>
  </div>`;
}
function renderRecentTable(n){
  const rows = state.history.slice(0,n).map(g=>`<tr><td>${g.mode}</td><td>${g.result}</td><td>${g.eloDelta>0?'+':''}${g.eloDelta}/${g.hcfDelta>0?'+':''}${g.hcfDelta}</td><td>${g.time}</td></tr>`).join('');
  return `<table><thead><tr><th>Mode</th><th>Result</th><th>Δ Elo/HCF</th><th>Date</th></tr></thead><tbody>${rows||'<tr><td colspan="4" class="muted">No games yet.</td></tr>'}</tbody></table>`;
}

let game = new Chess(); let selected=null; let legal=[]; let mode='casual';
function buildBoard(containerId,side='w'){
  const container=document.getElementById(containerId); container.innerHTML='';
  const board=document.createElement('div');board.className='board';container.appendChild(board);
  const squares = side==='w' ? [...'87654321'].flatMap(r=>[...'abcdefgh'].map(f=>f+r)) : [...'12345678'].flatMap(r=>[...'hgfedcba'].map(f=>f+r));
  squares.forEach(s=>{const sq=document.createElement('button');sq.className=`sq ${((s.charCodeAt(0)-97+parseInt(s[1]))%2?'dark':'light')}`;sq.dataset.s=s;sq.onclick=()=>onSquare(s);board.appendChild(sq);});
  drawBoard();
}
function drawBoard(){
  document.querySelectorAll('.sq').forEach(el=>{const p=game.get(el.dataset.s);el.textContent=p?PIECE[p.color==='w'?p.type.toUpperCase():p.type]:'';el.classList.remove('sel','legal');
    if(selected===el.dataset.s) el.classList.add('sel');
    if(legal.includes(el.dataset.s)) el.classList.add('legal');
  });
  const m=document.getElementById('moves');
  if(m){const h=game.history({verbose:true});m.innerHTML=h.map((mv,i)=>`<div class='move'>${i+1}. ${mv.san}</div>`).join('');}
}
function onSquare(s){
  if(!selected){
    const p=game.get(s); if(!p || p.color!==game.turn()) return;
    selected=s; legal=game.moves({square:s,verbose:true}).map(m=>m.to); drawBoard(); return;
  }
  const mv=game.move({from:selected,to:s,promotion:'q'});
  selected=null; legal=[];
  if(!mv){drawBoard(); return;}
  drawBoard();
  postMove();
}
function evalMaterial(ch){
  const v={p:100,n:320,b:330,r:500,q:900,k:0}; let s=0;
  for(const r of ch.board()) for(const p of r||[]) if(p) s += (p.color==='w'?1:-1)*v[p.type];
  return s;
}
function bestMove(depth=2){
  const maximizing=game.turn()==='w';
  function search(ch,d,a,b,max){ if(d===0||ch.isGameOver()) return evalMaterial(ch);
    const moves=ch.moves({verbose:true});
    if(max){let val=-1e9; for(const m of moves){ch.move(m);val=Math.max(val,search(ch,d-1,a,b,false));ch.undo();a=Math.max(a,val); if(b<=a) break;} return val;}
    let val=1e9; for(const m of moves){ch.move(m);val=Math.min(val,search(ch,d-1,a,b,true));ch.undo();b=Math.min(b,val); if(b<=a) break;} return val;
  }
  let best=null; let bestVal=maximizing?-1e9:1e9;
  for(const m of game.moves({verbose:true})){
    game.move(m); const val=search(game,depth-1,-1e9,1e9,!maximizing); game.undo();
    if((maximizing && val>bestVal)||(!maximizing && val<bestVal)){bestVal=val;best=m;}
  }
  return {best,bestVal};
}
function postMove(){
  const ev=document.getElementById('eval'); if(ev){const sc=evalMaterial(game)/100;ev.textContent=`Eval ${sc>0?'+':''}${sc.toFixed(2)} | FEN ${game.fen()}`;}
  if(game.isGameOver()){finishGame();return;}
  if(mode==='bot' && game.turn()==='b'){
    setTimeout(()=>{const bm=bestMove(2).best || game.moves({verbose:true})[0];game.move(bm);drawBoard();postMove();}, 400+Math.random()*800);
  }
}
function finishGame(){
  const result = game.isDraw()?'Draw':(game.turn()==='w'?'0-1':'1-0');
  let eloDelta=0,hcfDelta=0;
  if(mode==='elo') eloDelta=result==='1-0'?12:result==='0-1'?-9:2;
  if(mode==='hcf') hcfDelta=result==='1-0'?16:result==='0-1'?-12:1;
  if(mode==='bot'){eloDelta=result==='1-0'?8:-6;}
  state.user.elo += eloDelta; state.user.hcf += hcfDelta;
  state.history.unshift({mode:mode.toUpperCase(),result,eloDelta,hcfDelta,time:new Date().toLocaleString()}); save();
  alert(`Game over ${result}. Elo ${eloDelta>=0?'+':''}${eloDelta}, HCF ${hcfDelta>=0?'+':''}${hcfDelta}`);
  renderAll();
}

function renderPlay(){
  const v=document.getElementById('play');
  v.innerHTML=`<div class='panel board-wrap'><div id='playBoard'></div>
  <div class='panel'><h3>Game controls</h3><p class='muted'>Queue mode impacts rating updates and pairings.</p>
    <select id='modeSel'><option value='casual'>Casual</option><option value='elo'>Ranked Elo</option><option value='hcf'>HCF Competitive</option><option value='bot'>Vs Bot</option></select>
    <div style='display:flex;gap:8px;margin-top:8px'><button class='btn' id='newGame'>New game</button><button class='btn' id='flip'>Flip board</button></div>
    <p id='eval' class='muted'></p><h4>Move list</h4><div class='moves' id='moves'></div></div></div>`;
  let side='w';
  buildBoard('playBoard',side);
  document.getElementById('newGame').onclick=()=>{mode=document.getElementById('modeSel').value;game=new Chess();selected=null;legal=[];drawBoard();if(mode==='bot'&&game.turn()==='b')postMove();};
  document.getElementById('modeSel').onchange=e=>mode=e.target.value;
  document.getElementById('flip').onclick=()=>{side=side==='w'?'b':'w';buildBoard('playBoard',side);};
}

const puzzleSession={index:0,streak:0,survivalLives:3};
function renderPuzzles(){
  const v=document.getElementById('puzzles'); const p=state.puzzles[puzzleSession.index%state.puzzles.length];
  v.innerHTML=`<div class='grid g2'><div class='panel'><h3>Daily Puzzle</h3><p><strong>${p.theme}</strong> • rated</p><div id='puzzleBoard'></div><p id='puzzleInfo' class='muted'>Find the best move.</p>
    <div style='display:flex;gap:8px;margin-top:8px'><button class='btn' id='hint'>Hint</button><button class='btn' id='retry'>Retry</button><button class='btn' id='nextPuzzle'>Next</button></div></div>
    <div class='panel'><h3>Puzzle Arena</h3><p>Streak: <strong>${puzzleSession.streak}</strong> | Survival lives: <strong>${puzzleSession.survivalLives}</strong></p>
    <p>Categories: mate in 1/2, forks, pins, skewers, endgames, defensive tactics, opening traps, calculation.</p>
    <p class='muted'>Puzzle rating updates after each solve.</p></div></div>`;
  const pg=new Chess(p.fen);window.pgame=pg;window.psel=null;
  function drawP(){document.querySelectorAll('#puzzleBoard .sq').forEach(el=>{const pc=pg.get(el.dataset.s);el.textContent=pc?PIECE[pc.color==='w'?pc.type.toUpperCase():pc.type]:'';});}
  const holder=document.getElementById('puzzleBoard'); holder.innerHTML=''; const board=document.createElement('div');board.className='board';holder.appendChild(board);
  [...'87654321'].forEach(r=>[...'abcdefgh'].forEach(f=>{const s=f+r;const sq=document.createElement('button');sq.className=`sq ${((f.charCodeAt(0)-97+parseInt(r))%2?'dark':'light')}`;sq.dataset.s=s;sq.onclick=()=>{
      if(!window.psel){const pp=pg.get(s);if(!pp||pp.color!==pg.turn()) return;window.psel=s;return;}
      const mv=pg.move({from:window.psel,to:s,promotion:'q'});window.psel=null;if(!mv)return;drawP();
      const uci=mv.from+mv.to; if(uci===p.line[0]){document.getElementById('puzzleInfo').textContent='Correct! Rating +8. Explanation: forcing tactical motif succeeded.';state.user.puzzle+=8;puzzleSession.streak++;}
      else {document.getElementById('puzzleInfo').textContent='Not best. Rating -6. Try again.';state.user.puzzle-=6;puzzleSession.streak=0;puzzleSession.survivalLives=Math.max(0,puzzleSession.survivalLives-1);} save(); renderProfile(); renderDashboard();
    };board.appendChild(sq);})); drawP();
  document.getElementById('hint').onclick=()=>document.getElementById('puzzleInfo').textContent=`Hint: starts with ${p.line[0].slice(0,2)}→${p.line[0].slice(2,4)}`;
  document.getElementById('retry').onclick=()=>renderPuzzles();
  document.getElementById('nextPuzzle').onclick=()=>{puzzleSession.index++;renderPuzzles();};
}

function renderBots(){
  const bots=[['Scout',800,'human-like'],['Viper',1300,'aggressive'],['Wall',1600,'defensive'],['Atlas',2200,'engine-backed']];
  const v=document.getElementById('bots');
  v.innerHTML=`<div class='panel'><h3>Bot roster</h3><table><thead><tr><th>Bot</th><th>Elo</th><th>Style</th><th></th></tr></thead><tbody>${bots.map(b=>`<tr><td>${b[0]}</td><td>${b[1]}</td><td>${b[2]}</td><td><button class='btn pick' data-elo='${b[1]}'>Play</button></td></tr>`).join('')}</tbody></table></div>`;
  v.querySelectorAll('.pick').forEach(btn=>btn.onclick=()=>{show('play');mode='bot';document.getElementById('modeSel').value='bot';game=new Chess();drawBoard();alert(`Matched vs bot ${btn.dataset.elo}`);});
}
function renderAnalysis(){
  const v=document.getElementById('analysis');
  v.innerHTML=`<div class='grid g2'><div class='panel'><h3>Analysis Board</h3><textarea id='fenInput' rows='3' placeholder='Paste FEN'></textarea><div style='display:flex;gap:8px;margin-top:8px'><button class='btn' id='loadFen'>Load FEN</button><button class='btn' id='engine'>Top 3 lines</button><button class='btn' id='pgn'>Export PGN</button></div><div id='anaBoard' style='margin-top:10px'></div></div>
  <div class='panel'><h3>Engine review</h3><div id='lines' class='muted'>Run engine for multipv lines, move classifications, and centipawn trend.</div><div id='review'></div></div></div>`;
  const a=new Chess();window.ana=a;buildBoard('anaBoard');
  document.getElementById('loadFen').onclick=()=>{const fen=document.getElementById('fenInput').value.trim();if(!fen) return;try{a.load(fen);game=a;drawBoard();}catch{alert('Invalid FEN');}};
  document.getElementById('engine').onclick=()=>{
    const lines=[];const moves=a.moves({verbose:true}).slice(0,3);moves.forEach((m,i)=>{a.move(m);lines.push(`#${i+1} ${m.san} eval ${(evalMaterial(a)/100).toFixed(2)}`);a.undo();});
    document.getElementById('lines').innerHTML=lines.join('<br>')||'No legal moves.';
    document.getElementById('review').innerHTML=`<p>Accuracy: ${Math.max(55,Math.min(99,90-Math.abs(evalMaterial(a))/30)).toFixed(1)}%</p><p>Opening: ${a.history().length<3?'Unclassified':'Queen Pawn Structures'}</p>`;
  };
  document.getElementById('pgn').onclick=()=>navigator.clipboard.writeText(a.pgn()).then(()=>alert('PGN copied'));
}
function renderLeaderboards(){
  const v=document.getElementById('leaderboards');
  const r=state.leaderboard.slice().sort((a,b)=>b.elo-a.elo);
  v.innerHTML=`<div class='grid g2'><div class='panel'><h3>Standard Elo</h3>${table(r,'elo')}</div><div class='panel'><h3>HCF Ladder</h3>${table(state.leaderboard.slice().sort((a,b)=>b.hcf-a.hcf),'hcf')}</div></div>`;
}
function table(arr,key){return `<table><thead><tr><th>#</th><th>Player</th><th>${key.toUpperCase()}</th><th>Country</th></tr></thead><tbody>${arr.map((p,i)=>`<tr><td>${i+1}</td><td>${p.name}</td><td>${p[key]}</td><td>${p.country}</td></tr>`).join('')}</tbody></table>`}
function renderProfile(){
  const v=document.getElementById('profile');
  v.innerHTML=`<div class='grid g2'><div class='panel'><h3>${state.user.name} <span class='badge hcf'>${state.user.hcfTitle}</span></h3><p>${state.user.bio}</p><p>${state.user.country}</p>
  <p>Standard Elo: <strong>${state.user.elo}</strong><br>HCF: <strong>${state.user.hcf}</strong><br>Puzzle: <strong>${state.user.puzzle}</strong></p>
  <p>W/L/D: ${state.user.wins}/${state.user.losses}/${state.user.draws}</p></div><div class='panel'><h3>Match archive</h3>${renderRecentTable(20)}</div></div>`;
}
function renderHcf(){
  const v=document.getElementById('hcf');
  v.innerHTML=`<div class='grid g2'><div class='panel'><h3>Hamrock Chess Federation</h3><p>Official competitive circuit with stricter pairing and anti-cheat protocol.</p>
  <p>Current rating: <strong>${state.user.hcf}</strong> • title: <strong>${state.user.hcfTitle}</strong></p>
  <button class='btn' id='hcfQueue'>Join HCF ranked queue</button>
  <button class='btn' id='hcfSwiss'>Register Swiss event</button></div>
  <div class='panel'><h3>HCF seasonal standings</h3>${table(state.leaderboard.slice().sort((a,b)=>b.hcf-a.hcf),'hcf')}</div></div>`;
  document.getElementById('hcfQueue').onclick=()=>{show('play');mode='hcf';document.getElementById('modeSel').value='hcf';alert('Entered HCF queue (local matchmaking simulation).');};
  document.getElementById('hcfSwiss').onclick=()=>alert('Registered for HCF Swiss #42');
}
function renderAll(){renderDashboard();renderPlay();renderPuzzles();renderBots();renderAnalysis();renderLeaderboards();renderProfile();renderHcf();}
renderAll();

document.querySelectorAll('[data-queue]').forEach(b=>b.onclick=()=>{show('play');mode=b.dataset.queue;document.getElementById('modeSel').value=mode;});
