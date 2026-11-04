const favs = new Set(JSON.parse(localStorage.getItem("korascope-favs") || "[]"));
const $ = s => document.querySelector(s);

let globalMatches = []; // لتخزين المباريات الحية المسترجعة

// دالة لتصميم بطاقة المباراة بناءً على بيانات الـ API
function card(m) {
  const matchId = m.id.toString();
  const isFav = favs.has(matchId);
  const leagueName = m.competition ? m.competition.name : 'بطولة كرة القدم';
  const homeTeam = m.homeTeam ? m.homeTeam.name : 'المضيف';
  const awayTeam = m.awayTeam ? m.awayTeam.name : 'الضيف';
  const matchTime = new Date(m.utcDate).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  const homeScore = m.score && m.score.fullTime.home !== null ? m.score.fullTime.home : '-';
  const awayScore = m.score && m.score.fullTime.away !== null ? m.score.fullTime.away : '-';
  const status = m.status === 'TIMED' ? matchTime : (m.status === 'IN_PLAY' ? 'جارية الآن' : m.status);

  return `
    <article class="match-card">
      <div class="match-meta">
        <span>${leagueName}</span>
        <span>${status}</span>
      </div>
      <div class="teams">
        <div class="team"><span class="crest">⚽</span>${homeTeam}</div>
        <div class="score">${homeScore} : ${awayScore}<small>${matchTime}</small></div>
        <div class="team"><span class="crest">⚽</span>${awayTeam}</div>
      </div>
      <div class="card-foot">
        <span>بيانات حية من KoraScope</span>
        <button class="fav" data-fav="${matchId}" aria-label="إضافة للمفضلة">${isFav ? "★" : "☆"}</button>
      </div>
    </article>
  `;
}

// دالة العرض العامة وتحديث الواجهات والتبويبات
function renderAll() {
  if (!globalMatches.length) {
    $("#homeMatches").innerHTML = '<div class="notice" style="text-align:center; padding:20px; color:#aaa;">جاري جلب المباريات الحية...</div>';
    $("#allMatches").innerHTML = '<div class="notice" style="text-align:center; padding:20px; color:#aaa;">جاري جلب المباريات الحية...</div>';
    $("#favoriteMatches").innerHTML = '<div class="notice">لم تضف أي مباراة للمفضلة بعد. اضغط ☆ على أي مباراة لحفظها هنا.</div>';
    return;
  }

  $("#homeMatches").innerHTML = globalMatches.slice(0, 3).map(card).join("");
  $("#allMatches").innerHTML = globalMatches.map(card).join("");
  
  const favList = globalMatches.filter(m => favs.has(m.id.toString()));
  $("#favoriteMatches").innerHTML = favList.length ? favList.map(card).join('') : '<div class="notice">لم تضف أي مباراة للمفضلة بعد. اضغط ☆ على أي مباراة لحفظها هنا.</div>';
}

function toast(msg) {
  const t = $("#toast");
  if (!t) return;
  t.textContent = msg;
  t.classList.add("show");
  setTimeout(() => t.classList.remove("show"), 2200);
}

function openTab(id) {
  document.querySelectorAll(".tab").forEach(b => b.classList.toggle("active", b.dataset.tab === id));
  document.querySelectorAll(".view").forEach(v => v.classList.toggle("active", v.id === id));
}

// التفاعل مع النقرات (التبويبات والمفضلة)
document.addEventListener("click", e => {
  const tab = e.target.closest("[data-tab]");
  if (tab) openTab(tab.dataset.tab);
  const go = e.target.closest("[data-go]");
  if (go) openTab(go.dataset.go);
  const fav = e.target.closest("[data-fav]");
  if (fav) {
    const id = fav.dataset.fav;
    favs.has(id) ? favs.delete(id) : favs.add(id);
    localStorage.setItem("korascope-favs", JSON.stringify([...favs]));
    renderAll();
    toast(favs.has(id) ? "أضيفت إلى المفضلة" : "أزيلت من المفضلة");
  }
});

const notifyBtn = $("#notifyBtn");
if (notifyBtn) {
  notifyBtn.addEventListener("click", () => toast("سنضيف تنبيهات المباريات في تحديث لاحق"));
}

// دالة جلب المباريات الحية من الـ API
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
      globalMatches = data.matches;
      renderAll(); // تحديث الشاشة فور وصول البيانات الحية
    }
  } catch (error) {
    console.error('حدث خطأ أثناء جلب المباريات:', error);
    $("#homeMatches").innerHTML = '<div class="notice" style="text-align:center; padding:20px; color:#ef4444;">فشل جلب المباريات الحية، تحقق من الاتصال.</div>';
  }
}

// تشغيل العرض المبدئي ثم جلب البيانات
renderAll();
fetchLiveMatches();

// تفعيل الـ Service Worker
if ("serviceWorker" in navigator && location.protocol.startsWith("http")) {
  window.addEventListener("load", () => navigator.serviceWorker.register("./sw.js").catch(() => {}));
}
  
