console.log("studymaterial.js loaded");

const API_URL = "https://studymaterial-1heb.onrender.com/api/materials";

document.addEventListener("DOMContentLoaded", () => {
  fetch(API_URL)
    .then(res => {
      if (!res.ok) throw new Error(`API error: ${res.status}`);
      return res.json();
    })
    .then(data => renderStudyMaterial(data))
    .catch(err => {
      console.error("[studymaterial.js] Failed to load:", err);
      const container = document.getElementById("studyMaterialContainer");
      if (container) {
        container.innerHTML = `
          <div class="col-12 text-center">
            <p style="color:#aaa;">
              ⚠️ Failed to load materials. Server may be waking up — please refresh in 30 seconds.
            </p>
            <button onclick="location.reload()" class="btn btn-primary mt-2">Retry</button>
          </div>`;
      }
    });
});

/*********************************
 * TRACK DOWNLOAD — shared helper
 * Called by image link, title link, and download button.
 * Fires in background — PDF opens immediately, no delay.
 *********************************/
function trackDownload(id) {
  fetch(`https://studymaterial-1heb.onrender.com/api/materials/${id}/download`, {
    method: "POST"
  })
    .then(res => res.json())
    .then(data => {
      const countEl = document.getElementById(`dl-count-${id}`);
      if (countEl) countEl.textContent = `⬇️ ${data.downloads} downloads`;
    })
    .catch(() => {}); // Silent — non-critical
}

function renderStudyMaterial(materials) {
  const container = document.getElementById("studyMaterialContainer");
  if (!container) return;

  container.innerHTML = "";

  if (!materials.length) {
    container.innerHTML = `<div class="col-12 text-center"><p style="color:#aaa;">No materials available yet.</p></div>`;
    return;
  }

  materials.forEach(item => {
    // ── Format date safely ──────────────────────
    let formattedDate = "";
    if (item.date) {
      const d = new Date(item.date);
      if (!isNaN(d)) {
        const day   = String(d.getDate()).padStart(2, "0");
        const month = String(d.getMonth() + 1).padStart(2, "0");
        formattedDate = `${day}-${month}-${d.getFullYear()}`;
      } else {
        formattedDate = item.date; // already formatted string like "05-01-2026"
      }
    }

    const col = document.createElement("div");
    col.className = "col-md-4 justify-content-center";

    col.innerHTML = `
      <div class="blog-entry justify-content-end">

        <!-- ✅ Image link — tracked -->
        <a href="${item.pdfUrl}"
           target="_blank"
           rel="noopener noreferrer"
           class="block-20 zoom-effect dl-trigger"
           style="background-image: url('${item.imageUrl}');">
        </a>

        <div class="text mt-3 float-right d-block">

          <h2 class="heading">
            <!-- ✅ Title link — tracked -->
            <a href="${item.pdfUrl}"
               target="_blank"
               rel="noopener noreferrer"
               class="dl-trigger">
              ${item.title}
            </a>
          </h2>

          <h5 class="category">${item.category || "Practice Material"}</h5>
          <h5 class="type">${item.type || "PDF Download"}</h5>
          <h5 class="date">${formattedDate}</h5>

          <p>${item.description || ""}</p>

          <!-- Download count -->
          <p id="dl-count-${item._id}"
             style="color:#ffbd39; font-weight:600; font-size:0.85rem; margin-bottom:8px;">
            ⬇️ ${item.downloads ?? 0} downloads
          </p>

          <!-- ✅ Download button — tracked -->
          <a href="${item.pdfUrl}"
             target="_blank"
             rel="noopener noreferrer"
             class="btn btn-primary mt-2 dl-trigger">
            Download PDF
          </a>

        </div>
      </div>
    `;

    container.appendChild(col);

    // ── Attach ONE listener to all 3 triggers at once ──
    // querySelectorAll(".dl-trigger") finds image link, title link, and button
    col.querySelectorAll(".dl-trigger").forEach(el => {
      el.addEventListener("click", () => trackDownload(item._id));
    });
  });
}