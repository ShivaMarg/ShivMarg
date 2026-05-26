/**
 * Suggested Posts Module
 * Fetches latest posts, popular articles, and latest articles from backend
 */

const SuggestedPosts = (() => {
  const API_BASE = 'https://shivamargbackend.onrender.com';
  const POSTS_LIMIT = 4;

  /**
   * Fetch latest articles from backend (sorted by created_at DESC)
   */
  async function fetchLatestArticles() {
    try {
      const url = `${API_BASE}/api/articles/latest?limit=${POSTS_LIMIT}`;
      const response = await fetch(url, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' }
      });

      if (!response.ok) throw new Error(`Server responded with status: ${response.status}`);
      const data = await response.json();
      let articles = data.articles || data || [];
      
      if (articles && articles.length > 0) {
        articles.sort((a, b) => {
          const dateA = new Date(a.created_at || a.date || 0);
          const dateB = new Date(b.created_at || b.date || 0);
          return dateB - dateA;
        });
      }
      return articles;
    } catch (error) {
      console.error('Error fetching latest articles:', error);
      return [];
    }
  }

  /**
   * Fetch popular articles from backend
   */
  async function fetchPopularArticles() {
    try {
      const url = `${API_BASE}/api/articles/popular?limit=${POSTS_LIMIT}`;
      const response = await fetch(url, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' }
      });

      if (!response.ok) throw new Error(`Server responded with status: ${response.status}`);
      const data = await response.json();
      return data.articles || data || [];
    } catch (error) {
      console.error('Error fetching popular articles:', error);
      return [];
    }
  }

  /**
   * Fetch latest posts from backend (sorted by createdAt DESC)
   */
  async function fetchLatestPosts() {
    try {
      const url = `${API_BASE}/api/posts/latest?limit=${POSTS_LIMIT}`;
      const response = await fetch(url, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' }
      });

      if (!response.ok) throw new Error(`Server responded with status: ${response.status}`);
      const data = await response.json();
      let posts = data.posts || data || [];
      
      if (posts && posts.length > 0) {
        posts.sort((a, b) => {
          const dateA = new Date(a.createdAt || a.date || 0);
          const dateB = new Date(b.createdAt || b.date || 0);
          return dateB - dateA;
        });
      }
      return posts;
    } catch (error) {
      console.error('Error fetching latest posts:', error);
      return [];
    }
  }

  /**
   * Create a single card (for articles or posts)
   */
  function createCard(item, index, isPost = false) {
    const card = document.createElement('a');
    
    // Handle URL
    const url = isPost ? (item.url || item.link || '#') : (`articles/${item.slug}` || '#');
    card.href = url;
    card.className = 'card reveal';
    card.setAttribute('data-cat', 'featured');
    card.style.textDecoration = 'none';
    card.style.color = 'inherit';
    card.style.animationDelay = `${0.05 + index * 0.05}s`;
    
    const themes = ['card-shiv', 'card-krishna', 'card-ram', 'card-ganesh', 'card-lakshmi', 'card-durga', 'card-hanuman', 'card-kali'];
    card.classList.add(themes[index % themes.length]);

    // Format date
    const date = isPost ? (item.createdAt || item.date) : (item.created_at || item.published_at || item.date);
    const cardDate = new Date(date);
    const formattedDate = cardDate.toLocaleDateString('hi-IN', { year: 'numeric', month: 'short', day: 'numeric' });

    const imageURL = isPost ? item.image : (item.thumbnail_url || item.banner_url);
    const title = isPost ? item.name : item.title;
    const description = isPost ? (item.description || item.desc || 'विस्तृत विवरण के लिए क्लिक करें') : (item.description || 'विस्तृत विवरण के लिए क्लिक करें');
    const category = item.category || 'मंत्र';
    const views = item.view_count || 0;

    const imageHTML = imageURL ? 
      `<img src="${imageURL}" alt="${title}" style="width:100%;height:100%;object-fit:cover;" onerror="this.style.background='var(--border)';this.src='data:image/svg+xml,%3Csvg xmlns=%22http://www.w3.org/2000/svg%22%3E%3C/svg%3E';">` :
      `<div style="width:100%;height:100%;display:flex;align-items:center;justify-content:center;font-size:3rem;background:rgba(255,255,255,0.05);">🎶</div>`;

    card.innerHTML = `
      <div class="card-image">${imageHTML}</div>
      <div class="card-inner">
        <div class="card-tag">${category}</div>
        <div class="card-name-deva">${escapeHtml(title)}</div>
        <div class="card-name-eng">${escapeHtml(title.toUpperCase())}</div>
        <div class="card-mantra-preview">${escapeHtml(description.substring(0, 60))}</div>
        <div class="card-count"><span class="card-count-dot"></span> ${formattedDate} * ${views} 👁️ views</div>
      </div>
      <div class="card-arrow">→</div>
    `;

    return card;
  }

  /**
   * Escape HTML to prevent XSS
   */
  function escapeHtml(text) {
    const map = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#039;' };
    return text.replace(/[&<>"']/g, m => map[m]);
  }

  /**
   * Render latest articles
   */
  async function renderLatestArticles() {
    const container = document.getElementById('latestArticlesContainer');
    if (!container) return;

    const articles = await fetchLatestArticles();
    container.innerHTML = '';

    if (articles.length === 0) {
      container.innerHTML = '<div style="padding: 2rem; text-align: center; color: var(--gold-pale); font-style: italic; grid-column: 1/-1;">कोई नवीनतम लेख नहीं मिले।</div>';
      return;
    }

    articles.forEach((article, index) => {
      const card = createCard(article, index, false);
      container.appendChild(card);
    });
  }

  /**
   * Render popular articles
   */
  async function renderPopularArticles() {
    const container = document.getElementById('popularArticlesContainer');
    if (!container) return;

    const articles = await fetchPopularArticles();
    container.innerHTML = '';

    if (articles.length === 0) {
      container.innerHTML = '<div style="padding: 2rem; text-align: center; color: var(--gold-pale); font-style: italic; grid-column: 1/-1;">कोई लोकप्रिय लेख नहीं मिले।</div>';
      return;
    }

    articles.forEach((article, index) => {
      const card = createCard(article, index, false);
      container.appendChild(card);
    });
  }

  /**
   * Render latest posts
   */
  async function renderLatestPosts() {
    const container = document.getElementById('suggestedPostsContainer');
    if (!container) return;

    const posts = await fetchLatestPosts();
    container.innerHTML = '';

    if (posts.length === 0) {
      container.innerHTML = '<div style="padding: 2rem; text-align: center; color: var(--gold-pale); font-style: italic; grid-column: 1/-1;">कोई पोस्ट नहीं मिले।</div>';
      return;
    }

    posts.forEach((post, index) => {
      const card = createCard(post, index, true);
      container.appendChild(card);
    });
  }

  /**
   * Initialize module - load all three sections
   */
  function init() {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', () => {
        renderLatestArticles();
        renderPopularArticles();
        renderLatestPosts();
      });
    } else {
      renderLatestArticles();
      renderPopularArticles();
      renderLatestPosts();
    }
  }

  return {
    init: init,
    refresh: () => {
      renderLatestArticles();
      renderPopularArticles();
      renderLatestPosts();
    },
    setApiBase: (url) => { API_BASE = url; }
  };
})();

SuggestedPosts.init();
