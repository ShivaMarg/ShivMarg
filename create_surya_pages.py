import os
from pathlib import Path

base = Path(r"c:\Users\floot\OneDrive\Desktop\Shivmarg\surya-mantras")
base.mkdir(parents=True, exist_ok=True)

pages = [
    ("aditya-hridayam", "आदित्य हृदयम्", "Aditya Hridayam", "आदित्य हृदयम् — सूर्य देव की महिमा।", "Aditya Hridayam • Surya Mantra", "ततो युद्धपरिश्रान्तं समरे चिन्तया स्थितम्। रावणं चाग्रतो दृष्ट्वा युद्धाय समुपस्थितम्॥"),
    ("gayatri-mantra", "गायत्री मंत्र", "Gayatri Mantra", "गायत्री मंत्र — सर्वोच्च गुह्य मंत्र।", "Gayatri Mantra • Surya Mantra", "ॐ भूर्भुवः स्वः। तत्सवितुर्वरेण्यं भर्गो देवस्य धीमहि। धियो यो नः प्रचोदयात्॥"),
    ("surya-chalisa", "सूर्य चालीसा", "Surya Chalisa", "सूर्य चालीसा — सूर्य देव के लिए ४० चौपाई।", "Surya Chalisa • Surya Mantra", "जय सविता जय जय दिनराजा। जय जय सूर्य भानु भव भ्राजा॥"),
    ("surya-beej-mantra", "सूर्य बीज मंत्र", "Surya Beej Mantra", "सूर्य बीज मंत्र — शक्तिशाली सूर्य बीज मंत्र।", "Surya Beej Mantra • Surya Mantra", "ॐ ह्रां ह्रीं ह्रौं सः सूर्याय नमः। ॐ घृणि सूर्याय नमः॥"),
    ("surya-aarti", "सूर्य आरती", "Surya Dev Aarti", "सूर्य आरती — सूर्य देव का आराधना गीत।", "Surya Dev Aarti • Surya Mantra", "कर्मों का फल देनेवाले तुम हो देव सवेरा। जय जय जय सूर्य देव दिनमणि तेरा॥"),
    ("dwadasha-aditya-namavali", "द्वादश आदित्य नाम", "12 Aditya Namavali", "द्वादश आदित्य नाम — महाभारत का आदित्य स्तोत्र।", "12 Aditya Namavali • Surya Mantra", "मित्रो ह्यर्यमा चैव रुद्रो वरुणो एव च। विष्णुः पूषा तथैवेन्द्रो धाता च सविता शिवः॥"),
    ("surya-ashtakam", "सूर्याष्टकम्", "Surya Ashtakam", "सूर्याष्टकम् — सूर्य के आठ स्तोत्र।", "Surya Ashtakam • Surya Mantra", "आदिदेव नमस्तुभ्यं प्रसीद मम भास्कर। दिवाकर नमस्तुभ्यं प्रभाकर नमोऽस्तु ते॥"),
    ("surya-namaskar-mantra", "सूर्य नमस्कार मंत्र", "Surya Namaskar Mantra", "सूर्य नमस्कार मंत्र — प्रातः सूर्य प्रणाम मंत्र।", "Surya Namaskar Mantra • Surya Mantra", "ॐ मित्राय नमः। ॐ रवये नमः। ॐ सूर्याय नमः। ॐ भानवे नमः॥"),
    ("surya-kavacham", "सूर्य कवचम्", "Surya Kavacham", "सूर्य कवचम् — समस्त अंगों की रक्षा हेतु मंत्र।", "Surya Kavacham • Surya Mantra", "शिरो मे भास्करः पातु ललाटं मार्तण्डकः। नेत्रे मे पद्मिनीकान्तः श्रोत्रे वर्षप्रदोऽवतु॥"),
    ("surya-stotram", "सूर्य स्तोत्रम्", "Surya Stotram", "सूर्य स्तोत्रम् — रोग निवारण सूर्य स्तोत्र।", "Surya Stotram • Surya Mantra", "नमः सूर्याय शान्ताय सर्वरोगनिवारिणे। आयुरारोग्यमैश्वर्यं देहि देवः जगत्पते॥"),
    ("ravi-bhajan", "जय सूर्य देव भजन", "Ravi Bhajan", "जय सूर्य देव भजन — सूर्य भजन गीत।", "Ravi Bhajan • Surya Mantra", "जय जय जय सूर्य भगवान। दिनकर दिनमणि दिव्य महान॥"),
    ("surya-108-names", "सूर्य अष्टोत्तर शतनाम", "108 Names of Surya", "सूर्य अष्टोत्तर शतनाम — सूर्य के १०८ नाम।", "108 Names of Surya • Surya Mantra", "विवस्वान् मार्तण्डश्च भानुः सवितृभास्करौ। रविः पूषा त्वष्टा सूर्यो हंसो विभावसुः॥"),
    ("surya-sahasranama", "सूर्य सहस्रनाम स्तोत्र", "Surya Sahasranama", "सूर्य सहस्रनाम — सूर्य के १०००+ नाम।", "Surya Sahasranama • Surya Mantra", "भानुः किरणकृत् भास्करः प्रभाकरः। विश्वात्मा विश्वकर्मा च तेजस्वी तेजसांनिधिः॥"),
    ("chhath-puja-mantra", "छठ पूजा मंत्र", "Chhath Puja Mantra", "छठ पूजा मंत्र — छठ महापर्व सूर्य वंदना।", "Chhath Puja Mantra • Surya Mantra", "ॐ सूर्याय नमः। केलवा के पात पर उगेलन सूरजमल। उगेलन सूरज देव भइले भिनसार॥"),
    ("surya-gayatri-mantra", "सूर्य गायत्री मंत्र", "Surya Gayatri Mantra", "सूर्य गायत्री मंत्र — सूर्य ध्यान गायत्री।", "Surya Gayatri Mantra • Surya Mantra", "ॐ भास्कराय विद्महे महातेजाय धीमहि। तन्नो सूर्यः प्रचोदयात्॥"),
    ("surya-upanishad", "सूर्य उपनिषद्", "Surya Upanishad", "सूर्य उपनिषद् — सूर्य आत्मा का श्लोक।", "Surya Upanishad • Surya Mantra", "सर्वो वै रुद्रः सर्वं विश्वं भुवनम्। सूर्य आत्मा जगतस्तस्थुषश्च॥"),
    ("surya-puja-vidhi-mantra", "सूर्य अर्घ्य मंत्र", "Surya Arghya Mantra", "सूर्य पूजा विधि — प्रातः अर्घ्य मंत्र।", "Surya Arghya Mantra • Surya Mantra", "एहि सूर्य सहस्रांशो तेजोराशे जगत्पते। अनुकम्पय मां देव गृहाणार्घ्यं दिवाकर॥"),
    ("surya-mangal-stotra", "सूर्य मंगलाचरण", "Surya Mangalacharan", "सूर्य मंगलाचरण — दैनिक मंगल स्तोत्र।", "Surya Mangalacharan • Surya Mantra", "मंगलं भगवान् सूर्यो मंगलं भुवनेश्वरः। मंगलं दिनपतिश्चैव मंगलायतनो रविः॥"),
    ("surya-namaskara-stotram", "सूर्य नमस्कार स्तोत्र", "Surya Namaskar Stotram", "सूर्य नमस्कार स्तोत्र — १२ श्लोकों का सूर्य स्तोत्र।", "Surya Namaskar Stotram • Surya Mantra", "नमः सवित्रे जगदेकचक्षुषे जगत्प्रसूतिस्थितिनाशहेतवे॥"),
    ("ratha-saptami-mantra", "रथ सप्तमी मंत्र", "Ratha Saptami Mantra", "रथ सप्तमी मंत्र — सूर्य जयन्ती का मंत्र।", "Ratha Saptami Mantra • Surya Mantra", "सप्तसप्ति वाह नमो नमः। सप्तवर्ण मयूखाय सप्तलोकप्रदीपिने॥"),
    ("surya-dwadasha-nama", "सूर्य द्वादश नाम", "Surya Dwadasha Nama", "सूर्य द्वादश नाम — रोज़ाना १२ आदित्य नाम।", "Surya Dwadasha Nama • Surya Mantra", "आदित्यः प्रथमं नाम द्वितीयं तु दिवाकरः। तृतीयं भास्करं प्रोक्तं चतुर्थं तु प्रभाकरः॥"),
    ("surya-vrat-katha", "रविवार व्रत कथा", "Raviwar Vrat Katha", "रविवार व्रत कथा — सूर्य व्रत कथा।", "Raviwar Vrat Katha • Surya Mantra", "एक समय एक अन्धी स्त्री थी जो प्रतिदिन सूर्य देव की पूजा श्रद्धापूर्वक करती थी॥"),
    ("surya-pratah-smarana", "सूर्य प्रातःस्मरण", "Surya Pratah Smarana", "सूर्य प्रातःस्मरण — प्रातः सूर्य स्मरण मंत्र।", "Surya Pratah Smarana • Surya Mantra", "आदित्यस्य नमस्कारान् ये कुर्वन्ति दिने दिने। आयुः प्रज्ञा बलं वीर्यं तेजस्तेषां च जायते॥"),
    ("chhath-geet", "छठ पूजा लोकगीत", "Chhath Puja Lokgeet", "छठ गीत — छठ पूजा का लोक गीत।", "Chhath Puja Lokgeet • Surya Mantra", "उगऊ हे सूरज देव। अरग देबइ तोहे दूध अउर चाउर। नहाय खाय करी षष्ठी माई के पूजन॥"),
    ("surya-tantra-mantra", "सूर्य तांत्रिक मंत्र", "Surya Tantra Mantra", "सूर्य तांत्रिक मंत्र — साधना मंत्र।", "Surya Tantra Mantra • Surya Mantra", "ॐ ह्रीं ह्रीं सूर्याय सहस्रकिरणाय मनोवाञ्छितफलं देहि देहि स्वाहा॥"),
    ("surya-graha-shanti", "सूर्य ग्रह शान्ति मंत्र", "Surya Graha Shanti", "सूर्य ग्रह शान्ति मंत्र — ग्रह दोष निवारण।", "Surya Graha Shanti • Surya Mantra", "ॐ आकृष्णेन रजसा वर्तमानो निवेशयन्नमृतं मर्त्यं च। हिरण्ययेन सविता रथेन देवो याति भुवनानि पश्यन्॥"),
    ("surya-vandana", "सूर्य वंदना स्तुति", "Surya Vandana Stuti", "सूर्य वंदना — सूर्य वंदना स्तुति।", "Surya Vandana Stuti • Surya Mantra", "जय जय जय रवि देव। नमो नमो दिनपते। प्रणत पालन-कर्ता जय तिमिर-निकेते॥"),
    ("surya-jyoti-mantra", "सूर्य ज्योति मंत्र", "Surya Jyoti Mantra", "सूर्य ज्योति मंत्र — दीपक मंत्र।", "Surya Jyoti Mantra • Surya Mantra", "ॐ तेजोऽसि शुक्रमस्यमृतमसि धाम नाम्ना। प्रियं देवानामनाद्यनन्तं ज्योतिर्भासि॥"),
]

common = '''


<!-- COMMENTS -->
 Please login for comments
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
    <div class="audio-sub">{audio_sub}</div>
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
    SmComments.init({{ apiBase: SM_API }});
  </script>
'''

def make_content(slug, title, eng, desc, audio_title, preview):
    audio_sub = audio_title
    html = f'''<!DOCTYPE html>
<html lang="hi">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>{title} — {eng} | ShivaMarg</title>
  <meta name="description" content="{desc}">
  <meta name="robots" content="index, follow">
  <link rel="canonical" href="https://saurabhjha.live/surya-mantras/{slug}/">
  <style>
    body{{margin:0;font-family:Segoe UI,system-ui,sans-serif;background:#05060f;color:#f8f4e8}}
    a{{color:#ffd86b;text-decoration:none}}
    main{{max-width:760px;margin:0 auto;padding:28px}}
    h1{{font-size:2.2rem;margin:.4em 0}}
    h2{{font-size:1rem;color:#f3d77f;margin:.35em 0}}
    p{{margin:1em 0;line-height:1.75}}
    .badge{{display:inline-block;margin:.8em 0;padding:.35em .8em;border:1px solid #c59636;color:#f7e0a3;border-radius:999px;font-size:.86rem}}
    footer{{margin-top:40px;text-align:center;padding:24px 0;border-top:1px solid rgba(255,216,107,0.18)}}
    .foot-links{{display:flex;justify-content:center;gap:20px;flex-wrap:wrap;padding-top:12px}}
    .foot-links a{{font-size:.82rem;color:#f4e2bb}}
    .audio-widget{{position:fixed;bottom:20px;right:20px;background:rgba(8,6,14,0.96);border:1px solid rgba(255,216,107,0.18);padding:12px 14px;display:flex;align-items:center;gap:12px;z-index:100}}
    .play-btn{{width:38px;height:38px;border-radius:50%;background:#ffb347;border:none;color:#05060f;font-size:1rem;cursor:pointer}}
    #player{{width:0;height:0;overflow:hidden}}
  </style>
</head>
<body>
<main>
  <a href="/surya-mantras/">← Back to Surya Mantras</a>
  <h1>{title}</h1>
  <h2>{eng}</h2>
  <span class="badge">Surya Mantra</span>
  <p>{desc}</p>
  <p>{preview}</p>
</main>
{common.replace('{page_id}', slug).replace('{title}', title).replace('{audio_title}', audio_title).replace('{audio_sub}', audio_sub)}
</body>
</html>'''
    return html

for slug, title, eng, desc, audio_title, preview in pages:
    folder = base / slug
    folder.mkdir(parents=True, exist_ok=True)
    path = folder / 'index.html'
    with open(path, 'w', encoding='utf-8') as f:
        f.write(make_content(slug, title, eng, desc, audio_title, preview))

root_index = base / 'index.html'
with open(root_index, 'w', encoding='utf-8') as f:
    f.write('''<!DOCTYPE html>
<html lang="hi">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>सूर्य मंत्र संग्रह — Surya Mantras | ShivaMarg</title>
  <meta name="description" content="सूर्य मंत्रों और स्तोत्रों का संग्रह।">
  <meta name="robots" content="index, follow">
  <style>body{margin:0;font-family:Segoe UI,system-ui,sans-serif;background:#05060f;color:#f8f4e8}main{max-width:780px;margin:0 auto;padding:28px}h1{margin:.4em 0;font-size:2.4rem}p{line-height:1.8}ul{margin:1.2em 0 0 1.2em}li{margin:.55em 0}a{color:#ffd86b;text-decoration:none}</style>
</head>
<body>
<main>
  <h1>सूर्य मंत्र संग्रह</h1>
  <p>सभी सूर्य मंत्रों के लिए पृष्ठ तैयार किया गया। नीचे सूची से चयन करें।</p>
  <ul>
''')
    for slug, title, eng, desc, audio_title, preview in pages:
        f.write(f'    <li><a href="{slug}/">{title} — {eng}</a></li>\n')
    f.write('''  </ul>
</main>
</body>
</html>''')

print('created', len(pages), 'surya-mantras pages and root index')
