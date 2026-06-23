# शिव मार्ग — Article Template Fill Guide (README)

This file lists every place in `article-template.html` that needs to be edited for a **new article**. Use this as a checklist — or paste it directly to an LLM along with your article content/topic, so it fills the template consistently every time.

---

## 🧠 Prompt block (copy-paste this to an LLM)

```
I have an HTML article template for my Hindi blog "शिव मार्ग".
I will give you a topic/content, and you must output ONLY the values for
each EDIT ZONE listed below — do not change any CSS, layout, or JS logic.

Topic: [PASTE YOUR TOPIC/CONTENT HERE]

Fill in:
1. Page <title>, meta description, og:title, og:description, og:image,
   og:url, twitter:title, twitter:description, twitter:image, canonical URL
2. Breadcrumb category name + link
3. Tag row (category tag)
4. <h1> article title
5. Author bar: author initial, author name, author profile slug, date, view count
6. Banner image path
7. Full article body (intro, h2 sections, blockquote, h3 subsection, conclusion)
8. Bottom tags (3-5 related keywords)
9. Sidebar author card (initial, name, slug, short bio)
10. STATIC_PAGE_ID (a unique URL-safe slug for comments, e.g. "mahashivratri-mahatva")

Keep tone, language (Hindi/Devanagari), and structure consistent with a
spiritual/philosophical blog. Output each as clearly labeled sections.
```

---

## ✏️ Edit Zones Reference

| Zone | Location in file | What to fill |
|------|------------------|--------------|
| **1. Page Meta** | `<head>` top | `<title>`, `meta description`, `og:title`, `og:description`, `og:image`, `og:url`, `og:type`, `twitter:title`, `twitter:description`, `twitter:image`, `canonical` href |
| **2. Breadcrumb** | Top of `<main>` | Category link + label, final breadcrumb text = article title (short) |
| **3. Tag row (top)** | Below breadcrumb | Category tag link + active tag label |
| **4. Title** | `<h1 class="article-title">` | Full article headline |
| **5. Author bar** | Below title | Author initial letter (or swap to `<img>` avatar), author name, author profile slug (`/author/?slug=...`), publish date, view count (or remove) |
| **6. Banner image** | `<img class="article-banner">` | Path/URL to banner image (or delete the tag if no banner) |
| **7. Article body** | `<article class="article-body">` | Full content: intro paragraph, `<h2>` sections, `<blockquote>` quote, `<em>` emphasis, `<h3>` subsection, optional `<img>`, `<hr>`, conclusion |
| **8. Bottom tags** | Below article body | 3–5 related keyword tags with links |
| **9. Sidebar author card** | `<aside>` → `#authorCard` | Author initial/avatar, name, slug, short bio sentence |
| **10. STATIC_PAGE_ID** | `<script>` near bottom | Unique URL-safe slug for comment thread (e.g. `mahashivratri-mahatva`) — must be unique per article |

---

## ⚠️ Do NOT touch (already dynamic/working)

- Header, nav, mobile menu, search overlay, auth modal — all dynamic, no per-article edits needed
- Sidebar: Popular Posts, Latest Posts, Newsletter block — auto-loaded via API
- Comments system — auto-loaded via API, only needs `STATIC_PAGE_ID` set correctly
- Share bar — auto-generates from current page title/URL
- All `<style>` CSS and `<script>` JS logic — shared across all articles

---

## ✅ Quick checklist before publishing

- [ ] All 10 edit zones filled
- [ ] `STATIC_PAGE_ID` is unique (not reused from another article)
- [ ] `og:url` and `canonical` match the final live URL
- [ ] Banner image path is correct and image exists (or tag removed)
- [ ] No leftover placeholder text like "यहाँ अपना..." anywhere
- [ ] Author slug links to a real author page