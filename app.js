// Hero slideshow + scroll-driven headline swap
const SLIDES=[
  {img:'img/life7.jpg', h:'Keep it cold, door to door.'},
  {img:'img/life3.jpg', h:'Temperature-controlled shipping.'},
  {img:'img/life6.jpg', h:'Packed cold, delivered cold.'},
  {img:'img/life1.jpg', h:'Branded packaging, your way.'},
  {img:'img/life4.jpg', h:'Cold chain, done right.'},
  {img:'img/life5.jpg', h:'From one box to a pallet.'},
  {img:'img/life2.jpg', h:'Built for what spoils fastest.'}
];
(function(){
  const bgA=document.getElementById('bgA'),bgB=document.getElementById('bgB'),H=document.getElementById('h1'),hero=document.getElementById('hero');
  if(!bgA||!bgB||!H)return;
  SLIDES.forEach(s=>{const im=new Image();im.src=s.img;});
  let si=0,top=bgA,bot=bgB;
  function advanceImg(){
    si=(si+1)%SLIDES.length;bot.src=SLIDES[si].img;
    bot.onload=function(){bot.classList.add('on');top.classList.remove('on');const t=top;top=bot;bot=t;};
  }
  setInterval(advanceImg,4500);
  let hi=-1,ticking=false;
  function updH(){
    ticking=false;if(!hero)return;
    const vh=innerHeight,total=hero.offsetHeight-vh;
    const scrolled=Math.min(Math.max(-hero.getBoundingClientRect().top,0),total);
    const p=total>0?scrolled/total:0;
    const idx=Math.min(SLIDES.length-1,Math.floor(p*SLIDES.length));
    if(idx!==hi){hi=idx;H.style.opacity=0;setTimeout(()=>{H.textContent=SLIDES[idx].h;H.style.opacity=1;},220);}
  }
  addEventListener('scroll',()=>{if(!ticking){ticking=true;requestAnimationFrame(updH);}},{passive:true});
  addEventListener('resize',updH);updH();
})();

// Fly-in on scroll
(function(){
  const els=document.querySelectorAll('.wrap h2,.wrap .lead,.pcard,.reveal-cap,.formsec .card,.wrap [style*="border:1px solid"]');
  els.forEach((e,i)=>{e.classList.add('fly');e.style.transitionDelay=((i%6)*0.06)+'s';});
  const io=new IntersectionObserver((ents)=>{ents.forEach(en=>{if(en.isIntersecting){en.target.classList.add('in');io.unobserve(en.target);}});},{threshold:0.12});
  document.querySelectorAll('.fly').forEach(e=>io.observe(e));
})();

// Scroll-scrub box animation
(function(){
  const FR=28,boxframe=document.getElementById('boxframe'),reveal=document.getElementById('reveal');
  if(!boxframe||!reveal)return;
  const imgs=[];
  for(let i=0;i<FR;i++){const im=new Image();im.src='kbox/f'+String(i).padStart(2,'0')+'.jpg';imgs[i]=im;}
  let cur=-1,ticking=false;
  function update(){
    ticking=false;
    const vh=innerHeight,total=reveal.offsetHeight-vh;
    const scrolled=Math.min(Math.max(-reveal.getBoundingClientRect().top,0),total);
    const p=total>0?scrolled/total:0;
    const idx=Math.min(FR-1,Math.max(0,Math.round(p*(FR-1))));
    if(idx!==cur){cur=idx;boxframe.src=imgs[idx].src;}
  }
  addEventListener('scroll',()=>{if(!ticking){ticking=true;requestAnimationFrame(update);}},{passive:true});
  addEventListener('resize',update);update();
})();

// Sizes and pricing
const SIZES={
  xs:{name:'XS',vol:'1.40 L',pay:'1 kg',ext:'183x128x114',pk:32,pkP:25.00,pal:800,palP:600,sgl:0.80,ice:1.90,out:0.90,slv1:0.65,slvf:0.95,bag:6.50,bsp:2.50,bem:4.50,bst:1.50,w:0.50,h:0.44,d:0.66},
  s: {name:'S', vol:'2.40 L',pay:'2 kg',ext:'230x150x124',pk:20,pkP:18.50,pal:480,palP:439,sgl:0.95,ice:2.50,out:1.05,slv1:0.70,slvf:1.00,bag:7.50,bsp:2.50,bem:4.50,bst:1.50,w:0.60,h:0.50,d:0.74},
  m: {name:'M', vol:'3.64 L',pay:'3 kg',ext:'260x180x120',pk:10,pkP:15.50,pal:300,palP:450,sgl:1.60,ice:4.00,out:1.40,slv1:0.75,slvf:1.10,bag:8.50,bsp:3.00,bem:5.00,bst:1.75,w:0.68,h:0.47,d:0.82},
  l: {name:'L', vol:'5.60 L',pay:'5 kg',ext:'310x230x125',pk:10,pkP:16.00,pal:224,palP:348,sgl:1.65,ice:4.50,out:1.55,slv1:0.80,slvf:1.20,bag:9.50,bsp:3.00,bem:5.00,bst:1.75,w:0.76,h:0.49,d:0.88},
  xl:{name:'XL',vol:'7.28 L',pay:'7 kg',ext:'310x230x155',pk:8, pkP:13.80,pal:160,palP:272,sgl:1.75,ice:5.00,out:1.95,slv1:0.85,slvf:1.25,bag:12.50,bsp:3.50,bem:5.50,bst:2.00,w:0.76,h:0.60,d:0.88},
  xxl:{name:'XXL',vol:'13.99 L',pay:'12 kg',ext:'400x300x160',pk:4,pkP:15.00,pal:80,palP:297,sgl:3.95,ice:8.50,out:2.50,slv1:0.95,slvf:1.40,bag:15.50,bsp:3.50,bem:6.00,bst:2.00,w:0.96,h:0.62,d:0.96},
};
const BAG_COLORS=[
  {name:'Stone',hex:'#C8C0B0'},{name:'Navy',hex:'#2C3E50'},{name:'Charcoal',hex:'#4A4A4A'},
  {name:'Sage',hex:'#8B9E7A'},{name:'Cream',hex:'#F5F0E8'},{name:'Custom',hex:'custom'},
];
const SLV_COLORS=[
  {name:'White',hex:'#FFFFFF',brd:'#ccc'},{name:'Kraft',hex:'#C8A86A',brd:'#a08040'},
  {name:'Black',hex:'#2C2C2A',brd:'#555'},{name:'Navy',hex:'#2C3E50',brd:'#1a2a38'},
  {name:'Teal',hex:'#1D9E75',brd:'#0e5a42'},{name:'Custom',hex:'custom',brd:'#999'},
];
let sz='m',chosenQty=300,bagCI=0,slvCI=0,animFrame=null,thumbFrames={};
const f=n=>'£'+n.toFixed(2);

function drawBoxToCanvas(canvas,vKey,angle,opts={}){
  const ctx=canvas.getContext('2d');
  const W=canvas.width,H=canvas.height;
  ctx.clearRect(0,0,W,H);
  const v=SIZES[vKey];
  const scale=opts.scale||55;
  const bw=v.w*scale,bh=v.h*scale,bd=v.d*scale;
  const cx=W/2,cy=H/2+(opts.cy||6);
  const cos=Math.cos(angle)*0.55,sinA=Math.sin(angle)*0.55,iso=0.4;
  const proj=(x,y,z)=>({px:cx+x*cos-z*sinA,py:cy+x*sinA*iso+z*cos*iso-y});
  const face=(pts,fill,stroke)=>{
    ctx.beginPath();ctx.moveTo(pts[0].px,pts[0].py);
    for(let i=1;i<pts.length;i++)ctx.lineTo(pts[i].px,pts[i].py);
    ctx.closePath();ctx.fillStyle=fill;ctx.fill();
    ctx.strokeStyle=stroke||'#b0aca6';ctx.lineWidth=opts.lw||0.8;ctx.stroke();
  };
  const hw=bw/2,hd=bd/2,baseH=bh*0.65,lidH=bh*0.35;
  const eps='#f0ede8',epsd='#c8c4be',epsm='#dcd8d2';
  face([proj(-hw,0,-hd),proj(hw,0,-hd),proj(hw,0,hd),proj(-hw,0,hd)],eps);
  face([proj(-hw,0,hd),proj(hw,0,hd),proj(hw,baseH,hd),proj(-hw,baseH,hd)],epsd);
  face([proj(hw,0,-hd),proj(hw,0,hd),proj(hw,baseH,hd),proj(hw,baseH,-hd)],epsm);
  face([proj(-hw,baseH,-hd),proj(hw,baseH,-hd),proj(hw,baseH,hd),proj(-hw,baseH,hd)],eps);
  const s1=proj(-hw,baseH,hd),s2=proj(hw,baseH,hd),s3=proj(hw,baseH,-hd);
  ctx.beginPath();ctx.moveTo(s1.px,s1.py);ctx.lineTo(s2.px,s2.py);ctx.lineTo(s3.px,s3.py);
  ctx.strokeStyle='#9a9690';ctx.lineWidth=(opts.lw||0.8)*1.2;ctx.stroke();
  face([proj(-hw,baseH,hd),proj(hw,baseH,hd),proj(hw,baseH+lidH,hd),proj(-hw,baseH+lidH,hd)],epsd);
  face([proj(hw,baseH,-hd),proj(hw,baseH,hd),proj(hw,baseH+lidH,hd),proj(hw,baseH+lidH,-hd)],epsm);
  face([proj(-hw,baseH+lidH,-hd),proj(hw,baseH+lidH,-hd),proj(hw,baseH+lidH,hd),proj(-hw,baseH+lidH,hd)],eps);
  if(opts.sleeve){
    const sc=SLV_COLORS[slvCI],sh=sc.hex==='custom'?'#7F77DD':sc.hex;
    const sy=baseH-8,sth=10;
    face([proj(-hw,sy,hd),proj(hw,sy,hd),proj(hw,sy+sth,hd),proj(-hw,sy+sth,hd)],sh,sc.brd||sh);
    face([proj(hw,sy,-hd),proj(hw,sy,hd),proj(hw,sy+sth,hd),proj(hw,sy+sth,-hd)],sh,sc.brd||sh);
  }
  if(opts.outer){
    const off=opts.offPx||4;
    ctx.strokeStyle='#c8a86a';ctx.lineWidth=(opts.lw||0.8);ctx.setLineDash([3,2]);
    const of=[proj(-hw-off,-off,hd+off),proj(hw+off,-off,hd+off),proj(hw+off,baseH+lidH+off,hd+off),proj(-hw-off,baseH+lidH+off,hd+off)];
    ctx.beginPath();ctx.moveTo(of[0].px,of[0].py);of.forEach(p=>ctx.lineTo(p.px,p.py));ctx.closePath();ctx.stroke();
    const or=[proj(hw+off,-off,-hd-off),proj(hw+off,-off,hd+off),proj(hw+off,baseH+lidH+off,hd+off),proj(hw+off,baseH+lidH+off,-hd-off)];
    ctx.beginPath();ctx.moveTo(or[0].px,or[0].py);or.forEach(p=>ctx.lineTo(p.px,p.py));ctx.closePath();ctx.stroke();
    ctx.setLineDash([]);
  }
  if(opts.bag){
    const bc=BAG_COLORS[bagCI],bh2=bc.hex==='custom'?'#7F77DD':bc.hex;
    const hColor=bh2==='#F5F0E8'?'#8B9E7A':bh2;
    const topY=baseH+lidH+3;
    ctx.strokeStyle=hColor;ctx.lineWidth=(opts.lw||0.8)*2.5;ctx.lineCap='round';
    const lhp=proj(-hw*0.45,topY,0),rhp=proj(hw*0.45,topY,0),mid=proj(0,topY+18,0);
    ctx.beginPath();ctx.moveTo(lhp.px,lhp.py);ctx.quadraticCurveTo(lhp.px-2,mid.py,mid.px-9,mid.py);ctx.stroke();
    ctx.beginPath();ctx.moveTo(rhp.px,rhp.py);ctx.quadraticCurveTo(rhp.px+2,mid.py,mid.px+9,mid.py);ctx.stroke();
  }
}

function buildSizeGrid(){
  const g=document.getElementById('sizeGrid');g.innerHTML='';
  Object.entries(SIZES).forEach(([k,v])=>{
    const btn=document.createElement('button');
    btn.className='size-btn'+(k===sz?' active':'');
    const c=document.createElement('canvas');c.width=80;c.height=60;btn.appendChild(c);
    const szEl=document.createElement('span');szEl.className='sz';szEl.textContent=v.name;btn.appendChild(szEl);
    const svEl=document.createElement('span');svEl.className='sv';svEl.textContent=v.vol;btn.appendChild(svEl);
    btn.onclick=()=>{sz=k;buildSizeGrid();onQtyInput();};
    g.appendChild(btn);
    let thumbAngle=0.6;
    if(thumbFrames[k])cancelAnimationFrame(thumbFrames[k]);
    const animate=()=>{thumbAngle+=0.008;drawBoxToCanvas(c,k,thumbAngle,{scale:28,cy:2,lw:0.5});thumbFrames[k]=requestAnimationFrame(animate);};
    animate();
  });
}

function buildSwatches(colors,containerId,nameId,selectedIdx,onSelect){
  const cont=document.getElementById(containerId);cont.innerHTML='';
  colors.forEach((c,i)=>{
    const d=document.createElement('div');
    d.className='swatch'+(i===selectedIdx?' selected':'');
    if(c.hex==='custom'){d.className+=' custom';d.textContent='+';}
    else{d.style.background=c.hex;d.style.border=`2px solid ${i===selectedIdx?'var(--color-text-primary)':(c.brd||c.hex)}`;}
    d.onclick=()=>onSelect(i);
    cont.appendChild(d);
  });
  document.getElementById(nameId).textContent=colors[selectedIdx].name+(colors[selectedIdx].hex==='custom'?' (min 50 pcs)':'');
}

function getSnaps(s,target){
  const v=SIZES[s];const opts=new Set();
  if(target<=1)return[1];
  [Math.floor(target/v.pal)*v.pal,Math.ceil(target/v.pal)*v.pal,Math.floor(target/v.pk)*v.pk,Math.ceil(target/v.pk)*v.pk].forEach(x=>{if(x>0)opts.add(x);});
  if(target<v.pk)opts.add(1);
  return[...opts].filter(x=>x>0).sort((a,b)=>Math.abs(a-target)-Math.abs(b-target)).slice(0,4);
}

function describeQty(s,q){
  const v=SIZES[s];
  const pals=Math.floor(q/v.pal),rem=q%v.pal,pks=Math.floor(rem/v.pk),sgls=rem%v.pk;
  const parts=[];
  if(pals>0)parts.push(`${pals} pallet${pals>1?'s':''} (${pals*v.pal} pcs)`);
  if(pks>0)parts.push(`${pks} pack${pks>1?'s':''} (${pks*v.pk} pcs)`);
  if(sgls>0)parts.push(`${sgls} pc${sgls>1?'s':''}`);
  const total=pals*v.palP+pks*v.pkP+sgls*v.sgl;
  return{text:parts.join(' + '),total,cpu:total/q,tier:pals>0&&rem===0?'Pallet':pals>0?'Pallet+Pack':pks>0?'Pack':'Single'};
}

function boxTot(s,q){
  const v=SIZES[s];
  const pals=Math.floor(q/v.pal),rem=q%v.pal,pks=Math.floor(rem/v.pk),sgls=rem%v.pk;
  return pals*v.palP+pks*v.pkP+sgls*v.sgl;
}

function onQtyInput(){
  const raw=parseInt(document.getElementById('qtyInput').value)||1;
  const snaps=getSnaps(sz,raw);
  const sd=document.getElementById('snapOpts');sd.innerHTML='';
  let first=true;
  snaps.forEach((q,i)=>{
    const d=describeQty(sz,q);
    const diff=q-raw,ds=diff===0?'exact':diff>0?`+${diff}`:`${diff}`;
    const b=document.createElement('button');
    b.className='snap-btn'+(i===0?' best chosen':' alt');
    b.innerHTML=`<strong>${q}</strong> <span style="font-size:10px">${ds} · ${f(d.cpu)}/pc</span>`;
    b.onclick=()=>{chosenQty=q;document.querySelectorAll('.snap-btn').forEach(x=>x.classList.remove('chosen'));b.classList.add('chosen');calc();};
    sd.appendChild(b);
    if(first){chosenQty=q;first=false;}
  });
  calc();
}

function startMainAnim(){
  if(animFrame)cancelAnimationFrame(animFrame);
  const canvas=document.getElementById('mainCanvas');
  let t0=null;
  const hasSleeve=()=>document.getElementById('aSleeve').checked;
  const hasOuter=()=>document.getElementById('aOuter').checked;
  const hasBag=()=>document.getElementById('aBag').checked;
  const frame=ts=>{
    if(!t0)t0=ts;
    const angle=(ts-t0)/1000*0.7;
    drawBoxToCanvas(canvas,sz,angle,{scale:68,cy:10,lw:1.0,sleeve:hasSleeve(),outer:hasOuter(),bag:hasBag(),offPx:6});
    animFrame=requestAnimationFrame(frame);
  };
  animFrame=requestAnimationFrame(frame);
}

function calc(){
  const v=SIZES[sz];const q=chosenQty;
  const aIce=document.getElementById('aIce').checked;
  const aOuter=document.getElementById('aOuter').checked;
  const aSleeve=document.getElementById('aSleeve').checked;
  const st=document.getElementById('sleeveType').value;
  const aBag=document.getElementById('aBag').checked;
  const bp=document.getElementById('bagPers').value;
  document.getElementById('sleeveOpts').className=aSleeve?'addon-sub':'addon-sub hidden';
  document.getElementById('bagOpts').className=aBag?'addon-sub':'addon-sub hidden';
  const slvPc=st==='fc'?v.slvf:v.slv1;
  document.getElementById('ice-price').textContent=`+${f(v.ice)}/pc`;
  document.getElementById('outer-price').textContent=`+${f(v.out)}/pc`;
  document.getElementById('sleeve-price').textContent=`+${f(slvPc)}/pc`;
  document.getElementById('bag-price').textContent=`+${f(v.bag)}/pc`;
  document.getElementById('sleeve-warn').textContent=aSleeve&&q<50?'min 50':'';
  const bMoq=bp==='em'?20:(bp==='sp'||bp==='st')?10:0;
  document.getElementById('bag-warn').textContent=aBag&&bMoq>0&&q<bMoq?`min ${bMoq}`:'';
  buildSwatches(SLV_COLORS,'sleeveSwatches','sleeveColorName',slvCI,i=>{slvCI=i;calc();});
  buildSwatches(BAG_COLORS,'bagSwatches','bagColorName',bagCI,i=>{bagCI=i;calc();});
  const desc=describeQty(sz,q);
  document.getElementById('qtyResult').textContent=`${q} pcs = ${desc.text} · avg ${f(desc.cpu)}/pc`;
  const sc=SLV_COLORS[slvCI],bc=BAG_COLORS[bagCI];
  document.getElementById('pi-name').textContent=`ColdCore ${v.name}`;
  document.getElementById('pi-dims').innerHTML=`${v.ext} mm &nbsp;&middot;&nbsp; ${v.vol} &nbsp;&middot;&nbsp; up to ${v.pay}`;
  const chips=[{l:'Box',on:true},{l:'Ice packs',on:aIce},{l:'Outer',on:aOuter},{l:`Sleeve ${sc.name}`,on:aSleeve},{l:`Bag ${bc.name}`,on:aBag}];
  document.getElementById('pi-addons').innerHTML=chips.map(c=>`<span class="addon-chip${c.on?' on':''}">${c.l}</span>`).join('');
  let lines=[],sub=0;
  const bt=boxTot(sz,q);sub+=bt;
  lines.push({n:`ColdCore Box ${v.name}`,s:`${q} pcs · ${desc.tier} · ${f(bt/q)}/pc`,p:bt});
  if(aIce){const t=v.ice*q;sub+=t;lines.push({n:`Ice pack set ${v.name}`,s:`${q} sets · ${f(v.ice)}/set`,p:t});}
  if(aOuter){const t=v.out*q;sub+=t;lines.push({n:`Cardboard outer ${v.name}`,s:`${q} pcs · ${f(v.out)}/pc`,p:t});}
  if(aSleeve){
    if(q>=50){const t=slvPc*q;sub+=t;lines.push({n:`Sleeve ${v.name} · ${sc.name} · ${st==='fc'?'full colour':'1-colour'}`,s:`${q} pcs · ${f(slvPc)}/pc`,p:t});}
    else lines.push({n:`Sleeve ${v.name}`,s:'min 50 pcs - not included',p:0,w:true});
  }
  if(aBag){
    let badd=0,pl='plain';
    if(bp==='sp'&&q>=10){badd=v.bsp;pl='screen print';}
    else if(bp==='em'&&q>=20){badd=v.bem;pl='embroidery';}
    else if(bp==='st'&&q>=10){badd=v.bst;pl='sticker/patch';}
    else if(bp!=='plain')pl='plain (MOQ not met)';
    const bu=v.bag+badd,t=bu*q;sub+=t;
    const cn=bc.hex==='custom'?' custom Pantone (50 min)':'';
    lines.push({n:`ColdCarry Bag ${v.name} · ${bc.name}${cn}${pl!=='plain'?' · '+pl:''}`,s:`${q} pcs · ${f(v.bag)}${badd>0?' + '+f(badd)+' personalisation':''} = ${f(bu)}/pc`,p:t});
  }
  const vat=sub*0.20,grand=sub+vat;
  document.getElementById('rLines').innerHTML=lines.map(l=>`<div class="r-line"><div style="flex:1"><div class="r-lname">${l.n}</div><div class="r-lsub${l.w?' moq-warn':''}">${l.s}</div></div><div class="r-lp">${l.p>0?f(l.p):'—'}</div></div>`).join('');
  document.getElementById('rSub').textContent=f(sub);
  document.getElementById('rVat').textContent=f(vat);
  document.getElementById('rGrand').textContent=f(grand);
  document.getElementById('mQty').textContent=q;
  document.getElementById('mTier').textContent=desc.tier;
  document.getElementById('mCpu').textContent=f(bt/q);
  document.getElementById('mAll').textContent=f(sub/q);
}

// Range grid
(function(){
  const g=document.getElementById('rangeGrid');
  if(!g||typeof SIZES==='undefined')return;
  Object.entries(SIZES).forEach(([k,v])=>{
    const card=document.createElement('div');card.className='rbox fly';
    const c=document.createElement('canvas');c.width=160;c.height=116;card.appendChild(c);
    const nm=document.createElement('div');nm.className='bn';nm.textContent='ColdCore '+v.name;card.appendChild(nm);
    const bd=document.createElement('div');bd.className='bd';bd.innerHTML=v.ext+' mm<br>'+v.vol+' up to '+v.pay;card.appendChild(bd);
    const bp=document.createElement('div');bp.className='bp';bp.innerHTML='from £'+v.sgl.toFixed(2)+' <span class="bpe">per box</span>';card.appendChild(bp);
    g.appendChild(card);
    let a=0.5;(function anim(){a+=0.01;drawBoxToCanvas(c,k,a,{scale:36,cy:6,lw:0.7});requestAnimationFrame(anim);})();
  });
  const io2=new IntersectionObserver(es=>es.forEach(e=>{if(e.isIntersecting){e.target.classList.add('in');io2.unobserve(e.target);}}),{threshold:0.12});
  g.querySelectorAll('.fly').forEach((e,i)=>{e.style.transitionDelay=((i%3)*0.07)+'s';io2.observe(e);});
})();

if(document.getElementById('sizeGrid')){
  buildSizeGrid();
  buildSwatches(SLV_COLORS,'sleeveSwatches','sleeveColorName',slvCI,i=>{slvCI=i;calc();});
  buildSwatches(BAG_COLORS,'bagSwatches','bagColorName',bagCI,i=>{bagCI=i;calc();});
  onQtyInput();startMainAnim();
}

function submitLead(){
  const n=document.getElementById('f_name').value.trim(),c=document.getElementById('f_contact').value.trim();
  if(!n||!c){alert('Please enter your name and contact');return;}
  try{fetch('/api/lead',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({name:n,contact:c})});}catch(e){}
  document.getElementById('step1').classList.add('hide');document.getElementById('step2').classList.remove('hide');
}
