/**
 * ShivMarg Admin Dashboard
 * Handles all admin functionality and API interactions
 */

const API_BASE = 'https://www.api.shivmarg.live'; // Update this to your backend URL
const LIMIT_USERS = 100;
const LIMIT_COMMENTS = 50;
const LIMIT_POSTS = 50;

let currentToken = null;
let currentUser = null;

// Pagination state
let usersPage = 1;
let commentsPage = 1;
let postsPage = 1;

let usersTotalPages = 1;
let commentsTotalPages = 1;
let postsTotalPages = 1;

// ─────────────────────────────────────────────
// INIT
// ─────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
  const token = localStorage.getItem('admin_token');
  if (!token) {
    window.location.href = '/admin-login.html';
    return;
  }

  currentToken = token;
  initDashboard();
});

async function initDashboard() {
  try {
    // Get current user
    const resp = await fetch(`${API_BASE}/api/auth/me`, {
      headers: { 'Authorization': `Bearer ${currentToken}` }
    });

    if (!resp.ok) {
      localStorage.removeItem('admin_token');
      window.location.href = '/admin-login.html';
      return;
    }

    currentUser = await resp.json();

    // Check if admin/editor
    if (!['admin', 'editor'].includes(currentUser.role)) {
      alert('Admin access required');
      window.location.href = '/';
      return;
    }

    // Update UI
    document.getElementById('userName').textContent = currentUser.display_name || currentUser.username;
    document.getElementById('userRole').textContent = currentUser.role;
    document.getElementById('userAvatar').textContent = currentUser.username.charAt(0).toUpperCase();

    // Load data
    loadStats();
    loadUsers();
    loadComments();
    loadPosts();
  } catch (error) {
    console.error('Init error:', error);
    alert('Failed to initialize dashboard');
  }
}

// ─────────────────────────────────────────────
// STATS
// ─────────────────────────────────────────────
async function loadStats() {
  try {
    const resp = await fetch(`${API_BASE}/api/admin/dashboard/stats`, {
      headers: { 'Authorization': `Bearer ${currentToken}` }
    });

    if (!resp.ok) throw new Error('Failed to load stats');

    const data = await resp.json();
    document.getElementById('stat-users').textContent = data.total_users;
    document.getElementById('stat-comments').textContent = data.total_comments;
    document.getElementById('stat-posts').textContent = data.total_posts;
    document.getElementById('stat-featured').textContent = data.featured_posts;
    document.getElementById('stat-recent-users').textContent = data.recent_users_7d;
    document.getElementById('stat-recent-comments').textContent = data.recent_comments_7d;
  } catch (error) {
    console.error('Stats error:', error);
  }
}

// ─────────────────────────────────────────────
// USERS
// ─────────────────────────────────────────────
async function loadUsers() {
  try {
    const role = document.getElementById('userRoleFilter').value;
    const skip = (usersPage - 1) * LIMIT_USERS;

    let url = `${API_BASE}/api/admin/users?skip=${skip}&limit=${LIMIT_USERS}`;
    if (role) url += `&role=${role}`;

    const resp = await fetch(url, {
      headers: { 'Authorization': `Bearer ${currentToken}` }
    });

    if (!resp.ok) throw new Error('Failed to load users');

    const data = await resp.json();
    usersTotalPages = Math.ceil(data.total / LIMIT_USERS);

    const tbody = document.getElementById('usersTableBody');
    tbody.innerHTML = data.users.map(user => `
      <tr>
        <td><strong>${escapeHtml(user.username)}</strong></td>
        <td>${escapeHtml(user.email)}</td>
        <td><span class="badge badge-${user.role}">${user.role}</span></td>
        <td>${formatDate(user.created_at)}</td>
        <td>
          <div class="actions">
            ${currentUser.role === 'admin' ? `
              <button class="btn btn-edit" onclick="openRoleModal('${user.id}', '${user.username}', '${user.role}')">Change Role</button>
              <button class="btn btn-delete" onclick="deleteUser('${user.id}', '${user.username}')">Delete</button>
            ` : ''}
          </div>
        </td>
      </tr>
    `).join('');

    document.getElementById('usersTotalPages').textContent = usersTotalPages;
  } catch (error) {
    console.error('Load users error:', error);
    document.getElementById('usersTableBody').innerHTML = '<tr><td colspan="5" class="loading">Error loading users</td></tr>';
  }
}

function prevUsers() {
  if (usersPage > 1) {
    usersPage--;
    document.getElementById('usersPage').value = usersPage;
    loadUsers();
  }
}

function nextUsers() {
  if (usersPage < usersTotalPages) {
    usersPage++;
    document.getElementById('usersPage').value = usersPage;
    loadUsers();
  }
}

// ─────────────────────────────────────────────
// COMMENTS
// ─────────────────────────────────────────────
async function loadComments() {
  try {
    const pageId = document.getElementById('commentsPageFilter').value;
    const skip = (commentsPage - 1) * LIMIT_COMMENTS;

    let url = `${API_BASE}/api/admin/comments?skip=${skip}&limit=${LIMIT_COMMENTS}`;
    if (pageId) url += `&page_id=${pageId}`;

    const resp = await fetch(url, {
      headers: { 'Authorization': `Bearer ${currentToken}` }
    });

    if (!resp.ok) throw new Error('Failed to load comments');

    const data = await resp.json();
    commentsTotalPages = Math.ceil(data.total / LIMIT_COMMENTS);

    // Populate page filter
    const pageFilter = document.getElementById('commentsPageFilter');
    if (data.pages && data.pages.length > 0) {
      const currentValue = pageFilter.value;
      pageFilter.innerHTML = '<option value="">All Pages</option>' + data.pages.map(p => 
        `<option value="${p}">${p}</option>`
      ).join('');
      pageFilter.value = currentValue;
    }

    const tbody = document.getElementById('commentsTableBody');
    tbody.innerHTML = data.comments.map(comment => `
      <tr>
        <td><strong>${escapeHtml(comment.username)}</strong></td>
        <td>${escapeHtml(comment.page_id)}</td>
        <td><span class="truncate">${escapeHtml(comment.text)}</span></td>
        <td>${formatDate(comment.created_at)}</td>
        <td>
          <div class="actions">
            <button class="btn btn-delete" onclick="deleteComment('${comment.id}')">Delete</button>
          </div>
        </td>
      </tr>
    `).join('');

    document.getElementById('commentsTotalPages').textContent = commentsTotalPages;
  } catch (error) {
    console.error('Load comments error:', error);
    document.getElementById('commentsTableBody').innerHTML = '<tr><td colspan="5" class="loading">Error loading comments</td></tr>';
  }
}

function prevComments() {
  if (commentsPage > 1) {
    commentsPage--;
    document.getElementById('commentsPage').value = commentsPage;
    loadComments();
  }
}

function nextComments() {
  if (commentsPage < commentsTotalPages) {
    commentsPage++;
    document.getElementById('commentsPage').value = commentsPage;
    loadComments();
  }
}

// ─────────────────────────────────────────────
// POSTS
// ─────────────────────────────────────────────
async function loadPosts() {
  try {
    const category = document.getElementById('postsCategory').value;
    const skip = (postsPage - 1) * LIMIT_POSTS;

    let url = `${API_BASE}/api/admin/posts?skip=${skip}&limit=${LIMIT_POSTS}`;
    if (category) url += `&category=${category}`;

    const resp = await fetch(url, {
      headers: { 'Authorization': `Bearer ${currentToken}` }
    });

    if (!resp.ok) throw new Error('Failed to load posts');

    const data = await resp.json();
    postsTotalPages = Math.ceil(data.total / LIMIT_POSTS);

    // Populate category filter
    const categoryFilter = document.getElementById('postsCategory');
    if (data.categories && data.categories.length > 0) {
      const currentValue = categoryFilter.value;
      categoryFilter.innerHTML = '<option value="">All Categories</option>' + data.categories.map(c => 
        `<option value="${c}">${c}</option>`
      ).join('');
      categoryFilter.value = currentValue;
    }

    const tbody = document.getElementById('postsTableBody');
    tbody.innerHTML = data.posts.map(post => `
      <tr>
        <td><strong>${escapeHtml(post.name || post.title)}</strong></td>
        <td>${escapeHtml(post.category || '-')}</td>
        <td><span class="badge ${post.featured ? 'badge-admin' : 'badge-user'}">${post.featured ? '⭐ Featured' : 'Regular'}</span></td>
        <td>${formatDate(post.createdAt)}</td>
        <td>
          <div class="actions">
            <a href="${post.url}" target="_blank" class="btn btn-edit" style="text-decoration: none;">View</a>
          </div>
        </td>
      </tr>
    `).join('');

    document.getElementById('postsTotalPages').textContent = postsTotalPages;
  } catch (error) {
    console.error('Load posts error:', error);
    document.getElementById('postsTableBody').innerHTML = '<tr><td colspan="5" class="loading">Error loading posts</td></tr>';
  }
}

function prevPosts() {
  if (postsPage > 1) {
    postsPage--;
    document.getElementById('postsPage').value = postsPage;
    loadPosts();
  }
}

function nextPosts() {
  if (postsPage < postsTotalPages) {
    postsPage++;
    document.getElementById('postsPage').value = postsPage;
    loadPosts();
  }
}

// ─────────────────────────────────────────────
// ACTIONS
// ─────────────────────────────────────────────

// Role Modal
let roleModalUserId = null;

function openRoleModal(userId, username, currentRole) {
  roleModalUserId = userId;
  document.getElementById('roleModalUser').value = username;
  document.getElementById('roleModalSelect').value = currentRole;
  document.getElementById('roleModal').classList.add('active');
}

function closeRoleModal() {
  document.getElementById('roleModal').classList.remove('active');
  roleModalUserId = null;
}

async function saveUserRole() {
  if (!roleModalUserId) return;

  try {
    const role = document.getElementById('roleModalSelect').value;
    const resp = await fetch(`${API_BASE}/api/admin/users/${roleModalUserId}/role?role=${role}`, {
      method: 'PATCH',
      headers: { 'Authorization': `Bearer ${currentToken}` }
    });

    if (!resp.ok) throw new Error('Failed to update role');

    closeRoleModal();
    loadUsers();
    alert('Role updated successfully');
  } catch (error) {
    console.error('Update role error:', error);
    alert('Failed to update role: ' + error.message);
  }
}

async function deleteUser(userId, username) {
  if (!confirm(`Are you sure you want to delete ${username}? This action cannot be undone.`)) return;

  try {
    const resp = await fetch(`${API_BASE}/api/admin/users/${userId}`, {
      method: 'DELETE',
      headers: { 'Authorization': `Bearer ${currentToken}` }
    });

    if (!resp.ok) throw new Error('Failed to delete user');

    loadUsers();
    alert('User deleted successfully');
  } catch (error) {
    console.error('Delete user error:', error);
    alert('Failed to delete user: ' + error.message);
  }
}

async function deleteComment(commentId) {
  if (!confirm('Are you sure you want to delete this comment?')) return;

  try {
    const resp = await fetch(`${API_BASE}/api/admin/comments/${commentId}`, {
      method: 'DELETE',
      headers: { 'Authorization': `Bearer ${currentToken}` }
    });

    if (!resp.ok) throw new Error('Failed to delete comment');

    loadComments();
    alert('Comment deleted successfully');
  } catch (error) {
    console.error('Delete comment error:', error);
    alert('Failed to delete comment: ' + error.message);
  }
}

// ─────────────────────────────────────────────
// TAB SWITCHING
// ─────────────────────────────────────────────
function switchTab(tabName) {
  // Remove active from all
  document.querySelectorAll('.tab-content').forEach(tab => {
    tab.classList.remove('active');
  });
  document.querySelectorAll('.nav-link').forEach(link => {
    link.classList.remove('active');
  });

  // Add active to selected
  document.getElementById(tabName).classList.add('active');
  event.target.closest('.nav-link').classList.add('active');

  // Update page title
  const titles = {
    dashboard: '📊 Dashboard',
    stats: '📈 Statistics',
    users: '👥 Manage Users',
    comments: '💬 Manage Comments',
    posts: '📝 Manage Posts'
  };
  document.getElementById('pageTitle').textContent = titles[tabName] || 'Dashboard';
}

// ─────────────────────────────────────────────
// LOGOUT
// ─────────────────────────────────────────────
function logout() {
  if (confirm('Are you sure you want to logout?')) {
    localStorage.removeItem('admin_token');
    window.location.href = '/admin-login.html';
  }
}

// ─────────────────────────────────────────────
// UTILITIES
// ─────────────────────────────────────────────
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

function formatDate(isoString) {
  const date = new Date(isoString);
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
}
