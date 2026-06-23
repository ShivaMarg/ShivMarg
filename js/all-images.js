/* =============================================
   ShivMarg — Cloudinary Image Picker Popup
   Drop this <script> anywhere. Then add:
     <button onclick="SmCloudinary.open()">Open Images</button>
   ============================================= */

(function () {
  const API_URL = "https://www.api.shivmarg.live/cloudinary-images";

  /* ---------- inject styles once ---------- */
  function injectStyles() {
    if (document.getElementById("sm-cloud-style")) return;
    const s = document.createElement("style");
    s.id = "sm-cloud-style";
    s.textContent = `
      #sm-cloud-backdrop {
        position: fixed; inset: 0; z-index: 99998;
        background: rgba(0,0,0,.65);
        display: flex; align-items: center; justify-content: center;
        opacity: 0; transition: opacity .2s;
        pointer-events: none;
      }
      #sm-cloud-backdrop.visible {
        opacity: 1; pointer-events: all;
      }
      #sm-cloud-modal {
        width: 90vw; max-width: 1100px;
        height: 82vh;
        background: #0e1117;
        border: 1px solid #262d3a;
        border-radius: 14px;
        display: flex; flex-direction: column;
        overflow: hidden;
        transform: translateY(18px) scale(.97);
        transition: transform .22s ease;
        box-shadow: 0 24px 80px rgba(0,0,0,.7);
      }
      #sm-cloud-backdrop.visible #sm-cloud-modal {
        transform: translateY(0) scale(1);
      }
      #sm-cloud-header {
        display: flex; align-items: center; justify-content: space-between;
        padding: 14px 20px;
        border-bottom: 1px solid #1e2635;
        background: #111722;
        flex-shrink: 0;
      }
      #sm-cloud-header h2 {
        margin: 0; font-size: 15px; font-weight: 600;
        color: #e6e9ef; font-family: system-ui, sans-serif;
      }
      #sm-cloud-search {
        background: #1a2030; border: 1px solid #262d3a; border-radius: 8px;
        color: #e6e9ef; padding: 6px 12px; font-size: 13px; width: 220px;
        outline: none;
      }
      #sm-cloud-search::placeholder { color: #4a5568; }
      #sm-cloud-search:focus { border-color: #4a90d9; }
      #sm-cloud-close {
        background: none; border: none; color: #8b93a3;
        font-size: 22px; cursor: pointer; line-height: 1;
        padding: 2px 6px; border-radius: 6px;
        transition: color .15s, background .15s;
      }
      #sm-cloud-close:hover { color: #e6e9ef; background: #1e2635; }
      #sm-cloud-body {
        overflow-y: auto; padding: 20px; flex: 1;
      }
      #sm-cloud-status {
        text-align: center; color: #8b93a3;
        padding: 60px 0; font-family: system-ui, sans-serif; font-size: 14px;
      }
      #sm-cloud-grid {
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(175px, 1fr));
        gap: 14px;
      }
      .sm-c-card {
        background: #161b24; border: 1px solid #262d3a;
        border-radius: 10px; overflow: hidden;
        display: flex; flex-direction: column;
        transition: border-color .15s, transform .15s;
      }
      .sm-c-card:hover { border-color: #4a90d9; transform: translateY(-2px); }
      .sm-c-card img {
        width: 100%; aspect-ratio: 1/1; object-fit: cover;
        background: #0a0d12; display: block;
      }
      .sm-c-body { padding: 9px; display: flex; flex-direction: column; gap: 6px; }
      .sm-c-pid {
        font-size: 10px; color: #4a5568; word-break: break-all;
        font-family: monospace; line-height: 1.3;
      }
      .sm-c-btn {
        background: #1f2733; color: #e6e9ef;
        border: 1px solid #262d3a; border-radius: 7px;
        padding: 6px 8px; font-size: 11px; cursor: pointer;
        transition: background .15s, border-color .15s;
        text-align: center;
      }
      .sm-c-btn:hover { background: #263040; border-color: #4a90d9; }
      .sm-c-btn.copied { background: #1a4a30; color: #3ddc84; border-color: #3ddc84; }
      #sm-cloud-footer {
        padding: 10px 20px; border-top: 1px solid #1e2635;
        font-size: 12px; color: #4a5568; font-family: system-ui, sans-serif;
        flex-shrink: 0; background: #111722;
      }
    `;
    document.head.appendChild(s);
  }

  /* ---------- build DOM once ---------- */
  function buildDOM() {
    if (document.getElementById("sm-cloud-backdrop")) return;

    const backdrop = document.createElement("div");
    backdrop.id = "sm-cloud-backdrop";
    backdrop.innerHTML = `
      <div id="sm-cloud-modal" role="dialog" aria-modal="true" aria-label="Cloudinary Image Picker">
        <div id="sm-cloud-header">
          <h2>📷 ShivMarg — Cloudinary Images</h2>
          <input id="sm-cloud-search" type="search" placeholder="Filter by name…">
          <button id="sm-cloud-close" title="Close">✕</button>
        </div>
        <div id="sm-cloud-body">
          <div id="sm-cloud-status">Loading images…</div>
          <div id="sm-cloud-grid"></div>
        </div>
        <div id="sm-cloud-footer" id="sm-cloud-footer"></div>
      </div>
    `;
    document.body.appendChild(backdrop);

    /* close on backdrop click */
    backdrop.addEventListener("click", (e) => {
      if (e.target === backdrop) SmCloudinary.close();
    });
    /* close button */
    document.getElementById("sm-cloud-close").addEventListener("click", SmCloudinary.close);
    /* Escape key */
    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape") SmCloudinary.close();
    });
    /* search/filter */
    document.getElementById("sm-cloud-search").addEventListener("input", (e) => {
      filterCards(e.target.value.trim().toLowerCase());
    });
  }

  /* ---------- state ---------- */
  let _loaded = false;
  let _allImages = [];

  /* ---------- render cards ---------- */
  function renderCards(images) {
    const grid = document.getElementById("sm-cloud-grid");
    const footer = document.getElementById("sm-cloud-footer");
    if (!images.length) {
      grid.innerHTML = "";
      document.getElementById("sm-cloud-status").textContent = "No images match.";
      document.getElementById("sm-cloud-status").style.display = "";
      footer.textContent = "";
      return;
    }
    document.getElementById("sm-cloud-status").style.display = "none";
    footer.textContent = `Showing ${images.length} image${images.length !== 1 ? "s" : ""}`;
    grid.innerHTML = images.map((img) => `
      <div class="sm-c-card">
        <img src="${img.url}" loading="lazy" alt="${img.public_id}">
        <div class="sm-c-body">
          <div class="sm-c-pid">${img.public_id}</div>
          <button class="sm-c-btn" data-url="${img.url}" onclick="SmCloudinary._copy(this)">📋 Copy URL</button>
        </div>
      </div>
    `).join("");
  }

  function filterCards(query) {
    if (!query) { renderCards(_allImages); return; }
    renderCards(_allImages.filter((img) =>
      img.public_id.toLowerCase().includes(query)
    ));
  }

  /* ---------- fetch ---------- */
  async function fetchImages() {
    const status = document.getElementById("sm-cloud-status");
    status.textContent = "Loading images…";
    status.style.display = "";
    document.getElementById("sm-cloud-grid").innerHTML = "";
    document.getElementById("sm-cloud-footer").textContent = "";

    try {
      const res = await fetch(API_URL);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      _allImages = data.images || [];
      _loaded = true;
      renderCards(_allImages);
    } catch (err) {
      status.textContent = "⚠️ Failed to load images: " + err.message;
    }
  }

  /* ---------- public API ---------- */
  window.SmCloudinary = {
    open() {
      injectStyles();
      buildDOM();
      const backdrop = document.getElementById("sm-cloud-backdrop");
      backdrop.classList.add("visible");
      document.body.style.overflow = "hidden";
      if (!_loaded) fetchImages();
      document.getElementById("sm-cloud-close").focus();
    },
    close() {
      const backdrop = document.getElementById("sm-cloud-backdrop");
      if (backdrop) backdrop.classList.remove("visible");
      document.body.style.overflow = "";
    },
    reload() {
      _loaded = false;
      fetchImages();
    },
    _copy(btn) {
      const url = btn.dataset.url;
      navigator.clipboard.writeText(url).then(() => {
        const prev = btn.textContent;
        btn.textContent = "✅ Copied!";
        btn.classList.add("copied");
        setTimeout(() => { btn.textContent = prev; btn.classList.remove("copied"); }, 1500);
      });
    }
  };
})();