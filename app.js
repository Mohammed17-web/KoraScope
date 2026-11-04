async function fetchLiveMatches() {
  try {
    // استخدام بروكسي وسيط لتجاوز قيود الـ CORS في المتصفح
    const proxyUrl = 'https://api.allorigins.win/raw?url=';
    const targetUrl = encodeURIComponent('https://api.football-data.org/v4/matches');
    
    const res = await fetch(proxyUrl + targetUrl, {
      headers: {
        'X-Auth-Token': '8eac746134d14abd9ad2fb3aeb996a65'
      }
    });
    const data = await res.json();
    console.log("المباريات المسترجعة بنجاح:", data.matches);
    if (data.matches) {
      globalMatches = data.matches;
      renderAll(); 
    }
  } catch (error) {
    console.error('حدث خطأ أثناء جلب المباريات:', error);
    $("#homeMatches").innerHTML = '<div class="notice" style="text-align:center; padding:20px; color:#ef4444;">تعذر الاتصال بالخادم، يجری التحقق.</div>';
  }
}
