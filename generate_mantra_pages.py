from pathlib import Path

BASE_URL = "https://shivmarg.live"

CATEGORIES = [
    {
        "slug": "ganesh-mantras",
        "name_hi": "गणेश मंत्र",
        "name_en": "Ganesh Mantras",
        "description": "गणेश जी के सभी मंत्र और स्तोत्र एक ही शैली में।",
        "pages": [
            ("gajanana-shree-gajanana", "गजाननं भूत गणादि", "गजाननं भूतगणादिसेवितं कपित्थजम्बूफलसार भक्षितम्। उमासुतं शोकविनाशकारणम्॥", "ॐ गं गणपतये नमः — विष्णु सुत गणेश की आराधना।"),
            ("ganesh-pancharatnam", "गणेश पञ्चरत्नम्", "मुदाकरात्तमोदकं सदा विमुक्तिसाधकम् कलाधरावतंसकम् विलासिलोकरक्षकम्॥", "गणेश पञ्चरत्नम् — सिद्धि, समृद्धि और विद्या के लिए।"),
            ("ganpati-bappa-morya", "गणपति बप्पा मोरया", "गणपति बप्पा मोरया मंगलमूर्ती मोरया। पुढच्या वर्षी लवकर या॥", "गणपति बप्पा के जयजयकार से घर में मंगल आए।"),
            ("ganesh-kavach", "गणेश कवचम्", "गणेशो मे शिरः पातु ललाटं विघ्ननाशनः। नेत्रे गणपतिः पातु॥", "गणेश कवच — विघ्नों से सुरक्षा का मंत्र।"),
            ("ekadanta-stotra", "एकदंत स्तोत्र", "एकदंतं महाकायं तप्तकाञ्चनसन्निभम्। लम्बोदरं विशालाक्षम्॥", "एकदंत स्तोत्र — बुद्धि और बलवर्धन के लिए।"),
            ("siddhi-vinayak-mantra", "सिद्धि विनायक मंत्र", "ॐ नमो सिद्धि विनायकाय सर्व कार्य कर्त्रे सर्व विघ्न प्रशमनाय सर्व राज्य वश्यकरणाय॥", "सिद्धि विनायक मंत्र — सभी कार्यों में सफलता के लिए।"),
            ("ganesh-ashtanama-stotra", "गणेश अष्टनाम स्तोत्र", "वक्रतुण्ड एकदंतश्च कृष्णपिंगाक्षगजवक्त्रकाः। लम्बोदरश्च विकटो विघ्ननाशो धूम्रकेतुः॥", "अष्टनाम स्तोत्र — गणपति के आठ भिन्न नामों का स्तुतिगान।"),
        ],
    },
    {
        "slug": "kali-mantras",
        "name_hi": "काली मंत्र",
        "name_en": "Kali Mantras",
        "description": "माँ काली की स्तुति, कवच और पूजा के मंत्र।",
        "pages": [
            ("dakshina-kali-mantra", "दक्षिणा काली मंत्र", "ॐ ह्रीं क्रीं दक्षिणकाली वाच्यै नमः॥", "दक्षिणा काली मंत्र — आंतरिक शक्ति जागृत करने वाला मंत्र।"),
            ("kali-chalisa", "काली चालीसा", "जय काली माता, त्रिनेत्रा काली, जय जय काली॥", "काली चालीसा — माता को समर्पित 40 चौपाई।"),
            ("kali-kavacham", "काली कवचम्", "कर्णे मे क्रीं क्रीं कालीश्चरणे मे क्लीं क्लिं कृति॥", "काली कवच — भाग्य और रक्षा के लिए कवच मंत्र।"),
            ("kali-gayatri", "काली गायत्री", "ॐ काली गायत्री विद्महे कालरात्र्यै धीमहि। तन्नो काली प्रचोदयात्॥", "काली गायत्री — माँ काली की भव्य गायत्री मंत्र साधना।"),
        ],
    },
    {
        "slug": "surya-mantras",
        "name_hi": "सूर्य मंत्र",
        "name_en": "Surya Mantras",
        "description": "सूर्य देव के आराधना मंत्र, आज्ञा और नामावलि।",
        "pages": [
            ("aditya-hridayam", "आदित्य हृदयम्", "ततो युद्धपरिश्रान्तं समरे चिन्तया स्थितम्...", "आदित्य हृदयम् — सूर्य देव की महिमा और विजय का स्तोत्र।"),
            ("gayatri-mantra", "गायत्री मंत्र", "ॐ भूर्भुवः स्वः तत्सवितुर्वरेण्यं भर्गो देवस्य धीमहि...", "गायत्री मंत्र — सूर्य की प्रेरणा से बुद्धि ब्रह्मांड में प्रसारित।"),
            ("surya-aarti", "सूर्य आरती", "कर्मों का फल देनेवाले तुम हो देव सवेरा...", "सूर्य आरती — प्रभातकालीन सूर्य आराधना गीत।"),
            ("surya-beej-mantra", "सूर्य बीज मंत्र", "ॐ ह्रां ह्रीं ह्रौं सः सूर्याय नमः॥", "सूर्य बीज मंत्र — तेज, स्वास्थ्य और आत्मविश्वास के लिए।"),
        ],
    },
    {
        "slug": "gayatri-mantras",
        "name_hi": "गायत्री मंत्र",
        "name_en": "Gayatri Mantras",
        "description": "गायत्री माता के मंत्र, स्तोत्र, आरती और उपासना का पूरा संग्रह।",
        "pages": [
            ("gayatri-mantra", "ॐ भूर्भुवः स्वः गायत्री", "ॐ भूर्भुवः स्वः तत्सवितुर्वरेण्यं भर्गो देवस्य धीमहि...", "गायत्री मंत्र — सर्वश्रेष्ठ वेद मंत्र बुद्धि और प्रकाश के लिए।"),
            ("gayatri-mata-aarti", "जयति जय गायत्री माता", "जयति जय गायत्री माता...", "गायत्री माता आरती — वेद माता की आराधना शंख-चक्र सहित।"),
            ("gayatri-chalisa", "श्री गायत्री चालीसा", "श्री गायत्री चालीसा — भक्तजन द्वारा पाठित 40 चौपाई।", "गायत्री चालीसा — माता गायत्री की महिमा का संक्षिप्त स्तोत्र।"),
            ("gayatri-beej-mantra", "गायत्री बीज मंत्र", "ॐ श्रीं ब्रह्माण्यै विद्महे...", "गायत्री बीज मंत्र — सरल और प्रभावी कल्याण मंत्र।"),
            ("savitri-mantra", "सावित्री गायत्री मंत्र", "सावित्री गायत्री मंत्र — संकल्प और आशीर्वाद का मंत्र।", "सावित्री गायत्री मंत्र — सविता देवता को समर्पित ध्यान मंत्र।"),
            ("gayatri-stotram", "श्री गायत्री स्तोत्रम्", "श्री गायत्री स्तोत्रम् — माता की स्तुति व स्तव।", "गायत्री स्तोत्रम् — भक्तिमय पाठ से चित्त में शांति।"),
            ("sandhya-vandana", "गायत्री संध्या वंदना", "गायत्री संध्या वंदना — त्रिकाल संध्या का पाठ।", "गायत्री संध्या वंदना — सूर्य की प्रेरणा से देवता का स्मरण।"),
            ("gayatri-kavach", "गायत्री कवचम्", "गायत्री कवचम् — हर संकट से सुरक्षा देने वाला कवच।", "गायत्री कवच — मन और परिवार की रक्षा हेतु।"),
            ("gayatri-ashtakam", "गायत्री अष्टकम्", "गायत्री अष्टकम् — आठ पदों में माता की महिमा।", "अष्टकम् — मधुर पाठ से मानसिक शांति और सौभाग्य मिलता है।"),
            ("gayatri-108-names", "गायत्री १०८ नाम", "गायत्री के 108 दिव्य नामों का संकलन।", "108 नाम — नामजप से लाभ और आशीर्वाद।"),
            ("gayatri-sahasranama", "गायत्री सहस्रनाम", "गायत्री सहस्रनाम — हजार नामों का महादेव स्तोत्र।", "सहस्रनाम — व्यापक आराधना और गहन भक्ति के लिए।"),
            ("vyahrti-mantra", "महाव्याहृति मंत्र", "महाव्याहृति मंत्र — व्याहृति मंत्र का प्रधान पाठ।", "महाव्याहृति — ब्रह्म में प्रवेश का उच्चारण।"),
            ("gayatri-upasana", "गायत्री उपासना विधि", "गायत्री उपासना विधि — गायत्री साधना का निर्देश।", "गायत्री उपासना — मंत्र, विधि और ध्यान का संगम।"),
            ("gayatri-dhyana", "गायत्री ध्यान श्लोक", "गायत्री ध्यान श्लोक — मन की शुद्धि के लिए।", "ध्यान श्लोक — गायत्री ध्यान को मजबूत करने वाला पाठ।"),
            ("gayatri-hridaya", "गायत्री हृदय स्तोत्र", "गायत्री हृदय स्तोत्र — माता के हृदय स्तुति पाठ।", "हृदय स्तोत्र — भावुक भक्ति और चित्त की शांति के लिए।"),
            ("gayatri-prabhata-smarana", "गायत्री प्रातःस्मरण", "गायत्री प्रातःस्मरण — सुबह की स्मृति पाठ।", "प्रातःस्मरण — प्रभातकालीन ध्यान से दिन की शुभ शुरुआत।"),
            ("trikal-gayatri-mantra", "त्रिकाल गायत्री उपासना", "त्रिकाल गायत्री — प्रातः, मध्यान्ह और संध्या पाठ।", "त्रिकाल गायत्री — समय-समय पर गायत्री जाप का महत्त्व।"),
            ("gayatri-bhajan", "गायत्री माता भजन", "गायत्री माता भजन — गायत्री की स्तुति गीत।", "भजन — भक्ति और आनंद को बढ़ाने वाला गायत्री गीत।"),
            ("panchmukhi-gayatri", "पञ्चमुखी गायत्री", "पञ्चमुखी गायत्री — पांच मुखों वाली गायत्री की विधि।", "पञ्चमुखी गायत्री — पांच दिशाओं में समर्पित साधना।"),
        ],
    },
    {
        "slug": "Chandra-mantras",
        "name_hi": "चन्द्र मंत्र",
        "name_en": "Chandra Mantras",
        "description": "चन्द्र देव की शीतलता, शांति और कवच मंत्र।",
        "pages": [
            ("chandra-kavach", "चन्द्र कवच", "चन्द्रदेव की दिव्य कवच रचना।", "चन्द्र कवच — चंद्र की रक्षा शक्ति के साथ शांति प्रदान करता है।"),
            ("chandra-beej-mantra", "चन्द्र बीज मंत्र", "चन्द्र बीज मंत्र से चन्द्र देव की शक्तियों का आह्वान करें।", "चन्द्र बीज मंत्र — मानसिक शुद्धि और भावनात्मक संतुलन के लिए।"),
            ("chandra-chalisa", "चन्द्र चालीसा", "चन्द्र चालीसा में चन्द्र देव की महिमा और गुणों का वर्णन है।", "चन्द्र चालीसा — चंद्र भक्ति के पवित्र 40 चौपाई।"),
            ("chandra-aarti", "चन्द्र आरती", "चन्द्र आरती से चन्द्रदेव को प्रणाम करें।", "चन्द्र आरती — शांति और सौम्यता की आराधना।"),
        ],
    },
]

COMMON_CSS = """
:root {
  --bg: #05060f;
  --panel: rgba(18, 18, 34, 0.95);
  --panel-alt: rgba(25, 22, 48, 0.92);
  --text: #f5eee8;
  --muted: rgba(245, 238, 232, 0.72);
  --accent: #f3c159;
  --accent-soft: rgba(243, 193, 89, 0.16);
  --border: rgba(243, 193, 89, 0.14);
  --shadow: 0 30px 90px rgba(0, 0, 0, 0.28);
}
*, *::before, *::after { box-sizing: border-box; }
html { scroll-behavior: smooth; }
body {
  margin: 0;
  min-height: 100%;
  font-family: 'EB Garamond', serif;
  color: var(--text);
  background: radial-gradient(circle at top, rgba(243,193,89,0.08), transparent 22%),
              linear-gradient(180deg, #07090f 0%, #02040a 100%);
  overflow-x: hidden;
}
body::before {
  content: '';
  position: fixed;
  inset: 0;
  background: radial-gradient(circle at center, rgba(255,255,255,0.06), transparent 36%);
  pointer-events: none;
}
img { max-width: 100%; display: block; }
a { color: inherit; text-decoration: none; }
button { font: inherit; }
header { position: sticky; top: 0; z-index: 30; backdrop-filter: blur(18px); background: rgba(4, 6, 15, 0.94); border-bottom: 1px solid rgba(243,193,89,0.12); }
.header-inner { max-width: 1180px; margin: 0 auto; padding: 18px 24px; display: flex; align-items: center; justify-content: space-between; gap: 18px; }
.logo { font-family: 'Cinzel Decorative', serif; font-size: 1.35rem; letter-spacing: 1px; color: var(--accent); }
.logo em { font-style: normal; color: #f9d983; }
.nav-links { display: flex; gap: 18px; flex-wrap: wrap; align-items: center; }
.nav-links a { font-family: 'Cinzel', serif; font-size: 0.72rem; letter-spacing: 2px; text-transform: uppercase; color: rgba(245,238,232,0.75); transition: color 0.25s ease; }
.nav-links a:hover, .nav-links .active { color: var(--accent); }
.hero { position: relative; max-width: 1040px; margin: 0 auto; padding: 70px 24px 44px; text-align: center; }
.hero::after { content: ''; position: absolute; inset: 0; margin: auto; width: 580px; height: 580px; border-radius: 50%; background: radial-gradient(circle, rgba(243,193,89,0.14), transparent 52%); pointer-events: none; opacity: 0.45; }
.hero-tag { font-family: 'Cinzel', serif; font-size: 0.72rem; letter-spacing: 7px; text-transform: uppercase; color: var(--accent); margin-bottom: 18px; }
.hero h1 { font-family: 'Cinzel Decorative', serif; font-size: clamp(2.8rem, 6vw, 5rem); line-height: 1; margin: 0 auto 16px; max-width: 10ch; }
.hero-sub { font-family: 'Tiro Devanagari Sanskrit', serif; font-size: clamp(1.5rem, 3.8vw, 2.6rem); color: rgba(245,238,232,0.88); margin-bottom: 22px; }
.hero-desc { max-width: 700px; margin: 0 auto; color: var(--muted); font-size: 1.03rem; line-height: 1.8; }
.breadcrumb { max-width: 1180px; margin: 0 auto; padding: 0 24px 20px; font-family: 'Cinzel', serif; font-size: 0.72rem; letter-spacing: 1.5px; color: rgba(245,238,232,0.55); display: flex; flex-wrap: wrap; gap: 8px; }
.breadcrumb span { color: var(--accent); }
.main { max-width: 1180px; margin: 0 auto; padding: 0 24px 60px; display: grid; grid-template-columns: 1.4fr 0.9fr; gap: 34px; }
@media(max-width: 980px) { .main { grid-template-columns: 1fr; } }
.panel { background: var(--panel); border: 1px solid var(--border); border-radius: 24px; box-shadow: var(--shadow); overflow: hidden; }
.panel-header { padding: 32px 32px 24px; border-bottom: 1px solid rgba(255,255,255,0.06); }
.panel-title { font-family: 'Cinzel Decorative', serif; font-size: 1.75rem; margin-bottom: 10px; }
.panel-sub { font-family: 'Cinzel', serif; font-size: 0.78rem; letter-spacing: 2px; text-transform: uppercase; color: rgba(245,238,232,0.7); }
.panel-body { padding: 32px; display: grid; gap: 28px; }
.section { display: grid; gap: 16px; }
.section h2 { font-family: 'Cinzel Decorative', serif; font-size: 1.4rem; margin-bottom: 0; }
.section p { color: var(--muted); line-height: 1.9; }
.mantra-box { padding: 26px 28px; background: rgba(255,255,255,0.04); border: 1px solid rgba(255,255,255,0.08); border-radius: 20px; font-family: 'Tiro Devanagari Sanskrit', serif; font-size: 1.45rem; line-height: 2.3; text-align: center; }
.callout { padding: 24px 26px; background: rgba(243,193,89,0.08); border: 1px solid rgba(243,193,89,0.16); border-radius: 18px; color: var(--muted); }
.grid-list { display: grid; gap: 14px; }
.list-card { padding: 18px 20px; border-radius: 18px; background: rgba(255,255,255,0.04); border: 1px solid rgba(255,255,255,0.08); }
.list-card strong { display: block; font-family: 'Cinzel', serif; margin-bottom: 8px; }
.faq-item { border-top: 1px solid rgba(255,255,255,0.06); padding: 18px 0; }
.faq-item:first-child { border-top: none; }
.faq-item h3 { font-family: 'Cinzel', serif; font-size: 1rem; margin-bottom: 12px; }
.faq-item p { color: var(--muted); }
.sidebar { display: grid; gap: 24px; }
.widget { padding: 26px 24px; background: var(--panel-alt); border-radius: 22px; border: 1px solid rgba(255,255,255,0.06); }
.widget h3 { font-family: 'Cinzel Decorative', serif; font-size: 1.1rem; margin-bottom: 16px; }
.widget p, .widget li { color: var(--muted); }
.widget ul { list-style: none; padding: 0; margin: 0; display: grid; gap: 12px; }
.widget li { padding-left: 0; }
.widget a { display: inline-flex; gap: 10px; align-items: center; color: var(--text); }
.widget a:hover { color: var(--accent); }
.audio-widget { position: fixed; bottom: 22px; right: 22px; z-index: 40; width: min(320px, calc(100% - 32px)); background: rgba(4, 6, 18, 0.98); border: 1px solid rgba(243,193,89,0.18); border-radius: 18px; padding: 16px 18px; display: grid; grid-template-columns: auto 1fr; gap: 14px; align-items: center; box-shadow: 0 24px 80px rgba(0,0,0,0.32); }
.play-btn { width: 44px; height: 44px; border-radius: 50%; border: none; background: linear-gradient(180deg, #f3c159, #d08f2e); color: #05060f; cursor: pointer; font-size: 1.05rem; }
.audio-copy { display: grid; gap: 4px; }
.audio-copy .title { font-family: 'Cinzel', serif; font-size: 0.85rem; letter-spacing: 1px; text-transform: uppercase; color: var(--accent); }
.audio-copy .subtitle { font-size: 0.8rem; color: rgba(245,238,232,0.68); }
.footer { max-width: 1180px; margin: 0 auto; padding: 40px 24px 50px; text-align: center; color: rgba(245,238,232,0.56); }
.footer .foot-sym { display: block; font-size: 2.8rem; margin-bottom: 12px; }
.footer .foot-links { display: flex; justify-content: center; flex-wrap: wrap; gap: 18px; margin-top: 12px; }
.footer .foot-links a { font-family: 'Cinzel', serif; font-size: 0.75rem; color: rgba(245,238,232,0.72); }
@media(max-width: 740px) {
  .hero { padding-top: 52px; }
  .main { padding-bottom: 40px; }
  .audio-widget { position: static; width: auto; margin: 24px; }
}
"""

HTML_PAGE_TEMPLATE = """<!DOCTYPE html>
<html lang="hi">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>{page_title} | ShivaMarg</title>
  <meta name="description" content="{meta_description}">
  <meta name="keywords" content="{meta_keywords}">
  <meta name="robots" content="index, follow">
  <link rel="icon" type="image/png" href="/images/ShivMarg.png" />
  <meta property="og:type" content="article">
  <meta property="og:title" content="{page_title} | ShivaMarg">
  <meta property="og:description" content="{meta_description}">
  <meta property="og:url" content="{canonical}">
  <meta property="og:site_name" content="ShivaMarg">
  <meta property="og:locale" content="hi_IN">
  <meta name="twitter:card" content="summary_large_image">
  <meta name="twitter:title" content="{page_title} | ShivaMarg">
  <meta name="twitter:description" content="{meta_description}">
  <link href="https://fonts.googleapis.com/css2?family=Tiro+Devanagari+Sanskrit:ital@0;1&family=Cinzel+Decorative:wght@400;700;900&family=Cinzel:wght@400;600;900&family=EB+Garamond:ital,wght@0,400;0,500;1,400&display=swap" rel="stylesheet">
  <style>{css}</style>
</head>
<body>
<header>
  <div class="header-inner">
    <a href="/" class="logo">Shiva<em>Marg</em></a>
    <nav class="nav-links">
      <a href="/">Home</a>
      <a href="/{category_slug}/">{category_name_hi}</a>
      <a href="/about/">About</a>
      <a href="/contact/">Contact</a>
    </nav>
  </div>
</header>
<div class="breadcrumb">
  <span>Home</span>
  <span>•</span>
  <span>{category_name_hi}</span>
  <span>•</span>
  <span>{page_title_hi}</span>
</div>
<section class="hero">
  <div class="hero-tag">✦ {category_name_hi} ✦</div>
  <h1>{page_title_hi}</h1>
  <div class="hero-sub">{page_title_en}</div>
  <p class="hero-desc">{page_description}</p>
</section>
<main class="main">
  <article class="panel">
    <div class="panel-header">
      <div class="panel-title">{page_title_hi}</div>
      <div class="panel-sub">{page_title_en}</div>
    </div>
    <div class="panel-body">
      <div class="section">
        <h2>मंत्र</h2>
        <div class="mantra-box">{page_mantra}</div>
      </div>
      <div class="section">
        <h2>अर्थ और लाभ</h2>
        <p>{page_meaning}</p>
      </div>
      <div class="section">
        <h2>कैसे पढ़ें</h2>
        <div class="callout">{page_practice}</div>
      </div>
      <div class="section">
        <h2>FAQ</h2>
        <div class="faq-item"><h3>क्या यह मंत्र रोज़ाना पढ़ना चाहिए?</h3><p>यदि यह मंत्र आपके लिए प्रिय है, तो नियमितता से पढ़ना फलदायी रहता है।</p></div>
        <div class="faq-item"><h3>किस समय इसका पाठ करें?</h3><p>अधिकतर मंत्र प्रातः या संध्याकाल में शांत वातावरण में उच्चारित किए जाते हैं।</p></div>
      </div>
    </div>
  </article>
  <aside class="sidebar">
    <div class="widget">
      <h3>विषय</h3>
      <p>{category_description}</p>
    </div>
    <div class="widget">
      <h3>अन्य पृष्ठ</h3>
      <ul>
        {related_links}
      </ul>
    </div>
    <div class="widget">
      <h3>उपयोगी सुझाव</h3>
      <ul>
        <li>• शुद्ध वातावरण बनाएं</li>
        <li>• ध्यान लगाकर मंत्र उच्चारण करें</li>
        <li>• जप माला से गिनती रखें</li>
      </ul>
    </div>
  </aside>
</main>
<div class="audio-widget">
  <button id="playBtn" class="play-btn">▶</button>
  <div class="audio-copy">
    <span class="title">{audio_title}</span>
    <span class="subtitle">{audio_subtitle}</span>
  </div>
</div>
<section class="footer">
  <span class="foot-sym">✨</span>
  <div>॥ {page_title_hi} ॥ ShivaMarg</div>
  <div class="foot-links">
    <a href="/about/">About</a>
    <a href="/contact/">Contact</a>
    <a href="/privacy-policy/">Privacy</a>
    <a href="/disclaimer/">Disclaimer</a>
  </div>
</section>
<script>
  let player, isPlaying = false;
  function onYouTubeIframeAPIReady() {{
    player = new YT.Player('player', {{ videoId: 'dQw4w9WgXcQ', playerVars: {{ controls: 0, modestbranding: 1, rel: 0 }} }});
  }}
  document.addEventListener('DOMContentLoaded', function() {{
    const btn = document.getElementById('playBtn');
    btn.onclick = function() {{
      if (!player) return;
      if (!isPlaying) {{ player.playVideo(); btn.innerHTML = '⏸'; isPlaying = true; }}
      else {{ player.pauseVideo(); btn.innerHTML = '▶'; isPlaying = false; }}
    }};
  }});
</script>
<script src="https://www.youtube.com/iframe_api"></script>
<script src="/js/auth.js"></script>
<script src="/js/search.js"></script>
</body>
</html>"""

CATEGORY_INDEX_TEMPLATE = """<!DOCTYPE html>
<html lang="hi">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>{category_name_hi} संग्रह | ShivaMarg</title>
  <meta name="description" content="{category_description}">
  <link rel="icon" type="image/png" href="/images/ShivMarg.png" />
  <style>
    body{{margin:0;font-family:'EB Garamond',serif;background:#03040a;color:#f5efe6;}}
    a{{color:#f3c159;text-decoration:none;}}
    main{{max-width:860px;margin:0 auto;padding:32px;}}
    h1{{font-size:2.8rem;margin-bottom:12px;}}
    p{{color:#d2c6af;line-height:1.9;}}
    ul{{margin-top:22px;list-style:none;padding:0;display:grid;gap:14px;}}
    li{{padding:18px 22px;background:rgba(255,255,255,0.04);border:1px solid rgba(243,193,89,0.12);border-radius:16px;}}
    .link-title{{display:block;font-size:1.05rem;color:#fff;}}
    .link-desc{{color:#d1c6ab;font-size:0.94rem;}}
  </style>
</head>
<body>
<main>
  <h1>{category_name_hi} संग्रह</h1>
  <p>{category_description} इस संग्रह में {page_count} पृष्ठ शामिल हैं।</p>
  <ul>
    {link_items}
  </ul>
</main>
</body>
</html>"""


def build_related_links(category_pages, current_slug):
    links = []
    for slug, title_hi, mantra, description in category_pages:
        if slug == current_slug:
            continue
        links.append(f'<li><a href="../{slug}/">{title_hi}</a><div class="link-desc">{description}</div></li>')
    return '\n        '.join(links)


def build_category_index(category):
    link_items = '\n    '.join(
        f'<li><a href="{slug}/"><span class="link-title">{title_hi}</span><span class="link-desc">{description}</span></a></li>'
        for slug, title_hi, mantra, description in category['pages']
    )
    return CATEGORY_INDEX_TEMPLATE.format(
        category_name_hi=category['name_hi'],
        category_description=category['description'],
        page_count=len(category['pages']),
        link_items=link_items,
    )


def render_page(category, page):
    slug, title_hi, mantra, description = page
    page_title = f"{title_hi} — {category['name_en']}"
    canonical = f"{BASE_URL}/{category['slug']}/{slug}/"
    page_meaning = description
    page_practice = f"{title_hi} का नियमित अभ्यास शांति, सुरक्षा और आध्यात्मिक जागृति के लिए मधुर है।"
    page_keywords = ", ".join([title_hi, category['name_hi'], category['name_en'], slug.replace('-', ' ')])
    return HTML_PAGE_TEMPLATE.format(
        page_title=page_title,
        page_title_hi=title_hi,
        page_title_en=category['name_en'],
        page_description=description,
        page_mantra=mantra,
        page_meaning=page_meaning,
        page_practice=page_practice,
        category_slug=category['slug'],
        category_name_hi=category['name_hi'],
        category_description=category['description'],
        meta_description=description,
        meta_keywords=page_keywords,
        canonical=canonical,
        css=COMMON_CSS,
        related_links=build_related_links(category['pages'], slug),
        audio_title=title_hi,
        audio_subtitle=category['name_en'],
    )


def generate_all_pages():
    root = Path(__file__).resolve().parent
    for category in CATEGORIES:
        category_dir = root / category['slug']
        category_dir.mkdir(parents=True, exist_ok=True)
        for slug, title_hi, mantra, description in category['pages']:
            page_dir = category_dir / slug
            page_dir.mkdir(parents=True, exist_ok=True)
            html = render_page(category, (slug, title_hi, mantra, description))
            with open(page_dir / 'index.html', 'w', encoding='utf-8') as f:
                f.write(html)
            print(f"Created: {page_dir / 'index.html'}")

        with open(category_dir / 'index.html', 'w', encoding='utf-8') as f:
            f.write(build_category_index(category))
        print(f"Created category root: {category_dir / 'index.html'}")


if __name__ == '__main__':
    generate_all_pages()
