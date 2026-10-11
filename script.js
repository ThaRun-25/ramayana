const locations = [
  {id:'ayodhya', name:'Ayodhya', region:'THE KINGDOM OF KOSALA', description:'A radiant royal city, shaped by ancient traditions, devotion, and the promise of a great destiny.', coordinates:'26° 48′ N  /  82° 12′ E', message:'Ayodhya — the ancient seat of the Ikshvaku dynasty.', pan:'0px 0px', art:'assets/ayodhya-palace.png', position:{left:49.5,top:37}},
  {id:'mithila', name:'Mithila', region:'THE LAND OF WISDOM', description:'A storied land of gardens and learning, where grace and wisdom live at the heart of the kingdom.', coordinates:'26° 21′ N  /  86° 05′ E', message:'Mithila — a kingdom remembered for its wisdom and beauty.', pan:'-8px 3px', art:'assets/mithila-palace.png', position:{left:59,top:32}},
  {id:'kishkindha', name:'Kishkindha', region:'THE MONKEY KINGDOM', description:'A wild realm of towering rock, deep forests, and hidden paths, alive with courage and adventure.', coordinates:'15° 20′ N  /  76° 28′ E', message:'Kishkindha — a legendary kingdom among the forests and hills.', pan:'7px -5px', art:'assets/kishkindha-mountain.png', position:{left:45.5,top:61}},
  {id:'lanka', name:'Lanka', region:'THE SOUTHERN KINGDOM', description:'An island kingdom of immense beauty and formidable power, hidden beyond the southern sea.', coordinates:'06° 55′ N  /  79° 51′ E', message:'Lanka — the island kingdom beyond the southern sea.', pan:'-4px 7px', art:'assets/lanka-palace.png', position:{left:55.5,top:78}}
];
const $ = id => document.getElementById(id);
let activeIndex = 0;
let motionOn = true;
let wheelLocked = false;
let toastTimer;
let lastSpark = 0;

function buildNavigation(){
  $('menuLinks').innerHTML = '';
  locations.forEach((loc,i)=>{
    const link = document.createElement('button');
    link.type = 'button'; link.textContent = loc.name;
    link.addEventListener('click',()=>{showLocation(i);toggleMenu(false)});
    $('menuLinks').appendChild(link);
  });
}
function buildMapLandmarks(){
  const layer = $('mapLandmarks');
  layer.innerHTML = '';
  locations.forEach((loc,i)=>{
    const marker = document.createElement('button');
    marker.type = 'button';
    marker.className = 'map-landmark';
    marker.dataset.location = loc.id;
    marker.style.left = `${loc.position.left}%`;
    marker.style.top = `${loc.position.top}%`;
    marker.setAttribute('aria-label', `Highlight ${loc.name}`);
    marker.setAttribute('aria-pressed', String(i===activeIndex));
    const img = document.createElement('img');
    img.src = loc.art; img.alt = ''; img.draggable = false;
    const label = document.createElement('span');
    label.className = 'landmark-label'; label.textContent = loc.name;
    marker.append(img,label);
    marker.addEventListener('click',()=>showLocation(i));
    layer.appendChild(marker);
  });
  syncLandmarks();
}
function syncLandmarks(){
  document.querySelectorAll('.map-landmark').forEach((marker,i)=>{
    const active = i===activeIndex;
    marker.classList.toggle('active',active);
    marker.setAttribute('aria-pressed',String(active));
  });
  document.querySelectorAll('#menuLinks button').forEach((el,i)=>el.classList.toggle('active',i===activeIndex));
}
function showLocation(index){
  if(index<0||index>=locations.length||index===activeIndex)return;
  activeIndex=index;
  const loc=locations[index];
  $('locationTitle').textContent=loc.name;
  $('regionLabel').textContent=loc.region;
  $('locationDescription').textContent=loc.description;
  $('coordinates').textContent=loc.coordinates;
  $('currentCount').textContent=String(index+1).padStart(2,'0');
  // The map remains continuous. Only a very small framing nudge accompanies the highlight.
  $('landscape').style.setProperty('--pan-x',loc.pan.split(' ')[0]);
  $('landscape').style.setProperty('--pan-y',loc.pan.split(' ')[1]);
  $('locationTitle').style.animation='none';
  void $('locationTitle').offsetWidth;
  $('locationTitle').style.animation=motionOn?'rise .45s both':'none';
  syncLandmarks();
}
function nextLocation(direction){showLocation((activeIndex+direction+locations.length)%locations.length)}
function toggleMenu(force){const open=typeof force==='boolean'?force:!$('menuPanel').classList.contains('open');$('menuPanel').classList.toggle('open',open);$('menuPanel').setAttribute('aria-hidden',String(!open));$('menuButton').setAttribute('aria-expanded',String(open));$('menuButton').setAttribute('aria-label',open?'Close menu':'Open menu')}
function showToast(message){const el=$('detailToast');el.textContent=message;el.classList.add('show');clearTimeout(toastTimer);toastTimer=setTimeout(()=>el.classList.remove('show'),2600)}
function addCursorSpark(event){
  if(!motionOn || !event.target.closest('.experience')) return;
  const now=performance.now();
  if(now-lastSpark<55)return;
  lastSpark=now;
  const spark=document.createElement('span');
  spark.className='cursor-spark';
  spark.textContent=Math.random()>.45?'✦':'·';
  spark.style.left=`${event.clientX}px`;
  spark.style.top=`${event.clientY}px`;
  spark.style.setProperty('--drift-x',`${(Math.random()-.5)*26}px`);
  spark.style.setProperty('--drift-y',`${-10-Math.random()*24}px`);
  document.body.appendChild(spark);
  window.setTimeout(()=>spark.remove(),720);
}

buildNavigation();
buildMapLandmarks();
$('menuButton').addEventListener('click',()=>toggleMenu());
$('discoverButton').addEventListener('click',()=>showToast(locations[activeIndex].message));
$('motionButton').addEventListener('click',()=>{motionOn=!motionOn;document.body.classList.toggle('reduced-motion',!motionOn);$('motionLabel').textContent=motionOn?'MOTION ON':'MOTION OFF';$('motionButton').setAttribute('aria-pressed',String(motionOn))});
document.addEventListener('mousemove',addCursorSpark,{passive:true});
document.addEventListener('keydown',e=>{if(e.key==='Escape')toggleMenu(false);if(e.key==='ArrowDown'||e.key==='ArrowRight'){e.preventDefault();nextLocation(1)}if(e.key==='ArrowUp'||e.key==='ArrowLeft'){e.preventDefault();nextLocation(-1)}});
// One location per deliberate wheel gesture; no fade or background replacement.
document.addEventListener('wheel',e=>{
  if($('menuPanel').classList.contains('open'))return;
  if(Math.abs(e.deltaY)<12)return;
  e.preventDefault();
  if(wheelLocked)return;
  wheelLocked=true;nextLocation(e.deltaY>0?1:-1);
  window.setTimeout(()=>{wheelLocked=false},720);
},{passive:false});
let touchStartY=0;
document.addEventListener('touchstart',e=>{touchStartY=e.changedTouches[0].screenY},{passive:true});
document.addEventListener('touchend',e=>{const delta=touchStartY-e.changedTouches[0].screenY;if(Math.abs(delta)>55)nextLocation(delta>0?1:-1)},{passive:true});
