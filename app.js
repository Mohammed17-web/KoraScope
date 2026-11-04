const sampleMatches = [
 {id:"m1",league:"دوري أبطال أوروبا",time:"20:00",home:"ريال مدريد",away:"مانشستر سيتي",h:"⚪",a:"🔵",score:"— : —",state:"موعد توضيحي"},
 {id:"m2",league:"الدوري الإسباني",time:"22:00",home:"برشلونة",away:"أتلتيكو مدريد",h:"🔴🔵",a:"🔴⚪",score:"— : —",state:"موعد توضيحي"},
 {id:"m3",league:"الدوري الإنجليزي",time:"18:30",home:"ليفربول",away:"أرسنال",h:"🔴",a:"🔴",score:"— : —",state:"موعد توضيحي"}
];
const favs = new Set(JSON.parse(localStorage.getItem("korascope-favs")||"[]"));
const $ = s => document.querySelector(s);
function card(m){return `<article class="match-card"><div class="match-meta"><span>${m.league}</span><span>${m.state}</span></div><div class="teams"><div class="team"><span class="crest">${m.h}</span>${m.home}</div><div class="score">${m.score}<small>${m.time}</small></div><div class="team"><span class="crest">${m.a}</span>${m.away}</div></div><div class="card-foot"><span>بيانات تجريبية وليست جدولاً مؤكداً</span><button class="fav" data-fav="${m.id}" aria-label="إضافة للمفضلة">${favs.has(m.id)?"★":"☆"}</button></div></article>`}
function render(){ $("#homeMatches").innerHTML=sampleMatches.slice(0,2).map(card).join(""); $("#allMatches").innerHTML=sampleMatches.map(card).join(""); const list=sampleMatches.filter(m=>favs.has(m.id)); $("#favoriteMatches").innerHTML=list.length?list.map(card).join():'<div class="notice">لم تضف أي مباراة للمفضلة بعد. اضغط ☆ على أي مباراة لحفظها هنا.</div>'; }
function toast(msg){const t=$("#toast");t.textContent=msg;t.classList.add("show");setTimeout(()=>t.classList.remove("show"),2200)}
function openTab(id){document.querySelectorAll(".tab").forEach(b=>b.classList.toggle("active",b.dataset.tab===id));document.querySelectorAll(".view").forEach(v=>v.classList.toggle("active",v.id===id));}
document.addEventListener("click",e=>{const tab=e.target.closest("[data-tab]");if(tab)openTab(tab.dataset.tab);const go=e.target.closest("[data-go]");if(go)openTab(go.dataset.go);const fav=e.target.closest("[data-fav]");if(fav){const id=fav.dataset.fav;favs.has(id)?favs.delete(id):favs.add(id);localStorage.setItem("korascope-favs",JSON.stringify([...favs]));render();toast(favs.has(id)?"أضيفت إلى المفضلة":"أزيلت من المفضلة");}});
$("#notifyBtn").addEventListener("click",()=>toast("سنضيف تنبيهات المباريات في تحديث لاحق"));
render();
if("serviceWorker" in navigator && location.protocol.startsWith("http")){window.addEventListener("load",()=>navigator.serviceWorker.register("./sw.js").catch(()=>{}));}
async function fetchLiveMatches() {
  try {
    const response = "https://api.football-data.org/v4/matches";
    const res = await fetch(response, {
      headers: {
        'X-Auth-Token': '8eac746134d14abd9ad2fb3aeb996a65'
      }
    });
    const data = await res.json();
    console.log("المباريات المسترجعة بنجاح:", data.matches);
    if (data.matches) {
      renderApiMatches(data.matches);
    }
  } catch (error) {
    console.error('حدث خطأ أثناء جلب المباريات:', error);
  }
}

fetchLiveMatches();
 
