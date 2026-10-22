'use strict';
const KEY='wenwan-tracker-v1',TAGS=['手盘','刷','佩戴','手套'];
let db=load(),cur=null,editLog=null,pendingPhoto=null;
const $=s=>document.querySelector(s);
function load(){try{return JSON.parse(localStorage.getItem(KEY))||{strands:[]}}catch(e){return{strands:[]}}}
function save(){try{localStorage.setItem(KEY,JSON.stringify(db))}catch(e){alert('存储空间不足，请导出备份后删除部分照片')}}
const uid=()=>Date.now().toString(36)+Math.random().toString(36).slice(2,6);
const esc=s=>String(s??'').replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
const today=()=>new Date().toISOString().slice(0,10);
const hrs=s=>(s.logs.reduce((a,l)=>a+(+l.play||0)+(+l.wear||0),0)/60).toFixed(1);
function rgb2hsl(r,g,b){r/=255;g/=255;b/=255;const mx=Math.max(r,g,b),mn=Math.min(r,g,b);let h=0,s=0,l=(mx+mn)/2;
 if(mx!==mn){const d=mx-mn;s=l>.5?d/(2-mx-mn):d/(mx+mn);h=mx===r?(g-b)/d+(g<b?6:0):mx===g?(b-r)/d+2:(r-g)/d+4;h*=60}return[h,s*100,l*100]}
function lastColor(s){const l=[...s.logs].reverse().find(x=>x.color);return l?l.color.hex:'#d9c3a0'}
function renderList(){$('#listView').hidden=false;$('#detailView').hidden=true;
 $('#strandList').innerHTML=db.strands.length?db.strands.map(s=>`<div class="card strand" data-id="${s.id}"><div class="dot" style="background:${lastColor(s)}"></div><div><b>${esc(s.name)}</b> <span class="tag">${esc(s.material)}</span><div class="mut">开盘 ${esc(s.start)} · 累计 ${hrs(s)} 小时 · ${s.logs.length} 条记录</div></div></div>`).join(''):'<p class="card mut">还没有手串，点击“新建手串”开始记录吧。</p>';
 document.querySelectorAll('.strand').forEach(e=>e.onclick=()=>openStrand(e.dataset.id))}
function openStrand(id){cur=db.strands.find(s=>s.id===id);if(!cur)return renderList();cur.logs.sort((a,b)=>a.date.localeCompare(b.date));
 $('#listView').hidden=true;$('#detailView').hidden=false;
 const days=Math.max(1,Math.round((new Date(today())-new Date(cur.start))/864e5)+1);
 $('#strandInfo').innerHTML=`<h2 style="margin:0">${esc(cur.name)} <span class="tag">${esc(cur.material)}</span></h2><p class="mut">开盘 ${esc(cur.start)} · 第 ${days} 天 · 累计 <b>${hrs(cur)}</b> 小时（盘玩 ${(cur.logs.reduce((a,l)=>a+(+l.play||0),0)/60).toFixed(1)} / 佩戴 ${(cur.logs.reduce((a,l)=>a+(+l.wear||0),0)/60).toFixed(1)}）</p><p>${esc(cur.notes)}</p>`;
 const c=cur.logs.filter(l=>l.color);
 $('#swatches').innerHTML=c.length?c.map(l=>`<div class="sw" title="${l.date} ${l.color.hex}"><div style="background:${l.color.hex}"></div>${l.date.slice(5)}</div>`).join(''):'<span class="mut">上传照片后自动提取中心区域平均色</span>';
 drawChart(c);
 $('#logList').innerHTML=[...cur.logs].reverse().map(l=>`<div class="card log" data-id="${l.id}">${l.photo?`<img src="${l.photo}">`:''}<div style="flex:1"><b>${l.date}</b> ${l.color?`<span class="tag" style="background:${l.color.hex};color:${l.color.l>55?'#000':'#fff'}">${l.color.hex}</span>`:''}<div class="mut">盘玩 ${l.play||0} 分钟 · 佩戴 ${l.wear||0} 分钟</div>${(l.tags||[]).map(t=>`<span class="tag">${esc(t)}</span>`).join('')}<div>${esc(l.notes)}</div><button class="ghost e">编辑</button> <button class="ghost d">删除</button></div></div>`).join('');
 document.querySelectorAll('.log').forEach(e=>{const l=cur.logs.find(x=>x.id===e.dataset.id);e.querySelector('.e').onclick=()=>openLog(l);
  e.querySelector('.d').onclick=()=>{if(confirm('删除这条记录？')){cur.logs=cur.logs.filter(x=>x!==l);save();openStrand(cur.id)}}})}
function drawChart(c){const cv=$('#chart'),g=cv.getContext&&cv.getContext('2d');if(!g)return;const W=cv.width,H=cv.height,P=30;g.clearRect(0,0,W,H);
 g.strokeStyle='#eee';g.fillStyle='#999';g.font='11px sans-serif';for(let i=0;i<=4;i++){const y=P+(H-2*P)*i/4;g.beginPath();g.moveTo(P,y);g.lineTo(W-10,y);g.stroke()}
 if(c.length<1){g.fillText('暂无颜色数据',W/2-36,H/2);return}
 const t0=new Date(c[0].date),t1=new Date(c[c.length-1].date),sp=Math.max(1,t1-t0),X=d=>P+(W-P-10)*(c.length>1?(new Date(d)-t0)/sp:.5);
 const line=(f,max,col)=>{g.strokeStyle=g.fillStyle=col;g.lineWidth=2;g.beginPath();c.forEach((l,i)=>{const x=X(l.date),y=H-P-(H-2*P)*f(l)/max;i?g.lineTo(x,y):g.moveTo(x,y)});g.stroke();c.forEach(l=>{g.beginPath();g.arc(X(l.date),H-P-(H-2*P)*f(l)/max,3,0,7);g.fill()})};
 line(l=>l.color.h,360,'#c0622b');line(l=>l.color.l,100,'#5a6f9b');
 g.fillStyle='#999';g.fillText(c[0].date,P,H-8);if(c.length>1)g.fillText(c[c.length-1].date,W-80,H-8);g.fillText('色相0-360 / 亮度0-100',P,14)}
function processImage(file){return new Promise((res,rej)=>{const r=new FileReader();r.onerror=rej;r.onload=()=>{const im=new Image();im.onerror=rej;im.onload=()=>{
 const k=Math.min(1,800/Math.max(im.width,im.height)),cv=document.createElement('canvas');cv.width=Math.round(im.width*k);cv.height=Math.round(im.height*k);
 const g=cv.getContext('2d');g.drawImage(im,0,0,cv.width,cv.height);const w=Math.round(cv.width*.3),h=Math.round(cv.height*.3);
 const d=g.getImageData((cv.width-w)>>1,(cv.height-h)>>1,w,h).data;let R=0,G=0,B=0,n=0;for(let i=0;i<d.length;i+=4){R+=d[i];G+=d[i+1];B+=d[i+2];n++}
 R=Math.round(R/n);G=Math.round(G/n);B=Math.round(B/n);const [hh,ss,ll]=rgb2hsl(R,G,B);
 res({photo:cv.toDataURL('image/jpeg',.8),color:{r:R,g:G,b:B,h:+hh.toFixed(1),s:+ss.toFixed(1),l:+ll.toFixed(1),hex:'#'+[R,G,B].map(v=>v.toString(16).padStart(2,'0')).join('')}})};im.src=r.result};r.readAsDataURL(file)})}
function openStrandDlg(s){const f=$('#strandForm');f.elements.sname.value=s?.name||'';f.elements.material.value=s?.material||'百香籽';f.elements.start.value=s?.start||today();f.elements.notes.value=s?.notes||'';
 $('#strandDlg')._h=()=>{if($('#strandDlg').returnValue!=='ok')return;const v={name:f.elements.sname.value.trim(),material:f.elements.material.value.trim(),start:f.elements.start.value,notes:f.elements.notes.value};
  if(s){Object.assign(s,v);save();openStrand(s.id)}else{db.strands.push({id:uid(),logs:[],...v});save();renderList()}};$('#strandDlg').returnValue='';$('#strandDlg').showModal()}
function openLog(l){editLog=l;pendingPhoto=null;const f=$('#logForm');f.reset();f.elements.date.value=l?.date||today();f.elements.play.value=l?.play||0;f.elements.wear.value=l?.wear||0;f.elements.notes.value=l?.notes||'';
 $('#tagBox').innerHTML=TAGS.map(t=>`<label><input type="checkbox" value="${t}" ${(l?.tags||[]).includes(t)?'checked':''}>${t}</label>`).join('');
 const p=$('#preview');p.hidden=!l?.photo;p.src=l?.photo||'';$('#logDlg').returnValue='';$('#logDlg').showModal()}
function init(){
 $('#addStrandBtn').onclick=()=>openStrandDlg();$('#editStrandBtn').onclick=()=>openStrandDlg(cur);$('#backBtn').onclick=renderList;
 $('#delStrandBtn').onclick=()=>{if(confirm(`确定删除「${cur.name}」及全部记录？`)){db.strands=db.strands.filter(s=>s!==cur);save();renderList()}};
 $('#addLogBtn').onclick=()=>openLog();
 $("#logForm").elements.photo.onchange=async e=>{const file=e.target.files[0];if(!file)return;try{pendingPhoto=await processImage(file);$('#preview').src=pendingPhoto.photo;$('#preview').hidden=false}catch(err){alert('图片读取失败')}};
 $('#logDlg')._h=()=>{if($('#logDlg').returnValue!=='ok')return;const f=$('#logForm');
  const v={date:f.elements.date.value,play:+f.elements.play.value||0,wear:+f.elements.wear.value||0,notes:f.elements.notes.value,tags:[...document.querySelectorAll('#tagBox input:checked')].map(i=>i.value),...(pendingPhoto||{})};
  if(editLog)Object.assign(editLog,v);else cur.logs.push({id:uid(),...v});save();openStrand(cur.id)};
 $('#exportBtn').onclick=()=>{const a=document.createElement('a');a.href=URL.createObjectURL(new Blob([JSON.stringify({app:'wenwan-tracker',version:1,exported:new Date().toISOString(),...db},null,1)],{type:'application/json'}));a.download=`文玩备份-${today()}.json`;a.click()};
 $('#importFile').onchange=e=>{const file=e.target.files[0];if(!file)return;const r=new FileReader();r.onload=()=>{try{const d=JSON.parse(r.result);if(!Array.isArray(d.strands))throw 0;
  if(confirm('导入将覆盖当前数据，确定？')){db={strands:d.strands};save();renderList()}}catch(x){alert('备份文件格式错误')}e.target.value=''};r.readAsText(file)};
 renderList()}
['#strandDlg','#logDlg'].forEach(s=>$(s).addEventListener('close',()=>$(s)._h&&$(s)._h()));
init();
