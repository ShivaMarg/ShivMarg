import os
from pathlib import Path

# List of Ganesh mantras with slug, title, and description
pages = [
    ("gajanana-shree-gajanana", "गजाननं भूत गणादि", "गजाननं भूतगणादिसेवितं कपित्थजम्बूफलसार भक्षितम्। उमासुतं शोकविनाशकारणम्॥"),
    ("ganesh-pancharatnam", "गणेश पञ्चरत्नम्", "मुदाकरात्तमोदकं सदा विमुक्तिसाधकम् कलाधरावतंसकम् विलासिलोकरक्षकम्॥"),
    ("ganpati-bappa-morya", "गणपति बप्पा मोरया", "गणपति बप्पा मोरया मंगलमूर्ती मोरया। पुढच्या वर्षी लवकर या॥"),
    ("ganesh-kavach", "गणेश कवचम्", "गणेशो मे शिरः पातु ललाटं विघ्ननाशनः। नेत्रे गणपतिः पातु॥"),
    ("ekadanta-stotra", "एकदंत स्तोत्र", "एकदंतं महाकायं तप्तकाञ्चनसन्निभम्। लम्बोदरं विशालाक्षम्॥"),
    ("siddhi-vinayak-mantra", "सिद्धि विनायक मंत्र", "ॐ नमो सिद्धि विनायकाय सर्व कार्य कर्त्रे सर्व विघ्न प्रशमनाय सर्व राज्य वश्यकरणाय॥"),
    ("ganesh-ashtanama-stotra", "गणेश अष्टनाम स्तोत्र", "वक्रतुण्ड एकदंतश्च कृष्णपिंगाक्षगजवक्त्रकाः। लम्बोदरश्च विकटो विघ्ननाशो धूम्रकेतुः॥"),
    ("ganesh-sahasranama", "गणेश सहस्रनाम", "ॐ गणेश्वराय नमः। ॐ गणक्रीडाय नमः। ॐ महागणपतये नमः॥"),
    ("modakahasta-stotra", "मोदकहस्त स्तुति", "मोदकहस्तं मुषकवाहनम् सिद्धिबुद्धिसमेतम्। देवाधिदेवम्॥"),
    ("ganesh-dwadasha-nama", "गणेश द्वादश नाम", "सुमुखश्चैकदंतश्च कपिलो गजकर्णकः। लम्बोदरश्च विकटो विघ्ननाशो विनायकः॥"),
    ("ganesh-mangalacharana", "गणेश मंगलाचरण", "शुक्लाम्बरधरं विष्णुं शशिवर्णं चतुर्भुजम्। प्रसन्नवदनं ध्यायेत् सर्वविघ्नोपशान्तये॥"),
    ("mudakarata-modakam", "मुदाकरात्त मोदकम्", "मुदाकरात्तमोदकं सदा विमुक्तिसाधकम् कलाधरावतंसकं विलासिलोकरक्षकम्॥"),
    ("heramba-stotra", "हेरम्ब पञ्चमुख स्तोत्र", "पञ्चाननं गजवदनं महोदरं सिंहवाहनम्। अभयं वरदं हस्तैः॥"),
    ("vighnaraja-stotra", "विघ्नराज स्तोत्र", "विघ्नेश्वरं विश्ववन्द्यम् गणाध्यक्षं पुरातनम्। गणेश्वरं जगद्योनिम्॥"),
    ("ganesh-namaskara-mantra", "गणेश नमस्कार मंत्र", "ॐ श्री गणेशाय नमः। ॐ विघ्नहर्त्रे नमः। ॐ प्रथमपूजिताय नमः॥"),
]

# Common JavaScript for all pages
common_js = """
<!-- SM_API -->
<script>
  window.SM_API = {
    user: "anonymous",
    session: "session_" + Date.now(),
    page: window.location.pathname
  };
</script>

<!-- Auth2.js -->
<script src="/js/auth2.js"></script>

<!-- S-Comments -->
<script src="/js/s-comments.js"></script>

<!-- Nav.js -->
<script src="/js/nav.js"></script>

<!-- Search.js -->
<script src="/js/search.js"></script>

<!-- YouTube API -->
<script>
  var tag = document.createElement('script');
  tag.src = "https://www.youtube.com/iframe_api";
  var firstScriptTag = document.getElementsByTagName('script')[0];
  firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);

  function onYouTubeIframeAPIReady() {
    // Create player when API is ready
    window.youtubePlayer = new YT.Player('youtube-player', {
      height: '315',
      width: '560',
      videoId: 'dQw4w9WgXcQ', // Default video
      events: {
        'onReady': onPlayerReady,
        'onStateChange': onPlayerStateChange
      }
    });
  }

  function onPlayerReady(event) {
    // Player is ready
  }

  function onPlayerStateChange(event) {
    // Handle state changes
  }
</script>
"""

# HTML template
html_template = """<!DOCTYPE html>
<html lang="hi">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>{title} — Ganesh Mantra | ShivaMarg</title>
  <meta name="description" content="{description}">
  <meta name="robots" content="index, follow">
  <link rel="icon" type="image/png" href="/images/ShivMarg.png" />
  <link href="https://fonts.googleapis.com/css2?family=Tiro+Devanagari+Sanskrit:ital@0;1&family=Cinzel+Decorative:wght@400;700;900&family=Cinzel:wght@400;600;900&family=Crimson+Pro:ital,wght@0,300;0,400;1,300&display=swap" rel="stylesheet">
  <style>
    :root {{
      --black:       #07000D;
      --black2:      #0D0015;
      --violet:      #6A0DAD;
      --violet-soft: #9B59B6;
      --violet-pale: #C39BD3;
      --crimson:     #8B0000;
      --blood:       #C0392B;
      --blood-soft:  #E74C3C;
      --gold:        #D4AC0D;
      --gold-light:  #F5D033;
      --gold-pale:   #FFF0A0;
      --cream:       #F5EEF8;
      --soft:        rgba(245,238,248,0.72);
      --dark:        #07000D;
      --dark2:       #0D0015;
    }}
    *, *::before, *::after {{ margin:0; padding:0; box-sizing:border-box; }}
    html {{ scroll-behavior:smooth; }}
    body {{
      background:var(--dark);
      color:var(--cream);
      font-family:'Crimson Pro',serif;
      overflow-x:hidden;
      line-height:1.6;
    }}

    /* BG */
    .bg-fixed {{
      position:fixed; inset:0; z-index:0;
      background:
        radial-gradient(ellipse 90% 60% at 50% 0%,   #200030 0%, transparent 65%),
        radial-gradient(ellipse 60% 50% at 0%  80%,  #130020 0%, transparent 55%),
        radial-gradient(ellipse 60% 50% at 100% 20%, #0A0010 0%, transparent 55%),
        linear-gradient(170deg, #07000D 0%, #100018 50%, #07000D 100%);
    }}
    .mandala-bg {{
      position:fixed; inset:0; z-index:0; opacity:0.04;
      background-image:url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='460' height='460'%3E%3Ccircle cx='230' cy='230' r='210' fill='none' stroke='%236A0DAD' stroke-width='0.8'/%3E%3Ccircle cx='230' cy='230' r='170' fill='none' stroke='%236A0DAD' stroke-width='0.4'/%3E%3Ccircle cx='230' cy='230' r='130' fill='none' stroke='%238B0000' stroke-width='0.8'/%3E%3Ccircle cx='230' cy='230' r='90' fill='none' stroke='%236A0DAD' stroke-width='0.4'/%3E%3Ccircle cx='230' cy='230' r='50' fill='none' stroke='%23D4AC0D' stroke-width='1.2'/%3E%3Cline x1='20' y1='230' x2='440' y2='230' stroke='%236A0DAD' stroke-width='0.3'/%3E%3Cline x1='230' y1='20' x2='230' y2='440' stroke='%236A0DAD' stroke-width='0.3'/%3E%3Cline x1='81' y1='81' x2='379' y2='379' stroke='%238B0000' stroke-width='0.3'/%3E%3Cline x1='379' y1='81' x2='81' y2='379' stroke='%238B0000' stroke-width='0.3'/%3E%3Cpolygon points='230,32 268,130 370,130 290,190 320,288 230,228 140,288 170,190 90,130 192,130' fill='none' stroke='%23D4AC0D' stroke-width='0.6'/%3E%3Cpolygon points='230,428 192,330 90,330 170,270 140,172 230,232 320,172 290,270 370,330 268,330' fill='none' stroke='%236A0DAD' stroke-width='0.4'/%3E%3C/svg%3E");
      background-size:460px 460px;
    }}
    #skulls {{ position:fixed; inset:0; z-index:0; pointer-events:none; }}
    .skull-particle {{
      position:absolute; font-family:'Tiro Devanagari Sanskrit',serif;
      animation:particle-rise linear infinite; opacity:0;
    }}
    @keyframes particle-rise {{
      0%   {{ transform:translateY(108vh) rotate(0deg) scale(0.4); opacity:0; }}
      6%   {{ opacity:0.8; }}
      88%  {{ opacity:0.3; }}
      100% {{ transform:translateY(-8vh) rotate(30deg) scale(1.2); opacity:0; }}
    }}

    /* NAV */
    nav {{
      position:sticky; top:0; z-index:200;
      background:rgba(7,0,13,0.92); backdrop-filter:blur(18px);
      border-bottom:1px solid rgba(106,13,173,0.2);
      padding:0 5vw; display:flex; align-items:center; justify-content:space-between; height:62px;
    }}
    .logo {{ font-family:'Cinzel Decorative',serif; font-size:1.25rem; color:var(--gold); text-decoration:none; letter-spacing:1px; }}
    .logo em {{ color:var(--violet-soft); font-style:normal; }}
    .nav-links a {{ color:rgba(245,238,248,0.52); text-decoration:none; margin-left:18px; font-family:'Cinzel',serif; font-size:0.7rem; letter-spacing:2px; text-transform:uppercase; transition:color 0.3s; }}
    .nav-links a:hover, .nav-links a.active {{ color:var(--gold-light); }}
    .nav-back {{ font-family:'Cinzel',serif; font-size:0.68rem; letter-spacing:2px; color:var(--gold); background:rgba(212,172,13,0.1); border:1px solid rgba(212,172,13,0.25); padding:6px 14px; text-decoration:none; transition:all 0.3s; }}
    .nav-back:hover {{ background:rgba(212,172,13,0.2); }}

    /* HERO */
    .hero {{
      position:relative; z-index:10;
      text-align:center; padding:80px 20px 60px; overflow:hidden;
    }}
    .hero::before {{
      content:''; position:absolute; top:50%; left:50%;
      transform:translate(-50%,-50%);
      width:900px; height:900px; border-radius:50%;
      background:radial-gradient(circle, rgba(106,13,173,0.08) 0%, transparent 65%);
    }}
    .hero-symbol {{
      font-size:7rem; display:block; line-height:1; margin-bottom:22px;
      animation:kali-glow 4s ease-in-out infinite;
      filter:drop-shadow(0 0 30px rgba(106,13,173,0.95)) drop-shadow(0 0 80px rgba(139,0,0,0.6));
    }}
    @keyframes kali-glow {{
      0%,100%{{ filter:drop-shadow(0 0 30px rgba(106,13,173,0.95)) drop-shadow(0 0 80px rgba(139,0,0,0.5)); transform:scale(1); }}
      50%    {{ filter:drop-shadow(0 0 60px rgba(106,13,173,1))   drop-shadow(0 0 130px rgba(212,172,13,0.5)); transform:scale(1.07); }}
    }}
    .hero-tag  {{ font-family:'Cinzel',serif; font-size:0.68rem; letter-spacing:7px; color:var(--violet-soft); text-transform:uppercase; margin-bottom:18px; animation:fadeUp 0.9s ease both; }}
    .hero h1   {{ font-family:'Cinzel Decorative',serif; font-size:clamp(2.2rem,6vw,4.5rem); color:var(--gold-light); line-height:1.15; margin-bottom:10px; text-shadow:0 0 40px rgba(212,172,13,0.3); animation:fadeUp 1s ease both; }}
    .hero-deva {{ font-family:'Tiro Devanagari Sanskrit',serif; font-size:clamp(1.8rem,4vw,3rem); color:rgba(195,155,211,0.72); margin-bottom:22px; animation:fadeUp 1.1s ease both; }}
    .hero-desc {{ font-size:1.05rem; color:var(--soft); font-style:italic; max-width:600px; margin:0 auto 28px; line-height:1.75; animation:fadeUp 1.2s ease both; }}
    .hero-orn  {{ color:rgba(212,172,13,0.4); font-size:1.1rem; letter-spacing:14px; margin:14px 0; animation:fadeUp 1.3s ease both; }}

    /* AUDIO WIDGET */
    .audio-widget {{
      position:relative; z-index:10; max-width:600px; margin:40px auto 0;
      background:rgba(7,0,13,0.8); border:1px solid rgba(106,13,173,0.3); border-radius:8px; padding:24px;
      backdrop-filter:blur(10px);
    }}
    .audio-title {{ font-family:'Cinzel',serif; font-size:0.8rem; letter-spacing:3px; color:var(--gold); text-transform:uppercase; margin-bottom:16px; text-align:center; }}
    .audio-player {{ width:100%; height:40px; background:#000; border-radius:4px; }}

    /* CONTENT */
    .content {{
      position:relative; z-index:10; max-width:800px; margin:60px auto 0; padding:0 20px;
    }}
    .mantra-text {{
      font-family:'Tiro Devanagari Sanskrit',serif; font-size:1.8rem; line-height:2.2; text-align:center;
      color:var(--gold-light); margin-bottom:40px; padding:30px;
      background:rgba(7,0,13,0.6); border:1px solid rgba(106,13,173,0.2); border-radius:8px;
      box-shadow:0 0 30px rgba(106,13,173,0.1);
    }}
    .meaning {{
      font-size:1.1rem; color:var(--soft); line-height:1.8; margin-bottom:30px;
      padding:20px; background:rgba(212,172,13,0.05); border-left:3px solid var(--gold);
    }}

    /* COMMENTS */
    .comments-section {{
      position:relative; z-index:10; max-width:800px; margin:60px auto 0; padding:0 20px;
    }}
    .comments-title {{ font-family:'Cinzel',serif; font-size:1.2rem; color:var(--gold); text-align:center; margin-bottom:20px; }}

    /* FOOTER */
    footer {{
      position:relative; z-index:10; text-align:center; padding:40px 20px; border-top:1px solid rgba(106,13,173,0.15);
      margin-top:80px;
    }}
    .foot-sym  {{ font-size:3rem; color:rgba(212,172,13,0.22); display:block; margin-bottom:12px; }}
    .foot-txt  {{ font-family:'Cinzel',serif; font-size:0.65rem; letter-spacing:4px; color:rgba(245,238,248,0.22); text-transform:uppercase; }}
    .foot-links {{ display:flex; justify-content:center; gap:24px; margin-top:14px; flex-wrap:wrap; }}
    .foot-links a {{ font-family:'Cinzel',serif; font-size:0.6rem; letter-spacing:2px; color:rgba(255,251,242,0.28); text-decoration:none; text-transform:uppercase; transition:color 0.3s; }}
    .foot-links a:hover {{ color:var(--gold-light); }}

    @keyframes fadeUp {{
      from{{ opacity:0; transform:translateY(24px) }}
      to{{ opacity:1; transform:translateY(0) }}
    }}

    @media(max-width:768px) {{
      .hero {{ padding:60px 20px 40px; }}
      .hero-symbol {{ font-size:5rem; }}
      .hero h1 {{ font-size:clamp(1.8rem,8vw,3.5rem); }}
      .hero-deva {{ font-size:clamp(1.4rem,6vw,2.5rem); }}
      .content {{ margin:40px auto 0; }}
      .mantra-text {{ font-size:1.4rem; padding:20px; }}
    }}
  </style>
</head>
<body>
  <!-- BG -->
  <div class="bg-fixed"></div>
  <div class="mandala-bg"></div>
  <div id="skulls"></div>

  <!-- NAV -->


  <!-- HERO -->
  <section class="hero">
    <div class="hero-symbol">🐘</div>
    <div class="hero-tag">गणेश मंत्र</div>
    <h1>{title}</h1>
    <div class="hero-deva">{description}</div>
    <p class="hero-desc">ॐ गं गणपतये नमः — भगवान गणेश की कृपा से सभी कार्य सिद्ध हों।</p>
    <div class="hero-orn">✦ ✦ ✦</div>
  </section>

  <!-- AUDIO WIDGET -->
  <div class="audio-widget">
    <div class="audio-title">धार्मिक संगीत सुनें</div>
    <div id="youtube-player" class="audio-player"></div>
  </div>

  <!-- CONTENT -->
  <div class="content">
    <div class="mantra-text">
      {description}
    </div>
    <div class="meaning">
      <strong>अर्थ:</strong> यह गणेश जी का पवित्र मंत्र/स्तोत्र है। नियमित जाप से विघ्न दूर होते हैं और सिद्धि प्राप्त होती है।
    </div>
  </div>

  <!-- COMMENTS -->
  <div class="comments-section">
    <div class="comments-title">टिप्पणियाँ</div>
    <div id="s-comments"></div>
  </div>

  <!-- FOOTER -->
  <footer>
    <div class="foot-sym">🕉️</div>
    <div class="foot-txt">ॐ शान्तिः शान्तिः शान्तिः</div>
    <div class="foot-links">
      <a href="/privacy-policy/">Privacy</a>
      <a href="/disclaimer/">Disclaimer</a>
      <a href="/contact/">Contact</a>
      <a href="/about/">About</a>
    </div>
  </footer>

  {common_js}
</body>
</html>"""

# Create directories and files
base_path = Path("c:/Users/floot/OneDrive/Desktop/Shivmarg/ganesh-mantras")

for slug, title, description in pages:
    folder_path = base_path / slug
    folder_path.mkdir(exist_ok=True)

    html_content = html_template.format(
        title=title,
        description=description,
        common_js=common_js
    )

    file_path = folder_path / "index.html"
    with open(file_path, 'w', encoding='utf-8') as f:
        f.write(html_content)

    print(f"Created {slug}/index.html")

# Create root index.html for ganesh-mantras
root_index = """<!DOCTYPE html>
<html lang="hi">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>गणेश मंत्र संग्रह — Ganesh Mantras | ShivaMarg</title>
  <meta name="description" content="गणेश मंत्र और स्तोत्रों का संग्रह।">
  <meta name="robots" content="index, follow">
  <style>body{margin:0;font-family:Segoe UI,system-ui,sans-serif;background:#05060f;color:#f8f4e8}h1{margin:.4em 0;font-size:2.4rem}p{line-height:1.8}ul{margin:1.2em 0 0 1.2em}li{margin:.55em 0}a{color:#ffd86b;text-decoration:none}</style>
</head>
<body>
<main style="max-width:780px;margin:0 auto;padding:28px">
  <h1>गणेश मंत्र संग्रह</h1>
  <p>गणेश जी के सभी मंत्र और स्तोत्रों के लिए यहां पृष्ठ बनाए गए हैं।</p>
  <ul>
"""

for slug, title, description in pages:
    root_index += f'    <li><a href="{slug}/">{title} — {slug.replace("-", " ").title()}</a></li>\n'

root_index += """  </ul>
</main>
</body>
</html>"""

with open(base_path / "index.html", 'w', encoding='utf-8') as f:
    f.write(root_index)

print(f"Created {len(pages)} ganesh-mantras pages and root index")