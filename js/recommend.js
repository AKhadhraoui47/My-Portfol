/**
 * recommend.js
 *
 * Storage keys (localStorage):
 *   rec_pending  — array of pending submissions (not yet reviewed)
 *   rec_approved — array of approved, publicly visible recommendations
 *
 * Admin passphrase — change ADMIN_PASS to your own secret word.
 * Set it once here; no server needed.
 */

const ADMIN_PASS = "bilel2024admin"; // ← CHANGE THIS

/* ─────────────────────────────────────────────
   Helpers
───────────────────────────────────────────── */
function load(key) {
  try { return JSON.parse(localStorage.getItem(key)) || []; }
  catch { return []; }
}

function save(key, data) {
  localStorage.setItem(key, JSON.stringify(data));
}

function formatDate(iso) {
  const d = new Date(iso);
  return d.toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });
}

function initials(name) {
  return name.trim().split(/\s+/).map(w => w[0].toUpperCase()).slice(0, 2).join("");
}

/* ─────────────────────────────────────────────
   Render approved recommendations
───────────────────────────────────────────── */
function renderApproved() {
  const grid  = document.getElementById("recs-grid");
  const empty = document.getElementById("recs-empty");
  const approved = load("rec_approved");

  grid.innerHTML = "";

  if (!approved.length) {
    empty.style.display = "block";
    return;
  }
  empty.style.display = "none";

  approved.forEach(rec => {
    const card = document.createElement("div");
    card.className = "rec-card";
    card.innerHTML = `
      <span class="rec-relation">${escHtml(rec.relation)}</span>
      <p class="rec-text">${escHtml(rec.text)}</p>
      <div class="rec-footer">
        <div class="rec-avatar">${escHtml(initials(rec.name))}</div>
        <div>
          <div class="rec-name">${escHtml(rec.name)}</div>
          <div class="rec-date">${formatDate(rec.date)}</div>
        </div>
      </div>`;
    grid.appendChild(card);
  });
}

/* ─────────────────────────────────────────────
   Form submission
───────────────────────────────────────────── */
const form       = document.getElementById("rec-form");
const nameInput  = document.getElementById("rec-name");
const relSelect  = document.getElementById("rec-relation");
const textArea   = document.getElementById("rec-text");
const charCount  = document.getElementById("char-count");
const toast      = document.getElementById("toast");

// Live character counter
textArea.addEventListener("input", () => {
  const len = textArea.value.length;
  charCount.textContent = `${len} / 600`;
  charCount.classList.toggle("warn", len > 550);
});

form.addEventListener("submit", e => {
  e.preventDefault();

  const name     = nameInput.value.trim();
  const relation = relSelect.value;
  const text     = textArea.value.trim();

  // Basic validation
  if (!name || !relation || !text) {
    // Highlight empty fields
    [nameInput, relSelect, textArea].forEach(el => {
      if (!el.value.trim()) {
        el.style.borderColor = "#e8303a";
        el.addEventListener("input", () => el.style.borderColor = "", { once: true });
      }
    });
    return;
  }

  // Save to pending queue
  const pending = load("rec_pending");
  pending.push({ id: Date.now(), name, relation, text, date: new Date().toISOString() });
  save("rec_pending", pending);

  // Reset form & show toast
  form.reset();
  charCount.textContent = "0 / 600";
  toast.classList.add("show");
  setTimeout(() => toast.classList.remove("show"), 6000);
});

/* ─────────────────────────────────────────────
   Admin panel
───────────────────────────────────────────── */
let adminUnlocked = false;

const adminTrigger  = document.getElementById("admin-trigger");
const adminPanel    = document.getElementById("admin-panel");
const adminPassInput= document.getElementById("admin-pass");
const adminLoginBtn = document.getElementById("admin-login-btn");
const adminError    = document.getElementById("admin-error");
const adminQueue    = document.getElementById("admin-queue");
const adminLoginArea= document.getElementById("admin-login-area");
const adminLogoutBtn= document.getElementById("admin-logout-btn");
const queueList     = document.getElementById("queue-list");

adminTrigger.addEventListener("click", () => {
  adminPanel.classList.toggle("open");
  if (adminUnlocked) renderQueue();
});

adminLoginBtn.addEventListener("click", attemptLogin);
adminPassInput.addEventListener("keydown", e => { if (e.key === "Enter") attemptLogin(); });

function attemptLogin() {
  if (adminPassInput.value === ADMIN_PASS) {
    adminUnlocked = true;
    adminError.classList.remove("show");
    adminLoginArea.style.display = "none";
    adminQueue.classList.add("open");
    renderQueue();
  } else {
    adminError.classList.add("show");
    adminPassInput.value = "";
    adminPassInput.focus();
  }
}

adminLogoutBtn.addEventListener("click", () => {
  adminUnlocked = false;
  adminPanel.classList.remove("open");
  adminQueue.classList.remove("open");
  adminLoginArea.style.display = "block";
  adminPassInput.value = "";
});

function renderQueue() {
  const pending = load("rec_pending");
  queueList.innerHTML = "";

  if (!pending.length) {
    queueList.innerHTML = '<div class="queue-empty">No pending recommendations. You\'re all caught up! ✓</div>';
    return;
  }

  pending.forEach(rec => {
    const item = document.createElement("div");
    item.className = "queue-item";
    item.id = `qi-${rec.id}`;
    item.innerHTML = `
      <div class="queue-item-meta">
        <span class="queue-item-name">${escHtml(rec.name)}</span>
        <span class="queue-item-relation">${escHtml(rec.relation)}</span>
      </div>
      <p class="queue-item-text">${escHtml(rec.text)}</p>
      <div class="queue-item-actions">
        <button class="approve-btn" data-id="${rec.id}">
          ✓ Approve
        </button>
        <button class="reject-btn" data-id="${rec.id}">
          ✕ Reject
        </button>
      </div>`;
    queueList.appendChild(item);
  });

  // Approve
  queueList.querySelectorAll(".approve-btn").forEach(btn => {
    btn.addEventListener("click", () => {
      const id = parseInt(btn.dataset.id);
      let pending  = load("rec_pending");
      const approved = load("rec_approved");
      const rec = pending.find(r => r.id === id);
      if (!rec) return;

      pending = pending.filter(r => r.id !== id);
      approved.unshift(rec); // newest first
      save("rec_pending",  pending);
      save("rec_approved", approved);

      document.getElementById(`qi-${id}`)?.remove();
      renderApproved();

      if (!load("rec_pending").length) {
        queueList.innerHTML = '<div class="queue-empty">No pending recommendations. You\'re all caught up! ✓</div>';
      }
    });
  });

  // Reject (delete permanently)
  queueList.querySelectorAll(".reject-btn").forEach(btn => {
    btn.addEventListener("click", () => {
      const id = parseInt(btn.dataset.id);
      let pending = load("rec_pending");
      pending = pending.filter(r => r.id !== id);
      save("rec_pending", pending);
      document.getElementById(`qi-${id}`)?.remove();

      if (!load("rec_pending").length) {
        queueList.innerHTML = '<div class="queue-empty">No pending recommendations. You\'re all caught up! ✓</div>';
      }
    });
  });
}

/* ─────────────────────────────────────────────
   XSS guard
───────────────────────────────────────────── */
function escHtml(str) {
  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

/* ─────────────────────────────────────────────
   Init
───────────────────────────────────────────── */
renderApproved();
