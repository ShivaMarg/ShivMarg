(function(){
const API = "https://api.shivmarg.live/affiliate";
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