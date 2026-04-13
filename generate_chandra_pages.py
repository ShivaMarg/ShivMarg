from pathlib import Path
import json
import os

root = Path('Chandra-mantras')
if not root.exists():
    root.mkdir(parents=True, exist_ok=True)

pages = [
    {'slug':'chandra-kavach','title_hi':'चन्द्र कवच','title_en':'Chandra Kavach','tag':'चंद्र कवच','headline':'चन्द्र कवचम् — Moon Protection Shield','description':'चन्द्रदेव की दिव्य कवच रचना। यह चन्द्र कवच आपके मन को शांति, सुरक्षा और दिव्य ऊर्जा प्रदान करता है।','preview':'चन्द्र कवच — चंद्र देव की रक्षा स्तुति।','keywords':['चन्द्र कवच','chandra kavach','moon kavach','protection mantra']},
    {'slug':'chandra-beej-mantra','title_hi':'चन्द्र बीज मंत्र','title_en':'Chandra Beej Mantra','tag':'बीज मंत्र','headline':'चन्द्र बीज मंत्र — Lunar Seed Mantra','description':'चन्द्र बीज मंत्र से चन्द्र देव की शक्तियों का आह्वान करें। यह मंत्र मानसिक शुद्धि और भावनात्मक संतुलन में सहायक है।','preview':'चन्द्र बीज मंत्र — चन्द्र देव की साधना के लिए।','keywords':['चन्द्र बीज','chandra beej','moon seed mantra','soma mantra']},
    {'slug':'chandra-chalisa','title_hi':'चन्द्र चालीसा','title_en':'Chandra Chalisa','tag':'चालीसा','headline':'चन्द्र चालीसा — 40 चौपाइयां','description':'चन्द्र चालीसा में चन्द्र देव की महिमा और गुणों का वर्णन है। इसे गुन-गुनाकर जीवन में शांति और प्रेम बढ़ाएँ।','preview':'चन्द्र चालीसा — सरल चालीसा पाठ।','keywords':['चन्द्र चालीसा','chandra chalisa','chalisa','moon devotion']},
    {'slug':'chandra-gayatri-mantra','title_hi':'चन्द्र गायत्री मंत्र','title_en':'Chandra Gayatri Mantra','tag':'गायत्री','headline':'चन्द्र गायत्री मंत्र — Lunar Gayatri','description':'चन्द्र गायत्री मंत्र का जाप अंश, ध्यान और आध्यात्मिक जागृति के लिए बहुत शुभ माना जाता है।','preview':'चन्द्र गायत्री — आदित्य गायत्री की तरह अनुष्ठान।','keywords':['चन्द्र गायत्री','chandra gayatri','gayatri mantra','moon mantra']},
    {'slug':'chandra-aarti','title_hi':'चन्द्र आरती','title_en':'Chandra Aarti','tag':'आरती','headline':'चन्द्र आरती — Divine Moon Hymn','description':'चन्द्र आरती से चन्द्रदेव को प्रणाम करें। यह आरती भाव-निवेदन और भक्ति को जोड़ती है।','preview':'चन्द्र आरती — आरती पाठ और भजन।','keywords':['चन्द्र आरती','chandra aarti','moon aarti','aarti mantra']},
    {'slug':'som-stotra','title_hi':'सोम स्तोत्र','title_en':'Som Stotra','tag':'स्तोत्र','headline':'सोम स्तोत्र — Hymn to the Moon','description':'सोम स्तोत्र चन्द्रदेव के गुणों का स्तुति गीत है। इसे पाठ करने से भावनात्मक संतुलन और चंद्र की कृपा मिलती है।','preview':'सोम स्तोत्र — चन्द्र देव की स्तुति।','keywords':['सोम स्तोत्र','som stotra','moon stotra','chandra stotra']},
    {'slug':'chandra-ashtakam','title_hi':'चन्द्र अष्टकम्','title_en':'Chandra Ashtakam','tag':'अष्टकम्','headline':'चन्द्र अष्टकम् — Eight Verses of Moon','description':'चन्द्र अष्टकम् आठ पदों में चन्द्र देव की महिमा कहता है। यह उच्चारित करने से चंद्र की अनुकम्पा होती है।','preview':'चन्द्र अष्टकम् — आठ श्लोक।','keywords':['चन्द्र अष्टकम्','chandra ashtakam','ashtakam','moon verses']},
    {'slug':'chandra-namaskar-mantra','title_hi':'चन्द्र नमस्कार मंत्र','title_en':'Chandra Namaskar Mantra','tag':'नमस्कार','headline':'चन्द्र नमस्कार मंत्र — Salutation to the Moon','description':'चन्द्र नमस्कार मंत्र से चन्द्र देव को आदर प्रकट करें। यह ध्यान व पूजा के पूर्व शुद्ध मन प्रदान करता है।','preview':'चन्द्र नमस्कार — प्रणाम मंत्र।','keywords':['चन्द्र नमस्कार','chandra namaskar','moon greeting','salutation mantra']},
    {'slug':'vedic-som-mantra','title_hi':'वैदिक सोम मंत्र','title_en':'Vedic Som Mantra','tag':'वैदिक मंत्र','headline':'वैदिक सोम मंत्र — Ancient Moon Invocation','description':'वैदिक सोम मंत्र प्राचीन ऋषियों द्वारा कहा गया चन्द्र पाठ है। यह मंत्र ज्ञान, स्मृति और स्वास्थ्य के लिए उत्तम है।','preview':'वैदिक सोम मंत्र — प्राचीन चंद्र मंत्र।','keywords':['वैदिक सोम मंत्र','vedic som','moon invocation','vedic mantra']},
    {'slug':'chandra-108-names','title_hi':'चन्द्र 108 नाम','title_en':'Chandra 108 Names','tag':'108 नाम','headline':'चन्द्र 108 नाम — Hundred and Eight Names','description':'चन्द्र देव के 108 नामों का जाप शुभ माना जाता है। यह नामावलि आत्मा को शीतलता और संतुलन देती है।','preview':'चन्द्र 108 नाम — नामावलि।','keywords':['चन्द्र 108 नाम','chandra 108 names','names of moon','ashtottara names']},
    {'slug':'chandra-stotram','title_hi':'चन्द्र स्तोत्रम्','title_en':'Chandra Stotram','tag':'स्तोत्रम्','headline':'चन्द्र स्तोत्रम् — Moon Hymn','description':'चन्द्र स्तोत्रम् चन्द्र देव की महिमा विस्तार से बताता है। इसे पढ़ने से मन में आनन्द और शान्ति आती है।','preview':'चन्द्र स्तोत्रम् — दिव्य स्तुति।','keywords':['चन्द्र स्तोत्रम्','chandra stotram','moon hymn','stotra']},
    {'slug':'chandra-sahasranama','title_hi':'चन्द्र सहस्रनाम','title_en':'Chandra Sahasranama','tag':'सहस्रनाम','headline':'चन्द्र सहस्रनाम — Thousand Names of Moon','description':'चन्द्र सहस्रनाम चन्द्र देव के हजार नामों का संकलन है। यह पाठ आध्यात्मिक समृद्धि और रक्षा के लिए उपयोगी है।','preview':'चन्द्र सहस्रनाम — हज़ार नाम।','keywords':['चन्द्र सहस्रनाम','chandra sahasranama','1000 names','moon names']},
    {'slug':'karwa-chauth-mantra','title_hi':'करवा चौथ मंत्र','title_en':'Karwa Chauth Mantra','tag':'व्रत','headline':'करवा चौथ मंत्र — Vrat Chant','description':'करवा चौथ के व्रत में यह चन्द्र मंत्र विशेष फलदायी है। विवाहित महिलाओं के लिए इसकी महिमा अपार है।','preview':'करवा चौथ मंत्र — व्रत मंत्र।','keywords':['करवा चौथ मंत्र','karwa chauth mantra','vrat mantra','moon vrat']},
    {'slug':'chandra-graha-shanti','title_hi':'चन्द्र ग्रह शांति','title_en':'Chandra Graha Shanti','tag':'ग्रह शांति','headline':'चन्द्र ग्रह शांति — Moon Planetary Peace','description':'चन्द्र ग्रह शांति से चंद्र ग्रह की नकारात्मकता दूर होती है और जीवन में भावनात्मक स्थिरता आती है।','preview':'चन्द्र ग्रह शांति — ग्रह शांति पूजा।','keywords':['चन्द्र ग्रह शांति','chandra graha shanti','moon planetary peace','graha shanti']},
    {'slug':'som-panchakshara','title_hi':'सोम पंचाक्षर','title_en':'Som Panchakshara','tag':'पंचाक्षर','headline':'सोम पंचाक्षर मंत्र — Five Syllable Mantra','description':'सोम पंचाक्षर मंत्र चंद्र देव को प्रणाम करने का शक्तिशाली मंत्र है। इसे सरलता से उच्चारित करें।','preview':'सोम पंचाक्षर — पंचाक्षरी मंत्र।','keywords':['सोम पंचाक्षर','som panchakshara','five syllable','moon mantra']},
    {'slug':'chandra-vandana','title_hi':'चन्द्र वंदना','title_en':'Chandra Vandana','tag':'वंदना','headline':'चन्द्र वंदना — Prayer to the Moon','description':'चन्द्र वंदना से चन्द्र देव की कृपा और आशीर्वाद की प्रार्थना की जाती है। यह शांति व सकारात्मकता बढ़ाती है।','preview':'चन्द्र वंदना — वंदना पाठ।','keywords':['चन्द्र वंदना','chandra vandana','moon prayer','vandana']},
    {'slug':'chandra-puja-vidhi-mantra','title_hi':'चन्द्र पूजा विधि','title_en':'Chandra Puja Vidhi','tag':'पूजा विधि','headline':'चन्द्र पूजा विधि — Moon Worship Guide','description':'चन्द्र पूजा विधि में मंत्र, विधि और सामग्री का विवरण है। इसका पालन करने से पूजा सफल होती है।','preview':'चन्द्र पूजा विधि — पूजा निर्देश।','keywords':['चन्द्र पूजा विधि','chandra puja vidhi','moon worship','puja guide']},
    {'slug':'chandra-mangalacharan','title_hi':'चन्द्र मंगलाचारण','title_en':'Chandra Mangalacharan','tag':'मंगलाचारण','headline':'चन्द्र मंगलाचारण — Auspicious Invocation','description':'चन्द्र मंगलाचारण से पाठ की शुरुआत होती है। यह मंत्र विधि में मंगल और शुभ ऊर्जा लाता है।','preview':'चन्द्र मंगलाचारण — मंगल पाठ।','keywords':['चन्द्र मंगलाचारण','chandra mangalacharan','invocation','auspicious']},
    {'slug':'chandra-namaskara-stotram','title_hi':'चन्द्र नमस्कार स्तोत्रम्','title_en':'Chandra Namaskara Stotram','tag':'स्तोत्रम्','headline':'चन्द्र नमस्कार स्तोत्रम् — Salutation Hymn','description':'चन्द्र नमस्कार स्तोत्रम् चन्द्र देव को आदरपूर्वक पूजा जाता है। यह श्लोक भावुकता एवं भक्ति बढ़ाते हैं।','preview':'चन्द्र नमस्कार स्तोत्रम् — स्तोत्र।','keywords':['चन्द्र नमस्कार स्तोत्रम्','chandra namaskara stotram','salutation stotram','moon hymn']},
    {'slug':'sharad-purnima-mantra','title_hi':'शरद पूर्णिमा मंत्र','title_en':'Sharad Purnima Mantra','tag':'व्रत','headline':'शरद पूर्णिमा मंत्र — Autumn Moon Prayer','description':'शरद पूर्णिमा मंत्र से पूर्णिमा के पावन अर्चन का महत्व बढ़ता है। यह आशीर्वाद, स्वास्थ्य और समृद्धि देता है।','preview':'शरद पूर्णिमा मंत्र — विशेष पूजन मंत्र।','keywords':['शरद पूर्णिमा मंत्र','sharad purnima mantra','full moon vrat','moon festival']},
    {'slug':'chandra-dwadasha-nama','title_hi':'चन्द्र द्वादश नाम','title_en':'Chandra Dwadasha Nama','tag':'नाम','headline':'चन्द्र द्वादश नाम — 12 Names of Moon','description':'चन्द्र द्वादश नाम चन्द्र देव के बारह पावन नाम हैं। इन नामों के जाप से शीतलता व मानसिक संतुलन मिलता है।','preview':'चन्द्र द्वादश नाम — बारह नाम।','keywords':['चन्द्र द्वादश नाम','chandra dwadasha nama','12 names','moon names']},
    {'slug':'chandra-vrat-katha','title_hi':'चन्द्र व्रत कथा','title_en':'Chandra Vrat Katha','tag':'कथा','headline':'चन्द्र व्रत कथा — Moon Vrat Story','description':'चन्द्र व्रत कथा में चंद्र देव से जुड़े पौराणिक व्रत की कथा मिलती है। यह कथा व्रत को अर्थपूर्ण बनाती है।','preview':'चन्द्र व्रत कथा — पौराणिक कथा।','keywords':['चन्द्र व्रत कथा','chandra vrat katha','vow story','moon fast']},
    {'slug':'chandra-pratah-smarana','title_hi':'चन्द्र प्रातः स्मरण','title_en':'Chandra Pratah Smarana','tag':'प्रातः स्मरण','headline':'चन्द्र प्रातः स्मरण — Morning Moon Remembrance','description':'चन्द्र प्रातः स्मरण से सुबह की चंद्र पूजा को समृद्ध बनाएं। यह ध्यान और स्मृति को पुष्ट करता है।','preview':'चन्द्र प्रातः स्मरण — सुबह मंत्र।','keywords':['चन्द्र प्रातः स्मरण','chandra pratah smarana','morning prayer','moon remembrance']},
    {'slug':'chandra-tantra-mantra','title_hi':'चन्द्र तंत्र मंत्र','title_en':'Chandra Tantra Mantra','tag':'तंत्र','headline':'चन्द्र तंत्र मंत्र — Lunar Tantra Chant','description':'चन्द्र तंत्र मंत्र से चन्द्रदेव की ऊर्जा को साधना में लाया जा सकता है। यह मंत्र गोपनीय शक्ति का संचार करता है।','preview':'चन्द्र तंत्र मंत्र — तांत्रिक मंत्र।','keywords':['चन्द्र तंत्र मंत्र','chandra tantra mantra','tantra','moon ritual']},
    {'slug':'chandra-upanishad-shloka','title_hi':'चन्द्र उपनिषद् श्लोक','title_en':'Chandra Upanishad Shloka','tag':'उपनिषद्','headline':'चन्द्र उपनिषद् श्लोक — Moon Wisdom Verse','description':'चन्द्र उपनिषद् श्लोक में आध्यात्मिक ज्ञान और शांति का संचार है। यह श्लोक व्यक्ति को सशक्त बनाता है।','preview':'चन्द्र उपनिषद् श्लोक — विद्युतीय श्लोक।','keywords':['चन्द्र उपनिषद् श्लोक','chandra upanishad','moon wisdom','shloka']},
    {'slug':'chandra-jyoti-mantra','title_hi':'चन्द्र ज्योति मंत्र','title_en':'Chandra Jyoti Mantra','tag':'ज्योति','headline':'चन्द्र ज्योति मंत्र — Moonlight Invocation','description':'चन्द्र ज्योति मंत्र चन्द्र की रोशनी एवं शीतलता को बुलाता है। यह साधना मन को प्रकाशमय करती है।','preview':'चन्द्र ज्योति मंत्र — ज्योति मंत्र।','keywords':['चन्द्र ज्योति मंत्र','chandra jyoti mantra','moonlight','jyoti']},
    {'slug':'karwa-chauth-vrat-katha','title_hi':'करवा चौथ व्रत कथा','title_en':'Karwa Chauth Vrat Katha','tag':'व्रत कथा','headline':'करवा चौथ व्रत कथा — Karwa Chauth Story','description':'करवा चौथ व्रत कथा चन्द्र पूजा एवं व्रत से जुड़ी कथा कहती है। यह व्रत के अर्थ को गहरा बनाती है।','preview':'करवा चौथ व्रत कथा — कथा पाठ।','keywords':['करवा चौथ व्रत कथा','karwa chauth vrat katha','vow story','moon fast']},
]

css = '''
    :root {
      --bg: #04060f;
      --panel: rgba(8,16,38,0.92);
      --panel-soft: rgba(18,28,56,0.9);
      --text: #f6f4ee;
      --muted: rgba(246,244,238,0.7);
      --accent: #8cb7ff;
      --accent-2: #d6c87d;
      --glow: rgba(140,183,255,0.18);
      --shadow: 0 24px 70px rgba(0,0,0,0.32);
    }
    *,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
    html{scroll-behavior:smooth}
    body{min-height:100vh;background:radial-gradient(circle at top, rgba(142,175,255,0.08), transparent 34%),linear-gradient(180deg, #081020 0%, #02050b 100%);color:var(--text);font-family:'EB Garamond',serif;line-height:1.7;overflow-x:hidden}
    body::before{content:'';position:fixed;inset:0;background:url('data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="300" height="300"%3E%3Ccircle cx="150" cy="150" r="148" fill="none" stroke="rgba(140,183,255,0.04)" stroke-width="1"/%3E%3C/path%3E%3C/svg%3E') repeat;opacity:0.08;pointer-events:none}
    a{color:inherit;text-decoration:none}
    header{position:relative;z-index:10;padding:22px 24px 0;max-width:1180px;margin:0 auto}
    .site-nav{display:flex;justify-content:space-between;align-items:center;gap:18px;flex-wrap:wrap}
    .site-nav .logo{font-family:'Cinzel Decorative',serif;font-size:1.35rem;color:var(--accent-2)}
    .site-nav .logo em{font-style:normal;color:var(--accent)}
    .site-nav nav{display:flex;gap:18px;align-items:center;flex-wrap:wrap}
    .site-nav nav a{font-family:'Cinzel',serif;font-size:.72rem;letter-spacing:2px;text-transform:uppercase;color:rgba(246,244,238,0.75);transition:color .25s}
    .site-nav nav a:hover,.site-nav nav a.active{color:var(--accent)}
    .nav-back{font-family:'Cinzel',serif;font-size:.72rem;letter-spacing:1.8px;color:rgba(246,244,238,0.68);padding:9px 16px;border:1px solid rgba(140,183,255,0.18);border-radius:999px;transition:background .25s}
    .nav-back:hover{background:rgba(140,183,255,0.08)}
    .breadcrumb{max-width:1180px;margin:18px auto 0;font-family:'Cinzel',serif;font-size:.74rem;letter-spacing:2px;color:rgba(246,244,238,0.5);display:flex;flex-wrap:wrap;gap:8px}
    .breadcrumb span{color:var(--accent)}
    .hero{position:relative;z-index:10;padding:64px 24px 36px;text-align:center;max-width:980px;margin:0 auto}
    .hero::after{content:'';position:absolute;left:50%;top:10%;transform:translateX(-50%);width:420px;height:420px;border-radius:50%;background:radial-gradient(circle,rgba(140,183,255,0.18),transparent 65%);filter:blur(28px);pointer-events:none}
    .hero-tag{font-family:'Cinzel',serif;font-size:.72rem;letter-spacing:6px;color:var(--accent);text-transform:uppercase;margin-bottom:18px}
    .hero h1{font-family:'Cinzel Decorative',serif;font-size:clamp(2.4rem,5vw,4.5rem);line-height:1.03;color:#f7f4ec;margin-bottom:12px}
    .hero-sub{font-family:'Tiro Devanagari Sanskrit',serif;font-size:clamp(1.6rem,3.5vw,2.6rem);color:rgba(246,244,238,0.88);margin-bottom:20px}
    .hero-desc{max-width:720px;margin:0 auto;font-size:1.03rem;color:var(--muted);line-height:1.85}
    .hero-meta{display:inline-flex;gap:12px;margin-top:24px;flex-wrap:wrap;justify-content:center}
    .meta-pill{font-family:'Cinzel',serif;font-size:.68rem;letter-spacing:2px;text-transform:uppercase;padding:10px 16px;border:1px solid rgba(140,183,255,0.18);border-radius:999px;color:rgba(246,244,238,0.84);background:rgba(255,255,255,0.02)}
    .main{position:relative;z-index:10;max-width:1180px;margin:0 auto;padding:8px 24px 60px}
    .grid{display:grid;grid-template-columns:1.4fr .9fr;gap:34px;align-items:start}
    @media(max-width:900px){.grid{grid-template-columns:1fr}}
    .panel{background:var(--panel);border:1px solid rgba(140,183,255,0.12);border-radius:24px;box-shadow:var(--shadow);overflow:hidden;}
    .panel-header{padding:32px 32px 24px;border-bottom:1px solid rgba(140,183,255,0.08)}
    .panel-title{font-family:'Cinzel Decorative',serif;font-size:1.8rem;color:var(--accent-2);margin-bottom:8px}
    .panel-sub{font-family:'Cinzel',serif;font-size:.86rem;letter-spacing:2px;text-transform:uppercase;color:var(--accent);margin-bottom:16px}
    .panel-text{color:var(--muted);font-size:1rem;line-height:1.85}
    .content-block{padding:32px;display:grid;gap:28px}
    .section{padding:0 0 0}
    .section h2{font-family:'Cinzel Decorative',serif;font-size:1.55rem;color:#f8f6f0;margin-bottom:14px}
    .section p{color:var(--muted);margin-bottom:18px}
    .stanza{padding:24px 28px;border-radius:20px;background:rgba(255,255,255,0.03);border:1px solid rgba(140,183,255,0.1);font-family:'Tiro Devanagari Sanskrit',serif;font-size:1.08rem;line-height:2.1;color:#f9f8f2}
    .note-card{display:grid;gap:16px;background:rgba(255,255,255,0.02);border:1px solid rgba(140,183,255,0.1);border-radius:20px;padding:26px}
    .note-card strong{display:block;color:var(--accent);font-size:.95rem;margin-bottom:8px}
    .audio-widget{position:fixed;bottom:20px;right:20px;background:rgba(4,8,24,0.96);border:1px solid rgba(140,183,255,0.18);backdrop-filter:blur(12px);border-radius:18px;padding:14px 16px;display:flex;align-items:center;gap:14px;max-width:320px;z-index:20}
    .play-btn{width:42px;height:42px;border-radius:50%;border:none;background:linear-gradient(180deg,#8cb7ff,#517dd8);color:#081028;font-size:1rem;cursor:pointer;box-shadow:0 16px 30px rgba(0,0,0,0.24)}
    .audio-title{font-family:'Cinzel',serif;font-size:.88rem;letter-spacing:.8px;color:#f7f5f0}
    .audio-sub{font-size:.78rem;color:rgba(246,244,238,0.62)}
    .footer{max-width:1180px;margin:0 auto;padding:44px 24px 28px;text-align:center;color:rgba(246,244,238,0.55)}
    .foot-sym{display:block;font-size:3rem;margin-bottom:12px}
    .foot-links{display:flex;justify-content:center;gap:20px;flex-wrap:wrap;padding-top:12px}
    .foot-links a{font-size:.84rem;color:rgba(246,244,238,0.65)}
    .footer p{margin-top:12px;font-size:.82rem;color:rgba(246,244,238,0.46)}
    .comment-shell{margin-top:28px}
    #player{width:0;height:0;overflow:hidden}
'''

def make_html(item):
    slug = item['slug']
    name_hi = item['title_hi']
    name_en = item['title_en']
    tag = item['tag']
    headline = item['headline']
    description = item['description']
    preview = item['preview']
    keywords = ', '.join(item['keywords'])
    audio_title = f"{name_en} • Chandra Mantra"
    audio_sub = f"{name_hi} • {name_en}"
    canonical = f"https://www.shivmarg.live/Chandra-mantras/{slug}/"
    page_id = slug
    return f'''<!DOCTYPE html>
<html lang="hi">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>{name_hi} — {name_en} | ShivaMarg</title>
  <meta name="description" content="{description}">
  <meta name="keywords" content="{keywords}">
  <meta name="author" content="ShivaMarg">
  <meta name="robots" content="index, follow">
  <link rel="canonical" href="{canonical}">
  <meta property="og:title" content="{name_hi} — {name_en} | ShivaMarg">
  <meta property="og:description" content="{preview}">
  <meta property="og:type" content="article">
  <meta property="og:url" content="{canonical}">
  <meta property="og:site_name" content="ShivaMarg">
  <meta property="og:locale" content="hi_IN">
  <meta name="twitter:card" content="summary_large_image">
  <meta name="twitter:title" content="{name_hi} — {name_en} | ShivaMarg">
  <meta name="twitter:description" content="{preview}">
  <link rel="icon" type="image/png" href="/images/ShivMarg.png" />
  <script async src="https://www.googletagmanager.com/gtag/js?id=AW-18008418302"></script>
  <script>
    window.dataLayer = window.dataLayer || [];
    function gtag(){{dataLayer.push(arguments);}}
    gtag('js', new Date());
    gtag('config', 'AW-18008418302');
  </script>
  <link href="https://fonts.googleapis.com/css2?family=Tiro+Devanagari+Sanskrit:ital@0;1&family=Cinzel+Decorative:wght@400;700;900&family=Cinzel:wght@400;600;900&family=EB+Garamond:ital,wght@0,400;0,500;1,400&display=swap" rel="stylesheet">
  <style>{css}</style>
</head>
<body>
<header>
  <div class="site-nav">
    <a href="/" class="logo">Shiva<em>Marg</em></a>
    <nav>
      <a href="/Chandra-mantras/" class="active">चंद्र मंत्र</a>
      <a href="/about/">About</a>
      <a href="/contact/">Contact</a>
      <a href="/privacy-policy/">Privacy</a>
      <a href="/disclaimer/">Disclaimer</a>
    </nav>
    <a href="/" class="nav-back">← सभी देवता</a>
  </div>
  <div class="breadcrumb"><span>Home</span> • <span>Chandra Mantras</span> • <span>{name_hi}</span></div>
</header>
<main class="hero">
  <div class="hero-tag">✦ चंद्र भक्ति संग्रह ✦</div>
  <h1>{name_hi}</h1>
  <div class="hero-sub">{name_en}</div>
  <p class="hero-desc">{description} इस पृष्ठ पर आप {name_hi} का सरल पाठ, निर्देश, और चंद्र देव से जुड़ी जानकारी पाएँगे।</p>
  <div class="hero-meta">
    <span class="meta-pill">{tag}</span>
    <span class="meta-pill">Chandra Mantras</span>
    <span class="meta-pill">ShivaMarg</span>
  </div>
</main>
<section class="main">
  <div class="grid">
    <article class="panel">
      <div class="panel-header">
        <div class="panel-title">{headline}</div>
        <div class="panel-sub">{name_hi} • {name_en}</div>
      </div>
      <div class="content-block">
        <div class="section">
          <h2>मंत्र की महिमा</h2>
          <p>{name_hi} का नियमित पाठ भावनात्मक संतुलन, ध्यान शक्ति और मानसिक शांति बढ़ाता है। यह मंत्र चन्द्र की शीतल शक्ति का आह्वान करता है।</p>
          <p>यह अभ्यास विशेष रूप से सोमवार, पूर्णिमा और ग्रह शान्ति के अवसर पर किया जाना फलदायी माना जाता है।</p>
        </div>
        <div class="section">
          <h2>पाठ</h2>
          <div class="stanza">ॐ सों सोमाय नमः।<br>ॐ चंद्राय नमः।<br>ॐ सोम सोमाय नमः॥</div>
        </div>
        <div class="section note-card">
          <strong>कृपया ध्यान दें</strong>
          <p>मंत्र का उच्चारण स्पष्ट आराधना और एकाग्रचित्तता के साथ करें। यदि आप पहली बार पाठ कर रहे हैं तो श्लोक को धीरे-धीरे पढ़ें और अर्थ पर ध्यान दें।</p>
        </div>
      </div>
    </article>
    <aside class="panel">
      <div class="content-block">
        <div class="section">
          <h2>रसोई संकेत</h2>
          <p>चन्द्र पाठ के समय शांत वातावरण बनाएं, दीपक जलाएँ और शीतलता का अनुभव करें।</p>
        </div>
        <div class="section">
          <h2>आप उपयोग कर सकते हैं</h2>
          <ul style="color:var(--muted);list-style:none;display:grid;gap:10px;padding-left:0;font-size:0.98rem">
            <li>• गंध दीपक</li>
            <li>• चंदन तिलक</li>
            <li>• शीतल जल</li>
          </ul>
        </div>
      </div>
    </aside>
  </div>
  <div class="comment-shell">
    <div id="sm-comments" data-page-id="{page_id}"></div>
  </div>
</section>
<footer class="footer">
  <span class="foot-sym">🌙</span>
  <div>॥ {name_hi} ॥ ShivaMarg ॥ © ShivaMarg 2026 || ShivMarg.live</div>
  <div class="foot-links">
    <a href="/">Home</a>
    <a href="/about/">About</a>
    <a href="/contact/">Contact</a>
    <a href="/privacy-policy/">Privacy Policy</a>
    <a href="/disclaimer/">Disclaimer</a>
  </div>
  <p>ॐ सों सोमाय नमः ॥</p>
</footer>
<div class="audio-widget">
  <button id="playBtn" class="play-btn">▶</button>
  <div>
    <div class="audio-title">{audio_title}</div>
    <div class="audio-sub">{audio_sub}</div>
  </div>
</div>
<div id="player"></div>
<script>
  let player,isPlaying=false;
  function onYouTubeIframeAPIReady(){{
    player=new YT.Player('player',{{videoId:'dQw4w9WgXcQ',playerVars:{{controls:0,modestbranding:1,rel:0}}}});
  }}
  document.addEventListener('DOMContentLoaded',function(){{
    const btn=document.getElementById('playBtn');
    btn.onclick=function(){{
      if(!player) return;
      if(!isPlaying){{player.playVideo();btn.innerHTML='⏸';isPlaying=true;}} else {{player.pauseVideo();btn.innerHTML='▶';isPlaying=false;}}
    }};
  }});
</script>
<script src="https://www.youtube.com/iframe_api"></script>
<script src="/js/auth2.js"></script>
<script src="/js/s-comments.js"></script>
<script src="/js/nav.js"></script>
<script src="/js/search.js"></script>
<script>
  const SM_API = 'https://shivamargbackend.onrender.com';
  SmComments.init({{ apiBase: SM_API }});
</script>
</body>
</html>'''

for item in pages:
    page_dir = root / item['slug']
    page_dir.mkdir(parents=True, exist_ok=True)
    html = make_html(item)
    with open(page_dir / 'index.html', 'w', encoding='utf-8') as f:
        f.write(html)

# update sitemap.xml
sitemap_path = Path('sitemap.xml')
if sitemap_path.exists():
    text = sitemap_path.read_text(encoding='utf-8')
    anchor = '  <url>\n    <loc>https://www.shivmarg.live/Chandra-mantras/chandra-kavach/</loc>'
    idx = text.find(anchor)
    if idx != -1:
        end = text.find('</url>', idx)
        if end != -1:
            end = text.find('</url>', end) + len('</url>')
            before = text[:end]
            after = text[end:]
            new_entries = []
            existing_slugs = {'chandra-aarti','chandra-ashtakam','chandra-beej-mantra','chandra-chalisa','chandra-gayatri-mantra','chandra-kavach'}
            missing = [p for p in pages if p['slug'] not in existing_slugs]
            for item in missing:
                url = f"https://www.shivmarg.live/Chandra-mantras/{item['slug']}/"
                entry = f"\n  \n  <url>\n    <loc>{url}</loc>\n    <priority>0.75</priority>\n    <changefreq>daily</changefreq>\n  </url>"
                new_entries.append(entry)
            new_text = before + ''.join(new_entries) + after
            sitemap_path.write_text(new_text, encoding='utf-8')

# update search-index.json
search_path = Path('search-index.json')
if search_path.exists():
    with open(search_path, 'r', encoding='utf-8') as f:
        data = json.load(f)
    existing_urls = {entry['url'] for entry in data if 'url' in entry}
    for item in pages:
        entry = {
            'title': item['title_hi'],
            'titleEng': item['title_en'],
            'url': f"/Chandra-mantras/{item['slug']}/",
            'category': 'चंद्र',
            'symbol': '🌙',
            'preview': item['preview'],
            'keywords': item['keywords']
        }
        if entry['url'] not in existing_urls:
            data.append(entry)
            existing_urls.add(entry['url'])
    with open(search_path, 'w', encoding='utf-8') as f:
        json.dump(data, f, ensure_ascii=False, indent=2)

print('generated', len(pages), 'chandra pages')