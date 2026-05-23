/**
 * Suggested Posts Module
 * Fetches latest posts from backend and displays them as cards
 */

const SuggestedPosts = (() => {
  const API_BASE = 'https://shivamargbackend.onrender.com'; // Change this to your actual backend URL
  const CONTAINER_ID = 'suggestedPostsContainer';
  const POSTS_LIMIT = 5;

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
   * Create a single post card
   */
  function createPostCard(post) {
    const card = document.createElement('div');
    card.className = 'suggested-post-card';
    
    // Format date
    const postDate = new Date(post.createdAt || post.date);
    const formattedDate = postDate.toLocaleDateString('hi-IN', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });

    // Create image element or placeholder
    const imageHTML = post.image ? 
      `<img src="${post.image}" alt="${post.name}" class="post-image" onerror="this.style.display='none'; this.nextElementSibling.style.display='flex';">
       <div class="post-image-placeholder" style="display:none;">🎶</div>` :
      `<div class="post-image-placeholder">🎶</div>`;

    card.innerHTML = `
      <div class="post-image-wrap">
        ${imageHTML}
      </div>
      <div class="post-content">
        <div class="post-name">${escapeHtml(post.name || post.title)}</div>
        <div class="post-desc">${escapeHtml(post.description || post.desc || 'विस्तृत विवरण के लिए क्लिक करें')}</div>
        <div class="post-date">📅 ${formattedDate}</div>
      </div>
    `;

    // Add click handler to navigate to post
    card.addEventListener('click', () => {
      if (post.url || post.link) {
        window.location.href = post.url || post.link;
      }
    });

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
   * Render posts to container
   */
  async function renderPosts() {
    const container = document.getElementById(CONTAINER_ID);
    if (!container) return;

    // Show loading state
    container.innerHTML = '<div class="post-loading">⏳ पोस्ट्स लोड हो रहे हैं...</div>';

    // Fetch posts
    const posts = await fetchLatestPosts();

    // Clear container
    container.innerHTML = '';

    if (posts.length === 0) {
      container.innerHTML = '<div class="post-loading">कोई नवीनतम पोस्ट नहीं मिले।</div>';
      return;
    }

    // Add post cards
    posts.forEach(post => {
      const card = createPostCard(post);
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
