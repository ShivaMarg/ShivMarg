/**
 * Suggested Posts Module
 * Fetches latest posts from backend and displays them as cards
 */

const SuggestedPosts = (() => {
  const API_BASE = 'https://shivamargbackend.onrender.com'; // Change this to your actual backend URL
  const CONTAINER_ID = 'suggestedPostsContainer';
  const POSTS_LIMIT = 15;

  /**
   * Fetch latest posts from backend
   */
  async function fetchLatestPosts() {
    try {
      const url = `${API_BASE}/api/posts/latest?limit=${POSTS_LIMIT}`;
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        }
      });

      if (!response.ok) {
        throw new Error(`Server responded with status: ${response.status}`);
      }

      const data = await response.json();
      return data.posts || data || [];
    } catch (error) {
      console.error('Error fetching suggested posts:', error);
      return [];
    }
  }

  /**
   * Create a single post card (matching index.html card design)
   */
  function createPostCard(post, index) {
    const card = document.createElement('a');
    card.href = post.url || post.link || '#';
    card.className = 'card reveal';
    card.setAttribute('data-cat', 'featured');
    card.style.textDecoration = 'none';
    card.style.color = 'inherit';
    card.style.animationDelay = `${0.05 + index * 0.05}s`;
    
    // Random card color theme
    const themes = ['card-shiv', 'card-krishna', 'card-ram', 'card-ganesh', 'card-lakshmi', 'card-durga', 'card-hanuman', 'card-kali'];
    const theme = themes[index % themes.length];
    card.classList.add(theme);

    // Format date
    const postDate = new Date(post.createdAt || post.date);
    const formattedDate = postDate.toLocaleDateString('hi-IN', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    });

    // Create image element or placeholder
    const imageHTML = post.image ? 
      `<img src="${post.image}" alt="${post.name}" style="width:100%;height:100%;object-fit:cover;" onerror="this.style.background='var(--border)';this.src='data:image/svg+xml,%3Csvg xmlns=%22http://www.w3.org/2000/svg%22%3E%3C/svg%3E';">` :
      `<div style="width:100%;height:100%;display:flex;align-items:center;justify-content:center;font-size:3rem;background:rgba(255,255,255,0.05);">🎶</div>`;

    card.innerHTML = `
      <div class="card-image">
        ${imageHTML}
      </div>
      <div class="card-inner">
        <div class="card-tag">${post.category || 'मंत्र'}</div>
        <div class="card-name-deva">${escapeHtml(post.name || post.title)}</div>
        <div class="card-name-eng">${escapeHtml((post.name || post.title).toUpperCase())}</div>
        <div class="card-mantra-preview">${escapeHtml(post.description || post.desc || 'विस्तृत विवरण के लिए क्लिक करें')}</div>
        <div class="card-count"><span class="card-count-dot"></span> ${formattedDate}</div>
      </div>
      <div class="card-arrow">→</div>
    `;

    return card;
  }

  /**
   * Escape HTML to prevent XSS
   */
  function escapeHtml(text) {
    const map = {
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;',
      "'": '&#039;'
    };
    return text.replace(/[&<>"']/g, m => map[m]);
  }

  /**
   * Render posts to container (sorted by created_at DESC)
   */
  async function renderPosts() {
    const container = document.getElementById(CONTAINER_ID);
    if (!container) return;

    // Show loading state
    container.innerHTML = '<div style="padding: 2rem; text-align: center; color: var(--gold-pale); font-style: italic; grid-column: 1/-1;">पोस्ट्स लोड हो रहे हैं...</div>';

    // Fetch posts
    const posts = await fetchLatestPosts();

    // Sort by created_at in descending order (newest first)
    if (posts && posts.length > 0) {
      posts.sort((a, b) => {
        const dateA = new Date(a.createdAt || a.date || 0);
        const dateB = new Date(b.createdAt || b.date || 0);
        return dateB - dateA; // Descending order
      });
    }

    // Clear container
    container.innerHTML = '';

    if (posts.length === 0) {
      container.innerHTML = '<div style="padding: 2rem; text-align: center; color: var(--gold-pale); font-style: italic; grid-column: 1/-1;">कोई नवीनतम पोस्ट नहीं मिले।</div>';
      return;
    }

    // Add post cards
    posts.forEach((post, index) => {
      const card = createPostCard(post, index);
      container.appendChild(card);
    });
  }

  /**
   * Initialize module
   */
  function init() {
    // Wait for DOM to be ready
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', renderPosts);
    } else {
      renderPosts();
    }
  }

  // Public API
  return {
    init: init,
    refresh: renderPosts,
    setApiBase: (url) => { API_BASE = url; }
  };
})();

// Auto-initialize when page loads
SuggestedPosts.init();
