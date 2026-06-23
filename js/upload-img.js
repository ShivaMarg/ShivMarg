(function () {
  const CLOUD_NAME    = "drzt5llbh";
  const UPLOAD_PRESET = "ml_default";

  /* ---- inject styles ---- */
  const style = document.createElement("style");
  style.textContent = `
#sm-upload-trigger{position:fixed;bottom:28px;right:28px;background:#2a5dbf;color:#fff;border:none;border-radius:50px;padding:12px 22px;font-size:14px;font-weight:600;cursor:pointer;display:flex;align-items:center;gap:8px;box-shadow:0 4px 18px rgba(42,93,191,.35);transition:background .15s,transform .1s;z-index:9998}
#sm-upload-trigger:hover{background:#3a6fcf;transform:translateY(-1px)}
#sm-overlay{display:none;position:fixed;inset:0;background:rgba(0,0,0,.65);z-index:9999;align-items:center;justify-content:center}
#sm-overlay.open{display:flex}
#sm-modal{background:#111622;border:1px solid #1e2840;border-radius:16px;width:90%;max-width:560px;max-height:90vh;overflow-y:auto;padding:28px;display:flex;flex-direction:column;gap:18px;position:relative}
#sm-close{position:absolute;top:14px;right:16px;background:none;border:none;color:#5a6380;font-size:22px;cursor:pointer;line-height:1;transition:color .15s}
#sm-close:hover{color:#e0e4ef}
#sm-modal-title{font-size:17px;font-weight:600;color:#f0f2ff;margin:0}
#sm-drop{border:2px dashed #2a3550;border-radius:10px;padding:38px 20px;text-align:center;cursor:pointer;transition:border-color .2s,background .2s;position:relative}
#sm-drop.drag{border-color:#4a7ddb;background:#131d30}
#sm-drop input{position:absolute;inset:0;opacity:0;cursor:pointer;width:100%;height:100%}
#sm-drop-label{font-size:13px;color:#8090b0;line-height:1.6}
#sm-drop-label span{color:#5b8de8;text-decoration:underline}
#sm-preview{display:none;flex-direction:column;align-items:center;gap:10px}
#sm-prev-img{width:100%;max-height:200px;object-fit:contain;border-radius:8px;border:1px solid #1e2840;background:#0a0d12}
#sm-finfo{font-size:12px;color:#5a6380}
#sm-clear{background:none;border:1px solid #2a3550;border-radius:6px;color:#8090b0;font-size:12px;padding:5px 14px;cursor:pointer;transition:border-color .15s,color .15s}
#sm-clear:hover{border-color:#e24b4a;color:#e24b4a}
.sm-field label{display:block;font-size:11px;color:#5a6380;margin-bottom:5px;text-transform:uppercase;letter-spacing:.04em;font-weight:500}
.sm-field input{width:100%;background:#0e1420;border:1px solid #1e2840;border-radius:8px;color:#e0e4ef;font-size:14px;padding:9px 13px;outline:none;transition:border-color .15s;box-sizing:border-box}
.sm-field input::placeholder{color:#2e3a55}
.sm-field input:focus{border-color:#4a7ddb}
#sm-upload-btn{width:100%;padding:12px;background:#2a5dbf;color:#fff;border:none;border-radius:10px;font-size:14px;font-weight:600;cursor:pointer;transition:background .15s,opacity .15s}
#sm-upload-btn:hover:not(:disabled){background:#3a6fcf}
#sm-upload-btn:disabled{opacity:.4;cursor:not-allowed}
#sm-prog{display:none;flex-direction:column;gap:6px}
#sm-prog-bg{height:5px;background:#1e2840;border-radius:99px;overflow:hidden}
#sm-prog-bar{height:100%;background:#4a7ddb;border-radius:99px;width:0%;transition:width .2s}
#sm-prog-lbl{font-size:12px;color:#5a6380;text-align:center}
#sm-result{display:none;background:#0c1a10;border:1px solid #1a4025;border-radius:10px;padding:14px;flex-direction:column;gap:9px}
#sm-result.show{display:flex}
.sm-rrow{display:flex;flex-direction:column;gap:3px}
.sm-rlabel{font-size:10px;color:#3a6050;text-transform:uppercase;letter-spacing:.05em}
.sm-rval{font-size:12px;color:#a0d8b0;word-break:break-all;font-family:monospace;background:#081510;padding:6px 10px;border-radius:6px;cursor:pointer;border:1px solid #1a3525;transition:border-color .15s}
.sm-rval:hover{border-color:#3ddc84}
.sm-rhint{font-size:11px;color:#2d5040}
#sm-res-title{font-size:13px;font-weight:600;color:#3ddc84}
#sm-err{display:none;background:#1a0c0c;border:1px solid #401a1a;border-radius:8px;padding:10px 14px;font-size:13px;color:#e87070}
#sm-err.show{display:block}
  `;
  document.head.appendChild(style);

  /* ---- inject HTML ---- */
  const html = `
<button id="sm-upload-trigger">⬆ Upload Image</button>

<div id="sm-overlay">
  <div id="sm-modal">
    <button id="sm-close">✕</button>
    <div id="sm-modal-title">📷 Upload to Cloudinary</div>

    <div id="sm-drop">
      <input type="file" id="sm-file" accept="image/*">
      <div style="font-size:30px;margin-bottom:8px;opacity:.55">🖼️</div>
      <div id="sm-drop-label">
        <span>Click to choose</span> or drag &amp; drop<br>
        <small style="color:#2e3a55;font-size:11px">PNG · JPG · WEBP · SVG — up to 10 MB</small>
      </div>
    </div>

    <div id="sm-preview">
      <img id="sm-prev-img" alt="preview">
      <div id="sm-finfo"></div>
      <button id="sm-clear">✕ Remove</button>
    </div>

    <div class="sm-field">
      <label for="sm-folder">Folder (optional)</label>
      <input type="text" id="sm-folder" placeholder="e.g. gods/shiva or mantras" value="shivmarg">
    </div>

    <button id="sm-upload-btn" disabled>Upload image</button>

    <div id="sm-prog">
      <div id="sm-prog-bg"><div id="sm-prog-bar"></div></div>
      <div id="sm-prog-lbl">Uploading…</div>
    </div>

    <div id="sm-result">
      <div id="sm-res-title">✅ Uploaded successfully</div>
      <div class="sm-rrow">
        <span class="sm-rlabel">Secure URL</span>
        <div class="sm-rval" id="sm-res-url" title="Click to copy"></div>
      </div>
      <div class="sm-rrow">
        <span class="sm-rlabel">Public ID</span>
        <div class="sm-rval" id="sm-res-pid" title="Click to copy"></div>
      </div>
      <div class="sm-rhint">Click any value to copy</div>
    </div>

    <div id="sm-err"></div>
  </div>
</div>
  `;
  const container = document.createElement("div");
  container.innerHTML = html;
  document.body.appendChild(container);

  /* ---- refs ---- */
  const overlay   = document.getElementById("sm-overlay");
  const trigger   = document.getElementById("sm-upload-trigger");
  const closeBtn  = document.getElementById("sm-close");
  const drop      = document.getElementById("sm-drop");
  const fileInput = document.getElementById("sm-file");
  const preview   = document.getElementById("sm-preview");
  const prevImg   = document.getElementById("sm-prev-img");
  const finfo     = document.getElementById("sm-finfo");
  const clearBtn  = document.getElementById("sm-clear");
  const folder    = document.getElementById("sm-folder");
  const upBtn     = document.getElementById("sm-upload-btn");
  const prog      = document.getElementById("sm-prog");
  const progBar   = document.getElementById("sm-prog-bar");
  const progLbl   = document.getElementById("sm-prog-lbl");
  const result    = document.getElementById("sm-result");
  const resUrl    = document.getElementById("sm-res-url");
  const resPid    = document.getElementById("sm-res-pid");
  const errBox    = document.getElementById("sm-err");

  let selectedFile = null;

  /* ---- open / close ---- */
  trigger.addEventListener("click", () => overlay.classList.add("open"));
  closeBtn.addEventListener("click", () => overlay.classList.remove("open"));
  overlay.addEventListener("click", e => { if (e.target === overlay) overlay.classList.remove("open"); });
  document.addEventListener("keydown", e => { if (e.key === "Escape") overlay.classList.remove("open"); });

  /* ---- drag & drop ---- */
  drop.addEventListener("dragover", e => { e.preventDefault(); drop.classList.add("drag"); });
  drop.addEventListener("dragleave", () => drop.classList.remove("drag"));
  drop.addEventListener("drop", e => {
    e.preventDefault();
    drop.classList.remove("drag");
    if (e.dataTransfer.files[0]) setFile(e.dataTransfer.files[0]);
  });
  fileInput.addEventListener("change", () => {
    if (fileInput.files[0]) setFile(fileInput.files[0]);
  });

  function setFile(f) {
    selectedFile = f;
    finfo.textContent = f.name + " — " + (f.size / 1024 / 1024).toFixed(2) + " MB";
    const r = new FileReader();
    r.onload = e => prevImg.src = e.target.result;
    r.readAsDataURL(f);
    drop.style.display = "none";
    preview.style.display = "flex";
    upBtn.disabled = false;
    hide();
  }

  clearBtn.addEventListener("click", reset);

  function reset() {
    selectedFile = null;
    fileInput.value = "";
    prevImg.src = "";
    drop.style.display = "";
    preview.style.display = "none";
    upBtn.disabled = true;
    hide();
  }

  function hide() {
    result.classList.remove("show");
    errBox.classList.remove("show");
    prog.style.display = "none";
    progBar.style.width = "0%";
  }

  /* ---- upload ---- */
  upBtn.addEventListener("click", () => {
    if (!selectedFile) return;
    hide();
    upBtn.disabled = true;
    prog.style.display = "flex";

    const fd = new FormData();
    fd.append("file", selectedFile);
    fd.append("upload_preset", UPLOAD_PRESET);
    const f = folder.value.trim();
    if (f) fd.append("folder", f);

    const xhr = new XMLHttpRequest();
    xhr.open("POST", "https://api.cloudinary.com/v1_1/" + CLOUD_NAME + "/image/upload");

    xhr.upload.addEventListener("progress", e => {
      if (e.lengthComputable) {
        const p = Math.round(e.loaded / e.total * 100);
        progBar.style.width = p + "%";
        progLbl.textContent = "Uploading… " + p + "%";
      }
    });

    xhr.addEventListener("load", () => {
      prog.style.display = "none";
      upBtn.disabled = false;
      if (xhr.status === 200) {
        const d = JSON.parse(xhr.responseText);
        resUrl.textContent = d.secure_url;
        resPid.textContent = d.public_id;
        result.classList.add("show");
        resUrl.onclick = () => copyText(d.secure_url, resUrl);
        resPid.onclick = () => copyText(d.public_id, resPid);
        reset();
      } else {
        let m = "Upload failed.";
        try { m = JSON.parse(xhr.responseText).error?.message || m; } catch (e) {}
        errBox.textContent = "⚠️ " + m;
        errBox.classList.add("show");
      }
    });

    xhr.addEventListener("error", () => {
      prog.style.display = "none";
      upBtn.disabled = false;
      errBox.textContent = "⚠️ Network error — check your connection.";
      errBox.classList.add("show");
    });

    xhr.send(fd);
  });

  function copyText(text, el) {
    navigator.clipboard.writeText(text).then(() => {
      const prev = el.style.color;
      el.style.color = "#3ddc84";
      setTimeout(() => el.style.color = prev, 1000);
    });
  }
})();