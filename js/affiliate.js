(function(){
const API = "https://www.api.shivmarg.live/affiliate";

// ── INJECT STYLES ──
const style = document.createElement("style");
style.textContent = `
.sm-affiliate{margin:24px 0}
.sm-aff-title{font-size:1.1rem;font-weight:600;color:#8B2500;margin-bottom:12px;font-family:'Cinzel',serif}
.sm-aff-row{display:flex;gap:14px;overflow-x:auto;padding:4px 2px 10px;scrollbar-width:thin}
.sm-aff-row::-webkit-scrollbar{height:6px}
.sm-aff-row::-webkit-scrollbar-thumb{background:#D9A441;border-radius:10px}

.sm-aff-card{
  flex:0 0 auto;width:150px;background:#FFF8EC;border:1px solid #EAD9B5;
  border-radius:12px;padding:10px;cursor:pointer;text-align:center;
  transition:transform .18s ease, box-shadow .18s ease;
}
.sm-aff-card:hover{transform:translateY(-3px);box-shadow:0 6px 16px rgba(139,37,0,0.12);border-color:#D9A441}
.sm-aff-card img{width:100%;height:110px;object-fit:contain;border-radius:8px;background:#fff;margin-bottom:8px}
.sm-aff-card p{font-size:0.8rem;color:#4A2E14;line-height:1.3;
  display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden}

.sm-aff-modal{
  position:fixed;inset:0;background:rgba(0,0,0,0.55);
  display:flex;align-items:center;justify-content:center;z-index:9999;padding:16px;
}
.sm-aff-box{
  position:relative;background:#FFF8EC;border:1px solid #EAD9B5;border-radius:16px;
  width:280px;max-width:90vw;padding:22px 18px;text-align:center;
  box-shadow:0 12px 40px rgba(0,0,0,0.25);
}
.sm-aff-box img{width:100%;max-height:180px;object-fit:contain;border-radius:10px;background:#fff;margin-bottom:12px}
.sm-aff-box h3{font-size:1rem;color:#8B2500;margin-bottom:6px;font-family:'Cinzel',serif}
.sm-aff-box p{font-size:0.9rem;color:#4A2E14;margin-bottom:14px;font-weight:600}
.sm-aff-close{position:absolute;top:10px;right:14px;font-size:22px;line-height:1;color:#8B2500;cursor:pointer}
.sm-aff-buy{
  width:100%;padding:10px;background:linear-gradient(135deg,#D9A441,#B9822A);
  color:#fff;border:none;border-radius:8px;font-size:0.85rem;font-weight:600;cursor:pointer;
  transition:opacity .2s;
}
.sm-aff-buy:hover{opacity:0.9}
@media(max-width:480px){.sm-aff-card{width:120px}.sm-aff-card img{height:90px}}
`;
document.head.appendChild(style);

// ── CORE LOGIC ──
async function track(pid){
  const u = localStorage.getItem("sm_user")||"";
  const r = await fetch(`${API}/click/${pid}`, {method:"POST", headers:{"x-sm-user":u}});
  return (await r.json()).link;
}

function modal(p){
  const m = document.createElement("div");
  m.className = "sm-aff-modal";
  m.innerHTML = `<div class="sm-aff-box"><span class="sm-aff-close">&times;</span>
    <img src="${p.image}"><h3>${p.name}</h3><p>${p.price||""}</p>
    <button class="sm-aff-buy">Buy on Amazon</button></div>`;
  document.body.appendChild(m);
  m.onclick = e => { if(e.target===m) m.remove(); };
  m.querySelector(".sm-aff-close").onclick = () => m.remove();
  m.querySelector(".sm-aff-buy").onclick = async () => {
    window.open((await track(p.id)) || p.link, "_blank");
    m.remove();
  };
}

async function render(el){
  const cat = el.dataset.category, title = el.dataset.title || "";
  const items = await (await fetch(`${API}/products?category=${cat}`)).json();
  if(!items.length) return;
  el.innerHTML = `${title?`<h4 class="sm-aff-title">${title}</h4>`:""}
    <div class="sm-aff-row">${items.map(p=>`<div class="sm-aff-card" data-id="${p.id}">
      <img src="${p.image}"><p>${p.name}</p></div>`).join("")}</div>`;
  el.querySelectorAll(".sm-aff-card").forEach(c=>{
    c.onclick = () => modal(items.find(i=>i.id===c.dataset.id));
  });
}

window.SmAffiliate = { render, init: ()=>document.querySelectorAll(".sm-affiliate").forEach(render) };
document.addEventListener("DOMContentLoaded", window.SmAffiliate.init);
})();

{/* <div class="sm-affiliate" data-category="puja_samagri" data-title="Puja Essentials"></div> */}