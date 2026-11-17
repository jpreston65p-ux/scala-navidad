'use strict';
const $ = s=>document.querySelector(s);
const $$ = s=>Array.from(document.querySelectorAll(s));
const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const ico=(name)=>`<svg class="icon"><use href="#i-${name}"/></svg>`;
const formatCash=x=>`Bs ${Math.max(0,Number(x)||0).toFixed(0)}`;
const loadCart=()=>{try{const v=JSON.parse(localStorage.getItem('scala_magia_cart')||'[]');return Array.isArray(v)?v:[]}catch{return []}};
const state={products:[],category:'Todas',search:'',sort:'destacadas',shown:12,current:null,cart:loadCart(),orderRef:null,whatsapp:'',payment:null};
const saveCart=()=>{try{localStorage.setItem('scala_magia_cart',JSON.stringify(state.cart))}catch{}};
const showToast=s=>{const t=$('#toast');t.textContent=s;t.classList.add('visible');clearTimeout(showToast.id);showToast.id=setTimeout(()=>t.classList.remove('visible'),3400)};
async function api(path,options={}){const resp=await fetch(path,{...options,headers:{'Content-Type':'application/json',...(options.headers||{})}});const data=await resp.json().catch(()=>({}));if(!resp.ok)throw Error(data.error||'Servicio no disponible');return data}
const PAYMENT_INFO={
  yape:{title:'Yape Bolivia',kicker:'QR NACIONAL',text:'Escanea este QR desde Yape y realiza el pago del importe indicado para tu pedido. Luego coordina la entrega por WhatsApp Business.',image:'assets/payments/yape.png'},
  union:{title:'Banco Unión',kicker:'QR NACIONAL',text:'Este QR fue preparado con monto abierto (Bs 0). El cliente debe ingresar el importe de la tarjeta y conservar el comprobante.',image:'assets/payments/bancounion.png'},
  takenos:{title:'Takenos',kicker:'PAGO FLEXIBLE',text:'QR de Takenos con monto abierto para una alternativa adicional de cobro. Después del pago se verifica manualmente.',image:'assets/payments/takenos.png'}
};
// Con servidor propio (INICIAR_TIENDA.sh en tu computadora) se usan catálogo y pedidos del servidor.
// Publicada en internet (Cloudflare, Netlify…) no hay servidor: catálogo incluido y pedidos por WhatsApp, sin errores.
const HAS_SERVER=['localhost','127.0.0.1'].includes(location.hostname);
async function boot(){if(HAS_SERVER){try{const r=await api('/api/catalog');state.products=r.products;state.whatsapp=r.whatsapp||''}catch{state.products=window.SCALA_CATALOG||[];}}else state.products=window.SCALA_CATALOG||[];state.cart=state.cart.filter(x=>x&&typeof x==='object'&&state.products.some(p=>p.id===x.id));paintFilters();paintProducts();paintCart();}
// El catálogo muestra las tarjetas que NO están en "Tarjetas animadas" (las 20 de arriba), así no se repiten.
const isLive20=p=>p.id>=2001&&p.id<=2020;
const CATEGORY_ORDER=['Cristianas','Familia','Infantiles','Amistad','Románticas','Gratitud','Elegantes','Empresas','Año Nuevo','Invierno','Ministerios','Gamer'];
const catalogProducts=()=>state.products.filter(p=>!isLive20(p));
const inCategory=(p,c)=>c==='Todas'||(c==='Con movimiento'?['video','gif','interactiva'].includes(p.format):p.category===c);
// Categorías con su cantidad, en un orden fácil de leer (solo las que tienen tarjetas)
function categories(){
 const list=catalogProducts(),rank=n=>{const i=CATEGORY_ORDER.indexOf(n);return i<0?99:i};
 const names=[...new Set(list.map(p=>p.category))].filter(n=>n!=='Animadas').sort((a,b)=>rank(a)-rank(b)||a.localeCompare(b,'es'));
 return ['Todas',...names,'Con movimiento'].map(c=>({c,n:list.filter(p=>inCategory(p,c)).length})).filter(x=>x.n>0);
}
function selected(){let list=catalogProducts().filter(p=>{const category=inCategory(p,state.category);const s=[p.name,p.category,p.headline||'',p.sub||''].join(' ').toLowerCase();return category&&s.includes(state.search.toLowerCase())});if(state.sort==='menor')list.sort((a,b)=>a.price-b.price);else if(state.sort==='mayor')list.sort((a,b)=>b.price-a.price);else if(state.sort==='nombre')list.sort((a,b)=>a.name.localeCompare(b.name,'es'));else {const picks=[151,153,152,155,154,115,116,1,2,3,4,5,6,7,8,9,10,11,12];const rank=p=>p.source==='upload'?-2000:(p.html_demo?.endsWith('.html')&&p.format==='interactiva'?-1000+(Number(p.id)||0)-2001:(picks.includes(p.id)?picks.indexOf(p.id):200+p.id));list.sort((a,b)=>rank(a)-rank(b));}return list}
function paintFilters(){$('#filterTabs').innerHTML=categories().map(({c,n})=>`<button type="button" data-filter="${esc(c)}" class="${state.category===c?'active':''}" aria-pressed="${String(state.category===c)}">${c==='Con movimiento'?ico('play'):''}${esc(c)} <span class="count">${n}</span></button>`).join('');$$('[data-filter]').forEach(btn=>btn.onclick=()=>{state.category=btn.dataset.filter;state.shown=12;paintFilters();paintProducts()})}
function mediaURL(p){return p.preview||`assets/previews/${String(p.id).padStart(3,'0')}.webp`}
/* SCALA Aurora restaurada: arte original por capas, movimiento en catálogo. */
const SCALA_LIVE_LAYERS={"aldea_regalo":{"base":{"src":"gamer20/animados/aldea_regalo_base.webp","style":""},"arm":{"src":"gamer20/animados/aldea_regalo_arm.png","style":"left:24.30939%;top:41.43646%;width:15.56169%;height:13.19061%;--px:81.550%;--py:87.665%;--a:-7deg"},"blink":{"src":"gamer20/animados/aldea_regalo_blink.png","style":"left:41.80479%;top:49.86188%;width:17.58748%;height:7.87293%"}},"aventura_2":{"base":{"src":"gamer20/animados/aventura_2_base.webp","style":""},"arm":{"src":"gamer20/animados/aventura_2_arm.png","style":"left:17.03704%;top:45.00000%;width:22.96296%;height:24.02778%;--px:52.0%;--py:95.0%;--a:-14deg"},"blink":{"src":"gamer20/animados/aventura_2_blink.png","style":"left:30.92593%;top:51.94444%;width:19.07407%;height:8.47222%"}},"brisa_invierno":{"base":{"src":"gamer20/animados/brisa_invierno_base.webp","style":""},"arm":{"src":"gamer20/animados/brisa_invierno_arm.png","style":"left:17.96296%;top:48.47222%;width:25.00000%;height:20.97222%;--px:52.0%;--py:95.0%;--a:-10deg"},"blink":{"src":"gamer20/animados/brisa_invierno_blink.png","style":"left:42.03704%;top:50.97222%;width:19.07407%;height:10.00000%"}},"dulce_navidad":{"base":{"src":"gamer20/animados/dulce_navidad_base.webp","style":""},"arm":{"src":"gamer20/animados/dulce_navidad_arm.png","style":"left:70.00000%;top:54.02778%;width:17.96296%;height:19.02778%;--px:52.0%;--py:95.0%;--a:10deg"},"blink":{"src":"gamer20/animados/dulce_navidad_blink.png","style":"left:42.59259%;top:49.02778%;width:17.96296%;height:9.02778%"}},"feliz_navidad_aldea":{"base":{"src":"gamer20/animados/feliz_navidad_aldea_base.webp","style":""},"arm":{"src":"gamer20/animados/feliz_navidad_aldea_arm.png","style":"left:22.28361%;top:38.46685%;width:18.50829%;height:16.16022%;--px:84.915%;--py:89.932%;--a:-9deg"},"blink":{"src":"gamer20/animados/feliz_navidad_aldea_blink.png","style":"left:39.31860%;top:39.22652%;width:13.53591%;height:7.59669%"}},"feliz_navidad_aldea2":{"base":{"src":"gamer20/animados/feliz_navidad_aldea2_base.webp","style":""},"arm":{"src":"gamer20/animados/feliz_navidad_aldea2_arm.png","style":"left:18.23204%;top:37.43094%;width:23.57274%;height:19.19890%;--px:88.102%;--py:81.094%;--a:13deg"},"blink":{"src":"gamer20/animados/feliz_navidad_aldea2_blink.png","style":"left:39.13444%;top:40.60773%;width:13.53591%;height:5.87017%"}},"feliz_navidad_nieve":{"base":{"src":"gamer20/animados/feliz_navidad_nieve_base.webp","style":""},"arm":{"src":"gamer20/animados/feliz_navidad_nieve_arm.png","style":"left:69.07407%;top:45.55556%;width:17.03704%;height:18.05556%;--px:52.0%;--py:95.0%;--a:14deg"},"blink":{"src":"gamer20/animados/feliz_navidad_nieve_blink.png","style":"left:41.48148%;top:42.50000%;width:15.92593%;height:10.00000%"}},"feliz_navidad_pueblo":{"base":{"src":"gamer20/animados/feliz_navidad_pueblo_base.webp","style":""},"arm":{"src":"gamer20/animados/feliz_navidad_pueblo_arm.png","style":"left:22.28361%;top:40.46961%;width:19.52118%;height:18.16298%;--px:75.387%;--py:91.011%;--a:14deg"},"blink":{"src":"gamer20/animados/feliz_navidad_pueblo_blink.png","style":"left:43.46225%;top:44.88950%;width:14.18048%;height:7.32044%"}},"gamer":{"base":{"src":"gamer20/animados/gamer_base.webp","style":""},"arm":{"src":"gamer20/animados/gamer_arm.png","style":"left:58.28729%;top:37.43094%;width:20.53407%;height:20.16575%;--px:13.211%;--py:92.082%;--a:-9deg"},"blink":{"src":"gamer20/animados/gamer_blink.png","style":"left:42.35727%;top:41.22928%;width:15.56169%;height:7.59669%"}},"jengibre":{"base":{"src":"gamer20/animados/jengibre_base.webp","style":""},"arm":{"src":"gamer20/animados/jengibre_arm.png","style":"left:26.24309%;top:42.47238%;width:15.56169%;height:14.15746%;--px:94.828%;--py:67.298%;--a:12deg"},"blink":{"src":"gamer20/animados/jengibre_blink.png","style":"left:39.96317%;top:42.40331%;width:15.10129%;height:7.25138%"}},"magia_traviesa":{"base":{"src":"gamer20/animados/magia_traviesa_base.webp","style":""},"arm":{"src":"gamer20/animados/magia_traviesa_arm.png","style":"left:68.51852%;top:50.55556%;width:19.07407%;height:20.00000%;--px:52.0%;--py:95.0%;--a:-12deg"},"blink":{"src":"gamer20/animados/magia_traviesa_blink.png","style":"left:39.07407%;top:50.00000%;width:19.07407%;height:9.02778%"}},"muneco":{"base":{"src":"gamer20/animados/muneco_base.webp","style":""},"arm":{"src":"gamer20/animados/muneco_arm.png","style":"left:63.18359%;top:43.48958%;width:18.65234%;height:19.07552%;--px:20.461%;--py:81.311%;--a:14deg"},"blink":{"src":"gamer20/animados/muneco_blink.png","style":"left:39.94141%;top:43.03385%;width:19.62891%;height:8.00781%"}},"navidad_dorada":{"base":{"src":"gamer20/animados/navidad_dorada_base.webp","style":""},"arm":{"src":"gamer20/animados/navidad_dorada_arm.png","style":"left:47.23757%;top:37.43094%;width:17.58748%;height:17.19613%;--px:10.021%;--py:84.723%;--a:-8deg"},"blink":{"src":"gamer20/animados/navidad_dorada_blink.png","style":"left:34.16206%;top:37.91436%;width:11.78637%;height:5.52486%"}},"navidad_gigante":{"base":{"src":"gamer20/animados/navidad_gigante_base.webp","style":""},"arm":{"src":"gamer20/animados/navidad_gigante_arm.png","style":"left:70.00000%;top:39.02778%;width:20.92593%;height:25.00000%;--px:52.0%;--py:95.0%;--a:15deg"},"blink":{"src":"gamer20/animados/navidad_gigante_blink.png","style":"left:43.51852%;top:42.50000%;width:17.96296%;height:9.02778%"}},"navidad_magica":{"base":{"src":"gamer20/animados/navidad_magica_base.webp","style":""},"arm":{"src":"gamer20/animados/navidad_magica_arm.png","style":"left:23.29650%;top:38.46685%;width:18.50829%;height:17.12707%;--px:79.443%;--py:96.532%;--a:12deg"},"blink":{"src":"gamer20/animados/navidad_magica_blink.png","style":"left:41.06814%;top:40.05525%;width:13.99632%;height:6.97514%"}},"navidad_nieve":{"base":{"src":"gamer20/animados/navidad_nieve_base.webp","style":""},"arm":{"src":"gamer20/animados/navidad_nieve_arm.png","style":"left:73.51852%;top:48.05556%;width:17.03704%;height:20.00000%;--px:52.0%;--py:95.0%;--a:-13deg"},"blink":{"src":"gamer20/animados/navidad_nieve_blink.png","style":"left:40.00000%;top:46.52778%;width:15.92593%;height:9.02778%"}},"noche_esperanza":{"base":{"src":"gamer20/animados/noche_esperanza_base.webp","style":""},"arm":{"src":"gamer20/animados/noche_esperanza_arm.png","style":"left:66.48148%;top:45.00000%;width:22.96296%;height:25.00000%;--px:52.0%;--py:95.0%;--a:11deg"},"blink":{"src":"gamer20/animados/noche_esperanza_blink.png","style":"left:39.44444%;top:50.00000%;width:19.07407%;height:9.02778%"}},"regalo_villa":{"base":{"src":"gamer20/animados/regalo_villa_base.webp","style":""},"arm":{"src":"gamer20/animados/regalo_villa_arm.png","style":"left:67.96296%;top:50.97222%;width:20.92593%;height:20.97222%;--px:52.0%;--py:95.0%;--a:12deg"},"blink":{"src":"gamer20/animados/regalo_villa_blink.png","style":"left:42.96296%;top:53.05556%;width:19.07407%;height:8.47222%"}},"reno":{"base":{"src":"gamer20/animados/reno_base.webp","style":""},"arm":{"src":"gamer20/animados/reno_arm.png","style":"left:26.24309%;top:41.43646%;width:16.57459%;height:18.16298%;--px:83.000%;--py:74.677%;--a:-8deg"},"blink":{"src":"gamer20/animados/reno_blink.png","style":"left:42.63352%;top:43.09392%;width:14.08840%;height:6.69890%"}},"reno_alegria":{"base":{"src":"gamer20/animados/reno_alegria_base.webp","style":""},"arm":{"src":"gamer20/animados/reno_alegria_arm.png","style":"left:23.51852%;top:47.50000%;width:20.00000%;height:20.00000%;--px:52.0%;--py:95.0%;--a:-11deg"},"blink":{"src":"gamer20/animados/reno_alegria_blink.png","style":"left:40.92593%;top:46.94444%;width:22.96296%;height:9.02778%"}}};
function liveThumbMarkup(p){
  const slug=String(p.html_demo||'').split('/').pop().replace(/\.html$/,'');
  const layers=SCALA_LIVE_LAYERS[slug];
  if(!layers)return `<img src="${esc(mediaURL(p))}" alt="Muestra de la tarjeta ${esc(p.name)}" loading="lazy">`;
  const one=(k)=>`<img class="scala-live-${k}" src="${esc(layers[k].src)}" style="${esc(layers[k].style)}" alt="" loading="lazy" draggable="false">`;
  return `<span class="scala-live-tile" aria-hidden="true">${one('base')}${one('arm')}${one('blink')}<span class="scala-live-snow"></span></span>`;
}
function syncEmbeddedEditor(){
  const p=state.current;
  if(!p?.html_demo?.endsWith('.html'))return;
  const frame=$('#modalArt iframe.scala-game-frame');
  if(!frame)return;
  // Mensaje a la tarjeta: funciona con servidor y también abriendo index.html directo desde la carpeta
  try{frame.contentWindow.postMessage({type:'scala-fill',recipient:$('#giftRecipient').value,greeting:$('#dedication').value,sender:$('#giftSender').value},'*')}catch{}
  let doc=null;try{doc=frame.contentDocument}catch{}
  if(!doc||frame.src.includes('estudio/'))return;
  for(const [host,inner] of [['giftRecipient','recipient'],['dedication','greeting'],['giftSender','sender']]){
    const el=doc.getElementById(inner);
    if(el){el.value=$('#'+host).value;el.dispatchEvent(new Event('input',{bubbles:true}));}
  }
}
function cardMarkup(p){const video=p.format==='video'||p.format==='gif';const interactive=p.format==='interactiva';const badge=video?'▶ Video':'';return `<article class="product-card ${interactive?'interactive-card':''}"><button class="product-card-media" type="button" data-view="${p.id}" aria-label="Ver ${esc(p.name)}">${badge?`<span class="product-badge video">${esc(badge)}</span>`:''}${interactive?liveThumbMarkup(p):`<img src="${esc(mediaURL(p))}" alt="Muestra de la tarjeta ${esc(p.name)}" loading="lazy">`}<span class="scala-watermark">SCALA ✳</span><span class="card-view">Ver y personalizar ↗</span></button><div class="product-info"><div><span class="category">${esc(p.category)}</span><h3>${esc(p.name)}</h3></div><strong>${formatCash(p.price)}</strong></div><p class="product-sub">${interactive?'Se mueve y tiene música':(video?'Video con movimiento':'Con tu dedicatoria')}</p><button type="button" class="product-link" data-view="${p.id}">Ver y personalizar ${ico('arrow')}</button></article>`}
function paintProducts(){const list=selected();$('#catalogCount').textContent=`${list.length} ${list.length===1?'tarjeta':'tarjetas'}`;$('#productGrid').innerHTML=list.slice(0,state.shown).map(cardMarkup).join('');$('#moreBtn').hidden=list.length<=state.shown;$('#emptyProducts').hidden=list.length!==0;$$('[data-view]').forEach(btn=>btn.addEventListener('click',()=>openProduct(Number(btn.dataset.view))))}
function renderCinematicDemo(p){
  const scene=document.createElement('div');scene.className='live-artwork';
  const pic=document.createElement('img');pic.src=mediaURL(p);pic.alt='Vista animada SCALA, '+p.name;scene.append(pic);
  const shimmer=document.createElement('div');shimmer.className='live-light';scene.append(shimmer);
  const snow=document.createElement('div');snow.className='live-snow';scene.append(snow);
  for(let i=0;i<26;i++){const fl=document.createElement('i');fl.style.setProperty('--x',((i*37)%97)+'%');fl.style.setProperty('--delay',(-i*.45)+'s');fl.style.setProperty('--dur',(8+i%8)+'s');snow.append(fl)}
  const badge=document.createElement('div');badge.className='live-art-badge';badge.textContent='SCALA ✳';scene.append(badge);
  const text=document.createElement('p');text.className='live-dedication';text.textContent=p.defaultText||'';scene.append(text);
  return scene
}
function openProduct(id){const p=state.products.find(x=>x.id===id);if(!p)return;state.current=p;$('#modalCategory').textContent=p.category||'Navidad';$('#modalTitle').textContent=p.name;$('#modalDesc').textContent=p.sub||'Personaliza tu detalle navideño con una dedicatoria especial.';$('#modalPrice').textContent=formatCash(p.price);$('#dedication').value=p.defaultText||'';$('#giftRecipient').value='Tu nombre aquí';$('#giftSender').value='Con cariño, tu familia';const liveCard=Boolean(p.html_demo?.endsWith('.html'));$('#liveEditorFields').hidden=!liveCard;$('#fullEditorLink').hidden=!liveCard;if(liveCard)$('#fullEditorLink').href='estudio/index.html?card='+encodeURIComponent(p.id);const media=$('#modalArt');media.replaceChildren();media.classList.toggle('html-preview',Boolean(p.html_demo?.endsWith('.html')||p.format==='interactiva'));let node;if(liveCard){const frame=document.createElement('iframe');frame.src=(p.id>=2001&&p.id<=2020)?'estudio/index.html?card='+p.id+'&vista=tarjeta':p.html_demo;frame.title='Tarjeta animada '+p.name;frame.loading='eager';frame.allow='autoplay';frame.className='scala-game-frame';frame.setAttribute('sandbox','allow-scripts allow-same-origin allow-downloads');media.append(frame);frame.addEventListener('load',syncEmbeddedEditor);const label=document.createElement('p');label.className='scala-embedded-note';label.textContent='🎁 Toca el regalo para abrirlo: suena «Noche de Paz» y cae la nieve. Lo que escribas a la derecha aparece en la tarjeta.';media.append(label)}else if(p.format==='interactiva'){media.append(renderCinematicDemo(p))}else if((p.format==='video' ||p.format==='gif')&&p.video_preview){node=document.createElement('video');node.src=p.video_preview;node.controls=true;node.playsInline=true;node.poster=mediaURL(p);media.append(node)}else{node=document.createElement('img');node.src=mediaURL(p);node.alt='Muestra protegida de '+p.name;media.append(node)}$('#productOverlay').hidden=false;document.body.style.overflow='hidden'}
$('#dedication').addEventListener('input',()=>{const p=$('#modalArt .live-dedication');if(p)p.textContent=$('#dedication').value.trim()||'¡Feliz Navidad!';syncEmbeddedEditor()});['giftRecipient','giftSender'].forEach(id=>$('#'+id).addEventListener('input',syncEmbeddedEditor));
function close(id){const el=$(id);if(el){el.hidden=true;if(id==='#productOverlay'){const frame=el.querySelector('iframe.scala-game-frame');if(frame)frame.src='about:blank';}}if($$('.overlay:not([hidden])').length===0)document.body.style.overflow=''}
function openPayment(key){const p=PAYMENT_INFO[key];if(!p)return;state.payment=key;$('#paymentKicker').textContent=p.kicker;$('#paymentTitle').textContent=p.title;$('#paymentText').textContent=p.text;$('#paymentImage').src=p.image;$('#paymentImage').alt='QR de '+p.title;$('#paymentLink').hidden=true;$('#paymentOverlay').hidden=false;document.body.style.overflow='hidden'}
function addToCart(){const p=state.current;if(!p)return;const dedication=$('#dedication').value.trim().slice(0,125);const message=p.html_demo?.endsWith('.html')?`Para: ${$('#giftRecipient').value.trim().slice(0,32)} | Mensaje: ${dedication} | De: ${$('#giftSender').value.trim().slice(0,32)}`.slice(0,250):dedication;state.cart.push({id:p.id,message});saveCart();paintCart();close('#productOverlay');showToast('Tarjeta añadida a tus regalos');}
function paintCart(){const list=state.cart;$('#cartCount').textContent=list.length;$('#drawerCount').textContent='('+list.length+')';$('#cartTotal').textContent=formatCash(list.reduce((sum,x)=>sum+(state.products.find(p=>p.id===x.id)?.price||0),0));$('#cartItems').innerHTML=list.length?list.map((x,i)=>{const p=state.products.find(y=>y.id===x.id);if(!p)return '';return `<div class="cart-line"><img src="${esc(mediaURL(p))}" alt="Muestra"><div class="cart-line-copy"><strong>${esc(p.name)}</strong><small>${esc(x.message||'Sin dedicatoria')}</small><span>${formatCash(p.price)}</span><button data-del="${i}" type="button">Quitar tarjeta</button></div></div>`}).join(''):`<div class="empty-cart">Tu canasta está vacía.<br>Encuentra algo especial para regalar.</div>`;$$('[data-del]').forEach(b=>b.onclick=()=>{state.cart.splice(Number(b.dataset.del),1);saveCart();paintCart()})}
function summary(){return `SOLICITUD SCALA NAVIDAD\n${state.cart.map((x,i)=>{const p=state.products.find(y=>y.id===x.id);return `${i+1}. ${p?.name||'Tarjeta'} · ${formatCash(p?.price)}\nDedicatoria: ${x.message||'(ninguna)'}`}).join('\n\n')}\n\nTOTAL ESTIMADO: ${$('#cartTotal').textContent}\nEl pago se coordina por QR o enlace con el vendedor y luego se habilita la entrega del archivo.`}
async function copy(str){try{await navigator.clipboard.writeText(str);showToast('Copiado al portapapeles')}catch{const t=document.createElement('textarea');t.value=str;document.body.append(t);t.select();document.execCommand('copy');t.remove();showToast('Copiado')}}
async function submitOrder(){const name=$('#buyerName').value.trim(),contact=$('#buyerContact').value.trim();if(!state.cart.length)return showToast('Elige una tarjeta antes de solicitar el pedido');if(name.length<2||contact.length<6)return showToast('Completa tu nombre y WhatsApp de contacto');if(!HAS_SERVER)return orderByWhatsapp(name,contact);$('#submitOrder').disabled=true;try{const r=await api('/api/orders',{method:'POST',body:JSON.stringify({name,contact,items:state.cart})});state.orderRef=r.order;state.cart=[];saveCart();paintCart();$('#orderInfo').textContent=`Código de pedido: ${r.order}. El vendedor verificará el pago y preparará los archivos. Conserva tu código para consultar la entrega.`;const orderPhone=state.whatsapp||'59164926872';$('#orderWhatsapp').hidden=!orderPhone;if(orderPhone)$('#orderWhatsapp').href=`https://wa.me/${orderPhone}?text=${encodeURIComponent('Hola, hice un pedido SCALA Navidad. Mi código es '+r.order+'. ¿Cómo coordino el pago?')}`;close('#cartOverlay');$('#orderOverlay').hidden=false;document.body.style.overflow='hidden'}catch(e){orderByWhatsapp(name,contact)}finally{$('#submitOrder').disabled=false}}
// Sin servidor (por ejemplo, publicada en tu dominio): el pedido se envía completo por WhatsApp.
function orderByWhatsapp(name,contact){
 const ref='SCALA-'+Date.now().toString(36).toUpperCase().slice(-6);
 const phone=state.whatsapp||'59164926872';
 const text=`Hola SCALA, quiero hacer este pedido 🎄\nCódigo: ${ref}\nNombre: ${name}\nMi WhatsApp: ${contact}\n\n${summary()}`;
 state.orderRef=ref;
 $('#orderTitle').textContent='¡Ya casi! Envíanos tu pedido';
 $('#orderInfo').textContent=`Tu código es ${ref}. Toca «Enviar por WhatsApp» para mandarnos el pedido con tu dedicatoria. Te responderemos con los datos de pago.`;
 const link=$('#orderWhatsapp');link.hidden=false;link.textContent='Enviar por WhatsApp';link.href=`https://wa.me/${phone}?text=${encodeURIComponent(text)}`;
 close('#cartOverlay');$('#orderOverlay').hidden=false;document.body.style.overflow='hidden';
}
$('#menuToggle').onclick=()=>{const n=$('#mobileNav');n.hidden=!n.hidden;$('#menuToggle').setAttribute('aria-expanded',String(!n.hidden))};$$('.mobile-nav a').forEach(a=>a.onclick=()=>$('#mobileNav').hidden=true);
$('#searchInput').oninput=e=>{state.search=e.target.value;state.shown=12;paintProducts()};$('#sortSelect').onchange=e=>{state.sort=e.target.value;paintProducts()};$('#moreBtn').onclick=()=>{state.shown+=12;paintProducts()};$$('[data-collection]').forEach(btn=>btn.onclick=()=>{state.category=btn.dataset.collection;state.shown=12;paintFilters();paintProducts();$('#tienda').scrollIntoView({behavior:'smooth'})});
$$('[data-go-category]').forEach(btn=>btn.onclick=()=>{state.category=btn.dataset.goCategory;state.shown=12;paintFilters();paintProducts();$$('.occasion-btn').forEach(b=>b.classList.toggle('active',b.dataset.goCategory===state.category));$('#tienda').scrollIntoView({behavior:'smooth'})});
$('#openCart').onclick=()=>{$('#cartOverlay').hidden=false;document.body.style.overflow='hidden'};$('#closeCart').onclick=()=>close('#cartOverlay');$('#closeProduct').onclick=()=>close('#productOverlay');$('#closeOrder').onclick=()=>close('#orderOverlay');$('#closePayment').onclick=()=>close('#paymentOverlay');$('#addToCart').onclick=addToCart;$('#copyCart').onclick=()=>copy(summary());$('#submitOrder').onclick=submitOrder;$('#copyOrderRef').onclick=()=>copy(state.orderRef||'');$$('[data-html-product]').forEach(btn=>btn.onclick=()=>openProduct(Number(btn.dataset.htmlProduct)));$$('[data-pay]').forEach(btn=>btn.onclick=()=>openPayment(btn.dataset.pay));$$('.overlay').forEach(el=>el.onclick=e=>{if(e.target===el)close('#'+el.id)});document.onkeydown=e=>{if(e.key==='Escape')$$('.overlay:not([hidden])').forEach(el=>close('#'+el.id))};
const env=$('#envelope'),msg=$('#demoMessage');const updateMsg=()=>$('#letterMessage').textContent=msg.value.trim()||'¡Feliz Navidad!';if(env&&msg){msg.oninput=updateMsg;$('#openEnvelope').onclick=()=>{env.classList.toggle('open');const open=env.classList.contains('open');$('#openEnvelope').innerHTML=(open?'Cerrar el sobre ':'Abrir el sobre ')+ico(open?'mail':'gift');$('#openEnvelope').setAttribute('aria-expanded',String(open));updateMsg()}};
const heroSnow=$('#heroSnow');if(heroSnow&&!matchMedia('(prefers-reduced-motion: reduce)').matches){const snow=heroSnow;for(let i=0;i<52;i++){const d=document.createElement('i');d.className='snowflake';d.style.setProperty('--x',Math.random()*100+'%');d.style.setProperty('--dur',(12+Math.random()*20)+'s');d.style.setProperty('--delay',(-Math.random()*35)+'s');d.style.setProperty('--drift',(-20+Math.random()*45)+'px');d.style.setProperty('--op',(.22+Math.random()*.55).toFixed(2));snow.append(d)}}
boot();

// 20 tarjetas Gamer: abrir en visor de la TIENDA, no en pestañas ni enlaces externos.
document.addEventListener('click',event=>{const btn=event.target.closest('[data-g20-view]');if(!btn)return;const id=Number(btn.dataset.g20View);if(id>=2001&&id<=2020)openProduct(id)});

// SCALA V9: el estudio maestro original, integrado sin reemplazar la tienda ni sus pagos.
function studioUrl(){
 const p=state.current,params=new URLSearchParams();
 params.set('card',String(p?.id||2001));
 params.set('recipient',document.getElementById('giftRecipient').value||'Tu nombre aquí');
 params.set('greeting',document.getElementById('dedication').value||'Feliz Navidad');
 params.set('sender',document.getElementById('giftSender').value||'Con cariño');
 return 'estudio/index.html?'+params.toString();
}
function openScalaStudio(event){
 if(event)event.preventDefault();
 if(!state.current?.html_demo?.endsWith('.html'))return;
 const studio=document.getElementById('scalaStudioOverlay');
 studioValues=null;
 document.getElementById('scalaStudioFrame').src=studioUrl();studio.hidden=false;
 document.body.style.overflow='hidden';
}
let studioValues=null; // lo último que escribió el estudio (llega por mensaje)
function saveStudioText(){
 try{
  const v=studioValues||{};
  for(const [a,b] of [['recipient','giftRecipient'],['greeting','dedication'],['sender','giftSender']]){
   const dest=document.getElementById(b);
   if(typeof v[a]==='string'&&dest){dest.value=v[a];dest.dispatchEvent(new Event('input',{bubbles:true}));}
  }
  showToast('Dedicatoria guardada en tu pedido. Puedes añadir la tarjeta al carrito.');
 }catch(e){showToast('No se pudo leer el editor; conserva tus datos antes de cerrar.');}
 closeScalaStudio();
}
function closeScalaStudio(){
 const studio=document.getElementById('scalaStudioOverlay');
 studio.hidden=true;document.getElementById('scalaStudioFrame').src='about:blank';
 document.body.style.overflow=state.current&&!document.getElementById('productOverlay').hidden?'hidden':'';
}
const scalaStudioOpen=document.getElementById('fullEditorLink');
scalaStudioOpen.addEventListener('click',openScalaStudio);
document.getElementById('scalaStudioClose').addEventListener('click',closeScalaStudio);
document.getElementById('scalaStudioSave').addEventListener('click',saveStudioText);
// Guardar la dedicatoria como un pedido normal; los pagos no se adelantan ni se confirman aquí.

window.addEventListener('message',event=>{
 const studioFrame=document.getElementById('scalaStudioFrame');
 if(event.source!==studioFrame.contentWindow)return; // solo escuchamos a nuestro estudio
 if(event.data?.type==='scala-studio-close')closeScalaStudio();
 if(event.data?.type==='scala-values')studioValues=event.data;
});
