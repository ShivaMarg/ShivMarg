import os
from pathlib import Path

base = Path(r"c:\Users\floot\OneDrive\Desktop\Shivmarg\kali-mantras")
base.mkdir(parents=True, exist_ok=True)

pages = [
    ("dakshina-kali-mantra", "दक्षिणा काली मंत्र", "Dakshina Kali Mantra", "दक्षिणा काली का शक्तिशाली मंत्र।", "Dakshina Kali Mantra", "ॐ ह्रीं क्रीं दक्षिणकाली वाच्यै नमः॥"),
    ("kali-chalisa", "काली चालीसा", "Kali Chalisa", "काली माँ को समर्पित ४० चौपाई।", "Kali Chalisa", "जय काली माता, त्रिनेत्रा काली, जय जय काली॥"),
    ("kali-kavacham", "काली कवचम्", "Kali Kavacham", "काली कवचम् — समस्त अंगों की रक्षा हेतु।", "Kali Kavacham", "कर्णे मे क्रीं क्रीं कालीश्चरणे मे क्लीं क्लिं कृति॥"),
    ("chamunda-stuti", "चामुंडा स्तुति", "Chamunda Stuti", "चामुंडा माँ की स्तुति और आराधना।", "Chamunda Stuti", "ऊँ ऐं ह्रीं क्लीं चामुण्डायै विच्चे॥"),
    ("kali-gayatri", "काली गायत्री", "Kali Gayatri", "काली गायत्री मंत्र — आंतरिक शक्ति जागृत करने वाला।", "Kali Gayatri", "ॐ काली गायत्री विद्महे कालरात्र्यै धीमहि। तन्नो काली प्रचोदयात्॥"),
    ("kali-108-names", "काली १०८ नाम", "Kali 108 Names", "काली माता के १०८ पावन नाम।", "Kali 108 Names", "काली के १०८ दिव्य नामों का संकलन।"),
    ("kali-sahasranama", "काली सहस्रनाम", "Kali Sahasranama", "काली सहस्रनाम — माँ के १००० नामों का स्तोत्र।", "Kali Sahasranama", "काली के हज़ार नामों का पद्य संग्रह।"),
    ("adya-stotram", "आद्य स्तोत्रम्", "Adya Stotram", "आद्य स्तोत्र — काली माँ के आद्य स्वरूप का स्तोत्र।", "Adya Stotram", "आद्यं मातरम् नमस्कृत्य ..."),
    ("kali-pratahsmarana", "काली प्रातःस्मरण", "Kali Pratah Smarana", "काली प्रातःस्मरण — प्रातः काल की याद।", "Kali Pratah Smarana", "प्रातः काली शरणं व्रजेत् ..."),
    ("dakshina-kali-kavach", "दक्षिणा काली कवच", "Dakshina Kali Kavach", "दक्षिणा काली कवच — रक्षात्मक मंत्र।", "Dakshina Kali Kavach", "दक्षिणासिन्धो ह्रीं क्लीं पातु मां।"),
    ("kali-khadgamala", "काली खड्गमाला", "Kali Khadgamala", "काली खड्गमाला — शक्तिशाली श्लोक श्रृंखला।", "Kali Khadgamala", "क्रीं क्ष्रीं स्वाहा ..."),
    ("navarna-mantra", "नवरात्रि मंत्र", "Navarna Mantra", "नवरात्रि मंत्र — देवी की आराधना का मंत्र।", "Navarna Mantra", "नरोत्तमाय विद्महे ..."),
    ("parashurama-kali-stotram", "परशुराम काली स्तोत्रम्", "Parashurama Kali Stotram", "परशुराम द्वारा रचित काली स्तोत्र।", "Parashurama Kali Stotram", "परशुराम की वाणी से काली की स्तुति।"),
    ("kali-puja-vidhi", "काली पूजा विधि", "Kali Puja Vidhi", "काली पूजा विधि — आराधना चरण।", "Kali Puja Vidhi", "काली पूजा के सरल चरण और मंत्र।"),
    ("brahma-krita-kali-stuti", "ब्रह्म-कृत काली स्तुति", "Brahma-Krita Kali Stuti", "ब्रह्म-कृत काली स्तुति — महाशक्ति की स्तुति।", "Brahma-Krita Kali Stuti", "ब्रह्मा द्वारा रचित काली स्तुति।"),
    ("guhya-kali-mantra", "गुह्य काली मंत्र", "Guhya Kali Mantra", "गुह्य काली मंत्र — रहस्यमयी साधना मंत्र।", "Guhya Kali Mantra", "गुह्य काली मंत्र का उच्चारण।"),
    ("smashanakali-stotra", "श्मशानकाली स्तोत्र", "SmashanaKali Stotra", "श्मशानकाली स्तोत्र — कालरात्रि का शक्तिशाली स्तोत्र।", "SmashanaKali Stotra", "श्मशानकाली की त्राता स्तुति।"),
    ("kali-mahastuti-ramakrishna", "काली महास्थुति — रामकृष्ण", "Kali Mahastuti Ramakrishna", "रामकृष्ण परमहंस की काली महास्थुति।", "Kali Mahastuti Ramakrishna", "रामकृष्ण की भक्ति से काली की महिमा।"),
    ("jaganmangala-kali-kavach", "जगन्मंगल काली कवच", "Jaganmangala Kali Kavach", "जगन्मंगल काली कवच — सर्वशक्तिमान रक्षा मंत्र।", "Jaganmangala Kali Kavach", "जगन्मंगल काली से रक्षा।"),
    ("kali-ekakshari-mantra", "काली एकाक्षरी मंत्र", "Kali Ekakshari Mantra", "काली एकाक्षरी मंत्र — सरल और प्रभावी मंत्र।", "Kali Ekakshari Mantra", "ॐ क्रीं क्रीं कालीपते नमः॥"),
    ("kali-mangal-aarti", "काली मंगल आरती", "Kali Mangal Aarti", "काली मंगल आरती — माँ की आरती गीत।", "Kali Mangal Aarti", "जय माँ काली, जय माँ काली ..."),
    ("kamakala-kali-stotram", "कामकला काली स्तोत्रम्", "Kamakala Kali Stotram", "कामकला काली स्तोत्र — काम-कला की स्तुति।", "Kamakala Kali Stotram", "कामकला काली का स्तोत्र।"),
    ("kali-namavali", "काली नामावली", "Kali Namavali", "काली नामावली — माँ के दिव्य नामों की सूची।", "Kali Namavali", "क्रीं क्रीं काली ..."),
]

common_js = '''


<!-- COMMENTS -->

<div id="sm-comments" data-page-id="{page_id}"></div>
<!-- FOOTER -->
<footer>
  <span class="foot-sym">🌺</span>
  <div class="foot-txt">॥ {title} ॥ ShivaMarg ॥ © ShivaMarg 2026 || ShivMarg.live</div>
   <div class="foot-links">
    <a href="/">Home</a>
    <a href="/about/">About</a>
    <a href="/contact/">Contact</a>
    <a href="/privacy-policy/">Privacy Policy</a>
    <a href="/disclaimer/">Disclaimer</a>
  </div>
</footer>

<!-- Audio Widget -->
<div class="audio-widget">
  <button id="playBtn" class="play-btn">▶</button>
  <div>
    <div class="audio-title">{audio_title}</div>
    <div class="audio-sub">Kali Mata • मंत्र</div>
  </div>
</div>
<div id="player" style="width:0;height:0;overflow:hidden;"></div>

<script>
  let player, isPlaying=false;
  function onYouTubeIframeAPIReady(){
    player=new YT.Player('player',{videoId:'dQw4w9WgXcQ',playerVars:{controls:0,modestbranding:1,rel:0}});
  }
  document.addEventListener('DOMContentLoaded',function(){
    const btn=document.getElementById('playBtn');
    btn.onclick=function(){
      if(!player) return;
      if(!isPlaying){player.playVideo();btn.innerHTML='⏸';isPlaying=true;}
      else{player.pauseVideo();btn.innerHTML='▶';isPlaying=false;}
    };
  });
</script>
<script src="https://www.youtube.com/iframe_api"></script>
<script src="/js/auth2.js"></script>
<script src="/js/s-comments.js"></script>
<script src="/js/nav.js"></script>
<script src="/js/search.js"></script>
  <script>
    const SM_API = 'https://shivamargbackend.onrender.com'; // ← change to your server URL in prod
    SmComments.init({ apiBase: SM_API });
  </script>
'''

for slug, title, eng, desc, audio_title, preview in pages:
    folder = base / slug
    folder.mkdir(parents=True, exist_ok=True)
    content = f'''<!DOCTYPE html>
<html lang="hi">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>{title} — {eng} | ShivaMarg</title>
  <meta name="description" content="{desc}">
  <meta name="robots" content="index, follow">
  <link rel="canonical" href="https://saurabhjha.live/kali-mantras/{slug}/">
  <style>body{{margin:0;font-family:Segoe UI,system-ui,sans-serif;background:#05060f;color:#f8f4e8}}a{{color:#ffd86b;text-decoration:none}}main{{max-width:760px;margin:0 auto;padding:28px}}h1{{font-size:2.2rem;margin:.4em 0}}h2{{font-size:1rem;color:#f3d77f;margin:.35em 0}}p{{margin:1em 0;line-height:1.75}}.badge{{display:inline-block;margin:.8em 0;padding:.35em .8em;border:1px solid #c59636;color:#f7e0a3;border-radius:999px;font-size:.86rem}}footer{{margin-top:40px;text-align:center;padding:24px 0;border-top:1px solid rgba(255,216,107,0.18)}}.foot-links{{display:flex;justify-content:center;gap:20px;flex-wrap:wrap;padding-top:12px}}.foot-links a{{font-size:.82rem;color:#f4e2bb}}.audio-widget{{position:fixed;bottom:20px;right:20px;background:rgba(8,6,14,0.96);border:1px solid rgba(255,216,107,0.18);padding:12px 14px;display:flex;align-items:center;gap:12px;z-index:100}}.play-btn{{width:38px;height:38px;border-radius:50%;background:#ffb347;border:none;color:#05060f;font-size:1rem;cursor:pointer}}#player{{width:0;height:0;overflow:hidden}}</style>
</head>
<body>
<main>
  <a href="/kali-mantras/">← Back to Kali Mantras</a>
  <h1>{title}</h1>
  <h2>{eng}</h2>
  <span class="badge">Kali Mata Mantra</span>
  <p>{desc}</p>
  <p>{preview}</p>
</main>
{common_js.replace('{page_id}', slug).replace('{title}', title).replace('{audio_title}', audio_title)}
</body>
</html>'''
    with open(folder / 'index.html', 'w', encoding='utf-8') as f:
        f.write(content)

root_content = '""'
root_content = '''<!DOCTYPE html>
<html lang="hi">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>काली मंत्र संग्रह — Kali Mantras | ShivaMarg</title>
  <meta name="description" content="काली माता के मंत्र और स्तोत्रों का संग्रह।">
  <meta name="robots" content="index, follow">
  <style>body{{margin:0;font-family:Segoe UI,system-ui,sans-serif;background:#05060f;color:#f8f4e8}}main{{max-width:780px;margin:0 auto;padding:28px}}h1{{margin:.4em 0;font-size:2.4rem}}p{{line-height:1.8}}ul{{margin:1.2em 0 0 1.2em}}li{{margin:.55em 0}}a{{color:#ffd86b;text-decoration:none}}</style>
</head>
<body>
<main>
  <h1>काली मंत्र संग्रह</h1>
  <p>काली माता के सभी मंत्र और स्तोत्रों के लिए यहां पृष्ठ बनाए गए हैं।</p>
  <ul>
'''
for slug, title, eng, desc, audio_title, preview in pages:
    root_content += f'    <li><a href="{slug}/">{title} — {eng}</a></li>\n'
root_content += '''  </ul>
</main>
</body>
</html>'''
with open(base / 'index.html', 'w', encoding='utf-8') as f:
    f.write(root_content)

print('created', len(pages), 'kali-mantras pages and root index')
